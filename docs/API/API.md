
This document explains som general considerations used and some things considered for the backd=edn structre so it mught hel infuture 


## How to handle errors for APIs:


Every request must:

1. Generate a `requestId` (UUID)
2. Use `try/catch`
3. Log failures into `TRN_ErrorLog`
4. Return a JSON error response

---

## Standard Error Response Format

```json
{
  "code": "INTERNAL_ERROR",
  "message": "Something went wrong. Please try again.",
  "details": [],
  "requestId": "<the same requestId>"
}

```

Validation Error Example
```json
{
  "field": "raceId",
  "issue": "FOREIGN_KEY_INACTIVE",
  "value": 99
}
```

Controller Pseudocode (Try/Catch Pattern)

```
const requestId = uuid();
try {
  // ... normal flow (db reads/writes)
  return res.status(200).json(result);
} catch (err) {
  // Best-effort log; never throw inside the logger
  logToTrnErrorLog({
    requestId,
    endpoint: req.path,
    httpMethod: req.method,
    statusCode: inferStatus(err) ?? 500,
    errorCode: inferCode(err) ?? 'INTERNAL_ERROR',
    message: safeMsg(err),
    details: safeDetails(err),           // JSON (small!)
    stackTrace: env.isProd ? null : String(err.stack || ''),
    payload: pickBody(req.body),         // remove secrets/PII
    query: req.query,
    pathParams: req.params,
    headers: pickHeaders(req.headers),   // remove auth tokens
    dbOp: lastDbOpName,                  // optional
    dbError: lastDbError,                // optional
    userId: authenticatedUserId || null,
    buyerId: inferredBuyerId || null,
    environment: env.name,               // dev/stage/prod
    host: os.hostname(),
  });

  return res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'Something went wrong. Please try again.',
    details: [],
    requestId
  });
}

```

## TRN_ErrorLog Table

Purpose: Central log for all unexpected API failures.

Type: TRN table (audit fields are intentional here).
```sql
CREATE TABLE "TRN_ErrorLog" (
  "ErrorLogId"          BIGSERIAL PRIMARY KEY,
  "OccurredAt"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "RequestId"           UUID        NOT NULL,
  "Endpoint"            TEXT        NOT NULL,
  "HttpMethod"          TEXT        NOT NULL,

  "StatusCode"          INT         NOT NULL,
  "ErrorCode"           TEXT        NOT NULL,
  "Message"             TEXT        NOT NULL,

  "Details"             JSONB,
  "StackTrace"          TEXT,
  "Payload"             JSONB,
  "Query"               JSONB,
  "PathParams"          JSONB,
  "Headers"             JSONB,
  "DbOp"                TEXT,
  "DbError"             TEXT,

  "UserId"              INT         NULL,
  "BuyerId"             INT         NULL,
  "Environment"         TEXT        NULL,
  "Host"                TEXT        NULL
);

```

- Helpful indexes
```sql

CREATE INDEX IF NOT EXISTS "ix_err_OccurredAt" ON "TRN_ErrorLog" ("OccurredAt" DESC);
CREATE INDEX IF NOT EXISTS "ix_err_RequestId"  ON "TRN_ErrorLog" ("RequestId");
CREATE INDEX IF NOT EXISTS "ix_err_StatusCode" ON "TRN_ErrorLog" ("StatusCode");
CREATE INDEX IF NOT EXISTS "ix_err_Endpoint"   ON "TRN_ErrorLog" ("Endpoint");
CREATE INDEX IF NOT EXISTS "ix_err_ErrorCode"  ON "TRN_ErrorLog" ("ErrorCode");
CREATE INDEX IF NOT EXISTS "ix_err_UserId"     ON "TRN_ErrorLog" ("UserId");
CREATE INDEX IF NOT EXISTS "ix_err_BuyerId"    ON "TRN_ErrorLog" ("BuyerId");
```




## Sanitization Reminder

- Never store:

- Raw tokens

- Passwords

- Sensitive PII

## Only store minimal, relevant info in:

- Payload

- Headers

## Example Entries (Sample Rows)
```json
[
  {
    "ErrorLogId": 1,
    "OccurredAt": "2025-10-04T21:35:12Z",
    "RequestId": "5d0a8c86-4a5a-4d3b-a9a5-b1b7b8f12f0b",
    "Endpoint": "/users/9999",
    "HttpMethod": "GET",
    "StatusCode": 404,
    "ErrorCode": "NOT_FOUND",
    "Message": "User not found",
    "Details": { "userId": 9999 },
    "StackTrace": null,
    "Payload": null,
    "Query": {},
    "PathParams": { "userId": "9999" },
    "Headers": { "x-forwarded-for": "203.0.113.10" },
    "DbOp": "select_user_by_id",
    "DbError": null,
    "UserId": null,
    "BuyerId": null,
    "Environment": "prod",
    "Host": "api-1"
  },
  {
    "ErrorLogId": 2,
    "OccurredAt": "2025-10-04T21:36:40Z",
    "RequestId": "9e3a2a0f-22bb-45c4-9a58-1f6a0b2b5de2",
    "Endpoint": "/users",
    "HttpMethod": "POST",
    "StatusCode": 400,
    "ErrorCode": "VALIDATION_FAILED",
    "Message": "raceId refers to an inactive race",
    "Details": [
      { "field": "raceId", "issue": "FOREIGN_KEY_INACTIVE", "value": 99 }
    ],
    "StackTrace": null,
    "Payload": { "email": "a@b.com", "name": "Alex", "raceId": 99 },
    "Query": {},
    "PathParams": {},
    "Headers": { "content-type": "application/json" },
    "DbOp": "insert_user",
    "DbError": null,
    "UserId": null,
    "BuyerId": null,
    "Environment": "stage",
    "Host": "api-2"
  },
  {
    "ErrorLogId": 3,
    "OccurredAt": "2025-10-04T21:38:05Z",
    "RequestId": "b4a2c4e0-baf5-4d3b-8bcb-2d8f9bb393e7",
    "Endpoint": "/users/1002",
    "HttpMethod": "PATCH",
    "StatusCode": 500,
    "ErrorCode": "INTERNAL_ERROR",
    "Message": "Something went wrong. Please try again.",
    "Details": [],
    "StackTrace": "Error: duplicate key value violates unique constraint ...",
    "Payload": { "roleId": 2, "healthConditionIds": [205] },
    "Query": {},
    "PathParams": { "userId": "1002" },
    "Headers": { "content-type": "application/json" },
    "DbOp": "replace_user_health_conditions",
    "DbError": "23505 unique_violation",
    "UserId": 1002,
    "BuyerId": null,
    "Environment": "dev",
    "Host": "mohit-laptop"
  }
]
```

Where to place it 

GET 
- Catch DB not-found, join errors → log row with ErrorCode = NOT_FOUND or INTERNAL_ERROR.

POST
- Catch validation/FK issues (VALIDATION_FAILED) or unique email (CONFLICT) or general (INTERNAL_ERROR). Always include sanitized Payload.

PATCH 
- Catch update conflicts, FK issues, array replace errors on TRN_UserHealthCondition. Log the provided Payload (sanitized) and the DbOp that failed.








