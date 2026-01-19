// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";

// ---------- helpers (typed; details optional where applicable)
function badRequest(message: string, details?: any): Response {
  return new Response(JSON.stringify({ code: "BAD_REQUEST", message, details }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
function notFound(message: string): Response {
  return new Response(JSON.stringify({ code: "NOT_FOUND", message }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}
function conflict(message: string): Response {
  return new Response(JSON.stringify({ code: "CONFLICT", message }), {
    status: 409,
    headers: { "Content-Type": "application/json" },
  });
}
function serverError(message: string, details?: any): Response {
  return new Response(JSON.stringify({ code: "SERVER_ERROR", message, details }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}

// ---------- request types
type MetricInput = {
  metricId: number;
  metricName?: string;       // optional from client; server can enrich later
  unitCode: string;
  totalValue?: number | null;
  avgValue?: number | null;
  minValue?: number | null;
  maxValue?: number | null;
  samplesCount?: number | null;
  computedJson?: any | null; // JSONB
};
type SubmitBody = {
  sessionId: number;
  dayIndex: number;           // Day-0 accepted
  fromUtc: string;            // ISO-8601 UTC
  toUtc: string;              // ISO-8601 UTC
  hasData: boolean;
  metrics: MetricInput[];     // may be [] when hasData=false
};

serve(async (req) => {
  if (req.method !== "POST") {
    return badRequest("Only POST is supported for this endpoint");
  }

  // open endpoint (no auth)
  let body: SubmitBody;
  try {
    body = await req.json();
  } catch {
    return badRequest("Request body must be valid JSON");
  }

  // ---------- basic validation
  const { sessionId, dayIndex, fromUtc, toUtc, hasData, metrics } = body ?? ({} as SubmitBody);
  if (
    typeof sessionId !== "number" ||
    typeof dayIndex !== "number" ||
    typeof fromUtc !== "string" ||
    typeof toUtc !== "string" ||
    typeof hasData !== "boolean" ||
    !Array.isArray(metrics)
  ) {
    return badRequest("Missing or invalid fields", {
      required: [
        "sessionId:number",
        "dayIndex:number",
        "fromUtc:string(ISO)",
        "toUtc:string(ISO)",
        "hasData:boolean",
        "metrics:array",
      ],
      received: body,
    });
  }

  const fromMs = Date.parse(fromUtc);
  const toMs = Date.parse(toUtc);
  if (Number.isNaN(fromMs) || Number.isNaN(toMs)) {
    return badRequest("fromUtc and toUtc must be valid ISO-8601 strings");
  }
  if (toMs <= fromMs) {
    return badRequest("fromUtc must be earlier than toUtc");
  }

  // If hasData=true, require at least 1 metric
  if (hasData && metrics.length === 0) {
    return badRequest("metrics cannot be empty when hasData=true");
  }

  // Validate metrics array shape (when present)
  for (let i = 0; i < metrics.length; i++) {
    const m = metrics[i] as MetricInput;
    if (typeof m.metricId !== "number" || typeof m.unitCode !== "string") {
      return badRequest("Each metric requires metricId:number and unitCode:string", { index: i, metric: m });
    }
    // numeric fields: allow null/undefined; when provided must be number
    const numericFields: (keyof MetricInput)[] = ["totalValue", "avgValue", "minValue", "maxValue", "samplesCount"];
    for (const f of numericFields) {
      const v = m[f] as any;
      if (!(v === null || v === undefined || typeof v === "number")) {
        return badRequest(`Metric.${String(f)} must be a number or null`, { index: i, value: v });
      }
    }
    // computedJson can be object or null/undefined
    // no extra validation here
  }

  // disallow duplicate metricIds in one segment
  const metricIds = metrics.map((m) => m.metricId);
  const uniqueMetricIds = new Set(metricIds);
  if (uniqueMetricIds.size !== metricIds.length) {
    return badRequest("Duplicate metricId in metrics array is not allowed");
  }

  // ---------- supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return serverError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  try {
    // 1) Fetch session (must exist & ACTIVE)
    const { data: session, error: sessionErr } = await sb
      .from("TRN_ShareSession")
      .select("SessionId, PostingId, UserId, StatusId, SegmentsExpected, SegmentsSent")
      .eq("SessionId", sessionId)
      .maybeSingle();
    if (sessionErr) throw sessionErr;
    if (!session) return notFound(`Share session not found for sessionId=${sessionId}`);

    // ensure ACTIVE status
    const { data: statusActive, error: stActiveErr } = await sb
      .from("MST_ShareSessionStatus")
      .select("StatusId, Code, DisplayName")
      .or("Code.eq.ACTIVE,DisplayName.eq.ACTIVE")
      .order("StatusId", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (stActiveErr) throw stActiveErr;
    if (!statusActive) return serverError("ACTIVE status row not found");

    if (session.StatusId !== statusActive.StatusId) {
      return conflict("Session is not ACTIVE");
    }

    // 2) Duplicate protection: (sessionId, dayIndex) and (sessionId, fromUtc, toUtc)
    // a) (sessionId, dayIndex)
    const { data: existingByDay, error: byDayErr } = await sb
      .from("TRN_ShareSegment")
      .select("SegmentId")
      .eq("SessionId", sessionId)
      .eq("DayIndex", dayIndex)
      .limit(1);
    if (byDayErr) throw byDayErr;
    if (existingByDay && existingByDay.length > 0) {
      return conflict(`Segment already exists for sessionId=${sessionId} dayIndex=${dayIndex}`);
    }

    // b) (sessionId, fromUtc, toUtc)
    const { data: existingByWindow, error: byWinErr } = await sb
      .from("TRN_ShareSegment")
      .select("SegmentId")
      .eq("SessionId", sessionId)
      .eq("FromUtc", fromUtc)
      .eq("ToUtc", toUtc)
      .limit(1);
    if (byWinErr) throw byWinErr;
    if (existingByWindow && existingByWindow.length > 0) {
      return conflict(`Segment already exists for the same time window`);
    }

    // 3) Insert TRN_ShareSegment
    const segInsert = {
      SessionId: sessionId,
      PostingId: session.PostingId,
      UserId: session.UserId,
      DayIndex: dayIndex,
      FromUtc: fromUtc,
      ToUtc: toUtc,
      HasData: hasData,
      // CreatedOn handled by default
    };
    const { data: segRow, error: segErr } = await sb
      .from("TRN_ShareSegment")
      .insert(segInsert)
      .select("SegmentId, CreatedOn")
      .single();
    if (segErr) throw segErr;

    // 4) Insert metrics (if any)
    if (hasData && metrics.length > 0) {
      const metricRows = metrics.map((m) => ({
        SegmentId: segRow.SegmentId,
        MetricId: m.metricId,
        UnitCode: m.unitCode,
        TotalValue: m.totalValue ?? null,
        AvgValue: m.avgValue ?? null,
        MinValue: m.minValue ?? null,
        MaxValue: m.maxValue ?? null,
        SamplesCount: m.samplesCount ?? null,
        ComputedJson: m.computedJson ?? null,
        // CreatedOn default
      }));

      const { error: metErr } = await sb.from("TRN_SegmentMetric").insert(metricRows);
      if (metErr) {
        // If DB constraint hit (e.g., uq_trn_segmentmetric_unique_per_metric), return 409
        if (String(metErr.message || "").toLowerCase().includes("unique")) {
          return conflict("Metrics contain duplicates for this segment");
        }
        throw metErr;
      }
    }

    // 5) Update session counters (+ flip to COMPLETED if done)
    const newSent = Number(session.SegmentsSent ?? 0) + 1;
    let newStatusId = session.StatusId;
    let newStatusName = "ACTIVE";

    let statusCompleted: { StatusId: number; DisplayName?: string; Code?: string } | null = null;
    if (newSent >= Number(session.SegmentsExpected ?? 0)) {
      const { data: stCompleted, error: stCompErr } = await sb
        .from("MST_ShareSessionStatus")
        .select("StatusId, Code, DisplayName")
        .or("Code.eq.COMPLETED,DisplayName.eq.COMPLETED")
        .order("StatusId", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (stCompErr) throw stCompErr;
      if (!stCompleted) return serverError("COMPLETED status row not found");
      statusCompleted = stCompleted;
      newStatusId = stCompleted.StatusId;
      newStatusName = stCompleted.DisplayName ?? stCompleted.Code ?? "COMPLETED";
    }

    const updatePayload: any = { SegmentsSent: newSent };
    if (statusCompleted) updatePayload.StatusId = newStatusId;

    const { error: updErr } = await sb
      .from("TRN_ShareSession")
      .update(updatePayload)
      .eq("SessionId", sessionId);
    if (updErr) throw updErr;

    // 6) Build response
    const ack =
      newStatusId !== statusActive.StatusId
        ? "accepted_completed"
        : hasData && metrics.length > 0
        ? "accepted"
        : "accepted_no_metrics";

    const resPayload = {
      segmentId: segRow.SegmentId,
      sessionId,
      dayIndex,
      segmentsSent: newSent,
      segmentsExpected: session.SegmentsExpected,
      sessionStatusId: newStatusId,
      sessionStatusName: newStatusName,
      ack,
    };

    return new Response(JSON.stringify(resPayload), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("user_submit_segment error", e);
    // try to map common constraint messages
    const msg = String(e?.message ?? "");
    if (msg.toLowerCase().includes("unique")) {
      return conflict("Duplicate segment or metric detected");
    }
    return serverError("Unexpected error while recording segment");
  }
});
