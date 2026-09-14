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
  ArrowRight,
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

  // Keyboard shortcut listener
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
      title: "Overview & Real-time Telemetry",
      subtitle: "View requests, token savings, and provider matrix",
      icon: <Activity className="w-4 h-4 text-[#0e0f0c]" />,
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
      subtitle: "Configure API keys, benchmark latencies, filter free tiers",
      icon: <Key className="w-4 h-4 text-[#0e0f0c]" />,
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
      subtitle: "Configure multi-tier priority routing and auto-failovers",
      icon: <Layers className="w-4 h-4 text-[#0e0f0c]" />,
      shortcut: "3",
      action: () => {
        onSelectTab("combos");
        onClose();
      },
    },
    {
      id: "nav-studio",
      category: "Navigation",
      title: "Launch AI Studio Playground",
      subtitle: "Multi-model chat with live streaming and side-by-side comparison",
      icon: <Sparkles className="w-4 h-4 text-[#0e0f0c]" />,
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
      icon: <Flame className="w-4 h-4 text-[#0e0f0c]" />,
      shortcut: "5",
      action: () => {
        onSelectTab("compression");
        onClose();
      },
    },
    {
      id: "nav-inspector",
      category: "Navigation",
      title: "Live Traffic Inspector",
      subtitle: "Real-time request log stream, failover trails, and status codes",
      icon: <Activity className="w-4 h-4 text-[#0e0f0c]" />,
      shortcut: "6",
      action: () => {
        onSelectTab("inspector");
        onClose();
      },
    },
    {
      id: "nav-setup",
      category: "Navigation",
      title: "Oh My Pi (omp) Setup Guides",
      subtitle: "Drop-in configuration snippets for omp, Cursor, Cline, and Codex",
      icon: <Terminal className="w-4 h-4 text-[#0e0f0c]" />,
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
      icon: <Key className="w-4 h-4 text-[#0e0f0c]" />,
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
      icon: <Layers className="w-4 h-4 text-[#0e0f0c]" />,
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#0e0f0c]/60 backdrop-blur-sm animate-in fade-in duration-100">
      <div
        className="w-full max-w-2xl bg-[#ffffff] border border-[#e8ebe6] rounded-[24px] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input */}
        <div className="px-5 py-4 border-b border-[#e8ebe6] flex items-center gap-3 bg-[#ffffff]">
          <div className="w-6 h-6 rounded-full bg-[#9fe870] flex items-center justify-center">
            <Search className="w-3.5 h-3.5 text-[#0e0f0c]" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, providers, models, or views..."
            className="flex-1 bg-transparent text-[#0e0f0c] placeholder-[#868685] text-[15px] font-medium outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-[#868685] hover:text-[#0e0f0c] rounded-full hover:bg-[#e8ebe6] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Rows List */}
        <div className="max-h-[380px] overflow-y-auto p-2.5 space-y-1 bg-[#ffffff]">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[#868685] text-[14px]">
              No commands or providers matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-[16px] cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#e8ebe6] text-[#0e0f0c]"
                      : "text-[#454745] hover:bg-[#f7f8f6]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#ffffff] border border-[#e8ebe6] flex items-center justify-center shadow-xs">
                      {cmd.icon}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-[#0e0f0c] flex items-center gap-2">
                        {cmd.title}
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 text-[#0e0f0c] bg-[#e2f6d5] rounded-full">
                          {cmd.category}
                        </span>
                      </div>
                      {cmd.subtitle && (
                        <div className="text-[12px] text-[#868685] truncate max-w-md">
                          {cmd.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  {cmd.shortcut && (
                    <span className="px-2 py-0.5 bg-[#ffffff] border border-[#e8ebe6] text-[11px] font-mono font-bold text-[#0e0f0c] rounded-md shadow-xs">
                      {cmd.shortcut}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Legend */}
        <div className="px-5 py-3 bg-[#e8ebe6] border-t border-[#e8ebe6] flex items-center justify-between text-[12px] text-[#454745] font-medium">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>•</span>
            <span>⏎ Select</span>
            <span>•</span>
            <span>Esc Dismiss</span>
          </div>
          <span className="text-[#0e0f0c] font-bold">SZRoute Command Engine</span>
        </div>
      </div>
    </div>
  );
}
