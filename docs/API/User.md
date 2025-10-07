<!-- ## API Structure

## User 

API names 

1. GET /users/{userId}

Purpose: Fetch a single user by ID and return their full profile details (used for profile screen display).

 2. POST /users

Purpose: Create a new user by saving all provided user details into the database.

3. PATCH /users/{userId}

Purpose: Partially update an existing user’s details (only the fields you send will change).

Tables involved in User APIs:
🔹 Main Table

MST_User

🔹 Master Lookups (read-only)

MST_Race

MST_Sex

MST_Unit

MST_MeasurementSystem

MST_Role

MST_HealthCondition

🔹 Link Table

TRN_UserHealthCondition


MST_User

Purpose: Primary user record.

Fields

UserId (PK, int)

ClerkId (text, unique, nullable)

Email (text, unique, required)

Name (text, required)

BirthYear (int, nullable)

RaceId (FK → MST_Race.RaceId, nullable)

SexId (FK → MST_Sex.SexId, nullable)

HeightNum (numeric, nullable)

HeightUnitId (FK → MST_Unit.UnitId, nullable)

WeightNum (numeric, nullable)

WeightUnitId (FK → MST_Unit.UnitId, nullable)

MeasurementSystemId (FK → MST_MeasurementSystem.MeasurementSystemId, nullable)

IsActive (bool, default true)

IsModified (bool, default false)

CreatedBy (int, nullable)

CreatedOn (timestamptz, default now)

ModifiedBy (int, nullable)

ModifiedOn (timestamptz, nullable)

FK Connections

RaceId → MST_Race

SexId → MST_Sex

HeightUnitId, WeightUnitId → MST_Unit

MeasurementSystemId → MST_MeasurementSystem

Examples (5)

[
  {
    "UserId": 1001, "ClerkId": "usr_abc123", "Email": "john@example.com", "Name": "John Lee",
    "BirthYear": 1994, "RaceId": 1, "SexId": 1, "HeightNum": 168.0, "HeightUnitId": 2,
    "WeightNum": 62.0, "WeightUnitId": 4, "MeasurementSystemId": 1,
    "IsActive": true, "IsModified": false, "CreatedBy": 2001,
    "CreatedOn": "2025-09-10T10:00:00Z", "ModifiedBy": 2001, "ModifiedOn": "2025-09-18T09:00:00Z"
  },
  {
    "UserId": 1002, "ClerkId": "usr_k9z77", "Email": "alex@example.com", "Name": "Alex W",
    "BirthYear": 1999, "RaceId": 2, "SexId": 2, "HeightNum": 175.3, "HeightUnitId": 2,
    "WeightNum": 72.5, "WeightUnitId": 5, "MeasurementSystemId": 1,
    "IsActive": true, "IsModified": true, "CreatedBy": 2001,
    "CreatedOn": "2025-09-15T08:20:00Z", "ModifiedBy": 2002, "ModifiedOn": "2025-09-18T12:05:00Z"
  },
  {
    "UserId": 1003, "ClerkId": null, "Email": "rachel@example.com", "Name": "Rachel Kim",
    "BirthYear": 1987, "RaceId": 3, "SexId": 2, "HeightNum": 64.0, "HeightUnitId": 6,
    "WeightNum": 128.0, "WeightUnitId": 7, "MeasurementSystemId": 2,
    "IsActive": true, "IsModified": false, "CreatedBy": 2003,
    "CreatedOn": "2025-09-11T14:00:00Z", "ModifiedBy": null, "ModifiedOn": null
  },
  {
    "UserId": 1004, "ClerkId": "usr_tt442", "Email": "mike@example.com", "Name": "Mike Chen",
    "BirthYear": 1991, "RaceId": 4, "SexId": 1, "HeightNum": null, "HeightUnitId": null,
    "WeightNum": null, "WeightUnitId": null, "MeasurementSystemId": null,
    "IsActive": true, "IsModified": false, "CreatedBy": 2001,
    "CreatedOn": "2025-09-17T09:45:00Z", "ModifiedBy": null, "ModifiedOn": null
  },
  {
    "UserId": 1005, "ClerkId": "usr_pq901", "Email": "sam@example.com", "Name": "Sam Rivera",
    "BirthYear": 2000, "RaceId": 1, "SexId": 3, "HeightNum": 180.0, "HeightUnitId": 2,
    "WeightNum": 80.0, "WeightUnitId": 4, "MeasurementSystemId": 1,
    "IsActive": false, "IsModified": true, "CreatedBy": 2004,
    "CreatedOn": "2025-09-12T11:30:00Z", "ModifiedBy": 2004, "ModifiedOn": "2025-09-19T16:10:00Z"
  }
]

MST_Race

Purpose: Master list of race values.

Fields

RaceId (PK, int)

RaceCode (text, unique)

RaceDisplayName (text)

IsActive (bool)

IsModified, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn

Examples (5)

[
  { "RaceId": 1, "RaceCode": "ASIAN", "RaceDisplayName": "Asian", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-09-01T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "RaceId": 2, "RaceCode": "WHITE", "RaceDisplayName": "White", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-09-01T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "RaceId": 3, "RaceCode": "BLACK", "RaceDisplayName": "Black or African American", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-09-01T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "RaceId": 4, "RaceCode": "HISPANIC", "RaceDisplayName": "Hispanic or Latino", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-09-01T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "RaceId": 5, "RaceCode": "OTHER", "RaceDisplayName": "Other / Prefer to self-describe", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-09-01T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null }
]

MST_Sex

Purpose: Master list for sex assigned at birth.

Fields

SexId (PK, int)

SexCode (text, unique) — e.g., M, F, X

SexDisplayName (text)

IsActive (bool)

IsModified, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn

Examples (5)

[
  { "SexId": 1, "SexCode": "M", "SexDisplayName": "Male", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-09-01T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "SexId": 2, "SexCode": "F", "SexDisplayName": "Female", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-09-01T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "SexId": 3, "SexCode": "X", "SexDisplayName": "Intersex / X", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-09-01T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "SexId": 4, "SexCode": "UNK", "SexDisplayName": "Unknown", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-09-01T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "SexId": 5, "SexCode": "DECLINE", "SexDisplayName": "Prefer not to say", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-09-01T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null }
]

MST_Unit

Purpose: Measurement units (height/weight/HR/etc.).

Fields

UnitId (PK, int)

UnitCode (text, unique) — e.g., CM, KG, IN, LB, BPM, COUNT

UnitDisplayName (text)

IsActive (bool)

IsModified, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn

Examples (5)

[
  { "UnitId": 2, "UnitCode": "CM", "UnitDisplayName": "Centimeter", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-30T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "UnitId": 4, "UnitCode": "KG", "UnitDisplayName": "Kilogram", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-30T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "UnitId": 5, "UnitCode": "BPM", "UnitDisplayName": "Beats Per Minute", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-30T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "UnitId": 6, "UnitCode": "IN", "UnitDisplayName": "Inch", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-30T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "UnitId": 7, "UnitCode": "LB", "UnitDisplayName": "Pound", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-30T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null }
]

MST_MeasurementSystem

Purpose: Metric vs Imperial.

Fields

MeasurementSystemId (PK, int)

MeasurementSystemCode (text, unique) — METRIC, IMPERIAL

MeasurementSystemDisplayName (text)

IsActive (bool)

IsModified, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn

Examples (5)

[
  { "MeasurementSystemId": 1, "MeasurementSystemCode": "METRIC", "MeasurementSystemDisplayName": "Metric", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-30T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "MeasurementSystemId": 2, "MeasurementSystemCode": "IMPERIAL", "MeasurementSystemDisplayName": "Imperial", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-30T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "MeasurementSystemId": 3, "MeasurementSystemCode": "CUSTOM", "MeasurementSystemDisplayName": "Custom", "IsActive": false, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-30T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "MeasurementSystemId": 4, "MeasurementSystemCode": "SI", "MeasurementSystemDisplayName": "SI Units", "IsActive": false, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-30T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "MeasurementSystemId": 5, "MeasurementSystemCode": "LEGACY", "MeasurementSystemDisplayName": "Legacy", "IsActive": false, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-30T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null }
]

