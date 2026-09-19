# NEXORA REST API Specification

All API endpoints return a uniform JSON envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable confirmation"
}
```
Errors return standardized structured objects:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descriptive message"
  }
}
```

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new customer account.
- **Body:** `{ "name": "...", "email": "...", "password": "...", "phone": "..." }`
- **Status:** `201 Created`
- **Response:** `{ success: true, data: { user: {...}, token: "jwt..." } }`

### `POST /api/auth/login`
Authenticates user and returns JWT bearer token.
- **Body:** `{ "email": "...", "password": "..." }`
- **Status:** `200 OK`

### `GET /api/auth/me`
Retrieves currently authenticated user with assigned roles.
- **Headers:** `Authorization: Bearer <token>`
- **Status:** `200 OK`

---

## 2. Product & Category Endpoints

### `GET /api/products`
Search, filter, sort, and paginate catalog listings.
- **Query Params:**
  - `search` (string): Keyword matching title, brand, sku, description
  - `category` (string): Category slug
  - `minPrice` / `maxPrice` (number)
  - `rating` (number): 1-5
  - `inStock` (boolean)
  - `sort`: `newest`, `price_asc`, `price_desc`, `rating`, `popular`
  - `page` (int, default 1), `limit` (int, default 12)
- **Status:** `200 OK`

### `GET /api/products/:id`
Fetch single product by UUID or slug, including image gallery and verified customer reviews.
- **Status:** `200 OK` / `404 Not Found`

### `POST /api/products`
Admin creation of new catalog listing.
- **Permission:** `ADMIN`, `MANAGER`
- **Status:** `201 Created`

### `GET /api/categories`
Retrieves all active categories with associated product counts.
- **Status:** `200 OK`

---

## 3. Cart & Wishlist Endpoints

### `GET /api/cart`
Returns active user shopping cart with live price recalculation, item totals, 18% GST estimate, and shipping calculation.
- **Permission:** Requires Auth
- **Status:** `200 OK`

### `POST /api/cart`
Adds an item to user cart.
- **Body:** `{ "productId": "...", "quantity": 1 }`
- **Status:** `200 OK`

### `PUT /api/cart/:itemId`
Updates quantity of an existing item in cart.
- **Body:** `{ "quantity": 3 }`

### `DELETE /api/cart/:itemId`
Removes an item from cart.

### `GET /api/wishlist`
Returns saved favorite items.

### `POST /api/wishlist`
Toggles saving a product to user wishlist.

---

## 4. Order & Checkout Endpoints

### `POST /api/orders`
Executes full checkout inside an ACID PostgreSQL transaction.
- **Permission:** Requires Auth
- **Body:**
  ```json
  {
    "shippingAddress": {
      "full_name": "Aarav Sharma",
      "address_line1": "Flat 402, Cyber Heights",
      "city": "Bengaluru",
      "state": "Karnataka",
      "postal_code": "560037",
      "country": "India",
      "phone": "+91 9876543212"
    },
    "paymentMethod": "CREDIT_CARD",
    "couponCode": "NEXORA10"
  }
  ```
- **Status:** `201 Created`

### `GET /api/orders`
Returns past order history for the authenticated user.

### `GET /api/orders/:id`
Retrieves detailed order information, items, delivery tracking, and payment record.

### `PUT /api/orders/:id/status`
Updates order fulfillment and tracking number.
- **Permission:** `ADMIN`, `MANAGER`

### `POST /api/orders/validate-coupon`
Validates promo code against subtotal rules.

---

## 5. Web3 Blockchain Endpoints

### `GET /api/blockchain/quote?fiatAmount=14000`
Generates accurate cryptocurrency equivalent (in ETH) based on live exchange rates.
- **Status:** `200 OK`

### `POST /api/blockchain/verify`
Server-side verification of on-chain Ethereum Sepolia transaction hash. Checks receipt, confirms amount, prevents replay attacks, and marks order as PAID.
- **Body:**
  ```json
  {
    "orderId": "uuid...",
    "transactionHash": "0x...",
    "walletAddress": "0x..."
  }
  ```
- **Status:** `200 OK`

---

## 6. Admin SSR & Telemetry Endpoints

### `GET /api/admin/stats`
Returns aggregated business metrics, daily sales trend, top products, and low stock warnings.

### `GET /admin/invoices/:id`
Renders a printable tax invoice via EJS with print stylesheet support.

### `GET /admin/reports/sales`
Renders an executive sales and analytics report via EJS with dark theme styling.
