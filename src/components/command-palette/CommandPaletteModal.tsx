"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Zap,
  Layers,
  Sparkles,
  Sliders,
  Terminal,
  Activity,
  Key,
  Copy,
  Check,
  X,
  Flame,
} from "lucide-react";
import { NavTab } from "../layout/Sidebar";
import { PROVIDER_CATALOG, DEFAULT_COMBOS } from "@/lib/providers/catalog";

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavTab) => void;
  onOpenKeyModal?: (providerId: string) => void;
}

interface CommandItem {
  id: string;
  category: "Navigation" | "Providers" | "Combos" | "Actions";
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  shortcut?: string;
  action: () => void;
}

export function CommandPaletteModal({
  isOpen,
  onClose,
  onSelectTab,
  onOpenKeyModal,
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const commands: CommandItem[] = [
    {
      id: "nav-overview",
      category: "Navigation",
      title: "Overview & Model Showcase",
      subtitle: "Telemetry, token savings, and provider matrix",
      icon: <Activity className="w-4 h-4 text-white" />,
      iconBg: "bg-[#007AFF]",
      shortcut: "1",
      action: () => {
        onSelectTab("overview");
        onClose();
      },
    },
    {
      id: "nav-providers",
      category: "Navigation",
      title: "160+ Providers & Credentials",
      subtitle: "Configure API keys, OAuth PKCE, benchmark speed",
      icon: <Key className="w-4 h-4 text-white" />,
      iconBg: "bg-[#FF9500]",
      shortcut: "2",
      action: () => {
        onSelectTab("providers");
        onClose();
      },
    },
    {
      id: "nav-combos",
      category: "Navigation",
      title: "Virtual Combos & Fallbacks",
      subtitle: "Multi-tier priority routing and auto-failovers",
      icon: <Layers className="w-4 h-4 text-white" />,
      iconBg: "bg-[#34C759]",
      shortcut: "3",
      action: () => {
        onSelectTab("combos");
        onClose();
      },
    },
    {
      id: "nav-studio",
      category: "Navigation",
      title: "AI Chat Studio Playground",
      subtitle: "Multi-model chat with live streaming",
      icon: <Sparkles className="w-4 h-4 text-white" />,
      iconBg: "bg-[#AF52DE]",
      shortcut: "4",
      action: () => {
        onSelectTab("studio");
        onClose();
      },
    },
    {
      id: "nav-compression",
      category: "Navigation",
      title: "RTK + Caveman Token Compression",
      subtitle: "Test token reduction rules and inspect live savings",
      icon: <Flame className="w-4 h-4 text-white" />,
      iconBg: "bg-[#FF3B30]",
      shortcut: "5",
      action: () => {
        onSelectTab("compression");
        onClose();
      },
    },
    {
      id: "nav-inspector",
      category: "Navigation",
      title: "Live Telemetry Logs",
      subtitle: "Real-time request stream, failover trails, and latency",
      icon: <Activity className="w-4 h-4 text-white" />,
      iconBg: "bg-[#5AC8FA]",
      shortcut: "6",
      action: () => {
        onSelectTab("inspector");
        onClose();
      },
    },
    {
      id: "nav-setup",
      category: "Navigation",
      title: "Oh My Pi (omp) Integration",
      subtitle: "Configuration snippets for omp, Cursor, Cline, and Codex",
      icon: <Terminal className="w-4 h-4 text-white" />,
      iconBg: "bg-[#5856D6]",
      shortcut: "7",
      action: () => {
        onSelectTab("setup");
        onClose();
      },
    },
    // Top Free Providers
    ...PROVIDER_CATALOG.slice(0, 6).map((p) => ({
      id: `prov-${p.id}`,
      category: "Providers" as const,
      title: `${p.name} (${p.freeTier.badgeText || "Provider"})`,
      subtitle: p.description,
      icon: <Key className="w-4 h-4 text-white" />,
      iconBg: "bg-[#FF9500]",
      action: () => {
        onSelectTab("providers");
        if (onOpenKeyModal) onOpenKeyModal(p.id);
        onClose();
      },
    })),
    // Built-in Combos
    ...DEFAULT_COMBOS.map((c) => ({
      id: `combo-${c.id}`,
      category: "Combos" as const,
      title: `Combo: ${c.name}`,
      subtitle: c.description,
      icon: <Layers className="w-4 h-4 text-white" />,
      iconBg: "bg-[#34C759]",
      action: () => {
        onSelectTab("combos");
        onClose();
      },
    })),
  ];

  const filtered = commands.filter((cmd) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      cmd.title.toLowerCase().includes(q) ||
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q)) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-[var(--bg-card)] border border-[var(--separator)] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-spring-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Apple Spotlight Search Input */}
        <div className="px-5 py-3.5 border-b border-[var(--separator)] flex items-center gap-3 bg-[var(--bg-card)]">
          <Search className="w-5 h-5 text-[var(--system-blue)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, providers, models..."
            className="flex-1 bg-transparent text-[var(--label-primary)] placeholder-[var(--label-tertiary)] text-[16px] font-medium outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[var(--label-tertiary)] hover:text-[var(--label-primary)] hover:bg-[var(--bg-subtle)] transition-colors active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Rows List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1 bg-[var(--bg-card)]">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[var(--label-secondary)] text-[14px]">
              No results matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "bg-[var(--system-blue)] text-white shadow-xs"
                      : "text-[var(--label-primary)] hover:bg-[var(--bg-subtle)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shadow-2xs ${
                        isSelected ? "bg-white/20 text-white" : cmd.iconBg
                      }`}
                    >
                      {cmd.icon}
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold flex items-center gap-2">
                        <span>{cmd.title}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-white/25 text-white"
                              : "bg-[var(--bg-subtle)] text-[var(--label-secondary)]"
                          }`}
                        >
                          {cmd.category}
                        </span>
                      </div>
                      {cmd.subtitle && (
                        <div
                          className={`text-[12px] truncate max-w-sm ${
                            isSelected ? "text-white/80" : "text-[var(--label-secondary)]"
                          }`}
                        >
                          {cmd.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  {cmd.shortcut && (
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-[var(--bg-subtle)] text-[var(--label-secondary)]"
                      }`}
                    >
                      {cmd.shortcut}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Legend */}
        <div className="px-5 py-2.5 bg-[var(--bg-subtle)]/50 border-t border-[var(--separator)] flex items-center justify-between text-[12px] text-[var(--label-secondary)] font-medium">
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>•</span>
            <span>⏎ Select</span>
            <span>•</span>
            <span>Esc Close</span>
          </div>
          <span className="text-[var(--system-blue)] font-semibold">Spotlight Search</span>
        </div>
      </div>
    </div>
  );
}
