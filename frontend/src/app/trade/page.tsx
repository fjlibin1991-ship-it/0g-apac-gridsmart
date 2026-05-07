"use client";

import { useEffect, useState } from "react";
import { getActiveListings } from "../../../../src/lib/0g";
import type { EnergyListing } from "../../../../src/lib/0g";

export default function TradePage() {
  const [listings, setListings] = useState<EnergyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "solar" | "wind" | "battery">("all");

  useEffect(() => {
    getActiveListings(50)
      .then(setListings)
      .catch(() => setListings(mockListings))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? listings : listings.filter((l) => l.energyType === filter);

  const mockListings: EnergyListing[] = [
    { nodeId: "0x123", producer: "0xabc...", energyType: "solar", availableKwh: 12.5, pricePerKwh: 0.09, expiresAt: Date.now() / 1000 + 3600 },
    { nodeId: "0x456", producer: "0xdef...", energyType: "wind", availableKwh: 8.2, pricePerKwh: 0.11, expiresAt: Date.now() / 1000 + 7200 },
    { nodeId: "0x789", producer: "0xghi...", energyType: "solar", availableKwh: 20.0, pricePerKwh: 0.08, expiresAt: Date.now() / 1000 + 1800 },
  ];

  return (
    <main className="min-h-screen bg-gray-950 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-400 mb-2">Energy Marketplace</h1>
        <p className="text-gray-400 mb-8">Buy renewable energy directly from neighbors.</p>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {(["all", "solar", "wind", "battery"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm ${
                filter === f ? "bg-green-700 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {f === "all" ? "🌐 All" : f === "solar" ? "☀️ Solar" : f === "wind" ? "🌬️ Wind" : "🔋 Battery"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading listings from 0G Storage...</div>
        ) : (
          <div className="space-y-4">
            {filtered.length === 0 && (
              <div className="text-center py-20 text-gray-600">No active listings. Be the first to sell!</div>
            )}
            {filtered.map((listing) => (
              <div key={listing.nodeId} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">
                      {listing.energyType === "solar" ? "☀️" : listing.energyType === "wind" ? "🌬️" : "🔋"}
                    </span>
                    <span className="font-semibold text-white">{listing.energyType.toUpperCase()}</span>
                    <span className="text-xs text-gray-500">Node {listing.nodeId.slice(0, 8)}</span>
                  </div>
                  <div className="text-sm text-gray-400">{listing.availableKwh} kWh available</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">${listing.pricePerKwh.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">per kWh</div>
                  <button className="mt-2 px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition">
                    Buy Energy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
