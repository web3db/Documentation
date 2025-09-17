#  DATABASE.md — Health Data Platform (HealthKit + Health Connect)

This doc summarizes database designed for storing **auto-recorded** health data from **Apple HealthKit** and **Google Health Connect**, with **rollups** for fast reads and **checkpoints** for the 3-hour freshness rule.

---

## MST_User

| UserId | ClerkId      | Email               | FirstName | LastName | BirthYear | DateOfBirth | GenderId | SexId | Height | HeightUnitId | Weight | WeightUnitId | MeasurementSystemId | RoleId |
|---:|---|---|---|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1001 | user_01_abc | user1@example.com | John      | Doe      | 1994 | 1994-05-12  | 1 | 1 | 168.0 | 2 | 62.0  | 4 | 1 | 1 |
| 1002 | user_02_def | user2@example.com | Jane      | Smith    | 1988 | 1988-11-03  | 2 | 2 | 180.0 | 2 | 78.5  | 4 | 1 | 2 |
| 1003 | user_03_ghi | user3@example.com | Alex      | Johnson  | 1999 | 1999-02-20  | 3 | 3 | 172.0 | 2 | 68.0  | 4 | 1 | 1 |
| 1004 | user_04_jkl | user4@example.com | Maria     | Garcia   | 1992 | 1992-07-28  | 5 | 4 | 70.0  | 1 | 155.0 | 3 | 2 | 1 |
| 1005 | user_05_mno | user5@example.com | Liam      | Brown    | 2001 | 2001-12-15  | 1 | 1 | 165.0 | 2 | 55.0  | 4 | 1 | 1 |


> HeightUnitId: 2=cm, 1=in; WeightUnitId: 4=kg, 3=lb. MeasurementSystemId: 1=metric, 2=imperial. RoleId: see MST_Role.

---

## MST_Gender

| GenderId | GenderCode     | Description              |
|---:|---|---|
| 1 | male          | Man/male (self-identified) |
| 2 | female        | Woman/female (self-identified) |
| 3 | nonbinary     | Non-binary |
| 4 | preferNotSay  | Prefer not to say |
| 5 | unknown       | Not specified |

---

## MST_Sex

| SexId | SexCode       | Description |
|---:|---|---|
| 1 | male        | Sex assigned male |
| 2 | female      | Sex assigned female |
| 3 | intersex    | Intersex |
| 4 | unknown     | Not specified |
| 5 | preferNotSay| Prefer not to say |

---

## MST_MeasurementSystem

| MeasurementSystemId | MeasurementSystemCode | DisplayName          |
|---:|---|---|
| 1 | metric       | SI units (kg, cm, m) |
| 2 | imperial     | In, lb (US/UK) |
| 3 | usCustomary  | US customary |
| 4 | ukImperial   | UK imperial variant |
| 5 | unknown      | Not specified |

---

## MST_Role

| RoleId | RoleCode | Description                |
|---:|---|---|
| 1 | user  | End user / participant |
| 2 | buyer | Buyer / requester |
| 3 | admin | Admin / moderator |

---

## MST_Platform

| PlatformId | PlatformCode   | Description                 |
|---:|---|---|
| 1 | healthkit       | Apple HealthKit (iOS) |
| 2 | healthConnect   | Android Health Connect |
| 3 | manual          | Manual entries (future) |

---

## MST_Unit

| UnitId | UnitCode     | DisplayName     |
|---:|---|---|
| 1 | meter        | Meter |
| 2 | kilometer    | Kilometer |
| 3 | count        | Count |
| 4 | kilogram     | Kilogram |
| 5 | beatsPerMin  | Beats per minute |

---

## MST_ValueKind

| ValueKindId | ValueKindCode | Description                           |
|---:|---|---|
| 1 | quantity | Numeric quantity over an interval/total |
| 2 | sample   | Instantaneous sample |
| 3 | interval | Start–end duration (minutes etc.) |
| 4 | category | Enumerated categorical |
| 5 | boolean  | True/false |

---

## MST_Metric

