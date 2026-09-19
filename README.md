# NEXORA — "Shop Smarter. Experience More."

[![InsForge Backend](https://img.shields.io/badge/Backend-InsForge%20PostgreSQL-blue.svg)](https://insforge.dev)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb.svg)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/API-Node.js%20%2B%20Express-green.svg)](https://nodejs.org)
[![Web3](https://img.shields.io/badge/Web3-EVM%20Sepolia%20Testnet-purple.svg)](https://ethereum.org)
[![MCP](https://img.shields.io/badge/AI-Model%20Context%20Protocol-orange.svg)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

NEXORA is a production-grade, full-stack e-commerce marketplace built from scratch. It integrates a responsive React frontend, an Express.js API, server-side rendered EJS invoices and reports, an **InsForge PostgreSQL database with ACID transactions**, **Web3 cryptocurrency checkout**, and a dedicated **Model Context Protocol (MCP)** server for autonomous AI shopping agents.

---

## 🚀 Key Highlights & Features

1. **InsForge PostgreSQL Backend:** 23 normalized tables, foreign keys with cascading actions, check constraints, performance indexes, and database views (`v_product_catalog`, `v_low_stock`, `v_sales_analytics`).
2. **ACID Safe Transactions:** Atomic checkout process using PostgreSQL `SELECT ... FOR UPDATE` row locks to guarantee zero inventory overselling.
3. **Multi-Rail Payments:** Traditional (Credit/Debit Card, UPI QR, Cash on Delivery) plus an optional **Web3 Ethereum (Sepolia)** on-chain payment flow with server-side RPC verification and replay attack protection.
4. **Autonomous AI Assistant ("NEXORA AI"):** Powered by custom MCP tools (`search_products`, `get_order_status`, `get_low_stock_products`, `get_sales_analytics`), enforcing schema validation and audit logging in `mcp_audit_logs`.
5. **Modern Design System:** Built with semantic HTML5, CSS Flexbox (1D layouts), CSS Grid (2D catalog layouts), custom CSS variables, dark-mode glassmorphism, and responsive breakpoints from mobile (320px) to desktop (1920px).
6. **Server-Side Rendered (SSR) Invoices & Reports:** EJS-templated printable tax invoices and an executive analytics reporting view.

---

## 🛠️ Technology Stack Breakdown

| Technology | Role & Demonstration |
|---|---|
| **Semantic HTML5** | `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, forms, accessible labels, clean heading hierarchy |
| **Modern CSS3** | Custom CSS variables (`--primary-color`, etc.), glassmorphism (`backdrop-filter`), hover states, micro-animations |
| **CSS Flexbox** | 1D layouts: responsive navbar (`Logo \| Search \| Account \| Cart \| Wallet`), product stepper controls, tag badges |
| **CSS Grid** | 2D layouts: responsive product catalog grids, category cards, admin telemetry cards, checkout breakdown |
| **Bootstrap 5** | Containers, modals, badges, alerts, utilities, and Bootstrap Icons |
| **JavaScript ES6+** | Arrow functions, destructuring, spread/rest, async/await, optional chaining (`?.`), array pipelines (`map`, `filter`, `reduce`) |
| **React.js & Router** | Functional components, custom hooks, React Context (`Auth`, `Cart`, `Wishlist`, `Web3`), client-side routing |
| **Node.js & Express** | RESTful endpoints, Helmet security headers, CORS policies, rate limiting, centralized error handling |
| **EJS Templating** | Server-rendered tax invoices (`/admin/invoices/:id`) and executive sales reports (`/admin/reports/sales`) |
| **InsForge PostgreSQL** | Persistent cloud database, connection pooling (`pg.Pool`), `@insforge/sdk`, 23 relational tables, ACID transactions |
| **Web3 & Blockchain** | Ethers.js integration, MetaMask wallet detection, Sepolia testnet settlement, `NexoraPayment.sol` Solidity contract |
| **MCP (Model Context Protocol)** | Dedicated AI server with Zod input validation schemas, role-based authorization, and persistent audit logs |

---

## 📁 Project Directory Structure

```text
NEXORA/
│
├── frontend/               # React 18 + Vite + Bootstrap Application
│   ├── public/             # Static web assets
│   ├── src/
│   │   ├── components/     # Navbar, Footer, ProductCard, ProductGrid, AIAssistant...
│   │   ├── context/        # AuthContext, CartContext, WishlistContext, Web3Context
│   │   ├── pages/          # Home, Products, ProductDetails, Cart, Checkout, Profile, Admin...
│   │   ├── services/       # api.js fetch client with JWT token handling
│   │   ├── index.css       # Design system tokens, Flexbox/Grid utilities
│   │   ├── App.jsx         # App router and providers
│   │   └── main.jsx        # Root entry point
│   ├── index.html          # HTML5 semantic template
│   └── vite.config.js      # Dev server with API proxy
│
├── backend/                # Node.js + Express + EJS Backend Service
│   ├── config/             # insforge.js (InsForge SDK + pg.Pool connection)
│   ├── controllers/        # auth, product, category, cart, order, review, blockchain, admin
│   ├── middleware/         # auth (JWT), authorize (RBAC), rateLimiter, errorHandler, auditLogger
│   ├── routes/             # REST endpoint route declarations
│   ├── services/           # Business logic, ACID transactions, blockchain RPC verification
│   ├── views/              # EJS server-side templates (invoices, reports, errors)
│   ├── tests/              # Jest + Supertest integration tests
│   ├── server.js           # Main Express server entry
│   └── .env                # Protected environment credentials
│
├── mcp-server/             # Model Context Protocol (MCP) Server for AI Agents
│   ├── config/             # Database connection & mcp_audit_logs logger
│   ├── tools/              # products, orders, inventory, analytics, blockchain
│   ├── tests/              # Jest MCP tool tests
│   └── server.js           # MCP Stdio transport server
│
├── database/               # Relational Database Schema & Data
│   ├── schema.sql          # 23 tables, constraints, indexes, views
│   └── seeds/seed.sql      # 8 categories, 32 products, users, reviews, coupons
│
├── smart-contracts/        # Solidity EVM Payment Settlement
│   ├── NexoraPayment.sol   # On-chain payment receiver contract
│   ├── scripts/deploy.js   # Hardhat deployment script
│   └── hardhat.config.js   # Sepolia & local testnet configuration
│
├── docs/                   # Architectural & Technical Documentation
│   ├── ARCHITECTURE.md     # System design and topologies
│   ├── DATABASE.md         # Tables, relationships, indexes, transactions
│   ├── API.md              # REST API endpoint reference
│   ├── MCP.md              # AI agent tools, schemas, and resources
│   ├── WEB3.md             # Wallet connection and verification details
│   ├── SECURITY.md         # Threat mitigations and security policies
│   └── DEPLOYMENT.md       # Docker and production setup
│
├── .env.local              # InsForge credentials (never committed)
├── .env.example            # Environment variables template
├── .gitignore              # Protects secrets & node_modules
├── Dockerfile              # Production multi-stage Docker build
├── docker-compose.yml      # Multi-service stack composition
└── README.md               # Master documentation
```

---

## 🔑 Demo Accounts (One-Click Testing)

For instant evaluation, the login page (`/login`) includes 1-click credentials buttons:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Customer** | `customer@nexora.com` | `Password@123` | Browsing, Cart, Wishlist, Checkout, Order Tracking |
| **Manager** | `manager@nexora.com` | `Password@123` | Inventory, Order Fulfillment Status Updates, Telemetry |
| **Admin** | `admin@nexora.com` | `Password@123` | Full Access, Product Creation, Role Management, SSR Reports |

---

## ⚡ Quick Start & Running Locally

### 1. Install Dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install

# MCP Server
cd ../mcp-server && npm install
```

### 2. Start Services
Open two terminal windows:

**Terminal 1 — Express Backend API:**
```bash
cd backend
npm start
# Server boots on http://localhost:5000
```

**Terminal 2 — React Frontend:**
```bash
cd frontend
npm run dev
# App opens on http://localhost:5173
```

**Terminal 3 (Optional) — MCP Server for AI Agents:**
```bash
cd mcp-server
npm start
```

---

## 🧪 Running Automated Tests

### Backend API Tests
```bash
cd backend
npm test
```
*Validates `/api/health`, InsForge category count, product pagination, search filtering, JWT login, coupon validation, and Web3 quote generation.*

### MCP Server Tool Tests
```bash
cd mcp-server
npm test
```
*Validates schema validation, database tool execution, order status tracking, and low stock warnings.*

### Frontend Production Build
```bash
cd frontend
npm run build
```
*Compiles React assets, performs JSX validation, and optimizes production bundles.*

---

## 🐳 Docker Deployment

To launch the full containerized application:
```bash
docker-compose up --build -d
```
Access the application at `http://localhost:5000` (production bundle) or `http://localhost:5173` (development server).

---

## 🛡️ Security & Integrity Checklist

- [x] **No Arbitrary SQL from AI:** MCP server only calls predefined parameterized queries.
- [x] **PostgreSQL ACID Transactions:** Row locks (`FOR UPDATE`) prevent race conditions during inventory reduction.
- [x] **Web3 Server-Side Verification:** Blockchain payments are validated via JSON-RPC block receipts before updating payment status.
- [x] **Replay Attack Protection:** Unique constraint on `blockchain_transactions(transaction_hash)`.
- [x] **Password Protection:** Encrypted using bcrypt (cost factor 10).
- [x] **Role-Based Access Control:** Strict middleware guards all write/admin endpoints.
- [x] **Credentials Safety:** `.env` and `.env.local` are isolated in `.gitignore`.

---

## 📜 Final Acceptance Verification

- [x] **HTML5 Semantic Structure:** Verified
- [x] **Modern CSS & Tokens:** Verified
- [x] **CSS Flexbox & CSS Grid:** Verified
- [x] **Bootstrap 5 UI Components:** Verified
- [x] **JavaScript ES6+ Syntax:** Verified
- [x] **React.js Frontend:** Verified
- [x] **Node.js + Express API:** Verified
- [x] **EJS Server-Side Rendered Invoices & Reports:** Verified
- [x] **InsForge PostgreSQL Primary Database:** Verified
- [x] **23 Normalized Tables & Views:** Verified
- [x] **ACID Database Transactions:** Verified
- [x] **Web3 MetaMask & Sepolia Settlement:** Verified
- [x] **Model Context Protocol (MCP) Server:** Verified
- [x] **NEXORA AI Autonomous Assistant Widget:** Verified
- [x] **Comprehensive Documentation & Tests:** Verified

**NEXORA — Shop Smarter. Experience More.**
