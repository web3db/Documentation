#  DATABASE.md — Health Data Platform (HealthKit + Health Connect)

This doc summarizes database designed for storing **auto-recorded** health data from **Apple HealthKit** and **Google Health Connect**, with **rollups** for fast reads and **checkpoints** for the 3-hour freshness rule.

---

## MST_User

| UserId | ClerkId      | Email               | FirstName | LastName | BirthYear | DateOfBirth | RaceId | SexId | Height | HeightUnitId | Weight | WeightUnitId | MeasurementSystemId | RoleId |
|---:|---|---|---|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1001 | user_01_abc | user1@example.com | John      | Doe      | 1994 | 1994-05-12  | 1 | 1 | 168.0 | 2 | 62.0  | 4 | 1 | 1 |
| 1002 | user_02_def | user2@example.com | Jane      | Smith    | 1988 | 1988-11-03  | 2 | 2 | 180.0 | 2 | 78.5  | 4 | 1 | 2 |
| 1003 | user_03_ghi | user3@example.com | Alex      | Johnson  | 1999 | 1999-02-20  | 3 | 3 | 172.0 | 2 | 68.0  | 4 | 1 | 1 |
| 1004 | user_04_jkl | user4@example.com | Maria     | Garcia   | 1992 | 1992-07-28  | 5 | 4 | 70.0  | 1 | 155.0 | 3 | 2 | 1 |
| 1005 | user_05_mno | user5@example.com | Liam      | Brown    | 2001 | 2001-12-15  | 1 | 1 | 165.0 | 2 | 55.0  | 4 | 1 | 1 |


> HeightUnitId: 2=cm, 1=in; WeightUnitId: 4=kg, 3=lb. MeasurementSystemId: 1=metric, 2=imperial. RoleId: see MST_Role.

---

## MST_Race

| RaceId | RaceCode     | Description              |
|---:|---|---|
| 1 | asian          | Asian |
| 2 | black or african american        | Black or African American |
| 3 | hispanic     | Hispanic |
| 4 | white       | White |
| 5 | preferNotSay  | Prefer not to say |

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

## MST_SourcePolicy 

| SourcePolicyId | PolicyCode       | Description                                 | PolicyJson                                                                                         | IsActive | IsModified |
|---:|---|---|---|:--:|:--:|
| 1 | default            | No explicit preference; accept any source            | {"order":["any"]}                                                                                  | true | false |
| 2 | preferWatch        | Prefer smartwatch data; fall back to phone/app       | {"preferVendorTypes":["watch"],"fallbackVendorTypes":["phone","app"]}                              | true | false |
| 3 | preferPhone        | Prefer phone sensor data; fall back to watch/app     | {"preferVendorTypes":["phone"],"fallbackVendorTypes":["watch","app"]}                              | true | false |
| 4 | preferFirstParty   | Prefer first-party health apps for each platform     | {"preferApps":["com.apple.health","com.google.android.apps.healthdata","com.fitbit.FitbitMobile"]} | true | false |
| 5 | dedupeWindow5m     | Merge overlapping/near-duplicate intervals < 5 mins  | {"dedupeWindowSeconds":300,"mergeOverlaps":true}                                                   | true | false |




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
| 76005 | 2025-09-16T11:00:05Z | 2001 | 5 | viewSession | 73004 | 
error | POLICY | blocked: grant not active |





## Table Glossary


## Master tables

