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
  PanelLeftClose,
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
  onToggleSidebar?: () => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  onOpenCommandPalette,
  isDark,
  onToggleTheme,
  onToggleSidebar,
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
    badge?: string;
  }> = [
    {
      id: "overview",
      label: "Overview",
      icon: <Activity className="w-4 h-4" />,
    },
    {
      id: "providers",
      label: "Providers & Keys",
      icon: <Key className="w-4 h-4" />,
      badge: "160+",
    },
    {
      id: "combos",
      label: "Virtual Combos",
      icon: <Layers className="w-4 h-4" />,
      badge: "Auto",
    },
    {
      id: "studio",
      label: "AI Studio",
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: "compression",
      label: "RTK Compression",
      icon: <Flame className="w-4 h-4 text-[var(--system-red)]" />,
      badge: "-95%",
    },
    {
      id: "inspector",
      label: "Telemetry Logs",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "setup",
      label: "omp Integration",
      icon: <Terminal className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-[var(--glass-surface)] backdrop-blur-xl border-r border-[var(--glass-border)] flex flex-col justify-between h-screen sticky top-0 flex-shrink-0 z-30 select-none transition-all duration-300">
      {/* Top App Identity & Collapse Trigger */}
      <div>
        <div className="p-3.5 border-b border-[var(--glass-border)] flex items-center justify-between">
          <button
            onClick={() => onTabChange("overview")}
            className="flex items-center gap-2.5 text-left group cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#6366F1] flex items-center justify-center p-0.5 shadow-xs">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>

            <div className="flex flex-col">
              <span className="font-bold text-[14px] tracking-tight text-[var(--text-primary)]">
                SZRoute
              </span>
              <span className="text-[11px] font-medium text-[var(--text-tertiary)]">
                Gateway for omp
              </span>
            </div>
          </button>

          <div className="flex items-center gap-1">
            {/* Collapse Sidebar Button (⌘B) */}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-surface-subtle)] active:scale-90 transition-all cursor-pointer"
                title="Toggle Sidebar (⌘B)"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}

            {/* Theme Switcher Toggle */}
            <button
              onClick={onToggleTheme}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-surface-subtle)] active:scale-90 transition-all cursor-pointer"
              title={isDark ? "Light Mode" : "Dark Mode"}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-[#F59E0B]" /> : <Moon className="w-3.5 h-3.5 text-[#2563EB]" />}
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 cursor-pointer text-left active:scale-[0.98] ${
                  isActive
                    ? "bg-[var(--glass-surface-elevated)] text-[var(--text-primary)] border border-[var(--glass-border)] shadow-xs font-semibold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-surface-subtle)]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-semibold transition-colors ${
                      isActive
                        ? "bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)]"
                        : "bg-[var(--glass-surface-subtle)] text-[var(--text-tertiary)]"
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
      <div className="p-3 border-t border-[var(--glass-border)] space-y-2 bg-[var(--glass-surface-subtle)]/40 rounded-b-2xl">
        {/* Command Palette Trigger Button */}
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 text-[12px] font-medium text-[var(--text-primary)] bg-[var(--glass-surface)] rounded-xl border border-[var(--glass-border)] hover:border-[var(--accent)] active:scale-[0.98] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Command className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Search</span>
          </div>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--glass-surface-subtle)] text-[var(--text-tertiary)]">⌘K</span>
        </button>

        {/* Copy Gateway Endpoint Capsule Button */}
        <button
          onClick={copyEndpointUrl}
          className="w-full btn-liquid-secondary text-[12px] h-9 cursor-pointer justify-center font-semibold"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[var(--system-green)]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied!" : "Copy /v1 Endpoint"}</span>
        </button>

        {/* Live Status Pill */}
        <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)] px-1 pt-0.5">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--system-green)] animate-pulse" />
            <span>160+ Online</span>
          </span>
          <span className="font-mono text-[10px] text-[var(--text-tertiary)]">⌘B toggle</span>
        </div>
      </div>
    </aside>
  );
}
