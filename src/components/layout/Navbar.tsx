"use client";

import React, { useState } from "react";
import { Copy, Check, Command, ShieldCheck } from "lucide-react";

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
    { id: "overview", label: "OVERVIEW" },
    { id: "providers", label: "PROVIDERS" },
    { id: "combos", label: "COMBOS" },
    { id: "studio", label: "AI STUDIO" },
    { id: "compression", label: "RTK COMPRESSION" },
    { id: "inspector", label: "TELEMETRY" },
    { id: "setup", label: "INTEGRATION" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#ffffff] border-b border-[#e6e6e6]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        {/* Left: Brand Circular Badge + Wordmark */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onTabChange("overview")}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            {/* BMW-inspired Bavarian Circular Emblem */}
            <div className="w-8 h-8 rounded-full border-2 border-[#1c69d4] bg-[#ffffff] flex items-center justify-center p-0.5 shadow-xs">
              <div className="w-full h-full rounded-full grid grid-cols-2 grid-rows-2 overflow-hidden">
                <div className="bg-[#1c69d4]" />
                <div className="bg-[#ffffff]" />
                <div className="bg-[#ffffff]" />
                <div className="bg-[#1c69d4]" />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="font-bold text-[#262626] tracking-tight text-[17px] leading-tight">
                SZRoute
              </span>
              <span className="text-[10px] uppercase font-bold tracking-[1.5px] text-[#6b6b6b]">
                Edge Gateway
              </span>
            </div>
          </button>
        </div>

        {/* Center: Category Tabs with 2px Underline Active Indicator */}
        <nav className="hidden lg:flex items-center gap-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-5 text-[12px] font-bold tracking-[1.5px] uppercase transition-colors relative cursor-pointer ${
                  isActive
                    ? "text-[#1c69d4]"
                    : "text-[#6b6b6b] hover:text-[#262626]"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1c69d4]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Search / Command + Rectangular 0px Blue Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-[12px] font-bold text-[#262626] hover:text-[#1c69d4] bg-[#f7f7f7] hover:bg-[#ebebeb] transition-colors cursor-pointer border border-[#e6e6e6]"
            title="Open Command Center (⌘K)"
          >
            <Command className="w-3.5 h-3.5" />
            <span className="tracking-[1px] text-[11px] uppercase">Search</span>
            <span className="text-[10px] font-mono px-1 py-0.2 bg-[#ffffff] border border-[#cccccc]">⌘K</span>
          </button>

          <button
            onClick={copyEndpointUrl}
            className="btn-primary text-[12px] h-10 px-5 cursor-pointer uppercase tracking-[1px]"
            title="Copy /v1 Endpoint for Oh My Pi"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "COPIED" : "COPY /v1"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