| Table                      | What it stores / Why it exists                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MST\_User**              | Canonical user profile and demographics (auth linkage, DoB/BirthYear, height/weight + units, measurement system, role). Source of truth for a person in the system. |
| **MST\_Race**              | Enumerated list of race codes/labels for self-reported demographics referenced by `MST_User`.                                                                       |
| **MST\_Role**              | RBAC roles (`user`, `buyer`, `admin`) assigned to users for authorization.                                                                                          |
| **MST\_MeasurementSystem** | Enumeration of measurement systems (metric, imperial, etc.) to interpret height/weight and other measurements.                                                      |
| **MST\_Sex**               | Enumerated sex-at-birth values referenced by `MST_User`.                                                                                                            |
| **MST\_Platform**          | Data platforms (Apple HealthKit, Android Health Connect, Fitbit, Manual, etc.) used to tag provenance of records.                                                   |
| **MST\_Metric**            | Catalog of health metrics (steps, heartRate, distance, etc.) with default unit, value-kind, cumulative flag. Normalizes metric taxonomy across platforms.           |
| **MST\_Unit**              | Catalog of measurement units (count, meter, kcal, bpm, minute, …) with UCUM codes; referenced by metrics/observations/rollups.                                      |
| **MST\_VendorType**        | Device/app category taxonomy (phone, watch, band, scale, app) used in vendor provenance.                                                                            |
| **MST\_ValueKind**         | How a metric’s value should be interpreted (`quantity`, `sample`, `interval`, `category`, `boolean`). Drives validation/aggregation.                                |
| **MST\_SyncScope**         | Enumerates sync “domains” (observations, hourly rollups, daily rollups, vendor records, etc.) for checkpoints.                                                      |
| **MST\_SyncStatus**        | Standard set of sync states (`idle`, `inProgress`, `success`, `failed`, `partial`) used by checkpoints.                                                             |
| **MST\_PostingStatus**     | Lifecycle states for buyer postings (`draft`, `open`, `paused`, `closed`, `archived`).                                                                              |
| **MST\_ApplicationStatus** | Lifecycle states for applications (`draft`, `submitted`, `underReview`, `approved`, `rejected`, …).                                                                 |
| **MST\_GrantStatus**       | Data grant states (`pendingActivation`, `active`, `expired`, `revoked`, `fulfilled`).                                                                               |
| **MST\_ViewSessionStatus** | Viewer session states (`active`, `expired`, `revoked`, `blocked`, `idle`).                                                                                          |
| **MST\_RollUpPeriod**      | Fixed bucket periods for aggregation (`hour`, `day`, `week`, `month`, `quarter`).                                                                                   |
| **MST\_SourceApp**         | Known source apps per platform with bundle/package IDs (“com.apple.health”, etc.). Supports provenance and source preferences.                                      |
| **MST\_SourcePolicy**      | JSON-configured source selection/dedup policies (prefer watch vs phone, dedupe windows). Stored once and referenced by rollups.                                     |
| **MST\_ViewPolicy**        | Viewing limits (TTL, idle timeout, page/session row caps, export flag) applied to buyer data-view sessions.                                                         |
| **MST\_ConsentVersion**    | Versioned consent documents/labels and effective dates. Used to stamp applications/grants with exact consent text.                                                  |
| **MST\_DecisionReason**    | Coded reasons for application decisions (eligibility failed, quota full, duplicate, etc.).                                                                          |
| **MST\_ViewEventCode**     | Event codes used when logging actions within a view session (start, page, sort, filter, end…).                                                                      |
| **MST\_RollupWindow**      | Predefined sliding windows (`last24h`, `last7d`, `last30d`, …) referenced by window-level rollups.                                                                  |
| **MST\_DateWindowPolicy**  | How postings define their data window (absolute from/to dates vs relative last N days).                                                                             |
| **MST\_AccessEventCode**   | High-level audit event codes across lifecycle (app submitted/approved, grant activated, session started, blocked, etc.).                                            |

## Transaction Table

