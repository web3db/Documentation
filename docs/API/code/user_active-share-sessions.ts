// supabase/functions/user_active-share-sessions/index.ts

import { createClient } from "npm:@supabase/supabase-js@2";

// Types based on your schema + our agreed DTO
type ActiveShareStatus = "onTrack" | "behind";

interface ActiveShareSessionDto {
  // Internal IDs (not shown in card UI)
  postingId: number; // TRN_ShareSession.PostingId
  sessionId: number; // TRN_ShareSession.SessionId

  // Posting / buyer / reward (shown)
  postingTitle: string;
  postingSummary: string | null;
  postingDescription: string | null;
  buyerName: string;
  rewardLabel: string;
  rewardTypeCode: string;
  rewardTypeDisplay: string;
  rewardValue: number;
  segmentsExpected: number;

  // Session info (partially shown)
  joinTimeLocal: string; // ISO string
  joinTimezone: string;
  statusCode: "ACTIVE";
  statusDisplay: "Active";
  permissionGranted: boolean;

  // Progress
  segmentsSent: number;
  progressPct: number;
  expectedCompletionDate: string; // ISO

  // Activity
  lastSegmentCreatedOn: string | null; // ISO
  lastDayIndex: number | null;
  missedWindowsCount: number;
  nextWindowFromUtc: string | null;
  nextWindowToUtc: string | null;

  // Derived UI status
  uiStatus: ActiveShareStatus;
}

// Create an admin Supabase client using service role key in Edge Functions
// According to Supabase docs, Edge Functions have SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
// available as environment variables. :contentReference[oaicite:0]{index=0}
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * Utility: format reward label from type + value.
 * You can tweak this mapping to your own reward codes.
 */
function formatRewardLabel(
  rewardTypeCode: string,
  rewardTypeDisplay: string,
  rewardValue: number
): string {
  // Simple, generic formatting; adjust for your own codes if needed.
  if (rewardTypeCode.toUpperCase() === "POINTS") {
    return `${rewardValue.toLocaleString()} ${rewardTypeDisplay}`;
  }
  if (rewardTypeCode.toUpperCase().includes("GIFT")) {
    return `$${rewardValue} ${rewardTypeDisplay}`;
  }
  // Fallback generic
  return `${rewardValue} ${rewardTypeDisplay}`;
}

/**
 * Utility: add (segmentsExpected - 1) days to the join date to estimate completion.
 * Uses UTC math on the ISO timestamp. You can replace with your planner logic later.
 */
function computeExpectedCompletionDate(
  joinTimeLocalIso: string,
  segmentsExpected: number
): string {
  if (!segmentsExpected || segmentsExpected < 1) {
    return joinTimeLocalIso;
  }
  const d = new Date(joinTimeLocalIso);
  // (expected days) = segmentsExpected - 1
  const daysToAdd = segmentsExpected - 1;
  d.setUTCDate(d.getUTCDate() + daysToAdd);
  return d.toISOString();
}

/**
 * Utility: calculate progressPct safely.
 */
