# Marketplace Module Overview

The **Marketplace** module provides public access to postings created by buyers.
It is designed for end users to view and explore all available postings without being restricted to a specific buyer.

The Marketplace exposes read-only APIs that allow:

- Listing all visible postings.
- Retrieving personalized recommendations for a signed-in user.
- Viewing details of a specific posting.
- Fetching filter and facet options to support UI-level filtering and exploration.

Write operations such as bookmarking, applying to postings, or tracking impressions are **not included in Phase 1** and will be introduced in later phases.

---

# Functional overview

The APIs inclded here are

1. Public listing endpoints.
2. Personalized listing endpoint.
3. Posting detail retrieval.
4. Facets and status breakdowns for UI counts.
5. Search suggestion assistance.
6. Structured filter data to populate the filter UI without hardcoding values.

The focus is on powering a fully functional marketplace browsing and filtering interface.

---

# API Endpoints

| Method | Path                                   | Purpose                                                                                                         |
| ------ | -------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| GET    | **marketplace_postings**               | Returns a public feed of all visible postings sorted by newest first.                                           |
| GET    | **marketplace_postings_recommended**   | Returns a personalized feed of postings for the authenticated user.                                             |
| GET    | **marketplace_postings/{postingId}**   | Returns full details of a specific posting.                                                                     |
| GET    | **marketplace_postings_facets**        | Returns aggregated facet counts (tags, metrics, statuses) for the current filter scope.                         |
| GET    | **marketplace_postings_status_counts** | Returns posting counts grouped by status (e.g., OPEN, PAUSED) within the current scope.                         |
| GET    | **marketplace_search/suggest**         | Returns search suggestions based on title or tag prefix input.                                                  |
| GET    | **marketplace_tags/trending**          | Returns trending tags based on recent posting activity.                                                         |
| GET    | **marketplace_metrics**                | Returns the list of available metric codes and names for badges or filters.                                     |
| GET    | **marketplace_filters**                | Returns a unified set of available filters (tags, metrics, reward types, reward ranges, durations, age ranges). |
| GET    | **marketplace_filters_reward_types**   | Returns the list of reward types (e.g., POINTS, TOKENS, CREDITS) available for filtering.                       |
| GET    | **marketplace_filters_reward_ranges**  | Returns suggested reward ranges for filtering (e.g., 0–200, 201–500, 501+).                                     |
| GET    | **marketplace_filters_metrics**        | Returns metric options scoped for filtering.                                                                    |
| GET    | **marketplace_filters_tags**           | Returns popular tags for use in the filter UI.                                                                  |
| GET    | **marketplace_filters_durations**      | Returns standard duration buckets (e.g., 7 days, 14 days, 30 days) for filtering.                               |
| GET    | **marketplace_filters_eligibility**    | Returns eligibility filter options (e.g., age brackets, health conditions).                                     |

---

# **Endpoint:** `GET _marketplace_postings`

## Summary

- Returns a public feed of all visible postings sorted by newest first.
- Pagination is page-based. The default page size is 10.
- All master references are returned as identifiers only. Frontend applications must resolve display details using the master APIs.
- The field `imageUrl` is always present. When a posting has no image, the server returns a default image URL.

## Visibility rules

A posting is returned only when all conditions are true.

1. `IsActive = true`
2. `PostingStatusId` is visible (for example OPEN or PAUSED)
3. Current UTC time is within `[ApplyOpenAt, ApplyCloseAt]` inclusive

These rules are enforced on the server.

## Request

### Query parameters

