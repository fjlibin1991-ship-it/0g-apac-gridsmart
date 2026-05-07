# GridShare — DePIN Energy Trading with AI-Optimized Renewable Distribution

## Project Overview

GridShare is a decentralized physical infrastructure network (DePIN) where households with solar panels, wind turbines, or home batteries can sell excess energy directly to neighbors — no utility company middleman. Every node (energy producer or consumer) is represented as an 0G Agent ID with a verified energy profile. Energy production data (from IoT sensors) is stored on 0G's Log layer, creating an immutable, auditable energy ledger. The 0G Compute Network runs an AI agent that optimizes energy routing in real-time based on production forecasts, consumption patterns, and grid conditions.

## Technical Architecture

```
Household (Solar Panel + Battery + IoT Sensor)
  └─> GridShare Node Agent
        ├─> Smart Contract — P2P energy escrow, settlement, carbon credential minting
        ├─> 0G Storage (KV) — real-time energy availability, pricing (fast lookup)
        ├─> 0G Storage (Log) — immutable production ledger / carbon provenance
        ├─> 0G Compute Network — AI routing agent
        ├─> 0G Agent ID — node identity, energy profile, reputation
        └─> IoT Integration (MQTT) — sensor data ingestion

GridShare Dashboard (for grid operators, households)
```

## 0G Components Used

- [x] Agent ID — energy node identity and profile
- [x] 0G Storage (KV) — real-time energy availability and pricing
- [x] 0G Storage (Log) — immutable production ledger / carbon provenance
- [x] Compute Network — AI routing agent

## Tech Stack

- Smart Contracts: Solidity ^0.8.20 (0G EVM)
- IoT: Raspberry Pi / ESP32 + MQTT broker
- Frontend: Next.js + React + TypeScript + Tailwind CSS + Web3.js
- ML: PyTorch energy forecasting served via 0G Compute Network
- 0G: Storage SDK, Compute Network, Agent ID

## Key Features

1. Energy producer registers node with Agent ID (capacity, location)
2. IoT sensor data streams production to 0G Log (immutable record)
3. AI agent predicts production/consumption, sets dynamic price
4. Consumer purchases energy; smart contract escrows and settles
5. Carbon credentials minted per kWh (verified via 0G Log)
6. Grid operator dashboard shows live renewable energy flows

## Project Structure

```
/Volumes/libin/apac/04-sustainability/
├── contracts/
│   ├── EnergyNodeRegistry.sol    # Node registration with Agent ID
│   ├── EnergyMarketplace.sol     # P2P energy listing + order matching
│   ├── CarbonCredential.sol      # Carbon credit minting per kWh
│   └── deploy/                   # Hardhat deploy scripts
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx             # Landing + live grid map
│   │   ├── register/node/       # Node registration
│   │   ├── trade/               # Energy marketplace
│   │   └── dashboard/           # Producer/consumer dashboard
│   ├── package.json
│   └── ...
├── src/
│   ├── lib/
│   │   ├── 0g.ts                # 0G Storage (KV + Log) + Agent ID
│   │   ├── energy-agent.ts      # AI routing + price optimization
│   │   └── mqtt.ts              # IoT sensor ingestion
│   └── ...
└── README.md
```
