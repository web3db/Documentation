// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";
/** ---------- helpers ---------- */ function badRequest(message, details) {
  return new Response(JSON.stringify({
    code: "BAD_REQUEST",
    message,
    details
  }), {
    status: 400,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    }
  });
}
function notFound(message) {
  return new Response(JSON.stringify({
    code: "NOT_FOUND",
    message
  }), {
    status: 404,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    }
  });
}
function serverError(message, details) {
  return new Response(JSON.stringify({
    code: "SERVER_ERROR",
    message,
    details
  }), {
    status: 500,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    }
  });
}
/** ---------- main ---------- */ serve(async (req)=>{
  const origin = req.headers.get("origin") || "*";
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
      }
    });
  }
  if (req.method !== "GET") {
    return badRequest("Only GET is supported for this endpoint");
  }
  // Open endpoint: no auth
  const url = new URL(req.url);
  const postingIdParam = url.searchParams.get("postingId");
  if (!postingIdParam || Number.isNaN(Number(postingIdParam))) {
    return badRequest("postingId is required and must be an integer", {
      postingId: postingIdParam
    });
  }
  const postingId = Number(postingIdParam);
  // Supabase
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return serverError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  const sb = createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false
    }
  });
  try {
    /** 1) Posting */ const { data: posting, error: postingErr } = await sb.from("TRN_Posting").select("PostingId, Title").eq("PostingId", postingId).maybeSingle();
    if (postingErr) throw postingErr;
    if (!posting) return notFound(`Posting not found for postingId=${postingId}`);
    /** 2) Sessions for this posting */ const { data: sessions, error: sessErr } = await sb.from("TRN_ShareSession").select("SessionId, UserId, StatusId, SegmentsExpected, SegmentsSent").eq("PostingId", postingId);
    if (sessErr) throw sessErr;
    if (!sessions || sessions.length === 0) {
      // Return empty payload but with posting info
      const emptyPayload = {
        postingId: posting.PostingId,
        postingTitle: posting.Title ?? null,
        shares: []
      };
      return new Response(JSON.stringify(emptyPayload), {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        }
      });
    }
    // Collect ids
    const userIds = Array.from(new Set(sessions.map((s)=>s.UserId).filter((x)=>typeof x === "number")));
    const statusIds = Array.from(new Set(sessions.map((s)=>s.StatusId).filter((x)=>typeof x === "number")));
    const sessionIds = sessions.map((s)=>s.SessionId);
    /** 3) Users map */ let userMap = new Map();
    if (userIds.length > 0) {
      const { data: users, error: usersErr } = await sb.from("MST_User").select("UserId, Name").in("UserId", userIds);
      if (usersErr) throw usersErr;
      for (const u of users ?? []){
        userMap.set(u.UserId, u.Name ?? null);
      }
    }
    /** 4) Status map */ let statusMap = new Map();
    if (statusIds.length > 0) {
      const { data: statuses, error: statusErr } = await sb.from("MST_ShareSessionStatus").select("StatusId, Code, DisplayName").in("StatusId", statusIds);
      if (statusErr) throw statusErr;
      for (const st of statuses ?? []){
        statusMap.set(st.StatusId, st.DisplayName ?? st.Code ?? null);
      }
    }
    /** 5) Segments for these sessions */ const { data: segments, error: segErr } = await sb.from("TRN_ShareSegment").select("SegmentId, SessionId, DayIndex, FromUtc, ToUtc, HasData").in("SessionId", sessionIds);
    if (segErr) throw segErr;
    const segmentIds = (segments ?? []).map((g)=>g.SegmentId);
    /** 6) Metrics for these segments */ let metrics = [];
    if (segmentIds.length > 0) {
      const { data: metricRows, error: metErr } = await sb.from("TRN_SegmentMetric").select("SegmentId, MetricId, UnitCode, TotalValue, AvgValue, MinValue, MaxValue, SamplesCount, ComputedJson").in("SegmentId", segmentIds);
      if (metErr) throw metErr;
      metrics = metricRows ?? [];
    }
    // Metric names lookup
    const metricIds = Array.from(new Set(metrics.map((m)=>m.MetricId).filter((x)=>typeof x === "number")));
    let metricNameMap = new Map();
    if (metricIds.length > 0) {
      const { data: metricDefs, error: defsErr } = await sb.from("MST_Metric").select("MetricId, DisplayName").in("MetricId", metricIds);
      if (defsErr) throw defsErr;
      for (const d of metricDefs ?? []){
        metricNameMap.set(d.MetricId, d.DisplayName ?? null);
      }
    }
    /** 7) Build nested response */ // Map segments by sessionId
    const segBySession = new Map();
    for (const seg of segments ?? []){
      const list = segBySession.get(seg.SessionId) ?? [];
      list.push(seg);
      segBySession.set(seg.SessionId, list);
    }
    // Map metrics by segmentId
    const metBySegment = new Map();
    for (const m of metrics ?? []){
      const list = metBySegment.get(m.SegmentId) ?? [];
      list.push(m);
      metBySegment.set(m.SegmentId, list);
    }
    // Sort: sessions by userId asc; segments by dayIndex asc; metrics by metricId asc
    sessions.sort((a, b)=>a.UserId - b.UserId);
    for (const sid of segBySession.keys()){
      segBySession.get(sid).sort((a, b)=>a.DayIndex - b.DayIndex);
    }
    for (const gid of metBySegment.keys()){
      metBySegment.get(gid).sort((a, b)=>a.MetricId - b.MetricId);
    }
    const shares = sessions.map((s)=>{
      const segs = segBySession.get(s.SessionId) ?? [];
      const segmentsOut = segs.map((g)=>{
        const mlist = metBySegment.get(g.SegmentId) ?? [];
        const metricsOut = mlist.map((m)=>({
            metricId: m.MetricId,
            metricName: metricNameMap.get(m.MetricId) ?? null,
            unitCode: m.UnitCode,
            totalValue: m.TotalValue,
            avgValue: m.AvgValue,
            minValue: m.MinValue,
            maxValue: m.MaxValue,
            samplesCount: m.SamplesCount,
            computedJson: m.ComputedJson ?? null
          }));
        return {
          segmentId: g.SegmentId,
          dayIndex: g.DayIndex,
          fromUtc: g.FromUtc,
          toUtc: g.ToUtc,
          metrics: metricsOut
        };
      });
      return {
        userId: s.UserId,
        userDisplayName: userMap.get(s.UserId) ?? null,
        sessionId: s.SessionId,
        statusId: s.StatusId,
        statusName: statusMap.get(s.StatusId) ?? null,
        segments: segmentsOut
      };
    });
    const payload = {
      postingId: posting.PostingId,
      postingTitle: posting.Title ?? null,
      shares
    };
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      }
    });
  } catch (e) {
    console.error("buyer_get_posting_shares error", e);
    return serverError("Unexpected error while fetching posting shares");
  }
});
