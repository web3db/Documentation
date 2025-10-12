# Security & Storage

This file shows security and storage considerations for the project.  
The focus is on protecting user data, choosing the right storage model, and ensuring trust.  

---

## 📌 Notes
-  TBD (needs more discussion)  
-  Concern / Risk  

---

## Phase 1 Approach
- Primary model: **Web3 storage** for shared data (used like before).  
- Users give consent → data package created → encrypted and uploaded to Web3.  
- Buyers receive time-limited access links to the encrypted bundle.  
- Profile information (age, sex, height, weight → BMI) stored securely with the platform.  
- Local storage feasibility will be tested, but not the main path in Phase 1.  

---

## Web3 Storage
- Data shared only after explicit user consent.  
- Each data bundle encrypted before upload.  
- Bundle has a unique identifier or hash to guarantee integrity.  
- Buyers get access through **time-limited signed links**.  
- Future additions may include revocation and traceability of buyer access.  

---

## Local Storage (Feasibility Work)
- Investigate storing raw health data locally until sale.  
- If used:
  - Secure device storage (Keychain on iOS, Keystore on Android).  
  - Data wiped on logout or account deletion.  
  - Still requires packaging and encryption before any transfer.  

---


## Consent and Access
- Data leaves the device only after explicit consent. Phase 3 
- No revocation/approval or token-based sharing in Phase 1.  
- Buyers receive access once agreed and cannot be blocked afterward in this phase.  Phase 3

---

## Risks
- Web3 adds operational complexity (pinning, gateways, performance).  
- Buyer misuse (reselling or sharing) not fully preventable in Phase 1.  
- Local-only storage may reduce usability (cross-device sync, buyer retrieval).  

---

## Next phases
- Build and test Web3 storage integration for encrypted bundles.  
- Run feasibility test on local storage option.  
- Finalize encryption libraries and key handling.  
- Define minimal audit logging for consent and data sharing.  