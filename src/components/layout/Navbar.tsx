"use client";

import React from "react";
import { Sparkles, Command, Copy, Check, Terminal, Zap } from "lucide-react";
import { useState } from "react";

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
    const origin = typeof window !== "undefined" ? window.location.origin : "https://szroute.online";
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
    <header className="sticky top-0 z-40 w-full bg-[#07080a]/90 backdrop-blur-md border-b border-[#242728]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Left: Brand Wordmark & Version */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onTabChange("overview")}>
            <div className="w-7 h-7 rounded-md bg-[#121212] border border-[#242728] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#ff6161]" />
            </div>
            <span className="font-semibold text-white tracking-tight text-[15px]">
              SZRoute
            </span>
          </div>
          <span className="px-1.5 py-0.5 text-[11px] font-medium bg-[#101111] text-[#9c9c9d] border border-[#242728] rounded">
            v4.0 Edge
          </span>
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#59d499]/10 border border-[#59d499]/20 text-[#59d499] text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#59d499] animate-pulse" />
            160+ Providers Online
          </div>
        </div>

        {/* Center: Segmented Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0d0d0d] p-1 border border-[#242728] rounded-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-1 text-[13px] font-medium rounded-full transition-colors ${
                  isActive
                    ? "bg-[#101111] text-white shadow-sm border border-[#242728]"
                    : "text-[#cdcdcd] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Command Palette & Primary White CTA Pill */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-2.5 py-1 text-[12px] bg-[#101111] hover:bg-[#121212] text-[#cdcdcd] hover:text-white border border-[#242728] rounded-md transition-colors"
            title="Open Command Palette (⌘K)"
          >
            <Command className="w-3.5 h-3.5 text-[#9c9c9d]" />
            <span className="hidden sm:inline">Commands</span>
            <span className="keycap">⌘K</span>
          </button>

          <button
            onClick={copyEndpointUrl}
            className="btn-primary flex items-center gap-1.5"
            title="Copy your Gateway Endpoint URL"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Endpoint</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
