// deno-lint-ignore-file no-explicit-any
// File: supabase/functions/share_get_session_snapshot/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";

/** ---------- helpers ---------- */
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
function bad_request(message: string, details?: unknown) {
  return json({ code: "BAD_REQUEST", message, details }, 400);
}
function not_found(message: string) {
  return json({ code: "NOT_FOUND", message }, 404);
}
function server_error(message: string, details?: unknown) {
  return json({ code: "SERVER_ERROR", message, details }, 500);
}

/** ---------- main ---------- */
serve(async (req) => {
  if (req.method !== "GET") {
    return bad_request("Only GET is supported for this endpoint");
  }

  const url = new URL(req.url);
  const user_id_param = url.searchParams.get("userId");
  const posting_id_param = url.searchParams.get("postingId");

  if (!user_id_param || !posting_id_param) {
    return bad_request("Missing required query params ?userId=&postingId=");
  }

  const user_id = Number(user_id_param);
  const posting_id = Number(posting_id_param);
  if (Number.isNaN(user_id) || Number.isNaN(posting_id)) {
    return bad_request("userId and postingId must be valid integers", {
      user_id_param,
      posting_id_param,
    });
  }

  const supabase_url = Deno.env.get("SUPABASE_URL");
  const service_key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabase_url || !service_key) {
    return server_error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const sb = createClient(supabase_url, service_key, {
    auth: { persistSession: false },
  });

  try {
    // 1) Get all share session statuses (to resolve ACTIVE, COMPLETED, etc.)
    const { data: status_rows, error: stErr } = await sb
      .from("MST_ShareSessionStatus")
      .select("StatusId, Code, DisplayName");
    if (stErr) throw stErr;

    const find_status_id = (code: string) =>
      status_rows?.find((r) => (r.Code ?? "").toUpperCase() === code)?.StatusId ?? null;

    const ACTIVE_ID = find_status_id("ACTIVE");

    // 2) Try to find ACTIVE session first
    let chosen: any | null = null;
    if (ACTIVE_ID !== null) {
      const { data: active, error: actErr } = await sb
        .from("TRN_ShareSession")
        .select(
          "SessionId, PostingId, UserId, JoinTimeLocal, JoinTimezone, CycleAnchorUtc, SegmentsExpected, SegmentsSent, StatusId, CreatedOn, ModifiedOn"
        )
        .eq("PostingId", posting_id)
        .eq("UserId", user_id)
        .eq("StatusId", ACTIVE_ID)
        .maybeSingle();
      if (actErr) throw actErr;
      if (active) chosen = active;
    }

    // 3) If not ACTIVE, take the latest (ModifiedOn desc)
    if (!chosen) {
      const { data: latest, error: latestErr } = await sb
        .from("TRN_ShareSession")
        .select(
          "SessionId, PostingId, UserId, JoinTimeLocal, JoinTimezone, CycleAnchorUtc, SegmentsExpected, SegmentsSent, StatusId, CreatedOn, ModifiedOn"
        )
        .eq("PostingId", posting_id)
        .eq("UserId", user_id)
        .order("ModifiedOn", { ascending: false })
        .order("CreatedOn", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (latestErr) throw latestErr;
      if (latest) chosen = latest;
    }

    if (!chosen) {
      return json({ ok: true, session: null });
    }

    // 4) Resolve readable status fields
    const status_id = chosen.StatusId as number;
    const st_row = status_rows?.find((r) => r.StatusId === status_id);
    const status_code = st_row?.Code ?? null;
    const status_name = st_row?.DisplayName ?? null;

    // 5) Get last segment (latest DayIndex)
    const { data: last_seg, error: segErr } = await sb
      .from("TRN_ShareSegment")
      .select("SegmentId, DayIndex, FromUtc, ToUtc, HasData, CreatedOn")
      .eq("SessionId", chosen.SessionId)
      .order("DayIndex", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (segErr) throw segErr;

    // 6) Prepare payload
    const payload = {
      session_id: chosen.SessionId,
      posting_id: chosen.PostingId,
      user_id: chosen.UserId,
      status_code,
      status_name,
      segments_expected: Number(chosen.SegmentsExpected ?? 0),
      segments_sent: Number(chosen.SegmentsSent ?? 0),
      last_sent_day_index: last_seg?.DayIndex ?? null,
      cycle_anchor_utc: chosen.CycleAnchorUtc,
      join_time_local_iso: chosen.JoinTimeLocal,
      join_timezone: chosen.JoinTimezone,
      last_uploaded_at: last_seg?.CreatedOn ?? null,
      last_window_from_utc: last_seg?.FromUtc ?? null,
      last_window_to_utc: last_seg?.ToUtc ?? null,
    };

    return json({ ok: true, session: payload });
  } catch (e: any) {
    console.error("share_get_session_snapshot error:", e);
    return server_error("Unexpected error while fetching session snapshot", e?.message);
  }
});
