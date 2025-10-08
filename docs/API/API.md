
This document explains som general considerations used and some things considered for the backend structre so it might help development 


# Storage Media Flow

This section explains how images are handled from upload to final storage in the system.

## 1. Upload Stage
- When a user uploads an image, the backend stores it in a **staging folder**.
- The backend returns an **assetId** and a **tempUrl** that points to the staging location.
- This `tempUrl` is used only for preview while the user is filling out the posting form.
- No posting record is updated at this stage.

## 2. Posting Save
- When the user submits the posting form, the frontend sends the `assetId` (or `tempUrl`) with the request body to the `postings_create` (or `postings_update`) API.
- The backend validates that the staging file belongs to the same buyer.

## 3. Promotion to Permanent Storage
- The backend **moves the file** from the staging folder to the **permanent posting folder**.
- A permanent **imageUrl** is generated, pointing to the new location under the posting’s ID.
- This `imageUrl` is stored in the posting record and returned in the API response.

## 4. Cleanup of Temporary Files
- After promotion, the staging file is no longer needed.
- The backend deletes the staging copy immediately, or opportunistically cleans old unused files during future uploads/saves.
- This frees space without requiring cron jobs or schedulers.

## 5. Summary
- **Upload API** handles raw files and returns `assetId` + `tempUrl`.  
- **Posting APIs** only deal with references (`assetId` / `tempUrl`) and final `imageUrl`.  
- Users always see the final `imageUrl` after the posting is created or updated.

<!-- 
# Media Upload API — Team Responsibilities

## Frontend
1. When a user selects or drags an image, call the **Upload API** with the file.
2. Receive `{ assetId, tempUrl }` in the response.
3. Show the image preview using the `tempUrl` while the form is still open.
4. When saving the posting, include the `assetId` (or `tempUrl`) in the request to `postings_create` or `postings_update`.
5. Do not send raw files to the Posting API — only the reference from the upload step.

## Backend
### Upload API
1. Authenticate and check that the `buyerId` in the path matches the logged-in user.
2. Validate the file (type and size) and sanitize the filename.
3. Save the file in the **staging folder**.
4. Return `{ assetId, tempUrl, fileName, contentType, bytes, createdOn }`.

### Postings API (Create/Update)
1. Accept `assetId` (or `tempUrl`) from the frontend.
2. Verify the staging file belongs to the same `buyerId`.
3. Move the file from the **staging folder** into the **permanent posting folder**.
4. Generate the final `imageUrl` and save it in the posting record.
5. Return the posting with the permanent `imageUrl`.
6. Remove the staging file (immediately or during later uploads) to free space. -->



---

## Media Upload and Storage

This section defines how media (e.g. posting images) is uploaded, stored, referenced, promoted to permanent storage, and cleaned up. It applies to both Frontend and Backend teams. 

---
<!-- 
## 1. Storage Areas

| Area                            | Purpose                                        | Example Path                                     |
| ------------------------------- | ---------------------------------------------- | ------------------------------------------------ |
| **Temporary (Staging)**         | Holds uploaded files before a posting is saved | `tmp/{buyerId}/{assetId}/{originalFileName}`     |
| **Permanent (Posting Storage)** | Holds media attached to a confirmed posting    | `postings/{buyerId}/{postingId}/{finalFileName}` |

---

## 2. When Upload Happens

* The upload API is called **immediately when the user selects a file** (via drag-and-drop or picker).
* This happens **before** the posting is saved/created.

---

## 3. Upload API

**Endpoint:**
`POST /buyers/{buyerId}/assets/upload`

**Request Format:**

* Content-Type: `multipart/form-data`
* Field: `file`

**Example Response:**

```json
{
  "assetId": "ast_7c2c2b0d",
  "fileName": "steps-banner.png",
  "tempUrl": "https://cdn.example.com/tmp/42/ast_7c2c2b0d/steps-banner.png",
  "uploadedAt": "2025-10-07T12:34:56Z"
}
```

---

## 4. Response Field Definitions

| Field      | Type   | Description                                                    |
| ---------- | ------ | -------------------------------------------------------------- |
| assetId    | string | Backend-generated unique identifier (UUID or prefixed ID).     |
| fileName   | string | Original filename uploaded by the user.                        |
| tempUrl    | string | Accessible preview URL pointing to the temporary staging area. |
| uploadedAt | string | ISO timestamp of when the upload was accepted.                 |

---

## 5. Frontend Responsibilities

