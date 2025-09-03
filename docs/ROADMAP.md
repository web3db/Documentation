
# Roadmap

This file shows the step-by-step roadmap for the project.  
The goal is breaking project into phases so we know what is in scope now and what comes later.  

---

## 📌 Notes
-  Planned / Answered  
-   TBD (needs more discussion)  
-   Concern / Risk  
- 🔐 = Requirement locked


---

## Notes
- Planned / Answered  
- TBD = needs more discussion  
- Concern = watch closely or risk  

---

## Phase 1 – MVP: Health Data Marketplace   🔐
Goal: Deliver the minimum viable product with a working healthcare data marketplace.  

- User login and profile setup  
  - Collect sex, age (birth year), height, weight → BMI  
- Consent flow → users must give permission before sharing data  
- Marketplace view → users see available buyer requests  
- Sharing page → users can agree to buyer requirements  
- Settings page → basic user account controls  
- Buyers can post requirements for data  
- Buyers can approve user offers  
- Uber-style flow: once users consent, they don’t re-enter details repeatedly  
- Add light gamification (credits, badges)  
- Excludes advanced features like revocation, tokenization, or buyer verification
- Storage:
  - Web3 storage is the **primary model** (Already previous).    
  - Local storage feasibility will be tested as a fallback, using secure device storage.  
- Excludes advanced features like revocation, tokenization, or buyer verification    

---

## Phase 2 – Extended Sharing and Manual Data (**TBD**)
Goal: Add more flexibility and data entry options.  

-  Let users add their own health info, not just from devices.  
-  Support **manual input** (e.g., symptoms, lifestyle, habits)  
- Define exact fields allowed for manual entry  
- Add validation for manual data  
- Introduce time-based tokens for shared data  
- Improve gamification (streaks, multipliers, rewards)  
- Privacy risk increases with manual entry, must review consent model  
- Buyers get access through **time-limited signed links**. 

---

## Phase 3 – Buyer Dashboard and Verification
Goal: Provide a professional interface and improve trust.  

- Launch web dashboard for buyers and admins  
- Buyer verification system (certificates, documents, KYC)  
- Buyer-side tools: search, filters, dataset previews, API access  
- Web presence for credibility (landing page, trust messaging)  
- Without verification, higher risk of misuse of sensitive data  

---

## Phase 4+ – Expansion and Advanced Features
Goal: Scale and expand beyond health data.  

- Explore advanced monetization (subscriptions, premium tiers, auctions)  
- Add revocation and traceability features  
- Legal and ethical complexity grows as scope expands  

---

## Parallel Workstreams (Across All Phases)
- Privacy and Compliance → Confirm Privacy related configurations  
- Security → End-to-end encryption, storage feasibility (local, cloud, Web3)  
- Branding and Design → Trust-first look, healthcare/fintech style  
- Growth → Early buyer recruitment, user onboarding strategies  

