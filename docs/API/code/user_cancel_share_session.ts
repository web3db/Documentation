// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";

/** ---------- helpers (typed) ---------- */
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

/** ---------- request shape ---------- */
type CancelBody = {
  sessionId: number;
};

serve(async (req) => {
  // Open endpoint: no auth (per your requirement)
  if (req.method !== "POST") {
    return badRequest("Only POST is supported for this endpoint");
  }

  // Parse body
  let body: CancelBody;
  try {
    body = await req.json();
  } catch {
    return badRequest("Request body must be valid JSON");
  }

  // Validate
  if (!body || typeof body.sessionId !== "number") {
    return badRequest("sessionId is required and must be a number", { received: body });
  }
  const { sessionId } = body;

  // Supabase client (service role)
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return serverError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  try {
    // 1) Fetch session
    const { data: session, error: sessionErr } = await sb
      .from("TRN_ShareSession")
      .select("SessionId, StatusId, SegmentsExpected, SegmentsSent")
      .eq("SessionId", sessionId)
      .maybeSingle();

    if (sessionErr) throw sessionErr;
    if (!session) return notFound(`Share session not found for sessionId=${sessionId}`);

    // 2) Fetch COMPLETED & CANCELLED rows (by Code or DisplayName)
    const { data: stCompleted, error: compErr } = await sb
      .from("MST_ShareSessionStatus")
      .select("StatusId, Code, DisplayName")
      .or("Code.eq.COMPLETED,DisplayName.eq.COMPLETED")
      .order("StatusId", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (compErr) throw compErr;
    if (!stCompleted) return serverError("COMPLETED status row not found");

    const { data: stCancelled, error: cancErr } = await sb
      .from("MST_ShareSessionStatus")
      .select("StatusId, Code, DisplayName")
      .or("Code.eq.CANCELLED,DisplayName.eq.CANCELLED")
      .order("StatusId", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (cancErr) throw cancErr;
    if (!stCancelled) return serverError("CANCELLED status row not found");

    // 3) Prevent cancelling a COMPLETED session
    if (session.StatusId === stCompleted.StatusId) {
      return conflict("Session is already COMPLETED and cannot be cancelled");
    }

    // 4) Idempotency: if already CANCELLED, just return OK (no-op)
    if (session.StatusId === stCancelled.StatusId) {
      const statusName = stCancelled.DisplayName ?? stCancelled.Code ?? "CANCELLED";
      return new Response(
        JSON.stringify({
          sessionId,
          statusId: stCancelled.StatusId,
          statusName,
          ack: "already_cancelled",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 5) Update to CANCELLED
    const { error: updErr } = await sb
      .from("TRN_ShareSession")
      .update({ StatusId: stCancelled.StatusId })
      .eq("SessionId", sessionId);

    if (updErr) throw updErr;

    // 6) Return success
    const statusName = stCancelled.DisplayName ?? stCancelled.Code ?? "CANCELLED";
    return new Response(
      JSON.stringify({
        sessionId,
        statusId: stCancelled.StatusId,
        statusName,
        ack: "cancelled",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("user_cancel_share_session error", e);
    return serverError("Unexpected error while cancelling share session");
  }
});
