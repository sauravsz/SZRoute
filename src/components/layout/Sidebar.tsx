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
      color: "from-[#007AFF] to-[#32ADE6]",
    },
    {
      id: "providers",
      label: "Providers & Keys",
      icon: <Key className="w-4 h-4" />,
      color: "from-[#FF9500] to-[#FFCC00]",
      badge: "160+",
    },
    {
      id: "combos",
      label: "Virtual Combos",
      icon: <Layers className="w-4 h-4" />,
      color: "from-[#34C759] to-[#30D158]",
      badge: "Auto",
    },
    {
      id: "studio",
      label: "AI Chat Studio",
      icon: <Sparkles className="w-4 h-4" />,
      color: "from-[#AF52DE] to-[#5856D6]",
    },
    {
      id: "compression",
      label: "RTK Compression",
      icon: <Flame className="w-4 h-4" />,
      color: "from-[#FF3B30] to-[#FF2D55]",
      badge: "-95%",
    },
    {
      id: "inspector",
      label: "Telemetry Logs",
      icon: <FileText className="w-4 h-4" />,
      color: "from-[#5AC8FA] to-[#007AFF]",
    },
    {
      id: "setup",
      label: "omp Integration",
      icon: <Terminal className="w-4 h-4" />,
      color: "from-[#5856D6] to-[#AF52DE]",
    },
  ];

  return (
    <aside className="w-64 liquid-glass flex flex-col justify-between h-[calc(100vh-2rem)] sticky top-4 my-4 ml-4 flex-shrink-0 z-30 select-none shadow-liquid-glass">
      {/* Top App Identity */}
      <div>
        <div className="p-4 border-b border-[var(--glass-border-subtle)] flex items-center justify-between">
          <button
            onClick={() => onTabChange("overview")}
            className="flex items-center gap-3 text-left group cursor-pointer active:scale-95 transition-transform"
          >
            {/* Liquid Glass Orb Logo */}
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#007AFF] via-[#5856D6] to-[#AF52DE] flex items-center justify-center p-0.5 shadow-lg border border-white/40 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-white fill-white drop-shadow-xs" />
            </div>

            <div className="flex flex-col">
              <span className="font-extrabold text-[15px] tracking-tight text-[var(--text-primary)]">
                SZRoute
              </span>
              <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                Liquid AI Gateway
              </span>
            </div>
          </button>

          {/* Theme Switcher Capsule */}
          <button
            onClick={onToggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--glass-surface-subtle)] hover:bg-[var(--glass-surface-elevated)] border border-[var(--glass-border-subtle)] active:scale-90 transition-all text-[var(--text-primary)] shadow-xs"
            title={isDark ? "Switch to Light Glass" : "Switch to Dark Glass"}
          >
            {isDark ? <Sun className="w-4 h-4 text-[#FFD60A]" /> : <Moon className="w-4 h-4 text-[#007AFF]" />}
          </button>
        </div>

        {/* Liquid Navigation List */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-semibold transition-all duration-200 cursor-pointer text-left active:scale-[0.97] ${
                  isActive
                    ? "bg-gradient-to-r from-[#007AFF] to-[#5856D6] text-white shadow-md shadow-blue-500/25 border border-white/30"
                    : "text-[var(--text-primary)] hover:bg-[var(--glass-surface-subtle)] hover:border-[var(--glass-border-subtle)] border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shadow-xs transition-transform ${
                      isActive
                        ? "bg-white/25 text-white"
                        : `bg-gradient-to-tr ${item.color} text-white`
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
                        ? "bg-white/25 text-white border border-white/30"
                        : "bg-[var(--glass-surface-subtle)] text-[var(--text-secondary)] border border-[var(--glass-border-subtle)]"
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

      {/* Bottom Actions & Glass Status */}
      <div className="p-3.5 border-t border-[var(--glass-border-subtle)] space-y-2.5 bg-[var(--glass-surface-subtle)]/40 rounded-b-[28px]">
        {/* Spotlight Command Search Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-2 text-[12px] font-semibold text-[var(--text-primary)] bg-[var(--glass-surface)] rounded-2xl border border-[var(--glass-border)] hover:border-[#007AFF]/50 active:scale-[0.97] transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Command className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>Spotlight Search</span>
          </div>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-lg bg-[var(--glass-surface-subtle)] text-[var(--text-secondary)] border border-[var(--glass-border-subtle)]">⌘K</span>
        </button>

        {/* Liquid Primary Copy Endpoint Button */}
        <button
          onClick={copyEndpointUrl}
          className="w-full btn-liquid-primary text-[13px] h-10 cursor-pointer shadow-md"
        >
          {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
          <span>{copied ? "Endpoint Copied!" : "Copy /v1 Endpoint"}</span>
        </button>

        {/* Real-time Edge Status Pill */}
        <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] px-1 pt-0.5">
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse shadow-xs" />
            <span>160+ Online</span>
          </span>
          <span className="font-mono text-[10px] font-bold">Edge Liquid v4</span>
        </div>
      </div>
    </aside>
  );
}