* Display the image using `tempUrl`.
* Store `assetId` in posting form state.
* Include `"assetId": "ast_xxx"` when calling `POST /postings_create`.

---

## 6. Backend Responsibilities (Staging Phase)

* Create directory structure if missing.
* Store file in `tmp/{buyerId}/{assetId}/`.
* Generate `tempUrl`.
* Return `assetId + tempUrl`.

---

## 7. Promotion During Posting Create/Update

When posting create/update API receives `assetId`:

1. Locate file in temporary storage.
2. Move or copy into `postings/{buyerId}/{postingId}/finalFileName`.
3. Generate **permanent URL**.
4. Save **permanent `imageUrl`** into posting record.
5. Delete the temporary file.

---

## 8. Permanent URL Format

Example:

```
https://cdn.example.com/postings/42/9101/steps-banner.png
```

---

## 9. Handling Multiple Uploads Before Submission

* If user uploads twice, the frontend **replaces** the stored `assetId` with the latest one.
* Old temp files may remain unused — see cleanup.

---

## 10. Cleanup Strategy (No Cron Required)

| Situation                        | Cleanup Action                                                                                                 |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| After promotion                  | Immediately delete temp file.                                                                                  |
| Upload but no posting submission | Leave temp files. Delete older-than-X-hours when convenient (e.g. on next upload or via manual admin cleanup). |

---

## 11. Security Rules

| Rule               | Enforcement                               |
| ------------------ | ----------------------------------------- |
| Max file size      | Reject upload over limit.                 |
| Allowed MIME types | Validate JPEG/PNG only (or defined list). |
| Path safety        | Prevent traversal (`../`) attacks.        |
| Buyer isolation    | AssetId must belong to requesting buyer.  |

---

## 12. Error Handling

| Issue                                          | Response                                  |
| ---------------------------------------------- | ----------------------------------------- |
| Upload fails                                   | Return 400/500 with message.              |
| assetId missing or stale during posting create | Return 400 `"UnknownAssetId"`.            |
| Posting has no image                           | Allow `null`, backend may assign default. |

---

## 13. Updating/Replacing Posting Image

* On posting update, frontend may send a **new `assetId`**.
* Backend promotes new file, deletes old permanent image if needed.

---

## 14. File Naming Convention

* Original filename preserved when safe.
* Unsafe characters should be sanitized server-side.

---

## 15. End-to-End Summary

| Step | Action                            | Location                             |
| ---- | --------------------------------- | ------------------------------------ |
| 1    | User selects image                | Frontend triggers upload             |
| 2    | File stored temporarily           | `tmp/{buyerId}/{assetId}/file.ext`   |
| 3    | assetId + tempUrl returned        | Frontend previews                    |
| 4    | Posting is submitted with assetId | `POST /postings_create`              |
| 5    | Backend promotes file             | `postings/{buyerId}/{postingId}/...` |
| 6    | Temporary file deleted            | Staging cleaned                      |

--- -->


## Storage Media Flow

1. **Upload (Staging Phase)**

   * When a user selects an image, the frontend calls the Upload API.
   * The backend stores the file in a temporary **staging directory**:
     `tmp/{buyerId}/{assetId}/{fileName}`
   * The backend returns `assetId` and `tempUrl` (for preview only).
   * No posting is created or modified at this stage.

2. **Form Preview**

   * Frontend displays the image using `tempUrl`.
   * Frontend stores only the `assetId` as part of form state.

3. **Promotion on Posting Save (Create or Update)**

   * When the posting is submitted, frontend sends the stored `assetId`.
   * Backend verifies that staging folder belongs to the buyer.
   * Backend promotes the image into permanent storage:
     `postings/{buyerId}/{postingId}/{assetId}-{fileName}`
   * Backend sets `imageUrl` in the posting record referencing the permanent file.
   * Backend deletes the staged copy.

4. **Replacing an Existing Image**

   * Frontend uploads a new file → receives a new `assetId`.
   * On update, frontend sends the new `assetId`.
   * Backend promotes the new file and deletes the previous permanent file.
   * The posting `imageUrl` now points to the new permanent file.

5. **Removing an Image**

   * On update, if the image must be removed entirely, frontend sends `imageAction: "REMOVE"`.
   * Backend deletes the permanent file (or folder) and sets `imageUrl = null`.

---

## Media Upload API — Team Responsibilities

### Frontend Responsibilities

1. When a user selects or drags an image:

   * Call `POST /buyers/{buyerId}/assets/upload` with the raw file (`multipart/form-data`).
