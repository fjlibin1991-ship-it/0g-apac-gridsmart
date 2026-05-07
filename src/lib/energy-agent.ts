/**
 * Energy Routing AI Agent — GridShare
 * Uses 0G Compute Network for:
 *   - Energy production forecasting (weather + historical)
 *   - Dynamic price optimization
 *   - Demand-side routing optimization
 */

import { ComputeClient } from "@0g/compute-sdk";

const COMPUTE_RPC = process.env.NEXT_PUBLIC_0G_COMPUTE_RPC || "https://compute-testnet.0g.ai";

export interface ProductionForecast {
  nodeId: string;
  hour: number;       // 0-23
  kwhEstimate: number;
  confidence: number; // 0-1
}

export interface PriceRecommendation {
  nodeId: string;
  suggestedPricePerKwh: number;
  basis: "surplus" | "shortage" | "balanced";
  reason: string;
}

/**
 * Forecast energy production for a node based on weather + historical data
 * This calls the 0G Compute Network which runs the forecasting model
 */
export async function forecastProduction(
  nodeId: string,
  energyType: "solar" | "wind" | "battery",
  location: string
): Promise<ProductionForecast[]> {
  const client = new ComputeClient(COMPUTE_RPC);

  const prompt = `
You are an energy production forecasting agent for GridShare.
Given:
  - Node ID: ${nodeId}
  - Energy type: ${energyType}
  - Location: ${location}
  - Current hour (UTC): ${new Date().getUTCHours()}
  - Day of year: ${Math.floor((Date.now() / 86400000) % 365)}

Estimate hourly production (kWh) for the next 24 hours.
Return a JSON array of {hour, kwhEstimate, confidence} for hours 0-23.
Production peaks for solar at midday, wind is variable, battery is evening peak.
Return ONLY valid JSON, no markdown.
`.trim();

  const response = await client.inference({
    model: "energy-forecast-v1",
    prompt,
    max_tokens: 1024,
  });

  try {
    const text = response.choices?.[0]?.text || response.text || "[]";
    return JSON.parse(text.trim()) as ProductionForecast[];
  } catch {
    // Fallback: simple cosine model for solar
    const forecasts: ProductionForecast[] = [];
    const peakHour = 12;
    for (let h = 0; h < 24; h++) {
      const dist = Math.abs(h - peakHour);
      const factor = Math.max(0, 1 - dist / 6);
      forecasts.push({ nodeId, hour: h, kwhEstimate: factor * 10, confidence: 0.6 });
    }
    return forecasts;
  }
}

/**
 * Optimize price based on supply/demand balance
 */
export async function recommendPrice(
  nodeId: string,
  availableKwh: number,
  demandScore: number // 0-1, how much demand exists
): Promise<PriceRecommendation> {
  const client = new ComputeClient(COMPUTE_RPC);

  const prompt = `
GridShare dynamic pricing agent.
Available energy: ${availableKwh} kWh
Demand score: ${demandScore} (0=none, 1=very high)
Current market baseline: $0.12/kWh

Suggest a price per kWh and explain in one sentence.
Return JSON: {"pricePerKwh": number, "basis": "surplus"|"shortage"|"balanced", "reason": "..."}
Return ONLY valid JSON.
`.trim();

  const response = await client.inference({
    model: "price-optimizer-v1",
    prompt,
    max_tokens: 256,
  });

  try {
    const text = response.choices?.[0]?.text || response.text || "{}";
    return JSON.parse(text.trim()) as PriceRecommendation;
  } catch {
    // Fallback pricing logic
    if (demandScore < 0.3) {
      return { nodeId, suggestedPricePerKwh: 0.08, basis: "surplus", reason: "Low demand — discount to attract buyers" };
    } else if (demandScore > 0.7) {
      return { nodeId, suggestedPricePerKwh: 0.18, basis: "shortage", reason: "High demand — premium pricing" };
    }
    return { nodeId, suggestedPricePerKwh: 0.12, basis: "balanced", reason: "Market rate" };
  }
}