| Table                       | What it stores / Why it exists                                                                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TRN\_VendorRecord**       | Per-user, per-device/app provenance record (platform, device model, OS/app version, bundle/package, metadata). Links raw data to its origin.         |
| **TRN\_Observation**        | Raw health data rows (metric, unit, start/end, value) ingested from HealthKit/Health Connect, with vendor provenance. Source of truth for analytics. |
| **TRN\_UserSyncCheckpoint** | Per-user/per-platform/per-scope (optionally per-metric) markers: last sync times, vendor cursors, status, error info. Powers 3-hour freshness logic. |
| **TRN\_RollupBucket**       | Aggregated values per fixed period bucket (e.g., hourly/daily totals/min/max/avg/sampleCount) for fast dashboards and charts.                        |
| **TRN\_RollUpWindow**       | Aggregated values over predefined sliding windows (e.g., last7d/30d/90d) with the policy/version used to compute them.                               |
| **TRN\_Posting**            | Buyer “job/study” post: title/description, status, apply window, participant caps, consent version, view policy, and date window rules.              |
| **TRN\_PostingMetric**      | Child list of metrics/units a posting requests, including minimum granularity and whether each metric is required.                                   |
| **TRN\_Application**        | A user’s application to a posting: status timeline, decision info, and profile/coverage snapshots at submission time.                                |
| **TRN\_ConsentGrant**       | Record of user consent tied to an application: given/revoked timestamps, validity dates, scope hash, effective state.                                |
| **TRN\_DataGrant**          | The enforceable permission for a buyer to view a user’s data: frozen metrics/units, frozen date window, validity, usage quota, activation state.     |
| **TRN\_ViewSession**        | An issued, time-bound viewing session under a grant: policy applied, token hash, expiry/idle tracking, usage counters, client info.                  |
| **TRN\_ViewEvent**          | Fine-grained activity within a view session (start/page/sort/filter/end) with metadata for auditing/analytics.                                       |
| **TRN\_VisibilityFlag**     | Cached/computed “is this grant currently accessible?” decision with reason (ok, pendingActivation, expired, revoked).                                |
| **TRN\_AccessLog**          | System-wide audit log of key lifecycle/access events (who/when/what, result/error, target object, client info).                                      |




## Field Glossary — Web3 Health

## Shared Audit Fields (used on most masters)

-  IsActive — Row enabled/disabled (soft state for delete).

-  IsModified — True if manually edited after creation.

-  CreatedBy / CreatedOn — Who/when the row was created.

-  ModifiedBy / ModifiedOn — Who/when the row was last updated.

## MST_User

MST_User 

- UserId — Primary key (auto incremental).

- ClerkId — External id from Clerk auth.

- Email — Login email (unique per active user).

- FirstName / LastName — User names.

- BirthYear — Four-digit birth year (fallback for age).

- DateOfBirth — Full DoB (YYYY-MM-DD).

- RaceId — FK → MST_Race.RaceId (self-reported race).

- SexId — FK → MST_Sex.SexId (sex assigned at birth).

- HeightNum — Height numeric value.

- HeightUnitId — FK → MST_Unit.UnitId (e.g., cm/in).

- WeightNum — Weight numeric value.

- WeightUnitId — FK → MST_Unit.UnitId (e.g., kg/lb).

- MeasurementSystemId — FK → MST_MeasurementSystem.MeasurementSystemId (metric/imperial).

- IsActive / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_Race

- RaceId — Primary key.

- RaceCode — Stable code (e.g., asian, black, white, mixed, other, preferNotSay).

- DisplayName — Human-readable label.

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_Role

-  RoleId — Primary key.

-  RoleCode — user, buyer, admin.

-  DisplayName — Label for UI.

-  Description — Role summary.

-  IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_MeasurementSystem

- MeasurementSystemId — Primary key.

- MeasurementSystemCode — metric, imperial, etc.

- DisplayName — Human label.

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_Sex

- SexId — Primary key.

- SexCode — male, female, intersex, unknown, preferNotSay.

- DisplayName — Human label.

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_Platform

- PlatformId — Primary key.

- PlatformCode — healthkit, healthConnect, fitbit, manual, etc.

- Description — Platform summary.

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_Metric

- MetricId — Primary key.

- MetricCode — Stable code (steps, heartRate, distanceWalkingRunning, etc.).

- DisplayName — Human label.

- DefaultUnitId — FK → MST_Unit.UnitId (canonical unit).

- ValueKindId — FK → MST_ValueKind.ValueKindId (quantity, sample, interval, category, boolean).

- IsCumulative — true if values are running totals that need differencing.

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_Unit

- UnitId — Primary key.

- UnitCode — count, meter, kilocalorie, beatsPerMin, minute, etc.

- DisplayName — Human label.

- UcumCode — Standard UCUM code (e.g., m, kg, kcal, 1/min).

- Type — Dimension (length, mass, count, duration, rate).

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_VendorType

- VendorTypeId — Primary key.

- VendorTypeCode — phone, watch, band, scale, app.

- Description — Device/app category.

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_ValueKind

- ValueKindId — Primary key.

- ValueKindCode — quantity, sample, interval, category, boolean.

- Description — How to interpret metric values.

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_SyncScope