| Name            | Type            |                         Default | Description                                                                                                                                                                                                                     |
| --------------- | --------------- | ------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page`          | integer         |                               1 | One-based page index. Values less than 1 are coerced to 1.                                                                                                                                                                      |
| `pageSize`      | integer         |                              10 | Items per page. Allowed range is 1 to 100. Values outside the range are coerced.                                                                                                                                                |
| `q`             | string          |                               — | Full text search over title, summary, description, and tags.                                                                                                                                                                    |
| `tag`           | string          |                               — | Exact match for a single tag.                                                                                                                                                                                                   |
| `metricIds`     | CSV of integers |                               — | One or more metric identifiers. Posting must include at least one of them.                                                                                                                                                      |
| `statusIds`     | CSV of integers |                     visible set | Optional narrowing to specific posting status identifiers. Defaults to the visible set when omitted.                                                                                                                            |
| `rewardTypeIds` | CSV of integers |                               — | Optional narrowing to specific reward type identifiers.                                                                                                                                                                         |
| `minReward`     | number          |                               — | Minimum reward value inclusive.                                                                                                                                                                                                 |
| `sort`          | string          | `createdOn:desc,postingId:desc` | Comma-separated list of fields with directions. Allowed fields are `createdOn`, `applyOpenAt`, `applyCloseAt`, `title`, `postingStatusId`, `rewardTypeId`. The server always appends `postingId:desc` for a stable tie breaker. |

Notes

1. Buyer filtering is not available on this route.
2. Unknown parameters are ignored.
3. When multiple filters are provided they all apply.

### Example requests

Basic, first page

```
GET /marketplace_postings
```

Specific page and size

```
GET /marketplace_postings?page=3&pageSize=10
```

Search with metric filtering and minimum reward

```
GET /marketplace_postings?q=hrv&metricIds=110,111&minReward=500
```

Tag filter with status narrowing

```
GET /marketplace_postings?tag=sleep&statusIds=2,3
```

Reward type filtering

```
GET /marketplace/postings?rewardTypeIds=1,3
```

Explicit sort by open time then id

```
GET /marketplace_postings?sort=applyOpenAt:desc,postingId:desc
```

---

## Examples

> Notes
>
> 1. All master references are identifiers only. Resolve names via master APIs.
> 2. Dates are UTC ISO 8601.

### Example dataset context (simple)

The responses below may include postings such as:

- 9102 — OPEN, metricIds `[110,111]` (HR, HRV), rewardTypeId `1`, apply window `2025-10-01` to `2025-10-31`
- 9103 — PAUSED, metricIds `[101,140]` (STEPS, KCAL), rewardTypeId `1`, apply window `2025-09-20` to `2025-10-20`
- 9110 — OPEN, metricIds `[120]` (SLEEP_MIN), rewardTypeId `1`, apply window `2025-10-05` to `2025-10-25`
- 9111 — OPEN, metricIds `[130,131]` (DISTANCE, FLOORS), rewardTypeId `1`, apply window `2025-10-02` to `2025-10-18`
- 9112 — OPEN, metricIds `[140]` (KCAL), rewardTypeId `3`, apply window `2025-10-03` to `2025-10-28`

Only postings that pass visibility rules are returned.

---

### 1) Basic: first page with defaults

```
GET /marketplace_postings
```

**200 OK**

```json
{
  "page": 1,
  "pageSize": 10,
  "hasNext": true,
  "items": [
    {
      "postingId": 9112,
      "title": "Active Energy Snapshot",
      "summary": "Share KCAL for 10 days.",
      "imageUrl": "https://cdn.example.com/p/9112.jpg",
      "postingStatusId": 2,
      "applyOpenAt": "2025-10-03T00:00:00Z",
      "applyCloseAt": "2025-10-28T23:59:59Z",
      "daysRemaining": 19,
      "reward": { "rewardTypeId": 3, "value": 250 },
      "metricIds": [140],
      "tags": ["kcal", "short"],
      "buyer": { "userId": 77, "displayName": "WellBio" },
      "createdOn": "2025-10-06T14:10:00Z"
    },
    {
      "postingId": 9111,
      "title": "Distance and Floors Challenge",
      "summary": "Log distance and floors for two weeks.",
      "imageUrl": "https://cdn.example.com/p/9111.jpg",
      "postingStatusId": 2,
      "applyOpenAt": "2025-10-02T00:00:00Z",
      "applyCloseAt": "2025-10-18T23:59:59Z",
      "daysRemaining": 9,
      "reward": { "rewardTypeId": 1, "value": 450 },
      "metricIds": [130, 131],
      "tags": ["distance", "floors"],
      "buyer": { "userId": 56, "displayName": "Stride Labs" },
      "createdOn": "2025-10-05T10:00:00Z"
    },
    {
      "postingId": 9110,
      "title": "Baseline Sleep Capture",
      "summary": "Share total sleep minutes for 14 days.",
      "imageUrl": "https://cdn.example.com/p/9110.jpg",
      "postingStatusId": 2,
      "applyOpenAt": "2025-10-05T00:00:00Z",
      "applyCloseAt": "2025-10-25T23:59:59Z",
      "daysRemaining": 16,
      "reward": { "rewardTypeId": 1, "value": 300 },
      "metricIds": [120],
      "tags": ["sleep", "baseline"],
      "buyer": { "userId": 42, "displayName": "Acme Research" },
      "createdOn": "2025-10-05T09:00:00Z"
    },
    {
      "postingId": 9102,
      "title": "Heart Rate Variability Study",
      "summary": "Daily HR and HRV for 30 days.",
      "imageUrl": "https://cdn.example.com/p/9102.jpg",
      "postingStatusId": 2,
      "applyOpenAt": "2025-10-01T00:00:00Z",
      "applyCloseAt": "2025-10-31T23:59:59Z",
      "daysRemaining": 22,
      "reward": { "rewardTypeId": 1, "value": 1200 },
      "metricIds": [110, 111],
      "tags": ["hr", "hrv", "month"],
      "buyer": { "userId": 42, "displayName": "Acme Research" },
      "createdOn": "2025-09-28T12:00:00Z"
    },
    {
      "postingId": 9103,
      "title": "Activity and Energy Correlation",
      "summary": "Steps and KCAL for 21 days.",
      "imageUrl": "https://cdn.example.com/p/9103.jpg",
      "postingStatusId": 3,
      "applyOpenAt": "2025-09-20T00:00:00Z",
      "applyCloseAt": "2025-10-20T23:59:59Z",
      "daysRemaining": 11,
      "reward": { "rewardTypeId": 1, "value": 800 },
      "metricIds": [101, 140],
      "tags": ["steps", "kcal"],
      "buyer": { "userId": 42, "displayName": "Acme Research" },
      "createdOn": "2025-09-15T10:00:00Z"
    }
  ]
}
```

---

### 2) Pagination: page 2 with custom page size

```
GET /marketplace_postings?page=2&pageSize=2
```

**200 OK**

```json
{
  "page": 2,
  "pageSize": 2,
  "hasNext": true,
  "items": [
    {
      "postingId": 9110,
      "title": "Baseline Sleep Capture",
      "summary": "Share total sleep minutes for 14 days.",
      "imageUrl": "https://cdn.example.com/p/9110.jpg",
      "postingStatusId": 2,
      "applyOpenAt": "2025-10-05T00:00:00Z",
      "applyCloseAt": "2025-10-25T23:59:59Z",
      "daysRemaining": 16,
      "reward": { "rewardTypeId": 1, "value": 300 },
      "metricIds": [120],
      "tags": ["sleep", "baseline"],
      "buyer": { "userId": 42, "displayName": "Acme Research" },
      "createdOn": "2025-10-05T09:00:00Z"
    },
    {
      "postingId": 9102,
      "title": "Heart Rate Variability Study",
      "summary": "Daily HR and HRV for 30 days.",
      "imageUrl": "https://cdn.example.com/p/9102.jpg",
      "postingStatusId": 2,
      "applyOpenAt": "2025-10-01T00:00:00Z",
      "applyCloseAt": "2025-10-31T23:59:59Z",
      "daysRemaining": 22,
      "reward": { "rewardTypeId": 1, "value": 1200 },
      "metricIds": [110, 111],
      "tags": ["hr", "hrv", "month"],
      "buyer": { "userId": 42, "displayName": "Acme Research" },
      "createdOn": "2025-09-28T12:00:00Z"
    }
  ]
}
```

---

### 3) Search with metrics and minimum reward

```
GET /marketplace/postings?q=hrv&metricIds=110,111&minReward=500
```

**200 OK**

```json
{
  "page": 1,
  "pageSize": 10,
  "hasNext": false,
  "items": [
    {
      "postingId": 9102,
      "title": "Heart Rate Variability Study",
      "summary": "Daily HR and HRV for 30 days.",
      "imageUrl": "https://cdn.example.com/p/9102.jpg",
      "postingStatusId": 2,
      "applyOpenAt": "2025-10-01T00:00:00Z",
      "applyCloseAt": "2025-10-31T23:59:59Z",
      "daysRemaining": 22,
      "reward": { "rewardTypeId": 1, "value": 1200 },
      "metricIds": [110, 111],
      "tags": ["hr", "hrv", "month"],
      "buyer": { "userId": 42, "displayName": "Acme Research" },
      "createdOn": "2025-09-28T12:00:00Z"
    }
  ]
}
```

---

### 4) Tag filter with status narrowing

```
GET /marketplace_postings?tag=sleep&statusIds=2,3
```

**200 OK**

```json
{
  "page": 1,
  "pageSize": 10,
  "hasNext": false,
  "items": [
    {
      "postingId": 9110,
      "title": "Baseline Sleep Capture",
      "summary": "Share total sleep minutes for 14 days.",
      "imageUrl": "https://cdn.example.com/defaults/posting.png",
      "postingStatusId": 2,
      "applyOpenAt": "2025-10-05T00:00:00Z",
      "applyCloseAt": "2025-10-25T23:59:59Z",
      "daysRemaining": 16,
      "reward": { "rewardTypeId": 1, "value": 300 },
      "metricIds": [120],
      "tags": ["sleep", "baseline"],
      "buyer": { "userId": 42, "displayName": "Acme Research" },
      "createdOn": "2025-10-05T09:00:00Z"
    }
  ]
}
```

---

### 5) Reward type filtering

```
GET /marketplace/postings?rewardTypeIds=1,3
```

**200 OK**

```json
{
  "page": 1,
  "pageSize": 10,
  "hasNext": true,
  "items": [
    {
      "postingId": 9112,
      "title": "Active Energy Snapshot",
      "summary": "Share KCAL for 10 days.",
      "imageUrl": "https://cdn.example.com/p/9112.jpg",
      "postingStatusId": 2,
      "applyOpenAt": "2025-10-03T00:00:00Z",
      "applyCloseAt": "2025-10-28T23:59:59Z",
      "daysRemaining": 19,
      "reward": { "rewardTypeId": 3, "value": 250 },
      "metricIds": [140],
      "tags": ["kcal", "short"],
      "buyer": { "userId": 77, "displayName": "WellBio" },
      "createdOn": "2025-10-06T14:10:00Z"
    },
    {
      "postingId": 9111,
      "title": "Distance and Floors Challenge",
      "summary": "Log distance and floors for two weeks.",
      "imageUrl": "https://cdn.example.com/p/9111.jpg",
      "postingStatusId": 2,
      "applyOpenAt": "2025-10-02T00:00:00Z",
      "applyCloseAt": "2025-10-18T23:59:59Z",
      "daysRemaining": 9,
      "reward": { "rewardTypeId": 1, "value": 450 },
      "metricIds": [130, 131],
      "tags": ["distance", "floors"],
      "buyer": { "userId": 56, "displayName": "Stride Labs" },
      "createdOn": "2025-10-05T10:00:00Z"
    }
  ]
}
```

---

### 6) Explicit sort by open time

```
GET /marketplace_postings?sort=applyOpenAt:desc,postingId:desc
```

**200 OK** (truncated)

```json
{
  "page": 1,
  "pageSize": 10,
  "hasNext": true,
  "items": [
    {
      "postingId": 9110,
      "title": "Baseline Sleep Capture",
      "summary": "Share total sleep minutes for 14 days.",
      "imageUrl": "https://cdn.example.com/defaults/posting.png",
      "postingStatusId": 2,
      "applyOpenAt": "2025-10-05T00:00:00Z",
      "applyCloseAt": "2025-10-25T23:59:59Z",
      "daysRemaining": 16,
      "reward": { "rewardTypeId": 1, "value": 300 },
      "metricIds": [120],
      "tags": ["sleep", "baseline"],
      "buyer": { "userId": 42, "displayName": "Acme Research" },
      "createdOn": "2025-10-05T09:00:00Z"
    }
  ]
}
```

---

### 7) Empty result example

```
GET /marketplace_postings?q=unobtanium
```

**200 OK**

```json
{
  "page": 1,
  "pageSize": 10,
  "hasNext": false,
  "items": []
}
```

---

### 8) Error example: unsupported sort field

```
GET /marketplace_postings?sort=foo:asc
```

**400 Bad Request**

```json
{
  "error": {
    "code": "UNSUPPORTED_SORT",
    "message": "field not allowed: foo"
  }
}
```

---

Fields

1. `page`, `pageSize`: Same pagination inputs after chages.
2. `hasNext`: Indicates whether another page is available.
3. `items`: Posting cards ordered by newest first with a deterministic tie breaker.
4. `postingStatusId`, `metricIds`, and `reward.rewardTypeId` are identifiers only. Clients must resolve these using master APIs.

When no results exist the server returns `200 OK` with `"items": []` and `"hasNext": false`.

## Errors

| HTTP | Code                      | When                                                                   | Example body                                                                            |
| ---: | ------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
|  400 | `INVALID_PARAMETER`       | Invalid `page`, `pageSize`, malformed CSV, or numeric coercion failure | `{"error":{"code":"INVALID_PARAMETER","message":"pageSize must be between 1 and 100"}}` |
|  400 | `UNSUPPORTED_SORT`        | Sort contains a field outside the allow list                           | `{"error":{"code":"UNSUPPORTED_SORT","message":"field not allowed: foo"}}`              |
|  413 | `RESULT_WINDOW_TOO_LARGE` | The computed offset exceeds the configured result window cap           | `{"error":{"code":"RESULT_WINDOW_TOO_LARGE","message":"reduce page or pageSize"}}`      |
|  429 | `RATE_LIMITED`            | The caller exceeds the allowed rate                                    | `{"error":{"code":"RATE_LIMITED","message":"too many requests"}}`                       |
|  500 | `INTERNAL`                | Unhandled server error                                                 | `{"error":{"code":"INTERNAL","message":"unexpected server error"}}`                     |
|  503 | `SERVICE_UNAVAILABLE`     | Database or dependency unavailable                                     | `{"error":{"code":"SERVICE_UNAVAILABLE","message":"temporarily unavailable"}}`          |

Exception handling rules

1. `page < 1` is coerced to `1`.
2. `pageSize` is coerced into `[1, 100]`.
3. Invalid `statusIds`, `metricIds`, or `rewardTypeIds` values are ignored if they do not exist in their respective master tables.
4. Invalid sort fields cause a `400 UNSUPPORTED_SORT`.
5. Unknown query parameters are ignored.

## How it works

1. Apply the visibility rules in the `WHERE` clause.
2. Apply optional filters for `q`, `tag`, `metricIds`, `statusIds`, `rewardTypeIds`, and `minReward`.
3. Order by `createdOn DESC, postingId DESC` unless a valid custom sort is provided. Always append `postingId DESC`.
4. Execute with `LIMIT pageSize + 1` and `OFFSET (page - 1) * pageSize` to compute `hasNext`.
5. Shape rows into the list card format with identifiers only.
6. Ensure `imageUrl` is always populated by applying a default when the posting has no image.

# GET /marketplace_postings — Implementation, Logic, and SQL

---

## Table dependencies

Data is read from:

- `MST_Posting` (`PostingId`, `BuyerUserId`, `PostingStatusId`, `Title`, `Summary`, `Description`, `ApplyOpenAt`, `ApplyCloseAt`, `RewardTypeId`, `RewardValue`, `IsActive`, `CreatedOn`)
- `MST_PostingStatus` (`PostingStatusId`, `Code`)
- `TRN_PostingImage` (`PostingId`, `ImageUrl`)
- `TRN_PostingTag` (`PostingId`, `Tag`)
- `TRN_PostingMetric` (`PostingId`, `MetricId`)
- `MST_RewardType` (`RewardTypeId`)
- `MST_User` (`UserId`, `Name`) to expose buyer displayName

The API returns identifiers for master data (`postingStatusId`, `metricIds`, `reward.rewardTypeId`). We resolves names via master endpoints.

---

## Parameter handling

Normalize and validate query parameters:

- `page`: integer, default 1, coerce `< 1` to `1`.
- `pageSize`: integer, default 10, clamp to `[1, 100]`.
- `q`: optional string. Full-text across `Title`, `Summary`, `Description`, plus tag text search.
- `tag`: optional string. Exact tag match.
- `metricIds`: CSV of integers. Convert to `int[]`. If empty after parsing, treat as `NULL`.
- `statusIds`: CSV of integers. If omitted, use server default visible set (typically OPEN and PAUSED) resolved to their ids once at process start and cached as `visible_status_ids`.
- `rewardTypeIds`: CSV of integers. Convert to `int[]`.
- `minReward`: numeric. Convert with culture-independent parsing.
- `sort`: comma-separated `field:direction`. Allow list: `createdOn`, `applyOpenAt`, `applyCloseAt`, `title`, `postingStatusId`, `rewardTypeId`. Always append `postingId DESC` as final tiebreaker.

Result window protection (optional): if `(page - 1) * pageSize + pageSize > 10000`, reject with `RESULT_WINDOW_TOO_LARGE`.

---

## Sorting resolver (server side)

Translate the user `sort` string into a secure SQL `ORDER BY` fragment. Reject unknown fields or directions. Example mapping:

- `createdOn` → `p."CreatedOn"`
- `applyOpenAt` → `p."ApplyOpenAt"`
- `applyCloseAt` → `p."ApplyCloseAt"`
- `title` → `p."Title"`
- `postingStatusId` → `p."PostingStatusId"`
- `rewardTypeId` → `p."RewardTypeId"`

Append `, p."PostingId" DESC` unconditionally.

---

## Drop-in SQL (PostgreSQL)

Use **named parameters** and a single SQL shape that supports optional filters via `(:param IS NULL OR ...)`. Execute the **page query** for rows and a **count query** for `total` if your API returns `total`. If you prefer `hasNext`, you can skip the count and fetch `pageSize + 1`.

### Bind variables

- `:page` integer
- `:pageSize` integer
- `:q` text or `NULL`
- `:tag` text or `NULL`
- `:metricIds` integer[] or `NULL`
- `:statusIds` integer[] or `NULL` (if `NULL`, server injects `visible_status_ids`)
- `:rewardTypeIds` integer[] or `NULL`
- `:minReward` numeric or `NULL`
- `:order_by` text (result of the server-side sort resolver; see note below)
- `:default_image_url` text (default image returned when a posting has no image)


---

### Page query (returns up to `pageSize` items and indicates `hasNext` via row count)

```sql
WITH base AS (
  SELECT
    p."PostingId",
    p."Title",
    p."Summary",
    p."PostingStatusId",
    p."ApplyOpenAt",
    p."ApplyCloseAt",
    p."RewardTypeId",
    p."RewardValue",
    p."BuyerUserId",
    p."CreatedOn",
  -- image with default fallback
    COALESCE(
    (SELECT img."ImageUrl"
        FROM "TRN_PostingImage" img
        WHERE img."PostingId" = p."PostingId"
        LIMIT 1),
    :default_image_url
    ) AS "ImageUrl",

    -- aggregated tags
    (SELECT COALESCE(ARRAY_AGG(t."Tag" ORDER BY t."Tag"), ARRAY[]::text[])
       FROM "TRN_PostingTag" t
      WHERE t."PostingId" = p."PostingId") AS "Tags",
    -- aggregated metric ids
    (SELECT COALESCE(ARRAY_AGG(pm."MetricId" ORDER BY pm."MetricId"), ARRAY[]::int[])
       FROM "TRN_PostingMetric" pm
      WHERE pm."PostingId" = p."PostingId") AS "MetricIds"
  FROM "MST_Posting" p
  JOIN "MST_PostingStatus" s ON s."PostingStatusId" = p."PostingStatusId"
  WHERE
    p."IsActive" = TRUE
    AND p."ApplyOpenAt" <= NOW()
    AND p."ApplyCloseAt" >= NOW()
    AND p."PostingStatusId" = ANY(COALESCE(:statusIds, :visible_status_ids))
    -- full-text over title/summary/description
    AND (
      :q IS NULL OR
      to_tsvector('simple',
        COALESCE(p."Title",'') || ' ' ||
        COALESCE(p."Summary",'') || ' ' ||
        COALESCE(p."Description",'')
      ) @@ plainto_tsquery(:q)
      OR EXISTS (
        SELECT 1
        FROM "TRN_PostingTag" tq
        WHERE tq."PostingId" = p."PostingId"
          AND to_tsvector('simple', COALESCE(tq."Tag",''))
              @@ plainto_tsquery(:q)
      )
    )
    -- exact tag filter
    AND (
      :tag IS NULL OR EXISTS (
        SELECT 1
        FROM "TRN_PostingTag" tg
        WHERE tg."PostingId" = p."PostingId" AND tg."Tag" = :tag
      )
    )
    -- metric filter (any match)
    AND (
      :metricIds IS NULL OR EXISTS (
        SELECT 1
        FROM "TRN_PostingMetric" pm2
        WHERE pm2."PostingId" = p."PostingId"
          AND pm2."MetricId" = ANY(:metricIds)
      )
    )
    -- reward type filter
    AND (
      :rewardTypeIds IS NULL OR p."RewardTypeId" = ANY(:rewardTypeIds)
    )
    -- minimum reward
    AND (
      :minReward IS NULL OR p."RewardValue" >= :minReward
    )
)
SELECT
  b."PostingId"        AS "postingId",
  b."Title"            AS "title",
  b."Summary"          AS "summary",
  b."ImageUrl"         AS "imageUrl",
  b."PostingStatusId"  AS "postingStatusId",
  b."ApplyOpenAt"      AS "applyOpenAt",
  b."ApplyCloseAt"     AS "applyCloseAt",
  GREATEST(0, CEIL(EXTRACT(EPOCH FROM (b."ApplyCloseAt" - NOW())) / 86400.0))::int AS "daysRemaining",
  JSON_BUILD_OBJECT(
    'rewardTypeId', b."RewardTypeId",
    'value',        b."RewardValue"
  )                   AS "reward",
  b."MetricIds"       AS "metricIds",
  b."Tags"            AS "tags",
  JSON_BUILD_OBJECT(
    'userId',       bu."UserId",
    'displayName',  bu."Name"
  )                   AS "buyer",
  b."CreatedOn"       AS "createdOn"
