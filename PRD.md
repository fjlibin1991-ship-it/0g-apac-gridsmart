# 0G APAC Hackathon — Sustainability Track

## Project Name

**GridShare** — DePIN Energy Trading with AI-Optimized Renewable Distribution

## 1. Concept & Vision

GridShare is a decentralized physical infrastructure network (DePIN) where households with solar panels, wind turbines, or home batteries can sell excess energy directly to neighbors — no utility company middleman. Every node (energy producer or consumer) is represented as an 0G Agent ID with a verified energy profile. Energy production data (from IoT sensors) is stored on 0G's Log layer, creating an immutable, auditable energy ledger. The 0G Compute Network runs an AI agent that optimizes energy routing in real-time based on production forecasts, consumption patterns, and grid conditions.

## 2. Problem Statement

Renewable energy adoption is slowed by the "last mile" problem: households generate excess solar energy but cannot efficiently sell it locally — they export to the grid at low feed-in tariffs and buy back at high retail rates. Existing P2P energy markets require trusted intermediaries and lack real-time optimization. There is no open, auditable record of energy provenance.

## 3. Solution

- **Energy Node Agent (0G Agent ID)**: Every producer/consumer gets an Agent ID storing their energy profile (capacity, location, production history).
- **Production Ledger (0G Storage Log)**: IoT sensor readings (kWh produced, timestamp, device ID) written to 0G Log — creates a carbon provenance record.
- **Energy Marketplace (0G Storage KV + Smart Contract)**: Real-time availability and pricing stored in KV; smart contract handles escrow and settlement.
- **AI Routing Agent (0G Compute Network)**: Predicts production (weather + historical data), forecasts demand, and optimizes energy routing to maximize renewable usage and minimize transmission loss.
- **Carbon Credentials**: Energy provenance records on 0G Log allow certified carbon offset calculation.

## 4. Technical Architecture

```
Household (Solar Panel + Battery + IoT Sensor)
  └─> GridShare Node Agent
        ├─> Smart Contract — P2P energy escrow, settlement, carbon credential minting
        ├─> 0G Storage (KV) — real-time energy availability, pricing (fast lookup)
        ├─> 0G Storage (Log) — immutable production ledger (carbon provenance)
        ├─> 0G Compute Network — AI routing and optimization agent
        ├─> 0G Agent ID — node identity, energy profile, reputation
        └─> IoT Integration (MQTT) — sensor data ingestion

GridShare Dashboard (for grid operators, households)
```

## 5. Tech Stack

- Smart Contracts: Solidity
- IoT: Raspberry Pi / ESP32 + MQTT broker
- Frontend: React + Web3.js
- 0G Modules: Storage SDK, Compute Network, Agent ID
- ML: PyTorch (energy forecasting) served via 0G Compute Network

## 6. 0G Components Used

- [x] Agent ID — energy node identity and profile
- [x] 0G Storage (KV) — real-time energy availability and pricing
- [x] 0G Storage (Log) — immutable production ledger / carbon provenance
- [x] Compute Network — AI routing agent

## 7. Key Features

1. Energy producer registers node with Agent ID (capacity, location)
2. IoT sensor data streams production to 0G Log (immutable record)
3. AI agent predicts production/consumption, sets dynamic price
4. Consumer purchases energy; smart contract escrows and settles
5. Carbon credentials minted per kWh (verified via 0G Log)
6. Grid operator dashboard shows live renewable energy flows

## 8. Submission Requirements

- [x] Project name, description, repo link
- [x] Smart contract deployed (energy escrow + settlement)
- [x] 0G Storage integration proof (production data on 0G Log)
- [x] Demo video showing energy node registration + P2P trading
- [x] README with setup/run instructions

## 9. Team

- Builder: 小风
