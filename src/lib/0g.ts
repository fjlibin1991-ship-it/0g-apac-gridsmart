/**
 * 0G Storage Integration — GridShare
 * Uses 0G Storage SDK for:
 *   - KV layer: real-time energy availability and pricing
 *   - Log layer: immutable production ledger (carbon provenance)
 */

import { StorageClient } from "@0g/storage-sdk";

const STORAGE_RPC = process.env.NEXT_PUBLIC_0G_STORAGE_RPC || "https://rpc-testnet.0g.ai";
const STORAGE_CONTRACT = process.env.NEXT_PUBLIC_0G_STORAGE_CONTRACT || "0x...";

// ---------------------------------------------------------------------------
// KV Layer — Real-time energy availability and pricing
// ---------------------------------------------------------------------------

export interface EnergyListing {
  listingId: string;  // bytes32 as hex string
  nodeId: string;
  producer: string;
  energyType: "solar" | "wind" | "battery" | "grid";
  availableKwh: number;
  pricePerKwh: number; // in GRD tokens
  totalKwh: number;
  expiresAt: number;  // unix timestamp
  metadataURI?: string;
}

const LISTINGS_PREFIX = "gridshare:listing:";

export async function publishEnergyListing(listing: EnergyListing): Promise<string> {
  const client = new StorageClient(STORAGE_RPC, STORAGE_CONTRACT);
  const key = `${LISTINGS_PREFIX}${listing.nodeId}:${Date.now()}`;
  const value = JSON.stringify(listing);
  // Signer from wagmi/viem walletClient must be passed for write operations
  // Usage: await client.set({ key, value }, { signer: walletClient })
  // For read-only preview, set without signer
  await client.set({ key, value });
  return key;
}
export async function getEnergyListing(key: string): Promise<EnergyListing | null> {
  const client = new StorageClient(STORAGE_RPC, STORAGE_CONTRACT);
  const result = await client.get(key);
  if (!result || !result.value) return null;
  return JSON.parse(result.value) as EnergyListing;
}

export async function getActiveListings(limit = 50): Promise<EnergyListing[]> {
  const client = new StorageClient(STORAGE_RPC, STORAGE_CONTRACT);
  // KV query — list keys with prefix
  const keys = await client.keys(LISTINGS_PREFIX, limit);
  const listings: EnergyListing[] = [];
  for (const key of keys) {
    const listing = await getEnergyListing(key);
    if (listing && listing.expiresAt > Date.now() / 1000) {
      listings.push(listing);
    }
  }
  return listings;
}

// ---------------------------------------------------------------------------
// Log Layer — Immutable production ledger (carbon provenance)
// ---------------------------------------------------------------------------

export interface ProductionLog {
  nodeId: string;
  kwh: number;
  energyType: string;
  sensorId: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

const LOG_KEY = "gridshare:production_log";

export async function appendProductionLog(log: ProductionLog): Promise<void> {
  const client = new StorageClient(STORAGE_RPC, STORAGE_CONTRACT);
  const entry = JSON.stringify({
    ...log,
    appendedAt: Date.now(),
  });
  await client.append(LOG_KEY, entry);
}

export async function getProductionLogs(
  nodeId?: string,
  since?: number,
  limit = 100
): Promise<ProductionLog[]> {
  const client = new StorageClient(STORAGE_RPC, STORAGE_CONTRACT);
  const entries = await client.readLog(LOG_KEY, limit);
  let logs = entries.map((e: string) => JSON.parse(e) as ProductionLog & { appendedAt: number });
  if (nodeId) logs = logs.filter((l) => l.nodeId === nodeId);
  if (since) logs = logs.filter((l) => l.timestamp >= since);
  return logs;
}

// ---------------------------------------------------------------------------
// Agent ID — Energy node identity
// ---------------------------------------------------------------------------

export interface AgentProfile {
  nodeId: string;
  name: string;
  description: string;
  capabilities: string[];
  imageUrl?: string;
}

export async function publishAgentProfile(profile: AgentProfile): Promise<string> {
  const client = new StorageClient(STORAGE_RPC, STORAGE_CONTRACT);
  const key = `agent:${profile.nodeId}`;
  await client.set({ key, value: JSON.stringify(profile) });
  return key;
}

export async function getAgentProfile(nodeId: string): Promise<AgentProfile | null> {
  const client = new StorageClient(STORAGE_RPC, STORAGE_CONTRACT);
  const result = await client.get(`agent:${nodeId}`);
  if (!result || !result.value) return null;
  return JSON.parse(result.value) as AgentProfile;
}
