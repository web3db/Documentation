# Design Q&A

This doc is our running list of questions, answers, and open items for the Web3 Health project.  
The goal is to capture everything in one place as we move from **planning → design → implementation**.  

---

## 📌 Notes
- Planned/Answered = decision made or agreed for Phase 1  
- TBD = still needs discussion or will be addressed in later phases  
- Concern = watch closely or potential risk   
- 👤 Roles: **User** (sells data), **Buyer** (purchases data), **Admin/Platform** (manages system)  

---

## 1. Core Vision and Use Case
**Q:** What is the main focus of the app right now?  
**A:** Phase 1 will focus on health data only (Apple HealthKit and Google Health Connect).  

**Q:** Will the app expand beyond health?  
**A:** Yes. Phase 2 will add manual data entry, and later phases will expand into a larger marketplace.  

**Q:** What is the MVP value?  
**A:** A healthcare data marketplace where users can consent and share their health data, buyers can post requirements, and transactions can happen with minimal friction.  

---

## 2. Users and Data Sources
**Q:** How will users share data?  
**A:** Phase 1: connect Apple Health / Health Connect.  
       Phase 2: manual entry.  
       Phase 3+: explore other sources.  

**Q:** What data will we collect in Phase 1?  
**A:** Basic profile: sex, age (via birth year), height, weight → BMI.  
Basic health data: fitness, vitals, activity, lifestyle.  


**Q:** How do we ensure data is trustworthy?  
**A:** For Phase 1, trust comes from device-based health data. Buyer and user verification is deferred. Verification system will be added in Phase 3.  

---

## 3. Buyers and Buyer Features
**Q:** Who are the buyers?  
**A:** Research labs, insurers, hospitals, universities, health startups.  

**Q:** How do buyers join?  
**A:** Phase 1: simple signup with account creation.  
Phase 3: add verification (docs, certificates, KYC). 

**Q:** What features will buyers see in Phase 1?  
**A:** Ability to post data requirements, review user signups, and approve offers.  
 

---

## 4. Money and Payout
**Q:** How will the platform make money?  
**A:** Currenlty OpenAI type model, no monitory gain until app reaches a certain scale

**Q:** How do users get paid?  
**A:** Not finalized. Could include PayPal, bank transfer, or crypto. (**TBD**)

**Q:** Who sets pricing markup and how?  
**A:** Not Finalized


---

## 5. Privacy and Compliance
**Q:** How is user consent handled?  
**A:**  Consent is required before any data sharing. Users will accept terms and conditions in-app.  
 
 **Q:** Which regulations to follow?  
**A:**   Phase 3

**Q:** Will users be able to revoke access?  
**A:** No. Revocation will be a Phase 3+ feature. 

**Current Concerns:**  
- Proper verification  
- Clear policies for selling and buyer use  
- Preventing resale without consent  
- Timer, tokens and data selling and bad actor catching, reporting

---

## 6. Security and Storage
**Q:** Where is data stored?  
**A:** Phase 1: data goes to web3 like before.  
Shared data will be encrypted and stored on Web3 for delivery to buyers.   

**Q:** Where does web3 come into picture?  
**A:** (**TBD**)  
  
---

## 7. Platform and Admin


**Q:** What does the platform manage in Phase 1?  
**A:** Managing consent flows, handling buyer postings, and tracking basic sharing records.  

**Q:** How will trust be maintained?  
**A:** In Phase 1, trust comes from system flow (users consent → buyers post → users accept). Verification and audit trails will come in Phase 3.  

---

## 8. User Experience
**Q:** What is the Phase 1 user flow?  
**A:** Login → fill profile (sex, age, BMI) → consent → see marketplace → agree to buyer requirement  → data shared. 

**Q:** What features will the user app include in Phase 1?  
**A:** Marketplace view, sharing page, settings, gamification (credits, badges).  

**Q:** Will there be dashboards?  
**A:** Phase 1: basic dashboard with earnings and shared data summary.  

---

## 9. Growth
**Q:** How do we get buyers?  
**A:** (**TBD**)

**Q:** How will users be attracted?  
**A:** Referral bonuses, early adopter credits, and a professional landing page with app store links.  


---


## 10. Design and Platforms
**Q:** How should the platform look and feel?  
**A:** Showcase the platform as data marketplace 

**Q:** Which platforms are we targeting in Phase 1?  
**A:** iOS and Android via React Native.  

**Q:** Will there be a web presence?  
**A:** Yes. A simple landing page will link to app stores. Buyer/Admin dashboard will come in Phase 3.  

**Q:** What is the design priority?  
**A:** Trust-first design with healthcare/fintech look: clean, simple, and professional.  

---


## 11. Gamification
**Q:** What gamification features are included in Phase 1?  
**A:** Credits and badges.  

**Q:** What about advanced gamification?  
**A:** Streaks, multipliers, and reputation scores may be added in later phases.  
