# OP_NET Paymaster Relayer (Gas Abstraction)

This project is a Next.js Fullstack application demonstrating **Gas Abstraction on Bitcoin L1** utilizing the OP_NET Metaprotocol.

It enables end-users to interact with an OP_NET smart contract (e.g., claiming tokens) *without* needing any native Bitcoin (BTC) to pay for transaction gas fees. Instead, an off-chain "Relayer" pays the network gas fee on their behalf, and securely deducts that exact cost mathematically from their airdrop claim.

## 🚀 What This Protocol Does

1. **The User Experience:** The user connects their OP_WALLET and clicks "Claim". They sign a **free, off-chain message** to authorize a meta-transaction. They do not initiate a native, on-chain BTC transaction.
2. **The Relayer API (`/api/relay`):** The Next.js API receives the user's signed message, verifies the signature against the hash, securely logs it into MongoDB to prevent replay attacks and track its state, and then compiles the meta-transaction.
3. **The OP_NET Smart Contract (`/contract/src/index.ts`):** The OP_VM smart contract fundamentally separates the `msg.sender` (the relayer who pays the BTC fee) from the user who cryptographically signed the authorization. It mathematically figures out the total claim, reimburses the relayer their gas fee in the protocol's native token, and forwards the remainder to the user.

## 🏃 How to Run Locally

### Prerequisites
- Node.js environment
- MongoDB (Local instance or MongoDB Atlas Cluster)

### 1. Configure the Environment
Copy the structure of `.env.local` to securely house your credentials (ensure `.env.local` stays ignored in version control!).
```bash
MONGODB_URI=your_mongodb_connection_string
RELAYER_PRIVATE_KEY=your_secure_relayer_private_key
```

### 2. Install Packages
Dependencies must be installed separately as follows:
```bash
npm install next
npm install mongodb
npm install @btc-vision/cli
npm install @btc-vision/transaction
npm install opnet
```

### 3. Setup the Smart Contract
Navigate into the contract environment and install local OP_NET SDK dependencies:
```bash
cd contract
npm install
npm run build
```

### 4. Run the Next.js Client
Start the local development server:
```bash
npm run dev
```
Visit `http://localhost:3000` to interact with the responsive Tailwind CSS UI.

## 💎 Why It Matters to the OP_NET Ecosystem

To date, interacting with smart contracts or DeFi protocols on Bitcoin layers requires users to actively hold and manage native BTC solely to cover gas/transaction fees. 
**Gas Abstraction natively breaks this entry barrier.**

Onboarding new web2 users or multi-chain enthusiasts to OP_NET becomes seamless. They do not need to onboard fiat through a centralized exchange to buy BTC before testing a dApp. They just connect and use the application effortlessly through relayer architecture.

## ⚡ Deployment Readiness (Vercel)

This application is purpose-built to scale smoothly on **Vercel**:
- **Stateless Relayer APIs:** The API routes (`app/api/relay`) are executed asynchronously and flawlessly in Serverless Functions.
- **Connection Pooling (`src/lib/mongodb.ts`):** Specifically implemented a globally cached promise for MongoClient. This guarantees Vercel Serverless Functions do not exhaust database connections with concurrent warm-ups.
- **Secure Architecture:** Built entirely utilizing `.env.local` to make transition to Vercel Environment Variables a secure one-to-one drop replacement.