- SyncScopeId — Primary key.

- SyncScopeCode — observations, rollups_hour, rollups_day, vendor_records, etc.

- Description — What’s synced in this scope.

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_SyncStatus

- SyncStatusId — Primary key.

- SyncStatusCode — idle, inProgress, success, failed, partial.

- Description — Sync outcome meaning.

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_PostingStatus

- PostingStatusId — Primary key.

- PostingStatusCode — draft, open, paused, closed, archived.

- Description — Posting lifecycle state.

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_ApplicationStatus

- ApplicationStatusId — Primary key.

- ApplicationStatusCode — draft, submitted, underReview, approved, rejected, etc.

- Description — Application lifecycle state.

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_GrantStatus

- GrantStatusId — Primary key.

- GrantStatusCode — pendingActivation, active, expired, revoked, fulfilled.

- Description — Data grant lifecycle state.

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_ViewSessionStatus

- ViewSessionStatusId — Primary key.

- ViewSessionStatusCode — active, expired, revoked, blocked, idle.

- Description — Viewer session state.

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_RollUpPeriod

- RollUpPeriodId — Primary key.

- RollUpPeriodCode — hour, day, week, month, quarter.

- Description — Bucket period meaning.

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_SourceApp

- SourceAppId — Primary key.

- PlatformId — FK → MST_Platform.PlatformId.

- AppIdentifier — Bundle/package id (e.g., com.apple.health).

- DisplayName — Human label.

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_SourcePolicy

- SourcePolicyId — Primary key.

- PolicyCode — e.g., default, preferWatch, preferPhone, etc.

- Description — Human summary.

- PolicyJson — JSON policy (preferred vendor types/apps, dedupe rules, etc.).

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_ViewPolicy

- ViewPolicyId — Primary key.

- PolicyCode — e.g., standard15, tight15.

- Description — Human summary.

- TtlSeconds — Token time-to-live.

- IdleTimeoutSeconds — Idle timeout before expiry.

- MaxRowsPerPage / MaxRowsPerSession — Row caps.

- MaxRequestsPerMinute — API throttle.

- CanExport — Whether CSV export is allowed.

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_ConsentVersion

- ConsentVersionId — Primary key.

- ConsentCode — Version code (e.g., CONSENT_V2).

- Description — Title/summary.

- EffectiveFrom / RetiredOn — Lifecycle dates.

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_DecisionReason

- DecisionReasonId — Primary key.

- DecisionReasonCode — eligibility_failed, quota_full, duplicate, etc.

- Description — Human summary.

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_ViewEventCode

- ViewEventCodeId — Primary key.

- ViewEventCode — start, page, sort, filter, end, etc.

- Description — Event meaning for UI/analytics.

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_RollupWindow

- RollupWindowId — Primary key.

- RollupWindowCode — last24h, last7d, last30d, etc.

- LengthDays — Days spanned by the window.

- Description — Human label.

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_DateWindowPolicy

- DateWindowPolicyId — Primary key.

- DateWindowPolicyCode — absolute, relativeSnapshot, etc.

- Description — How postings interpret date windows.

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## MST_AccessEventCode

- AccessEventCodeId — Primary key.

- AccessEventCode — app_submitted, grant_activated, session_started, etc.

- Description — Meaning in audit logs.

- IsActive / IsModified / CreatedBy / CreatedOn / ModifiedBy / ModifiedOn — Audit.

## TRN_VendorRecord

- VendorRecordId — Vendor’s stable id (often alphanumeric; store as text if needed).

- UserId — FK → MST_User.UserId (data owner).

- PlatformId — FK → MST_Platform.PlatformId.

- VendorTypeId — FK → MST_VendorType.VendorTypeId.

- SourceAppId — FK → MST_SourceApp.SourceAppId.

- BundleorPackage — App bundle/package id (e.g., com.apple.health).

- DeviceName — Human device/app name.

- DeviceModel — Model code (e.g., iPhone15,2, SM-R960).

- OsVersion — OS/firmware version.

- AppVersion — App version of the writer.

- IsDeleted — Soft delete flag.

- MetaJson — Extra attributes (JSON).

- IngestedAt — First time this vendor record was seen.

## TRN_Observation