MST_Role

Purpose: Role catalog (lookup only for user profile expansions).

Fields

RoleId (PK, int)

RoleCode (text, unique) — e.g., USER, BUYER, BUYER_ADMIN, etc

RoleDisplayName (text)

IsActive (bool)

IsModified, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn

Examples (5)

[
  { "RoleId": 1, "RoleCode": "USER", "RoleDisplayName": "USER", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-29T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "RoleId": 2, "RoleCode": "BUYER", "RoleDisplayName": "BUYER", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-29T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "RoleId": 3, "RoleCode": "BUYER_ADMIN", "RoleDisplayName": "Buyer Admin", "IsActive": true, "IsModified": false, "CreatedBy": 2, "CreatedOn": "2025-08-30T03:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "RoleId": 4, "RoleCode": "VIEW_ONLY", "RoleDisplayName": "View Only", "IsActive": true, "IsModified": false, "CreatedBy": 2, "CreatedOn": "2025-08-30T03:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "RoleId": 5, "RoleCode": "SYSTEM", "RoleDisplayName": "System", "IsActive": false, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-29T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null }
]


Note: Roles are lookup-only here (no TRN_UserRole per your setup). If user roles are provided from another system, you’ll still expand codes/display names from this master.

MST_HealthCondition

Purpose: Catalog of health conditions for users and posting eligibility.

Fields

HealthConditionId (PK, int)

Code (text, unique) — e.g., T2D, HYPERTENSION

DisplayName (text)

IsActive (bool)

IsModified, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn

Examples (5)

[
  { "HealthConditionId": 205, "Code": "T2D", "DisplayName": "Type 2 Diabetes", "IsActive": true, "IsModified": false, "CreatedBy": 10, "CreatedOn": "2025-08-25T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "HealthConditionId": 310, "Code": "HYPERTENSION", "DisplayName": "Hypertension", "IsActive": true, "IsModified": false, "CreatedBy": 10, "CreatedOn": "2025-08-25T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "HealthConditionId": 411, "Code": "ASTHMA", "DisplayName": "Asthma", "IsActive": true, "IsModified": false, "CreatedBy": 10, "CreatedOn": "2025-08-25T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "HealthConditionId": 512, "Code": "PCOS", "DisplayName": "Polycystic Ovary Syndrome", "IsActive": true, "IsModified": false, "CreatedBy": 11, "CreatedOn": "2025-08-26T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "HealthConditionId": 613, "Code": "CVD", "DisplayName": "Cardiovascular Disease", "IsActive": false, "IsModified": false, "CreatedBy": 11, "CreatedOn": "2025-08-26T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null }
]

TRN_UserHealthCondition

Purpose: Link a user to one or more health conditions, with optional notes. (This is the only TRN table in user ops per your setup.)
Fields

UserId (FK → MST_User.UserId)

HealthConditionId (FK → MST_HealthCondition.HealthConditionId)

Composite PK

(UserId, HealthConditionId)

Examples (5)

[
  { "UserId": 1001, "HealthConditionId": 205 },
  { "UserId": 1001, "HealthConditionId": 310 },
  { "UserId": 1002, "HealthConditionId": 205 },
  { "UserId": 1003, "HealthConditionId": 411 },
  { "UserId": 1005, "HealthConditionId": 205 }
]


How they connect (summary)

MST_User holds the core profile and FK pointers.

MST_Race / MST_Sex / MST_Unit / MST_MeasurementSystem / MST_Role / MST_HealthCondition supply codes & display names for flat expansions in API responses.

TRN_UserHealthCondition provides the many-to-many link between users and health conditions (with optional notes).



## API Description 


1) GET /users/{userId}

Name: Get User by ID
Frontend sends:

Path param: userId (integer)

Returns (200): application/json — UserProfile (flat, FK expansions)

Fields returned

userId, clerkId, email, name, birthYear

Race: raceId, raceCode, raceDisplayName

Sex: sexId, sexCode, sexDisplayName

Height: heightNum, heightUnitId, heightUnitCode, heightUnitDisplayName

Weight: weightNum, weightUnitId, weightUnitCode, weightUnitDisplayName

Measurement system: measurementSystemId, measurementSystemCode, measurementSystemDisplayName

Role (single): roleId, roleCode, roleDisplayName

Health conditions: healthConditionIds (int[]), healthConditions (array of { healthConditionId, code, displayName, isActive })

Audit: isActive, createdBy, createdOn, modifiedBy, modifiedOn

Example (request)
GET /users/1002

Example (response 200)
{
  "userId": 1002,
  "clerkId": "usr_abc123",
  "email": "alex@example.com",
  "name": "Alex Doe",
  "birthYear": 1999,

  "raceId": 1, "raceCode": "ASIAN", "raceDisplayName": "Asian",
  "sexId": 1, "sexCode": "M", "sexDisplayName": "Male",

  "heightNum": 175.3,
  "heightUnitId": 2, "heightUnitCode": "CM", "heightUnitDisplayName": "Centimeter",
  "weightNum": 72.5,
  "weightUnitId": 4, "weightUnitCode": "KG", "weightUnitDisplayName": "Kilogram",

  "measurementSystemId": 1,
  "measurementSystemCode": "METRIC",
  "measurementSystemDisplayName": "Metric",

  "roleId": 2,
  "roleCode": "USER",
  "roleDisplayName": "USER",

  "healthConditionIds": [205, 310],
  "healthConditions": [
    { "healthConditionId": 205, "code": "T2D", "displayName": "Type 2 Diabetes", "isActive": true },
    { "healthConditionId": 310, "code": "HYPERTENSION", "displayName": "Hypertension", "isActive": true }
  ],

  "isActive": true,
  "createdBy": 1002,
  "createdOn": "2025-09-18T09:00:00Z",
  "modifiedBy": null,
  "modifiedOn": null
}

2) POST /users

Name: Create User
Frontend sends:

Body (JSON):

Required: email, name, roleId

Optional: clerkId, birthYear, raceId, sexId, heightNum, heightUnitId, weightNum, weightUnitId, measurementSystemId, healthConditionIds (int[])

Returns (201): application/json — UserProfile (flat, FK expansions)

Note: On creation, createdBy = userId (self-created).

Example (request body)
{
  "clerkId": "usr_abc123",
  "email": "alex@example.com",
  "name": "Alex Doe",
  "roleId": 2,
  "birthYear": 1999,
  "raceId": 1,
  "sexId": 1,
  "heightNum": 175.3,
  "heightUnitId": 2,
  "weightNum": 72.5,
  "weightUnitId": 4,
  "measurementSystemId": 1,
  "healthConditionIds": [205, 310]
}

Example (response 201)
{
  "userId": 1002,
  "clerkId": "usr_abc123",
  "email": "alex@example.com",
  "name": "Alex Doe",
  "birthYear": 1999,

  "raceId": 1, "raceCode": "ASIAN", "raceDisplayName": "Asian",
  "sexId": 1, "sexCode": "M", "sexDisplayName": "Male",

  "heightNum": 175.3,
  "heightUnitId": 2, "heightUnitCode": "CM", "heightUnitDisplayName": "Centimeter",
  "weightNum": 72.5,
  "weightUnitId": 4, "weightUnitCode": "KG", "weightUnitDisplayName": "Kilogram",

  "measurementSystemId": 1,
  "measurementSystemCode": "METRIC",
  "measurementSystemDisplayName": "Metric",

  "roleId": 2,
  "roleCode": "USER",
  "roleDisplayName": "USER",

  "healthConditionIds": [205, 310],
  "healthConditions": [
    { "healthConditionId": 205, "code": "T2D", "displayName": "Type 2 Diabetes", "isActive": true },
    { "healthConditionId": 310, "code": "HYPERTENSION", "displayName": "Hypertension", "isActive": true }
  ],

  "isActive": true,
  "createdBy": 1002,
  "createdOn": "2025-09-18T09:00:00Z",
  "modifiedBy": null,
  "modifiedOn": null
}

3) PATCH /users/{userId}

Name: Update User (Partial)
Frontend sends:

Path param: userId (integer)

Body (JSON): any subset of fields to change

