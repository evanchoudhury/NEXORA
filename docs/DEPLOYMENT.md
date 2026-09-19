# NEXORA Production Deployment Guide

## 1. Local Development Setup

### Prerequisites
- Node.js v20+
- npm v10+
- InsForge CLI (`npx @insforge/cli`)

### Quick Start (3 Terminals)

1. **Terminal 1: Express Backend**
   ```bash
   cd backend
   npm install
   npm start
   # Runs on http://localhost:5000
   ```

2. **Terminal 2: React Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   # Runs on http://localhost:5173
   ```

3. **Terminal 3: MCP Server (Optional for AI agents)**
   ```bash
   cd mcp-server
   npm install
   npm start
   ```

---

## 2. Docker Deployment

A multi-stage `Dockerfile` and `docker-compose.yml` are included in the repository root.

### Build & Run Containerized Stack
```bash
docker-compose up --build -d
```

This starts:
- `nexora-backend` on port `5000` (serving Express REST APIs + EJS SSR views + compiled React static assets)
- `nexora-frontend` on port `5173` (Vite dev server with hot reload)
- `nexora-mcp` (autonomous AI Model Context Protocol server)

---

## 3. Environment Variables Reference

| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | Backend listening port | `5000` |
| `NODE_ENV` | Environment mode | `production` / `development` |
| `INSFORGE_URL` | InsForge Platform API Base | `https://hmk4mg6q.us-east.insforge.app` |
| `INSFORGE_ANON_KEY` | InsForge Anonymous Public Key | Configured in `.env.local` |
| `DATABASE_URL` | Direct PostgreSQL Connection | `postgresql://postgres:...@...insforge.app:5432/insforge?sslmode=require` |
| `JWT_SECRET` | Secret key for signing user tokens | Strong random string (32+ chars) |
| `BLOCKCHAIN_RPC_URL` | EVM JSON-RPC endpoint | `https://ethereum-sepolia-rpc.publicnode.com` |
| `BLOCKCHAIN_NETWORK` | Network identifier | `sepolia` |
| `PAYMENT_RECEIVER_ADDRESS` | Escrow wallet / contract address | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` |
| `ETH_PRICE_INR` | Fallback exchange rate (1 ETH in INR) | `280000` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `http://localhost:5173` |

---

## 4. InsForge Backend Health Diagnostics

To verify backend connectivity and database health at any time:
```bash
npx @insforge/cli diagnose
```
To query database tables directly via the CLI:
```bash
npx @insforge/cli db tables
```
