# NEXORA Security Controls & Threat Modeling

## 1. Security Architecture Summary

| Threat Vector | Mitigation Strategy Implemented in NEXORA |
|---|---|
| **SQL Injection (SQLi)** | 100% of queries use PostgreSQL parameterized bindings (`$1, $2`). Dynamic string interpolation into SQL is strictly prohibited. |
| **Cross-Site Scripting (XSS)** | React JSX escapes output by default. Helmet HTTP response headers prevent script execution in unexpected contexts. |
| **Cross-Site Request Forgery (CSRF)** | Stateless Bearer JWT tokens in the `Authorization` header instead of vulnerable ambient cookies. |
| **Brute Force & DDoS** | `express-rate-limit` limits general API requests to 300/15min, and auth attempts (login/register) to 30/15min per IP. |
| **Broken Access Control (BAC)** | Backend middleware (`requireAuth`, `requireRole('ADMIN')`) strictly enforces authorization on every protected route. |
| **Insecure Direct Object Reference (IDOR)** | Orders and user profiles verify that `order.user_id === req.user.id` or that the requester possesses elevated `ADMIN` roles. |
| **Inventory Overselling Race Conditions** | Atomic PostgreSQL transactions use `SELECT ... FOR UPDATE` row-level locks before decrementing stock. |
| **Web3 Payment Spoofing** | Front-end payment events are treated as unverified hints; backend queries the blockchain RPC provider directly to confirm block receipts. |
| **Secrets Exposure** | `.env.local` and `.env` are added to `.gitignore`. No passwords, private keys, or API tokens are hardcoded. |
| **MCP AI Tool Abuse** | MCP server exposes explicit business tools with Zod schema validation; raw SQL tools are omitted. |

---

## 2. Password Security & Storage
- Passwords are never stored in plaintext.
- Passwords are encrypted using **bcrypt** with a minimum cost factor of 10 (`bcrypt.genSalt(10)`).
- Verification uses constant-time string comparisons (`bcrypt.compare`) to prevent timing attacks.

---

## 3. Auditing & Logging
- **`audit_logs` table:** Records user creation, profile updates, order placements, and admin modifications with IP address and user agent.
- **`mcp_audit_logs` table:** Records every tool call from autonomous AI agents, including tool name, arguments, execution time, and error details.
- Sensitive values (passwords, payment cards, private keys) are stripped before logging.
