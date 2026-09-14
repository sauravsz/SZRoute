"use client";

import React, { useState } from "react";
import { Copy, Check, Sun, Moon, Command } from "lucide-react";

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
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Navbar({
  activeTab,
  onTabChange,
  onOpenCommandPalette,
  isDark,
  onToggleTheme,
}: NavbarProps) {
  const [copied, setCopied] = useState(false);

  const copyEndpointUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://szroute.vercel.app";
    navigator.clipboard.writeText(`${origin}/v1`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: Array<{ id: NavTab; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "providers", label: "Providers" },
    { id: "combos", label: "Combos" },
    { id: "studio", label: "Studio" },
    { id: "compression", label: "RTK" },
    { id: "inspector", label: "Logs" },
    { id: "setup", label: "Setup" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-card/85 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Minimal Wordmark with Lime Dot */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onTabChange("overview")}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center font-black text-ink text-xs shadow-xs group-hover:scale-105 transition-transform">
              SZ
            </div>
            <span className="font-black text-ink tracking-tight text-[17px]">
              SZRoute<span className="text-primary font-black">.</span>
            </span>
          </button>
        </div>

        {/* Center: Minimal Segmented Nav Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-subtle p-1 rounded-full border border-border-subtle">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3.5 py-1 text-[13px] font-bold rounded-full transition-all ${
                  isActive
                    ? "bg-ink text-card shadow-xs"
                    : "text-ink-body hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Theme Toggle + Commands + Copy Endpoint CTA */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full text-ink-body hover:text-ink hover:bg-subtle transition-colors"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-ink" />}
          </button>

          {/* Command Palette Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-bold text-ink-body hover:text-ink bg-subtle rounded-full hover:bg-subtle-hover transition-colors"
            title="Open Commands (⌘K)"
          >
            <Command className="w-3.5 h-3.5" />
            <span>⌘K</span>
          </button>

          {/* Copy Base Endpoint */}
          <button
            onClick={copyEndpointUrl}
            className="btn-primary text-[13px] h-9 px-3.5"
            title="Copy /v1 Endpoint"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy /v1"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