2. Receive `{ assetId, tempUrl }` from the response.
3. Immediately display the image preview using `tempUrl`.
4. When saving or updating a posting:

   * Include `"assetId": "<returnedId>"` in the body to attach or replace image.
   * To remove an image, send `"imageAction": "REMOVE"` instead of `assetId`.
5. Never send raw files to posting create or update API routes.

### Backend Responsibilities — Upload Handling

1. Authenticate and ensure `buyerId` in path matches authenticated user.

2. Validate file type and size.

3. Sanitize filename.

4. Generate a unique `assetId` (e.g. UUID).

5. Create staging directory: `tmp/{buyerId}/{assetId}/`.

6. Write the file into this directory.

7. Create a `meta.json` file in staging with:

   ```json
   {
     "uploadedAt": "<ISO timestamp>",
     "fileName": "<originalName>",
     "bytes": <fileSize>,
     "contentType": "<MIME type>"
   }
   ```

8. Return `{ assetId, tempUrl, fileName, contentType, bytes, uploadedAt }`.

### Backend Responsibilities — Posting Create/Update

1. Accept body containing either:

   * `assetId` → attach or replace image, or
   * `imageAction: "REMOVE"` → delete image
2. If `assetId` is provided:

   * Verify `tmp/{buyerId}/{assetId}/` exists.
   * Promote the staged file to permanent storage under:
     `postings/{buyerId}/{postingId}/{assetId}-{fileName}`
   * Update posting `imageUrl` with the new path.
   * Delete the staging directory.
3. If `imageAction: "REMOVE"`:

   * Delete current permanent file (or entire posting folder if only one file is allowed).
   * Set posting `imageUrl = null`.
4. If neither `assetId` nor `imageAction` is provided:

   * Leave image unchanged.

---

## Staging Metadata Structure

Each staged upload directory must contain:

**Path:**
`tmp/{buyerId}/{assetId}/meta.json`

**File Content:**

```json
{
  "uploadedAt": "2025-10-07T12:34:56Z",
  "fileName": "steps-banner.png",
  "bytes": 183204,
  "contentType": "image/png"
}
```

This file is used exclusively for TTL (expiry) and quota-based cleanup.

---

## Staging Cleanup & TTL Policy

1. **TTL Duration:** 24 hours.
2. **Cleanup Triggers:** Per-`buyerId` cleanup must run before:

   * Each new upload.
   * Each posting create/update.
3. **Cleanup Logic:**

   * Compute `cutoff = nowUTC - TTL`.
   * List all folders in `tmp/{buyerId}/`.
   * For each folder:

     * Read `uploadedAt` from `meta.json` (or folder mtime if unavailable).
     * If `uploadedAt < cutoff`, delete the entire folder.
4. **Quota Enforcement (after TTL deletions):**

   * Maximum 10 staged assets or 50 MB per buyer.
   * If limits are still exceeded after TTL removal, delete oldest folders until under the limit.
5. **Failed Deletions:**

   * If a file cannot be deleted (e.g. locked), create a `.tombstone` marker and retry on next cleanup trigger.

---

## Example Scenarios

### Scenario 1: Upload → Save → Clean

* Day 1, 10:00: User uploads `banner.png`

  * Stored at `tmp/42/ast_a1/banner.png`, returned `assetId=ast_a1`
* Day 1, 10:05: User submits posting with `assetId=ast_a1`

  * Promoted to `postings/42/9101/ast_a1-banner.png`
  * `imageUrl` set accordingly
  * `tmp/42/ast_a1/` deleted immediately

### Scenario 2: Multiple Uploads Before Save

* User uploads `banner.png` → `ast_a1`
* User uploads again (new image) → `ast_a2`
* Frontend discards `ast_a1` and only sends `ast_a2` on save
* Promotion uses `ast_a2`; `ast_a1` remains in staging
* On next upload or save, TTL/Quota logic deletes `ast_a1`

### Scenario 3: Image Replacement After Posting Exists

* Posting currently has `imageUrl = .../ast_a1-banner.png`
* User uploads a new file → receives `ast_b2`
* Frontend sends `assetId=ast_b2` in update
* Backend promotes `ast_b2` to permanent path
* Backend deletes old permanent `ast_a1-banner.png`
* Staging for `ast_b2` is deleted after promotion

### Scenario 4: Removing Image

* Posting currently has `imageUrl = .../ast_a1-banner.png`
* Frontend sends `"imageAction": "REMOVE"`
* Backend deletes the permanent file
* Posting `imageUrl` becomes `null`

---

# How to handle errors for APIs:


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








