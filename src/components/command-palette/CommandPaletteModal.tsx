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
import { NavTab } from "../layout/Navbar";
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
      icon: <Activity className="w-4 h-4 text-[#1c69d4]" />,
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
      icon: <Key className="w-4 h-4 text-[#1c69d4]" />,
      shortcut: "2",
      action: () => {
        onSelectTab("providers");
        onClose();
      },
    },
    {
      id: "nav-combos",
      category: "Navigation",
      title: "Combos & Fallback Chains",
      subtitle: "Multi-tier priority routing and auto-failovers",
      icon: <Layers className="w-4 h-4 text-[#1c69d4]" />,
      shortcut: "3",
      action: () => {
        onSelectTab("combos");
        onClose();
      },
    },
    {
      id: "nav-studio",
      category: "Navigation",
      title: "Launch AI Studio",
      subtitle: "Multi-model chat with live streaming",
      icon: <Sparkles className="w-4 h-4 text-[#1c69d4]" />,
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
      icon: <Flame className="w-4 h-4 text-[#e22718]" />,
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
      icon: <Activity className="w-4 h-4 text-[#1c69d4]" />,
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
      icon: <Terminal className="w-4 h-4 text-[#1c69d4]" />,
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
      icon: <Key className="w-4 h-4 text-[#262626]" />,
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
      icon: <Layers className="w-4 h-4 text-[#1c69d4]" />,
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#1a2129]/75 backdrop-blur-xs animate-in fade-in duration-100">
      <div
        className="w-full max-w-2xl bg-[#ffffff] border border-[#cccccc] shadow-2xl overflow-hidden flex flex-col rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input */}
        <div className="px-5 py-4 border-b border-[#e6e6e6] flex items-center gap-3 bg-[#ffffff]">
          <Search className="w-4 h-4 text-[#1c69d4]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, models, providers..."
            className="flex-1 bg-transparent text-[#262626] placeholder-[#6b6b6b] text-[15px] font-bold outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-[#6b6b6b] hover:text-[#262626] hover:bg-[#f7f7f7] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Rows List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1 bg-[#ffffff]">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[#6b6b6b] text-[14px] font-light">
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
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors border-l-2 ${
                    isSelected
                      ? "bg-[#f7f7f7] text-[#262626] border-[#1c69d4]"
                      : "text-[#3c3c3c] hover:bg-[#fafafa] border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#fafafa] border border-[#e6e6e6] flex items-center justify-center">
                      {cmd.icon}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-[#262626] flex items-center gap-2">
                        {cmd.title}
                        <span className="text-[10px] uppercase font-bold tracking-[1px] px-1.5 py-0.5 text-[#262626] bg-[#f7f7f7] border border-[#e6e6e6]">
                          {cmd.category}
                        </span>
                      </div>
                      {cmd.subtitle && (
                        <div className="text-[12px] text-[#6b6b6b] font-light truncate max-w-md">
                          {cmd.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  {cmd.shortcut && (
                    <span className="px-2 py-0.5 bg-[#ffffff] border border-[#cccccc] text-[11px] font-mono font-bold text-[#262626]">
                      {cmd.shortcut}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Legend */}
        <div className="px-5 py-3 bg-[#f7f7f7] border-t border-[#e6e6e6] flex items-center justify-between text-[12px] text-[#3c3c3c] font-light">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>•</span>
            <span>⏎ Execute</span>
            <span>•</span>
            <span>Esc Dismiss</span>
          </div>
          <span className="text-[#262626] font-bold uppercase tracking-[1px] text-[11px]">
            BMW Command Hub
          </span>
        </div>
      </div>
    </div>
  );
}
