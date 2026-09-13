import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SZRoute — The Free AI Gateway & Multi-Provider Router",
  description:
    "Unified AI router with 160+ providers, 50+ free tiers, RTK+Caveman token compression, auto-fallback, and Raycast developer UI. Deployable to Vercel.",
  keywords: [
    "ai router",
    "free ai gateway",
    "openai proxy",
    "claude code proxy",
    "token compression",
    "rtk compression",
    "gemini free tier",
    "groq api",
    "cerebras fast inference",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#07080a] text-[#cdcdcd] antialiased min-h-screen selection:bg-white/20 selection:text-white">
        {children}
      </body>
    </html>
  );
}
