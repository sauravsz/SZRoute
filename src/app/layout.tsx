import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SZRoute — Universal AI Gateway for Oh My Pi (omp)",
  description:
    "Free AI Gateway & Router. Connect Oh My Pi (omp), Cursor, Cline, and Codex to 160+ AI providers (50+ free tiers) with 15%–95% RTK token compression and auto-failover.",
  keywords: [
    "ai gateway",
    "free ai router",
    "omp coding agent",
    "oh my pi gateway",
    "token compression",
    "rtk compression",
    "groq api",
    "cerebras wafer scale",
    "gemini free tier",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#e8ebe6] text-[#0e0f0c] antialiased min-h-screen selection:bg-[#9fe870] selection:text-[#0e0f0c]">
        {children}
      </body>
    </html>
  );
}
