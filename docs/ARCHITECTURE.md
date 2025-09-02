# Architecture (High Level)

This file shows how the system is designed and what is used: clients, services, auth, data flows, and roles.

---

## 📌 Notes
- ✅ = planned/decided
- ❓ = TBD
- ⚠️ = concern/risk

---

## Roles and Responsibilities
- **User (seller):** connects health data, manages consent, lists/sells data.
- **Buyer:** searches, requests/purchases datasets, abides by usage terms.
- **Admin/Platform:** verification, moderation, disputes, audit, payouts config.

---

##  Client Platforms (Phase Plan)
- **Mobile:** iOS (HealthKit) and Android (Health Connect) – Phase 1
- **Web (Buyer/Admin dashboard):** planned for Phase 2+ to increase trust/credibility

---

## Identity and Auth Flow (High Level) 
- **Standard:** OIDC/OAuth 2.0
- **Provider:** Clerk / Auth0  / DIY 
- **Sessions:**
  - Web: secure, HTTP-only cookies
  - Mobile: secure storage; short-lived access + refresh tokens
- **RBAC:** roles mapped in ID token / app DB


##  Data Flow (Phase 1) (**TBD**)
1. Device (HealthKit / Health Connect) → App pulls data locally with user consent.
2. User chooses what to share
3. **Local-first** storage 
---

##  Open Questions
- Which auth provider do we choose (Clerk/Auth0/DIY)?
- How deep should Buyer verification go (certificates, accreditation)?

---

## Frontend

### Phase 1 – Mobile first (health data)
- **iOS**: native HealthKit bridge (read what we need).
- **Android**: Health Connect bridge (same idea).
- **Web**: Show the redirect to APP with the intiial  **basic landing page design** with necessary info.
- **App layer**: React Native (Expo or bare RN), TypeScript, state via Zustand/Redux. (**TBD**)
- **Data permissions**: clear “on/off” toggles per data type.
- **Offline**: local cache (SQLite/Watermelon/Realm), sync only when user approves a sale. (**TBD**)

### Phase 2 – Manual entry (**TBD**)
- Add simple forms (symptoms, habits, lifestyle) with schema validation (zod/yup).

### Phase 3 – Web dashboard
- **Web**: Platoform dependent (**TBD**).
- Features: dataset search, filters, previews, invoices, audit views, role-based screens.

---

## Backend (services we need)

- **API Gateway**: rate limiting, schema validation, request logging.(**TBD**)
- **Core API**: (**TBD**)
- **Payments and Payouts**: (**TBD**)
- **Notifications**: email, push. (**TBD**)
- **Policy/Audit**: (**TBD**)

> We can start with what we already have pyton + fastAPI + rabbitMQ.

---


## Deploy, Scale, Observe

- **Containerization** : Docker/Docker Compose for local dev.
- **CI/CD**: GitHub Actions → build, test, lint, type-check, container scan, deploy.
- **Secrets**: SSM/Secrets Manager/Vault; no secrets in env files or repos. (**TBD**)
- **Observability**: (**TBD**)
  - Logs: structured JSON to OpenSearch/ELK.
  - Metrics: ELK
  - Traces: OpenTelemetry.
  - Alerts: PagerDuty/Slack.

**Scaling notes**
(**TBD**)
-  Docker
-  RabbitMQ/Kafka

---

##  API Design

- REST (JSON) to start; versioned (`/v1`). (**TBD**)


##  UX/Design quick notes

- Marketplace design
- Consent screens: plain language, granular toggles, preview of what leaves device.
- Seller dashboard: earnings, history, who bought what.
- Buyer dashboard: filters, dataset preview (safe, synthetic sample), clear license terms.

---

