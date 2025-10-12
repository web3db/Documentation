# Software Requirements Specification (SRS)  
Web3 Health – Phase 1 MVP  

---

## 1. Introduction

This document describes the software requirements for the Web3 Health application.  
Phase 1 focuses on delivering the MVP: a healthcare data marketplace where users can consent to share their data, buyers can post requirements, and basic gamification and earnings dashboards are available.  

---

## 2. User Roles

- **User (Seller):**  
  Can sign up, manage profile, give consent, share data, view marketplace, track earnings, and see gamification progress.  

- **Buyer:**  
  Can sign up, create postings for data, approve user offers, and view shared data once approved.  

- **Admin:**  
  Can oversee buyer postings, manage user/buyer accounts, and maintain platform records.  

---

---

## 3. Functional Requirements

### Phase 1 — MVP: Health Data Marketplace

| Feature | Role | Description | Phase | Priority |  Status |
|---|---|---|---|---|---|
| Authentication (Clerk) | User, Buyer, Admin | Sign up / sign in with email or social; session handling by Clerk. | P1 |  |
| RBAC | User, Buyer, Admin | Role-based access: Users (sell/share), Buyers (post/approve), Admins (moderate). | P1 |  |
| Profile | User | Capture sex, birth year (derive age), height, weight; compute BMI. | P1 |  |
| Settings | User | Update profile, theme (light/dark), notifications, logout. | P1 |  |
| Consent Flow | User | Clear consent before any data leaves device; scoped to a posting. | P1 |  |
| Device Data Connect | User | Connect Apple HealthKit (iOS) / Health Connect (Android). | P1 |  |
| Data Assets View | User | See what data types are available to share (high-level cards). | P1 |  |
| Marketplace Browse | User | Browse active buyer postings and requirements. | P1 |  | |
| Offer to Share | User | Opt-in to a buyer posting; one-tap “Agree” based on consent. | P1 |  | |
| Buyer Posting | Buyer | Create postings: data types, date range, basic inclusion rules. | P1 |  |
---

### Phase 2 — Extended Sharing and Manual Data

| Feature | Role | Description | Phase | Priority |
|---|---|---|---|---|
| Manual Data Entry | User | Add fields like symptoms, lifestyle, habits with input validation. | P2 |  |
| Data Field Catalog | Admin | Manage allowed manual fields, units, ranges, and validation rules. | P2 |  |
| Time-Scoped Tokens | System → Buyer | Add tokenized access to shared bundles (start/end time, per-download keys). | P2 |  |
| Enhanced Gamification | User | Streaks, multipliers, milestone badges; convert credits to perks. | P2 |  |
| Advanced Marketplace Filters | User, Buyer | Filter postings by data type, date range, quality signals. | P2 |  |
| Payout Methods | User | Stripe Connect/PayPal payouts; withdraw schedule and thresholds. | P2 |  |
| Pricing Tiers | Buyer, Admin | Simple fixed tiers per posting type and size (platform-defined). | P2 |  |
| User Data Preview | User | See exactly which fields will be included before sharing. | P2 |  |
| Approve/Reject Users | Buyer | Review user opt-ins and approve. | P2 |  | |
| Share Package (Web3) | System | After approval, build encrypted bundle, upload to Web3 (IPFS or similar). | P2 |  | |
| Gamification (basic) | User | Credits and badges for participation. | P2 |  | |
| Activity Log (basic) | User, Admin | Log share events (no PII); show simple history to user; admin sees counts. | P2 |  | |

---

### Phase 3 — Buyer Dashboard and Verification

| Feature | Role | Description | Phase | Priority |
|---|---|---|---|---|
| Web Dashboard | Buyer, Admin | Web app for buyers/admins: search, manage postings, review access. | P3 |  |
| Buyer Verification | Admin, Buyer | Submit docs/certificates/KYC; admin review; verified badge. | P3 |  |
| Dataset Preview | Buyer | Synthetic sample/summary stats before purchase. | P3 |  |
| API Access | Buyer | API keys, rate limits, logs; programmatic download. | P3 |  |
| Revocation | User, Admin | Revoke future access for a share; new downloads blocked. | P3 |  |
| Traceability | Admin | View access logs per asset (non-PII), exportable audit trails. | P3 |  |
| Adjustable Pricing | Buyer, Admin | Optional buyer bidding or negotiated price per posting. | P3 |  |
| Delivery Link (time-bound) | System → Buyer | Issue signed, time-bound link to the encrypted bundle. | P3 |  | |
| Earnings Dashboard | User | Show total earned, recent shares, pending payouts. | P3 |  | |

