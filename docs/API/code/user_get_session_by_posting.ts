// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";

/** ---------- helpers ---------- */
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
function serverError(message: string, details?: any): Response {
  return new Response(JSON.stringify({ code: "SERVER_ERROR", message, details }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}

/** ---------- main ---------- */
serve(async (req) => {
  if (req.method !== "GET") {
    return badRequest("Only GET is supported for this endpoint");
  }

  // Open endpoint: no auth
  const url = new URL(req.url);
  const postingIdParam = url.searchParams.get("postingId");
  const userIdParam = url.searchParams.get("userId");

  if (!postingIdParam || Number.isNaN(Number(postingIdParam))) {
    return badRequest("postingId is required and must be an integer", { postingId: postingIdParam });
  }
  if (!userIdParam || Number.isNaN(Number(userIdParam))) {
    return badRequest("userId is required and must be an integer", { userId: userIdParam });
  }
  const postingId = Number(postingIdParam);
  const userId = Number(userIdParam);

  // Supabase client (service role)
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return serverError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  try {
    // 1) Ensure posting & user exist (helpful error messages)
    const [{ data: posting, error: postingErr }, { data: user, error: userErr }] = await Promise.all([
      sb.from("TRN_Posting").select("PostingId, Title").eq("PostingId", postingId).maybeSingle(),
      sb.from("MST_User").select("UserId, Name").eq("UserId", userId).maybeSingle(),
    ]);
    if (postingErr) throw postingErr;
    if (userErr) throw userErr;
    if (!posting) return notFound(`Posting not found for postingId=${postingId}`);
    if (!user) return notFound(`User not found for userId=${userId}`);

    // 2) Try to find ACTIVE first
    const { data: activeRow, error: activeErr } = await sb
      .from("MST_ShareSessionStatus")
      .select("StatusId, Code, DisplayName")
      .or("Code.eq.ACTIVE,DisplayName.eq.ACTIVE")
      .order("StatusId", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (activeErr) throw activeErr;

    let activeSession: any = null;
    if (activeRow) {
      const { data: actSess, error: actSessErr } = await sb
        .from("TRN_ShareSession")
        .select("SessionId, StatusId, SegmentsExpected, SegmentsSent, CreatedOn, ModifiedOn")
        .eq("PostingId", postingId)
        .eq("UserId", userId)
        .eq("StatusId", activeRow.StatusId)
        .limit(1)
        .maybeSingle();
      if (actSessErr) throw actSessErr;
      activeSession = actSess ?? null;
    }

    // 3) If no ACTIVE, select latest session by CreatedOn (fallback ModifiedOn)
    let chosen = activeSession;
    if (!chosen) {
      const { data: latestList, error: latestErr } = await sb
        .from("TRN_ShareSession")
        .select("SessionId, StatusId, SegmentsExpected, SegmentsSent, CreatedOn, ModifiedOn")
        .eq("PostingId", postingId)
        .eq("UserId", userId)
        .order("CreatedOn", { ascending: false, nullsFirst: false })
        .order("ModifiedOn", { ascending: false, nullsFirst: false })
        .limit(1);
      if (latestErr) throw latestErr;
      if (latestList && latestList.length > 0) {
        chosen = latestList[0];
      }
    }

    if (!chosen) {
      return notFound(`No share session found for postingId=${postingId} & userId=${userId}`);
    }

    // 4) Status name map (for nice display)
    const { data: statusDefs, error: stErr } = await sb
      .from("MST_ShareSessionStatus")
      .select("StatusId, Code, DisplayName");
    if (stErr) throw stErr;
    const statusName =
      statusDefs?.find((s) => s.StatusId === chosen.StatusId)?.DisplayName ??
      statusDefs?.find((s) => s.StatusId === chosen.StatusId)?.Code ??
      null;

    // 5) Build response
    const payload = {
      sessionId: chosen.SessionId,
      postingId: posting.PostingId,
      postingTitle: posting.Title ?? null,
      userId: user.UserId,
      userDisplayName: user.Name ?? null,
      statusId: chosen.StatusId,
      statusName,
      segmentsExpected: chosen.SegmentsExpected,
      segmentsSent: chosen.SegmentsSent,
      createdOnUtc: chosen.CreatedOn ?? null,
      modifiedOnUtc: chosen.ModifiedOn ?? null,
      source: activeSession ? "ACTIVE" : "LATEST",
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("user_get_session_by_posting error", e);
    return serverError("Unexpected error while resolving session");
  }
});
