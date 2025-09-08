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

## Client Platforms (Phase Plan)

- **Mobile App (React Native, bare):**  
  - For **users** (data sellers).  
  - Integrates with Apple HealthKit (iOS) and Google Health Connect (Android).  
  - Features: login, consent, data assets, marketplace browsing, sharing, earnings/gamification.  

- **Web App (React):**  
  - For **buyers and admins**.  
  - Features: buyer sign-in, posting requirements, approving users, viewing shared datasets, admin moderation.  
  - Basic landing page for branding and redirect to mobile app.  

---


## Identity and Auth Flow

- **Provider:** Clerk.  
- **Method:** OIDC/OAuth 2.0.  
- **Sessions:**  
  - Mobile: secure storage (Keychain/Keystore) for short-lived access + refresh tokens.  
  - Web: secure cookies with httpOnly flag.  
- **RBAC:** roles mapped as claims (User, Buyer, Admin).  

---

## Data Flow (Phase 1)

1. User installs mobile app.  
2. App connects to HealthKit/Health Connect with consent.  
3. User views available data assets.  
4. User opts in to a buyer posting (through consent flow).  
5. App prepares the data package locally.  
6. Data storage/sharing handled by Web3 team (out of scope here).  

---

## Frontend Plan

### Mobile (Phase 1)
- Framework: React Native (bare).  
- Language: TypeScript.  
- Navigation: React Navigation.  
- State: Zustand for non-sensitive UI state; secure storage for tokens.  
- Screens:  
  - Login / Register  
  - Consent flow  
  - Data assets (view connected health data)  
  - Marketplace (browse buyer postings)  
  - Sharing (confirm participation)  
  - Earnings & badges  
  - Settings  

### Web (Phase 1+)
- Framework: React.  
- Language: TypeScript.  
- State: Redux for non-sensitive UI state  
- Screens:  
  - Landing page with app information + app store links  
  - Buyer login and dashboard (postings, approvals)  
  - Admin dashboard (user/buyer moderation, basic reporting)  

---

## UX/Design Notes

- **Branding:** trust-focused, professional, university affiliation emphasized.  
- **Consent screens:** plain language, clear toggles for data types, preview before share.  
- **User app:** focus on simplicity and showing earnings clearly.  
- **Buyer app (web):** simple dashboard with filters, postings, and approvals.  

---

## Open Questions
- Exact buyer and user verification process (to be defined later).    
- How to structure reporting back from researchers to users (future).  