- ObservationId — Primary key, auto-increment.

- UserId — FK → MST_User.UserId.

- PlatformId — FK → MST_Platform.PlatformId.

- MetricId — FK → MST_Metric.MetricId.

- UnitId — FK → MST_Unit.UnitId (unit for Value).

- StartTime — Interval start (or sample time).

- EndTIme (sic; intended EndTime) — Interval end (NULL for samples).

- Value — Numeric value (count, distance, kcal, BPM, etc.).

- VendorRecordId — FK → TRN_VendorRecord.VendorRecordId (provenance).

- IsDeleted — Soft delete flag.

- MetaJson — Extra attributes (JSON).

- IngestedAt — Ingestion timestamp.

## TRN_UserSyncCheckpoint

- CheckPointId — Primary key.

- UserId — FK → MST_User.UserId.

- PlatformId — FK → MST_Platform.PlatformId.

- SyncScopeId — FK → MST_SyncScope.SyncScopeId (what is being synced).

- MetricId — FK → MST_Metric.MetricId (nullable; scope-wide if NULL).

- LastSyncedAt — Last attempt (success or failure).

- LastSuccessAt — Last successful completion.

- VendorCursur (sic; intended VendorCursor) — Opaque vendor paging token.

- SyncStatusId — FK → MST_SyncStatus.SyncStatusId.

- ErrorCode — Short machine error code (if any).

- Errormessage — Human-readable error message.

- UpdateAt — Row last updated timestamp.

## TRN_RollUpWindow

- RollUpId — Primary key.

- UserId — FK → MST_User.UserId.

- MetricId — FK → MST_Metric.MetricId.

- UnitId — FK → MST_Unit.UnitId.

- WindowId — FK → MST_RollupWindow.RollupWindowId (e.g., last7d).

- WindowStart / WindowEnd — Time window boundaries (inclusive/exclusive).

- IsComplete — true when the window has been fully computed.

- ValueSum / ValueAvg / ValueMin / ValueMax — Aggregates over the window.

- SampleCount — Number of contributing observations/samples.

- SourcePolicyId — FK → MST_SourcePolicy.SourcePolicyId (source selection & dedupe policy used).

- ComputedAt — When the window was computed.

- Version — Computation logic/schema version.

## TRN_RollupBucket

- RollupBucketId — Primary key.

- UserId — FK → MST_User.UserId.

- MetricId — FK → MST_Metric.MetricId.

- UnitId — FK → MST_Unit.UnitId.

- RollupPeriodId — FK → MST_RollUpPeriod.RollUpPeriodId (hour/day/week/etc.).

- BucketStart — Start of the bucket (period boundary).

- IsComplete — Finalized flag for the bucket.

- ValueSum / ValueAvg / ValueMin / ValueMax — Aggregates per bucket.

- SampleCount — Observations in this bucket.

- SourcePolicyId — FK → MST_SourcePolicy.SourcePolicyId.

- ComputedAt — When this bucket was computed.

- Version — Computation logic/schema version.

## TRN_Posting

- PostingId — Primary key.

- BuyerId — FK → MST_User.UserId (posting owner).

- Title / Summary / Description — Posting content.

- PostingStatusId — FK → MST_PostingStatus.PostingStatusId.

- ApplyOpenAt / ApplyCloseAt — Application window.

- TargetParticipants / MaxParticipants — Recruiting targets and caps.

- AutoCloseWhenFull — Auto-close when max is reached.

- ConsentVersionId — FK → MST_ConsentVersion.ConsentVersionId.

- ViewPolicyId — FK → MST_ViewPolicy.ViewPolicyId.

- DateWindowPolicyId — FK → MST_DateWindowPolicy.DateWindowPolicyId.

- FromDate / ToDate — Absolute window (if policy requires).

- LastNDays — Relative window length (if policy requires).

- EligibilityJson — Eligibility rules (JSON).

## TRN_PostingMetric

- PostingMetricId — Primary key.

- PostingId — FK → TRN_Posting.PostingId.

- MetricId — FK → MST_Metric.MetricId.

- UnitId — FK → MST_Unit.UnitId (optional override).

- MinGranularityCode — Minimum granularity required (hour/day).

- Required — Whether metric is required for approval.

