import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SZRoute — Enterprise AI Gateway & Multi-Provider Router for Oh My Pi (omp)",
  description:
    "Measured, high-performance corporate AI Gateway. Connect Oh My Pi (omp), Cursor, Cline, and Codex to 160+ AI providers with 15%–95% RTK compression and failover routing.",
  keywords: [
    "ai gateway",
    "free ai router",
    "omp coding agent",
    "token compression",
    "groq api",
    "cerebras",
    "gemini",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#ffffff] text-[#262626] antialiased min-h-screen selection:bg-[#1c69d4] selection:text-[#ffffff]">
        {children}
      </body>
    </html>
  );
}
