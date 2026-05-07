import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GridShare — Decentralized Energy Trading",
  description: "P2P renewable energy trading powered by 0G DePIN",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 antialiased">{children}</body>
    </html>
  );
}