| MetricId | MetricCode                 | ValueKindId | DefaultUnitId | DisplayName                     |
|---:|---|---:|---:|---|
| 101 | steps                          | 1 | 3 | Step count (interval totals) |
| 110 | heartRate                      | 2 | 5 | Heart rate (BPM samples) |
| 120 | distanceWalkingRunning         | 1 | 1 | Distance (meters) |
| 130 | floorsClimbed                  | 1 | 3 | Floors climbed (count) |
| 140 | activeEnergyBurned             | 1 | 3 | Energy (kcal as count equivalent) |


---

## MST_VendorType

| VendorTypeId | VendorTypeCode | Description         |
|---:|---|---|
| 1 | phone  | Phone (handset) |
| 2 | watch  | Smartwatch |
| 3 | band   | Fitness band |
| 4 | scale  | Smart scale |
| 5 | app    | Source app only |

---

## MST_SourceApp

| SourceAppId | PlatformId | AppIdentifier                     | DisplayName         |
|---:|---:|---|---|
| 1 | 1 | com.apple.health               | Apple Health |
| 2 | 1 | com.apple.watch               | Apple Watch |
| 3 | 2 | com.google.android.apps.healthdata | Health Connect |
| 4 | 3 | com.fitbit.FitbitMobile       | Fitbit |
| 5 | 2 | com.example.runningapp        | Running App Pro |

---

## TRN_VendorRecord
| VendorRecordId | UserId | PlatformId | VendorTypeId | SourceAppId | BundleOrPackage                         | DeviceName         | DeviceModel        | OsVersion   | AppVersion | MetaJson                  | IngestedAt              | IsDeleted |
|---|---:|---:|---:|---:|---|---|---|---|---|---|---|:--:|
| HK-ABC123 | 1001 | 1 | 2 | 2 | com.apple.watch                      | Apple Watch SE     | Watch6,7           | watchOS 10.0 | 10.0.1   | {"wrist":"left"}         | 2025-09-15T09:01:00Z | false |
| HK-DEF456 | 1002 | 1 | 1 | 1 | com.apple.health                     | iPhone 14 Pro      | iPhone15,2         | iOS 18.0     | 18.0.1   | {"motion":"on"}          | 2025-09-15T10:15:22Z | false |
| HC-XYZ789 | 1003 | 2 | 2 | 3 | com.samsung.health                   | Galaxy Watch 6     | SM-R960            | WearOS 4     | 4.1.0    | {"sensor":"ppg"}         | 2025-09-15T11:30:05Z | false |
| FB-112233 | 1004 | 3 | 3 | 4 | com.fitbit.FitbitMobile             | Fitbit Charge 6    | Charge6            | FW 1.2.3     | 4.0.0    | {"pairing":"ok"}         | 2025-09-14T08:02:45Z | false |
| HC-ABC999 | 1005 | 2 | 1 | 3 | com.google.android.apps.healthdata  | Pixel 8 Pro        | Google Pixel 8 Pro | Android 15   | 1.0.0    | {"battery":"85%"}        | 2025-09-16T07:55:10Z | false |

---

## TRN_Observation

| ObservationId | UserId | PlatformId | MetricId | UnitId  | VendorRecordId | StartTime              | EndTime                | ValueNum | IngestedAt              | IsDeleted |
|---:|---:|---:|---:|---:|---:|---|---|---|---:|---|
| 900001 | 1001 | 1 | 101 | 3| HK-ABC123 | 2025-09-16T09:00:00Z | 2025-09-16T09:05:00Z | 312 | 2025-09-16T09:06:00Z | false |
| 900002 | 1001 | 1 | 110 |  2 | HK-ABC123 | 2025-09-16T12:00:05Z | — | 92 | 2025-09-16T12:00:06Z | false |
| 900003 | 1002 | 1 | 130 |  1 | HK-DEF456 | 2025-09-15T18:00:00Z | 2025-09-15T19:00:00Z | 14 | 2025-09-15T19:01:30Z | false |
| 900004 | 1003 | 2 | 120 |  3 | HC-XYZ789 | 2025-09-15T07:00:00Z | 2025-09-15T08:00:00Z | 1850 | 2025-09-15T08:02:00Z | false |
| 900005 | 1005 | 2 | 140 |  5 | HC-ABC999 | 2025-09-16T06:30:00Z | 2025-09-16T07:00:00Z | 220 | 2025-09-16T07:01:00Z | false |


