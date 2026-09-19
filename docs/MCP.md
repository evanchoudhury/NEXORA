# NEXORA Model Context Protocol (MCP) Server

## 1. Overview
The NEXORA MCP Server enables autonomous AI coding agents, shopping assistants, and customer service bots to interact with the e-commerce system through controlled, schema-validated tools.

**Core Philosophy:**
- **No Arbitrary SQL:** The AI agent is never permitted to execute raw SQL.
- **Least Privilege:** Write operations enforce role-based authorization (`ADMIN` or `MANAGER`).
- **Telemetry & Auditing:** Every invocation is written to `mcp_audit_logs` in PostgreSQL.

---

## 2. Server Architecture

```text
┌───────────────────────────┐
│     AI Agent / Client     │
└─────────────┬─────────────┘
              │ JSON-RPC (StdIO)
              ▼
┌───────────────────────────┐
│    NEXORA MCP Server      │
├───────────────────────────┤
│ • ListToolsHandler        │
│ • CallToolHandler         │
│ • ListResourcesHandler    │
│ • ReadResourceHandler     │
└─────────────┬─────────────┘
              │ Parameter Validation (Zod)
              ▼
┌───────────────────────────┐
│  Scoped Database Service  │
└─────────────┬─────────────┘
              │ Parameterized Queries
              ▼
┌───────────────────────────┐
│   InsForge PostgreSQL     │
└───────────────────────────┘
```

---

## 3. Tool Specifications

### `search_products`
Searches product catalog by keyword, category, and budget.
```json
{
  "query": "headphones",
  "category": "electronics",
  "minPrice": 5000,
  "maxPrice": 20000,
  "limit": 5
}
```

### `get_product`
Retrieves product specs and stock levels.
```json
{
  "identifier": "aurasound-sonic-pro-anc-headphones"
}
```

### `create_product` [ADMIN WRITE TOOL]
Creates a new listing and registers stock in warehouse inventory.
```json
{
  "name": "Titanium Wireless Earbuds",
  "description": "True wireless earbuds with active noise cancellation and wireless charging case.",
  "brand": "AuraSound",
  "sku": "ELEC-EB-005",
  "price": 7999.00,
  "categorySlug": "electronics",
  "stock": 25
}
```

### `get_order_status`
Tracks order state and courier tracking numbers.
```json
{
  "orderNumber": "NEX-2026-98214"
}
```

### `update_order_status` [ADMIN/MANAGER WRITE TOOL]
Advances order fulfillment lifecycle.
```json
{
  "orderId": "f0000000-0000-0000-0000-000000000001",
  "orderStatus": "SHIPPED",
  "trackingNumber": "TRK-IND-992014"
}
```

### `get_low_stock_products`
Flags warehouse items that have fallen below safety inventory limits.
```json
{
  "threshold": 5
}
```

### `update_inventory` [ADMIN/MANAGER WRITE TOOL]
Adjusts on-hand stock count.
```json
{
  "productId": "d0000000-0000-0000-0000-000000000005",
  "newStock": 50
}
```

### `get_sales_analytics` [ADMIN/MANAGER TOOL]
Aggregates sales revenue, average order value, and category volume over a timeframe.
```json
{
  "days": 30
}
```

### `get_blockchain_transaction`
Queries on-chain transaction receipt verified by backend.
```json
{
  "transactionHash": "0x7a8b...12c3"
}
```

---

## 4. MCP Resources

| URI | Name | Description |
|---|---|---|
| `product://catalog` | Catalog Summary | JSON summary of top active products |
| `inventory://low-stock` | Low Stock Warnings | List of items requiring immediate restocking |
| `analytics://overview` | Executive Telemetry | Overall sales and revenue figures |
