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
  ChevronRight,
  ShieldCheck,
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
}

export function Sidebar({ activeTab, onTabChange, onOpenCommandPalette }: SidebarProps) {
  const [copied, setCopied] = useState(false);

  const copyEndpointUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://szroute.vercel.app";
    navigator.clipboard.writeText(`${origin}/v1`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode; badge?: string }> = [
    {
      id: "overview",
      label: "OVERVIEW",
      icon: <Activity className="w-4 h-4" />,
    },
    {
      id: "providers",
      label: "PROVIDERS & KEYS",
      icon: <Key className="w-4 h-4" />,
      badge: "160+",
    },
    {
      id: "combos",
      label: "VIRTUAL COMBOS",
      icon: <Layers className="w-4 h-4" />,
      badge: "AUTO",
    },
    {
      id: "studio",
      label: "AI CHAT STUDIO",
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: "compression",
      label: "RTK COMPRESSION",
      icon: <Flame className="w-4 h-4 text-[#e22718]" />,
      badge: "-95%",
    },
    {
      id: "inspector",
      label: "TELEMETRY LOGS",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "setup",
      label: "omp INTEGRATION",
      icon: <Terminal className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-[#ffffff] border-r border-[#e6e6e6] flex flex-col justify-between h-screen sticky top-0 flex-shrink-0 z-30 select-none">
      {/* Top Brand Header */}
      <div>
        <div className="p-5 border-b border-[#e6e6e6] flex items-center justify-between">
          <button
            onClick={() => onTabChange("overview")}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            {/* Bavarian Roundel */}
            <div className="w-8 h-8 rounded-full border-2 border-[#1c69d4] bg-[#ffffff] flex items-center justify-center p-0.5 shadow-xs flex-shrink-0">
              <div className="w-full h-full rounded-full grid grid-cols-2 grid-rows-2 overflow-hidden">
                <div className="bg-[#1c69d4]" />
                <div className="bg-[#ffffff]" />
                <div className="bg-[#ffffff]" />
                <div className="bg-[#1c69d4]" />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="font-bold text-[#262626] text-[16px] tracking-tight leading-tight">
                SZRoute
              </span>
              <span className="text-[10px] uppercase font-bold tracking-[1.5px] text-[#6b6b6b]">
                Enterprise Gateway
              </span>
            </div>
          </button>
        </div>

        {/* Vertical Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-[12px] font-bold tracking-[1.5px] uppercase transition-all cursor-pointer text-left border-l-2 ${
                  isActive
                    ? "bg-[#f7f7f7] text-[#1c69d4] border-[#1c69d4]"
                    : "text-[#6b6b6b] hover:text-[#262626] hover:bg-[#fafafa] border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-[#1c69d4]" : "text-[#6b6b6b]"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 uppercase font-bold border ${
                      isActive
                        ? "bg-[#1c69d4] text-[#ffffff] border-[#1c69d4]"
                        : "bg-[#f7f7f7] text-[#6b6b6b] border-[#e6e6e6]"
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
      <div className="p-4 border-t border-[#e6e6e6] space-y-3 bg-[#fafafa]">
        {/* Command Palette Button */}
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold text-[#262626] uppercase tracking-[1px] bg-[#ffffff] border border-[#cccccc] hover:border-[#262626] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Command className="w-3.5 h-3.5 text-[#1c69d4]" />
            <span>Search</span>
          </div>
          <span className="font-mono text-[10px] px-1 bg-[#f7f7f7] border border-[#e6e6e6]">⌘K</span>
        </button>

        {/* Copy Gateway Endpoint Button */}
        <button
          onClick={copyEndpointUrl}
          className="w-full btn-primary h-10 text-[11px] uppercase tracking-[1px] flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "COPIED" : "COPY /v1 ENDPOINT"}</span>
        </button>

        {/* Live Status Pill */}
        <div className="flex items-center justify-between text-[11px] text-[#6b6b6b] pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="font-bold text-[#262626]">Edge Active</span>
          </span>
          <span className="font-mono text-[10px]">v4.0.0</span>
        </div>

        {/* M-Tricolor Stripe Accent */}
        <div className="m-stripe-divider -mx-4 -mb-4 mt-2" />
      </div>
    </aside>
  );
}