Allowed: name, birthYear, raceId, sexId, heightNum, heightUnitId, weightNum, weightUnitId, measurementSystemId, roleId (single), healthConditionIds (int[]), isActive

Returns (200): application/json — UserProfile (flat, FK expansions)

Example A (request body — role & conditions)
{
  "roleId": 2,
  "healthConditionIds": [205]
}

Example A (response 200)
{
  "userId": 1002,
  "clerkId": "usr_abc123",
  "email": "alex@example.com",
  "name": "Alex Doe",
  "birthYear": 1999,

  "raceId": 1, "raceCode": "ASIAN", "raceDisplayName": "Asian",
  "sexId": 1, "sexCode": "M", "sexDisplayName": "Male",

  "heightNum": 175.3,
  "heightUnitId": 2, "heightUnitCode": "CM", "heightUnitDisplayName": "Centimeter",
  "weightNum": 72.5,
  "weightUnitId": 4, "weightUnitCode": "KG", "weightUnitDisplayName": "Kilogram",

  "measurementSystemId": 1,
  "measurementSystemCode": "METRIC",
  "measurementSystemDisplayName": "Metric",

  "roleId": 2,
  "roleCode": "USER",
  "roleDisplayName": "USER",

  "healthConditionIds": [205],
  "healthConditions": [
    { "healthConditionId": 205, "code": "T2D", "displayName": "Type 2 Diabetes", "isActive": true }
  ],

  "isActive": true,
  "createdBy": 1002,
  "createdOn": "2025-09-18T09:00:00Z",
  "modifiedBy": 1002,
  "modifiedOn": "2025-09-18T12:05:00Z"
}

Example B (request body — physical attributes)
{
  "heightNum": 180.0,
  "heightUnitId": 2,
  "weightNum": 80.0,
  "weightUnitId": 4
}

Example B (response 200)
{
  "userId": 1002,
  "clerkId": "usr_abc123",
  "email": "alex@example.com",
  "name": "Alex Doe",
  "birthYear": 1999,

  "raceId": 1, "raceCode": "ASIAN", "raceDisplayName": "Asian",
  "sexId": 1, "sexCode": "M", "sexDisplayName": "Male",

  "heightNum": 180.0,
  "heightUnitId": 2, "heightUnitCode": "CM", "heightUnitDisplayName": "Centimeter",
  "weightNum": 80.0,
  "weightUnitId": 4, "weightUnitCode": "KG", "weightUnitDisplayName": "Kilogram",

  "measurementSystemId": 1,
  "measurementSystemCode": "METRIC",
  "measurementSystemDisplayName": "Metric",

  "roleId": 2,
  "roleCode": "USER",
  "roleDisplayName": "USER",

  "healthConditionIds": [205],
  "healthConditions": [
    { "healthConditionId": 205, "code": "T2D", "displayName": "Type 2 Diabetes", "isActive": true }
  ],

  "isActive": true,
  "createdBy": 1002,
  "createdOn": "2025-09-18T09:00:00Z",
  "modifiedBy": 1002,
  "modifiedOn": "2025-09-18T12:45:00Z"
}


## Backned query logic which will help

GET /users/{userId} — Get User by ID
Tables touched

Read: MST_User u

Lookup joins: MST_Race r, MST_Sex s, MST_Unit hu, MST_Unit wu, MST_MeasurementSystem ms, MST_Role ro

Link (for conditions): TRN_UserHealthCondition uhc + MST_HealthCondition hc

SQL (returns the exact flat shape)
WITH base AS (
  SELECT
    u."UserId",
    u."ClerkId",
    u."Email",
    u."Name",
    u."BirthYear",

    u."RaceId",
    r."RaceCode",
    r."RaceDisplayName",

    u."SexId",
    s."SexCode",
    s."SexDisplayName",

    u."HeightNum",
    u."HeightUnitId",
    hu."UnitCode"  AS "HeightUnitCode",
    hu."UnitDisplayName" AS "HeightUnitDisplayName",

    u."WeightNum",
    u."WeightUnitId",
    wu."UnitCode"  AS "WeightUnitCode",
    wu."UnitDisplayName" AS "WeightUnitDisplayName",

    u."MeasurementSystemId",
    ms."MeasurementSystemCode",
    ms."MeasurementSystemDisplayName",

    u."RoleId",
    ro."RoleCode",
    ro."RoleDisplayName",

    u."IsActive",
    u."CreatedBy",
    u."CreatedOn",
    u."ModifiedBy",
    u."ModifiedOn"
  FROM "MST_User" u
  LEFT JOIN "MST_Race" r ON r."RaceId" = u."RaceId"
  LEFT JOIN "MST_Sex" s ON s."SexId" = u."SexId"
  LEFT JOIN "MST_Unit" hu ON hu."UnitId" = u."HeightUnitId"
  LEFT JOIN "MST_Unit" wu ON wu."UnitId" = u."WeightUnitId"
  LEFT JOIN "MST_MeasurementSystem" ms ON ms."MeasurementSystemId" = u."MeasurementSystemId"
  LEFT JOIN "MST_Role" ro ON ro."RoleId" = u."RoleId"
  WHERE u."UserId" = :userId
)
SELECT
  b.*,
  COALESCE(ARRAY_AGG(uhc."HealthConditionId" ORDER BY uhc."HealthConditionId") 
           FILTER (WHERE uhc."HealthConditionId" IS NOT NULL), '{}') AS "HealthConditionIds",
  COALESCE(
    JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'healthConditionId', hc."HealthConditionId",
        'code', hc."Code",
        'displayName', hc."DisplayName",
        'isActive', hc."IsActive"
      ) ORDER BY hc."HealthConditionId"
    ) FILTER (WHERE hc."HealthConditionId" IS NOT NULL),
    '[]'::jsonb
  ) AS "HealthConditions"
FROM base b
LEFT JOIN "TRN_UserHealthCondition" uhc ON uhc."UserId" = b."UserId"
LEFT JOIN "MST_HealthCondition" hc ON hc."HealthConditionId" = uhc."HealthConditionId"
GROUP BY
  b."UserId", b."ClerkId", b."Email", b."Name", b."BirthYear",
  b."RaceId", b."RaceCode", b."RaceDisplayName",
  b."SexId", b."SexCode", b."SexDisplayName",
  b."HeightNum", b."HeightUnitId", b."HeightUnitCode", b."HeightUnitDisplayName",
  b."WeightNum", b."WeightUnitId", b."WeightUnitCode", b."WeightUnitDisplayName",
  b."MeasurementSystemId", b."MeasurementSystemCode", b."MeasurementSystemDisplayName",
  b."RoleId", b."RoleCode", b."RoleDisplayName",
  b."IsActive", b."CreatedBy", b."CreatedOn", b."ModifiedBy", b."ModifiedOn";

2) POST /users — Create User
Tables touched

Write: MST_User

Write (link): TRN_UserHealthCondition (bulk insert from array)

Read (for response): same joins as GET

Transaction steps (no business logic—just flow)

Insert user and set createdBy to the new UserId.

Insert health conditions from :healthConditionIds (if any).

Select the user using the GET query to return the flat shape.

SQL
BEGIN;

-- 1) Insert user (createdBy = self UserId)
WITH ins AS (
  INSERT INTO "MST_User" (
    "ClerkId", "Email", "Name", "BirthYear",
    "RaceId", "SexId",
    "HeightNum", "HeightUnitId",
    "WeightNum", "WeightUnitId",
    "MeasurementSystemId",
    "RoleId",
    "IsActive", "IsModified", "CreatedOn"
  )
  VALUES (
    :clerkId, :email, :name, :birthYear,
    :raceId, :sexId,
    :heightNum, :heightUnitId,
    :weightNum, :weightUnitId,
    :measurementSystemId,
    :roleId,
    TRUE, FALSE, NOW()
  )
  RETURNING "UserId"
),
upd AS (
  UPDATE "MST_User"
  SET "CreatedBy" = ins."UserId"
  FROM ins
  WHERE "MST_User"."UserId" = ins."UserId"
  RETURNING ins."UserId" AS "UserId"
)

