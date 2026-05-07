"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center bg-gradient-to-b from-green-950 to-gray-950">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold text-green-400 mb-4">GridShare</h1>
          <p className="text-xl text-gray-300 mb-2">
            Decentralized P2P Energy Trading
          </p>
          <p className="text-gray-500 mb-8">
            Sell your solar surplus directly to neighbors. Earn carbon credits.
            Powered by 0G DePIN.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register/node"
              className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition"
            >
              Register Energy Node
            </Link>
            <Link
              href="/trade"
              className="px-6 py-3 border border-green-700 hover:border-green-500 text-green-400 rounded-lg font-medium transition"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 bg-gray-900">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              step: "01",
              title: "Register Your Node",
              desc: "Connect your solar panel or battery. Mint an Agent ID on 0G Chain.",
            },
            {
              step: "02",
              title: "Stream Production Data",
              desc: "IoT sensors write immutable energy logs to 0G Storage (Log layer).",
            },
            {
              step: "03",
              title: "Trade & Earn Credits",
              desc: "Neighbors buy your surplus. AI routes energy. Earn carbon NFTs per kWh.",
            },
          ].map((item) => (
            <div key={item.step} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-4xl font-bold text-green-500 mb-3">{item.step}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live Stats */}
      <section className="px-6 py-16 bg-gray-950 border-t border-gray-800">
        <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
          <div>
            <div className="text-3xl font-bold text-green-400">2,841</div>
            <div className="text-sm text-gray-500">Energy Nodes</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400">12,493</div>
            <div className="text-sm text-gray-500">MWh Traded</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400">6,210</div>
            <div className="text-sm text-gray-500">tCO₂ Offset</div>
          </div>
        </div>
      </section>
    </main>
  );
}
