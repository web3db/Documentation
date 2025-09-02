# Design Q&A

This doc is our running list of questions, answers, and open items for the Web3 Health project.  
The goal is to capture everything in one place as we move from **planning → design → implementation**.  

---

## 📌 Notes
- ❓ TBD (needs team discussion)  
- ⚠️ Concern (watch out / research needed)  
- 👤 Roles: **User** (sells data), **Buyer** (purchases data), **Admin/Platform** (manages system)  

---

## 1. Core Vision and Use Case
**Q:** What is the main focus of the app right now?  
**A:** Start with **health data only** (Apple HealthKit, Google Health Connect).  

**Q:** Will the app expand beyond health?  
**A:** Yes → manual data entry next, then expand into a larger marketplace for other types of data.  

**Q:** What is the MVP value?  
**A:** Verified health data from real users → buyers get legitimate data, users get paid.  

---

## 2. Users and Data Sources
**Q:** How will users share data?  
**A:** Phase 1: connect Apple Health / Health Connect.  
       Phase 2: manual entry.  
       Phase 3+: explore other sources.  

**Q:** How do we ensure data is trustworthy?  
**A:** Verification required for both users and buyers. (**TBD**) Need to define “verification” (e.g., ID check, health account link).  

**Q:** What types of health data?  
**A:** Basic fitness, vitals, activity, lifestyle.

---

## 3. Buyers and Buyer Features
**Q:** Who are the buyers?  
**A:** Research labs, insurers, hospitals, universities, health startups.  

**Q:** How do buyers sign up?  
**A:** Likely similar to users, but with added verification steps (certificates, institutional checks). (**TBD**).  

**Q:** What features should the buyer UI have?  
**A:** Not finalized. Ideas include: search filters, API access, dataset previews, and bulk purchases. (**TBD**).  
 

---

## 4. Money and Payout
**Q:** How will the platform make money?  
**A:** Commission-based model (Uber-like markup).  
       Other options to explore: subscriptions, premium tiers, or buyer-side fees. (**TBD**).  

**Q:** How do users get paid?  
**A:** Not finalized. Could include PayPal, bank transfer, or crypto. (**TBD**)

**Q:** Who sets pricing?  
**A:** Not yet discussed (**TBD**)

**Q:** What is commission?  
**A:** Not yet discussed (**TBD**)

---

## 5. Privacy and Compliance
**Q:** How is user consent handled?  
**A:** Terms and conditions flow before data sharing. (**TBD**) Needs detail.  



**Current Concerns:**  
- Proper verification  
- Clear policies for selling and buyer use  
- Preventing resale without consent  
- Timer, tokens and data selling and bad actor catching, reporting

---

## 6. Security and Storage
**Q:** Where is data stored?  
**A:** Initial idea: store locally on device. (**TBD**) Need to test feasibility.  

**Q:** Where does web3 come into picture?  
**A:** (**TBD**)  
  
---

## 7. Platform and Admin
**Q:** What does the platform do?  
**A:** Take commission, manage trust, and provide transparency.  (**TBD**)

**Q:** How is trust maintained?  
**A:** Verification system TBD.  
   Needs audit logs and transparency dashboards.  

---

## 8. User Experience
**Q:** What is the Phase 1 user flow?  
**A:** Connect device → consent → share data → see earnings.  

**Q:** Will there be dashboards for users?  
**A:** (**TBD**) Needs design. Should show earnings, data shared, and buyer activity.  

**Q:** Any tracking features or any data visulzatons?  
**A:** (**TBD**) 

---

## 9. Growth
**Q:** How do we get buyers?  
**A:** (**TBD**)
  

## 10. Design and Platforms
**Q:** Which platforms will this app be built on?  
**A:** Targeting **Android and iOS** first.  Static web ui for attracting users. Consider Web UI for buyers/admins to improve presence and trust.  (**TBD**)

**Q:** How should the platform look and feel?  
**A:** Showcase the platform as data marketplace 


---

