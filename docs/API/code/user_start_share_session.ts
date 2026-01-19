// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";
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

function serverError(message: string): Response {
  return new Response(JSON.stringify({ code: "SERVER_ERROR", message }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  // Open endpoint: no auth checks (per your requirement)
  if (req.method !== "POST") {
    return badRequest("Only POST is supported for this endpoint");
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return badRequest("Request body must be valid JSON");
  }
  // Basic validation
  const { postingId, userId, joinTimeLocal, joinTimezone, cycleAnchorUtc, segmentsExpected } = body ?? {};
  if (typeof postingId !== "number" || typeof userId !== "number" || typeof joinTimeLocal !== "string" || typeof joinTimezone !== "string" || typeof cycleAnchorUtc !== "string" || typeof segmentsExpected !== "number") {
    return badRequest("Missing or invalid fields", {
      required: [
        "postingId:number",
        "userId:number",
        "joinTimeLocal:string",
        "joinTimezone:string",
        "cycleAnchorUtc:string",
        "segmentsExpected:number"
      ],
      received: body
    });
  }
  if (segmentsExpected < 1) {
    return badRequest("segmentsExpected must be >= 1");
  }
  // Validate timestamps parse
  // We don't strictly need to reformat; just ensure they parse
  const jl = Date.parse(joinTimeLocal);
  const ca = Date.parse(cycleAnchorUtc);
  if (Number.isNaN(jl) || Number.isNaN(ca)) {
    return badRequest("joinTimeLocal and cycleAnchorUtc must be ISO-8601 strings");
  }
  // Supabase client (service role for DB read/write)
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return serverError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false
    }
  });
  try {
    // 1) Lookup Posting (TRN_Posting)
    const { data: posting, error: postingErr } = await supabase.from('TRN_Posting') // unquoted because created without quotes in schema block, but yours uses "TRN_Posting"; both work in PostgREST. If needed, use `"TRN_Posting"`
      .select('PostingId, Title').eq('PostingId', postingId).maybeSingle();
    if (postingErr) throw postingErr;
    if (!posting) return notFound(`Posting not found for postingId=${postingId}`);
    // 2) Lookup User (MST_User)
    const { data: user, error: userErr } = await supabase.from('MST_User').select('UserId, Name').eq('UserId', userId).maybeSingle();
    if (userErr) throw userErr;
    if (!user) return notFound(`User not found for userId=${userId}`);
    // 3) Get ACTIVE status row
    // Prefer Code='ACTIVE' if present. Otherwise fallback to DisplayName='ACTIVE'.
    const { data: statusActive, error: statusErr } = await supabase.from('MST_ShareSessionStatus').select('StatusId, Code, DisplayName').or('Code.eq.ACTIVE,DisplayName.eq.ACTIVE').order('StatusId', {
      ascending: true
    }).limit(1).maybeSingle();
    if (statusErr) throw statusErr;
    if (!statusActive) {
      return serverError("ACTIVE status row not found in MST_ShareSessionStatus");
    }
    // 4) Check for existing ACTIVE session (unique-on-active constraint semantics)
    const { data: existingActive, error: existingErr } = await supabase.from('TRN_ShareSession').select('SessionId').eq('PostingId', postingId).eq('UserId', userId).eq('StatusId', statusActive.StatusId).limit(1);
    if (existingErr) throw existingErr;
    if (existingActive && existingActive.length > 0) {
      return conflict("Active session already exists for this posting and user");
    }
    // 5) Insert new TRN_ShareSession
    const toInsert = {
      PostingId: postingId,
      UserId: userId,
      JoinTimeLocal: joinTimeLocal,
      JoinTimezone: joinTimezone,
      CycleAnchorUtc: cycleAnchorUtc,
      SegmentsExpected: segmentsExpected,
      SegmentsSent: 0,
      StatusId: statusActive.StatusId,
      PermissionGranted: true
    };
    const { data: insertedRows, error: insertErr } = await supabase.from('TRN_ShareSession').insert(toInsert).select('SessionId, CreatedOn, ModifiedOn') // return server times
      .single();
    if (insertErr) throw insertErr;
    const responsePayload = {
      sessionId: insertedRows.SessionId,
      postingId: posting.PostingId,
      postingTitle: posting.Title ?? null,
      userId: user.UserId,
      userDisplayName: user.Name ?? null,
      statusId: statusActive.StatusId,
      statusName: statusActive.DisplayName ?? statusActive.Code ?? "ACTIVE",
      segmentsExpected,
      segmentsSent: 0,
      joinTimeLocal,
      joinTimezone,
      cycleAnchorUtc,
      permissionGranted: true,
      createdOnUtc: insertedRows.CreatedOn ?? null
    };
    return new Response(JSON.stringify(responsePayload), {
      status: 201,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (e) {
    console.error("user_start_share_session error", e);
    // Map common PostgREST constraint failures if needed
    return serverError("Unexpected error while creating share session");
  }
});
