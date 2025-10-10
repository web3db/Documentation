# Web3Health Posting Overview
# 1. What is a Posting?


A posting is created by a user acting in the buyer role.
It represents a study, research request, or data opportunity that participants can later view or apply to.

A posting captures the essential information needed for marketplace discovery and filtering:

* Who created it (owner = buyer user)
* What data types (metrics) are requested
* Who is eligible (age, health conditions)
* When it is visible (open/close timestamps and lifecycle status)
* How the data may be used or viewed (one or more view policies)
* How much historical data is required (days)
* What reward type and value are offered
* How it is presented (title, summary, description, tags, image)

---

# 2. What Information Does a Posting Store?

The fields and relationships below match the database structure.

## 2.1 Basic Details (MST_Posting)

* Title
* Summary (short teaser)
* Description (full details)
* PostingStatusId → MST_PostingStatus (status code and display name are read from the master)

## 2.2 Ownership (MST_Posting)

* BuyerUserId — owner of the posting (foreign key to user).
  There is no separate buyer table; ownership is tied to the user record.

## 2.3 Visibility Window (MST_Posting)

* ApplyOpenAt — when the posting becomes visible/accepting interest
* ApplyCloseAt — when visibility/acceptance ends
* Visibility also respects lifecycle status (for example, CLOSED or ARCHIVED are not shown).

## 2.4 Historical Data Window Requirement (MST_Posting)

* DataCoverageDaysRequired — single integer number of days of historical data the buyer expects.
  There is no relative vs fixed date-range model and no per-metric window in the schema.

## 2.5 Metrics Requested (TRN_PostingMetric → MST_Metric)

* A posting lists one or more metric IDs via TRN_PostingMetric.
  The schema does not include per-metric required/optional flags or granularity settings.

## 2.6 Eligibility (MST_Posting + TRN_PostingHealthCondition → MST_HealthCondition)

* MinAge (nullable) on the posting
* Zero or more health conditions linked through TRN_PostingHealthCondition

## 2.7 View Policies & Data Usage (TRN_PostingViewPolicy → MST_ViewPolicy)

* A posting can reference one or more view policies.
  These are returned by the API as an array of IDs.

## 2.8 Rewards or Compensation (MST_Posting → MST_RewardType)

* RewardTypeId (foreign key to MST_RewardType)
* RewardValue (nullable numeric)

## 2.9 Media & Discovery Aids (TRN_PostingImage, TRN_PostingTag)

* Image: TRN_PostingImage holds one image row per posting in this version.
  If missing or null, the API must return a default image URL so clients never receive an empty image.
* Tags: free-text keywords stored in TRN_PostingTag.

## 2.10 Lifecycle & Soft Delete (MST_Posting)

* IsActive indicates soft deletion.
  Soft-deleted postings (IsActive = FALSE) must not appear in listings or details for normal buyers.

---

# 3. How Postings Are Used

1. A buyer creates a posting with the fields above.
2. When status and dates allow (for example, status OPEN and within ApplyOpenAt/ApplyCloseAt), the posting appears in marketplace feeds.
3. Users can discover and review the posting. Application, consent, or data-sharing flows are separate and not covered here.

---

# 4. Example (Conceptual)

* Title: Heart Rate Variability Study
* Status: OPEN (resolved from PostingStatusId → MST_PostingStatus)
* Summary: Daily HR and HRV for 30 days
* Description: Seeking participants to share HR and HRV data for one month
* Visibility: Open on 2025-10-01, closes on 2025-10-31
* Data coverage required: 30 days
* Eligibility: Minimum age 18; Health conditions: Type 2 Diabetes
* Metrics: HR, HRV (linked via TRN_PostingMetric to MST_Metric)
* View policies: Research No Export; Model Training Allowed (multiple policies via TRN_PostingViewPolicy)
* Rewards: Points (RewardTypeId → MST_RewardType), value 1200
* Media: One main image (TRN_PostingImage) with default image used if none present
* Tags: hr, hrv, month
* Soft delete: IsActive = TRUE indicates the posting is active and listed

---

## Database Tables



Below are the tables required to support posting creation, management, and future expansion (including rewards, tags, and multiple images).

### 1. MST_PostingStatus

Purpose: Stores the allowed lifecycle states of a posting (DRAFT, OPEN, PAUSED, CLOSED, ARCHIVED).  
Why it's needed: Controls visibility and filtering in the marketplace.

### 2. MST_ViewPolicy

Purpose: Stores reusable policies that define how data will be used or accessed (e.g., export rules, study duration, data usage type, restrictions).  
Why it's needed: Buyers select a policy when creating postings to indicate how participant data may be handled.

### 3. MST_Metric

Purpose: Catalog of health metrics that can be requested in a posting (e.g., STEPS, HEART_RATE, KCAL) with a canonical unit.  
Why it's needed: Enables postings to specify exactly what data is being asked for.

### 4. MST_HealthCondition

Purpose: Stores health conditions such as T2D or Hypertension that can be used for eligibility filtering.  
Why it's needed: Supports restricting postings to specific participant profiles.

### 5. MST_RewardType

Purpose: Defines the type of reward or compensation associated with a posting (e.g., POINTS, TOKENS, VOUCHERS).  
Why it's needed: Allows buyers to specify what participants may receive for contributing data.

### 6. MST_Posting

Purpose: Main record for a posting created by a buyer.  
Why it's needed: Stores the core details of the opportunity, including owner, status, visibility, window, policy, eligibility, reward, and main image.

---

### 7. TRN_PostingMetric

Purpose: Associates a posting with one or more requested metrics.  
Why it's needed: Defines which health data types and granularity levels are required by the posting.

### 8. TRN_PostingHealthCondition

Purpose: Associates a posting with one or more eligibility conditions.  
Why it's needed: Ensures only participants meeting the specified health criteria are matched or shown relevant postings.

### 9. TRN_PostingTag

Purpose: Stores keyword tags linked to a posting.  
Why it's needed: Enables search, categorization, and filtering in marketplace views.

### 10. TRN_PostingImage

Purpose: Stores additional images for a posting beyond the main image.  
Why it's needed: Supports media-rich listings and better presentation in the UI.

# Web3Health — Posting Feature Database Tables

This defines all database tables required for the Posting feature.  
Masters (`MST_`) include audit fields. Transaction (`TRN_`) tables store posting-specific data.


---
## Contents

