"use client";

import React, { useState } from "react";
import { Zap, Command, Copy, Check, Terminal, Sparkles } from "lucide-react";

export type NavTab =
  | "overview"
  | "providers"
  | "combos"
  | "studio"
  | "compression"
  | "inspector"
  | "setup";

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenCommandPalette: () => void;
}

export function Navbar({ activeTab, onTabChange, onOpenCommandPalette }: NavbarProps) {
  const [copied, setCopied] = useState(false);

  const copyEndpointUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://szroute.vercel.app";
    navigator.clipboard.writeText(`${origin}/v1`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: Array<{ id: NavTab; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "providers", label: "Providers & Keys" },
    { id: "combos", label: "Combos & Fallbacks" },
    { id: "studio", label: "AI Studio" },
    { id: "compression", label: "RTK Compression" },
    { id: "inspector", label: "Traffic Inspector" },
    { id: "setup", label: "Setup Guides" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#ffffff]/95 backdrop-blur-md border-b border-[#e8ebe6]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand Wordmark with Lime Dot */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => onTabChange("overview")}
          >
            <div className="w-8 h-8 rounded-full bg-[#9fe870] flex items-center justify-center font-black text-[#0e0f0c] text-sm shadow-sm group-hover:scale-105 transition-transform">
              SZ
            </div>
            <span className="font-black text-[#0e0f0c] tracking-tight text-[18px]">
              SZRoute<span className="text-[#2ead4b]">.</span>
            </span>
          </div>

          <span className="hidden sm:inline-block px-2.5 py-0.5 text-[12px] font-semibold bg-[#e8ebe6] text-[#0e0f0c] rounded-full">
            Edge Gateway
          </span>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#e2f6d5] text-[#054d28] text-[12px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#2ead4b] animate-pulse" />
            160+ Providers Online
          </div>
        </div>

        {/* Center: Segmented Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-[#e8ebe6] p-1 rounded-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3.5 py-1.5 text-[13px] font-semibold rounded-full transition-all ${
                  isActive
                    ? "bg-[#0e0f0c] text-[#ffffff] shadow-sm"
                    : "text-[#454745] hover:text-[#0e0f0c]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Command Palette & Primary Lime CTA Pill */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold bg-[#e8ebe6] hover:bg-[#dbe0d7] text-[#0e0f0c] rounded-full transition-colors"
            title="Open Command Palette (⌘K or /)"
          >
            <Command className="w-3.5 h-3.5 text-[#454745]" />
            <span className="hidden sm:inline">Commands</span>
            <span className="px-1.5 py-0.5 text-[10px] bg-[#ffffff] text-[#0e0f0c] rounded font-mono font-bold">⌘K</span>
          </button>

          <button
            onClick={copyEndpointUrl}
            className="btn-primary text-[14px] flex items-center gap-1.5"
            title="Copy your Gateway Endpoint URL"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Endpoint</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