---

## MST_SyncScope

| SyncScopeId | SyncScopeCode    | Description                    |
|---:|---|---|
| 1 | observations     | Raw observations from devices |
| 2 | rollups_hour     | Hourly rollups |
| 3 | rollups_day      | Daily rollups |
| 4 | vendor_records   | Device/app metadata |
| 5 | user_profile     | User profile sync (future) |

---

## MST_SyncStatus

| SyncStatusId | SyncStatusCode | Description             |
|---:|---|---|
| 1 | idle        | Not started |
| 2 | inProgress  | Sync running |
| 3 | success     | Completed successfully |
| 4 | failed      | Failed with error |
| 5 | partial     | Completed with gaps |

---

## TRN_UserSyncCheckpoint

| UserSyncCheckpointId | UserId | PlatformId | SyncScopeId | MetricId | LastSyncedAt           | LastSuccessAt          | NextSince              | VendorCursor          | SyncStatusId | ErrorCode | ErrorMessage          | MetaJson                         | UpdatedAt              |
|---:|---:|---:|---:|---:|---|---|---|---|---:|---|---|---|---|
| 81001 | 1001 | 1 | 1 | —   | 2025-09-16T09:10:00Z | 2025-09-16T09:10:00Z | 2025-09-16T09:05:00Z | HK:CURSOR:9f8a        | 3 | —     | —                      | {"rows":4210}                  | 2025-09-16T09:10:01Z |
| 81002 | 1002 | 1 | 1 | —   | 2025-09-15T19:02:00Z | 2025-09-15T19:02:00Z | 2025-09-15T19:00:00Z | HK:CURSOR:7c31        | 3 | —     | —                      | {"rows":980}                   | 2025-09-15T19:02:05Z |
| 81003 | 1003 | 2 | 1 | —   | 2025-09-15T08:05:00Z | —                      | 2025-09-15T08:00:00Z | HC:PAGE:token:aa12    | 5 | GAP   | Device offline         | {"reason":"device offline"}    | 2025-09-15T08:05:10Z |
| 81004 | 1004 | 3 | 4 | —   | 2025-09-14T08:10:00Z | 2025-09-14T08:10:00Z | 2025-09-14T08:00:00Z | FB:CUR:4233           | 3 | —     | —                      | {"devices":1}                  | 2025-09-14T08:10:02Z |
| 81005 | 1005 | 2 | 2 | 101 | 2025-09-16T08:10:00Z | 2025-09-16T08:10:00Z | 2025-09-16T08:00:00Z | HC:ROLLUP:v1:pg=3     | 2 | —     | —                      | {"progress":"70%"}             | 2025-09-16T08:10:03Z |

---

## MST_RollupPeriod

| RollupPeriodId | RollupPeriodCode | Description    |
|---:|---|---|
| 1 | hour  | Hourly buckets |
| 2 | day   | Daily buckets |
| 3 | week  | Weekly buckets |
| 4 | month | Monthly buckets |
| 5 | quarter | Quarterly buckets |

---

## MST_RollupWindow

| RollupWindowId | RollupWindowCode | LengthDays | AnchorPolicyCode | Description      |
|---:|---|---:|---|---|
| 1 | last24h  | 1   | calendar | Last 24 hours (calendar-aligned day) |
| 2 | last7d   | 7   | calendar | Last 7 days (calendar-aligned) |
| 3 | last30d  | 30  | calendar | Last 30 days (calendar-aligned) |
| 4 | last90d  | 90  | calendar | Last 90 days (calendar-aligned) |
| 5 | last365d | 365 | calendar | Last 365 days (calendar-aligned) |


---

## TRN_RollupBucket


