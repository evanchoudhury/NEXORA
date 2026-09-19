# NEXORA Architecture Specification

## 1. High-Level Architectural Topology

NEXORA implements a modern, modular, multi-tier decoupled architecture separating customer-facing presentation (React), API orchestration (Express & EJS), managed database persistence (InsForge PostgreSQL), on-chain cryptographic settlement (Ethereum Sepolia), and agentic tool invocation (Model Context Protocol).

```text
                           ┌────────────────────────────────────────┐
                           │            Customer / Admin            │
                           └───────────────────┬────────────────────┘
                                               │
                                               ▼
                           ┌────────────────────────────────────────┐
                           │          React 18 Single Page App      │
                           │  Vite • Bootstrap 5 • Custom CSS Grid  │
                           │  Context APIs • Ethers.js Wallet Hook  │
                           └───────────────────┬────────────────────┘
                                               │
                                    REST / HTTPS (JSON)
                                               │
                                               ▼
                           ┌────────────────────────────────────────┐
                           │           Node.js + Express API        │
                           │  Helmet • CORS • RateLimit • Morgan    │
                           │  JWT Auth • RBAC • EJS Render Engine   │
                           └────────┬───────────┬───────────┬───────┘
                                    │           │           │
                    ┌───────────────┘           │           └──────────────┐
                    ▼                           ▼                          ▼
       ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
       │   InsForge Backend     │  │      EVM Blockchain    │  │       EJS Engine       │
       │   PostgreSQL Engine    │  │   Sepolia Network RPC  │  │   Printable Invoices   │
       │  23 Tables • ACID Tx   │  │   Smart Contract / Tx  │  │   Sales SSR Reports    │
       └────────────────────────┘  └────────────────────────┘  └────────────────────────┘
                    ▲
                    │ Parameterized SQL
                    │ Least Privilege
       ┌────────────┴───────────┐
       │   NEXORA MCP Server    │
       │  Stdio Protocol SDK    │
       │  Zod Tools • Auditing  │
       └────────────▲───────────┘
                    │
       ┌────────────┴───────────┐
       │  Autonomous AI Agent   │
       │  Claude / Antigravity  │
       └────────────────────────┘
```

---

## 2. Multi-Tier Layer Breakdown

### Presentation Layer (`frontend/`)
- **Runtime & Build:** React 18 + Vite
- **UI & Aesthetics:** Bootstrap 5 for scaffolding, custom CSS variables (`:root`), Flexbox for 1D navigation and controls, CSS Grid for 2D responsive catalog layouts, and glassmorphism styling.
- **State Management:** React Context API (`AuthContext`, `CartContext`, `WishlistContext`, `Web3Context`).
- **Web3 Interface:** `ethers.BrowserProvider` detecting MetaMask / EVM browser extension wallets.

### API & Orchestration Layer (`backend/`)
- **Runtime:** Node.js v20+ with Express 4
- **Security Middlewares:** `helmet` for security headers, `cors` for restricted cross-origin access, `express-rate-limit` for DDoS/brute-force defense, and centralized error sanitization.
- **Authentication & RBAC:** Stateless JWT tokens (`Bearer`) with database role hydration (`CUSTOMER`, `MANAGER`, `ADMIN`).
- **Server-Side Rendering (SSR):** EJS template engine for printable PDF-style tax invoices (`/admin/invoices/:id`) and executive reports (`/admin/reports/sales`).

### Persistence & Data Layer (`database/` & InsForge)
- **Engine:** PostgreSQL managed on InsForge cloud (`hmk4mg6q.us-east.insforge.app`).
- **Data Integrity:** ACID-compliant database transactions (`BEGIN ... FOR UPDATE ... COMMIT / ROLLBACK`) preventing overselling and partial order anomalies.
- **SDK & Direct Pool:** `@insforge/sdk` client alongside a dedicated connection pool (`pg.Pool`) configured with SSL encryption.

### Web3 Cryptographic Layer (`smart-contracts/`)
- **Contract:** `NexoraPayment.sol` written in Solidity 0.8.20 with reentrancy protection.
- **Escrow Settlement:** Emits indexed order events on-chain.
- **Server-Side Verification:** Backend `blockchainService.js` queries Sepolia JSON-RPC to verify block receipts and check against replay attacks before confirming orders.

### AI Agentic Layer (`mcp-server/`)
- **Protocol:** Official Model Context Protocol (`@modelcontextprotocol/sdk`).
- **Strict Schemas:** Every tool validates parameters using Zod schemas.
- **Security Boundary:** Disallows arbitrary SQL execution. Every operation is routed through strictly scoped business queries with full audit logging in `mcp_audit_logs`.
