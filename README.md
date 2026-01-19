# Web3 Health — Documentation Repository

This repository contains **planning, design, and technical documentation** for the Web3 Health project at the University of Georgia (UGA).

The project explores building an application where individuals can **share or monetize health data in a privacy-preserving way**, with user-controlled permissions and a long-term goal of supporting a decentralized health data marketplace.

This repo is **documentation-focused** and intentionally separated from production application code.

---

## 🎯 Why this repository exists

- To maintain a **single, centralized source of truth** for project documentation.
- To capture **design decisions, trade-offs, and open questions** as the system evolves.
- To document **API behavior, database structure, and security considerations** clearly.
- To support **collaboration and continuity** across researchers, developers, and stakeholders.
- To provide **traceable references** between implementation logic and documentation.

---

## 🧭 Working name

**Web3 Health**

> This is a working title reflecting the current focus on health data and decentralized systems.  
> The name may change as the project scope evolves.

---

## 📂 Repository structure

```

    Documentation
    ├── docs/
    │   ├── API/
    │   │   ├── code/
    │   │   │   ├── buyer_get_posting_shares.ts
    │   │   │   ├── share_get_session_snapshot.ts
    │   │   │   ├── user_active-share-sessions.ts
    │   │   │   ├── user_cancel_share_session.ts
    │   │   │   ├── user_get_session_by_posting.ts
    │   │   │   ├── user_start_share_session.ts
    │   │   │   └── user_submit_segment.ts
    │   │   ├── API.md
    │   │   ├── Decentralization.md
    │   │   ├── Marketplace.md
    │   │   ├── Posting.md
    │   │   └── User.md
    │   ├── ARCHITECTURE.md
    │   ├── DATABASE.md
    │   ├── DESIGN_QA.md
    │   ├── PRIVACY.md
    │   ├── ROADMAP.md
    │   ├── SECURITY.md
    │   ├── SRS.md
    │   └── STATUS.md
    ├── index.html
    └── README.md

```

---

## 📌 Notes on API documentation

- The `docs/API/code/` directory contains **production Edge Function implementations** used by the current backend.
- These files serve as **authoritative references** for request/response behavior, validation rules, and business logic.
- Older or alternative implementations are intentionally kept for **traceability and comparison**.
- A **lightly tested FastAPI implementation** exists in the backend repository under the `api-refactoring` branch and can be used for:
  - replication,
  - experimentation,
  - or conversion to other frameworks.

Repository link:  
https://github.com/web3db/web3_health_uga_backend/tree/api-refactoring

---

## 📄 What this repo does *not* contain

- No mobile or web client source code
- No production secrets or credentials
- No deployment scripts or infrastructure configuration

Those live in separate repositories by design.

---