| RollupBucketId | UserId | PlatformId | MetricId | UnitId | RollupPeriodId | BucketStart           | BucketEnd             | ValueSum | ValueMin | ValueMax | SampleCount | ComputedAt             |
|---:|---:|---:|---:|---:|---:|---|---|---:|---:|---:|---:|---|
| 82001 | 1001 | 1 | 101 | 3 | 1 | 2025-09-16T09:00:00Z | 2025-09-16T10:00:00Z | 1420 | 0 | 312 | 8 | 2025-09-16T10:02:00Z |
| 82002 | 1001 | 1 | 110 | 5 | 1 | 2025-09-16T12:00:00Z | 2025-09-16T13:00:00Z | 88 | 62 | 132 | 60 | 2025-09-16T13:01:00Z |
| 82003 | 1002 | 1 | 130 | 3 | 2 | 2025-09-15T00:00:00Z | 2025-09-16T00:00:00Z | 22 | 0 | 14 | 6 | 2025-09-16T00:10:00Z |
| 82004 | 1003 | 2 | 120 | 1 | 2 | 2025-09-15T00:00:00Z | 2025-09-16T00:00:00Z | 6850 | 300 | 2100 | 12 | 2025-09-16T00:05:00Z |
| 82005 | 1005 | 2 | 140 | 3 | 2 | 2025-09-16T00:00:00Z | 2025-09-17T00:00:00Z | 420 | 0 | 220 | 3 | 2025-09-17T00:03:00Z |

---

## TRN_RollupWindow

| RollupWindowId | UserId | PlatformId | MetricId | UnitId | WindowId | WindowStart           | WindowEnd             | IsComplete | ValueSum | ValueAvg | ValueMin | ValueMax | SampleCount | SourcePolicyId | ComputedAt             | Version |
|---:|---:|---:|---:|---:|---:|---|---|:--:|---:|---:|---:|---:|---:|---:|---|---:|
| 83001 | 1001 | 1 | 101 | 3 | 2 | 2025-09-09T00:00:00Z | 2025-09-16T00:00:00Z | true  | 9820  | 1402.86 | 800  | 2200 | 7  | 2 | 2025-09-16T10:10:00Z | 1 |
| 83002 | 1002 | 1 | 130 | 3 | 3 | 2025-08-17T00:00:00Z | 2025-09-16T00:00:00Z | true  | 310   | 10.00   | 0    | 14   | 31 | 3 | 2025-09-16T00:20:00Z | 1 |
| 83003 | 1003 | 2 | 120 | 1 | 2 | 2025-09-09T00:00:00Z | 2025-09-16T00:00:00Z | true  | 12900 | 1842.86 | 300  | 2100 | 7  | 2 | 2025-09-16T00:15:00Z | 1 |
| 83004 | 1004 | 3 | 101 | 3 | 4 | 2025-06-18T00:00:00Z | 2025-09-16T00:00:00Z | true  | 125010| 1389.00 | 250  | 3500 | 90 | 1 | 2025-09-16T01:00:00Z | 1 |
| 83005 | 1005 | 2 | 140 | 6 | 1 | 2025-09-15T12:00:00Z | 2025-09-16T12:00:00Z | true  | 600   | 600.00  | 600  | 600  | 1  | 1 | 2025-09-16T12:05:00Z | 1 |



---




## MST_PostingStatus

| PostingStatusId | PostingStatusCode | Description |
|---:|---|---|
| 1 | draft | Visible only to buyer until published |
| 2 | open | Accepting applications |
| 3 | paused | Temporarily not accepting apps |
| 4 | closed | Window ended or quota hit |
| 5 | archived | Read-only record |

---

## MST_ApplicationStatus

| ApplicationStatusId | ApplicationStatusCode | Description |
|---:|---|---|
| 1 | draft | Not submitted yet |
| 2 | submitted | Awaiting review |
| 3 | underReview | Buyer is reviewing |
| 4 | approved | Selected to proceed |
| 5 | rejected | Not selected |

---

## MST_GrantStatus

| GrantStatusId | GrantStatusCode | Description |
|---:|---|---|
| 1 | pendingActivation | Created, not yet active |
| 2 | active | Valid for viewing |
| 3 | expired | Past validity window |
| 4 | revoked | Manually or policy revoked |
| 5 | fulfilled | Uses exhausted |

