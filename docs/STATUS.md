# Status

This file is our running log of discussions, decisions, and current focus for the project.  
It will be updated as the team makes progress.  




---
🔐 = Requirement locked

---
## 📅 Update – Sept 3 (Professor Discussion)

### 🎯 Key Direction 🔐
- Focus on **MVP for Phase 1**: the app should work as a **healthcare data marketplace**, not a fitness tracker.  
- First priority is **data monetization vision**: consent → sharing → marketplace.  
- Advanced features (verification, revocation, traceability) will come later.  

---

### 🧑‍⚕️ User Side (Phase 1)
- Login(Via Clerk).  🔐
- Login form 🔐
- Collect basic profile info:
  - Sex  
  - Age (via birth year)  
  - Height, Weight → BMI  
- Users must:🔐
  - Give **consent** to share data.  
  - See a **marketplace**.  
  - Access **sharing options**.  
  - Access **settings**.  
- Users act like Uber riders: once they consent, they don’t have to keep re-entering info.  🔐
- Gamification to be included early:🔐
  - Credits  
  - Badges  

---

###  Buyer Side (Phase 1)
- Buyers can **post requirements** for data.  
- Users can **sign up / agree** to those requirements.
- Buyer can post the requirements and edit them. 
- Once approved, buyer gets access to that user’s data for the agreed period.  



---

###  Consent & Sharing
- Phase 1:
  - Simple consent → user agrees → buyer sees data.  
  - No revocation or tokenization yet.  
- Later phases:
  - Add **time-limited tokens** for shared data.  
  - Add **revocation features**.  
  - Add traceability of who accessed what.
  - Buyers can **approve/reject user offers**.  
---

### Data & Storage
- Plan to use **Web3 setup**.  
- Phase 1: basic sharing model only.  
- Phase 2: add **time-based sharing tokens**.  


### Storage Decision (Phase 1)
- Phase 1 will use **Web3 storage as the primary path**.  
- Shared data will be packaged, encrypted, and uploaded to IPFS or a similar Web3 storage layer.  
- Local storage is being explored as a fallback option. If used, it will rely on secure device storage (Keychain/Keystore) and only release data after packaging and encryption.  
- Revocation and advanced access controls remain out of scope for Phase 1.  

### Other Notes
- User consent flow remains the first gate before any data leaves a device.  
- Next step: build prototype of Web3 storage integration and run feasibility checks for local-only storage.  


---

### Gamification
- Add credits system.  
- Add badges for engagement.  
- Could be tied to frequency of data sharing.  

---

### UI / Screens (Phase 1)
- **User**: Login & profile, consent flow, marketplace, sharing page, settings.  
- **Buyer**: Login & verification, post requirement, approve users, view purchased/shared data.  

---

## 📌 Notes
-  Current focus = **Phase 1 MVP** (consent + marketplace + basic sharing + gamification).  
