"use client";

import React, { useState } from "react";
import {
  Activity,
  Key,
  Layers,
  Sparkles,
  Flame,
  FileText,
  Terminal,
  Copy,
  Check,
  Command,
  Sun,
  Moon,
  Zap,
} from "lucide-react";

export type NavTab =
  | "overview"
  | "providers"
  | "combos"
  | "studio"
  | "compression"
  | "inspector"
  | "setup";

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenCommandPalette: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  onOpenCommandPalette,
  isDark,
  onToggleTheme,
}: SidebarProps) {
  const [copied, setCopied] = useState(false);

  const copyEndpointUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://szroute.vercel.app";
    navigator.clipboard.writeText(`${origin}/v1`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    color: string;
    badge?: string;
  }> = [
    {
      id: "overview",
      label: "Overview",
      icon: <Activity className="w-4 h-4" />,
      color: "bg-[#007AFF] text-white",
    },
    {
      id: "providers",
      label: "Providers & Keys",
      icon: <Key className="w-4 h-4" />,
      color: "bg-[#FF9500] text-white",
      badge: "160+",
    },
    {
      id: "combos",
      label: "Virtual Combos",
      icon: <Layers className="w-4 h-4" />,
      color: "bg-[#34C759] text-white",
      badge: "Auto",
    },
    {
      id: "studio",
      label: "AI Chat Studio",
      icon: <Sparkles className="w-4 h-4" />,
      color: "bg-[#AF52DE] text-white",
    },
    {
      id: "compression",
      label: "RTK Compression",
      icon: <Flame className="w-4 h-4" />,
      color: "bg-[#FF3B30] text-white",
      badge: "-95%",
    },
    {
      id: "inspector",
      label: "Telemetry Logs",
      icon: <FileText className="w-4 h-4" />,
      color: "bg-[#5AC8FA] text-white",
    },
    {
      id: "setup",
      label: "omp Integration",
      icon: <Terminal className="w-4 h-4" />,
      color: "bg-[#5856D6] text-white",
    },
  ];

  return (
    <aside className="w-64 apple-glass border-r border-[var(--separator)] flex flex-col justify-between h-screen sticky top-0 flex-shrink-0 z-30 select-none transition-all">
      {/* Top App Identity */}
      <div>
        <div className="p-4 border-b border-[var(--separator)] flex items-center justify-between">
          <button
            onClick={() => onTabChange("overview")}
            className="flex items-center gap-3 text-left group cursor-pointer active:scale-95 transition-transform"
          >
            {/* Apple macOS App Squircle Icon */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#007AFF] to-[#5856D6] flex items-center justify-center p-0.5 shadow-md group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>

            <div className="flex flex-col">
              <span className="font-bold text-[15px] tracking-tight text-[var(--label-primary)]">
                SZRoute
              </span>
              <span className="text-[11px] font-medium text-[var(--label-secondary)]">
                AI Gateway for omp
              </span>
            </div>
          </button>

          {/* Theme Switcher Toggle */}
          <button
            onClick={onToggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle-hover)] active:scale-90 transition-all text-[var(--label-primary)]"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-[#FFD60A]" /> : <Moon className="w-4 h-4 text-[#007AFF]" />}
          </button>
        </div>

        {/* SwiftUI Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer text-left active:scale-[0.98] ${
                  isActive
                    ? "bg-[var(--system-blue)] text-white shadow-sm font-semibold"
                    : "text-[var(--label-primary)] hover:bg-[var(--bg-subtle)]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shadow-2xs transition-transform ${
                      isActive ? "bg-white/20 text-white" : item.color
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold transition-colors ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-[var(--bg-subtle)] text-[var(--label-secondary)]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions & Status */}
      <div className="p-3 border-t border-[var(--separator)] space-y-2 bg-[var(--bg-subtle)]/30 rounded-b-2xl">
        {/* Command Palette Trigger Button */}
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-2 text-[12px] font-medium text-[var(--label-primary)] bg-[var(--bg-card)] rounded-xl border border-[var(--separator)] hover:border-[var(--system-blue)] active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Command className="w-3.5 h-3.5 text-[var(--system-blue)]" />
            <span>Search Commands</span>
          </div>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[var(--label-secondary)]">⌘K</span>
        </button>

        {/* Copy Gateway Endpoint Capsule Button */}
        <button
          onClick={copyEndpointUrl}
          className="w-full btn-apple-primary text-[13px] h-10 cursor-pointer shadow-sm"
        >
          {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
          <span>{copied ? "Endpoint Copied!" : "Copy /v1 Endpoint"}</span>
        </button>

        {/* Live Status Pill */}
        <div className="flex items-center justify-between text-[11px] text-[var(--label-secondary)] px-1 pt-1">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-[var(--system-green)] animate-pulse" />
            <span>160+ Providers Online</span>
          </span>
          <span className="font-mono text-[10px]">v4.0 Edge</span>
        </div>
      </div>
    </aside>
  );
}