---

## MST_ViewSessionStatus

| ViewSessionStatusId | ViewSessionStatusCode | Description |
|---:|---|---|
| 1 | active | Token valid & live |
| 2 | expired | TTL or idle timeout reached |
| 3 | revoked | Manually ended / policy breach |
| 4 | blocked | Access denied by gate |
| 5 | idle | Temporarily idle (pre-expiry) |

---

## MST_ViewPolicy

| ViewPolicyId | PolicyCode | TtlSeconds | IdleTimeoutSeconds | MaxRowsPerPage | MaxRowsPerSession | MaxRequestsPerMinute | CanExport | Description |
|---:|---|---:|---:|---:|---:|---:|:--:|---|
| 1 | tight15 | 900 | 120 | 200 | 2000 | 30 | false | Tight limits, no export |
| 2 | standard15 | 900 | 180 | 500 | 5000 | 60 | false | Default viewer policy |
| 3 | analyst15 | 900 | 120 | 1000 | 10000 | 60 | false | Larger pages for analysis |
| 4 | long30 | 1800 | 180 | 500 | 8000 | 45 | false | Longer sessions |
| 5 | kiosk10 | 600 | 90 | 100 | 1000 | 20 | false | Short kiosk sessions |

---

## MST_ConsentVersion

| ConsentVersionId | ConsentCode | Title | EffectiveFrom |
|---:|---|---|---|
| 1 | CONSENT_V1 | Baseline Consent (MVP) | 2025-07-01 |
| 2 | CONSENT_V1_1 | Clarified Data Scope | 2025-08-10 |
| 3 | CONSENT_V2 | Added Heart Rate Clause | 2025-09-01 |
| 4 | CONSENT_V2_1 | EU Language Update | 2025-09-10 |
| 5 | CONSENT_CHILD | Minor/Guardian Consent | 2025-09-15 |

---

## MST_DecisionReason

| DecisionReasonId | DecisionReasonCode | Description |
|---:|---|---|
| 1 | eligibility_failed | Did not meet eligibility rules |
| 2 | quota_full | Posting reached max participants |
| 3 | duplicate | Duplicate application detected |
| 4 | consent_missing | Consent not provided |
| 5 | other | Other reason (see notes) |

---

## MST_ViewEventCode

| ViewEventCodeId | ViewEventCode | Description |
|---:|---|---|
| 1 | start | Session started |
| 2 | page | Page of rows fetched |
| 3 | sort | Sort applied |
| 4 | filter | Filter applied |
| 5 | end | Session ended |

---

## MST_DateWindowPolicy

| DateWindowPolicyId | DateWindowPolicyCode | Description |
|---:|---|---|
| 1 | absolute | Fixed from/to dates |
| 2 | relativeSnapshot | Last N days/weeks at build time |
| 3 | relativeRolling | Rolling window (future option) |
| 4 | snapshot7d | Preset: last 7 days snapshot |
| 5 | policyCustom | Custom policy (admin-defined) |

---

## MST_AccessEventCode

| AccessEventCodeId | AccessEventCode | Description |
|---:|---|---|
| 1 | app_submitted | Application submitted |
| 2 | app_approved | Application approved |
| 3 | grant_activated | Grant activated |
| 4 | session_started | View session started |
| 5 | view_blocked | View request blocked |

---

## TRN_Posting

