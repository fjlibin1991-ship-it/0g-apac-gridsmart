# GridShare Deployment Guide

## Overview

This directory contains the Foundry deployment scripts for the GridShare project (04-sustainability), consisting of four smart contracts:

1. **EnergyToken** - ERC20 token for P2P energy trading
2. **EnergyNodeRegistry** - ERC721 registry for energy producer/consumer nodes
3. **CarbonCredential** - ERC721 for carbon offset credentials
4. **EnergyMarketplace** - P2P energy trading marketplace

## Deployment Order

The contracts must be deployed in this specific order due to dependencies:

1. **EnergyToken** - Standalone ERC20 (requires initial supply parameter)
2. **EnergyNodeRegistry** - Standalone ERC721 registry
3. **CarbonCredential** - Standalone ERC721 (marketplace will be set as owner)
4. **EnergyMarketplace** - Depends on all three above; receives ownership of Token and Credential

## Constructor Arguments

| Contract | Constructor Args |
|----------|-----------------|
| EnergyToken | `uint256 initialSupply` (e.g., `1000000000 ether` for 1B tokens) |
| EnergyNodeRegistry | None |
| CarbonCredential | None |
| EnergyMarketplace | `address _energyToken`, `address _nodeRegistry`, `address _carbonCredential`, `address initialOwner` |

## Prerequisites

1. Install Foundry if not already installed:
   ```bash
   curl -L https://foundry.paradigm.xyz/foundry.sh | bash
   foundryup
   ```

2. Install dependencies:
   ```bash
   forge install OpenZeppelin/openzeppelin-contracts@v5.2.0
   ```

3. Copy `.env.example` to `.env` and set your `PRIVATE_KEY`:
   ```bash
   cp .env.example .env
   ```

## Deployment Commands

### Local Anvil (Development)
```bash
# Start anvil
anvil

# In another terminal, deploy to anvil
forge script script/Deploy.s.sol --fork-url http://localhost:8545

# Or broadcast to local anvil with the default private key
forge script script/Deploy.s.sol --fork-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Sepolia Testnet
```bash
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify
```

### Mainnet
```bash
forge script script/Deploy.s.sol --rpc-url $ETH_RPC_URL --broadcast --verify -vvvv
```

## Deployment Script Details

The `Deploy.s.sol` script performs the following:

1. Deploys `EnergyToken` with 1 billion initial supply (configurable via `INITIAL_TOKEN_SUPPLY`)
2. Deploys `EnergyNodeRegistry`
3. Deploys `CarbonCredential`
4. Deploys `EnergyMarketplace` with references to all three contracts
5. Transfers ownership of `EnergyToken` and `CarbonCredential` to `EnergyMarketplace` (enabling minting/burning during trades)

## Post-Deployment

After deployment, the contract addresses will be logged. Example output:

```
=== Deployment Complete ===
EnergyToken: 0x...
EnergyNodeRegistry: 0x...
CarbonCredential: 0x...
EnergyMarketplace: 0x...
```

## Contract Verification

To verify contracts on Etherscan after mainnet deployment:

```bash
forge verify-contract <CONTRACT_ADDRESS> --chain-id 1 <CONTRACT_PATH>:<CONTRACT_NAME>
```

## File Structure

```
contracts/
├── script/
│   └── Deploy.s.sol          # Main deployment script
├── contracts/
│   ├── EnergyToken.sol       # ERC20 energy token
│   ├── EnergyNodeRegistry.sol # Node registry (ERC721)
│   ├── CarbonCredential.sol  # Carbon credentials (ERC721)
│   └── EnergyMarketplace.sol # P2P marketplace
├── foundry.toml              # Foundry configuration
├── .env.example              # Environment variables template
└── README_DEPLOY.md          # This file
```