function computeProgressPct(
  segmentsSent: number,
  segmentsExpected: number
): number {
  if (!segmentsExpected || segmentsExpected <= 0) return 0;
  const raw = (segmentsSent / segmentsExpected) * 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

/**
 * Main handler
 */
Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const userIdParam = url.searchParams.get("userId");
    const userId = userIdParam ? Number(userIdParam) : NaN;

    if (!userIdParam || Number.isNaN(userId) || userId <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing userId query parameter" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 1) Look up ACTIVE status id from MST_ShareSessionStatus
    const { data: activeStatusRow, error: activeStatusError } =
      await supabaseAdmin
        .from("MST_ShareSessionStatus")
        .select("StatusId, Code, DisplayName")
        .eq("Code", "ACTIVE")
        .maybeSingle();

    if (activeStatusError) {
      console.error("Error fetching ACTIVE status:", activeStatusError);
      return new Response(
        JSON.stringify({
          error: "Failed to load ACTIVE status from MST_ShareSessionStatus",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!activeStatusRow) {
      return new Response(
        JSON.stringify({
          error: "ACTIVE status not found in MST_ShareSessionStatus",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const activeStatusId: number = activeStatusRow.StatusId;

    // 2) Fetch TRN_ShareSession rows for this user with ACTIVE status
    const {
      data: sessionRows,
      error: sessionError,
    } = await supabaseAdmin
      .from("TRN_ShareSession")
      .select(
        `
        SessionId,
        PostingId,
        UserId,
        JoinTimeLocal,
        JoinTimezone,
        CycleAnchorUtc,
        SegmentsExpected,
        SegmentsSent,
        StatusId,
        PermissionGranted
      `
      )
      .eq("UserId", userId)
      .eq("PermissionGranted", true)
      .eq("StatusId", activeStatusId);

    if (sessionError) {
      console.error("Error fetching TRN_ShareSession:", sessionError);
      return new Response(
        JSON.stringify({
          error: "Failed to load share sessions",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!sessionRows || sessionRows.length === 0) {
      // No active sessions → return empty list
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Collect IDs for subsequent queries
    const postingIds = Array.from(
      new Set(sessionRows.map((s: any) => s.PostingId))
    ) as number[];
    const sessionIds = Array.from(
      new Set(sessionRows.map((s: any) => s.SessionId))
    ) as number[];

    // 3) Fetch postings for these postingIds
    const {
      data: postingRows,
      error: postingError,
    } = await supabaseAdmin
      .from("TRN_Posting")
      .select(
        `
        PostingId,
        BuyerUserId,
        Title,
        Summary,
        Description,
        RewardTypeId,
        RewardValue,
        DataCoverageDaysRequired
      `
      )
      .in("PostingId", postingIds);

    if (postingError) {
      console.error("Error fetching TRN_Posting:", postingError);
      return new Response(
        JSON.stringify({
          error: "Failed to load postings",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const buyerUserIds = Array.from(
      new Set((postingRows ?? []).map((p: any) => p.BuyerUserId))
    ) as number[];
    const rewardTypeIds = Array.from(
      new Set((postingRows ?? []).map((p: any) => p.RewardTypeId))
    ) as number[];

    // 4) Fetch buyer names from MST_User
    let buyerRows: any[] = [];
    if (buyerUserIds.length > 0) {
      const { data, error } = await supabaseAdmin
        .from("MST_User")
        .select("UserId, Name")
        .in("UserId", buyerUserIds);
      if (error) {
        console.error("Error fetching buyer MST_User rows:", error);
        return new Response(
          JSON.stringify({
            error: "Failed to load buyer user rows",
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      buyerRows = data ?? [];
    }

    // 5) Fetch reward types from MST_RewardType
    let rewardTypeRows: any[] = [];
    if (rewardTypeIds.length > 0) {
      const { data, error } = await supabaseAdmin
        .from("MST_RewardType")
        .select("RewardTypeId, Code, DisplayName")
        .in("RewardTypeId", rewardTypeIds);
      if (error) {
        console.error("Error fetching MST_RewardType:", error);
        return new Response(
          JSON.stringify({
            error: "Failed to load reward types",
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      rewardTypeRows = data ?? [];
    }

    // 6) Fetch segments for these sessions to compute lastSegmentCreatedOn, lastDayIndex
    const { data: segmentRows, error: segmentError } = await supabaseAdmin
      .from("TRN_ShareSegment")
      .select("SessionId, UserId, DayIndex, CreatedOn, HasData")
      .in("SessionId", sessionIds)
      .eq("UserId", userId);

    if (segmentError) {
      console.error("Error fetching TRN_ShareSegment:", segmentError);
      return new Response(
        JSON.stringify({
          error: "Failed to load share segments",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build maps for quick lookup
    const postingMap = new Map<number, any>();
    (postingRows ?? []).forEach((p: any) => {
      postingMap.set(p.PostingId, p);
    });

    const buyerMap = new Map<number, string>();
    buyerRows.forEach((b: any) => {
      buyerMap.set(b.UserId, b.Name);
    });

    const rewardTypeMap = new Map<number, { Code: string; DisplayName: string }>();
    rewardTypeRows.forEach((rt: any) => {
      rewardTypeMap.set(rt.RewardTypeId, {
        Code: rt.Code,
        DisplayName: rt.DisplayName,
      });
    });

    // const segmentAggMap = new Map<
    //   number,
    //   { lastCreatedOn: string | null; lastDayIndex: number | null }
    // >();

    // (segmentRows ?? []).forEach((seg: any) => {
    //   const sid = seg.SessionId as number;
    //   const createdOn = seg.CreatedOn as string;
    //   const dayIndex = seg.DayIndex as number;

    //   const current = segmentAggMap.get(sid) ?? {
    //     lastCreatedOn: null as string | null,
    //     lastDayIndex: null as number | null,
    //   };

    //   if (!current.lastCreatedOn || new Date(createdOn) > new Date(current.lastCreatedOn)) {
    //     current.lastCreatedOn = createdOn;
    //   }
    //   if (
    //     current.lastDayIndex === null ||
    //     (typeof dayIndex === "number" && dayIndex > current.lastDayIndex)
    //   ) {
    //     current.lastDayIndex = dayIndex;
    //   }

    //   segmentAggMap.set(sid, current);
    // });


    // Time rules
    const DAY_MS = 24 * 60 * 60 * 1000;
    const GRACE_MS = 15 * 60 * 1000;

    type SegmentAgg = {
      // Only days that have meaningful data (HasData = true)
      completedDayIndexes: Set<number>;
      lastCreatedOn: string | null;
      lastDayIndex: number | null;
    };

    const segmentAggMap = new Map<number, SegmentAgg>();

    (segmentRows ?? []).forEach((seg: any) => {
      // Only count segments that actually contain data
      if (seg.HasData !== true) return;

      const sid = seg.SessionId as number;
      const createdOn = seg.CreatedOn as string;
      const dayIndex = seg.DayIndex as number;

      if (typeof sid !== "number") return;
      if (typeof dayIndex !== "number") return;

      const current: SegmentAgg = segmentAggMap.get(sid) ?? {
        completedDayIndexes: new Set<number>(),
        lastCreatedOn: null,
        lastDayIndex: null,
      };

      current.completedDayIndexes.add(dayIndex);

      if (!current.lastCreatedOn || new Date(createdOn) > new Date(current.lastCreatedOn)) {
        current.lastCreatedOn = createdOn;
      }

      if (current.lastDayIndex === null || dayIndex > current.lastDayIndex) {
        current.lastDayIndex = dayIndex;
      }

      segmentAggMap.set(sid, current);
    });



    // 7) Build DTO array
    const result: ActiveShareSessionDto[] = sessionRows.map((session: any) => {
      const posting = postingMap.get(session.PostingId);
      const buyerName =
        posting && buyerMap.get(posting.BuyerUserId)
          ? buyerMap.get(posting.BuyerUserId)!
          : "Unknown buyer";

      const rewardType =
        posting && rewardTypeMap.get(posting.RewardTypeId)
          ? rewardTypeMap.get(posting.RewardTypeId)!
          : { Code: "UNKNOWN", DisplayName: "Reward" };

      // const rewardValue: number = Number(posting?.RewardValue ?? 0);
      // const segmentsExpected: number = Number(session.SegmentsExpected ?? 0);
      // const segmentsSent: number = Number(session.SegmentsSent ?? 0);

      // const rewardLabel = formatRewardLabel(
      //   rewardType.Code,
      //   rewardType.DisplayName,
      //   rewardValue
      // );

      // const joinTimeLocal: string = session.JoinTimeLocal;
      // const expectedCompletionDate = computeExpectedCompletionDate(
      //   joinTimeLocal,
      //   segmentsExpected
      // );

      // const segAgg = segmentAggMap.get(session.SessionId) ?? {
      //   lastCreatedOn: null as string | null,
      //   lastDayIndex: null as number | null,
      // };

      // const progressPct = computeProgressPct(segmentsSent, segmentsExpected);

      // // TODO: plug in your real sharing planner here using:
      // // - session.CycleAnchorUtc
      // // - session.JoinTimezone
      // // - segmentsSent / segmentsExpected
      // //
      // // For now we default to:
      // const missedWindowsCount = 0; // <-- replace with real computation
      // const nextWindowFromUtc: string | null = null; // <-- replace
      // const nextWindowToUtc: string | null = null; // <-- replace

      // const uiStatus: ActiveShareStatus =
      //   missedWindowsCount > 0 ? "behind" : "onTrack";

      const rewardValue: number = Number(posting?.RewardValue ?? 0);
      const segmentsExpected: number = Number(session.SegmentsExpected ?? 0);

      const rewardLabel = formatRewardLabel(
        rewardType.Code,
        rewardType.DisplayName,
        rewardValue
      );

      const joinTimeLocal: string = session.JoinTimeLocal;
      const expectedCompletionDate = computeExpectedCompletionDate(
        joinTimeLocal,
        segmentsExpected
      );

      // Aggregate (HasData=true only)
      const segAgg = segmentAggMap.get(session.SessionId) ?? {
        completedDayIndexes: new Set<number>(),
        lastCreatedOn: null as string | null,
        lastDayIndex: null as number | null,
      };

      const segmentsSentEffective = segAgg.completedDayIndexes.size;
      const progressPct = computeProgressPct(segmentsSentEffective, segmentsExpected);

      // // Anchor selection: prefer CycleAnchorUtc, fall back to JoinTimeLocal
      // let anchorUtc: Date | null = null;
      // if (session.CycleAnchorUtc) {
      //   const d = new Date(session.CycleAnchorUtc);
      //   if (!Number.isNaN(d.getTime())) anchorUtc = d;
      // }
      // if (!anchorUtc) {
      //   const d = new Date(joinTimeLocal);
      //   if (!Number.isNaN(d.getTime())) anchorUtc = d;
      // }

      // Anchor selection: CycleAnchorUtc should always exist (NOT NULL in schema).
      let anchorUtc: Date | null = null;

      const anchorCandidate = new Date(session.CycleAnchorUtc);
      if (!Number.isNaN(anchorCandidate.getTime())) {
        anchorUtc = anchorCandidate;
      } else {
        console.error(
          "Invalid CycleAnchorUtc for session",
          session.SessionId,
          session.CycleAnchorUtc
        );

        // Defensive fallback only (should not happen if DB respects schema)
        const fallback = new Date(joinTimeLocal);
        if (!Number.isNaN(fallback.getTime())) {
          anchorUtc = fallback;
        }
      }


      const nowUtc = new Date();
      const effectiveNowUtc = new Date(nowUtc.getTime() - GRACE_MS);

      // Default outputs (fail-safe)
      let missedWindowsCount = 0;
      let nextWindowFromUtc: string | null = null;
      let nextWindowToUtc: string | null = null;

      if (anchorUtc && segmentsExpected > 0) {
        // Next window boundaries (use real now, not grace)
        const elapsedNow = nowUtc.getTime() - anchorUtc.getTime();
        const k = elapsedNow >= 0 ? Math.floor(elapsedNow / DAY_MS) : -1;

        const nextFromMs =
          k >= 0
            ? anchorUtc.getTime() + (k + 1) * DAY_MS
            : anchorUtc.getTime();

        nextWindowFromUtc = new Date(nextFromMs).toISOString();
        nextWindowToUtc = new Date(nextFromMs + DAY_MS).toISOString();

        // Missed logic starts from DayIndex 1 (Day 0 never causes "Behind")
        const elapsedEffective = effectiveNowUtc.getTime() - anchorUtc.getTime();
        const bucketsPassed = elapsedEffective >= 0 ? Math.floor(elapsedEffective / DAY_MS) : -1;

        // A day i is considered "missed" only after its window ends (+ grace).
        // With our day model: window i = [anchor + i*DAY, anchor + (i+1)*DAY)
        // The latest day whose window has ended is (bucketsPassed - 1).
        const latestEndedDay = Math.min(segmentsExpected - 1, bucketsPassed - 1);

        if (latestEndedDay >= 1) {
          let missed = 0;
          for (let day = 1; day <= latestEndedDay; day++) {
            if (!segAgg.completedDayIndexes.has(day)) missed++;
          }
          missedWindowsCount = missed;
        }
      }

      const uiStatus: ActiveShareStatus =
        missedWindowsCount > 0 ? "behind" : "onTrack";

      // IMPORTANT: use effective counts in DTO fields
      const segmentsSent = segmentsSentEffective;



      const dto: ActiveShareSessionDto = {
        postingId: session.PostingId,
        sessionId: session.SessionId,

        postingTitle: posting?.Title ?? "Untitled posting",
        postingSummary: posting?.Summary ?? null,
        postingDescription: posting?.Description ?? null,
        buyerName,
        rewardLabel,
        rewardTypeCode: rewardType.Code,
        rewardTypeDisplay: rewardType.DisplayName,
        rewardValue,
        segmentsExpected,

        joinTimeLocal,
        joinTimezone: session.JoinTimezone,
        statusCode: "ACTIVE",
        statusDisplay: activeStatusRow.DisplayName ?? "Active",
        permissionGranted: Boolean(session.PermissionGranted),

        segmentsSent,
        progressPct,
        expectedCompletionDate,

        lastSegmentCreatedOn: segAgg.lastCreatedOn,
        lastDayIndex: segAgg.lastDayIndex,
        missedWindowsCount,
        nextWindowFromUtc,
        nextWindowToUtc,

        uiStatus,
      };

      return dto;
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unhandled error in user_active-share-sessions:", err);
    return new Response(
      JSON.stringify({ error: "Unexpected error in function" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
