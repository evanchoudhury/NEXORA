# NEXORA Web3 & Blockchain Payment Architecture

## 1. Overview
NEXORA provides an optional on-chain cryptocurrency payment rails alongside traditional payment methods (Credit/Debit cards, UPI, and Cash on Delivery).

Customers can connect their Web3 wallet (e.g., MetaMask, Rabby, Coinbase Wallet) and settle purchases directly in Ethereum (ETH) on EVM-compatible networks (defaults to Ethereum Sepolia Testnet).

---

## 2. Cryptographic Payment Flow

```text
Customer
   │
   ├─► Selects "Pay with Crypto (ETH)" at Checkout
   │
   ├─► Frontend requests real-time exchange quote (/api/blockchain/quote)
   │
   ├─► Customer connects MetaMask via ethers.BrowserProvider
   │
   ├─► Customer confirms transaction in MetaMask
   │   (Native ETH transferred to verified escrow receiver address)
   │
   ├─► Transaction receipt with txHash emitted on Sepolia
   │
   ├─► Frontend submits { orderId, transactionHash, walletAddress } to backend
   │
   ▼
Backend Server-Side Verification (/api/blockchain/verify)
   │
   ├─► 1. Check replay attack protection:
   │      Verifies transaction_hash is not already recorded in database
   │
   ├─► 2. Query Sepolia JSON-RPC via Ethers provider:
   │      - Receipt status must equal 1 (SUCCESS)
   │      - Block number must be confirmed
   │      - Recipient address must match platform receiver
   │
   ├─► 3. Atomic Database Update:
   │      - Insert verified record into blockchain_transactions
   │      - Update orders.payment_status = 'PAID'
   │      - Update orders.order_status = 'CONFIRMED'
   │      - Record payment receipt in payments table
   │
   ▼
Order Success & Fulfillment Dispatch
```

---

## 3. Smart Contract (`smart-contracts/NexoraPayment.sol`)

A dedicated Solidity contract is provided in `smart-contracts/`:
- Accepts payments with an order reference string: `payForOrder(string orderNumber)`
- Emits indexed event `PaymentReceived(string indexed orderNumber, address indexed payer, uint256 amount, uint256 timestamp)`
- Reentrancy guard modifier `nonReentrant`
- Owner-only withdrawal of accumulated funds to treasury.

### Deployment Instructions
1. Navigate to `smart-contracts/`:
   ```bash
   cd smart-contracts
   npm install
   ```
2. Configure your testnet deployer private key in `backend/.env`:
   ```env
   WALLET_PRIVATE_KEY=your_sepolia_private_key
   ```
3. Run Hardhat deployment:
   ```bash
   npm run deploy:sepolia
   ```
4. Copy the deployed contract address into `backend/.env`:
   ```env
   PAYMENT_RECEIVER_ADDRESS=0x...
   ```

---

## 4. Key Security Rules
- **Never Store Private Keys:** NEXORA never prompts, stores, or handles user private keys.
- **Never Trust Client Status:** The client cannot mark an order as PAID. Only server-side RPC confirmation alters payment status.
- **Replay Protection:** Every transaction hash is stored with a `UNIQUE` constraint in `blockchain_transactions`.