- CreatedAt — Row creation timestamp.

## TRN_Application

- ApplicationId — Primary key.

- PostingId — FK → TRN_Posting.PostingId.

- UserId — FK → MST_User.UserId.

- ApplicationStatusId — FK → MST_ApplicationStatus.ApplicationStatusId.

- RollupPeriodId — FK → MST_RollUpPeriod.RollUpPeriodId (optional min granularity request).

- SubmittedAt / DecidedAt — Application lifecycle timestamps.

- DecidedBy — FK → MST_User.UserId (buyer/admin who decided).

- DecisionReasonId — FK → MST_DecisionReason.DecisionReasonId (optional).

- ProfileSnapshotJson — Snapshot of user profile at submission (JSON).

- CoveragePreviewJson — Estimated data coverage for the posting window (JSON).

## TRN_ConsentGrant

- ConsentGrantId — Primary key.

- ApplicationId — FK → TRN_Application.ApplicationId.

- ConsentVersionId — FK → MST_ConsentVersion.ConsentVersionId.

- ConsentGivenAt / ConsentRevokedAt — Consent action timestamps.

- ConsentValidFrom / ConsentValidUntil — Consent validity dates.

- ConsentScopeHash — Hash of consent scope (proof/idempotency).

- EffectiveStateCode — active / revoked / expired.

- CreatedAt / ModifiedAt — Timestamps.

## TRN_DataGrant

- DataGrantId — Primary key.

- ApplicationId — FK → TRN_Application.ApplicationId.

- PostingId — FK → TRN_Posting.PostingId.

- UserId — FK → MST_User.UserId (data owner).

- GrantStatusId — FK → MST_GrantStatus.GrantStatusId.

- MetricsFrozenJson — Frozen list of metrics/units granted (JSON).

- WindowFrozenJson — Frozen date window (JSON).

- ValidFrom / ValidUntil — Grant validity (DateTime).

- MaxUses / UseCount — Usage quota and current usage.

- ActivationTokenHash — Optional activation token (hashed).

- ActivatedAt / RevokedAt / CreatedAt / ModifiedAt — Lifecycle timestamps.

## TRN_ViewSession

- ViewSessionId — Primary key.

- DataGrantId — FK → TRN_DataGrant.DataGrantId.

- PostingId — FK → TRN_Posting.PostingId (redundant but speeds joins).

- BuyerId — FK → MST_User.UserId (viewer).

- ViewSessionStatusId — FK → MST_ViewSessionStatus.ViewSessionStatusId.

- PolicyId — FK → MST_ViewPolicy.ViewPolicyId.

- IssuedAt / ExpiresAt / LastSeenAt — Token lifecycle timestamps.

- IpAddress / userAgent — Client info snapshot.

- RequestCount / RowsReturnedTotal — Usage counters.

- ViewTokenHash — Hashed viewer token.

- CreatedAt / ModifiedAt — Timestamps.

## TRN_ViewEvent

- ViewEventId — Primary key.

- ViewSessionId — FK → TRN_ViewSession.ViewSessionId.

- When — Event timestamp.

- ViewEventCodeId — FK → MST_ViewEventCode.ViewEventCodeId.

- MetaJson — Event metadata (JSON).

- IpAddress / UserAgent — Client info snapshot.

- CreatedAt / ModifiedAt — Timestamps.

## TRN_VisibilityFlag

- VisibilityId — Primary key.

- DataGrantId — FK → TRN_DataGrant.DataGrantId.

- IsAccessible — Current access decision (computed).

- ComputedAt — When it was computed.

- ReasonCode — Short reason (ok, pendingActivation, expired, revoked, etc.).

- Notes — Optional human note.

## TRN_AccessLog

- AccessLogId — Primary key.

- UserId — FK → MST_User.UserId (actor; may be NULL for system).

- When — Event timestamp.

- AccessEventCodeId — FK → MST_AccessEventCode.AccessEventCodeId.

- TargetKind — Target object kind (posting, application, dataGrant, viewSession).

- TargetId — Id of the target object.

- IpAddress / UserAgent — Client info snapshot.

- ResultCode — ok or error.

- ErrorCode — Optional machine code for failures.

- MetaJson — Extra context (JSON).