# Decentralization (IPFS) Implementation Notes

This document provides the **database table context** and **API surface** needed to implement decentralized storage of share-session data currently stored in Postgres. The initial implementation scope is limited to:

- `TRN_ShareSession`
- `TRN_ShareSegment`
- `TRN_SegmentMetric`

> Note: These tables reference several master tables (users, postings, metrics, status). Those master tables remain centralized and are documented here only as dependencies needed for correct joins and validation.

---

## Code location

- **Edge Functions (production):** See the repository’s `API/code` folder for the deployed Edge Function implementations (including current versions for reference).
- **FastAPI (alternative implementation):** A lightly tested FastAPI version exists on the `api-refactoring` branch: https://github.com/web3db/web3_health_uga_backend/tree/api-refactoring



## Table of contents

- [1) Tables in scope](#1-tables-in-scope)
  - [1.1 TRN_ShareSession](#11-trn_sharesession)
  - [1.2 TRN_ShareSegment](#12-trn_sharesegment)
  - [1.3 TRN_SegmentMetric](#13-trn_segmentmetric)
- [2) Dependency tables (centralized)](#2-dependency-tables-centralized)
  - [2.1 MST_ShareSessionStatus](#21-mst_sharesessionstatus)
  - [2.2 TRN_Posting](#22-trn_posting)
  - [2.3 MST_User](#23-mst_user)
  - [2.4 MST_Metric](#24-mst_metric)
- [3) Relationship map (FK graph)](#3-relationship-map-fk-graph)
- [4) Example records in tables](#4-example-records-in-tables)
  - [4.1 TRN_ShareSession (example)](#41-trn_sharesession-example)
  - [4.2 TRN_ShareSegment (example)](#42-trn_sharesegment-example)
  - [4.3 TRN_SegmentMetric (example)](#43-trn_segmentmetric-example)
- [5) Edge Function: user_start_share_session](#5-edge-function-user_start_share_session)
- [6) Edge Function: user_submit_segment](#6-edge-function-user_submit_segment)
- [7) Edge Function: user_cancel_share_session](#7-edge-function-user_cancel_share_session)
- [8) Edge Function: buyer_get_posting_shares](#8-edge-function-buyer_get_posting_shares)
- [9) Supporting share-session query functions (overview)](#9-supporting-share-session-query-functions-overview)
  - [9.1 share_get_session_snapshot](#91-share_get_session_snapshot)
  - [9.2 user_get_session_by_posting](#92-user_get_session_by_posting)
  - [9.3 user_active-share-sessions](#93-user_active-share-sessions)
- [10) Edge Function: share_get_session_snapshot](#10-edge-function-share_get_session_snapshot)
- [11) Edge Function: user_get_session_by_posting](#11-edge-function-user_get_session_by_posting)
- [12) Edge Function: user_active-share-sessions](#12-edge-function-user_active-share-sessions)



## 1) Tables in scope

### 1.1 `TRN_ShareSession`

**Purpose**  
Represents a user’s sharing session for a specific posting, including lifecycle status and progress counters.

**Primary Key**
- `SessionId` (bigint)

**Schema**
| Column | Type | Nullable | Default / Notes |
|---|---|---:|---|
| SessionId | bigint | no | PK |
| PostingId | integer | no | FK → `TRN_Posting.PostingId` |
| UserId | integer | no | FK → `MST_User.UserId` |
| JoinTimeLocal | timestamptz | no | local join time |
| JoinTimezone | text | no | timezone name (example: `America/New_York`) |
| CycleAnchorUtc | timestamptz | no | UTC cycle anchor |
| SegmentsExpected | integer | no | CHECK `>= 1` |
| SegmentsSent | integer | no | default `0`, CHECK `>= 0` |
| StatusId | integer | no | FK → `MST_ShareSessionStatus.StatusId` |
| PermissionGranted | boolean | no | default `true` |
| LastClientHint | text | yes | optional client hint |
| CreatedOn | timestamptz | no | default `now()` |
| ModifiedOn | timestamptz | no | default `now()` |

**Foreign Keys**
- `PostingId` → `TRN_Posting.PostingId`
- `UserId` → `MST_User.UserId`
- `StatusId` → `MST_ShareSessionStatus.StatusId`

**Used by Edge Functions**
- `user_start_share_session` (insert session + ACTIVE status)
- `user_submit_segment` (read session; update `SegmentsSent`; optionally set COMPLETED)
- `user_cancel_share_session` (update status to CANCELLED)
- `buyer_get_posting_shares` (read sessions for posting)

---

### 1.2 `TRN_ShareSegment`

**Purpose**  
Represents one day or time window (“segment”) within a share session.

**Primary Key**
- `SegmentId` (bigint)

**Schema**
| Column | Type | Nullable | Default / Notes |
|---|---|---:|---|
| SegmentId | bigint | no | PK |
| SessionId | bigint | no | FK → `TRN_ShareSession.SessionId` |
| PostingId | integer | no | FK → `TRN_Posting.PostingId` |
| UserId | integer | no | FK → `MST_User.UserId` |
| DayIndex | integer | no | day offset within the session (Day-0 allowed) |
| FromUtc | timestamptz | no | segment start (UTC) |
| ToUtc | timestamptz | no | segment end (UTC) |
| HasData | boolean | no | default `true` |
| CreatedOn | timestamptz | no | default `now()` |

**Foreign Keys**
- `SessionId` → `TRN_ShareSession.SessionId`
- `PostingId` → `TRN_Posting.PostingId`
- `UserId` → `MST_User.UserId`

**Current duplicate protection (as implemented in `user_submit_segment`)**
- Prevents duplicate segment by `(SessionId, DayIndex)`
- Prevents duplicate segment by `(SessionId, FromUtc, ToUtc)`

> These are enforced in application logic today. If you add DB unique constraints later, document them here.

**Used by Edge Functions**
- `user_submit_segment` (insert segment)
- `buyer_get_posting_shares` (read segments by sessionIds)

---

### 1.3 `TRN_SegmentMetric`

**Purpose**  
Stores aggregated metric values for a given segment (plus JSON payload).

**Primary Key**
- `SegmentMetricId` (bigint)

**Schema**
| Column | Type | Nullable | Default / Notes |
|---|---|---:|---|
| SegmentMetricId | bigint | no | PK |
| SegmentId | bigint | no | FK → `TRN_ShareSegment.SegmentId` |
| MetricId | integer | no | FK → `MST_Metric.MetricId` |
| UnitCode | text | no | unit code string (example: `count`) |
| TotalValue | numeric | yes | aggregate total |
| AvgValue | numeric | yes | aggregate average |
| MinValue | numeric | yes | aggregate min |
| MaxValue | numeric | yes | aggregate max |
| SamplesCount | integer | yes | number of samples |
| ComputedJson | jsonb | yes | computed/derived payload (JSONB) |
| CreatedOn | timestamptz | no | default `now()` |

**Foreign Keys**
- `SegmentId` → `TRN_ShareSegment.SegmentId`
- `MetricId` → `MST_Metric.MetricId`

**Used by Edge Functions**
- `user_submit_segment` (insert metric rows for created segment)
- `buyer_get_posting_shares` (read metric rows by segmentIds)

---

## 2) Dependency tables (centralized)

These tables are referenced by the current Edge Function implementations for lookup and enrichment. They are not part of the decentralization storage scope, but implementers must keep these joins intact.

### 2.1 `MST_ShareSessionStatus`

Used to resolve the numeric `StatusId` for workflow states.

**Schema (relevant columns)**
| Column | Type | Nullable | Notes |
|---|---|---:|---|
| StatusId | integer | no | PK |
| Code | text | no | machine-friendly status code |
| DisplayName | text | no | human-friendly label |
| IsActive | boolean | no | status row enabled/disabled flag |

> Columns related to audit/change tracking (for example: `IsModified`, `CreatedBy`, `CreatedOn`, `ModifiedBy`, `ModifiedOn`) are intentionally omitted here.

**Known status rows (current values)**
| StatusId | Code | DisplayName | IsActive |
|---:|---|---|---|
| 1 | ACTIVE | Active | true |
| 2 | COMPLETED | Completed | true |
| 3 | CANCELLED | Cancelled | true |


**Used by**
- `user_start_share_session` (lookup ACTIVE)
- `user_submit_segment` (lookup ACTIVE and COMPLETED)
- `user_cancel_share_session` (lookup COMPLETED and CANCELLED)
- `buyer_get_posting_shares` (status name enrichment)

### 2.2 `TRN_Posting`
Used to validate the posting exists and to enrich response payloads with `Title`.

**Used by**
- `user_start_share_session` (posting validation)
- `buyer_get_posting_shares` (posting validation + title)

### 2.3 `MST_User`
Used to validate the user exists and to enrich response payloads with display name.

**Used by**
- `user_start_share_session` (user validation)
- `buyer_get_posting_shares` (user name enrichment)

### 2.4 `MST_Metric`
Used to enrich metric rows with the metric display name.

**Used by**
- `buyer_get_posting_shares` (metric name enrichment)

---

## 3) Relationship map (FK graph)

- `TRN_ShareSession`
  - `UserId` → `MST_User.UserId`
  - `PostingId` → `TRN_Posting.PostingId`
  - `StatusId` → `MST_ShareSessionStatus.StatusId`

- `TRN_ShareSegment`
  - `SessionId` → `TRN_ShareSession.SessionId`
  - `UserId` → `MST_User.UserId`
  - `PostingId` → `TRN_Posting.PostingId`

- `TRN_SegmentMetric`
  - `SegmentId` → `TRN_ShareSegment.SegmentId`
  - `MetricId` → `MST_Metric.MetricId`

---

## 4) Example records in tables

> These are illustrative examples to show shape. Replace values as needed for your environment.

### 4.1 `TRN_ShareSession` (example)
```json
{
  "SessionId": 1001,
  "PostingId": 123,
  "UserId": 45,
  "JoinTimeLocal": "2026-01-19T10:15:00-05:00",
  "JoinTimezone": "America/New_York",
  "CycleAnchorUtc": "2026-01-19T15:15:00Z",
  "SegmentsExpected": 7,
  "SegmentsSent": 0,
  "StatusId": 1,
  "PermissionGranted": true,
  "LastClientHint": null,
  "CreatedOn": "2026-01-19T15:16:01.123Z",
  "ModifiedOn": "2026-01-19T15:16:01.123Z"
}
```


### 4.2 `TRN_ShareSegment` (example)
```json
{
  "SegmentId": 2001,
  "SessionId": 1001,
  "PostingId": 123,
  "UserId": 45,
  "DayIndex": 0,
  "FromUtc": "2026-01-19T00:00:00Z",
  "ToUtc": "2026-01-20T00:00:00Z",
  "HasData": true,
  "CreatedOn": "2026-01-19T15:20:10.000Z"
}
```

### 4.3 `TRN_SegmentMetric` (example)
```json
{
  "SegmentMetricId": 3001,
  "SegmentId": 2001,
  "MetricId": 1,
  "UnitCode": "count",
  "TotalValue": 12000,
  "AvgValue": 500,
  "MinValue": 0,
  "MaxValue": 2000,
  "SamplesCount": 24,
  "ComputedJson": {
    "source": "aggregate",
    "notes": "example only"
  },
  "CreatedOn": "2026-01-19T15:20:12.000Z"
}
```


---

## 5) Edge Function: `user_start_share_session`

**Function name**: `user_start_share_session`  
**Endpoint**: `POST /functions/v1/user_start_share_session`  
**Auth (current implementation)**: Open endpoint (no auth checks implemented)

### 5.1 Purpose
Creates a new share session for a given `(postingId, userId)` pair by inserting a row into `TRN_ShareSession`, with:

- `StatusId` set to the **ACTIVE** status
- `SegmentsSent` initialized to `0`
- `PermissionGranted` set to `true`

It also prevents duplicate **ACTIVE** sessions for the same `(postingId, userId)`.

---

### 5.2 Tables read and written

**Reads**
- `TRN_Posting` (validates posting exists; returns title)
- `MST_User` (validates user exists; returns display name)
- `MST_ShareSessionStatus` (resolves the `ACTIVE` status row)
- `TRN_ShareSession` (checks whether an ACTIVE session already exists)

**Writes**
- `TRN_ShareSession` (inserts new session row)

---

### 5.3 Request

**Method**: `POST`  
**Content-Type**: `application/json`

**Request body schema**
```json
{
  "postingId": 0,
  "userId": 0,
  "joinTimeLocal": "string (ISO-8601 parseable)",
  "joinTimezone": "string",
  "cycleAnchorUtc": "string (ISO-8601 parseable)",
  "segmentsExpected": 0
}
````

**Field requirements and validation rules (as implemented)**

* `postingId` must be a `number`
* `userId` must be a `number`
* `joinTimeLocal` must be a `string` and parseable by `Date.parse()`
* `joinTimezone` must be a `string`
* `cycleAnchorUtc` must be a `string` and parseable by `Date.parse()`
* `segmentsExpected` must be a `number` and must satisfy `segmentsExpected >= 1`

If any validation fails, the function returns `400 BAD_REQUEST`.

**Example request**

```json
{
  "postingId": 123,
  "userId": 45,
  "joinTimeLocal": "2026-01-19T10:15:00-05:00",
  "joinTimezone": "America/New_York",
  "cycleAnchorUtc": "2026-01-19T15:15:00Z",
  "segmentsExpected": 7
}
```

---

### 5.4 Response

#### Success: `201 Created`

On success, the function returns a payload combining:

* inserted session identity (`sessionId`)
* posting and user display fields
* status name resolved from `MST_ShareSessionStatus`

**Response body**

```json
{
  "sessionId": 0,
  "postingId": 0,
  "postingTitle": "string|null",
  "userId": 0,
  "userDisplayName": "string|null",
  "statusId": 0,
  "statusName": "string",
  "segmentsExpected": 0,
  "segmentsSent": 0,
  "joinTimeLocal": "string",
  "joinTimezone": "string",
  "cycleAnchorUtc": "string",
  "permissionGranted": true,
  "createdOnUtc": "string|null"
}
```

**Example success response**

```json
{
  "sessionId": 1001,
  "postingId": 123,
  "postingTitle": "Example Posting",
  "userId": 45,
  "userDisplayName": "Example User",
  "statusId": 1,
  "statusName": "ACTIVE",
  "segmentsExpected": 7,
  "segmentsSent": 0,
  "joinTimeLocal": "2026-01-19T10:15:00-05:00",
  "joinTimezone": "America/New_York",
  "cycleAnchorUtc": "2026-01-19T15:15:00Z",
  "permissionGranted": true,
  "createdOnUtc": "2026-01-19T15:16:01.123Z"
}
```

---

### 5.5 Error responses (as implemented)

#### `400 BAD_REQUEST`

Returned when:

* request method is not `POST`
* body is not valid JSON
* required fields are missing or have wrong types
* `segmentsExpected < 1`
* `joinTimeLocal` or `cycleAnchorUtc` is not parseable as a timestamp

**Example**

```json
{
  "code": "BAD_REQUEST",
  "message": "Missing or invalid fields",
  "details": {
    "required": [
      "postingId:number",
      "userId:number",
      "joinTimeLocal:string",
      "joinTimezone:string",
      "cycleAnchorUtc:string",
      "segmentsExpected:number"
    ],
    "received": {}
  }
}
```

#### `404 NOT_FOUND`

Returned when:

* `TRN_Posting` does not contain `PostingId = postingId`
* `MST_User` does not contain `UserId = userId`

**Example**

```json
{
  "code": "NOT_FOUND",
  "message": "Posting not found for postingId=123"
}
```

#### `409 CONFLICT`

Returned when:

* an existing **ACTIVE** session already exists for `(postingId, userId)`

**Example**

```json
{
  "code": "CONFLICT",
  "message": "Active session already exists for this posting and user"
}
```

#### `500 SERVER_ERROR`

Returned when:

* environment variables `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` are missing
* the `ACTIVE` status row cannot be found in `MST_ShareSessionStatus`
* any unexpected DB or runtime error occurs

**Example**

```json
{
  "code": "SERVER_ERROR",
  "message": "Unexpected error while creating share session"
}
```

---

### 5.6 Logic walkthrough (step-by-step)

1. **Validate request method**

   * Rejects non-`POST` requests with `400 BAD_REQUEST`.

2. **Parse and validate request body**

   * Ensures required fields exist and are of expected types.
   * Ensures `segmentsExpected >= 1`.
   * Ensures `joinTimeLocal` and `cycleAnchorUtc` are parseable timestamps.

3. **Initialize Supabase client**

   * Uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
   * Creates a Supabase client with `persistSession: false`.

4. **Validate references**

   * Looks up `TRN_Posting(PostingId, Title)` by `postingId`.
   * Looks up `MST_User(UserId, Name)` by `userId`.
   * Looks up the ACTIVE status row in `MST_ShareSessionStatus` by:

     * `Code = 'ACTIVE'` OR `DisplayName = 'ACTIVE'`.

5. **Prevent duplicate ACTIVE sessions**

   * Queries `TRN_ShareSession` where:

     * `PostingId = postingId`
     * `UserId = userId`
     * `StatusId = ACTIVE.StatusId`
   * If any row exists, returns `409 CONFLICT`.

6. **Insert share session**

   * Inserts into `TRN_ShareSession` with:

     * `PostingId`, `UserId`, join/cycle fields
     * `SegmentsExpected` from request
     * `SegmentsSent = 0`
     * `StatusId = ACTIVE.StatusId`
     * `PermissionGranted = true`

7. **Return success response**

   * Returns `201 Created` with the inserted `SessionId` and enriched display fields.

---

## 6) Edge Function: `user_submit_segment`

**Function name**: `user_submit_segment`  
**Endpoint**: `POST /functions/v1/user_submit_segment`  
**Auth (current implementation)**: Open endpoint (no auth checks implemented)

### 6.1 Purpose
Records a single time-window segment for an existing **ACTIVE** share session by:

1. Inserting a row into `TRN_ShareSegment`
2. Inserting zero or more metric aggregates into `TRN_SegmentMetric` for that segment
3. Incrementing `TRN_ShareSession.SegmentsSent`
4. Marking the session as **COMPLETED** once `SegmentsSent >= SegmentsExpected`

---

### 6.2 Tables read and written

**Reads**
- `TRN_ShareSession` (validates session exists; retrieves `PostingId`, `UserId`, counters, status)
- `MST_ShareSessionStatus` (resolves `ACTIVE` and, if needed, `COMPLETED`)
- `TRN_ShareSegment` (duplicate protection checks)

**Writes**
- `TRN_ShareSegment` (inserts one segment)
- `TRN_SegmentMetric` (inserts metric rows for the created segment, when present)
- `TRN_ShareSession` (updates `SegmentsSent`, and optionally updates `StatusId`)

---

### 6.3 Request

**Method**: `POST`  
**Content-Type**: `application/json`

#### Request body schema
```json
{
  "sessionId": 0,
  "dayIndex": 0,
  "fromUtc": "string (ISO-8601 parseable)",
  "toUtc": "string (ISO-8601 parseable)",
  "hasData": true,
  "metrics": [
    {
      "metricId": 0,
      "metricName": "string (optional)",
      "unitCode": "string",
      "totalValue": 0,
      "avgValue": 0,
      "minValue": 0,
      "maxValue": 0,
      "samplesCount": 0,
      "computedJson": {}
    }
  ]
}
````

#### Field requirements and validation rules (as implemented)

Top-level fields:

* `sessionId` must be a `number`
* `dayIndex` must be a `number` (Day-0 is allowed)
* `fromUtc` must be a `string` and parseable by `Date.parse()`
* `toUtc` must be a `string` and parseable by `Date.parse()`
* `toUtc` must be strictly later than `fromUtc`
* `hasData` must be a `boolean`
* `metrics` must be an `array`

Metrics rules:

* If `hasData = true`, then `metrics.length` must be `> 0`
* Each metric must include:

  * `metricId:number`
  * `unitCode:string`
* `totalValue`, `avgValue`, `minValue`, `maxValue`, `samplesCount` may be omitted or `null`; if present they must be numbers.
* `computedJson` may be any JSON object, `null`, or omitted.
* Duplicate `metricId` values in the same request are rejected.

#### Example request (hasData=true)

```json
{
  "sessionId": 1001,
  "dayIndex": 0,
  "fromUtc": "2026-01-19T00:00:00Z",
  "toUtc": "2026-01-20T00:00:00Z",
  "hasData": true,
  "metrics": [
    {
      "metricId": 1,
      "unitCode": "count",
      "totalValue": 12000,
      "avgValue": 500,
      "minValue": 0,
      "maxValue": 2000,
      "samplesCount": 24,
      "computedJson": { "source": "aggregate" }
    }
  ]
}
```

#### Example request (hasData=false)

```json
{
  "sessionId": 1001,
  "dayIndex": 1,
  "fromUtc": "2026-01-20T00:00:00Z",
  "toUtc": "2026-01-21T00:00:00Z",
  "hasData": false,
  "metrics": []
}
```

---

### 6.4 Response

#### Success: `201 Created`

Returns the newly created `segmentId`, updated session counters, session status (ACTIVE or COMPLETED), and an acknowledgement string.

**Response body**

```json
{
  "segmentId": 0,
  "sessionId": 0,
  "dayIndex": 0,
  "segmentsSent": 0,
  "segmentsExpected": 0,
  "sessionStatusId": 0,
  "sessionStatusName": "string",
  "ack": "string"
}
```

**`ack` values (as implemented)**

* `accepted_completed`
  Returned when this submission increments `SegmentsSent` such that the session is marked COMPLETED.
* `accepted`
  Returned when `hasData=true` and at least one metric is inserted.
* `accepted_no_metrics`
  Returned when there are no metrics inserted (including `hasData=false`).

**Example success response**

```json
{
  "segmentId": 2001,
  "sessionId": 1001,
  "dayIndex": 0,
  "segmentsSent": 1,
  "segmentsExpected": 7,
  "sessionStatusId": 1,
  "sessionStatusName": "ACTIVE",
  "ack": "accepted"
}
```

---

### 6.5 Error responses (as implemented)

#### `400 BAD_REQUEST`

Returned when:

* request method is not `POST`
* body is not valid JSON
* required fields are missing or have wrong types
* `fromUtc` or `toUtc` is not parseable
* `toUtc <= fromUtc`
* `hasData=true` but `metrics` is empty
* a metric is missing `metricId` or `unitCode`
* numeric fields are not number/null when provided
* duplicate `metricId` appears in `metrics`

**Example**

```json
{
  "code": "BAD_REQUEST",
  "message": "Duplicate metricId in metrics array is not allowed"
}
```

#### `404 NOT_FOUND`

Returned when:

* session does not exist in `TRN_ShareSession`

**Example**

```json
{
  "code": "NOT_FOUND",
  "message": "Share session not found for sessionId=1001"
}
```

#### `409 CONFLICT`

Returned when:

* session is not ACTIVE
* a segment already exists for the same `(SessionId, DayIndex)`
* a segment already exists for the same `(SessionId, FromUtc, ToUtc)`
* metric insert fails with a DB error message containing `"unique"` (mapped to conflict)

**Examples**

```json
{
  "code": "CONFLICT",
  "message": "Session is not ACTIVE"
}
```

```json
{
  "code": "CONFLICT",
  "message": "Segment already exists for sessionId=1001 dayIndex=0"
}
```

#### `500 SERVER_ERROR`

Returned when:

* environment variables `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` are missing
* ACTIVE status row cannot be found
* COMPLETED status row is required but cannot be found
* any unexpected DB or runtime error occurs

**Example**

```json
{
  "code": "SERVER_ERROR",
  "message": "Unexpected error while recording segment"
}
```

---

### 6.6 Logic walkthrough (step-by-step)

1. **Validate request method**

   * Rejects non-`POST` requests with `400 BAD_REQUEST`.

2. **Parse and validate request body**

   * Validates types and required fields.
   * Validates time ordering (`toUtc > fromUtc`).
   * If `hasData=true`, requires at least one metric.
   * Rejects duplicate `metricId` values in the metrics array.

3. **Initialize Supabase client**

   * Uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
   * Creates a Supabase client with `persistSession: false`.

4. **Fetch session and ensure it is ACTIVE**

   * Reads `TRN_ShareSession` by `SessionId`.
   * Reads ACTIVE status row from `MST_ShareSessionStatus` using:

     * `Code = 'ACTIVE'` OR `DisplayName = 'ACTIVE'`.
   * If session status is not ACTIVE, returns `409 CONFLICT`.

5. **Duplicate protection**

   * Checks `TRN_ShareSegment` for existing segment:

     * `(SessionId, DayIndex)`
     * `(SessionId, FromUtc, ToUtc)`
   * If duplicates exist, returns `409 CONFLICT`.

6. **Insert segment**

   * Inserts into `TRN_ShareSegment`, copying `PostingId` and `UserId` from the session record.

7. **Insert metrics (optional)**

   * When `hasData=true` and metrics are present, inserts rows into `TRN_SegmentMetric` for the created segment.

8. **Update session counters and status**

   * Sets `SegmentsSent = previous + 1`.
   * If `SegmentsSent >= SegmentsExpected`, resolves the COMPLETED status row and updates session `StatusId`.

9. **Return response**

   * Returns `201 Created` with `segmentId`, updated counters, resulting session status, and an `ack` value.

---


## 7) Edge Function: `user_cancel_share_session`

**Function name**: `user_cancel_share_session`  
**Endpoint**: `POST /functions/v1/user_cancel_share_session`  
**Auth (current implementation)**: Open endpoint (no auth checks implemented)

### 7.1 Purpose
Cancels an existing share session by updating `TRN_ShareSession.StatusId` to **CANCELLED**, with the following rules:

- A session that is already **COMPLETED** cannot be cancelled.
- Cancelling is **idempotent**:
  - If the session is already CANCELLED, the function returns `200 OK` with `ack = "already_cancelled"` and does not modify data.

---

### 7.2 Tables read and written

**Reads**
- `TRN_ShareSession` (validates session exists; checks current status)
- `MST_ShareSessionStatus` (resolves `COMPLETED` and `CANCELLED` status rows)

**Writes**
- `TRN_ShareSession` (updates `StatusId` to CANCELLED when allowed)

---

### 7.3 Request

**Method**: `POST`  
**Content-Type**: `application/json`

#### Request body schema
```json
{
  "sessionId": 0
}
````

#### Field requirements and validation rules (as implemented)

* `sessionId` is required and must be a `number`.

If validation fails, the function returns `400 BAD_REQUEST`.

#### Example request

```json
{
  "sessionId": 1001
}
```

---

### 7.4 Response

#### Success: `200 OK` (cancel applied)

Returned when the session exists and is not COMPLETED, and the function updates the session to CANCELLED.

**Response body**

```json
{
  "sessionId": 0,
  "statusId": 0,
  "statusName": "string",
  "ack": "cancelled"
}
```

**Example**

```json
{
  "sessionId": 1001,
  "statusId": 3,
  "statusName": "CANCELLED",
  "ack": "cancelled"
}
```

#### Success: `200 OK` (idempotent no-op)

Returned when the session is already CANCELLED.

**Example**

```json
{
  "sessionId": 1001,
  "statusId": 3,
  "statusName": "CANCELLED",
  "ack": "already_cancelled"
}
```

---

### 7.5 Error responses (as implemented)

#### `400 BAD_REQUEST`

Returned when:

* request method is not `POST`
* body is not valid JSON
* `sessionId` is missing or not a number

**Example**

```json
{
  "code": "BAD_REQUEST",
  "message": "sessionId is required and must be a number",
  "details": {
    "received": {}
  }
}
```

#### `404 NOT_FOUND`

Returned when:

* `TRN_ShareSession` does not contain `SessionId = sessionId`

**Example**

```json
{
  "code": "NOT_FOUND",
  "message": "Share session not found for sessionId=1001"
}
```

#### `409 CONFLICT`

Returned when:

* the session is already COMPLETED

**Example**

```json
{
  "code": "CONFLICT",
  "message": "Session is already COMPLETED and cannot be cancelled"
}
```

#### `500 SERVER_ERROR`

Returned when:

* environment variables `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` are missing
* the COMPLETED or CANCELLED status row cannot be found in `MST_ShareSessionStatus`
* any unexpected DB or runtime error occurs

**Example**

```json
{
  "code": "SERVER_ERROR",
  "message": "Unexpected error while cancelling share session"
}
```

---

### 7.6 Logic walkthrough (step-by-step)

1. **Validate request method**

   * Rejects non-`POST` requests with `400 BAD_REQUEST`.

2. **Parse and validate request body**

   * Parses JSON.
   * Requires `sessionId:number`.

3. **Initialize Supabase client**

   * Uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
   * Creates a Supabase client with `persistSession: false`.

4. **Fetch session**

   * Reads `TRN_ShareSession` by `SessionId`.
   * If not found, returns `404 NOT_FOUND`.

5. **Resolve terminal statuses**

   * Reads `MST_ShareSessionStatus` to locate:

     * COMPLETED (`Code='COMPLETED' OR DisplayName='COMPLETED'`)
     * CANCELLED (`Code='CANCELLED' OR DisplayName='CANCELLED'`)
   * If either is missing, returns `500 SERVER_ERROR`.

6. **Enforce cancellation rules**

   * If current session status is COMPLETED → `409 CONFLICT`.
   * If current session status is CANCELLED → return `200 OK` with `ack="already_cancelled"`.

7. **Apply cancellation**

   * Updates `TRN_ShareSession.StatusId` to CANCELLED.

8. **Return success**

   * Returns `200 OK` with `ack="cancelled"`.

---

## 8) Edge Function: `buyer_get_posting_shares`

**Function name**: `buyer_get_posting_shares`  
**Endpoint**: `GET /functions/v1/buyer_get_posting_shares?postingId={postingId}`  
**Auth (current implementation)**: Open endpoint (no auth checks implemented)  
**CORS**: Implements `OPTIONS` preflight and sets `Access-Control-Allow-Origin` in responses.

### 8.1 Purpose
Returns all share sessions for a given posting, including nested segments and segment metrics, enriched with:

- user display names (`MST_User.Name`)
- status display names (`MST_ShareSessionStatus.DisplayName` or `Code`)
- metric display names (`MST_Metric.DisplayName`)

The response is structured as:

- Posting
  - Sessions (“shares”)
    - Segments
      - Metrics

---

### 8.2 Tables read and written

**Reads**
- `TRN_Posting` (validates posting exists; returns title)
- `TRN_ShareSession` (sessions for posting)
- `MST_User` (user display names for sessions)
- `MST_ShareSessionStatus` (status names for sessions)
- `TRN_ShareSegment` (segments for sessions)
- `TRN_SegmentMetric` (metrics for segments; includes `ComputedJson`)
- `MST_Metric` (metric display names)

**Writes**
- None

---

### 8.3 Request

**Method**: `GET`  
**Query parameter**
- `postingId` (required, integer)

**Example**
```

GET /functions/v1/buyer_get_posting_shares?postingId=123

````

**Validation rules (as implemented)**
- `postingId` must be present.
- `postingId` must be parseable as a number (integer expected by message; actual check is `Number.isNaN(Number(postingIdParam))`).

If validation fails, the function returns `400 BAD_REQUEST`.

---

### 8.4 Response

#### Success: `200 OK` (with results)
Returns the posting identity and title plus nested share data.

**Response body schema**
```json
{
  "postingId": 0,
  "postingTitle": "string|null",
  "shares": [
    {
      "userId": 0,
      "userDisplayName": "string|null",
      "sessionId": 0,
      "statusId": 0,
      "statusName": "string|null",
      "segments": [
        {
          "segmentId": 0,
          "dayIndex": 0,
          "fromUtc": "string",
          "toUtc": "string",
          "metrics": [
            {
              "metricId": 0,
              "metricName": "string|null",
              "unitCode": "string",
              "totalValue": 0,
              "avgValue": 0,
              "minValue": 0,
              "maxValue": 0,
              "samplesCount": 0,
              "computedJson": {}
            }
          ]
        }
      ]
    }
  ]
}
````

**Example success response**

```json
{
  "postingId": 123,
  "postingTitle": "Example Posting",
  "shares": [
    {
      "userId": 45,
      "userDisplayName": "Example User",
      "sessionId": 1001,
      "statusId": 1,
      "statusName": "ACTIVE",
      "segments": [
        {
          "segmentId": 2001,
          "dayIndex": 0,
          "fromUtc": "2026-01-19T00:00:00Z",
          "toUtc": "2026-01-20T00:00:00Z",
          "metrics": [
            {
              "metricId": 1,
              "metricName": "Steps",
              "unitCode": "count",
              "totalValue": 12000,
              "avgValue": 500,
              "minValue": 0,
              "maxValue": 2000,
              "samplesCount": 24,
              "computedJson": { "source": "aggregate" }
            }
          ]
        }
      ]
    }
  ]
}
```

#### Success: `200 OK` (no sessions)

If a posting exists but has no share sessions, the function returns an empty array:

```json
{
  "postingId": 123,
  "postingTitle": "Example Posting",
  "shares": []
}
```

---

### 8.5 Error responses (as implemented)

#### `400 BAD_REQUEST`

Returned when:

* request method is not `GET`
* `postingId` is missing or not parseable as a number
* preflight is handled separately via `OPTIONS`

**Example**

```json
{
  "code": "BAD_REQUEST",
  "message": "postingId is required and must be an integer",
  "details": {
    "postingId": null
  }
}
```

#### `404 NOT_FOUND`

Returned when:

* `TRN_Posting` does not contain `PostingId = postingId`

**Example**

```json
{
  "code": "NOT_FOUND",
  "message": "Posting not found for postingId=123"
}
```

#### `500 SERVER_ERROR`

Returned when:

* environment variables `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` are missing
* any unexpected DB or runtime error occurs

**Example**

```json
{
  "code": "SERVER_ERROR",
  "message": "Unexpected error while fetching posting shares"
}
```

---

### 8.6 Logic walkthrough (step-by-step)

1. **CORS preflight**

   * If request method is `OPTIONS`, returns `200 ok` with:

     * `Access-Control-Allow-Origin: {origin}`
     * allowed methods: `GET, POST, PATCH, OPTIONS`
     * allowed headers: `authorization, x-client-info, apikey, content-type`

2. **Validate request method**

   * Rejects non-`GET` methods with `400 BAD_REQUEST`.

3. **Validate `postingId` query parameter**

   * Requires `postingId`.
   * Ensures it is parseable as a number.

4. **Initialize Supabase client**

   * Uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
   * Creates a Supabase client with `persistSession: false`.

5. **Fetch posting**

   * Reads `TRN_Posting(PostingId, Title)`.
   * If missing, returns `404 NOT_FOUND`.

6. **Fetch sessions**

   * Reads all `TRN_ShareSession` rows for `PostingId`.
   * If none, returns `{ postingId, postingTitle, shares: [] }`.

7. **Enrich sessions**

   * Builds a `userMap` by reading `MST_User(UserId, Name)` for session userIds.
   * Builds a `statusMap` by reading `MST_ShareSessionStatus(StatusId, Code, DisplayName)` for session statusIds.

8. **Fetch segments**

   * Reads `TRN_ShareSegment` rows where `SessionId IN (sessionIds)`.

9. **Fetch metrics**

   * Reads `TRN_SegmentMetric` rows where `SegmentId IN (segmentIds)`, including `ComputedJson`.

10. **Enrich metric display names**

* Reads `MST_Metric(MetricId, DisplayName)` for metricIds present in retrieved rows.

11. **Build nested output**

* Groups segments by `SessionId`.
* Groups metrics by `SegmentId`.
* Sorts:

  * sessions by `UserId` ascending
  * segments by `DayIndex` ascending
  * metrics by `MetricId` ascending
* Returns `{ postingId, postingTitle, shares }`.

---

---

## 9) Supporting share-session query functions (overview)

These functions are included because they **read the same share-session tables** (`TRN_ShareSession`, `TRN_ShareSegment`, and sometimes `TRN_SegmentMetric`) to power UI flows and progress tracking. They will need compatible behavior after the sensitive portion of share-session data is moved to decentralized storage.

### 9.1 `share_get_session_snapshot`
**Purpose**: Returns a compact “snapshot” of a user’s session for a posting, preferring an **ACTIVE** session when present, otherwise falling back to the **latest** session; also includes the **last uploaded segment** summary (latest `DayIndex`).  
**Tables interacted**
- Reads: `MST_ShareSessionStatus`, `TRN_ShareSession`, `TRN_ShareSegment`

### 9.2 `user_get_session_by_posting`
**Purpose**: Resolves the “current” session for a `(postingId, userId)` pair for UI logic; prefers **ACTIVE** if present, otherwise returns the **latest** session; includes posting/user display fields and a `source` indicator (`ACTIVE` or `LATEST`).  
**Tables interacted**
- Reads: `TRN_Posting`, `MST_User`, `MST_ShareSessionStatus`, `TRN_ShareSession`

### 9.3 `user_active-share-sessions`
**Purpose**: Returns a list of the user’s **ACTIVE** share sessions for dashboard cards, enriched with posting/buyer/reward details and derived progress fields (effective segments sent, progress percentage, missed windows count, next window).  
**Tables interacted**
- Reads: `MST_ShareSessionStatus`, `TRN_ShareSession`, `TRN_Posting`, `MST_User`, `MST_RewardType`, `TRN_ShareSegment`

---

## 10) Edge Function: `share_get_session_snapshot`

**Function name**: `share_get_session_snapshot`  
**Endpoint**: `GET /functions/v1/share_get_session_snapshot?userId={userId}&postingId={postingId}`  
**Auth (current implementation)**: Open endpoint (no auth checks implemented)

### 10.1 Purpose
Returns a compact snapshot of a user’s share-session state for a specific posting. The function:

- Prefers the **ACTIVE** session if one exists for `(postingId, userId)`
- Otherwise returns the **latest** session for `(postingId, userId)` (ordered by `ModifiedOn` then `CreatedOn`)
- Includes a summary of the **last uploaded segment** (latest `DayIndex`) for the selected session

This endpoint is designed for UI hydration and progress/status checks without fetching all segment metrics.

---

### 10.2 Tables read and written

**Reads**
- `MST_ShareSessionStatus` (loads all statuses; resolves the ACTIVE status id and returns status labels)
- `TRN_ShareSession` (selects ACTIVE session or latest session for the user+posting pair)
- `TRN_ShareSegment` (fetches the last segment by `DayIndex` for the chosen session)

**Writes**
- None

---

### 10.3 Request

**Method**: `GET`  
**Query parameters**
- `userId` (required, integer)
- `postingId` (required, integer)

**Example**
```

GET /functions/v1/share_get_session_snapshot?userId=45&postingId=123

````

**Validation rules (as implemented)**
- Both `userId` and `postingId` must be present.
- Both must be parseable as integers (`Number(...)` must not be `NaN`).

---

### 10.4 Response

#### Success: `200 OK` (session found)
Returns `ok: true` with a `session` object.

**Response body schema**
```json
{
  "ok": true,
  "session": {
    "session_id": 0,
    "posting_id": 0,
    "user_id": 0,
    "status_code": "string|null",
    "status_name": "string|null",
    "segments_expected": 0,
    "segments_sent": 0,
    "last_sent_day_index": 0,
    "cycle_anchor_utc": "string",
    "join_time_local_iso": "string",
    "join_timezone": "string",
    "last_uploaded_at": "string|null",
    "last_window_from_utc": "string|null",
    "last_window_to_utc": "string|null"
  }
}
````

**Example**

```json
{
  "ok": true,
  "session": {
    "session_id": 1001,
    "posting_id": 123,
    "user_id": 45,
    "status_code": "ACTIVE",
    "status_name": "Active",
    "segments_expected": 7,
    "segments_sent": 3,
    "last_sent_day_index": 2,
    "cycle_anchor_utc": "2026-01-19T15:15:00Z",
    "join_time_local_iso": "2026-01-19T10:15:00-05:00",
    "join_timezone": "America/New_York",
    "last_uploaded_at": "2026-01-21T00:05:10.000Z",
    "last_window_from_utc": "2026-01-21T00:00:00Z",
    "last_window_to_utc": "2026-01-22T00:00:00Z"
  }
}
```

#### Success: `200 OK` (no session exists)

If there is no session for `(postingId, userId)`, returns:

```json
{
  "ok": true,
  "session": null
}
```

---

### 10.5 Error responses (as implemented)

#### `400 BAD_REQUEST`

Returned when:

* request method is not `GET`
* `userId` or `postingId` query parameter is missing
* `userId` or `postingId` is not parseable as an integer

**Example**

```json
{
  "code": "BAD_REQUEST",
  "message": "Missing required query params ?userId=&postingId="
}
```

#### `500 SERVER_ERROR`

Returned when:

* environment variables `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` are missing
* any unexpected DB or runtime error occurs

**Example**

```json
{
  "code": "SERVER_ERROR",
  "message": "Unexpected error while fetching session snapshot",
  "details": "some error message"
}
```

---

### 10.6 Logic walkthrough (step-by-step)

1. **Validate request method**

   * Only `GET` is supported.

2. **Validate query params**

   * Requires `userId` and `postingId`.
   * Parses both to numbers and rejects invalid values.

3. **Initialize Supabase client**

   * Uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

4. **Load all session statuses**

   * Reads `MST_ShareSessionStatus`.
   * Computes `ACTIVE_ID` by matching `Code.toUpperCase() === "ACTIVE"`.

5. **Select a session**

   * If `ACTIVE_ID` exists, first tries to fetch an ACTIVE session row from `TRN_ShareSession`.
   * If none exists, fetches the latest session row ordered by:

     * `ModifiedOn DESC`, then `CreatedOn DESC`.

6. **If no session exists**

   * Returns `{ ok: true, session: null }`.

7. **Fetch last segment summary**

   * Reads `TRN_ShareSegment` for the chosen `SessionId`.
   * Selects the latest segment by `DayIndex DESC` (limit 1).

8. **Build snapshot payload**

   * Includes session counters and timing fields plus last segment window fields.

---

## 11) Edge Function: `user_get_session_by_posting`

**Function name**: `user_get_session_by_posting`  
**Endpoint**: `GET /functions/v1/user_get_session_by_posting?postingId={postingId}&userId={userId}`  
**Auth (current implementation)**: Open endpoint (no auth checks implemented)

### 11.1 Purpose
Resolves a user’s “current” share session for a specific posting. The function:

- Prefers an **ACTIVE** session if one exists for `(postingId, userId)`
- Otherwise returns the **latest** session for `(postingId, userId)` (ordered by `CreatedOn DESC`, then `ModifiedOn DESC`)
- Enriches the response with:
  - posting title (`TRN_Posting.Title`)
  - user display name (`MST_User.Name`)
  - human-readable status name (`MST_ShareSessionStatus.DisplayName` or `Code`)
- Includes a `source` field to indicate whether the result came from `"ACTIVE"` or `"LATEST"`

This endpoint is intended for UI logic that needs a single session reference (e.g., resume sharing, show status/progress).

---

### 11.2 Tables read and written

**Reads**
- `TRN_Posting` (validates posting exists; returns title)
- `MST_User` (validates user exists; returns name)
- `MST_ShareSessionStatus` (resolves ACTIVE status id and status display name)
- `TRN_ShareSession` (selects ACTIVE session or latest session for the user+posting pair)

**Writes**
- None

---

### 11.3 Request

**Method**: `GET`  
**Query parameters**
- `postingId` (required, integer)
- `userId` (required, integer)

**Example**
```

GET /functions/v1/user_get_session_by_posting?postingId=123&userId=45

````

**Validation rules (as implemented)**
- `postingId` must be present and parseable as a number.
- `userId` must be present and parseable as a number.

---

### 11.4 Response

#### Success: `200 OK`
Returns the selected session and enrichment fields.

**Response body schema**
```json
{
  "sessionId": 0,
  "postingId": 0,
  "postingTitle": "string|null",
  "userId": 0,
  "userDisplayName": "string|null",
  "statusId": 0,
  "statusName": "string|null",
  "segmentsExpected": 0,
  "segmentsSent": 0,
  "createdOnUtc": "string|null",
  "modifiedOnUtc": "string|null",
  "source": "ACTIVE|LATEST"
}
````

**Example**

```json
{
  "sessionId": 1001,
  "postingId": 123,
  "postingTitle": "Example Posting",
  "userId": 45,
  "userDisplayName": "Example User",
  "statusId": 1,
  "statusName": "Active",
  "segmentsExpected": 7,
  "segmentsSent": 3,
  "createdOnUtc": "2026-01-19T15:15:00Z",
  "modifiedOnUtc": "2026-01-21T00:05:10Z",
  "source": "ACTIVE"
}
```

---

### 11.5 Error responses (as implemented)

#### `400 BAD_REQUEST`

Returned when:

* request method is not `GET`
* `postingId` is missing or not parseable as a number
* `userId` is missing or not parseable as a number

**Example**

```json
{
  "code": "BAD_REQUEST",
  "message": "postingId is required and must be an integer",
  "details": { "postingId": null }
}
```

#### `404 NOT_FOUND`

Returned when:

* posting does not exist
* user does not exist
* no share session exists for `(postingId, userId)`

**Examples**

```json
{ "code": "NOT_FOUND", "message": "Posting not found for postingId=123" }
```

```json
{ "code": "NOT_FOUND", "message": "User not found for userId=45" }
```

```json
{ "code": "NOT_FOUND", "message": "No share session found for postingId=123 & userId=45" }
```

#### `500 SERVER_ERROR`

Returned when:

* environment variables `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` are missing
* any unexpected DB or runtime error occurs

**Example**

```json
{
  "code": "SERVER_ERROR",
  "message": "Unexpected error while resolving session"
}
```

---

### 11.6 Logic walkthrough (step-by-step)

1. **Validate request method**

   * Only `GET` is supported.

2. **Validate query params**

   * Requires `postingId` and `userId` and parses both to numbers.

3. **Initialize Supabase client**

   * Uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

4. **Validate posting and user**

   * Reads `TRN_Posting` and `MST_User` in parallel for clearer error messages.

5. **Prefer ACTIVE session**

   * Resolves ACTIVE status row from `MST_ShareSessionStatus` (`Code='ACTIVE' OR DisplayName='ACTIVE'`).
   * If present, tries to fetch an ACTIVE `TRN_ShareSession` for `(postingId, userId)`.

6. **Fallback to latest session**

   * If no ACTIVE session exists, selects the latest by:

     * `CreatedOn DESC`, then `ModifiedOn DESC`.

7. **Resolve status display name**

   * Loads all `MST_ShareSessionStatus` rows and maps `StatusId` to `DisplayName` / `Code`.

8. **Return payload**

   * Includes `source: "ACTIVE"` if the ACTIVE path succeeded, else `"LATEST"`.

---

### 11.7 Code reference

Implementation is in the Edge Function `user_get_session_by_posting` (Deno + `@supabase/supabase-js@2.46.1`), reading from `TRN_ShareSession` and enriching with `TRN_Posting`, `MST_User`, and `MST_ShareSessionStatus`.

---


## 12) Edge Function: `user_active-share-sessions`

**Function name**: `user_active-share-sessions`  
**Endpoint**: `GET /functions/v1/user_active-share-sessions?userId={userId}`  
**Auth (current implementation)**: Open endpoint (no auth checks implemented)

### 12.1 Purpose
Returns a list of the user’s **ACTIVE** share sessions for the “Active Shares” dashboard UI. For each active session, it:

- Filters sessions to `Status = ACTIVE` and `PermissionGranted = true`
- Enriches each session with posting details (title/summary/description) and buyer name
- Enriches each session with reward details (reward type + reward value → `rewardLabel`)
- Derives progress and scheduling fields used by the client UI:
  - `segmentsSent` (effective count based on uploaded segments with `HasData = true`)
  - `progressPct`
  - `expectedCompletionDate`
  - `lastSegmentCreatedOn`, `lastDayIndex`
  - `missedWindowsCount` and next window boundaries (`nextWindowFromUtc`, `nextWindowToUtc`)
  - `uiStatus` (`onTrack` vs `behind`)

---

### 12.2 Tables read and written

**Reads**
- `MST_ShareSessionStatus` (resolve `ACTIVE` status id + display label)
- `TRN_ShareSession` (load active sessions for user)
- `TRN_Posting` (enrich posting metadata and reward fields)
- `MST_User` (resolve buyer name from `BuyerUserId`)
- `MST_RewardType` (resolve reward type `Code` and `DisplayName`)
- `TRN_ShareSegment` (compute latest segment activity + effective progress based on `HasData=true`)

**Writes**
- None

---

### 12.3 Request

**Method**: `GET`  
**Query parameters**
- `userId` (required, integer > 0)

**Example**
```

GET /functions/v1/user_active-share-sessions?userId=45

````

**Validation rules (as implemented)**
- `userId` must exist, parse to a number, and be `> 0`.

---

### 12.4 Response

#### Success: `200 OK`
Returns a JSON array of dashboard DTOs. If no active sessions exist, returns `[]`.

**Response body shape**
```json
[
  {
    "postingId": 0,
    "sessionId": 0,
    "postingTitle": "string",
    "postingSummary": "string|null",
    "postingDescription": "string|null",
    "buyerName": "string",
    "rewardLabel": "string",
    "rewardTypeCode": "string",
    "rewardTypeDisplay": "string",
    "rewardValue": 0,
    "segmentsExpected": 0,
    "joinTimeLocal": "string",
    "joinTimezone": "string",
    "statusCode": "ACTIVE",
    "statusDisplay": "string",
    "permissionGranted": true,
    "segmentsSent": 0,
    "progressPct": 0,
    "expectedCompletionDate": "string",
    "lastSegmentCreatedOn": "string|null",
    "lastDayIndex": 0,
    "missedWindowsCount": 0,
    "nextWindowFromUtc": "string|null",
    "nextWindowToUtc": "string|null",
    "uiStatus": "onTrack"
  }
]
````

**Notes based on the current implementation**

* `segmentsSent` returned by this endpoint is **not** `TRN_ShareSession.SegmentsSent`. It is computed as the number of unique `DayIndex` values for segments where `HasData = true`.
* `lastSegmentCreatedOn` and `lastDayIndex` are computed only from segments where `HasData = true`.

---

### 12.5 Error responses (as implemented)

#### `400 Bad Request`

Returned when `userId` is missing, not a number, or `<= 0`.

```json
{ "error": "Invalid or missing userId query parameter" }
```

#### `500 Internal Server Error`

Returned when:

* `ACTIVE` status cannot be loaded or does not exist
* any DB/runtime error occurs during reads/enrichment/aggregation

Examples:

```json
{ "error": "Failed to load ACTIVE status from MST_ShareSessionStatus" }
```

```json
{ "error": "Failed to load share sessions" }
```

```json
{ "error": "Failed to load postings" }
```

```json
{ "error": "Failed to load buyer user rows" }
```

```json
{ "error": "Failed to load reward types" }
```

```json
{ "error": "Failed to load share segments" }
```

```json
{ "error": "Unexpected error in function" }
```

---

### 12.6 Logic walkthrough (step-by-step)

1. **Validate `userId`**

   * Reads `userId` from query params and enforces numeric `> 0`.

2. **Resolve ACTIVE status**

   * Reads `MST_ShareSessionStatus` where `Code = "ACTIVE"` and takes its `StatusId`.

3. **Load active sessions**

   * Reads `TRN_ShareSession` filtered by:

     * `UserId = userId`
     * `PermissionGranted = true`
     * `StatusId = ACTIVE`

4. **Load related posting + reward context**

   * Reads `TRN_Posting` by `PostingId IN (...)` for all active sessions.
   * From posting rows, collects:

     * buyer ids (`BuyerUserId`) → resolves buyer names via `MST_User`
     * reward type ids (`RewardTypeId`) → resolves via `MST_RewardType`

5. **Load segments for activity/progress**

   * Reads `TRN_ShareSegment` filtered by:

     * `SessionId IN (...)`
     * `UserId = userId`
   * Aggregation counts only rows where `HasData = true`:

     * builds `completedDayIndexes` set
     * sets `lastCreatedOn` (latest `CreatedOn`)
     * sets `lastDayIndex` (max `DayIndex`)

6. **Compute derived UI fields**

   * `segmentsSentEffective = completedDayIndexes.size`
   * `progressPct = round(segmentsSentEffective / segmentsExpected * 100)` clamped to `[0, 100]`
   * `expectedCompletionDate = joinTimeLocal + (segmentsExpected - 1) days` (UTC math)
   * Uses `CycleAnchorUtc` (fallback to `joinTimeLocal` only if invalid) and:

     * `DAY_MS = 24h`
     * `GRACE_MS = 15m`
   * Computes:

     * `nextWindowFromUtc` / `nextWindowToUtc` (next 24h bucket boundary after “now”)
     * `missedWindowsCount` (missing day indexes starting from DayIndex 1 after their window end + grace)
     * `uiStatus = behind` if `missedWindowsCount > 0`, else `onTrack`

7. **Return DTO list**

   * Returns array of `ActiveShareSessionDto` objects.

---

### 12.7 Implementation notes for decentralization work

This function depends on:

* session metadata (`TRN_ShareSession`)
* segment existence/activity (`TRN_ShareSegment`, particularly `HasData`, `DayIndex`, `CreatedOn`)
* and posting metadata (`TRN_Posting`, `MST_User`, `MST_RewardType`)

If segment records move to decentralized storage, the function’s aggregation inputs must still be available (or replaced) to compute:

* effective `segmentsSent`
* last upload timestamps
* missed window logic and next window boundaries

---