FROM base b
JOIN "MST_User" bu ON bu."UserId" = b."BuyerUserId"
ORDER BY
  -- insert validated ORDER BY fragment here; always end with PostingId DESC
  -- example: p.CreatedOn DESC, p.PostingId DESC
  -- see Sorting resolver section
  /*ORDER_BY*/ -- replace this comment with the resolved ORDER BY fragment
LIMIT (:pageSize + 1)
OFFSET (:page - 1) * :pageSize;
```

**How to use the extra row**

- If the result set length is greater than `pageSize`, set `hasNext = true` and drop the last row before returning.
- If the result set length is less than or equal to `pageSize`, set `hasNext = false`.

If your API must return `total`, run the count query below as well.

---

### Count query (optional, for `total`)

Use the same `WHERE` as the page query to avoid drift. To prevent duplication, keep the filter logic in one place in code and inject into both statements.

```sql
SELECT COUNT(*)::bigint AS total
FROM "MST_Posting" p
JOIN "MST_PostingStatus" s ON s."PostingStatusId" = p."PostingStatusId"
WHERE
  p."IsActive" = TRUE
  AND p."ApplyOpenAt" <= NOW()
  AND p."ApplyCloseAt" >= NOW()
  AND p."PostingStatusId" = ANY(COALESCE(:statusIds, :visible_status_ids))
  AND (
    :q IS NULL OR
    to_tsvector('simple',
      COALESCE(p."Title",'') || ' ' ||
      COALESCE(p."Summary",'') || ' ' ||
      COALESCE(p."Description",'')
    ) @@ plainto_tsquery(:q)
    OR EXISTS (
      SELECT 1
      FROM "TRN_PostingTag" tq
      WHERE tq."PostingId" = p."PostingId"
        AND to_tsvector('simple', COALESCE(tq."Tag",''))
            @@ plainto_tsquery(:q)
    )
  )
  AND (
    :tag IS NULL OR EXISTS (
      SELECT 1 FROM "TRN_PostingTag" tg
      WHERE tg."PostingId" = p."PostingId" AND tg."Tag" = :tag
    )
  )
  AND (
    :metricIds IS NULL OR EXISTS (
      SELECT 1 FROM "TRN_PostingMetric" pm2
      WHERE pm2."PostingId" = p."PostingId"
        AND pm2."MetricId" = ANY(:metricIds)
    )
  )
  AND (
    :rewardTypeIds IS NULL OR p."RewardTypeId" = ANY(:rewardTypeIds)
  )
  AND (
    :minReward IS NULL OR p."RewardValue" >= :minReward
  );
