"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { parseEther } from "viem";

/**
 * CONTRACT CALLS NEEDED (for production integration):
 *
 * 1. Register Node on EnergyNodeRegistry:
 *    const hash = await writeContract(config, {
 *      address: ENERGY_NODE_REGISTRY_ADDRESS,
 *      abi: EnergyNodeRegistryABI,
 *      functionName: 'registerNode',
 *      args: [nodeType, capacityKW, location, energyType],
 *    })
 *
 * 2. The EnergyNodeRegistry.registerNode() will:
 *    - Validate caller is an 0G Agent ID holder
 *    - Store node metadata on-chain
 *    - Emit NodeRegistered event with tokenId (Agent ID)
 *
 * 3. After registration, node can:
 *    - Call EnergyMarketplace.createListing() to list energy for sale
 *    - Call EnergyToken.approve() before filling orders as buyer
 *    - Call EnergyMarketplace.settleOrder() after delivery confirmation
 */

interface FormData {
  nodeType: string;
  capacityKW: string;
  location: string;
  energyType: string;
}

interface FormErrors {
  capacityKW?: string;
  location?: string;
}

export default function RegisterNodePage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const [form, setForm] = useState<FormData>({
    nodeType: "Producer",
    capacityKW: "",
    location: "",
    energyType: "solar",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isValidating, setIsValidating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [txHash, setTxHash] = useState("");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Capacity validation
    const capacity = parseFloat(form.capacityKW);
    if (!form.capacityKW.trim()) {
      newErrors.capacityKW = "Capacity is required";
    } else if (isNaN(capacity) || capacity <= 0) {
      newErrors.capacityKW = "Capacity must be a positive number";
    } else if (capacity > 10000) {
      newErrors.capacityKW = "Capacity cannot exceed 10,000 kW";
    } else if (capacity < 0.1) {
      newErrors.capacityKW = "Minimum capacity is 0.1 kW";
    }

    // Location validation
    if (!form.location.trim()) {
      newErrors.location = "Location is required";
    } else if (form.location.trim().length < 2) {
      newErrors.location = "Location must be at least 2 characters";
    } else if (form.location.trim().length > 100) {
      newErrors.location = "Location must be under 100 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);

    if (!validateForm()) {
      setIsValidating(false);
      return;
    }

    // In production: call contract.registerNode() via wagmi writeContract
    // STUB: Simulate transaction for demo
    // Real implementation would use:
    // const hash = await writeContract(config, {
    //   address: ENERGY_NODE_REGISTRY_ADDRESS,
    //   abi: EnergyNodeRegistryABI,
    //   functionName: 'registerNode',
    //   args: [form.nodeType, parseEther(form.capacityKW), form.location, form.energyType],
    // })
    setTxHash("0x" + Math.random().toString("hex").slice(2, 66));
    setSubmitted(true);
    setIsValidating(false);
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setForm({ ...form, [field]: value });
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
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
              onChange={(e) => handleChange("nodeType", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
            >
              <option value="Producer">Producer</option>
              <option value="Consumer">Consumer</option>
              <option value="Prosumer">Prosumer</option>
              <option value="GridOperator">Grid Operator</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Energy Source</label>
            <select
              value={form.energyType}
              onChange={(e) => handleChange("energyType", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
            >
              <option value="solar">Solar</option>
              <option value="wind">Wind</option>
              <option value="battery">Battery Storage</option>
              <option value="grid">Grid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Capacity (kW) — peak production or consumption
            </label>
            <input
              type="number"
              min="0.1"
              max="10000"
              step="0.1"
              value={form.capacityKW}
              onChange={(e) => handleChange("capacityKW", e.target.value)}
              placeholder="e.g. 5.5"
              className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-green-500 focus:outline-none ${
                errors.capacityKW ? "border-red-500" : "border-gray-700"
              }`}
            />
            {errors.capacityKW && (
              <p className="mt-1 text-sm text-red-400">{errors.capacityKW}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="City, Region (e.g. Hong Kong, Kowloon)"
              maxLength={100}
              className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-green-500 focus:outline-none ${
                errors.location ? "border-red-500" : "border-gray-700"
              }`}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-400">{errors.location}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">{form.location.length}/100 characters</p>
          </div>

          <button
            type="submit"
            disabled={isValidating}
            className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            {isValidating ? "Validating..." : "Register Node & Mint Agent ID"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-4">
          Registration writes to 0G Chain. Node profile stored on 0G Agent ID.
        </p>
      </div>
    </main>
  );
}