-- 2) Insert health conditions (optional)
INSERT INTO "TRN_UserHealthCondition" ("UserId", "HealthConditionId")
SELECT u."UserId", hc_id
FROM upd u
JOIN UNNEST(COALESCE(:healthConditionIds::int[], '{}')) AS hc_id ON TRUE;

-- 3) Return the created user (flat)
-- (Reuse the GET-by-id select above)
COMMIT;


Params expected from frontend body:

Required: :email, :name, :roleId

Optional: :clerkId, :birthYear, :raceId, :sexId, :heightNum, :heightUnitId, :weightNum, :weightUnitId, :measurementSystemId, :healthConditionIds (int[])

3) PATCH /users/{userId} — Update User (Partial)
Tables touched

Write: MST_User (only provided fields)

Write (link): TRN_UserHealthCondition

Read (for response): same joins as GET

Transaction steps

Update only provided fields on MST_User.
(Shown here with COALESCE pattern; in code you’ll usually build dynamic SQL.)

If healthConditionIds provided: replace set

DELETE existing for the user

INSERT new from array (deduplicated)

Select using the GET query to return flat shape.

SQL
BEGIN;

-- 1) Update scalar fields (only apply if param is not null)
UPDATE "MST_User"
SET
  "Name" = COALESCE(:name, "Name"),
  "BirthYear" = COALESCE(:birthYear, "BirthYear"),
  "RaceId" = COALESCE(:raceId, "RaceId"),
  "SexId" = COALESCE(:sexId, "SexId"),
  "HeightNum" = COALESCE(:heightNum, "HeightNum"),
  "HeightUnitId" = COALESCE(:heightUnitId, "HeightUnitId"),
  "WeightNum" = COALESCE(:weightNum, "WeightNum"),
  "WeightUnitId" = COALESCE(:weightUnitId, "WeightUnitId"),
  "MeasurementSystemId" = COALESCE(:measurementSystemId, "MeasurementSystemId"),
  "RoleId" = COALESCE(:roleId, "RoleId"),
  "IsActive" = COALESCE(:isActive, "IsActive"),
  "IsModified" = TRUE,
  "ModifiedBy" = :modifiedBy,       -- e.g., same userId if self-edit
  "ModifiedOn" = NOW()
WHERE "UserId" = :userId;

-- 2) Replace health conditions if provided
-- (Pass NULL to skip; pass [] to clear all)
DO $$
BEGIN
  IF :healthConditionIds IS NOT NULL THEN
    DELETE FROM "TRN_UserHealthCondition"
    WHERE "UserId" = :userId;

    INSERT INTO "TRN_UserHealthCondition" ("UserId", "HealthConditionId")
    SELECT :userId, DISTINCT hc_id
    FROM UNNEST(:healthConditionIds::int[]) AS hc_id;
  END IF;
END$$;

-- 3) Return the updated user (flat)
-- (Reuse the GET-by-id select above)
COMMIT;


Params expected from frontend:

Path: :userId

Body (all optional): :name, :birthYear, :raceId, :sexId, :heightNum, :heightUnitId, :weightNum, :weightUnitId, :measurementSystemId, :roleId, :isActive, :healthConditionIds (int[])

Server-set: :modifiedBy (typically same as :userId for self-edits)

Helpful indexes (for these APIs)
CREATE INDEX IF NOT EXISTS idx_user_email ON "MST_User"("Email");
CREATE INDEX IF NOT EXISTS idx_user_role ON "MST_User"("RoleId");
CREATE INDEX IF NOT EXISTS idx_uhc_user ON "TRN_UserHealthCondition"("UserId");
CREATE INDEX IF NOT EXISTS idx_uhc_hc ON "TRN_UserHealthCondition"("HealthConditionId"); -->





# Users API — Spec & Backend Query Guide

This file documents the **User** APIs, the **tables** they touch, and **backend SQL** to produce the exact flat response shape used by the frontend.

- No JWT in this iteration
- Masters = `MST_*`, Transactions = `TRN_*`
- Single role per user (`roleId`)
- `createdBy = userId` on user creation
- `TRN_UserHealthCondition` has **no audit fields** and **no notes**

---

## Contents