```

---

## Data shaping rules

Map SQL row fields to API fields:

- `"postingId"` ← `PostingId`
- `"title"` ← `Title`
- `"summary"` ← `Summary`
- `"imageUrl"` ← `COALESCE(TRN_PostingImage.ImageUrl, :default_image_url)`
- `"postingStatusId"` ← `PostingStatusId`
- `"applyOpenAt"` ← `ApplyOpenAt` (UTC ISO 8601)
- `"applyCloseAt"` ← `ApplyCloseAt` (UTC ISO 8601)
- `"daysRemaining"` ← computed in SQL using `ApplyCloseAt - NOW()`
- `"reward"` ← object with `rewardTypeId` and `value`
- `"metricIds"` ← aggregated `MetricId[]`
- `"tags"` ← aggregated `Tag[]`
- `"buyer"` ← object `{ userId: BuyerUserId, displayName: MST_User.Name }`
- `"createdOn"` ← `CreatedOn` (UTC ISO 8601)

---

## Indexing recommendations

```sql
-- Visibility + sort
CREATE INDEX IF NOT EXISTS idx_posting_visibility_sort
  ON "MST_Posting" ("IsActive", "PostingStatusId", "ApplyOpenAt", "ApplyCloseAt", "CreatedOn" DESC, "PostingId" DESC);

-- Metric filters
CREATE INDEX IF NOT EXISTS idx_posting_metric_posting_metric
  ON "TRN_PostingMetric" ("PostingId", "MetricId");

-- Tag filters
CREATE INDEX IF NOT EXISTS idx_posting_tag_posting_tag
  ON "TRN_PostingTag" ("PostingId", "Tag");

-- Optional: full-text on core text fields
CREATE INDEX IF NOT EXISTS idx_posting_fts
  ON "MST_Posting"
  USING GIN (to_tsvector('simple', COALESCE("Title",'') || ' ' || COALESCE("Summary",'') || ' ' || COALESCE("Description",'')));

-- Optional: full-text on tag values
CREATE INDEX IF NOT EXISTS idx_posting_tag_fts
  ON "TRN_PostingTag"
  USING GIN (to_tsvector('simple', COALESCE("Tag",'')));
```

---

## Error behavior

- Change `page` and `pageSize` to bounds. Reject if parsing fails.
- Reject `sort` when it contains fields outside the allow list.
- Ignore non-existent identifiers in `statusIds`, `metricIds`, `rewardTypeIds` after parsing.
- Unknown query parameters are ignored.

---