### Overview
- [1. What is a Posting?](#1-what-is-a-posting)
- [2. What Information Does a Posting Store?](#2-what-information-does-a-posting-store)
- [3. How Postings Are Used](#3-how-postings-are-used)
- [4. Example (Conceptual)](#4-example-conceptual)

### Database model & tables
- [Database Tables](#database-tables)
  - [MST_PostingStatus](#mst_postingstatus)
  - [MST_ViewPolicy](#mst_viewpolicy)
  - [MST_Metric](#mst_metric)
  - [MST_HealthCondition](#mst_healthcondition)
  - [MST_RewardType](#mst_rewardtype)
  - [MST_Posting](#mst_posting)
  - [TRN_PostingMetric](#trn_postingmetric)
  - [TRN_PostingHealthCondition](#trn_postinghealthcondition)
  - [TRN_PostingViewPolicy](#trn_postingviewpolicy)
  - [TRN_PostingTag](#trn_postingtag)
  - [TRN_PostingImage](#trn_postingimage)

### Posting APIs (buyer scope)
- [Create — POST /buyers_postings_create/{buyerId}](#create-post-buyers_postings_createbuyerid)
- [List — GET /buyers_postings_list/{buyerId}](#list-get-buyers_postings_listbuyerid) 
- [Detail — GET /buyers_postings_detail/{buyerId}/{postingId}](#detail-get-buyers_postings_detailbuyeridpostingid) 
- [Update — PATCH /buyers_postings_update/{buyerId}/{postingId}](#update-patch-buyers_postings_updatebuyeridpostingid) 
- [Delete — DELETE /buyers_postings_delete/{buyerId}/{postingId}](#delete-delete-buyers_postings_deletebuyeridpostingid)


### Master / Dropdown APIs
- [GET /metrics](#get-metrics)
- [GET /health_conditions](#get-health_conditions)
- [GET /posting_statuses](#get-posting_statuses)
- [GET /reward_types](#get-reward_types)
- [GET /view_policies](#get-view_policies)

### Backend implementation & SQL
- [Backend: Create](#backend-create)
- [Backend: List](#backend-list)
- [Backend: Detail](#backend-detail)
- [Backend: Update](#backend-update)
- [Backend: Delete](#backend-delete)
- [Backend: Metrics](#backend-metrics)
- [Backend: Health Conditions](#backend-health-conditions)
- [Backend: Posting Statuses](#backend-posting-statuses)
- [Backend: Reward Types](#backend-reward-types)
- [Backend: View Policies](#backend-view-policies)

---

# Master Tables

### MST_PostingStatus

**Purpose**: Lifecycle states for postings.

| Field           | Type        | Notes                                       |
| --------------- | ----------- | ------------------------------------------- |
| PostingStatusId | int (PK)    |                                             |
| Code            | text        | e.g., DRAFT, OPEN, PAUSED, CLOSED, ARCHIVED |
| DisplayName     | text        |                                             |
| IsActive        | bool        |                                             |
| IsModified      | bool        |                                             |
| CreatedBy       | int         |                                             |
| CreatedOn       | timestamptz |                                             |
| ModifiedBy      | int         |                                             |
| ModifiedOn      | timestamptz |                                             |

---


**examples**

```json
[
  {
    "postingStatusId": 1,
    "code": "DRAFT",
    "displayName": "Draft",
    "isActive": true,
    "isModified": false,
    "createdBy": 1,
    "createdOn": "2025-06-01T09:00:00Z",
    "modifiedBy": 1,
    "modifiedOn": "2025-06-01T09:00:00Z"
  },
  {
    "postingStatusId": 2,
    "code": "OPEN",
    "displayName": "Open",
    "isActive": true,
    "isModified": false,
    "createdBy": 1,
    "createdOn": "2025-06-01T09:00:00Z",
    "modifiedBy": 1,
    "modifiedOn": "2025-06-01T09:00:00Z"
  },
  {
    "postingStatusId": 3,
    "code": "PAUSED",
    "displayName": "Paused",
    "isActive": true,
    "isModified": false,
    "createdBy": 1,
    "createdOn": "2025-06-01T09:00:00Z",
    "modifiedBy": 1,
    "modifiedOn": "2025-06-01T09:00:00Z"
  },
  {
    "postingStatusId": 4,
    "code": "CLOSED",
    "displayName": "Closed",
    "isActive": true,
    "isModified": false,
    "createdBy": 1,
    "createdOn": "2025-06-01T09:00:00Z",
    "modifiedBy": 1,
    "modifiedOn": "2025-06-01T09:00:00Z"
  },
  {
    "postingStatusId": 5,
    "code": "ARCHIVED",
    "displayName": "Archived",
    "isActive": true,
    "isModified": false,
    "createdBy": 1,
    "createdOn": "2025-06-01T09:00:00Z",
    "modifiedBy": 1,
    "modifiedOn": "2025-06-01T09:00:00Z"
  }
]
```

### MST_ViewPolicy

**Purpose**: Defines reusable data access and usage policies.

| Field        | Type        | Notes                                         |
| ------------ | ----------- | --------------------------------------------- |
| ViewPolicyId | int (PK)    |                                               |
| Code         | text        | e.g., STUDY_DURATION_ONLY, RESEARCH_NO_EXPORT |
| DisplayName  | text        |                                               |
| Description  | text        | short summary                                 |
| IsActive     | bool        |                                               |
| IsModified   | bool        |                                               |
| CreatedBy    | int         |                                               |
| CreatedOn    | timestamptz |                                               |
| ModifiedBy   | int         |                                               |
| ModifiedOn   | timestamptz |                                               |

---

**examples**
```json
[
  {
    "viewPolicyId": 1,
    "code": "STUDY_DURATION_ONLY",
    "displayName": "Study Duration Only",
    "description": "Access limited to the active study period.",
    "isActive": true,
    "isModified": false,
    "createdBy": 10,
    "createdOn": "2025-07-01T10:00:00Z",
    "modifiedBy": 10,
    "modifiedOn": "2025-07-01T10:00:00Z"
  },
  {
    "viewPolicyId": 2,
    "code": "RESEARCH_NO_EXPORT",
    "displayName": "Research Use, No Export",
    "description": "Data used for research; export disabled.",
    "isActive": true,
    "isModified": false,
    "createdBy": 10,
    "createdOn": "2025-07-01T10:00:00Z",
    "modifiedBy": 10,
    "modifiedOn": "2025-07-01T10:00:00Z"
  },
  {
    "viewPolicyId": 3,
    "code": "STANDARD",
    "displayName": "Standard Policy",
    "description": "General access policy defined by buyer.",
    "isActive": true,
    "isModified": false,
    "createdBy": 10,
    "createdOn": "2025-07-01T10:00:00Z",
    "modifiedBy": 10,
    "modifiedOn": "2025-07-01T10:00:00Z"
  },
  {
    "viewPolicyId": 4,
    "code": "MODEL_TRAINING_ALLOWED",
    "displayName": "Model Training Allowed",
    "description": "Data may be used to train or refine models.",
    "isActive": true,
    "isModified": false,
    "createdBy": 10,
    "createdOn": "2025-07-01T10:00:00Z",
    "modifiedBy": 10,
    "modifiedOn": "2025-07-01T10:00:00Z"
  },
  {
    "viewPolicyId": 5,
    "code": "NO_EXPORT_INTERNAL_VIEW",
    "displayName": "No Export, Internal View",
    "description": "Only internal viewing permitted; no download.",
    "isActive": true,
    "isModified": false,
    "createdBy": 10,
    "createdOn": "2025-07-01T10:00:00Z",
    "modifiedBy": 10,
    "modifiedOn": "2025-07-01T10:00:00Z"
  }
]
```


### MST_HealthCondition

**Purpose**: Catalog of health conditions for users and posting eligibility.(Same as from the user file)

| Field             | Type        | Notes                                               |
| ----------------- | ----------- | --------------------------------------------------- |
| HealthConditionId | int (PK)    |                                                     |
| Code              | text        | unique (e.g., T2D, HYPERTENSION, ASTHMA, PCOS, CVD) |
| DisplayName       | text        |                                                     |
| IsActive          | bool        |                                                     |
| IsModified        | bool        |                                                     |
| CreatedBy         | int         |                                                     |
| CreatedOn         | timestamptz |                                                     |
| ModifiedBy        | int         |                                                     |
| ModifiedOn        | timestamptz |                                                     |

---

**exapmples**
```json
[
  {
    "healthConditionId": 205,
    "code": "T2D",
    "displayName": "Type 2 Diabetes",
    "isActive": true,
    "isModified": false,
    "createdBy": 11,
    "createdOn": "2025-05-10T08:00:00Z",
    "modifiedBy": 11,
    "modifiedOn": "2025-05-10T08:00:00Z"
  },
  {
    "healthConditionId": 310,
    "code": "HYPERTENSION",
    "displayName": "Hypertension",
    "isActive": true,
    "isModified": false,
    "createdBy": 11,
    "createdOn": "2025-05-10T08:00:00Z",
    "modifiedBy": 11,
    "modifiedOn": "2025-05-10T08:00:00Z"
  },
  {
    "healthConditionId": 410,
    "code": "ASTHMA",
    "displayName": "Asthma",
    "isActive": true,
    "isModified": false,
    "createdBy": 11,
    "createdOn": "2025-05-10T08:00:00Z",
    "modifiedBy": 11,
    "modifiedOn": "2025-05-10T08:00:00Z"
  },
  {
    "healthConditionId": 510,
    "code": "PCOS",
    "displayName": "Polycystic Ovary Syndrome",
    "isActive": true,
    "isModified": false,
    "createdBy": 11,
    "createdOn": "2025-05-10T08:00:00Z",
    "modifiedBy": 11,
    "modifiedOn": "2025-05-10T08:00:00Z"
  },
  {
    "healthConditionId": 610,
    "code": "CVD",
    "displayName": "Cardiovascular Disease",
    "isActive": true,
    "isModified": false,
    "createdBy": 11,
    "createdOn": "2025-05-10T08:00:00Z",
    "modifiedBy": 11,
    "modifiedOn": "2025-05-10T08:00:00Z"
  }
]

```
### MST_Metric

**Purpose**: Catalog of requestable health metrics.

| Field             | Type        | Notes                          |
| ----------------- | ----------- | ------------------------------ |
| MetricId          | int (PK)    |                                |
| Code              | text        | e.g., STEPS, HR, KCAL          |
| DisplayName       | text        |                                |
| CanonicalUnitCode | text        | e.g., BPM, COUNT, KCAL, M, MIN |
| Description       | text        | optional                       |
| IsActive          | bool        |                                |
| IsModified        | bool        |                                |
| CreatedBy         | int         |                                |
| CreatedOn         | timestamptz |                                |
| ModifiedBy        | int         |                                |
| ModifiedOn        | timestamptz |                                |

---
**examples**
```json
[
  {
    "metricId": 101,
    "code": "STEPS",
    "displayName": "Steps",
    "canonicalUnitCode": "COUNT",
    "description": "Total steps per day",
    "isActive": true,
    "isModified": false,
    "createdBy": 20,
    "createdOn": "2025-04-01T09:00:00Z",
    "modifiedBy": 20,
    "modifiedOn": "2025-04-01T09:00:00Z"
  },
  {
    "metricId": 110,
    "code": "HR",
    "displayName": "Heart Rate",
    "canonicalUnitCode": "BPM",
    "description": "Average or sampled heart rate",
    "isActive": true,
    "isModified": false,
    "createdBy": 20,
    "createdOn": "2025-04-01T09:00:00Z",
    "modifiedBy": 20,
    "modifiedOn": "2025-04-01T09:00:00Z"
  },
  {
    "metricId": 111,
    "code": "HRV",
    "displayName": "Heart Rate Variability",
    "canonicalUnitCode": "MS",
    "description": "HRV in milliseconds",
    "isActive": true,
    "isModified": false,
    "createdBy": 20,
    "createdOn": "2025-04-01T09:00:00Z",
    "modifiedBy": 20,
    "modifiedOn": "2025-04-01T09:00:00Z"
  },
  {
    "metricId": 120,
    "code": "SLEEP_MIN",
    "displayName": "Sleep Minutes",
    "canonicalUnitCode": "MIN",
    "description": "Total sleep minutes",
    "isActive": true,
    "isModified": false,
    "createdBy": 20,
    "createdOn": "2025-04-01T09:00:00Z",
    "modifiedBy": 20,
    "modifiedOn": "2025-04-01T09:00:00Z"
  },
  {
    "metricId": 130,
    "code": "DISTANCE",
    "displayName": "Distance",
    "canonicalUnitCode": "M",
    "description": "Distance traveled in meters",
    "isActive": true,
    "isModified": false,
    "createdBy": 20,
    "createdOn": "2025-04-01T09:00:00Z",
    "modifiedBy": 20,
    "modifiedOn": "2025-04-01T09:00:00Z"
  },
  {
    "metricId": 131,
    "code": "FLOORS",
    "displayName": "Floors Climbed",
    "canonicalUnitCode": "COUNT",
    "description": "Number of floors climbed",
    "isActive": true,
    "isModified": false,
    "createdBy": 20,
    "createdOn": "2025-04-01T09:00:00Z",
    "modifiedBy": 20,
    "modifiedOn": "2025-04-01T09:00:00Z"
  },
  {
    "metricId": 140,
    "code": "KCAL",
    "displayName": "Active Energy",
    "canonicalUnitCode": "KCAL",
    "description": "Active energy expenditure",
    "isActive": true,
    "isModified": false,
    "createdBy": 20,
    "createdOn": "2025-04-01T09:00:00Z",
    "modifiedBy": 20,
    "modifiedOn": "2025-04-01T09:00:00Z"
  }
]
```

### MST_RewardType

**Purpose**: Defines available reward mechanisms.

| Field        | Type        | Notes                         |
| ------------ | ----------- | ----------------------------- |
| RewardTypeId | int (PK)    |                               |
| Code         | text        | e.g., POINTS, TOKENS, CREDITS |
| DisplayName  | text        |                               |
| Description  | text        | optional                      |
| IsActive     | bool        |                               |
| IsModified   | bool        |                               |
| CreatedBy    | int         |                               |
| CreatedOn    | timestamptz |                               |
| ModifiedBy   | int         |                               |
| ModifiedOn   | timestamptz |                               |

---

**examples**

```json
[
  {
    "rewardTypeId": 1,
    "code": "POINTS",
    "displayName": "Points",
    "description": "Platform points",
    "isActive": true,
    "isModified": false,
    "createdBy": 30,
    "createdOn": "2025-07-15T10:00:00Z",
    "modifiedBy": 30,
    "modifiedOn": "2025-07-15T10:00:00Z"
  },
  {
    "rewardTypeId": 2,
    "code": "TOKENS",
    "displayName": "Tokens",
    "description": "Platform tokens",
    "isActive": true,
    "isModified": false,
    "createdBy": 30,
    "createdOn": "2025-07-15T10:00:00Z",
    "modifiedBy": 30,
    "modifiedOn": "2025-07-15T10:00:00Z"
  },
  {
    "rewardTypeId": 3,
    "code": "CREDITS",
    "displayName": "Credits",
    "description": "Account credits",
    "isActive": true,
    "isModified": false,
    "createdBy": 30,
    "createdOn": "2025-07-15T10:00:00Z",
    "modifiedBy": 30,
    "modifiedOn": "2025-07-15T10:00:00Z"
  },
  {
    "rewardTypeId": 4,
    "code": "VOUCHER",
    "displayName": "Voucher",
    "description": "Voucher codes",
    "isActive": true,
    "isModified": false,
    "createdBy": 30,
    "createdOn": "2025-07-15T10:00:00Z",
    "modifiedBy": 30,
    "modifiedOn": "2025-07-15T10:00:00Z"
  }
]

```

# Posting Master Table

### MST_Posting

**Purpose**: Main posting record with audit fields.

| Field                    | Type        | Notes                           |
| ------------------------ | ----------- | ------------------------------- |
| PostingId                | int (PK)    |                                 |
| BuyerUserId              | int         | FK to MST_User                  |
| PostingStatusId          | int         | FK to MST_PostingStatus         |
| Title                    | text        |                                 |
| Summary                  | text        | short teaser                    |
| Description              | text        | full details                    |
| ApplyOpenAt              | timestamptz | when posting becomes visible    |
| ApplyCloseAt             | timestamptz | when visibility ends            |
| DataCoverageDaysRequired | int         | e.g., 14                        |
| MinAge                   | int         | nullable                        |
| RewardTypeId             | int         | FK to MST_RewardType |
| RewardValue              | numeric     | nullable                        |
| IsActive                 | bool        |                                 |
| IsModified               | bool        |                                 |
| CreatedBy                | int         |                                 |
| CreatedOn                | timestamptz |                                 |
| ModifiedBy               | int         |                                 |
| ModifiedOn               | timestamptz |                                 |

---
**examples**

```json

[
  {
    "postingId": 9101,
    "buyerId": 42,
    "postingStatusId": 1,
    "title": "Baseline Sleep Capture",
    "summary": "Sleep minutes for 14 days.",
    "description": "Collect nightly sleep minutes to establish a baseline.",
    "applyOpenAt": "2025-10-10T00:00:00Z",
    "applyCloseAt": "2025-10-25T23:59:59Z",
    "dataCoverageDaysRequired": 14,
    "minAge": null,
    "rewardTypeId": 1,
    "rewardValue": 300,
    "isActive": true,
    "isModified": false,
    "createdBy": 42,
    "createdOn": "2025-10-06T09:00:00Z",
    "modifiedBy": 42,
    "modifiedOn": "2025-10-06T09:00:00Z"
  },
  {
    "postingId": 9102,
    "buyerId": 42,
    "postingStatusId": 2,
    "title": "Heart Rate Variability Study",
    "summary": "Daily HR and HRV for 30 days.",
    "description": "Seeking participants to share HR/HRV for a month.",
    "applyOpenAt": "2025-10-01T00:00:00Z",
    "applyCloseAt": "2025-10-31T23:59:59Z",
    "dataCoverageDaysRequired": 30,
    "minAge": 18,
    "rewardTypeId": 1,
    "rewardValue": 1200,
    "isActive": true,
    "isModified": true,
    "createdBy": 42,
    "createdOn": "2025-09-28T12:00:00Z",
    "modifiedBy": 42,
    "modifiedOn": "2025-10-02T08:30:00Z"
  },
  {
    "postingId": 9103,
    "buyerId": 42,
    "postingStatusId": 3,
    "title": "Activity & Energy Correlation",
    "summary": "Steps and active energy for 21 days.",
    "description": "Investigating relationship between steps and kcal.",
    "applyOpenAt": "2025-09-20T00:00:00Z",
    "applyCloseAt": "2025-10-20T23:59:59Z",
    "dataCoverageDaysRequired": 21,
    "minAge": 18,
    "rewardTypeId": 1,
    "rewardValue": 800,
    "isActive": true,
    "isModified": true,
    "createdBy": 42,
    "createdOn": "2025-09-15T10:00:00Z",
    "modifiedBy": 42,
    "modifiedOn": "2025-10-01T07:45:00Z"
  },
  {
    "postingId": 9104,
    "buyerId": 42,
    "postingStatusId": 4,
    "title": "Distance & Floors Study",
    "summary": "Daily distance and floors for 10 days.",
    "description": "Closed after reaching target participants.",
    "applyOpenAt": "2025-08-01T00:00:00Z",
    "applyCloseAt": "2025-09-01T00:00:00Z",
    "dataCoverageDaysRequired": 10,
    "minAge": null,
    "rewardTypeId": 1,
    "rewardValue": 400,
    "isActive": true,
    "isModified": true,
    "createdBy": 42,
    "createdOn": "2025-07-28T14:00:00Z",
    "modifiedBy": 42,
    "modifiedOn": "2025-09-02T09:00:00Z"
  },
  {
    "postingId": 9105,
    "buyerId": 42,
    "postingStatusId": 5,
    "title": "Energy Burn Patterns",
    "summary": "KCal trends over 7 days.",
    "description": "Archived study for historical reference.",
    "applyOpenAt": "2025-06-10T00:00:00Z",
    "applyCloseAt": "2025-06-30T23:59:59Z",
    "dataCoverageDaysRequired": 7,
    "minAge": 21,
    "rewardTypeId": 1,
    "rewardValue": 200,
    "isActive": true,
    "isModified": true,
    "createdBy": 42,
    "createdOn": "2025-06-01T11:30:00Z",
    "modifiedBy": 42,
    "modifiedOn": "2025-07-01T08:10:00Z"
  }
]

```

# Transaction Tables

## TRN_PostingMetric

**Purpose**: Metrics requested per posting.

| Field           | Type     | Notes             |
| --------------- | -------- | ----------------- |
| PostingMetricId | int (PK) |                   |
| PostingId       | int      | FK to MST_Posting |
| MetricId        | int      | FK to MST_Metric  |

---
**examples**

```json
[
  { "postingMetricId": 50001, "postingId": 9101, "metricId": 120 },
  { "postingMetricId": 50002, "postingId": 9102, "metricId": 110 },
  { "postingMetricId": 50003, "postingId": 9102, "metricId": 111 },
  { "postingMetricId": 50004, "postingId": 9103, "metricId": 101 },
  { "postingMetricId": 50005, "postingId": 9103, "metricId": 140 },
  { "postingMetricId": 50006, "postingId": 9104, "metricId": 130 },
  { "postingMetricId": 50007, "postingId": 9104, "metricId": 131 },
  { "postingMetricId": 50008, "postingId": 9105, "metricId": 140 }
]

```
## TRN_PostingHealthCondition

**Purpose**: Eligibility conditions attached to a posting.

| Field                    | Type     | Notes                     |
| ------------------------ | -------- | ------------------------- |
| PostingHealthConditionId | int (PK) |                           |
| PostingId                | int      | FK to MST_Posting         |
| HealthConditionId        | int      | FK to MST_HealthCondition |

---

**example**
```json
[
  { "postingHealthConditionId": 60001, "postingId": 9102, "healthConditionId": 205 },
  { "postingHealthConditionId": 60001, "postingId": 9102, "healthConditionId": 206 },
  { "postingHealthConditionId": 60001, "postingId": 9102, "healthConditionId": 207 },
  { "postingHealthConditionId": 60001, "postingId": 9102, "healthConditionId": 208 },
  { "postingHealthConditionId": 60001, "postingId": 9102, "healthConditionId": 209 },
  { "postingHealthConditionId": 60002, "postingId": 9102, "healthConditionId": 205 }
]
```

## TRN_PostingTag

**Purpose**: Search/filter tags for a posting.

| Field        | Type     | Notes             |
| ------------ | -------- | ----------------- |
| PostingTagId | int (PK) |                   |
| PostingId    | int      | FK to MST_Posting |
| Tag          | text     |                   |

---
**examples**

```json
[
  { "postingTagId": 70001, "postingId": 9101, "tag": "sleep" },
  { "postingTagId": 70002, "postingId": 9101, "tag": "baseline" },
  { "postingTagId": 70003, "postingId": 9102, "tag": "hr" },
  { "postingTagId": 70004, "postingId": 9102, "tag": "hrv" },
  { "postingTagId": 70005, "postingId": 9102, "tag": "month" },
  { "postingTagId": 70006, "postingId": 9103, "tag": "steps" },
  { "postingTagId": 70007, "postingId": 9103, "tag": "kcal" },
  { "postingTagId": 70008, "postingId": 9104, "tag": "distance" },
  { "postingTagId": 70009, "postingId": 9104, "tag": "floors" },
  { "postingTagId": 70010, "postingId": 9105, "tag": "kcal" },
  { "postingTagId": 70011, "postingId": 9105, "tag": "short" }
]
```

## TRN_PostingImage

**Purpose**: Image for a posting (one-row limit per posting for now).

| Field          | Type     | Notes             |
| -------------- | -------- | ----------------- |
| PostingImageId | int (PK) |                   |
| PostingId      | int      | FK to MST_Posting |
| ImageUrl       | text     |                   |

_(Application UI will enforce one image per posting in V1.)_

**examples**
```json
[
  { "postingImageId": 80001, "postingId": 9101, "imageUrl": "https://cdn.example.com/p/9101.jpg" },
  { "postingImageId": 80002, "postingId": 9102, "imageUrl": "https://cdn.example.com/p/9102.jpg" },
  { "postingImageId": 80003, "postingId": 9103, "imageUrl": "https://cdn.example.com/p/9103.jpg" },
  { "postingImageId": 80004, "postingId": 9104, "imageUrl": "https://cdn.example.com/p/9104.jpg" },
  { "postingImageId": 80005, "postingId": 9105, "imageUrl": "https://cdn.example.com/p/9105.jpg" }
]
```

## TRN_PostingViewPolicy

**Purpose**  
Link each posting to one or more selected view policies.  
This allows buyers to attach multiple policy definitions (e.g., “Study Duration Only” + “No Export”) to the same posting.

**Fields**

| Field               | Type     | Notes |
|---------------------|----------|-------|
| PostingViewPolicyId | int (PK) | Surrogate key for this record. |
| PostingId           | int      | FK → MST_Posting (or TRN_Posting if renamed). |
| ViewPolicyId        | int      | FK → MST_ViewPolicy. |

**Usage**  
Each posting can reference one or more view policies.  
The API represents these as an array of integers:

**examples**

```json
[
  { "postingViewPolicyId": 90001, "postingId": 9102, "viewPolicyId": 5 },
  { "postingViewPolicyId": 90002, "postingId": 9103, "viewPolicyId": 2 },
  { "postingViewPolicyId": 90003, "postingId": 9102, "viewPolicyId": 7 },
  { "postingViewPolicyId": 90004, "postingId": 9104, "viewPolicyId": 4 }
]
```

# Posting APIs (Buyer Scope)

| Endpoint                                        | Method | Purpose                                                                                                                                       |
| ----------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `/buyers_postings/{buyerId}`                    | POST   | Create a new posting for the specified buyer, inserting core record plus metrics, view policies, optional health conditions, tags, and image. |
| `/buyers_postings_list/{buyerId}`               | GET    | List a buyer’s postings with filters (status, search query), sorting, and pagination; can return per-status counts.                           |
| `/buyers_postings_detail/{buyerId}/{postingId}` | GET    | Fetch full details of a specific posting owned by the buyer, including metrics, view policies, health conditions, tags, and image.            |
| `/buyers_postings_update/{buyerId}/{postingId}` | PATCH  | Update mutable fields of a posting; array fields act as full-set replacements; supports replacing/removing image.                             |
| `/buyers_postings_delete/{buyerId}/{postingId}` | DELETE | Soft delete a posting (`isActive=false`) so it no longer appears in listings.                                                                 |
| `/metrics`                                      | GET    | Retrieve the catalog of active metrics available for selection in postings.                                                                   |
| `/health_conditions`                            | GET    | Retrieve the catalog of active health conditions used for eligibility in postings.                                                            |
| `/posting_statuses`                             | GET    | Retrieve the allowed posting lifecycle statuses (e.g., DRAFT, OPEN, etc.).                                                                    |
| `/reward_types`                                 | GET    | Retrieve the catalog of available reward/compensation types.                                                                                  |
| `/view_policies`                                | GET    | Retrieve the catalog of reusable view/usage policies buyers can attach to postings.                                                           |



All endpoints in this section are scoped by `buyerId` in the path.  
`buyerId` is a foreign key to the User table and identifies a user acting with the Buyer role.

Conventions:

- Tags are stored and returned as plain strings without `#` (the UI will render hashtags).
- `imageUrl` is optional. If not provided at create time, the backend will set a platform default image. If set to `null` on update, the image is removed (and the backend may again return a default).
- Arrays provided in `POST`/`PATCH` replace the full set for that field. Omitted arrays are left unchanged.
- Pagination defaults: `page=1`, `pageSize=10`.

---

## 1. Create Posting
## Create: POST /buyers_postings_create/{buyerId}

<!-- **POST** `/buyers/{buyerId}/postings_create` -->
**POST** `/buyers_postings_create/{buyerId}`


**Purpose**  
Create a new posting under the specified buyer. Defaults to `DRAFT` if no status is provided.

**Path Parameters**

- `buyerId` — integer; the posting owner’s user id (FK to User with Buyer role).

**Request Body**

- `title` (string, required)
- `summary` (string, required)
- `description` (string, required)
- `applyOpenAt` (string, RFC3339)
- `applyCloseAt` (string, RFC3339)
- `dataCoverageDaysRequired` (integer, required, ≥ 1)
- `minAge` (integer, optional)
- `rewardTypeId` (integer)
- `rewardValue` (number)
- `postingStatusId` (int, one of `DRAFT`, `OPEN`, `PAUSED`, `CLOSED`, `ARCHIVED`)
- `postingMetricIds` (integer[]) — list of `MetricId`
- `healthConditionIds` (integer[], optional) — list of `HealthConditionId`; include only when relevant
- `tags` (string[], optional) — stored without `#`; can be empty or omitted
- `imageUrl` (string, optional) — one image per posting; if omitted, backend may set default
- `assetId`(string, optional)From Upload API; promotes image to permanent storage.
- `imageAction`(string, Only) `"REMOVE"` allowed; forces no image on create.  


**Sample Response (201)**

```json
{
  "postingId": 9001,
  "buyerId": 42,
  "postingStatusId": 2,
  "title": "7-Day Activity Snapshot",
  "summary": "Daily steps and hourly heart rate for one week.",
  "description": "We are collecting steps and HR to understand weekly activity patterns.",
  "applyOpenAt": "2025-10-08T00:00:00Z",
  "applyCloseAt": "2025-10-31T23:59:59Z",
  "dataCoverageDaysRequired": 7,
  "minAge": 18,
  "viewPolicyIds": [3, 4],
  "rewardTypeId": 1,
  "rewardValue": 500,
  "tags": ["steps", "heartrate", "week"],
  "imageUrl": "https://cdn.example.com/postings/42/9001/ast_7c2c2b0d-steps-banner.png",
  "metrics": [101, 110],
  "healthConditionIds": [205],
  "isActive": true,
  "isModified": false,
  "createdBy": 42,
  "createdOn": "2025-10-08T12:05:00Z",
  "modifiedBy": 42,
  "modifiedOn": "2025-10-08T12:05:00Z"
}
```

---

## 2. List Buyer Postings
## List: GET /buyers_postings_list/{buyerId}

<!-- **GET** `/buyers/{buyerId}/postings_list` -->
**GET** `/buyers_postings_list/{buyerId}`


**Purpose**
List postings owned by a buyer with filtering and pagination.

**Path Parameters**

- `buyerId` — integer; the posting owner’s user id.

**Query Parameters**

- `statusIds` — ids ; single value or CSV or repeated (e.g., 1,2&3)
- `tag`: string. Filter postings that have an exact tag in `TRN_PostingTag`.
- `page` — integer; default 1
- `pageSize` — integer; default 10; max 100
- `sort` — string; e.g., `createdOn:desc,title:asc`
- `includeStatusCounts` — boolean; when true, returns counts per status

**Sample Response (200)**
Includes one example item per status: `DRAFT`, `OPEN`, `PAUSED`, `CLOSED`, `ARCHIVED`.
```json
{
"items": [
{
"postingId": 9101,
"buyerId": 42,
"postingStatusId": "2",
"title": "Baseline Sleep Capture",
"summary": "Sleep minutes for 14 days.",
"description": "Collect nightly sleep minutes to establish a baseline.",
"applyOpenAt": "2025-10-10T00:00:00Z",
"applyCloseAt": "2025-10-25T23:59:59Z",
"dataCoverageDaysRequired": 14,
"minAge": null,
"viewPolicyIds": [1,2,3],
"rewardTypeId": 1,
"rewardValue": 300,
"tags": ["sleep","baseline"],
"imageUrl": "https://cdn.example.com/p/9101.jpg",
"postingMetricId": [120],
"isActive": true,
"isModified": false,
"createdBy": 42,
"createdOn": "2025-10-06T09:00:00Z",
"modifiedBy": 42,
"modifiedOn": "2025-10-06T09:00:00Z"
},
{
"postingId": 9102,
"buyerId": 42,
"postingStatusCode": "OPEN",
"title": "Heart Rate Variability Study",
"summary": "Daily HR and HRV for 30 days.",
"description": "Seeking participants to share HR/HRV for a month.",
"applyOpenAt": "2025-10-01T00:00:00Z",
"applyCloseAt": "2025-10-31T23:59:59Z",
"dataCoverageDaysRequired": 30,
"minAge": 18,
"viewPolicyIds": [5],
"rewardTypeId": 1,
"rewardValue": 1200,
"tags": ["hr","hrv","month"],
"imageUrl": "https://cdn.example.com/p/9102.jpg",
"metrics": [110,111],
"healthConditionIds": [205],
"isActive": true,
"isModified": true,
"createdBy": 42,
"createdOn": "2025-09-28T12:00:00Z",
"modifiedBy": 42,
"modifiedOn": "2025-10-02T08:30:00Z"
},
{
"postingId": 9103,
"buyerId": 42,
"postingStatusCode": "PAUSED",
"title": "Activity & Energy Correlation",
"summary": "Steps and active energy for 21 days.",
"description": "Investigating relationship between steps and kcal.",
"applyOpenAt": "2025-09-20T00:00:00Z",
"applyCloseAt": "2025-10-20T23:59:59Z",
"dataCoverageDaysRequired": 21,
"minAge": 18,
"viewPolicyIds": [2],
"rewardTypeId": 1,
"rewardValue": 800,
"tags": ["steps","kcal","threeweeks"],
"imageUrl": "https://cdn.example.com/p/9103.jpg",
"metrics": [101,140],
"isActive": true,
"isModified": true,
"createdBy": 42,
"createdOn": "2025-09-15T10:00:00Z",
"modifiedBy": 42,
"modifiedOn": "2025-10-01T07:45:00Z"
},
{
"postingId": 9104,
"buyerId": 42,
"postingStatusCode": "CLOSED",
"title": "Distance & Floors Study",
"summary": "Daily distance and floors for 10 days.",
"description": "Closed after reaching target participants.",
"applyOpenAt": "2025-08-01T00:00:00Z",
"applyCloseAt": "2025-09-01T00:00:00Z",
"dataCoverageDaysRequired": 10,
"minAge": null,
"viewPolicyIds": [4],
"rewardTypeId": 1,
"rewardValue": 400,
"tags": ["distance","floors","ten"],
"imageUrl": "https://cdn.example.com/p/9104.jpg",
"metrics": [130,131],
"isActive": true,
"isModified": true,
"createdBy": 42,
"createdOn": "2025-07-28T14:00:00Z",
"modifiedBy": 42,
"modifiedOn": "2025-09-02T09:00:00Z"
},
{
"postingId": 9105,
"buyerId": 42,
"postingStatusCode": "ARCHIVED",
"title": "Energy Burn Patterns",
"summary": "KCal trends over 7 days.",
"description": "Archived study for historical reference.",
"applyOpenAt": "2025-06-10T00:00:00Z",
"applyCloseAt": "2025-06-30T23:59:59Z",
"dataCoverageDaysRequired": 7,
"minAge": 21,
"viewPolicyIds": [5],
"rewardTypeId": 1,
"rewardValue": 200,
"tags": ["kcal","short"],
"imageUrl": "https://cdn.example.com/p/9105.jpg",
"metrics": [140],
"isActive": true,
"isModified": true,
"createdBy": 42,
"createdOn": "2025-06-01T11:30:00Z",
"modifiedBy": 42,
"modifiedOn": "2025-07-01T08:10:00Z"
}
],
"page": 1,
"pageSize": 10,
"total": 143,
"statusCounts": {
"DRAFT": 12,
"OPEN": 7,
"PAUSED": 3,
"CLOSED": 98,
"ARCHIVED": 23
}
}
```

## 3. Get Posting by ID
## Detail: GET /buyers_postings_detail/{buyerId}/{postingId}

<!-- **GET** `/buyers/{buyerId}/postings_detail/{postingId}` -->
**GET** `/buyers_postings_detail/{buyerId}/{postingId}`


**Purpose**
Fetch full details of a specific posting owned by the buyer.

**Path Parameters**

- `buyerId` — integer
- `postingId` — integer

**Sample Response (200)**

```json
{
  "postingId": 9102,
  "buyerId": 42,
  "postingStatusCode": "OPEN",
  "title": "Heart Rate Variability Study",
  "summary": "Daily HR and HRV for 30 days.",
  "description": "Seeking participants to share HR/HRV for a month.",
  "applyOpenAt": "2025-10-01T00:00:00Z",
  "applyCloseAt": "2025-10-31T23:59:59Z",
  "dataCoverageDaysRequired": 30,
  "minAge": 18,
  "viewPolicyIds": [5],
  "rewardTypeId": 1,
  "rewardValue": 1200,
  "tags": ["hr", "hrv", "month"],
  "imageUrl": "https://cdn.example.com/p/9102.jpg",
  "metrics": [110, 111],
  "healthConditionIds": [205],
  "isActive": true,
  "isModified": true,
  "createdBy": 42,
  "createdOn": "2025-09-28T12:00:00Z",
  "modifiedBy": 42,
  "modifiedOn": "2025-10-02T08:30:00Z"
}
```

---

## 4. Update Posting
## Update: PATCH /buyers_postings_update/{buyerId}/{postingId}

**PATCH** `/buyers_postings_update/{buyerId}/{postingId}`

**Purpose**
Update mutable fields of a posting. Arrays provided replace the full set; omitted arrays remain unchanged.

**Path Parameters**

- `buyerId` — integer
- `postingId` — integer

**Request Body** (any subset)

- `title` (string)
- `summary` (string)
- `description` (string)
- `applyOpenAt` (string, RFC3339)
- `applyCloseAt` (string, RFC3339)
- `dataCoverageDaysRequired` (integer, ≥ 1)
- `minAge` (integer)
- `viewPolicyIds` (integer[]) — full replace; can be empty to clear
- `rewardTypeId` (integer)
- `rewardValue` (number)
- `postingStatusCode` (string; `DRAFT`, `OPEN`, `PAUSED`, `CLOSED`, `ARCHIVED`)
- `metrics` (integer[]) — full replace
- `healthConditionIds` (integer[]) — full replace
- `tags` (string[]) — full replace
- `imageUrl` (string or null) — replace or remove

**Sample Request**

```json
{
  "title": "Heart Rate Variability Study (Updated)",
  "summary": "Daily HR and HRV for 30 days. Extra focus on rest days.",
  "applyCloseAt": "2025-11-05T23:59:59Z",
  "dataCoverageDaysRequired": 30,
  "rewardValue": 1500,
  "postingStatusCode": "OPEN",
  "metrics": [110, 111],
  "healthConditionIds": [205],
  "viewPolicyIds": [5, 7],
  "tags": ["hr", "hrv", "month", "rest"],
  "imageUrl": "https://cdn.example.com/p/9102_v2.jpg"
}
```

**Sample Response (200)**

```json
{
  "postingId": 9102,
  "buyerId": 42,
  "postingStatusCode": "OPEN",
  "title": "Heart Rate Variability Study (Updated)",
  "summary": "Daily HR and HRV for 30 days. Extra focus on rest days.",
  "description": "Seeking participants to share HR/HRV for a month.",
  "applyOpenAt": "2025-10-01T00:00:00Z",
  "applyCloseAt": "2025-11-05T23:59:59Z",
  "dataCoverageDaysRequired": 30,
  "minAge": 18,
  "viewPolicyIds": [5, 7],
  "rewardTypeId": 1,
  "rewardValue": 1500,
  "tags": ["hr", "hrv", "month", "rest"],
  "imageUrl": "https://cdn.example.com/p/9102_v2.jpg",
  "metrics": [110, 111],
  "healthConditionIds": [205],
  "isActive": true,
  "isModified": true,
  "createdBy": 42,
  "createdOn": "2025-09-28T12:00:00Z",
  "modifiedBy": 42,
  "modifiedOn": "2025-10-07T13:30:00Z"
}
```

---

## 5. Delete Posting (Soft Delete)
## Delete: DELETE /buyers_postings_delete/{buyerId}/{postingId}

**DELETE** `/buyers_postings_delete/{buyerId}/{postingId}`

**Purpose**
Soft-delete a posting by setting `isActive=false`. Soft-deleted postings are not returned in list results.

**Path Parameters**

- `buyerId` — integer
- `postingId` — integer

**Sample Response (204)**

```json
{}
```

---

# Master Data APIs

## GET /metrics

**Purpose**
List active metrics available for selection.

**Sample Response (200)**

```json
{
  "items": [
    {
      "metricId": 101,
      "code": "STEPS",
      "displayName": "Steps",
      "canonicalUnitCode": "COUNT",
      "isActive": true
    },
    {
      "metricId": 110,
      "code": "HR",
      "displayName": "Heart Rate",
      "canonicalUnitCode": "BPM",
      "isActive": true
    },
    {
      "metricId": 111,
      "code": "HRV",
      "displayName": "Heart Rate Variability",
      "canonicalUnitCode": "MS",
      "isActive": true
    },
    {
      "metricId": 120,
      "code": "SLEEP_MIN",
      "displayName": "Sleep Minutes",
      "canonicalUnitCode": "MIN",
      "isActive": true
    },
    {
      "metricId": 130,
      "code": "DISTANCE",
      "displayName": "Distance",
      "canonicalUnitCode": "M",
      "isActive": true
    },
    {
      "metricId": 131,
      "code": "FLOORS",
      "displayName": "Floors Climbed",
      "canonicalUnitCode": "COUNT",
      "isActive": true
    },
    {
      "metricId": 140,
      "code": "KCAL",
      "displayName": "Active Energy",
      "canonicalUnitCode": "KCAL",
      "isActive": true
    }
  ]
}
```

---

## GET /health_conditions

**Purpose**
List active health conditions (same structure as used in user schema).

**Sample Response (200)**

```json
{
  "items": [
    {
      "healthConditionId": 205,
      "code": "T2D",
      "displayName": "Type 2 Diabetes",
      "isActive": true
    },
    {
      "healthConditionId": 310,
      "code": "HYPERTENSION",
      "displayName": "Hypertension",
      "isActive": true
    },
    {
      "healthConditionId": 410,
      "code": "ASTHMA",
      "displayName": "Asthma",
      "isActive": true
    },
    {
      "healthConditionId": 510,
      "code": "PCOS",
      "displayName": "Polycystic Ovary Syndrome",
      "isActive": true
    },
    {
      "healthConditionId": 610,
      "code": "CVD",
      "displayName": "Cardiovascular Disease",
      "isActive": true
    }
  ]
}
```

---

## GET /posting_statuses

**Purpose**
List allowed posting statuses.

**Sample Response (200)**

```json
{
  "items": [
    {
      "postingStatusId": 1,
      "code": "DRAFT",
      "displayName": "Draft",
      "isActive": true
    },
    {
      "postingStatusId": 2,
      "code": "OPEN",
      "displayName": "Open",
      "isActive": true
    },
    {
      "postingStatusId": 3,
      "code": "PAUSED",
      "displayName": "Paused",
      "isActive": true
    },
    {
      "postingStatusId": 4,
      "code": "CLOSED",
      "displayName": "Closed",
      "isActive": true
    },
    {
      "postingStatusId": 5,
      "code": "ARCHIVED",
      "displayName": "Archived",
      "isActive": true
    }
  ]
}
```

---

## GET /reward_types

**Purpose**
List reward types.

**Sample Response (200)**

```json
{
  "items": [
    {
      "rewardTypeId": 1,
      "code": "POINTS",
      "displayName": "Points",
      "isActive": true
    },
    {
      "rewardTypeId": 2,
      "code": "TOKENS",
      "displayName": "Tokens",
      "isActive": true
    },
    {
      "rewardTypeId": 3,
      "code": "CREDITS",
      "displayName": "Credits",
      "isActive": true
    },
    {
      "rewardTypeId": 4,
      "code": "VOUCHER",
      "displayName": "Voucher",
      "isActive": true
    }
  ]
}
```

---

## GET /view_policies

**Purpose**
List view policies (defined as label/description only).

**Sample Response (200)**

```json
{
  "items": [
    {
      "viewPolicyId": 1,
      "code": "STUDY_DURATION_ONLY",
      "displayName": "Study Duration Only",
      "description": "Access limited to the study period."
    },
    {
      "viewPolicyId": 2,
      "code": "RESEARCH_NO_EXPORT",
      "displayName": "Research Use, No Export",
      "description": "Data used for research; export not allowed."
    },
    {
      "viewPolicyId": 3,
      "code": "STANDARD",
      "displayName": "Standard Policy",
      "description": "General access policy defined by the buyer."
    }
  ]
}
```

## Logic and snippets that will help with development
### Create Posting API (`POST /buyers_postings_create/{buyerId}`)
## Backend: Create

## Purpose

Create a new posting owned by `buyerId`. Accept master-table references by **ID**, promote an uploaded image from **staging** (via `assetId`) to **permanent** storage, and insert all related rows (metrics, view policies, health conditions, tags, image). Defaults to **DRAFT** when `postingStatusId` is not provided.

---

## Authentication & Ownership

* Caller must be authenticated as the same `buyerId` in the path.
* Calls are **buyer-scoped**; only this buyer may create the posting.

---

## Request Body

| Field                      | Type             | Required | Description                                                             |
| -------------------------- | ---------------- | :------: | ----------------------------------------------------------------------- |
| `title`                    | string           |     Yes    | Posting title.                                                          |
| `summary`                  | string           |     Yes    | Short teaser for marketplace cards.                                     |
| `description`              | string           |     Yes    | Full study details.                                                     |
| `applyOpenAt`              | string (RFC3339) |     Yes     | When applications become visible/allowed.                               |
| `applyCloseAt`             | string (RFC3339) |     Yes     | When applications close. Must be after `applyOpenAt` when both present. |
| `dataCoverageDaysRequired` | integer (≥1)     |     Yes    | Relative data window length (days).                                     |
| `minAge`                   | integer          |      No    | Minimum participant age.                                                |
| `rewardTypeId`             | int (FK)         |     Yes     | Reward type (e.g., POINTS).                                             |
| `rewardValue`              | number           |      Yes    | Reward quantity (e.g., 500 points).                                     |
| `postingStatusId`          | int (FK)         |   Yes       | If omitted: server sets DRAFT.                                          |
| `metrics`                  | int[] (FK)       |    Yes      | List of `MetricId`.                                                     |
| `viewPolicyIds`            | int[] (FK)       |    Yes      | List of `ViewPolicyId`.                                                 |
| `healthConditionIds`       | int[] (FK)       |    No      | List of `HealthConditionId`.                                            |
| `tags`                     | string[]         |    No      | Plain strings (no `#`); UI renders hashtags.                            |
| `assetId`                  | string           |    No      | From **Upload API**; promotes image to permanent storage.               |
| `imageAction`              | string           |     No     | Only `"REMOVE"` allowed; forces no image on create.                     |

> Send **either** `assetId` to attach an image **or** `imageAction: "REMOVE"` to explicitly create with no image. Do **not** send raw files here.

---

## Sample Request

```json
{
  "title": "7-Day Activity Snapshot",
  "summary": "Daily steps and hourly heart rate for one week.",
  "description": "We are collecting steps and HR to understand weekly activity patterns.",
  "applyOpenAt": "2025-10-08T00:00:00Z",
  "applyCloseAt": "2025-10-31T23:59:59Z",
  "dataCoverageDaysRequired": 7,
  "minAge": 18,
  "rewardTypeId": 1,
  "rewardValue": 500,
  "postingStatusId": 2,
  "metrics": [101, 110],
  "viewPolicyIds": [3, 4],
  "healthConditionIds": [205],
  "tags": ["steps", "heartrate", "week"],
  "assetId": "ast_7c2c2b0d"
}
```

---

## Sample Response (201)

```json
{
  "postingId": 9001,
  "buyerId": 42,
  "postingStatusId": 2,
  "title": "7-Day Activity Snapshot",
  "summary": "Daily steps and hourly heart rate for one week.",
  "description": "We are collecting steps and HR to understand weekly activity patterns.",
  "applyOpenAt": "2025-10-08T00:00:00Z",
  "applyCloseAt": "2025-10-31T23:59:59Z",
  "dataCoverageDaysRequired": 7,
  "minAge": 18,
  "viewPolicyIds": [3, 4],
  "rewardTypeId": 1,
  "rewardValue": 500,
  "tags": ["steps", "heartrate", "week"],
  "imageUrl": "https://cdn.example.com/postings/42/9001/ast_7c2c2b0d-steps-banner.png",
  "metrics": [101, 110],
  "healthConditionIds": [205],
  "isActive": true,
  "isModified": false,
  "createdBy": 42,
  "createdOn": "2025-10-08T12:05:00Z",
  "modifiedBy": 42,
  "modifiedOn": "2025-10-08T12:05:00Z"
}
```

---

### Sample Request

```json
{
  "title": "Baseline Sleep Capture",
  "summary": "Sleep data for 14 days.",
  "description": "We are collecting nightly sleep duration for baseline analysis.",
  "applyOpenAt": "2025-10-10T00:00:00Z",
  "applyCloseAt": "2025-10-25T23:59:59Z",
  "dataCoverageDaysRequired": 14,
  "postingStatusId": 1,
  "metrics": [120],
  "tags": ["sleep", "baseline"],
  "imageAction": "REMOVE"
}
```

### 201 Response (example body)

```json
{
  "postingId": 9201,
  "buyerId": 42,
  "postingStatusId": 1,
  "title": "Baseline Sleep Capture",
  "summary": "Sleep data for 14 days.",
  "description": "We are collecting nightly sleep duration for baseline analysis.",
  "applyOpenAt": "2025-10-10T00:00:00Z",
  "applyCloseAt": "2025-10-25T23:59:59Z",
  "dataCoverageDaysRequired": 14,
  "minAge": null,
  "viewPolicyIds": [],
  "rewardTypeId": null,
  "rewardValue": null,
  "tags": ["sleep", "baseline"],
  "imageUrl": null,
  "metrics": [120],
  "healthConditionIds": [],
  "isActive": true,
  "isModified": false,
  "createdBy": 42,
  "createdOn": "2025-10-08T12:00:00Z",
  "modifiedBy": 42,
  "modifiedOn": "2025-10-08T12:00:00Z"
}
```

## Validation Rules

1. **Auth & Ownership**: `buyerId` in path must match authenticated buyer.
2. **Required Fields**: `title`, `summary`, `description`, `dataCoverageDaysRequired >= 1`.
3. **Dates**: If both present, `applyOpenAt < applyCloseAt`.
4. **Master References**: `postingStatusId`, `rewardTypeId`, `metrics[]`, `viewPolicyIds[]`, `healthConditionIds[]` must exist and be active in their master tables.
5. **Image Reference**:

   * If `assetId` is provided: staging path `tmp/{buyerId}/{assetId}/…` must exist and belong to the buyer.
   * If `imageAction == "REMOVE"`: force no image (ignore `assetId` if both provided).
6. **Tags**: Trim, normalize; ignore empties.
7. **Single Image Rule (V1)**: Only one image per posting.

---

## Data Flow (Transactional)

1. Insert **MST_Posting** core row:

   * `postingStatusId` = provided or the ID for **DRAFT** if absent.
   * Audit: `isActive=true`, `isModified=false`, timestamps, `createdBy/modifiedBy=buyerId`.
2. Insert **TRN_PostingMetric** rows (one per `MetricId`).
3. Insert **TRN_PostingViewPolicy** rows (one per `ViewPolicyId`).
4. Insert **TRN_PostingHealthCondition** rows (one per `HealthConditionId`).
5. Insert **TRN_PostingTag** rows (one per tag string).
6. **Image promotion**:

   * If `assetId` present: move from `tmp/{buyerId}/{assetId}/file.ext` → `postings/{buyerId}/{postingId}/{assetId}-{fileName}`; compute `imageUrl`; upsert **TRN_PostingImage**; delete staging copy.
   * If `imageAction == "REMOVE"`: ensure no image row for this posting (imageUrl = `null`).
7. Commit and return full posting payload (including `imageUrl`).

---

## Pseudocode

```pseudo
BEGIN TRANSACTION
  assert(auth.buyerId == path.buyerId)

  require(body.title && body.summary && body.description)
  require(body.dataCoverageDaysRequired >= 1)
  if body.applyOpenAt && body.applyCloseAt:
      require(body.applyOpenAt < body.applyCloseAt)

  statusId = body.postingStatusId ?? getStatusId("DRAFT")

  validateRewardType(body.rewardTypeId)
  validateMetricIds(body.metrics)
  validateViewPolicyIds(body.viewPolicyIds)
  validateHealthConditionIds(body.healthConditionIds)

  postingId = INSERT MST_Posting(...) RETURNING PostingId

  BULK INSERT TRN_PostingMetric(postingId, metricId) for each body.metrics
  BULK INSERT TRN_PostingViewPolicy(postingId, viewPolicyId) for each body.viewPolicyIds
  BULK INSERT TRN_PostingHealthCondition(postingId, healthConditionId) for each body.healthConditionIds
  BULK INSERT TRN_PostingTag(postingId, tag) for each normalized body.tags

  if body.imageAction == "REMOVE":
     DELETE TRN_PostingImage WHERE PostingId = postingId
  else if body.assetId:
     assert exists tmp/{buyerId}/{assetId}/meta.json
     finalName = assetId + "-" + sanitize(meta.fileName)
     MOVE tmp → postings/{buyerId}/{postingId}/{finalName}
     imageUrl = PUBLIC_BASE + "/postings/" + buyerId + "/" + postingId + "/" + finalName
     UPSERT TRN_PostingImage(PostingId, ImageUrl)

COMMIT
RETURN 201 with full posting payload (incl. imageUrl)
```

---

## SQL-Style Snippets (Illustrative)

**Core posting**

```sql
INSERT INTO MST_Posting
  (BuyerUserId, PostingStatusId, Title, Summary, Description,
   ApplyOpenAt, ApplyCloseAt, DataCoverageDaysRequired, MinAge,
   RewardTypeId, RewardValue, IsActive, IsModified,
   CreatedBy, CreatedOn, ModifiedBy, ModifiedOn)
VALUES
  (:buyerId, :postingStatusId, :title, :summary, :description,
   :applyOpenAt, :applyCloseAt, :dataCoverageDaysRequired, :minAge,
   :rewardTypeId, :rewardValue, TRUE, FALSE,
   :buyerId, NOW(), :buyerId, NOW())
RETURNING PostingId;
```

**Children (bulk inserts)**

```sql
-- Metrics
INSERT INTO TRN_PostingMetric (PostingId, MetricId)
SELECT :postingId, m.id FROM UNNEST(:metricIds) AS m(id);

-- View policies
INSERT INTO TRN_PostingViewPolicy (PostingId, ViewPolicyId)
SELECT :postingId, v.id FROM UNNEST(:viewPolicyIds) AS v(id);

-- Health conditions
INSERT INTO TRN_PostingHealthCondition (PostingId, HealthConditionId)
SELECT :postingId, h.id FROM UNNEST(:healthConditionIds) AS h(id);

-- Tags
INSERT INTO TRN_PostingTag (PostingId, Tag)
SELECT :postingId, t.tag FROM UNNEST(:tags) AS t(tag);

-- Image (single row per posting)
INSERT INTO TRN_PostingImage (PostingId, ImageUrl)
VALUES (:postingId, :imageUrl)
ON CONFLICT (PostingId) DO UPDATE
SET ImageUrl = EXCLUDED.ImageUrl;
```

---

## Edge Cases

* Missing `postingStatusId`: resolve to ID for **DRAFT**.
* `assetId` provided but staging missing/expired: `400` `"UnknownAssetId"`.
* Both `assetId` and `imageAction: "REMOVE"` present: **REMOVE wins**.
* Duplicate metrics/tags: de-duplicate server-side before insert.
* `applyCloseAt` < `applyOpenAt`: `400` `"InvalidVisibilityWindow"`.
* Inactive or unknown master IDs: `400` with list of invalid IDs.
* On any failure: rollback entire transaction.


---


## GET Posting API `/buyers_postings_list/{buyerId}`
## Backend: List

### Purpose

Return a paginated list of postings owned by a buyer, with optional filters (status, tag), sorting, and an option to include per-status counts for UI tabs.

---

### Path

`/buyers_postings_list/{buyerId}`

* `buyerId` (path): integer. Must match the authenticated buyer.

---

### Query Parameters

* `statusIds` (CSV or repeated): integers. Filter by `postingStatusId`.

  * Examples: `statusIds=2,3` or `statusIds=2&statusIds=3`
* `tag`: string. Filter postings that have an exact tag in `TRN_PostingTag`.
* `page`: int. Default `1`. 1-based.
* `pageSize`: int. Default `10`, max `100`.
* `sort`: comma list of `field:dir`. Default `createdOn:desc,postingId:desc`.

  * Allowed fields: `createdOn`, `modifiedOn`, `applyOpenAt`, `applyCloseAt`, `title`, `postingStatusId`.
  * Always append `postingId` as a tiebreaker server-side.
* `includeStatusCounts`: boolean. Default `false`. If `true`, return counts for each status within the current scope (buyer + active + tag), ignoring `statusIds`.

---

### Core Logic (Execution Order)

1. Scope: `buyerId = :buyerId AND isActive = true`.
2. If `statusIds` provided → filter `postingStatusId IN (:statusIds)`.
3. If `tag` provided → filter `EXISTS TRN_PostingTag WHERE tag = :tag AND postingId = MST_Posting.postingId`.
4. Compute `total` with current filters.
5. Sort by validated `sort` (append `postingId` as last tiebreaker).
6. Paginate with `OFFSET (page-1)*pageSize LIMIT pageSize`.
7. If `includeStatusCounts = true`, compute grouped counts by `postingStatusId` on the same scope but **ignoring** `statusIds` (still apply `buyerId`, `isActive`, and `tag` filter if any).
8. Return: `items`, `page`, `pageSize`, `total`, and optional `statusCounts`.

---

### Path Examples

* No params (defaults)
  `/buyers_postings_list/42`

* Filter by two statuses (CSV), include a tag, set page/pageSize/sort
  `/buyers_postings_list/42?statusIds=2,3&tag=hr&page=1&pageSize=5&sort=createdOn:desc,title:asc`

* Same status filter using repeated params
  `/buyers_postings_list/42?statusIds=2&statusIds=3`

* Ask for status counts (useful for UI tabs)
  `/buyers_postings_list/42?includeStatusCounts=true`

* Pagination to page 3 with a different sort
  `/buyers_postings_list/42?page=3&pageSize=20&sort=title:asc,postingId:asc`

---

### Example Response (6 items)

```json
{
  "items": [
    {
      "postingId": 9106,
      "buyerId": 42,
      "postingStatusId": 2,
      "postingStatusDisplayName": "Open",
      "title": "Resting HR Baseline",
      "summary": "Daily resting HR for 14 days.",
      "description": "Collect daily resting HR readings to build a baseline.",
      "applyOpenAt": "2025-10-01T00:00:00Z",
      "applyCloseAt": "2025-10-31T23:59:59Z",
      "dataCoverageDaysRequired": 14,
      "minAge": 18,
      "rewardTypeId": 1,
      "rewardValue": 400,
      "imageUrl": "https://cdn.example.com/postings/42/9106/cover.png",
      "metrics": [110],
      "healthConditionIds": [],
      "viewPolicyIds": [2],
      "tags": ["hr", "baseline"],
      "isActive": true,
      "isModified": true,
      "createdOn": "2025-10-05T15:12:00Z",
      "modifiedOn": "2025-10-06T08:20:00Z"
    },
    {
      "postingId": 9105,
      "buyerId": 42,
      "postingStatusId": 5,
      "postingStatusDisplayName": "Archived",
      "title": "Energy Burn Patterns",
      "summary": "KCal trends over 7 days.",
      "description": "Archived study for historical reference.",
      "applyOpenAt": "2025-06-10T00:00:00Z",
      "applyCloseAt": "2025-06-30T23:59:59Z",
      "dataCoverageDaysRequired": 7,
      "minAge": 21,
      "rewardTypeId": 1,
      "rewardValue": 200,
      "imageUrl": "https://cdn.example.com/postings/42/9105.jpg",
      "metrics": [140],
      "healthConditionIds": [],
      "viewPolicyIds": [5],
      "tags": ["kcal", "short"],
      "isActive": true,
      "isModified": true,
      "createdOn": "2025-06-01T11:30:00Z",
      "modifiedOn": "2025-07-01T08:10:00Z"
    },
    {
      "postingId": 9104,
      "buyerId": 42,
      "postingStatusId": 4,
      "postingStatusDisplayName": "Closed",
      "title": "Distance & Floors Study",
      "summary": "Daily distance and floors for 10 days.",
      "description": "Closed after reaching target participants.",
      "applyOpenAt": "2025-08-01T00:00:00Z",
      "applyCloseAt": "2025-09-01T00:00:00Z",
      "dataCoverageDaysRequired": 10,
      "minAge": null,
      "rewardTypeId": 1,
      "rewardValue": 400,
      "imageUrl": "https://cdn.example.com/postings/42/9104.jpg",
      "metrics": [130, 131],
      "healthConditionIds": [],
      "viewPolicyIds": [4],
      "tags": ["distance", "floors", "ten"],
      "isActive": true,
      "isModified": true,
      "createdOn": "2025-07-28T14:00:00Z",
      "modifiedOn": "2025-09-02T09:00:00Z"
    },
    {
      "postingId": 9103,
      "buyerId": 42,
      "postingStatusId": 3,
      "postingStatusDisplayName": "Paused",
      "title": "Activity & Energy Correlation",
      "summary": "Steps and active energy for 21 days.",
      "description": "Investigating relationship between steps and kcal.",
      "applyOpenAt": "2025-09-20T00:00:00Z",
      "applyCloseAt": "2025-10-20T23:59:59Z",
      "dataCoverageDaysRequired": 21,
      "minAge": 18,
      "rewardTypeId": 1,
      "rewardValue": 800,
      "imageUrl": "https://cdn.example.com/postings/42/9103.jpg",
      "metrics": [101, 140],
      "healthConditionIds": [],
      "viewPolicyIds": [2],
      "tags": ["steps", "kcal", "threeweeks"],
      "isActive": true,
      "isModified": true,
      "createdOn": "2025-09-15T10:00:00Z",
      "modifiedOn": "2025-10-01T07:45:00Z"
    },
    {
      "postingId": 9102,
      "buyerId": 42,
      "postingStatusId": 2,
      "postingStatusDisplayName": "Open",
      "title": "Heart Rate Variability Study",
      "summary": "Daily HR and HRV for 30 days.",
      "description": "Seeking participants to share HR/HRV for a month.",
      "applyOpenAt": "2025-10-01T00:00:00Z",
      "applyCloseAt": "2025-10-31T23:59:59Z",
      "dataCoverageDaysRequired": 30,
      "minAge": 18,
      "rewardTypeId": 1,
      "rewardValue": 1200,
      "imageUrl": "https://cdn.example.com/postings/42/9102.jpg",
      "metrics": [110, 111],
      "healthConditionIds": [205],
      "viewPolicyIds": [5],
      "tags": ["hr", "hrv", "month"],
      "isActive": true,
      "isModified": true,
      "createdOn": "2025-09-28T12:00:00Z",
      "modifiedOn": "2025-10-02T08:30:00Z"
    },
    {
      "postingId": 9101,
      "buyerId": 42,
      "postingStatusId": 1,
      "postingStatusDisplayName": "Draft",
      "title": "Baseline Sleep Capture",
      "summary": "Sleep minutes for 14 days.",
      "description": "Collect nightly sleep minutes to establish a baseline.",
      "applyOpenAt": "2025-10-10T00:00:00Z",
      "applyCloseAt": "2025-10-25T23:59:59Z",
      "dataCoverageDaysRequired": 14,
      "minAge": null,
      "rewardTypeId": 1,
      "rewardValue": 300,
      "imageUrl": "https://cdn.example.com/postings/42/9101.jpg",
      "metrics": [120],
      "healthConditionIds": [],
      "viewPolicyIds": [1, 2, 3],
      "tags": ["sleep", "baseline"],
      "isActive": true,
      "isModified": false,
      "createdOn": "2025-10-06T09:00:00Z",
      "modifiedOn": "2025-10-06T09:00:00Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 143,
  "statusCounts": {
    "1": 12,
    "2": 7,
    "3": 3,
    "4": 98,
    "5": 23
  }
}
```

---

### Notes for Backend Implementation

* Validate sort fields and directions; silently drop unknown fields; always append `postingId:desc` (or `asc`) as a last tiebreaker.
* Tag filter should use an `EXISTS` subquery or a join on `TRN_PostingTag` with an index on `(tag, postingId)`.
* Return both `postingStatusId` and `postingStatusDisplayName` by joining `MST_PostingStatus`.
* For `statusCounts`, apply the same scope (`buyerId`, `isActive`, optional `tag`) but ignore `statusIds`.
* `metrics`, `healthConditionIds`, `tags`, and `viewPolicyIds` should be returned as arrays of IDs/strings for consistency with create/update APIs.

---

### Performance & Indexing Guidance

* Suggested indexes:

  * `MST_Posting (buyerId, isActive, createdOn DESC, postingId DESC)`
  * `MST_Posting (buyerId, isActive, postingStatusId, createdOn DESC)`
  * `TRN_PostingTag (tag, postingId)`
* For deep paging, consider keyset pagination later (e.g., `createdOn/ postingId` as cursor). The API contract can remain stable by adding `after`/`before` cursors in future versions.

---

### Endpoint Summary

**Method/Path:** `GET /buyers_postings_list/{buyerId}`
**Purpose:** Return a paginated list of postings owned by a buyer with optional filters (`statusIds`, `tag`), strict whitelisted sorting, and optional per-status counts for UI tabs.
**Image guarantee:** If a posting has no image, the API must return a **default** image URL (e.g., `https://cdn.example.com/defaults/posting-cover.png`).

---

### Authorization & Scope

* Require `auth.buyerId == buyerId` → else **403**.
* Scope predicate (applies to all queries):
  `buyerUserId = :buyerId AND isActive = TRUE`
* Soft-deleted items (`isActive = FALSE`) never appear.

---

###  Query Parameters (Normalized by Backend)

| Param                 | Type / Default         | Backend Normalization                                               |
| --------------------- | ---------------------- | ------------------------------------------------------------------- |
| `statusIds`           | CSV or repeated; opt.  | Dedupe → `INT[]` or `NULL` to ignore                                |
| `tag`                 | string; opt.           | Trim; empty → `NULL` (exact match)                                  |
| `page`                | int; default `1`       | Clamp: min `1`                                                      |
| `pageSize`            | int; default `10`      | Clamp: `[1..100]`                                                   |
| `sort`                | `field:dir` list; opt. | Whitelist fields; dir ∈ `{asc,desc}`; append `postingId` tiebreaker |
| `includeStatusCounts` | bool; default `false`  | If true, run counts on scoped set ignoring `statusIds`              |

---

### Sorting Rules

**Allowed fields:** `createdOn`, `modifiedOn`, `applyOpenAt`, `applyCloseAt`, `title`, `postingStatusId`, `postingId`
**Rules:**

* Unknown fields are ignored. Missing `:dir` ⇒ `ASC`.
* If no valid terms provided ⇒ default `createdOn DESC`.
* **Always append** `postingId` as last tiebreaker using the last term’s direction; if no terms, `DESC`.

**Pseudocode (server):**

```js
function buildOrderBy(rawSort) {
  const allowed = new Set(['createdOn','modifiedOn','applyOpenAt','applyCloseAt','title','postingStatusId','postingId']);
  let terms = [];
  if (!rawSort) rawSort = 'createdOn:desc';
  for (const part of rawSort.split(',')) {
    const [f0, d0] = part.split(':').map(s => (s||'').trim());
    if (!f0 || !allowed.has(f0)) continue;
    const dir = (d0 && d0.toLowerCase()==='desc') ? 'DESC' : 'ASC';
    terms.push({f:f0, dir});
  }
  if (terms.length===0) terms.push({f:'createdOn',dir:'DESC'});
  const lastDir = terms[terms.length-1].dir;
  if (!terms.some(t=>t.f==='postingId')) terms.push({f:'postingId',dir:lastDir});
  return terms.map(t => `${t.f} ${t.dir}`).join(', ');
}
```

---

###  Pagination

* 1-based: `OFFSET (page - 1) * pageSize  FETCH NEXT pageSize ROWS ONLY` (SQL Server).
* Enforce `1 ≤ pageSize ≤ 100`.

---

###  Image Handling (Default Replacement)

* Source of truth: `TRN_PostingImage`.
* If no row or `imageUrl` is `NULL`/empty ⇒ return default:
  `https://cdn.example.com/defaults/posting-cover.png`
* Implement in **one** place (SQL or serializer) and be consistent.

---

###  Main Result Contract (Wire Schema)

**Top-level JSON:**

```json
{
  "items": [ /* PostingListItem[] */ ],
  "page": 1,
  "pageSize": 10,
  "total": 143,
  "statusCounts": { "1": 12, "2": 7, "3": 3 }
}
```

**PostingListItem fields** (one row per posting):

* `postingId`, `buyerId`, `postingStatusId`, `postingStatusCode`, `postingStatusDisplayName`
* `title`, `summary`, `description`
* `applyOpenAt`, `applyCloseAt`, `dataCoverageDaysRequired`, `minAge`
* `rewardTypeId`, `rewardValue`
* `imageUrl` (defaulted if missing)
* Arrays (IDs/strings): `metrics`, `healthConditionIds`, `viewPolicyIds`, `tags`
* Audit: `isActive`, `isModified`, `createdOn`, `modifiedOn`

**Notes:**

* `statusCounts` present only if `includeStatusCounts=true`.
* In `statusCounts`, keys are stringified `postingStatusId` (e.g., `"1": 12`).

---

###  SQL — Manual Test (Copy/Paste; T-SQL, runs as-is)

> **Goal:** Let any dev validate results immediately by setting variables. This script:
>
> * Declares variables (`@BuyerId`, `@StatusIdsCsv`, `@Tag`, `@Page`, `@PageSize`, `@Sort`, `@IncludeStatusCounts`)
> * Builds a **safe** ORDER BY from a whitelist
> * Splits CSV `statusIds`
> * Applies scope, filters, paging
> * Returns **items** (one row per posting, arrays as JSON text), **meta** (total/page/pageSize), and optional **statusCounts**

```sql
/* =========================
   Manual Test Harness (T-SQL)
   ========================= */
SET NOCOUNT ON;

-- 1) Inputs (set these to test)
DECLARE @BuyerId            INT           = 42;
DECLARE @StatusIdsCsv       VARCHAR(200)  = '2,3';     -- NULL or '' to ignore
DECLARE @Tag                NVARCHAR(100) = N'hr';     -- NULL or '' to ignore
DECLARE @Page               INT           = 1;         -- 1-based
DECLARE @PageSize           INT           = 5;         -- clamp [1..100]
DECLARE @Sort               VARCHAR(200)  = 'createdOn:desc,title:asc';
DECLARE @IncludeStatusCounts BIT          = 1;

-- 2) Defaults / clamps
SET @Page     = CASE WHEN @Page < 1 THEN 1 ELSE @Page END;
SET @PageSize = CASE WHEN @PageSize < 1 THEN 10 WHEN @PageSize > 100 THEN 100 ELSE @PageSize END;

DECLARE @DefaultImageUrl NVARCHAR(400) = N'https://cdn.example.com/defaults/posting-cover.png';

-- 3) Normalize tag
IF (@Tag IS NOT NULL AND LTRIM(RTRIM(@Tag)) = '') SET @Tag = NULL;

-- 4) Parse statusIds CSV → table
IF OBJECT_ID('tempdb..#StatusIds') IS NOT NULL DROP TABLE #StatusIds;
CREATE TABLE #StatusIds (statusId INT PRIMARY KEY);
IF (@StatusIdsCsv IS NOT NULL AND LTRIM(RTRIM(@StatusIdsCsv)) <> '')
BEGIN
    INSERT INTO #StatusIds(statusId)
    SELECT DISTINCT TRY_CAST(value AS INT)
    FROM STRING_SPLIT(@StatusIdsCsv, ',')
    WHERE TRY_CAST(value AS INT) IS NOT NULL;
    IF NOT EXISTS (SELECT 1 FROM #StatusIds) DELETE FROM #StatusIds; -- treat as none if all invalid
END

-- 5) Build safe ORDER BY (whitelist fields & dir)
DECLARE @OrderBy NVARCHAR(400) = N'';
IF (@Sort IS NULL OR LTRIM(RTRIM(@Sort)) = '') SET @Sort = 'createdOn:desc';

IF OBJECT_ID('tempdb..#SortTerms') IS NOT NULL DROP TABLE #SortTerms;
CREATE TABLE #SortTerms (field SYSNAME, dir NVARCHAR(4));
;WITH raw AS (
    SELECT TRIM(value) AS term
    FROM STRING_SPLIT(@Sort, ',')
),
parts AS (
    SELECT
      CASE WHEN CHARINDEX(':', term) > 0 THEN LEFT(term, CHARINDEX(':', term) - 1) ELSE term END AS f,
      CASE WHEN CHARINDEX(':', term) > 0 THEN RIGHT(term, LEN(term) - CHARINDEX(':', term)) ELSE 'asc' END AS d
    FROM raw
)
INSERT INTO #SortTerms(field, dir)
SELECT
  CASE LOWER(f)
    WHEN 'createdon'      THEN 'createdOn'
    WHEN 'modifiedon'     THEN 'modifiedOn'
    WHEN 'applyopenat'    THEN 'applyOpenAt'
    WHEN 'applycloseat'   THEN 'applyCloseAt'
    WHEN 'title'          THEN 'title'
    WHEN 'postingstatusid'THEN 'postingStatusId'
    WHEN 'postingid'      THEN 'postingId'
    ELSE NULL
  END AS field,
  CASE LOWER(d) WHEN 'desc' THEN 'DESC' ELSE 'ASC' END AS dir
FROM parts
WHERE
  LOWER(f) IN ('createdon','modifiedon','applyopenat','applycloseat','title','postingstatusid','postingid');

-- Default if none valid
IF NOT EXISTS (SELECT 1 FROM #SortTerms)
BEGIN
    INSERT INTO #SortTerms(field, dir) VALUES ('createdOn', 'DESC');
END

-- Ensure postingId appended as tiebreaker with last dir
DECLARE @LastDir NVARCHAR(4) = (SELECT TOP 1 dir FROM #SortTerms ORDER BY (SELECT 1) OFFSET (SELECT COUNT(*)-1 FROM #SortTerms) ROWS);
IF NOT EXISTS (SELECT 1 FROM #SortTerms WHERE field = 'postingId')
BEGIN
    INSERT INTO #SortTerms(field, dir) VALUES ('postingId', ISNULL(@LastDir, 'DESC'));
END

-- Map safe aliases to SQL expressions
-- We order by projected columns from MST_Posting (alias p)
DECLARE @OrderByBuilt NVARCHAR(MAX) = (
  SELECT STRING_AGG(
           CASE field
             WHEN 'createdOn'       THEN 'p.createdOn '       + dir
             WHEN 'modifiedOn'      THEN 'p.modifiedOn '      + dir
             WHEN 'applyOpenAt'     THEN 'p.applyOpenAt '     + dir
             WHEN 'applyCloseAt'    THEN 'p.applyCloseAt '    + dir
             WHEN 'title'           THEN 'p.title '           + dir
             WHEN 'postingStatusId' THEN 'p.postingStatusId ' + dir
             WHEN 'postingId'       THEN 'p.postingId '       + dir
           END, ', '
         )
  FROM #SortTerms
);
SET @OrderBy = @OrderByBuilt;

-- 6) Build dynamic SQL for scoped, paged items
DECLARE @SQL NVARCHAR(MAX) = N'
;WITH scoped AS (
  SELECT
    p.postingId,
    p.buyerUserId AS buyerId,
    p.postingStatusId,
    s.code AS postingStatusCode,
    s.displayName AS postingStatusDisplayName,
    p.title,
    p.summary,
    p.description,
    p.applyOpenAt,
    p.applyCloseAt,
    p.dataCoverageDaysRequired,
    p.minAge,
    p.rewardTypeId,
    p.rewardValue,
    p.isActive,
    p.isModified,
    p.createdOn,
    p.modifiedOn,
    -- Default image
    CASE WHEN i.imageUrl IS NULL OR LTRIM(RTRIM(i.imageUrl)) = ''''
         THEN @DefaultImageUrl
         ELSE i.imageUrl
    END AS imageUrl,
    -- Arrays (values-only JSON)
    ISNULL((
      SELECT ''['' + STRING_AGG(CAST(pm.metricId AS varchar(20)), '','') + '']''
      FROM TRN_PostingMetric pm
      WHERE pm.postingId = p.postingId
    ), ''[]'') AS metricsJson,
    ISNULL((
      SELECT ''['' + STRING_AGG(CAST(ph.healthConditionId AS varchar(20)), '','') + '']''
      FROM TRN_PostingHealthCondition ph
      WHERE ph.postingId = p.postingId
    ), ''[]'') AS healthConditionIdsJson,
    ISNULL((
      SELECT ''['' + STRING_AGG(CAST(pv.viewPolicyId AS varchar(20)), '','') + '']''
      FROM TRN_PostingViewPolicy pv
      WHERE pv.postingId = p.postingId
    ), ''[]'') AS viewPolicyIdsJson,
    ISNULL((
      SELECT ''['' + STRING_AGG(QUOTENAME(pt.tag, ''"''), '','') + '']''
      FROM TRN_PostingTag pt
      WHERE pt.postingId = p.postingId
    ), ''[]'') AS tagsJson
  FROM MST_Posting p
  JOIN MST_PostingStatus s ON s.postingStatusId = p.postingStatusId
  LEFT JOIN TRN_PostingImage i ON i.postingId = p.postingId
  WHERE p.buyerUserId = @BuyerId
    AND p.isActive = 1
    AND (@Tag IS NULL OR EXISTS (
      SELECT 1 FROM TRN_PostingTag t
      WHERE t.postingId = p.postingId AND t.tag = @Tag
    ))
    AND (NOT EXISTS (SELECT 1 FROM #StatusIds) OR p.postingStatusId IN (SELECT statusId FROM #StatusIds))
),
counted AS (
  SELECT COUNT(*) AS total FROM scoped
)
SELECT *
FROM scoped
ORDER BY ' + @OrderBy + '
OFFSET (@Page - 1) * @PageSize ROWS
FETCH NEXT @PageSize ROWS ONLY;

SELECT total = total, page = @Page, pageSize = @PageSize FROM counted;
';

-- 7) Execute items + meta
EXEC sp_executesql
  @SQL,
  N'@BuyerId int, @Tag nvarchar(100), @Page int, @PageSize int, @DefaultImageUrl nvarchar(400)',
  @BuyerId=@BuyerId, @Tag=@Tag, @Page=@Page, @PageSize=@PageSize, @DefaultImageUrl=@DefaultImageUrl;

-- 8) Optional statusCounts (ignores statusIds; honors tag & scope)
IF (@IncludeStatusCounts = 1)
BEGIN
  SELECT postingStatusId = p.postingStatusId,
         cnt = COUNT_BIG(*)
  FROM MST_Posting p
  WHERE p.buyerUserId = @BuyerId
    AND p.isActive = 1
    AND (@Tag IS NULL OR EXISTS (
      SELECT 1 FROM TRN_PostingTag t
      WHERE t.postingId = p.postingId AND t.tag = @Tag
    ))
  GROUP BY p.postingStatusId
  ORDER BY postingStatusId;
END
```

**What you get back (result sets):**

1. **Items**: one row per posting, with columns including `metricsJson`, `healthConditionIdsJson`, `viewPolicyIdsJson`, `tagsJson` (values-only JSON arrays) and `imageUrl` defaulted.
2. **Meta**: single row with `total`, `page`, `pageSize`.
3. **StatusCounts** (only if `@IncludeStatusCounts=1`): rows of `postingStatusId, cnt`.

---

###  SQL — Production Pattern (Param/Binds)

**Bind map (from API layer):**

* `@BuyerId` (int)
* `@StatusIdsCsv` **or** pass a table-valued parameter `@StatusIds (statusId int)`
* `@Tag` (nvarchar)
* `@Page` (int), `@PageSize` (int)
* `@Sort` (varchar)
* `@IncludeStatusCounts` (bit)

**Notes:**

* Keep the whitelist ORDER BY builder in code (or reuse the T-SQL above).
* If you use a TVP for statuses, replace the `#StatusIds` temp table with the TVP.
* Serialize arrays for the wire (the example emits JSON text columns; your app can parse them into arrays).

---

###  Status Counts Query (Tabs)

* Scope: `buyerId`, `isActive=1`, and optional `tag`.
* **Intentionally ignores** `statusIds`.
* Example (T-SQL):

```sql
DECLARE @BuyerId INT = 42;
DECLARE @Tag NVARCHAR(100) = NULL;

SELECT postingStatusId,
       cnt = COUNT_BIG(*)
FROM MST_Posting p
WHERE p.buyerUserId = @BuyerId
  AND p.isActive = 1
  AND (@Tag IS NULL OR EXISTS (
      SELECT 1 FROM TRN_PostingTag t
      WHERE t.postingId = p.postingId AND t.tag = @Tag
  ))
GROUP BY postingStatusId
ORDER BY postingStatusId;
```

---

###  Indexing & Performance

* `MST_Posting (buyerUserId, isActive, createdOn DESC, postingId DESC)`
* `MST_Posting (buyerUserId, isActive, postingStatusId, createdOn DESC, postingId DESC)`
* `TRN_PostingTag (tag, postingId)`
* For deep paging, consider keyset (cursor) on `(primary_sort_field, postingId)`; API can later accept `after/before` cursors without breaking existing clients.

---

###  Error Handling Rules

* `403 Forbidden` when `auth.buyerId != buyerId`.
* `400 Bad Request` (or clamp) for bad `page/pageSize`.
* `sort`: unknown fields silently dropped; if none valid ⇒ default.
* Always return a valid `imageUrl` (default if missing).

---

###  Test Checklist (Acceptance)

* `statusIds` CSV vs repeated → same results (after normalization).
* Tag exact match works; omitted tag returns full scope.
* Sorting respects whitelist; `postingId` appended as tiebreaker.
* Pagination math is correct (1-based).
* Default image returned when no `TRN_PostingImage`.
* `statusCounts` ignores `statusIds`, honors tag/scope.
* `isActive=0` never surfaces.

---

### Notes (Backend)

* Normalize `statusIds` early (dedupe).
* Build the ORDER BY string with the whitelist builder; never trust raw user input.
* Map JSON columns from SQL (`metricsJson`, etc.) to arrays in your response model.
* Include `page`, `pageSize`, `total`, and (if requested) `statusCounts`.

---

### Examples (Requests → Behavior)

1. **Default**
   `GET /buyers_postings_list/42`
   → newest `createdOn`, `page=1`, `pageSize=10`.

2. **Filter & sort**
   `GET /buyers_postings_list/42?statusIds=2,3&tag=hr&page=1&pageSize=5&sort=createdOn:desc,title:asc`
   → filters applied, stable sort with `postingId` appended.

3. **Counts for tabs**
   `GET /buyers_postings_list/42?includeStatusCounts=true`
   → returns `statusCounts` independent of `statusIds`.

---

# Get a particular Posting API
## Backend: Detail

```
GET /buyers/{buyerId}/postings_detail/{postingId}
```

**Purpose** This API is used to fetch a particular posting made by a buyer using the posting id and buyer id.

**Path parameters**

* `buyerId` (int) — must match the authenticated buyer (owner scope).
* `postingId` (int) — the posting to fetch.

**Query parameters**

* *None.*

**Body**

* *None.*

---

# 1) Example URL Calls

```text
# Basic (buyer=42, posting=9102)
GET /buyers/42/postings_detail/9102

# Another record
GET /buyers/42/postings_detail/9105
```

---

# 2) Example Success Response (200)

> Notes:
>
> * Always include `postingStatusId`, `postingStatusCode`, `postingStatusDisplayName`.
> * Arrays are IDs/strings (consistent with create/update APIs).
> * If no image exists, `imageUrl` must be the default placeholder:
>   `https://cdn.example.com/defaults/posting-cover.png`

```json
{
  "postingId": 9102,
  "buyerId": 42,
  "postingStatusId": 2,
  "postingStatusCode": "OPEN",
  "postingStatusDisplayName": "Open",
  "title": "Heart Rate Variability Study",
  "summary": "Daily HR and HRV for 30 days.",
  "description": "Seeking participants to share HR/HRV for a month.",
  "applyOpenAt": "2025-10-01T00:00:00Z",
  "applyCloseAt": "2025-10-31T23:59:59Z",
  "dataCoverageDaysRequired": 30,
  "minAge": 18,
  "rewardTypeId": 1,
  "rewardValue": 1200,
  "imageUrl": "https://cdn.example.com/postings/42/9102.jpg",
  "metrics": [110, 111],
  "healthConditionIds": [205],
  "viewPolicyIds": [5],
  "tags": ["hr", "hrv", "month"],
  "isActive": true,
  "isModified": true,
  "createdOn": "2025-09-28T12:00:00Z",
  "modifiedOn": "2025-10-02T08:30:00Z"
}
```

**Example when image is missing → defaulted**

```json
{
  "postingId": 9201,
  "buyerId": 42,
  "postingStatusId": 1,
  "postingStatusCode": "DRAFT",
  "postingStatusDisplayName": "Draft",
  "title": "Baseline Sleep Capture",
  "summary": "Sleep data for 14 days.",
  "description": "We are collecting nightly sleep duration for baseline analysis.",
  "applyOpenAt": "2025-10-10T00:00:00Z",
  "applyCloseAt": "2025-10-25T23:59:59Z",
  "dataCoverageDaysRequired": 14,
  "minAge": null,
  "rewardTypeId": null,
  "rewardValue": null,
  "imageUrl": "https://cdn.example.com/defaults/posting-cover.png",
  "metrics": [120],
  "healthConditionIds": [],
  "viewPolicyIds": [],
  "tags": ["sleep", "baseline"],
  "isActive": true,
  "isModified": false,
  "createdOn": "2025-10-08T12:00:00Z",
  "modifiedOn": "2025-10-08T12:00:00Z"
}
```

---

# 3) Errors

| HTTP | Code                           | When                                                                                     | Payload (example)                  |
| ---- | ------------------------------ | ---------------------------------------------------------------------------------------- | ---------------------------------- |
| 400  | `InvalidPathParameter`         | `buyerId` or `postingId` is not a valid integer.                                         | `{"error":"InvalidPathParameter"}` |
| 403  | `Forbidden`                    | Authenticated user is not the same as `buyerId` in the path.                             | `{"error":"Forbidden"}`            |
| 404  | `PostingNotFound`              | No posting with that `postingId` **owned by** `buyerId`, or posting is `isActive=false`. | `{"error":"PostingNotFound"}`      |
| 409  | `PostingInactive` *(optional)* | Found but explicitly inactive/soft-deleted and you want to distinguish from 404.         | `{"error":"PostingInactive"}`      |
| 500  | `InternalError`                | Unhandled server/db error.                                                               | `{"error":"InternalError"}`        |

**Behavior notes for errors**

* Ownership is enforced by `(posting.buyerUserId == buyerId)` before returning any data.
* Soft-deleted (`isActive=false`) should **not** leak details; return 404 (or 409 if you keep that variant).

---

### Backend implementation guide
`GET /buyers_postings_detail/{buyerId}/{postingId}` —list endpoint.

# A) Execution Logic (Server-Side)

1. **Authorize**

   * Ensure `auth.buyerId == path.buyerId`. If not → **403 Forbidden**.

2. **Validate path params**

   * `buyerId` and `postingId` must be valid integers; else **400 InvalidPathParameter**.

3. **Fetch by scope**

   * Enforce ownership and soft-delete:
     `p.buyerUserId = :buyerId AND p.postingId = :postingId AND p.isActive = TRUE`.

4. **Join / aggregate**

   * Join `MST_PostingStatus` for `postingStatusCode` & `postingStatusDisplayName`.
   * Aggregate children as arrays: `metrics`, `healthConditionIds`, `viewPolicyIds`, `tags`.
   * Get image from `TRN_PostingImage` or **default**: `https://cdn.example.com/defaults/posting-cover.png`.

5. **Return**

   * 200 with the single posting object (schema below).
   * If not found in scope → **404 PostingNotFound**.
   * (Optional) If found but inactive (`isActive=false`) and you want to distinguish → **409 PostingInactive**.

---

# B) Response Shape

```json
{
  "postingId": 9102,
  "buyerId": 42,
  "postingStatusId": 2,
  "postingStatusCode": "OPEN",
  "postingStatusDisplayName": "Open",
  "title": "Heart Rate Variability Study",
  "summary": "Daily HR and HRV for 30 days.",
  "description": "Seeking participants to share HR/HRV for a month.",
  "applyOpenAt": "2025-10-01T00:00:00Z",
  "applyCloseAt": "2025-10-31T23:59:59Z",
  "dataCoverageDaysRequired": 30,
  "minAge": 18,
  "rewardTypeId": 1,
  "rewardValue": 1200,
  "imageUrl": "https://cdn.example.com/postings/42/9102.jpg",
  "metrics": [110, 111],
  "healthConditionIds": [205],
  "viewPolicyIds": [5],
  "tags": ["hr", "hrv", "month"],
  "isActive": true,
  "isModified": true,
  "createdOn": "2025-09-28T12:00:00Z",
  "modifiedOn": "2025-10-02T08:30:00Z"
}
```

**Default image rule**
If there’s no `TRN_PostingImage` row or `imageUrl` is NULL/empty, return:
`https://cdn.example.com/defaults/posting-cover.png`.

---

# C)  SQL T-SQL style for quick testing

```sql
--  Simulate path params
DECLARE @BuyerId        INT     = 42;
DECLARE @PostingId      INT     = 9102;

--  Default image (platform constant)
DECLARE @DefaultImageUrl NVARCHAR(400) = N'https://cdn.example.com/defaults/posting-cover.png';

-- Single-row fetch with ownership + active scope
WITH P AS (
    SELECT
        p.postingId,
        p.buyerUserId AS buyerId,
        p.postingStatusId,
        s.code         AS postingStatusCode,
        s.displayName  AS postingStatusDisplayName,
        p.title,
        p.summary,
        p.description,
        p.applyOpenAt,
        p.applyCloseAt,
        p.dataCoverageDaysRequired,
        p.minAge,
        p.rewardTypeId,
        p.rewardValue,
        p.isActive,
        p.isModified,
        p.createdOn,
        p.modifiedOn
    FROM MST_Posting p
    JOIN MST_PostingStatus s ON s.postingStatusId = p.postingStatusId
    WHERE p.buyerUserId = @BuyerId
      AND p.postingId   = @PostingId
      AND p.isActive    = 1
),
IMG AS (
    SELECT
        i.postingId,
        i.imageUrl
    FROM TRN_PostingImage i
    WHERE i.postingId = @PostingId
),
MET AS (
    SELECT m.postingId, STRING_AGG(CAST(m.metricId AS NVARCHAR(20)), ',') AS metricsCsv
    FROM TRN_PostingMetric m
    WHERE m.postingId = @PostingId
    GROUP BY m.postingId
),
HCS AS (
    SELECT h.postingId, STRING_AGG(CAST(h.healthConditionId AS NVARCHAR(20)), ',') AS hcsCsv
    FROM TRN_PostingHealthCondition h
    WHERE h.postingId = @PostingId
    GROUP BY h.postingId
),
VPS AS (
    SELECT v.postingId, STRING_AGG(CAST(v.viewPolicyId AS NVARCHAR(20)), ',') AS vpsCsv
    FROM TRN_PostingViewPolicy v
    WHERE v.postingId = @PostingId
    GROUP BY v.postingId
),
TAGS AS (
    SELECT t.postingId, STRING_AGG(t.tag, ',') AS tagsCsv
    FROM TRN_PostingTag t
    WHERE t.postingId = @PostingId
    GROUP BY t.postingId
)
SELECT
    P.postingId,
    P.buyerId,
    P.postingStatusId,
    P.postingStatusCode,
    P.postingStatusDisplayName,
    P.title,
    P.summary,
    P.description,
    P.applyOpenAt,
    P.applyCloseAt,
    P.dataCoverageDaysRequired,
    P.minAge,
    P.rewardTypeId,
    P.rewardValue,
    -- Default image if null/empty
    CASE WHEN NULLIF(IMG.imageUrl, '') IS NOT NULL THEN IMG.imageUrl ELSE @DefaultImageUrl END AS imageUrl,
    -- Arrays as CSV for manual visibility (your backend will map to arrays)
    COALESCE(MET.metricsCsv, '') AS metricsCsv,
    COALESCE(HCS.hcsCsv,    '') AS healthConditionIdsCsv,
    COALESCE(VPS.vpsCsv,    '') AS viewPolicyIdsCsv,
    COALESCE(TAGS.tagsCsv,  '') AS tagsCsv,
    P.isActive,
    P.isModified,
    P.createdOn,
    P.modifiedOn
FROM P
LEFT JOIN IMG  ON IMG.postingId  = P.postingId
LEFT JOIN MET  ON MET.postingId  = P.postingId
LEFT JOIN HCS  ON HCS.postingId  = P.postingId
LEFT JOIN VPS  ON VPS.postingId  = P.postingId
LEFT JOIN TAGS ON TAGS.postingId = P.postingId;
```

**How to read the manual result**

* You’ll get **one row** if found; **0 rows** if not found or inactive/not owned.
* CSV columns (`metricsCsv`, etc.) are for quick inspection; your backend should instead materialize arrays.

---

# D) SQL (Parameterized; Postgres-style binds)


```sql
-- $1 = buyerId  (int)
-- $2 = postingId (int)

SELECT
  p.postingId,
  p.buyerUserId AS buyerId,
  p.postingStatusId,
  s.code AS postingStatusCode,
  s.displayName AS postingStatusDisplayName,
  p.title,
  p.summary,
  p.description,
  p.applyOpenAt,
  p.applyCloseAt,
  p.dataCoverageDaysRequired,
  p.minAge,
  p.rewardTypeId,
  p.rewardValue,
  -- Default image if not present
  COALESCE(
    (SELECT i.imageUrl FROM TRN_PostingImage i WHERE i.postingId = p.postingId),
    'https://cdn.example.com/defaults/posting-cover.png'
  ) AS imageUrl,
  -- Arrays
  COALESCE((
    SELECT ARRAY_AGG(DISTINCT m.metricId ORDER BY m.metricId)
    FROM TRN_PostingMetric m
    WHERE m.postingId = p.postingId
  ), '{}') AS metrics,
  COALESCE((
    SELECT ARRAY_AGG(DISTINCT h.healthConditionId ORDER BY h.healthConditionId)
    FROM TRN_PostingHealthCondition h
    WHERE h.postingId = p.postingId
  ), '{}') AS healthConditionIds,
  COALESCE((
    SELECT ARRAY_AGG(DISTINCT v.viewPolicyId ORDER BY v.viewPolicyId)
    FROM TRN_PostingViewPolicy v
    WHERE v.postingId = p.postingId
  ), '{}') AS viewPolicyIds,
  COALESCE((
    SELECT ARRAY_AGG(t.tag ORDER BY t.tag)
    FROM TRN_PostingTag t
    WHERE t.postingId = p.postingId
  ), '{}') AS tags,
  p.isActive,
  p.isModified,
  p.createdOn,
  p.modifiedOn
FROM MST_Posting p
JOIN MST_PostingStatus s ON s.postingStatusId = p.postingStatusId
WHERE p.buyerUserId = $1
  AND p.postingId   = $2
  AND p.isActive    = TRUE;
```

**Bind Map**

* `$1` = `buyerId`
* `$2` = `postingId`

**Expected rows**

* 1 row if found; 0 rows → convert to **404 PostingNotFound**.

---

# E) Error Handling (Backend)

* **400 InvalidPathParameter**: non-integer `buyerId`/`postingId`.
* **403 Forbidden**: `auth.buyerId != buyerId`.
* **404 PostingNotFound**: no row returned by the scoped query.
* **409 PostingInactive** (optional policy): if you explicitly detect inactive vs not found.
* **500 InternalError**: unhandled exceptions.

---

# F) Performance & Indexing

* **Indexes**

  * `MST_Posting (buyerUserId, postingId, isActive)` — exact-lookup.
  * `TRN_PostingImage (postingId)`
  * `TRN_PostingMetric (postingId, metricId)`
  * `TRN_PostingHealthCondition (postingId, healthConditionId)`
  * `TRN_PostingViewPolicy (postingId, viewPolicyId)`
  * `TRN_PostingTag (postingId, tag)` or `(tag, postingId)` depending on usage patterns
* This is a **point read** (by PK+owner), so it’s fast; child aggregations run on single-posting scope.

---

# G) Implementation Notes

* **Single source for default image**: keep the placeholder URL in config; use `COALESCE` in SQL or a single serializer hook—avoid duplicating logic.
* **Array semantics**: keep IDs/strings (not objects) to match create/update payloads.
* **Consistency**: reuse the same status join & field names as list endpoint.
* **No transactions needed**: read-only.
* **No query interpolation**: path params are binds only.

---

# H) Quick Check

* [ ] 403 if path buyer ≠ auth buyer.
* [ ] 404 if posting not found / not owned / inactive.
* [ ] Default image returned when there’s no row/URL.
* [ ] Arrays populated & deduped, stable order.
* [ ] Status fields included (`Id`, `Code`, `DisplayName`).
* [ ] Timestamps ISO8601 in API shape.

---

# PATCH `/buyers_postings_update/{buyerId}/{postingId}`
## Backend: Update
## 1. Purpose

Update a posting owned by a buyer. Any subset of fields may be provided. Array fields are **full-set replacements** (omit to leave unchanged). Image may be replaced or removed. The endpoint enforces buyer scope and soft-delete rules.

---

## 2. Method & Path

**PATCH** `/buyers_postings_update/{buyerId}/{postingId}`

Path parameters:

* `buyerId` (int) — must match the authenticated buyer.
* `postingId` (int) — the posting to update.

---

## 3. URL Examples

* Update title and status
  `/buyers_postings_update/42/9102`
* Replace arrays and close date
  `/buyers_postings_update/42/9103`
* Remove image
  `/buyers_postings_update/42/9104`

---

## 4. Request Body — Rules

* Send only the fields you want to update.
* Arrays (`metrics`, `healthConditionIds`, `viewPolicyIds`, `tags`) **replace the entire set** for that posting.
* Dates are RFC3339 strings.
* If both `applyOpenAt` and `applyCloseAt` are provided, `applyOpenAt < applyCloseAt` must hold.
* Master-table references must exist and be active.
* Image handling (one image max):

  * To **replace**: supply `assetId` (from upload pipeline) — backend promotes to a permanent URL.
  * To **remove**: set `"imageUrl": null` **or** `"imageAction": "REMOVE"`.
  * If no image after update, responses must still return a default image URL (e.g., `https://cdn.example.com/defaults/posting-cover.png`).

Updatable fields:

* `title` (string)
* `summary` (string)
* `description` (string)
* `applyOpenAt` (string, RFC3339)
* `applyCloseAt` (string, RFC3339)
* `dataCoverageDaysRequired` (int, ≥ 1)
* `minAge` (int or null)
* `postingStatusId` (int) **or** `postingStatusCode` (string; e.g., `OPEN`)
* `rewardTypeId` (int or null)
* `rewardValue` (number or null)
* `metrics` (int[]; MetricId)
* `healthConditionIds` (int[]; HealthConditionId)
* `viewPolicyIds` (int[]; ViewPolicyId)
* `tags` (string[])
* `assetId` (string; replaces image)
* `imageUrl` (string or null; when null → remove)
* `imageAction` (string; only `"REMOVE"` supported)

> If both `assetId` and `imageAction: "REMOVE"` are provided, removal wins.

---

## 5. Request Examples

### 5.1 Minimal core update (title + status)

```json
{
  "title": "Heart Rate Variability Study (v2)",
  "postingStatusCode": "OPEN"
}
```

### 5.2 Full-set array replacement + date change

```json
{
  "applyCloseAt": "2025-11-05T23:59:59Z",
  "metrics": [110, 111],
  "healthConditionIds": [205],
  "viewPolicyIds": [5, 7],
  "tags": ["hr", "hrv", "month", "rest"]
}
```

### 5.3 Reward update and remove image

```json
{
  "rewardTypeId": 1,
  "rewardValue": 1500,
  "imageAction": "REMOVE"
}
```

### 5.4 Replace image using assetId

```json
{
  "assetId": "ast_7c2c2b0d"
}
```

### 5.5 Set nullable fields

```json
{
  "minAge": null,
  "rewardTypeId": null,
  "rewardValue": null
}
```

---

## 6. Sample Success Response (200)

```json
{
  "postingId": 9102,
  "buyerId": 42,
  "postingStatusId": 2,
  "postingStatusCode": "OPEN",
  "postingStatusDisplayName": "Open",
  "title": "Heart Rate Variability Study (v2)",
  "summary": "Daily HR and HRV for 30 days.",
  "description": "Seeking participants to share HR/HRV for a month.",
  "applyOpenAt": "2025-10-01T00:00:00Z",
  "applyCloseAt": "2025-11-05T23:59:59Z",
  "dataCoverageDaysRequired": 30,
  "minAge": 18,
  "viewPolicyIds": [5, 7],
  "rewardTypeId": 1,
  "rewardValue": 1500,
  "tags": ["hr", "hrv", "month", "rest"],
  "imageUrl": "https://cdn.example.com/postings/42/9102_v2.jpg",
  "metrics": [110, 111],
  "healthConditionIds": [205],
  "isActive": true,
  "isModified": true,
  "createdBy": 42,
  "createdOn": "2025-09-28T12:00:00Z",
  "modifiedBy": 42,
  "modifiedOn": "2025-10-07T13:30:00Z"
}
```

> When the image is **removed**, `imageUrl` in the response must be the platform default (e.g., `https://cdn.example.com/defaults/posting-cover.png`), not `null`.

---

## 7. Error Responses

* **400 Bad Request**

  * `InvalidVisibilityWindow` — `applyCloseAt <= applyOpenAt`
  * `InvalidStatusId` / `InvalidStatusCode`
  * `InvalidRewardTypeId`
  * `InvalidMetricIds` / `InvalidViewPolicyIds` / `InvalidHealthConditionIds`
  * `UnknownAssetId` — `assetId` not found/owned/expired
  * `InvalidArray` — arrays not arrays, wrong types, etc.
* **403 Forbidden** — `auth.buyerId != buyerId`
* **404 Not Found** — posting not found for buyer or soft-deleted
* **409 Conflict** (optional) — business rule conflicts (e.g., disallow moving `CLOSED` → `DRAFT`)
* **415 Unsupported Media Type** — if body not JSON
* **422 Unprocessable Entity** — validation passed basic types but failed business validation
* **500 Internal Server Error** — unexpected failures

---

## 8. Notes

* Arrays are full replacements; to clear, pass an empty array.
* Status may be updated by `postingStatusId` or `postingStatusCode`; backend should resolve code to id and validate activeness.
* Image logic is centralized: either promote `assetId` or remove; never store raw file in this API.
* Response always returns a non-null `imageUrl` (actual or default).
* Timestamps in responses are ISO8601 (UTC).

# Backend Implementation Notes — PATCH `/buyers_postings_update/{buyerId}/{postingId}`

## 1) What the backend must do (server-side flow)

1. **Auth & scope**

   * Ensure `auth.buyerId == :buyerId`. Else `403`.
   * Ensure posting exists for this buyer and `isActive = TRUE`. Else `404`.

2. **Parse & normalize**

   * Accept a *partial* JSON body.
   * Normalize empty strings → `NULL` for nullable fields (`minAge`, `rewardTypeId`, `rewardValue` as appropriate).
   * If both `applyOpenAt` and `applyCloseAt` are supplied, validate `applyOpenAt < applyCloseAt`.

3. **Resolve master references**

   * If `postingStatusCode` is present, resolve to `postingStatusId` (active status only).
   * If `postingStatusId` is present, validate it exists and is active.
   * If `metrics`, `viewPolicyIds`, `healthConditionIds`, `rewardTypeId` supplied, validate existence + activeness.

4. **Image update strategy (single image)**

   * If `"imageAction":"REMOVE"` **or** `imageUrl:null` → ensure `TRN_PostingImage` is removed for this posting.
   * Else if `assetId` provided → promote from staging to final path, compute permanent `imageUrl`, **upsert** row in `TRN_PostingImage`.
   * Else no change to image row.
   * Response must always include a non-null `imageUrl` (use default if no row).

5. **Apply updates transactionally**

   * Update core fields on `MST_Posting` (only those provided).
   * For array fields (`metrics`, `viewPolicyIds`, `healthConditionIds`, `tags`) do **full-set replacement**:

     * Delete existing rows for that posting and table.
     * Insert the provided unique set (deduplicated server-side).
   * Set `isModified = TRUE`, `modifiedBy = buyerId`, `modifiedOn = NOW()` on any change.

6. **Return payload**

   * Join `MST_PostingStatus` for `code` and `displayName`.
   * Compute `imageUrl = COALESCE(actual, '<DEFAULT_URL>')`.
   * Pre-aggregate arrays back into the response.

---

## 2) Validation rules (reject with 400 unless otherwise specified)

* Missing posting for buyer → `404`.
* `applyCloseAt <= applyOpenAt` when both provided → `InvalidVisibilityWindow`.
* Unknown/inactive `postingStatusId` / `postingStatusCode` → `InvalidStatus`.
* Any of `metrics`, `viewPolicyIds`, `healthConditionIds` contains unknown/inactive Ids → `Invalid*Ids`.
* `dataCoverageDaysRequired < 1` when supplied → `InvalidDataCoverage`.
* `UnknownAssetId` when `assetId` not found or not owned by buyer.
* Business rule conflicts (optional) → `409 Conflict` (e.g., disallow reopening `ARCHIVED`).

---

## 3) Helper queries (lookups)

```sql
-- Resolve status code to id (active only)
SELECT postingStatusId
FROM MST_PostingStatus
WHERE code = $1 AND isActive = TRUE;

-- Validate reward type (if provided)
SELECT 1
FROM MST_RewardType
WHERE rewardTypeId = $1 AND isActive = TRUE;

-- Validate arrays (exist AND active)
-- Metrics
SELECT ARRAY_AGG(m.metricId ORDER BY m.metricId)
FROM MST_Metric m
WHERE m.metricId = ANY($1) AND m.isActive = TRUE;

-- View policies
SELECT ARRAY_AGG(v.viewPolicyId ORDER BY v.viewPolicyId)
FROM MST_ViewPolicy v
WHERE v.viewPolicyId = ANY($1) AND v.isActive = TRUE;

-- Health conditions
SELECT ARRAY_AGG(h.healthConditionId ORDER BY h.healthConditionId)
FROM MST_HealthCondition h
WHERE h.healthConditionId = ANY($1) AND h.isActive = TRUE;
```

---

## 4) “Drop-in” SQL (PostgreSQL) — transactional update

> Notes
>
> * Replace `%SET_CLAUSE%` with a server-built fragment that only includes provided fields.
> * Arrays are **optional**; only run delete/insert blocks for arrays present in the request.
> * `:default_image_url` is your platform default (e.g., `https://cdn.placeholder.example/defaults/posting-cover.png`).

```sql
BEGIN;

-- 4.1 Scope & lock
SELECT p.postingId
FROM MST_Posting p
WHERE p.postingId = $1         -- postingId
  AND p.buyerUserId = $2       -- buyerId
  AND p.isActive = TRUE
FOR UPDATE;
-- If not found -> 404

-- 4.2 Resolve/validate status if provided
-- Example: when client sent postingStatusCode
-- $3 = postingStatusCode or NULL
WITH maybe_status AS (
  SELECT postingStatusId
  FROM MST_PostingStatus
  WHERE ($3 IS NOT NULL AND code = $3 AND isActive = TRUE)
)
-- resolve to $4 (finalPostingStatusId) in application before next update
-- Similarly resolve/validate rewardTypeId, arrays, etc., in application layer
-- or with additional CTEs as needed.

-- 4.3 Update core columns (only those provided)
UPDATE MST_Posting
SET
  -- %SET_CLAUSE% example (built by server):
  -- title = COALESCE($5, title),
  -- summary = COALESCE($6, summary),
  -- description = COALESCE($7, description),
  -- applyOpenAt = COALESCE($8, applyOpenAt),
  -- applyCloseAt = COALESCE($9, applyCloseAt),
  -- dataCoverageDaysRequired = COALESCE($10, dataCoverageDaysRequired),
  -- minAge = $11,  -- explicit null allowed
  -- postingStatusId = COALESCE($12, postingStatusId),
  -- rewardTypeId = $13,       -- explicit null allowed
  -- rewardValue = $14,        -- explicit null allowed
  isModified = TRUE,
  modifiedBy = $2,
  modifiedOn = NOW()
WHERE postingId = $1;

-- 4.4 Replace array children (run blocks only when respective arrays supplied)

-- 4.4.1 Metrics
-- $15 = metricIds int[] or NULL
DELETE FROM TRN_PostingMetric WHERE postingId = $1 AND $15 IS NOT NULL;
INSERT INTO TRN_PostingMetric (postingId, metricId)
SELECT $1, UNNEST($15)::int
WHERE $15 IS NOT NULL;

-- 4.4.2 View Policies
-- $16 = viewPolicyIds int[] or NULL
DELETE FROM TRN_PostingViewPolicy WHERE postingId = $1 AND $16 IS NOT NULL;
INSERT INTO TRN_PostingViewPolicy (postingId, viewPolicyId)
SELECT $1, UNNEST($16)::int
WHERE $16 IS NOT NULL;

-- 4.4.3 Health Conditions
-- $17 = healthConditionIds int[] or NULL
DELETE FROM TRN_PostingHealthCondition WHERE postingId = $1 AND $17 IS NOT NULL;
INSERT INTO TRN_PostingHealthCondition (postingId, healthConditionId)
SELECT $1, UNNEST($17)::int
WHERE $17 IS NOT NULL;

-- 4.4.4 Tags
-- $18 = tags text[] or NULL
DELETE FROM TRN_PostingTag WHERE postingId = $1 AND $18 IS NOT NULL;
INSERT INTO TRN_PostingTag (postingId, tag)
SELECT $1, TRIM(t)
FROM UNNEST($18::text[]) AS t
WHERE $18 IS NOT NULL AND TRIM(t) <> '';

-- 4.5 Image handling
-- Remove image
-- $19 = imageAction text or NULL; $20 = imageUrlNullable text or NULL; $21 = assetId text or NULL
-- If remove requested (either imageAction='REMOVE' OR imageUrl is explicitly NULL)
DELETE FROM TRN_PostingImage
WHERE postingId = $1
  AND (
        ($19 IS NOT NULL AND UPPER($19) = 'REMOVE')
     OR ($20 IS NOT DISTINCT FROM NULL)  -- explicit null provided
  );

-- If replace via assetId (promote staging → final), app code must:
--   - Move file to "postings/{buyerId}/{postingId}/{assetId}-{filename}"
--   - Compute $22 = finalImageUrl
-- Then upsert row:
INSERT INTO TRN_PostingImage (postingId, imageUrl)
SELECT $1, $22
WHERE $21 IS NOT NULL
ON CONFLICT (postingId) DO UPDATE SET imageUrl = EXCLUDED.imageUrl;

COMMIT;
```

**Response assembly query (PostgreSQL)**
Fetch the updated row for the response after the transaction:

```sql
SELECT
  p.postingId,
  p.buyerUserId AS buyerId,
  p.postingStatusId,
  s.code  AS postingStatusCode,
  s.displayName AS postingStatusDisplayName,
  p.title,
  p.summary,
  p.description,
  p.applyOpenAt,
  p.applyCloseAt,
  p.dataCoverageDaysRequired,
  p.minAge,
  p.rewardTypeId,
  p.rewardValue,
  p.isActive,
  p.isModified,
  p.createdBy,
  p.createdOn,
  p.modifiedBy,
  p.modifiedOn,
  COALESCE(i.imageUrl, $1 /* default image URL */) AS imageUrl,
  COALESCE((
    SELECT ARRAY_AGG(DISTINCT m.metricId ORDER BY m.metricId)
    FROM TRN_PostingMetric m WHERE m.postingId = p.postingId
  ), '{}') AS metrics,
  COALESCE((
    SELECT ARRAY_AGG(DISTINCT v.viewPolicyId ORDER BY v.viewPolicyId)
    FROM TRN_PostingViewPolicy v WHERE v.postingId = p.postingId
  ), '{}') AS viewPolicyIds,
  COALESCE((
    SELECT ARRAY_AGG(DISTINCT h.healthConditionId ORDER BY h.healthConditionId)
    FROM TRN_PostingHealthCondition h WHERE h.postingId = p.postingId
  ), '{}') AS healthConditionIds,
  COALESCE((
    SELECT ARRAY_AGG(t.tag ORDER BY t.tag)
    FROM TRN_PostingTag t WHERE t.postingId = p.postingId
  ), '{}') AS tags
FROM MST_Posting p
JOIN MST_PostingStatus s ON s.postingStatusId = p.postingStatusId
LEFT JOIN TRN_PostingImage i ON i.postingId = p.postingId
WHERE p.postingId = $2 AND p.buyerUserId = $3;  -- postingId, buyerId
```

---

## 5) Manual test harness (SQL Server–style variables, for quick local validation)

```sql
-- Developer harness (T-SQL style variables) - illustrative only
DECLARE @BuyerId INT          = 42;
DECLARE @PostingId INT        = 9102;

-- Optional updates
DECLARE @Title NVARCHAR(255)  = N'Heart Rate Variability Study (v2)';
DECLARE @StatusCode NVARCHAR(20) = N'OPEN';  -- alternative: @StatusId INT = 2;
DECLARE @CloseAt DATETIME2    = '2025-11-05T23:59:59Z';

-- Arrays as temp tables for clarity
DECLARE @Metrics TABLE (metricId INT);
INSERT INTO @Metrics(metricId) VALUES (110), (111);

DECLARE @ViewPolicies TABLE (viewPolicyId INT);
INSERT INTO @ViewPolicies(viewPolicyId) VALUES (5), (7);

DECLARE @Health TABLE (healthConditionId INT);
INSERT INTO @Health(healthConditionId) VALUES (205);

DECLARE @Tags TABLE (tag NVARCHAR(80));
INSERT INTO @Tags(tag) VALUES (N'hr'), (N'hrv'), (N'month'), (N'rest');

-- Image controls
DECLARE @ImageAction NVARCHAR(10) = N'REMOVE';   -- or NULL
DECLARE @AssetId NVARCHAR(64)     = NULL;        -- e.g., 'ast_7c2c2b0d'
DECLARE @FinalImageUrl NVARCHAR(400) = NULL;     -- set by app after promotion
DECLARE @DefaultImageUrl NVARCHAR(400) = N'https://cdn.placeholder.example/defaults/posting-cover.png';

BEGIN TRAN;

-- Resolve statusId by code (if provided) - pseudo
-- SELECT @StatusId = postingStatusId FROM MST_PostingStatus WHERE code=@StatusCode AND isActive=1;

-- Update core (only updating a few fields for demo)
UPDATE p
SET
  title = COALESCE(@Title, p.title),
  applyCloseAt = COALESCE(@CloseAt, p.applyCloseAt),
  -- postingStatusId = COALESCE(@StatusId, p.postingStatusId),
  isModified = 1,
  modifiedBy = @BuyerId,
  modifiedOn = SYSUTCDATETIME()
FROM MST_Posting p
WHERE p.postingId = @PostingId AND p.buyerUserId = @BuyerId AND p.isActive = 1;

-- Replace arrays (delete+insert)
DELETE FROM TRN_PostingMetric WHERE postingId = @PostingId;
INSERT INTO TRN_PostingMetric (postingId, metricId)
SELECT @PostingId, metricId FROM @Metrics;

DELETE FROM TRN_PostingViewPolicy WHERE postingId = @PostingId;
INSERT INTO TRN_PostingViewPolicy (postingId, viewPolicyId)
SELECT @PostingId, viewPolicyId FROM @ViewPolicies;

DELETE FROM TRN_PostingHealthCondition WHERE postingId = @PostingId;
INSERT INTO TRN_PostingHealthCondition (postingId, healthConditionId)
SELECT @PostingId, healthConditionId FROM @Health;

DELETE FROM TRN_PostingTag WHERE postingId = @PostingId;
INSERT INTO TRN_PostingTag (postingId, tag)
SELECT @PostingId, LTRIM(RTRIM(tag)) FROM @Tags WHERE LTRIM(RTRIM(tag)) <> N'';

-- Image
IF (@ImageAction IS NOT NULL AND UPPER(@ImageAction) = N'REMOVE')
BEGIN
  DELETE FROM TRN_PostingImage WHERE postingId = @PostingId;
END
ELSE IF (@AssetId IS NOT NULL)
BEGIN
  -- App should set @FinalImageUrl after moving the asset
  MERGE TRN_PostingImage AS tgt
  USING (SELECT @PostingId AS postingId, @FinalImageUrl AS imageUrl) AS src
  ON (tgt.postingId = src.postingId)
  WHEN MATCHED THEN UPDATE SET imageUrl = src.imageUrl
  WHEN NOT MATCHED THEN INSERT (postingId, imageUrl) VALUES (src.postingId, src.imageUrl);
END

COMMIT;

-- Readback for verification (image defaulting)
SELECT
  p.postingId,
  p.buyerUserId AS buyerId,
  p.title,
  p.applyCloseAt,
  COALESCE(i.imageUrl, @DefaultImageUrl) AS imageUrl
FROM MST_Posting p
LEFT JOIN TRN_PostingImage i ON i.postingId = p.postingId
WHERE p.postingId = @PostingId AND p.buyerUserId = @BuyerId;
```

---

## 6) Optional PL/pgSQL example

```sql
CREATE OR REPLACE FUNCTION api_update_posting(
  p_buyer_id BIGINT,
  p_posting_id BIGINT,
  p_title TEXT DEFAULT NULL,
  p_summary TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_apply_open_at TIMESTAMPTZ DEFAULT NULL,
  p_apply_close_at TIMESTAMPTZ DEFAULT NULL,
  p_data_days INT DEFAULT NULL,
  p_min_age INT DEFAULT NULL,
  p_status_id INT DEFAULT NULL,
  p_status_code TEXT DEFAULT NULL,
  p_reward_type_id INT DEFAULT NULL,
  p_reward_value NUMERIC DEFAULT NULL,
  p_metric_ids INT[] DEFAULT NULL,
  p_view_policy_ids INT[] DEFAULT NULL,
  p_health_ids INT[] DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_image_action TEXT DEFAULT NULL,
  p_asset_id TEXT DEFAULT NULL,
  p_final_image_url TEXT DEFAULT NULL,
  p_default_image_url TEXT DEFAULT 'https://cdn.placeholder.example/defaults/posting-cover.png'
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_status_id INT;
BEGIN
  -- Scope / existence
  PERFORM 1 FROM MST_Posting
   WHERE postingId = p_posting_id AND buyerUserId = p_buyer_id AND isActive = TRUE
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NotFound' USING ERRCODE = 'no_data_found';
  END IF;

  -- Status resolution precedence: explicit id > code
  v_status_id := p_status_id;
  IF v_status_id IS NULL AND p_status_code IS NOT NULL THEN
    SELECT postingStatusId INTO v_status_id
    FROM MST_PostingStatus
    WHERE code = p_status_code AND isActive = TRUE;
    IF v_status_id IS NULL THEN
      RAISE EXCEPTION 'InvalidStatus';
    END IF;
  END IF;

  -- Date window validation (if both provided)
  IF p_apply_open_at IS NOT NULL AND p_apply_close_at IS NOT NULL THEN
    IF p_apply_close_at <= p_apply_open_at THEN
      RAISE EXCEPTION 'InvalidVisibilityWindow';
    END IF;
  END IF;

  -- Core update (only set fields that are not NULL)
  UPDATE MST_Posting
  SET
    title = COALESCE(p_title, title),
    summary = COALESCE(p_summary, summary),
    description = COALESCE(p_description, description),
    applyOpenAt = COALESCE(p_apply_open_at, applyOpenAt),
    applyCloseAt = COALESCE(p_apply_close_at, applyCloseAt),
    dataCoverageDaysRequired = COALESCE(p_data_days, dataCoverageDaysRequired),
    minAge = p_min_age, -- explicit null allowed
    postingStatusId = COALESCE(v_status_id, postingStatusId),
    rewardTypeId = p_reward_type_id,
    rewardValue = p_reward_value,
    isModified = TRUE,
    modifiedBy = p_buyer_id,
    modifiedOn = NOW()
  WHERE postingId = p_posting_id;

  -- Arrays (replace if provided)
  IF p_metric_ids IS NOT NULL THEN
    DELETE FROM TRN_PostingMetric WHERE postingId = p_posting_id;
    INSERT INTO TRN_PostingMetric (postingId, metricId)
    SELECT p_posting_id, UNNEST(ARRAY(SELECT DISTINCT x FROM UNNEST(p_metric_ids) x));
  END IF;

  IF p_view_policy_ids IS NOT NULL THEN
    DELETE FROM TRN_PostingViewPolicy WHERE postingId = p_posting_id;
    INSERT INTO TRN_PostingViewPolicy (postingId, viewPolicyId)
    SELECT p_posting_id, UNNEST(ARRAY(SELECT DISTINCT x FROM UNNEST(p_view_policy_ids) x));
  END IF;

  IF p_health_ids IS NOT NULL THEN
    DELETE FROM TRN_PostingHealthCondition WHERE postingId = p_posting_id;
    INSERT INTO TRN_PostingHealthCondition (postingId, healthConditionId)
    SELECT p_posting_id, UNNEST(ARRAY(SELECT DISTINCT x FROM UNNEST(p_health_ids) x));
  END IF;

  IF p_tags IS NOT NULL THEN
    DELETE FROM TRN_PostingTag WHERE postingId = p_posting_id;
    INSERT INTO TRN_PostingTag (postingId, tag)
    SELECT p_posting_id, t
    FROM (
      SELECT DISTINCT TRIM(x) AS t
      FROM UNNEST(p_tags) x
    ) d WHERE t <> '';
  END IF;

  -- Image: remove wins
  IF p_image_action IS NOT NULL AND UPPER(p_image_action) = 'REMOVE' THEN
    DELETE FROM TRN_PostingImage WHERE postingId = p_posting_id;
  ELSIF p_asset_id IS NOT NULL THEN
    -- assume app moved file & provided p_final_image_url
    INSERT INTO TRN_PostingImage (postingId, imageUrl)
    VALUES (p_posting_id, p_final_image_url)
    ON CONFLICT (postingId) DO UPDATE SET imageUrl = EXCLUDED.imageUrl;
  END IF;

  -- Return JSON payload (with defaulted imageUrl)
  RETURN (
    SELECT to_jsonb(x) FROM (
      SELECT
        p.postingId,
        p.buyerUserId AS buyerId,
        p.postingStatusId,
        s.code AS postingStatusCode,
        s.displayName AS postingStatusDisplayName,
        p.title,
        p.summary,
        p.description,
        p.applyOpenAt,
        p.applyCloseAt,
        p.dataCoverageDaysRequired,
        p.minAge,
        p.rewardTypeId,
        p.rewardValue,
        COALESCE(i.imageUrl, p_default_image_url) AS imageUrl,
        COALESCE((
          SELECT ARRAY_AGG(DISTINCT m.metricId ORDER BY m.metricId)
          FROM TRN_PostingMetric m WHERE m.postingId = p.postingId
        ), '{}') AS metrics,
        COALESCE((
          SELECT ARRAY_AGG(DISTINCT v.viewPolicyId ORDER BY v.viewPolicyId)
          FROM TRN_PostingViewPolicy v WHERE v.postingId = p.postingId
        ), '{}') AS viewPolicyIds,
        COALESCE((
          SELECT ARRAY_AGG(DISTINCT h.healthConditionId ORDER BY h.healthConditionId)
          FROM TRN_PostingHealthCondition h WHERE h.postingId = p.postingId
        ), '{}') AS healthConditionIds,
        COALESCE((
          SELECT ARRAY_AGG(t.tag ORDER BY t.tag)
          FROM TRN_PostingTag t WHERE t.postingId = p.postingId
        ), '{}') AS tags,
        p.isActive,
        p.isModified,
        p.createdBy,
        p.createdOn,
        p.modifiedBy,
        p.modifiedOn
      FROM MST_Posting p
      JOIN MST_PostingStatus s ON s.postingStatusId = p.postingStatusId
      LEFT JOIN TRN_PostingImage i ON i.postingId = p.postingId
      WHERE p.postingId = p_posting_id
    ) x
  );
END;
$$;
```

---

## 7) Edge cases & behaviors

* **Idempotency**: Re-sending the same PATCH with same arrays and image should be safe; delete+insert is deterministic; image upsert is idempotent.
* **Large arrays**: Deduplicate before insert to avoid constraint violations and reduce overhead.
* **Empty arrays**: Interpret as “clear the set” (delete all rows for that posting in that child table).
* **Concurrent updates**: If you need stronger guarantees, add optimistic locking (`If-Unmodified-Since` header mapped to `modifiedOn`) to avoid lost updates.
* **Soft-deleted postings**: Reject with `404` to avoid information leaks about deleted resources.
* **Default image**: Enforce in one place (SQL or serializer) to keep responses consistent across endpoints.

---

## 8) What to hand to the team (quick copy/paste aids)

**A. Minimal manual SQL test (PostgreSQL)**

```sql
-- Example: buyer=42; posting=9102; set title, close date; replace metrics; remove image
BEGIN;

SELECT 1 FROM MST_Posting WHERE postingId=9102 AND buyerUserId=42 AND isActive=TRUE FOR UPDATE;

UPDATE MST_Posting
SET title='Heart Rate Variability Study (v2)',
    applyCloseAt='2025-11-05T23:59:59Z',
    isModified=TRUE, modifiedBy=42, modifiedOn=NOW()
WHERE postingId=9102;

DELETE FROM TRN_PostingMetric WHERE postingId=9102;
INSERT INTO TRN_PostingMetric(postingId, metricId) VALUES (9102,110),(9102,111);

DELETE FROM TRN_PostingImage WHERE postingId=9102; -- REMOVE

COMMIT;

-- Readback
SELECT p.title, p.applyCloseAt,
       COALESCE(i.imageUrl, 'https://cdn.placeholder.example/defaults/posting-cover.png') AS imageUrl
FROM MST_Posting p
LEFT JOIN TRN_PostingImage i ON i.postingId=p.postingId
WHERE p.postingId=9102 AND p.buyerUserId=42;
```

**B. Bind map sketch (application layer)**

* `$buyerId`, `$postingId`
* Core (nullable) fields only when present
* Arrays as typed arrays or `NULL`
* Image: `imageAction` vs `assetId` precedence (remove wins)
* `%SET_CLAUSE%` is built from provided fields only

---

# DELETE Posting API `/buyers_postings_delete/{buyerId}/{postingId}`
## Backend: Delete
## Purpose

Soft-delete a posting owned by a buyer by setting `isActive = FALSE`. The record remains in the database for audit/history; all list/detail endpoints must exclude soft-deleted postings.

---

# DELETE poting API`/buyers_postings_delete/{buyerId}/{postingId}`

## 1) Purpose

Soft-delete a posting owned by a buyer. Soft delete means the record remains in the database but is excluded from all list/detail endpoints by `isActive = FALSE`. This endpoint **returns a minimal confirmation JSON** instead of `204 No Content`.

---

## 2) Method & Path

**DELETE** `/buyers_postings_delete/{buyerId}/{postingId}`

**Path params**

* `buyerId` *(integer, required)* — must match the authenticated buyer.
* `postingId` *(integer, required)* — posting to delete.

**Request body**: *none*.

---

## 3) Authorization & Scope

* Require `auth.buyerId == buyerId`. Otherwise `403 Forbidden`.
* Only soft-delete postings where `buyerUserId = buyerId`. If not found (or already moved out of buyer scope), return `404 Not Found`.
* Operation is **idempotent**: deleting the same posting again returns the same minimal confirmation payload.

---

## 4) Example Requests (URLs)

* Default:
  `DELETE /buyers_postings_delete/42/9102`

* Wrong buyer → `403`:
  `DELETE /buyers_postings_delete/92/9102` (while authenticated as 42)

* Nonexistent posting → `404`:
  `DELETE /buyers_postings_delete/42/999999`

---

## 5) Sample Success Response (200 OK)

```json
{
  "postingId": 9102,
  "buyerId": 42,
  "isActive": false,
  "deletedAt": "2025-10-08T14:55:04Z"
}
```

**Notes**

* `deletedAt` is the server’s deletion timestamp (UTC).
  If your schema has `deletedOn`/`deletedAt`, return that value.
  If not, you may return `NOW()`/`CURRENT_TIMESTAMP` used for the update.

---

## 6) Error Responses

* `403 Forbidden` — authenticated buyer does not match `buyerId` in path.
* `404 Not Found` — posting does not exist for this buyer (or is already outside scope, e.g., hard-deleted in rare maintenance cases).
* `409 Conflict` *(optional)* — business rule prevents delete (e.g., posting in a terminal state you choose to protect).

**Error body (example)**

```json
{
  "error": "NotFound",
  "message": "Posting 9102 not found for buyer 42."
}
```

---

## 7) Behavior Guarantees (Post-Deletion)

* Subsequent `GET /buyers/{buyerId}/postings_detail/{postingId}` → `404`.
* The posting will not appear in `GET /buyers/{buyerId}/postings_list`.
* A second `DELETE` returns **200 OK** with the same confirmation payload (idempotent).
* Child rows (metrics/tags/conditions/viewPolicies) remain unless you choose to purge them later; they should not surface because list/detail queries always scope by `MST_Posting.isActive = TRUE`.

---

## 8) Backend Implementation Notes

### 8.1 Core logic (server-side flow)

1. **Auth check**: `auth.buyerId == buyerId` → else `403`.
2. **Scope & existence**: select the posting for `(postingId, buyerId, isActive = TRUE)`; lock row (`FOR UPDATE`) to avoid races → else `404`.
3. **Soft delete**: set `isActive = FALSE`, set `modifiedBy = buyerId`, `modifiedOn = NOW()`.
   If needed you can get `deletedOn`/`deletedAt`, set it to `NOW()` for the return body. 
4. **Return body**: `{ postingId, buyerId, isActive:false, deletedAt }`.

### 8.2 Recommended indexes

* `MST_Posting (buyerUserId, isActive, postingId)`
* `MST_Posting (postingId)` (PK or unique)

---

### Return payload (200 OK)

   * Minimal JSON:

     ```json
     {
       "postingId": <int>,
       "buyerId": <int>,
       "isActive": false,
       "deletedAt": "<UTC timestamp>"
     }
     ```
   * `deletedAt` = `deletedOn` if present; else `modifiedOn` or server `NOW()` used during the update.

---

## Validation rules → status codes

* `403 Forbidden` — authenticated buyer does not match `buyerId`.
* `404 Not Found` — `(postingId, buyerId, isActive=TRUE)` not found.
* `409 Conflict` *(optional, business rules)* — if you forbid delete for certain terminal states.

**Error body example**

```json
{ "error": "NotFound", "message": "Posting 9102 not found for buyer 42." }
```

---

## 9) “Drop-in” SQL (PostgreSQL)

> Assumptions:
>
> * Table: `MST_Posting(postingId PK, buyerUserId, isActive, modifiedBy, modifiedOn[, deletedOn])`.
> * We **don’t** have `deletedOn`, just omit it in the `UPDATE` and compute `deletedAt` in the `SELECT`.

```sql
-- Inputs (binds): $1 = postingId (BIGINT), $2 = buyerId (BIGINT)

BEGIN;

-- Lock & verify scope
WITH locked AS (
  SELECT postingId
  FROM MST_Posting
  WHERE postingId = $1
    AND buyerUserId = $2
    AND isActive = TRUE
  FOR UPDATE
)
UPDATE MST_Posting p
SET
  isActive   = FALSE,
  modifiedBy = $2,
  modifiedOn = NOW(),
  deletedOn  = NOW()            -- <-- drop this line if you don't have the column
WHERE p.postingId IN (SELECT postingId FROM locked);

-- Check command tag (optional) to fail if nothing updated.

-- Assemble response (prefer stored deletedOn, otherwise NOW())
SELECT
  p.postingId,
  p.buyerUserId AS buyerId,
  p.isActive,
  COALESCE(p.modifiedOn) AS deletedAt   -- you can even send now() here
FROM MST_Posting p
WHERE p.postingId = $1 AND p.buyerUserId = $2;

COMMIT;
```

---

## 10) Minimal PL/pgSQL Helper (Optional)

> Packs the soft delete into one routine. Return the confirmation JSON.
> If you don’t have `deletedOn`, remove that column and return `NOW()` or `modifiedOn`.

```sql
CREATE OR REPLACE FUNCTION api_delete_posting(
  p_buyer_id  BIGINT,
  p_posting_id BIGINT
) RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted_at TIMESTAMPTZ;
BEGIN
  -- Scope & lock
  PERFORM 1 FROM MST_Posting
   WHERE postingId = p_posting_id
     AND buyerUserId = p_buyer_id
     AND isActive = TRUE
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NotFound' USING ERRCODE = 'no_data_found';
  END IF;

  -- Soft delete
  UPDATE MST_Posting
  SET isActive   = FALSE,
      modifiedBy = p_buyer_id,
      modifiedOn = NOW(),
      deletedOn  = NOW()               -- remove if not present
  WHERE postingId = p_posting_id;

  -- Determine deletion timestamp
  SELECT COALESCE(deletedOn, modifiedOn) INTO v_deleted_at
  FROM MST_Posting
  WHERE postingId = p_posting_id;

  RETURN jsonb_build_object(
    'postingId', p_posting_id,
    'buyerId',   p_buyer_id,
    'isActive',  FALSE,
    'deletedAt', v_deleted_at
  );
END;
$$;
```

---

## 11) Quick Manual Harness (SQL Server–style variables)

> Developer aid only. Your production code should use proper binds.

```sql
-- Dev variables
DECLARE @BuyerId   INT = 42;
DECLARE @PostingId INT = 9102;

BEGIN TRAN;

-- Lock & verify
SELECT 1
FROM MST_Posting WITH (UPDLOCK, ROWLOCK)
WHERE postingId = @PostingId
  AND buyerUserId = @BuyerId
  AND isActive = 1;

-- Soft delete (assume you have deletedOn; if not, remove it)
UPDATE MST_Posting
SET isActive   = 0,
    modifiedBy = @BuyerId,
    modifiedOn = SYSUTCDATETIME(),
    deletedOn  = SYSUTCDATETIME()
WHERE postingId = @PostingId
  AND buyerUserId = @BuyerId
  AND isActive = 1;

COMMIT;

-- Confirmation payload (mimic API)
SELECT
  postingId,
  buyerUserId AS buyerId,
  CAST(0 AS bit) AS isActive,
  COALESCE(deletedOn, modifiedOn) AS deletedAt
FROM MST_Posting
WHERE postingId = @PostingId AND buyerUserId = @BuyerId;
```

---

## 12) QA Timeline (using your “return JSON” convention)

| Step | Call                                     | Expected                                                       |
| ---- | ---------------------------------------- | -------------------------------------------------------------- |
| 1    | `GET /buyers_postings_detail/42/9102`    | `200 OK` (exists, active)                                      |
| 2    | `DELETE /buyers_postings_delete/42/9102` | `200 OK` + `{ postingId, buyerId, isActive:false, deletedAt }` |
| 3    | `GET /buyers_postings_detail/42/9102`    | `404 Not Found`                                                |
| 4    | `GET /buyers_postings_list/42`           | Posting **absent** from `items`                                |
| 5    | `DELETE /buyers_postings_delete/42/9102` | `200 OK` + same minimal JSON (idempotent)                      |

---

## 13) Edge Cases

* **Already soft-deleted**: return the same 200 JSON (idempotent).
* **Wrong buyer**: `403`, do not reveal existence.
* **Hard delete (rare ops)**: if row no longer exists, return `404`.
* **Concurrent deletes**: row-level lock prevents double updates; second request still returns confirmation JSON.

---

## Master table APIs 


# 1) `/metrics` — GET
## Backend: Metrics

## 1.1 Purpose

Return the catalog of **active** metrics used in postings dropdowns.

## 1.2 Path

`GET https://api.example.com/metrics`

## 1.3 Example

`GET /metrics`

## 1.4 Response (example)

```json
[
  { "metricId": 110, "code": "HR",  "displayName": "Heart Rate", "canonicalUnitCode": "BPM" },
  { "metricId": 120, "code": "SLEEP_MIN", "displayName": "Sleep Minutes", "canonicalUnitCode": "MIN" }
]
```

## 1.5 Errors

* `401` Unauthorized
* `403` Forbidden (if your platform requires specific roles)
* `500` Server error

## 1.6 Notes for Developers

* No query params. Always filter `IsActive = TRUE`.
* Sort by `DisplayName` ASC, then `Code` ASC for stable UI lists.
* Return a **JSON array** (no envelope, no paging).

## 1.7 Drop-in SQL (PostgreSQL)

```sql
SELECT
  "MetricId"          AS "metricId",
  "Code"              AS "code",
  "DisplayName"       AS "displayName",
  "CanonicalUnitCode" AS "canonicalUnitCode"
FROM "MST_Metric"
WHERE "IsActive" = TRUE
ORDER BY "DisplayName" ASC, "Code" ASC;
```

## 1.8 Edge Cases

* If no active metrics → return `[]`.
* Ensure no duplicates by schema; if any appear, dedupe in service layer.

---

# 2) `/health_conditions` — GET (Exact same as we made in users, written her for referance, do not reimplement if already exist)
## Backend: Health Conditions
## 2.1 Purpose

Return **active** health conditions for eligibility dropdowns.

## 2.2 Path

`GET https://api.example.com/health_conditions`

## 2.3 Example

`GET /health_conditions`

## 2.4 Response (example)

```json
[
  { "healthConditionId": 205, "code": "T2D",         "displayName": "Type 2 Diabetes" },
  { "healthConditionId": 310, "code": "HYPERTENSION","displayName": "Hypertension"     }
]
```

## 2.5 Errors

* `401` Unauthorized
* `403` Forbidden (if restricted)
* `500` Server error

## 2.6 Notes for Developers

* No query params. Only `IsActive = TRUE`.
* Sort by `DisplayName`, then `Code`.

## 2.7 Drop-in SQL (PostgreSQL)

```sql
SELECT
  "HealthConditionId" AS "healthConditionId",
  "Code"              AS "code",
  "DisplayName"       AS "displayName"
FROM "MST_HealthCondition"
WHERE "IsActive" = TRUE
ORDER BY "DisplayName" ASC, "Code" ASC;
```

## 2.8 Edge Cases

* Return `[]` when no active rows.

---

# 3) `/posting_statuses` — GET
## Backend: Posting Statuses

## 3.1 Purpose

Return **active** posting lifecycle statuses for UI (e.g., Draft, Open).

## 3.2 Path

`GET https://api.example.com/posting_statuses`

## 3.3 Example

`GET /posting_statuses`

## 3.4 Response (example)

```json
[
  { "postingStatusId": 1, "code": "DRAFT",  "displayName": "Draft"  },
  { "postingStatusId": 2, "code": "OPEN",   "displayName": "Open"   },
  { "postingStatusId": 3, "code": "PAUSED", "displayName": "Paused" }
]
```

## 3.5 Errors

* `401` Unauthorized
* `403` Forbidden (if restricted)
* `500` Server error

## 3.6 Notes for Developers

* No query params. Only `IsActive = TRUE`.
* Sort by `DisplayName`, then `Code`.

## 3.7 Drop-in SQL (PostgreSQL)

```sql
SELECT
  "PostingStatusId" AS "postingStatusId",
  "Code"            AS "code",
  "DisplayName"     AS "displayName"
FROM "MST_PostingStatus"
WHERE "IsActive" = TRUE
ORDER BY "DisplayName" ASC, "Code" ASC;
```

## 3.8 Edge Cases

* Return `[]` when no active rows.

---

# 4) `/reward_types` — GET
## Backend: Reward Types

## 4.1 Purpose

Return **active** reward/compensation types for postings.

## 4.2 Path

`GET https://api.example.com/reward_types`

## 4.3 Example

`GET /reward_types`

## 4.4 Response (example)

```json
[
  { "rewardTypeId": 1, "code": "POINTS", "displayName": "Points"  },
  { "rewardTypeId": 4, "code": "VOUCHER","displayName": "Voucher" }
]
```

## 4.5 Errors

* `401` Unauthorized
* `403` Forbidden (if restricted)
* `500` Server error

## 4.6 Notes for Developers

* No query params. Only `IsActive = TRUE`.
* Sort by `DisplayName`, then `Code`.

## 4.7 Drop-in SQL (PostgreSQL)

```sql
SELECT
  "RewardTypeId" AS "rewardTypeId",
  "Code"         AS "code",
  "DisplayName"  AS "displayName"
FROM "MST_RewardType"
WHERE "IsActive" = TRUE
ORDER BY "DisplayName" ASC, "Code" ASC;
```

## 4.8 Edge Cases

* Return `[]` when no active rows.

---

# 5) `/view_policies` — GET
## Backend: View Policies

## 5.1 Purpose

Return **active** reusable view/usage policies for postings.

## 5.2 Path

`GET https://api.example.com/view_policies`

## 5.3 Example

`GET /view_policies`

## 5.4 Response (example)

```json
[
  { "viewPolicyId": 2, "code": "RESEARCH_NO_EXPORT", "displayName": "Research Use, No Export" },
  { "viewPolicyId": 3, "code": "STANDARD",           "displayName": "Standard Policy"         }
]
```

## 5.5 Errors

* `401` Unauthorized
* `403` Forbidden (if restricted)
* `500` Server error

## 5.6 Notes for Developers

* No query params. Only `IsActive = TRUE`.
* Sort by `DisplayName`, then `Code`.

## 5.7 Drop-in SQL (PostgreSQL)

```sql
SELECT
  "ViewPolicyId" AS "viewPolicyId",
  "Code"         AS "code",
  "DisplayName"  AS "displayName"
FROM "MST_ViewPolicy"
WHERE "IsActive" = TRUE
ORDER BY "DisplayName" ASC, "Code" ASC;
```

## 5.8 Edge Cases

* Return `[]` when no active rows.

---

## Shared Implementation Notes (all five)

* **Auth**: If your platform requires authentication even for catalogs, enforce it uniformly; otherwise keep these public.
* **Output shape**: Minimal fields only; **no audit columns**; **no pagination**.
* **Sorting**: Always `DisplayName ASC, Code ASC` to keep dropdowns stable.
* **Behavior on empty**: Always return `[]`, not `null` or missing field.

