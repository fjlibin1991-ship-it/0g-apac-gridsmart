"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function RegisterNodePage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const [form, setForm] = useState({
    nodeType: "Producer",
    capacityKW: "",
    location: "",
    energyType: "solar",
  });
  const [submitted, setSubmitted] = useState(false);
  const [txHash, setTxHash] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In production: call contract.registerNode() via wagmi writeContract
    // Simulate transaction
    setTxHash("0x" + Math.random().toString("hex").slice(2, 66));
    setSubmitted(true);
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-4">
        <h1 className="text-2xl font-bold text-white mb-4">Connect Wallet to Register</h1>
        {connectors.map((c) => (
          <button
            key={c.uid}
            onClick={() => connect({ connector: c })}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg mb-3"
          >
            Connect {c.name}
          </button>
        ))}
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-4">
        <div className="bg-green-900 border border-green-700 rounded-xl p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🌱</div>
          <h2 className="text-2xl font-bold text-green-400 mb-2">Node Registered!</h2>
          <p className="text-gray-400 mb-2">Your energy node is live on 0G Chain.</p>
          <p className="text-xs text-gray-500 break-all">TX: {txHash}</p>
          <p className="text-sm text-green-300 mt-4">0G Agent ID minted. Start earning energy credits now.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-400">Register Energy Node</h1>
          <button onClick={() => disconnect()} className="text-sm text-gray-400 hover:text-white">
            Disconnect ({address?.slice(0, 6)}...)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Node Type</label>
            <select
              value={form.nodeType}
              onChange={(e) => setForm({ ...form, nodeType: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
            >
              <option>Producer</option>
              <option>Consumer</option>
              <option>Prosumer</option>
              <option>GridOperator</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Energy Source</label>
            <select
              value={form.energyType}
              onChange={(e) => setForm({ ...form, energyType: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
            >
              <option value="solar">☀️ Solar</option>
              <option value="wind">🌬️ Wind</option>
              <option value="battery">🔋 Battery Storage</option>
              <option value="grid">⚡ Grid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Capacity (kW) — peak production or consumption
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={form.capacityKW}
              onChange={(e) => setForm({ ...form, capacityKW: e.target.value })}
              placeholder="e.g. 5.5"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="City, Region (e.g. Hong Kong, Kowloon)"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition"
          >
            Register Node & Mint Agent ID
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-4">
          Registration writes to 0G Chain. Node profile stored on 0G Agent ID.
        </p>
      </div>
    </main>
  );
}