- [API Structure](#api-structure)
- [User APIs](#user-apis)
- [Tables Involved](#tables-involved)
  - [MST\_User](#mst_user)
  - [MST\_Race](#mst_race)
  - [MST\_Sex](#mst_sex)
  - [MST\_Unit](#mst_unit)
  - [MST\_MeasurementSystem](#mst_measurementsystem)
  - [MST\_Role](#mst_role)
  - [MST\_HealthCondition](#mst_healthcondition)
  - [TRN\_UserHealthCondition](#trn_userhealthcondition)
  - [How They Connect](#how-they-connect)
- [API Descriptions & Examples](#api-descriptions--examples)
  - [GET /users/{userId}](#1-get-usersuserid)
  - [POST /users](#2-post-users)
  - [PATCH /usersuserid](#3-patch-usersuserid)
- [Backend Query Logic (SQL)](#backend-query-logic-sql)
  - [GET by ID](#get-by-id-sql)
  - [POST (Create)](#post-create-sql)
  - [PATCH (Update Partial)](#patch-update-partial-sql)
  - [Helpful Indexes](#helpful-indexes)

---

## API Structure

### User APIs

| # | API                                | Purpose                                                                  |
| - | ---------------------------------- | ------------------------------------------------------------------------ |
| 1 | `GET /users/{userId}`              | Fetch a single user by ID and return their full profile (profile screen) |
| 2 | `POST /users`                      | Create a new user with provided details                                  |
| 3 | `PATCH /users/{userId}`            | Partially update an existing user’s details                              |
| 4 | `GET /masters/races`               | Return active race options (for dropdowns)                               |
| 5 | `GET /masters/sexes`               | Return active sex-at-birth options                                       |
| 6 | `GET /masters/units`               | Return active measurement units                                          |
| 7 | `GET /masters/measurement-systems` | Return active measurement systems                                        |
| 8 | `GET /masters/health-conditions`   | Return active health condition options                                   |


---

## Tables Involved

### Masters (read-only lookups)
`MST_User`, `MST_Race`, `MST_Sex`, `MST_Unit`, `MST_MeasurementSystem`, `MST_Role`, `MST_HealthCondition`

### Link (read/write)
`TRN_UserHealthCondition`

---

### MST_User

**Purpose:** Primary user record.

**Fields**

| Field                  | Type        | Notes                                                                   |
|------------------------|-------------|-------------------------------------------------------------------------|
| `UserId`               | int (PK)    |                                                                         |
| `ClerkId`              | text        | unique, nullable                                                        |
| `Email`                | text        | unique, required                                                        |
| `Name`                 | text        | required                                                                |
| `BirthYear`            | int         | nullable                                                                |
| `RaceId`               | int (FK)    | → `MST_Race.RaceId`, nullable                                          |
| `SexId`                | int (FK)    | → `MST_Sex.SexId`, nullable                                            |
| `HeightNum`            | numeric     | nullable                                                                |
| `HeightUnitId`         | int (FK)    | → `MST_Unit.UnitId`, nullable                                          |
| `WeightNum`            | numeric     | nullable                                                                |
| `WeightUnitId`         | int (FK)    | → `MST_Unit.UnitId`, nullable                                          |
| `MeasurementSystemId`  | int (FK)    | → `MST_MeasurementSystem.MeasurementSystemId`, nullable                |
| `RoleId`               | int (FK)    | → `MST_Role.RoleId` (single role)                                      |
| `IsActive`             | bool        | default `true`                                                          |
| `IsModified`           | bool        | default `false`                                                         |
| `CreatedBy`            | int         | **set to the new `UserId` on create**                                   |
| `CreatedOn`            | timestamptz | default `now`                                                           |
| `ModifiedBy`           | int         | nullable                                                                |
| `ModifiedOn`           | timestamptz | nullable                                                                |

**FK Connections**
- `RaceId` → `MST_Race`
- `SexId` → `MST_Sex`
- `HeightUnitId`, `WeightUnitId` → `MST_Unit`
- `MeasurementSystemId` → `MST_MeasurementSystem`
- `RoleId` → `MST_Role`

**Examples (5)**
```json
[
  {
    "UserId": 1001, "ClerkId": "usr_abc123", "Email": "john@example.com", "Name": "John Lee",
    "BirthYear": 1994, "RaceId": 1, "SexId": 1, "HeightNum": 168.0, "HeightUnitId": 2,
    "WeightNum": 62.0, "WeightUnitId": 4, "MeasurementSystemId": 1,
    "IsActive": true, "IsModified": false, "CreatedBy": 2001,
    "CreatedOn": "2025-09-10T10:00:00Z", "ModifiedBy": 2001, "ModifiedOn": "2025-09-18T09:00:00Z"
  },
  {
    "UserId": 1002, "ClerkId": "usr_k9z77", "Email": "alex@example.com", "Name": "Alex W",
    "BirthYear": 1999, "RaceId": 2, "SexId": 2, "HeightNum": 175.3, "HeightUnitId": 2,
    "WeightNum": 72.5, "WeightUnitId": 5, "MeasurementSystemId": 1,
    "IsActive": true, "IsModified": true, "CreatedBy": 2001,
    "CreatedOn": "2025-09-15T08:20:00Z", "ModifiedBy": 2002, "ModifiedOn": "2025-09-18T12:05:00Z"
  },
  {
    "UserId": 1003, "ClerkId": "usr_k9757", "Email": "rachel@example.com", "Name": "Rachel Kim",
    "BirthYear": 1987, "RaceId": 3, "SexId": 2, "HeightNum": 64.0, "HeightUnitId": 6,
    "WeightNum": 128.0, "WeightUnitId": 7, "MeasurementSystemId": 2,
    "IsActive": true, "IsModified": false, "CreatedBy": 2003,
    "CreatedOn": "2025-09-11T14:00:00Z", "ModifiedBy": null, "ModifiedOn": null
  },
  {
    "UserId": 1004, "ClerkId": "usr_tt442", "Email": "mike@example.com", "Name": "Mike Chen",
    "BirthYear": 1991, "RaceId": 4, "SexId": 1, "HeightNum": null, "HeightUnitId": null,
    "WeightNum": null, "WeightUnitId": null, "MeasurementSystemId": null,
    "IsActive": true, "IsModified": false, "CreatedBy": 2001,
    "CreatedOn": "2025-09-17T09:45:00Z", "ModifiedBy": null, "ModifiedOn": null
  },
  {
    "UserId": 1005, "ClerkId": "usr_pq901", "Email": "sam@example.com", "Name": "Sam Rivera",
    "BirthYear": 2000, "RaceId": 1, "SexId": 3, "HeightNum": 180.0, "HeightUnitId": 2,
    "WeightNum": 80.0, "WeightUnitId": 4, "MeasurementSystemId": 1,
    "IsActive": false, "IsModified": true, "CreatedBy": 2004,
    "CreatedOn": "2025-09-12T11:30:00Z", "ModifiedBy": 2004, "ModifiedOn": "2025-09-19T16:10:00Z"
  }
]

```


### MST_Race

**Purpose:**: Master list of race values.

**Fields**

| Field             | Type        | Notes  |
| ----------------- | ----------- | ------ |
| `RaceId`          | int (PK)    |        |
| `RaceCode`        | text        | unique |
| `RaceDisplayName` | text        |        |
| `IsActive`        | bool        |  audit |
| `IsModified`      | bool        | audit  |
| `CreatedBy`       | int         | audit  |
| `CreatedOn`       | timestamptz | audit  |
| `ModifiedBy`      | int         | audit  |
| `ModifiedOn`      | timestamptz | audit  |

**Examples (5)**
```json
[
  { "RaceId": 1, "RaceCode": "ASIAN", "RaceDisplayName": "Asian", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-09-01T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "RaceId": 2, "RaceCode": "WHITE", "RaceDisplayName": "White", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-09-01T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "RaceId": 3, "RaceCode": "BLACK", "RaceDisplayName": "Black or African American", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-09-01T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "RaceId": 4, "RaceCode": "HISPANIC", "RaceDisplayName": "Hispanic or Latino", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-09-01T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "RaceId": 5, "RaceCode": "OTHER", "RaceDisplayName": "Other / Prefer to self-describe", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-09-01T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null }
]
```


### MST_Sex

**Purpose**: Master list for sex assigned at birth.

**Fields**

| Field            | Type        | Notes |
|------------------|-------------|------|
| SexId            | int (PK)    |  |
| SexCode          | text        | unique (e.g., M, F, X, UNK, DECLINE) |
| SexDisplayName   | text        |  |
| IsActive         | bool        |  |
| IsModified       | bool        |  |
| CreatedBy        | int         |  |
| CreatedOn        | timestamptz |  |
| ModifiedBy       | int         |  |
| ModifiedOn       | timestamptz |  |

**Examples (5)**
```json
[
  { "SexId": 1, "SexCode": "M", "SexDisplayName": "Male", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-09-01T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "SexId": 2, "SexCode": "F", "SexDisplayName": "Female", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-09-01T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "SexId": 3, "SexCode": "X", "SexDisplayName": "Intersex / X", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-09-01T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "SexId": 4, "SexCode": "UNK", "SexDisplayName": "Unknown", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-09-01T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "SexId": 5, "SexCode": "DECLINE", "SexDisplayName": "Prefer not to say", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-09-01T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null }
]
```


### MST_Unit

**Purpose**: Measurement units (height/weight/HR/etc.).

**Fields**

| Field            | Type        | Notes |
|------------------|-------------|------|
| UnitId           | int (PK)    |  |
| UnitCode         | text        | unique (e.g., CM, KG, IN, LB, BPM, COUNT) |
| UnitDisplayName  | text        |  |
| IsActive         | bool        |  |
| IsModified       | bool        |  |
| CreatedBy        | int         |  |
| CreatedOn        | timestamptz |  |
| ModifiedBy       | int         |  |
| ModifiedOn       | timestamptz |  |


**Examples (5)**
```json

[
  { "UnitId": 2, "UnitCode": "CM", "UnitDisplayName": "Centimeter", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-30T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "UnitId": 4, "UnitCode": "KG", "UnitDisplayName": "Kilogram", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-30T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "UnitId": 5, "UnitCode": "BPM", "UnitDisplayName": "Beats Per Minute", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-30T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "UnitId": 6, "UnitCode": "IN", "UnitDisplayName": "Inch", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-30T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "UnitId": 7, "UnitCode": "LB", "UnitDisplayName": "Pound", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-30T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null }
]
```

## MST_MeasurementSystem

**Purpose** : Metric vs Imperial.

**Fields**
| Field                      | Type        | Notes |
|----------------------------|-------------|------|
| MeasurementSystemId        | int (PK)    |  |
| MeasurementSystemCode      | text        | unique (e.g., METRIC, IMPERIAL) |
| MeasurementSystemDisplayName | text      |  |
| IsActive                   | bool        |  |
| IsModified                 | bool        |  |
| CreatedBy                  | int         |  |
| CreatedOn                  | timestamptz |  |
| ModifiedBy                 | int         |  |
| ModifiedOn                 | timestamptz |  |


**Examples (5)**
```json

[
  { "MeasurementSystemId": 1, "MeasurementSystemCode": "METRIC", "MeasurementSystemDisplayName": "Metric", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-30T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "MeasurementSystemId": 2, "MeasurementSystemCode": "IMPERIAL", "MeasurementSystemDisplayName": "Imperial", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-30T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "MeasurementSystemId": 3, "MeasurementSystemCode": "CUSTOM", "MeasurementSystemDisplayName": "Custom", "IsActive": false, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-30T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "MeasurementSystemId": 4, "MeasurementSystemCode": "SI", "MeasurementSystemDisplayName": "SI Units", "IsActive": false, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-30T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "MeasurementSystemId": 5, "MeasurementSystemCode": "LEGACY", "MeasurementSystemDisplayName": "Legacy", "IsActive": false, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-30T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null }
]

```

### MST_Role

**Purpose**: Role catalog (single role per user).

**Fields**

| Field            | Type        | Notes |
|------------------|-------------|------|
| RoleId           | int (PK)    |  |
| RoleCode         | text        | unique (e.g., USER, BUYER, etc) |
| RoleDisplayName  | text        |  |
| IsActive         | bool        |  |
| IsModified       | bool        |  |
| CreatedBy        | int         |  |
| CreatedOn        | timestamptz |  |
| ModifiedBy       | int         |  |
| ModifiedOn       | timestamptz |  |


**Examples (5)**
```json

[
  { "RoleId": 1, "RoleCode": "USER", "RoleDisplayName": "User", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-29T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "RoleId": 2, "RoleCode": "BUYER", "RoleDisplayName": "Buyer", "IsActive": true, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-29T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "RoleId": 3, "RoleCode": "BUYER_ADMIN", "RoleDisplayName": "Buyer Admin", "IsActive": true, "IsModified": false, "CreatedBy": 2, "CreatedOn": "2025-08-30T03:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "RoleId": 4, "RoleCode": "VIEW_ONLY", "RoleDisplayName": "View Only", "IsActive": true, "IsModified": false, "CreatedBy": 2, "CreatedOn": "2025-08-30T03:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "RoleId": 5, "RoleCode": "SYSTEM", "RoleDisplayName": "System", "IsActive": false, "IsModified": false, "CreatedBy": 1, "CreatedOn": "2025-08-29T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null }
]
```

## MST_HealthCondition

**Purpose**: Catalog of health conditions for users and posting eligibility.

**Fields**

| Field               | Type        | Notes |
|---------------------|-------------|------|
| HealthConditionId   | int (PK)    |  |
| Code                | text        | unique (e.g., T2D, HYPERTENSION, ASTHMA, PCOS, CVD) |
| DisplayName         | text        |  |
| IsActive            | bool        |  |
| IsModified          | bool        |  |
| CreatedBy           | int         |  |
| CreatedOn           | timestamptz |  |
| ModifiedBy          | int         |  |
| ModifiedOn          | timestamptz |  |


**Examples (5)**
```json

[
  { "HealthConditionId": 205, "Code": "T2D", "DisplayName": "Type 2 Diabetes", "IsActive": true, "IsModified": false, "CreatedBy": 10, "CreatedOn": "2025-08-25T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "HealthConditionId": 310, "Code": "HYPERTENSION", "DisplayName": "Hypertension", "IsActive": true, "IsModified": false, "CreatedBy": 10, "CreatedOn": "2025-08-25T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "HealthConditionId": 411, "Code": "ASTHMA", "DisplayName": "Asthma", "IsActive": true, "IsModified": false, "CreatedBy": 10, "CreatedOn": "2025-08-25T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "HealthConditionId": 512, "Code": "PCOS", "DisplayName": "Polycystic Ovary Syndrome", "IsActive": true, "IsModified": false, "CreatedBy": 11, "CreatedOn": "2025-08-26T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null },
  { "HealthConditionId": 613, "Code": "CVD", "DisplayName": "Cardiovascular Disease", "IsActive": false, "IsModified": false, "CreatedBy": 11, "CreatedOn": "2025-08-26T00:00:00Z", "ModifiedBy": null, "ModifiedOn": null }
]

```

## TRN_UserHealthCondition

**Purpose**: Minimal link between a user and their health conditions.

**Fields**

| Field               | Type     | Notes                                     |
| ------------------- | -------- | ----------------------------------------- |
| `UserId`            | int (FK) | → `MST_User.UserId`                       |
| `HealthConditionId` | int (FK) | → `MST_HealthCondition.HealthConditionId` |


Primary Key: (UserId, HealthConditionId)


**Examples (5)**
```json

[
  { "UserId": 1001, "HealthConditionId": 205 },
  { "UserId": 1001, "HealthConditionId": 310 },
  { "UserId": 1002, "HealthConditionId": 205 },
  { "UserId": 1003, "HealthConditionId": 411 },
  { "UserId": 1005, "HealthConditionId": 205 }
]
```
## How They Connect

- MST_User holds core profile and FK pointers.

- Masters (MST_Race, MST_Sex, MST_Unit, MST_MeasurementSystem, MST_Role, MST_HealthCondition) provide codes & display names for flat expansions in API responses.

- TRN_UserHealthCondition is many-to-many user ↔ health condition.


## API Descriptions & Examples
## 1) `GET /users/{userId}`

- Name: Get User by ID

Frontend sends

- Path param: userId (integer)

- Returns (200): application/json — UserProfile (flat, FK expansions)

- Fields returned

- userId, clerkId, email, name, birthYear

- Race: raceId, raceCode, raceDisplayName

- Sex: sexId, sexCode, sexDisplayName

- Height: heightNum, heightUnitId, heightUnitCode, heightUnitDisplayName

- Weight: weightNum, weightUnitId, weightUnitCode, weightUnitDisplayName

- Measurement: measurementSystemId, measurementSystemCode, measurementSystemDisplayName

- Role: roleId, roleCode, roleDisplayName

- Health: healthConditionIds (int[]), healthConditions (array of objects)

- Audit: isActive, createdBy, createdOn, modifiedBy, modifiedOn


Example (request)
```
GET /users/1002
```

Example (response 200)
```json
{
  "userId": 1002,
  "clerkId": "usr_abc123",
  "email": "alex@example.com",
  "name": "Alex Doe",
  "birthYear": 1999,
  "raceId": 1, "raceCode": "ASIAN", "raceDisplayName": "Asian",
  "sexId": 1, "sexCode": "M", "sexDisplayName": "Male",
  "heightNum": 175.3,
  "heightUnitId": 2, "heightUnitCode": "CM", "heightUnitDisplayName": "Centimeter",
  "weightNum": 72.5,
  "weightUnitId": 4, "weightUnitCode": "KG", "weightUnitDisplayName": "Kilogram",
  "measurementSystemId": 1,
  "measurementSystemCode": "METRIC",
  "measurementSystemDisplayName": "Metric",
  "roleId": 2,
  "roleCode": "USER",
  "roleDisplayName": "User",
  "healthConditionIds": [205, 310],
  "healthConditions": [
    { "healthConditionId": 205, "code": "T2D", "displayName": "Type 2 Diabetes", "isActive": true },
    { "healthConditionId": 310, "code": "HYPERTENSION", "displayName": "Hypertension", "isActive": true }
  ],
  "isActive": true,
  "createdBy": 1002,
  "createdOn": "2025-09-18T09:00:00Z",
  "modifiedBy": null,
  "modifiedOn": null
}
```



## 2) POST /users

## Name: Create User

- Frontend sends (Body JSON)

- Required: email, name, roleId

***Optional***: healthConditionIds (int[])

- Returns (201): application/json — UserProfile (flat, FK expansions)
Note: On creation, createdBy = userId (self-created).


Example (request body)
```json
{
  "clerkId": "usr_abc123",
  "email": "alex@example.com",
  "name": "Alex Doe",
  "roleId": 2,
  "birthYear": 1999,
  "raceId": 1,
  "sexId": 1,
  "heightNum": 175.3,
  "heightUnitId": 2,
  "weightNum": 72.5,
  "weightUnitId": 4,
  "measurementSystemId": 1,
  "healthConditionIds": [205, 310]
}
```

Example (response 201)
```json
{
  "userId": 1002,
  "clerkId": "usr_abc123",
  "email": "alex@example.com",
  "name": "Alex Doe",
  "birthYear": 1999,
  "raceId": 1, "raceCode": "ASIAN", "raceDisplayName": "Asian",
  "sexId": 1, "sexCode": "M", "sexDisplayName": "Male",
  "heightNum": 175.3,
  "heightUnitId": 2, "heightUnitCode": "CM", "heightUnitDisplayName": "Centimeter",
  "weightNum": 72.5,
  "weightUnitId": 4, "weightUnitCode": "KG", "weightUnitDisplayName": "Kilogram",
  "measurementSystemId": 1,
  "measurementSystemCode": "METRIC",
  "measurementSystemDisplayName": "Metric",
  "roleId": 2,
  "roleCode": "USER",
  "roleDisplayName": "User",
  "healthConditionIds": [205, 310],
  "healthConditions": [
    { "healthConditionId": 205, "code": "T2D", "displayName": "Type 2 Diabetes", "isActive": true },
    { "healthConditionId": 310, "code": "HYPERTENSION", "displayName": "Hypertension", "isActive": true }
  ],
  "isActive": true,
  "createdBy": 1002,
  "createdOn": "2025-09-18T09:00:00Z",
  "modifiedBy": null,
  "modifiedOn": null
}
```


## 3) `PATCH /users/{userId}`

- Name: Update User (Partial)

Frontend sends

- Path param: userId (integer)

- Body JSON (any subset):
name, birthYear, raceId, sexId, heightNum, heightUnitId, weightNum, weightUnitId, measurementSystemId, roleId, healthConditionIds (int[]), isActive

- Returns (200): application/json — UserProfile (flat, FK expansions)

Example A (request body — role & conditions)
```json
{
  "roleId": 2,
  "healthConditionIds": [205]
}
```

Example A (response 200)
```json
{
  "userId": 1002,
  "clerkId": "usr_abc123",
  "email": "alex@example.com",
  "name": "Alex Doe",
  "birthYear": 1999,
  "raceId": 1, "raceCode": "ASIAN", "raceDisplayName": "Asian",
  "sexId": 1, "sexCode": "M", "sexDisplayName": "Male",
  "heightNum": 175.3,
  "heightUnitId": 2, "heightUnitCode": "CM", "heightUnitDisplayName": "Centimeter",
  "weightNum": 72.5,
  "weightUnitId": 4, "weightUnitCode": "KG", "weightUnitDisplayName": "Kilogram",
  "measurementSystemId": 1,
  "measurementSystemCode": "METRIC",
  "measurementSystemDisplayName": "Metric",
  "roleId": 2,
  "roleCode": "USER",
  "roleDisplayName": "User",
  "healthConditionIds": [205],
  "healthConditions": [
    { "healthConditionId": 205, "code": "T2D", "displayName": "Type 2 Diabetes", "isActive": true }
  ],
  "isActive": true,
  "createdBy": 1002,
  "createdOn": "2025-09-18T09:00:00Z",
  "modifiedBy": 1002,
  "modifiedOn": "2025-09-18T12:05:00Z"
}
```

Example B (request body — physical attributes)
```json
{
  "heightNum": 180.0,
  "heightUnitId": 2,
  "weightNum": 80.0,
  "weightUnitId": 4
}
```

Example B (response 200)
```json
{
  "userId": 1002,
  "clerkId": "usr_abc123",
  "email": "alex@example.com",
  "name": "Alex Doe",
  "birthYear": 1999,
  "raceId": 1, "raceCode": "ASIAN", "raceDisplayName": "Asian",
  "sexId": 1, "sexCode": "M", "sexDisplayName": "Male",
  "heightNum": 180.0,
  "heightUnitId": 2, "heightUnitCode": "CM", "heightUnitDisplayName": "Centimeter",
  "weightNum": 80.0,
  "weightUnitId": 4, "weightUnitCode": "KG", "weightUnitDisplayName": "Kilogram",
  "measurementSystemId": 1,
  "measurementSystemCode": "METRIC",
  "measurementSystemDisplayName": "Metric",
  "roleId": 2,
  "roleCode": "USER",
  "roleDisplayName": "User",
  "healthConditionIds": [205],
  "healthConditions": [
    { "healthConditionId": 205, "code": "T2D", "displayName": "Type 2 Diabetes", "isActive": true }
  ],
  "isActive": true,
  "createdBy": 1002,
  "createdOn": "2025-09-18T09:00:00Z",
  "modifiedBy": 1002,
  "modifiedOn": "2025-09-18T12:45:00Z"
}
```

## Master Lookup APIs

### 4) GET /masters/races

**Purpose:** active race options.

**Example response (5 items)**

```json
[
  { "raceId": 1, "raceCode": "ASIAN",    "raceDisplayName": "Asian" },
  { "raceId": 2, "raceCode": "WHITE",    "raceDisplayName": "White" },
  { "raceId": 3, "raceCode": "BLACK",    "raceDisplayName": "Black or African American" },
  { "raceId": 4, "raceCode": "HISPANIC", "raceDisplayName": "Hispanic or Latino" },
  { "raceId": 5, "raceCode": "OTHER",    "raceDisplayName": "Other / Prefer to self-describe" }
]
```

---

### 5) GET /masters/sexes

**Purpose:** active sex-at-birth options.

**Example response (5 items)**

```json
[
  { "sexId": 1, "sexCode": "M",      "sexDisplayName": "Male" },
  { "sexId": 2, "sexCode": "F",      "sexDisplayName": "Female" },
  { "sexId": 3, "sexCode": "X",      "sexDisplayName": "Intersex / X" },
  { "sexId": 4, "sexCode": "UNK",    "sexDisplayName": "Unknown" },
  { "sexId": 5, "sexCode": "DECLINE","sexDisplayName": "Prefer not to say" }
]
```


### 6) GET /masters/units

**Purpose:** active measurement units.

**Example response (5 items)**

```json
[
  { "unitId": 2, "unitCode": "CM",  "unitDisplayName": "Centimeter" },
  { "unitId": 4, "unitCode": "KG",  "unitDisplayName": "Kilogram" },
  { "unitId": 5, "unitCode": "BPM", "unitDisplayName": "Beats Per Minute" },
  { "unitId": 6, "unitCode": "IN",  "unitDisplayName": "Inch" },
  { "unitId": 7, "unitCode": "LB",  "unitDisplayName": "Pound" }
]
```

### 7) GET /masters/measurement-systems

**Purpose:** active measurement systems.

**Example response (5 items)**

```json
[
  { "measurementSystemId": 1, "measurementSystemCode": "METRIC",   "measurementSystemDisplayName": "Metric" },
  { "measurementSystemId": 2, "measurementSystemCode": "IMPERIAL", "measurementSystemDisplayName": "Imperial" },
  { "measurementSystemId": 3, "measurementSystemCode": "CUSTOM",   "measurementSystemDisplayName": "Custom" },
  { "measurementSystemId": 4, "measurementSystemCode": "SI",       "measurementSystemDisplayName": "SI Units" },
  { "measurementSystemId": 5, "measurementSystemCode": "LEGACY",   "measurementSystemDisplayName": "Legacy" }
]
```


### 8) GET /masters/health-conditions

**Purpose:** active health condition options.

**Example response (5 items)**

```json
[
  { "healthConditionId": 205, "code": "T2D",         "displayName": "Type 2 Diabetes" },
  { "healthConditionId": 310, "code": "HYPERTENSION","displayName": "Hypertension" },
  { "healthConditionId": 411, "code": "ASTHMA",      "displayName": "Asthma" },
  { "healthConditionId": 512, "code": "PCOS",        "displayName": "Polycystic Ovary Syndrome" },
  { "healthConditionId": 613, "code": "CVD",         "displayName": "Cardiovascular Disease" }
]
```
---
## Backend Query Logic (SQL)

These queries return the exact flat JSON shape shown above.

## GET by ID (SQL)

1) GET /users/{userId}
```sql
WITH base AS (
  SELECT
    u."UserId",
    u."ClerkId",
    u."Email",
    u."Name",
    u."BirthYear",

    u."RaceId",
    r."RaceCode",
    r."RaceDisplayName",

    u."SexId",
    s."SexCode",
    s."SexDisplayName",

    u."HeightNum",
    u."HeightUnitId",
    hu."UnitCode"          AS "HeightUnitCode",
    hu."UnitDisplayName"   AS "HeightUnitDisplayName",

    u."WeightNum",
    u."WeightUnitId",
    wu."UnitCode"          AS "WeightUnitCode",
    wu."UnitDisplayName"   AS "WeightUnitDisplayName",

    u."MeasurementSystemId",
    ms."MeasurementSystemCode",
    ms."MeasurementSystemDisplayName",

    u."RoleId",
    ro."RoleCode",
    ro."RoleDisplayName",

    u."IsActive",
    u."CreatedBy",
    u."CreatedOn",
    u."ModifiedBy",
    u."ModifiedOn"
  FROM "MST_User" u
  LEFT JOIN "MST_Race" r               ON r."RaceId" = u."RaceId"
  LEFT JOIN "MST_Sex" s                ON s."SexId" = u."SexId"
  LEFT JOIN "MST_Unit" hu              ON hu."UnitId" = u."HeightUnitId"
  LEFT JOIN "MST_Unit" wu              ON wu."UnitId" = u."WeightUnitId"
  LEFT JOIN "MST_MeasurementSystem" ms ON ms."MeasurementSystemId" = u."MeasurementSystemId"
  LEFT JOIN "MST_Role" ro              ON ro."RoleId" = u."RoleId"
  WHERE u."UserId" = :userId
)
SELECT
  b.*,
  COALESCE(
    ARRAY_AGG(uhc."HealthConditionId" ORDER BY uhc."HealthConditionId")
      FILTER (WHERE uhc."HealthConditionId" IS NOT NULL),
    '{}'
  ) AS "HealthConditionIds",
  COALESCE(
    JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'healthConditionId', hc."HealthConditionId",
        'code', hc."Code",
        'displayName', hc."DisplayName",
        'isActive', hc."IsActive"
      )
      ORDER BY hc."HealthConditionId"
    ) FILTER (WHERE hc."HealthConditionId" IS NOT NULL),
    '[]'::jsonb
  ) AS "HealthConditions"
FROM base b
LEFT JOIN "
" uhc ON uhc."UserId" = b."UserId"
LEFT JOIN "MST_HealthCondition" hc      ON hc."HealthConditionId" = uhc."HealthConditionId"
GROUP BY
  b."UserId", b."ClerkId", b."Email", b."Name", b."BirthYear",
  b."RaceId", b."RaceCode", b."RaceDisplayName",
  b."SexId", b."SexCode", b."SexDisplayName",
  b."HeightNum", b."HeightUnitId", b."HeightUnitCode", b."HeightUnitDisplayName",
  b."WeightNum", b."WeightUnitId", b."WeightUnitCode", b."WeightUnitDisplayName",
  b."MeasurementSystemId", b."MeasurementSystemCode", b."MeasurementSystemDisplayName",
  b."RoleId", b."RoleCode", b."RoleDisplayName",
  b."IsActive", b."CreatedBy", b."CreatedOn", b."ModifiedBy", b."ModifiedOn";
```


## POST (Create) (SQL)
2) POST /users
```
BEGIN;

-- 1) Insert user (createdBy = self UserId)
WITH ins AS (
  INSERT INTO "MST_User" (
    "ClerkId", "Email", "Name", "BirthYear",
    "RaceId", "SexId",
    "HeightNum", "HeightUnitId",
    "WeightNum", "WeightUnitId",
    "MeasurementSystemId",
    "RoleId",
    "IsActive", "IsModified", "CreatedOn"
  )
  VALUES (
    :clerkId, :email, :name, :birthYear,
    :raceId, :sexId,
    :heightNum, :heightUnitId,
    :weightNum, :weightUnitId,
    :measurementSystemId,
    :roleId,
    TRUE, FALSE, NOW()
  )
  RETURNING "UserId"
),
upd AS (
  UPDATE "MST_User"
  SET "CreatedBy" = ins."UserId"
  FROM ins
  WHERE "MST_User"."UserId" = ins."UserId"
  RETURNING ins."UserId" AS "UserId"
)

-- 2) Insert health conditions (optional)
INSERT INTO "TRN_UserHealthCondition" ("UserId", "HealthConditionId")
SELECT u."UserId", hc_id
FROM upd u
JOIN UNNEST(COALESCE(:healthConditionIds::int[], '{}')) AS hc_id ON TRUE;

-- 3) Return the created user (flat)
-- Reuse GET-by-id select
COMMIT;

```

- Params (from frontend body)

- Required: :email, :name, :roleId

- Optional: :healthConditionIds (int[])


## PATCH (Update Partial) (SQL)
3) PATCH /users/{userId}
``` sql
BEGIN;

-- 1) Update scalar fields (only apply if param is not null)
UPDATE "MST_User"
SET
  "Name" = COALESCE(:name, "Name"),
  "BirthYear" = COALESCE(:birthYear, "BirthYear"),
  "RaceId" = COALESCE(:raceId, "RaceId"),
  "SexId" = COALESCE(:sexId, "SexId"),
  "HeightNum" = COALESCE(:heightNum, "HeightNum"),
  "HeightUnitId" = COALESCE(:heightUnitId, "HeightUnitId"),
  "WeightNum" = COALESCE(:weightNum, "WeightNum"),
  "WeightUnitId" = COALESCE(:weightUnitId, "WeightUnitId"),
  "MeasurementSystemId" = COALESCE(:measurementSystemId, "MeasurementSystemId"),
  "RoleId" = COALESCE(:roleId, "RoleId"),
  "IsActive" = COALESCE(:isActive, "IsActive"),
  "IsModified" = TRUE,
  "ModifiedBy" = :modifiedBy,  -- usually the same userId for self-edit
  "ModifiedOn" = NOW()
WHERE "UserId" = :userId;

-- 2) Replace health conditions if provided
-- (Pass NULL to skip; pass [] to clear all)
DO $$
BEGIN
  IF :healthConditionIds IS NOT NULL THEN
    DELETE FROM "TRN_UserHealthCondition"
    WHERE "UserId" = :userId;

    INSERT INTO "TRN_UserHealthCondition" ("UserId", "HealthConditionId")
    SELECT :userId, DISTINCT hc_id
    FROM UNNEST(:healthConditionIds::int[]) AS hc_id;
  END IF;
END$$;

-- 3) Return the updated user (flat)
-- Reuse GET-by-id select
COMMIT;
```

Params

Path: :userId

Body (all optional): :name, :birthYear, :raceId, :sexId, :heightNum, :heightUnitId, :weightNum, :weightUnitId, :measurementSystemId, :roleId, :isActive, :healthConditionIds (int[])
Server-set: :modifiedBy (typically same as :userId for self-edits)


- Helpful Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_user_email ON "MST_User"("Email");
CREATE INDEX IF NOT EXISTS idx_user_role  ON "MST_User"("RoleId");
CREATE INDEX IF NOT EXISTS idx_uhc_user   ON "TRN_UserHealthCondition"("UserId");
CREATE INDEX IF NOT EXISTS idx_uhc_hc     ON "TRN_UserHealthCondition"("HealthConditionId");
```


4) GET /masters/races

**SQL**

```sql
SELECT
  "RaceId"          AS "raceId",
  "RaceCode"        AS "raceCode",
  "RaceDisplayName" AS "raceDisplayName"
FROM "MST_Race"
WHERE "IsActive" = TRUE
ORDER BY "RaceDisplayName" ASC, "RaceCode" ASC;
```


5) GET /masters/sexes

**SQL**

```sql
SELECT
  "SexId"          AS "sexId",
  "SexCode"        AS "sexCode",
  "SexDisplayName" AS "sexDisplayName"
FROM "MST_Sex"
WHERE "IsActive" = TRUE
ORDER BY "SexDisplayName" ASC, "SexCode" ASC;
```

---

6) GET /masters/units

**SQL**

```sql
SELECT
  "UnitId"          AS "unitId",
  "UnitCode"        AS "unitCode",
  "UnitDisplayName" AS "unitDisplayName"
FROM "MST_Unit"
WHERE "IsActive" = TRUE
ORDER BY "UnitDisplayName" ASC, "UnitCode" ASC;
```

---

7) GET /masters/measurement-systems

**SQL**

```sql
SELECT
  "MeasurementSystemId"          AS "measurementSystemId",
  "MeasurementSystemCode"        AS "measurementSystemCode",
  "MeasurementSystemDisplayName" AS "measurementSystemDisplayName"
FROM "MST_MeasurementSystem"
WHERE "IsActive" = TRUE
ORDER BY "MeasurementSystemDisplayName" ASC, "MeasurementSystemCode" ASC;
```

---


8) GET /masters/health-conditions

**SQL**

```sql
SELECT
  "HealthConditionId" AS "healthConditionId",
  "Code"              AS "code",
  "DisplayName"       AS "displayName"
FROM "MST_HealthCondition"
WHERE "IsActive" = TRUE
ORDER BY "DisplayName" ASC, "Code" ASC;
```

---