| PostingId | BuyerId | Title | PostingStatusId | ApplyOpenAt | ApplyCloseAt | TargetParticipants | MaxParticipants | ConsentVersionId | ViewPolicyId | DateWindowPolicyId | FromDate | ToDate | LastNDays |
|---:|---:|---|---:|---|---|---:|---:|---:|---:|---:|---|---|---:|
| 5001 | 2001 | 7-Day Activity Snapshot | 2 | 2025-09-01T00:00:00Z | 2025-09-30T23:59:59Z | 100 | 120 | 3 | 2 | 2 | — | — | 7 |
| 5002 | 2001 | Steps Only (Sep) | 2 | 2025-09-10T00:00:00Z | 2025-09-25T23:59:59Z | 50 | 60 | 2 | 1 | 1 | 2025-09-01 | 2025-09-30 | — |
| 5003 | 2002 | HR Variability Pilot | 3 | 2025-09-05T00:00:00Z | 2025-10-05T23:59:59Z | 30 | 40 | 3 | 1 | 2 | — | — | 14 |
| 5004 | 2002 | Energy & Exercise Minutes (30d) | 1 | — | — | 80 | 100 | 1 | 4 | 2 | — | — | 30 |
| 5005 | 2003 | Floors & Distance Study (Aug–Sep) | 2 | 2025-09-12T00:00:00Z | 2025-10-01T23:59:59Z | 60 | 60 | 2 | 2 | 1 | 2025-08-15 | 2025-09-15 | — |

---

## TRN_PostingMetric

| PostingMetricId | PostingId | MetricId (Code) | UnitId (Code) | MinGranularityCode | Required |
|---:|---:|---|---|---|:--:|
| 60001 | 5001 | 101 (steps) | 10 (count) | day | true |
| 60002 | 5001 | 110 (heartRate) | 50 (beatsPerMin) | hour | true |
| 60003 | 5002 | 101 (steps) | 10 (count) | day | true |
| 60004 | 5004 | 104 (activeEnergy) | 30 (kcal) | day | true |
| 60005 | 5004 | 105 (exerciseMinutes) | 40 (min) | day | true |

---

## TRN_Application

| ApplicationId | PostingId | UserId | ApplicationStatusId | SubmittedAt | DecidedAt | DecidedBy | DecisionReasonId |
|---:|---:|---:|---:|---|---|---:|---:|
| 70001 | 5001 | 1001 | 3 | 2025-09-12T10:05:00Z | — | — | — |
| 70002 | 5001 | 1002 | 4 | 2025-09-12T11:12:00Z | 2025-09-13T09:00:00Z | 2001 | — |
| 70003 | 5002 | 1003 | 2 | 2025-09-14T08:30:00Z | — | — | — |
| 70004 | 5003 | 1004 | 5 | 2025-09-15T13:44:00Z | 2025-09-15T16:20:00Z | 2002 | 1 |
| 70005 | 5005 | 1005 | 4 | 2025-09-16T09:50:00Z | 2025-09-16T12:10:00Z | 2003 | — |

---

## TRN_ConsentGrant

| ConsentGrantId | ApplicationId | ConsentVersionId | ConsentGivenAt | ConsentRevokedAt | ConsentValidFrom | ConsentValidUntil | EffectiveStateCode |
|---:|---:|---:|---|---|---|---|---|
| 71001 | 70001 | 3 | 2025-09-12T10:06:00Z | — | 2025-09-12 | 2026-09-12 | active |
| 71002 | 70002 | 3 | 2025-09-12T11:13:00Z | — | 2025-09-12 | 2025-12-31 | active |
| 71003 | 70003 | 2 | 2025-09-14T08:31:00Z | — | 2025-09-14 | 2026-09-14 | active |
| 71004 | 70004 | 3 | 2025-09-15T13:45:00Z | 2025-09-15T15:00:00Z | 2025-09-15 | 2026-09-15 | revoked |
| 71005 | 70005 | 2 | 2025-09-16T09:51:00Z | — | 2025-09-16 | 2026-09-16 | active |

---

## TRN_DataGrant

| DataGrantId | ApplicationId | PostingId | UserId | GrantStatusId | WindowFrozen (Summary) | ValidFrom | ValidUntil | MaxUses | UseCount |
|---:|---:|---:|---:|---:|---|---|---|---:|---:|
| 72001 | 70002 | 5001 | 1002 | 2 | 2025-09-06 → 2025-09-13 | 2025-09-13T09:15:00Z | 2025-09-20T09:15:00Z | 20 | 3 |
| 72002 | 70005 | 5005 | 1005 | 2 | 2025-08-15 → 2025-09-15 | 2025-09-16T12:15:00Z | 2025-09-23T12:15:00Z | 10 | 1 |
| 72003 | 70001 | 5001 | 1001 | 1 | 2025-09-06 → 2025-09-13 | — | — | 10 | 0 |
| 72004 | 70003 | 5002 | 1003 | 3 | 2025-09-01 → 2025-09-30 | 2025-09-14T08:32:00Z | 2025-09-15T08:32:00Z | 5 | 2 |
| 72005 | 70004 | 5003 | 1004 | 4 | 2025-09-01 → 2025-09-14 | 2025-09-15T16:25:00Z | 2025-09-20T16:25:00Z | 5 | 1 |