---



## 4. Functional Requirements

### 4.1 Authentication and Access
- The system will use **Clerk** for login and authentication.  
- Support for email and social logins (Google/Apple).  
- **Role-Based Access Control (RBAC)** separates User, Buyer, and Admin permissions.  

### 4.2 User Profile
- Users must provide basic details: sex, age (via birth year), height, weight (BMI calculated).  
- Profile can be updated through the settings screen.  

### 4.3 Consent
- Users must complete a consent flow before data is shared.  
- Consent is tied to specific buyer postings in Phase 1.  
- Revocation and time-based tokens are out of scope for Phase 1.  

### 4.4 Marketplace
- Buyers can post requirements for data (type, scope, timeframe).  
- Users can view postings and agree to participate.  
- Buyers can review and approve users.  

### 4.5 Sharing
- Once approved, the user’s relevant data asset is packaged and shared.  
- Shared data is stored using a Web3 storage layer (as previous).   

### 4.6 Data Assets
- Health data from Apple HealthKit (iOS) and Google Health Connect (Android) integrated.  
- Phase 1 will focus on basic metrics (fitness, vitals, activity, lifestyle).  
- Data is grouped into “data assets” visible to both users and buyers.  

### 4.7 Gamification and Earnings
- Users will see credits, early earnings, and badges for participation.  
- A dashboard will display:  
  - Data shared  
  - Total earnings  
  - Credits/badges progress  

### 4.8 UI/UX Features
- Core screens:  
  - Home screen  
  - Consent screen  
  - Sharing screen  
  - Marketplace screen  
  - Settings screen  
  - Earnings/gamification dashboard  
- Support for both **light and dark themes**.  

---

## 5. Non-Functional Requirements

### 5.1 Performance
- App should handle basic marketplace operations with minimal delay.  
- Sharing and marketplace actions should complete within a few seconds.  

### 5.2 Scalability
- Architecture must support scaling to more users and buyers as adoption grows.  
- Containerized (Docker) setup for backend services.  
- Queues (RabbitMQ or Redis Streams) for background jobs (buyer approvals, data packaging).  

### 5.3 Security
- Authentication through Clerk with RBAC.  
- Data encrypted in transit (TLS 1.3) and at rest (AES-256 for bundles).  
- Consent required before any data leaves the device.  
- Phase 1 uses Web3 storage for encrypted bundles; local storage feasibility will be tested as fallback.  

### 5.4 Reliability
- Minimal downtime with basic monitoring and logging.  
- Errors should be logged and retried gracefully (e.g., buyer approval jobs).  

### 5.5 Usability
- Clean and simple UI with plain language.  
- Users must clearly understand what data is being shared.  
- Settings allow users to manage their own data and preferences.  

### 5.6 Maintainability
- Codebase structured for adding features in later phases (verification, revocation, advanced buyer tools).  
- Use of standard frameworks and services for ease of development.  

---

## 6. Out of Scope for Phase 1
- Buyer verification (KYC, certificates).  
- Data revocation and time-based tokens.  
- Advanced anonymization or differential privacy.  
- Subscriptions, commissions, or monetization logic.  
- Complex legal and ethical safeguards.  
- Buyers receive time-limited access links.
- Buyers Approve/Reject users data.

---

## 7. Assumptions
- Users and buyers will act in good faith for Phase 1.  
- Compliance with HIPAA/GDPR/CCPA will be explored later.  
- Web3 storage will remain stable and accessible during Phase 1 testing.
- Users can start contributing to the posting from applying
- In this version, users are automatically approved to share their data
---

## 8. Future Considerations
- Buyer/Admin dashboard on web.  
- Manual data entry for users.  
- Verification and certification flows for buyers.  
- Stronger audit logs and revocation features.  
- Subscription and bidding models for monetization.  
