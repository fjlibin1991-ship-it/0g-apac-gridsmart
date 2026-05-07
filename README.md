# GridShare — DePIN Energy Trading

> Decentralized P2P renewable energy marketplace powered by 0G DePIN infrastructure.

**Track:** Sustainability  
**0G Components:** Agent ID, 0G Storage (KV + Log), Compute Network

## What It Does

GridShare lets households with solar panels, wind turbines, or home batteries sell excess energy directly to neighbors. Every energy node is registered as an 0G Agent ID. Production data is permanently stored on 0G's immutable Log layer (carbon provenance). Real-time availability is indexed in the KV layer for millisecond lookup. An AI agent on the 0G Compute Network optimizes routing and pricing in real time.

## Architecture

```
IoT Sensor → 0G Storage Log (immutable production ledger)
             0G Storage KV (real-time availability/pricing)
             0G Agent ID (node identity)
             0G Compute Network (AI price optimizer)
Smart Contract (0G Chain) → P2P escrow + settlement + Carbon NFT minting
```

## Tech Stack

- Smart Contracts: Solidity ^0.8.20 (0G EVM)
- Frontend: Next.js + TypeScript + Tailwind CSS + Wagmi + Viem
- IoT: Raspberry Pi / ESP32 + MQTT
- 0G: Storage SDK, Compute SDK, Agent ID

## Key Contracts

- `EnergyNodeRegistry.sol` — Node registration + Agent ID NFT
- `EnergyToken.sol` — P2P trading token (GRD)
- `CarbonCredential.sol` — Carbon offset NFT per kWh

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
- [x] Smart contracts (EnergyNodeRegistry, CarbonCredential)
- [x] 0G Storage integration (KV + Log)
- [x] 0G Agent ID integration
- [x] Frontend with node registration + marketplace
- [ ] Deploy contracts to 0G testnet
- [ ] Demo video
