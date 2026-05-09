# GridShare — DePIN Energy Trading

> Decentralized P2P renewable energy marketplace powered by 0G DePIN infrastructure.

**Track:** Sustainability  
**0G Components:** Agent ID, 0G Storage (KV + Log), Compute Network

## What It Does

GridShare lets households with solar panels, wind turbines, or home batteries sell excess energy directly to neighbors. Every energy node is registered as an 0G Agent ID. Production data is permanently stored on 0G's immutable Log layer (carbon provenance). Real-time availability is indexed in the KV layer for millisecond lookup. An AI agent on the 0G Compute Network optimizes routing and pricing in real time.

## DePIN Energy Trading Flow

```
IoT Sensor (ESP32/Raspberry Pi)
    │
    ▼
Production Data (kWh generated, timestamp, sensor readings)
    │
    ▼
0G Storage LOG (immutable production ledger — carbon provenance)
    │
    ▼
AI Routing Agent (0G Compute Network)
    │  - Reads real-time availability from 0G KV
    │  - Forecasts production based on weather + historical data
    │  - Optimizes pricing dynamically
    ▼
P2P Trade Execution (EnergyMarketplace.sol)
    │  - Consumer fills listing via EnergyToken (GRD)
    │  - 90% goes to producer, 10% platform fee
    │  - CarbonCredential minted per 100 kWh
    ▼
EnergyNodeRegistry (Agent ID NFT — node identity + reputation)
```

## Carbon Credential System

Every 100 kWh of verified green energy production earns the producer a Carbon Credential NFT:

- **Minting**: Automatically triggered in `EnergyMarketplace.settleOrder()` via `CarbonCredential.mintCredential()`
- **Unit**: 1 credential = 100 kWh of green energy
- **Metadata**: Includes producer node ID, kWh amount, timestamp, and provenance URI from 0G Log
- **Use cases**: Carbon offset tracking, ESG reporting, green energy certification

## 0G Components

| Component | Purpose | GridShare Integration |
|-----------|---------|----------------------|
| **0G Agent ID** | Decentralized node identity | `EnergyNodeRegistry` mints NFT per registered node |
| **0G Storage KV** | Real-time key-value availability | Active listings indexed for O(1) lookup |
| **0G Storage Log** | Immutable provenance ledger | Production sensor data permanently archived |
| **0G Compute Network** | AI price optimization | Forecasts production, optimizes routing |

## EnergyToken Integration

The `EnergyToken` (GRD) is the P2P trading currency:

- **Escrow**: Consumer approves tokens before `fillListing()`; tokens held in `EnergyMarketplace` escrow
- **Settlement**: `settleOrder()` releases 90% to producer, accumulates 10% platform fee
- **Fee withdrawal**: Owner calls `withdrawPlatformFees()` to withdraw accumulated fees
- **Transfers**: All token transfers use OpenZeppelin's `SafeERC20`

## Key Contracts

- `EnergyNodeRegistry.sol` — Node registration + Agent ID NFT
- `EnergyToken.sol` — P2P trading token (GRD)
- `CarbonCredential.sol` — Carbon offset NFT per kWh
- `EnergyMarketplace.sol` — P2P listing, fill, settlement + platform fee

## Demo Flow

1. **Connect Wallet** → Register as Producer, Consumer, Prosumer, or Grid Operator
2. **Register Node** → Mint 0G Agent ID NFT, set capacity and location
3. **Create Listing** → List available kWh at your price point
4. **AI Optimization** → 0G Compute agent recommends dynamic pricing
5. **Fill Listing** → Consumer fills order, tokens held in escrow
6. **Settle Trade** → Tokens released, Carbon Credential minted automatically
7. **Withdraw Fees** → Platform owner withdraws accumulated fees

## Tech Stack

- Smart Contracts: Solidity ^0.8.20 (0G EVM)
- Frontend: Next.js + TypeScript + Tailwind CSS + Wagmi + Viem
- IoT: Raspberry Pi / ESP32 + MQTT
- 0G: Storage SDK, Compute SDK, Agent ID

## Setup

```bash
cd frontend
npm install
npm run dev
```

Set environment variables:
```env
NEXT_PUBLIC_0G_STORAGE_RPC=https://rpc-testnet.0g.ai
NEXT_PUBLIC_0G_COMPUTE_RPC=https://compute-testnet.0g.ai
```

## 0G Integration

- **Agent ID**: EnergyNodeRegistry mints a unique NFT (Agent ID) per node
- **0G Storage KV**: Active energy listings indexed for fast lookup
- **0G Storage Log**: Production logs (sensor readings) permanently archived
- **0G Compute Network**: AI agent forecasts production and recommends dynamic prices

## Screenshots

*TODO: Add screenshots after implementation*

## Submission Checklist

- [x] Project description and repo
- [x] Smart contracts (EnergyNodeRegistry, CarbonCredential, EnergyMarketplace)
- [x] 0G Storage integration (KV + Log)
- [x] 0G Agent ID integration
- [x] Frontend with node registration + marketplace
- [x] EnergyToken integration with platform fee
- [x] Carbon credential system (minting per 100 kWh)
- [ ] Deploy contracts to 0G testnet
- [ ] Demo video