---

## TRN_ViewSession

| ViewSessionId | DataGrantId | BuyerId | ViewSessionStatusId | PolicyId | IssuedAt | ExpiresAt | LastSeenAt | RequestCount | RowsReturnedTotal |
|---:|---:|---:|---:|---:|---|---|---|---:|---:|
| 73001 | 72001 | 2001 | 1 | 2 | 2025-09-16T10:00:00Z | 2025-09-16T10:15:00Z | 2025-09-16T10:05:00Z | 8 | 1600 |
| 73002 | 72001 | 2001 | 2 | 2 | 2025-09-15T09:00:00Z | 2025-09-15T09:15:00Z | 2025-09-15T09:16:00Z | 12 | 2400 |
| 73003 | 72002 | 2003 | 1 | 1 | 2025-09-16T12:20:00Z | 2025-09-16T12:35:00Z | 2025-09-16T12:28:00Z | 4 | 600 |
| 73004 | 72003 | 2001 | 4 | 1 | 2025-09-16T11:00:00Z | 2025-09-16T11:15:00Z | 2025-09-16T11:00:00Z | 1 | 0 |
| 73005 | 72005 | 2002 | 3 | 1 | 2025-09-15T16:40:00Z | 2025-09-15T16:55:00Z | 2025-09-15T16:45:00Z | 2 | 120 |

---

## TRN_ViewEvent

| ViewEventId | ViewSessionId | When | ViewEventCodeId | MetaJson (Summary) |
|---:|---:|---|---:|---|
| 74001 | 73001 | 2025-09-16T10:00:02Z | 1 | columns: metricCode,startTime,valueNum |
| 74002 | 73001 | 2025-09-16T10:03:10Z | 4 | filter: metricCode=steps |
| 74003 | 73001 | 2025-09-16T10:04:12Z | 2 | page: cursor=abc, pageSize=200 |
| 74004 | 73003 | 2025-09-16T12:22:00Z | 3 | sort: startTime=asc |
| 74005 | 73004 | 2025-09-16T11:00:05Z | 5 | end: blocked reason=grantNotActive |

---

## TRN_VisibilityFlag

| VisibilityId | DataGrantId | IsAccessible | ComputedAt | ReasonCode |
|---:|---:|:--:|---|---|
| 75001 | 72001 | true | 2025-09-16T10:00:00Z | ok |
| 75002 | 72002 | true | 2025-09-16T12:19:00Z | ok |
| 75003 | 72003 | false | 2025-09-16T11:01:00Z | pendingActivation |
| 75004 | 72004 | false | 2025-09-15T08:33:00Z | expired |
| 75005 | 72005 | false | 2025-09-15T16:26:00Z | revoked |

---

## TRN_AccessLog

| AccessLogId | When | WhoUserId | AccessEventCodeId | TargetKind | TargetId | ResultCode | ErrorCode | MetaJson (Summary) |
|---:|---|---:|---:|---|---:|---|---|---|
| 76001 | 2025-09-12T10:05:10Z | 1001 | 1 | application | 70001 | ok | — | submit via portal |
| 76002 | 2025-09-13T09:00:05Z | 2001 | 2 | application | 70002 | ok | — | approved by buyer |
| 76003 | 2025-09-13T09:15:01Z | 2001 | 3 | dataGrant | 72001 | ok | — | activation window set |
| 76004 | 2025-09-16T10:00:01Z | 2001 | 4 | viewSession | 73001 | ok | — | session start |
| 76005 | 2025-09-16T11:00:05Z | 2001 | 5 | viewSession | 73004 | error | POLICY | blocked: grant not active |
