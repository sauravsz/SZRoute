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

  // Keyboard shortcut for command palette open/close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Define commands
  const commands: CommandItem[] = [
    {
      id: "nav-overview",
      category: "Navigation",
      title: "Go to Overview & Telemetry",
      subtitle: "View real-time requests, tokens saved, and provider status",
      icon: <Activity className="w-4 h-4 text-[#57c1ff]" />,
      shortcut: "G O",
      action: () => {
        onSelectTab("overview");
        onClose();
      },
    },
    {
      id: "nav-providers",
      category: "Navigation",
      title: "Explore 160+ Providers & API Keys",
      subtitle: "Configure credentials, test latency pings, filter free tiers",
      icon: <Key className="w-4 h-4 text-[#ffc533]" />,
      shortcut: "G P",
      action: () => {
        onSelectTab("providers");
        onClose();
      },
    },
    {
      id: "nav-combos",
      category: "Navigation",
      title: "Configure Combos & Fallback Chains",
      subtitle: "Build multi-tier auto-failover and priority routing",
      icon: <Layers className="w-4 h-4 text-[#59d499]" />,
      shortcut: "G C",
      action: () => {
        onSelectTab("combos");
        onClose();
      },
    },
    {
      id: "nav-studio",
      category: "Navigation",
      title: "Launch AI Chat Studio",
      subtitle: "Multi-model comparison playground with live streaming",
      icon: <Sparkles className="w-4 h-4 text-[#ff6161]" />,
      shortcut: "G S",
      action: () => {
        onSelectTab("studio");
        onClose();
      },
    },
    {
      id: "nav-compression",
      category: "Navigation",
      title: "RTK & Caveman Compression Studio",
      subtitle: "Test token reduction rules and inspect live savings",
      icon: <Flame className="w-4 h-4 text-[#ff6161]" />,
      shortcut: "G R",
      action: () => {
        onSelectTab("compression");
        onClose();
      },
    },
    {
      id: "nav-inspector",
      category: "Navigation",
      title: "Open Traffic Inspector",
      subtitle: "Live request stream, failover trails, and latency telemetry",
      icon: <Activity className="w-4 h-4 text-[#57c1ff]" />,
      shortcut: "G I",
      action: () => {
        onSelectTab("inspector");
        onClose();
      },
    },
    {
      id: "nav-setup",
      category: "Navigation",
      title: "Client Setup Guides & Snippets",
      subtitle: "Oh My Pi (omp) coding agent, Cursor, Cline, Codex, Antigravity, LiteLLM",
      icon: <Terminal className="w-4 h-4 text-[#cdcdcd]" />,
      shortcut: "G T",
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
      icon: <Key className="w-4 h-4" style={{ color: p.accentColor }} />,
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
      icon: <Layers className="w-4 h-4 text-[#59d499]" />,
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-100">
      <div
        className="w-full max-w-2xl bg-[#0d0d0d] border border-[#242728] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Strip: Traffic Lights + Search Input */}
        <div className="px-4 py-3 bg-[#101111] border-b border-[#242728] flex items-center gap-3">
          <div className="flex items-center gap-1.5 pr-2 border-r border-[#242728]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <Search className="w-4 h-4 text-[#9c9c9d]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, provider, model, or jump to view..."
            className="flex-1 bg-transparent text-white placeholder-[#6a6b6c] text-[14px] outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-[#6a6b6c] hover:text-white rounded hover:bg-[#121212] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List Rows */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[#9c9c9d] text-[13px]">
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
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[#121212] text-white border border-[#242728]"
                      : "text-[#cdcdcd] hover:bg-[#101111]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-md bg-[#101111] border border-[#242728] flex items-center justify-center">
                      {cmd.icon}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-white flex items-center gap-2">
                        {cmd.title}
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 text-[#9c9c9d] bg-[#101111] border border-[#242728] rounded">
                          {cmd.category}
                        </span>
                      </div>
                      {cmd.subtitle && (
                        <div className="text-[11px] text-[#9c9c9d] truncate max-w-md">
                          {cmd.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  {cmd.shortcut && <span className="keycap">{cmd.shortcut}</span>}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Legend */}
        <div className="px-4 py-2 bg-[#07080a] border-t border-[#242728] flex items-center justify-between text-[11px] text-[#6a6b6c]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="keycap">↑</span>
              <span className="keycap">↓</span> Navigate
            </span>
            <span className="flex items-center gap-1">
              <span className="keycap">⏎</span> Execute
            </span>
            <span className="flex items-center gap-1">
              <span className="keycap">Esc</span> Dismiss
            </span>
          </div>
          <span className="text-[#9c9c9d]">SZRoute Universal Command Engine</span>
        </div>
      </div>
    </div>
  );
}
