# Security & Storage

This file shows security and storage considerations for the project.  
The focus is on protecting user data, choosing the right storage model, and ensuring trust.  

---

## 📌 Notes
- ❓ = TBD (needs more discussion)  
- ⚠️ = Concern / Risk  

---

## ✅ Early Ideas
- Initial thought: store data **locally on device** (**TBD**).   

---

## ❓ Open Questions
- Should we use **local-only storage** in Phase 1, or sync with Web3 or store in database?
- Should users have a **private key / wallet style ownership** if we go Web3?  
- How to log access for **audit trails** without breaking privacy?  

---

## ⚠️ Concerns
- If data leaves device → must be **end-to-end encrypted + anonymized**.  
- Local storage may limit buyer access if users switch devices.  
- Cloud storage adds convenience but increases risk of breach.  
- Web3 storage is promising but adds complexity and costs.  

---

## Identity amd Authentication

- We need a secure, low-friction way to sign up, sign in, and verify roles (User, Buyer, Admin). 

- Change current metamask login

---



###  Open Questions
- Which provider (Clerk/Auth0/DIY)?
- Any restrictions on the user sign-up
