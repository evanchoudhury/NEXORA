# Stripe Checkout Integration — Remaining Steps & Reference

This document is the single source of truth for the remaining setup steps and placeholder replacements for your Hosted Stripe Checkout integration.

---

## Values to Replace

The following values are placeholders and must be updated before going live.

**Files containing placeholders:**
- [backend/server.js](backend/server.js)
- [backend/.env](backend/.env)

| Field | Current Value | What to Set |
|-------|--------------|-------------|
| `mode` | `payment` | Set to `"payment"` for one-time charges or `"subscription"` for recurring billing. |
| `success_url` | `${process.env.DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}` | Your actual post-payment success page URL. Keep the `{CHECKOUT_SESSION_ID}` template. |
| `cancel_url` | `${process.env.DOMAIN}` | Your actual cancel/return page URL. |
| `line_items[].price` | `price_...` | Your actual Stripe Price ID from the Dashboard (https://dashboard.stripe.com/prices) or API. |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Your actual Stripe Publishable Key from the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys). |
| `STRIPE_SECRET_KEY` | `sk_test_...` | Your actual Stripe Secret Key from the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys). |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Your actual Stripe Webhook Signing Secret from [Stripe Workbench / Webhooks](https://dashboard.stripe.com/workbench/webhooks). |
| `DOMAIN` | `http://localhost:3000` | The origin domain of your frontend store (e.g. `http://localhost:5173` in local development or your production URL). |

---

## Configured Parameters

These parameters were configured in Checkout Studio and are already set correctly in the server code.

**Files containing these parameters:**
- [backend/server.js](backend/server.js)

| Parameter | Value | Notes |
|-----------|-------|-------|
| `ui_mode` | `hosted_page` | Configured for Stripe SDK version `22.6.2` (SDK version >= 21.0.0 uses `hosted_page`). |
| `billing_address_collection` | `auto` | Automatically prompts for billing address when needed. |
| `phone_number_collection` | `{ enabled: false }` | Phone number collection disabled per configuration. |
| `automatic_tax` | `{ enabled: false }` | Automatic tax computation disabled per configuration. |
| `allow_promotion_codes` | `false` | Promotion / coupon codes on the hosted checkout page disabled. |
| `payment_method_collection` | `always` | Configured to be added dynamically when `mode` is `"subscription"`. |
| `submit_type` | `auto` | Auto-detects the button text (e.g., Pay, Donate, Book). |
| `integration_identifier` | `hosted_web_0001` | Checkout studio integration identifier. |
| `origin_context` | `web` | Origin execution context. |

---

## Setup and Next Steps

### 1. Environment Variables & API Keys
1. Obtain your Stripe API keys from the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys).
2. Add your keys into [backend/.env](backend/.env):
   ```env
   STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key
   STRIPE_SECRET_KEY=sk_test_your_actual_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   DOMAIN=http://localhost:5173
   ```
   > **Note on Client Variables**: If any Stripe key is accessed directly from the browser in Vite, it must be prefixed with `VITE_` (e.g., `VITE_STRIPE_PUBLISHABLE_KEY`). Server-only secrets (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) must **never** be prefixed with `VITE_` and must stay on the server.

### 2. Project Structure & Code Modifications
- **[backend/package.json](backend/package.json)**: Installed `stripe` (`^22.6.2`).
- **[backend/server.js](backend/server.js)**: Added the Stripe SDK initialization and the `POST /api/create-checkout-session` endpoint.
- **[backend/.env](backend/.env)**: Added Stripe environment variable templates.

### 3. How the Integration Works (Flow Overview)
1. **Initiate Checkout**:
   The customer proceeds to checkout in the frontend and triggers a POST request to `/api/create-checkout-session`.
2. **Session Creation**:
   The backend calls `stripe.checkout.sessions.create(sessionParams)` with your configured `fixed_by_ui` parameters and line items.
3. **Hosted Redirect**:
   The server redirects (HTTP 303) the customer to `session.url` (the secure Stripe-hosted payment page).
4. **Completion & Return**:
   - On successful payment, Stripe redirects the customer to your `success_url` (`${DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`).
   - If the customer cancels or clicks back, Stripe redirects them to your `cancel_url` (`${DOMAIN}`).

### 4. Testing & Test Cards
- You can test payments using Stripe's official test credit cards in Test Mode.
- Reference: [Stripe Testing Guide](https://docs.stripe.com/testing)
  - **Card Number**: `4242 •••• •••• 4242`
  - **Expiration**: Any valid future date (e.g., `12/28`)
  - **CVC**: Any 3 digits (e.g., `123`)
  - **Postal Code**: Any valid postal code

### 5. Next Steps
- **Create Products & Prices**: Define products in your Stripe Dashboard to obtain real Price IDs (`price_...`) to replace `price_...` in [backend/server.js](backend/server.js).
- **Dynamic Cart Line Items**: Connect line items dynamically from `req.body.items` when moving from sample placeholder testing to dynamic order fulfillment.
- **Webhooks & Fulfillment**: Set up a webhook listener for `checkout.session.completed` to update your database order status to `PAID` upon verified payment receipt.

### Resources
- [Stripe Support](https://support.stripe.com)
- [Stripe Documentation & MCP](https://docs.stripe.com/mcp)
- [Stripe Checkout Overview](https://docs.stripe.com/checkout)
