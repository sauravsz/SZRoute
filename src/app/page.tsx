"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, NavTab } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { CommandPaletteModal } from "@/components/command-palette/CommandPaletteModal";
import { OverviewView } from "@/components/dashboard/OverviewView";
import { ProvidersView } from "@/components/providers/ProvidersView";
import { ComboBuilderView } from "@/components/combos/ComboBuilderView";
import { ChatStudioView } from "@/components/studio/ChatStudioView";
import { CompressionStudioView } from "@/components/compression/CompressionStudioView";
import { TrafficInspectorView } from "@/components/inspector/TrafficInspectorView";
import { SetupGuidesView } from "@/components/setup/SetupGuidesView";
import { useSZRouteStore } from "@/lib/store/useSZRouteStore";
import { Menu, X, Command, Sun, Moon } from "lucide-react";

const TAB_INDEX_MAP: NavTab[] = [
  "overview",
  "providers",
  "combos",
  "studio",
  "compression",
  "inspector",
  "setup",
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [selectedProviderForModal, setSelectedProviderForModal] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(false);

  const {
    apiKeys,
    saveApiKey,
    removeApiKey,
    oauthTokens,
    saveOAuthToken,
    removeOAuthToken,
    customCombos,
    saveCombos,
    requestLogs,
    addRequestLog,
    clearLogs,
    exportBackup,
    importBackup,
    stats,
  } = useSZRouteStore();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("szroute_theme");
      if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        setIsDark(true);
        document.documentElement.classList.add("dark");
      } else {
        setIsDark(false);
        document.documentElement.classList.remove("dark");
      }
    } catch {}
  }, []);

  const handleToggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("szroute_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("szroute_theme", "light");
    }
  };

  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if (!isInput && !commandPaletteOpen) {
        if (e.key >= "1" && e.key <= "7") {
          const idx = parseInt(e.key, 10) - 1;
          if (TAB_INDEX_MAP[idx]) {
            e.preventDefault();
            setActiveTab(TAB_INDEX_MAP[idx]);
          }
        } else if (e.key === "/") {
          e.preventDefault();
          const searchInput = document.querySelector<HTMLInputElement>("input[type='text']");
          searchInput?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  }, [commandPaletteOpen]);

  const handleOpenKeyModal = (providerId: string) => {
    setSelectedProviderForModal(providerId);
    setActiveTab("providers");
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col md:flex-row relative overflow-x-hidden antialiased selection:bg-[#007AFF]/30 transition-colors duration-300">
      {/* ─── Ambient Atmospheric Fluid Mesh Layer (Refracted by Liquid Glass) ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Fluid Blob 1 (Cyan / Blue) */}
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-[#007AFF]/30 to-[#32ADE6]/25 blur-[120px] animate-ambient-1" />
        
        {/* Fluid Blob 2 (Purple / Indigo) */}
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-[#AF52DE]/25 via-[#5856D6]/20 to-[#FF2D55]/15 blur-[140px] animate-ambient-2" />

        {/* Fluid Blob 3 (Emerald / Mint Green) */}
        <div className="absolute -bottom-40 left-1/4 w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-[#34C759]/20 via-[#30D158]/15 to-[#32ADE6]/20 blur-[130px] animate-ambient-3" />
      </div>

      {/* SVG Optical Refraction Shader Filters */}
      <svg className="hidden" aria-hidden="true">
        <defs>
          <filter id="liquid-refraction" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Mobile Top Glass Bar */}
      <header className="md:hidden sticky top-0 z-40 liquid-glass rounded-none border-x-0 border-t-0 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-2xl text-[var(--text-primary)] hover:bg-[var(--glass-surface-subtle)] active:scale-90 transition-transform"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-extrabold text-[16px] tracking-tight text-[var(--text-primary)]">SZRoute Liquid</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--glass-surface-subtle)] active:scale-90 transition-transform"
          >
            {isDark ? <Sun className="w-4 h-4 text-[#FFD60A]" /> : <Moon className="w-4 h-4 text-[#007AFF]" />}
          </button>

          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--glass-surface-subtle)] active:scale-90 transition-transform"
          >
            <Command className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Desktop Left Floating Glass Sidebar */}
      <div className="hidden md:block z-20">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
        />
      </div>

      {/* Mobile Glass Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex animate-in fade-in duration-150">
          <div className="w-72 p-4 h-full animate-spring-pop">
            <Sidebar
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
              }}
              onOpenCommandPalette={() => {
                setCommandPaletteOpen(true);
                setMobileMenuOpen(false);
              }}
              isDark={isDark}
              onToggleTheme={handleToggleTheme}
            />
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Glass Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        <main className="flex-1 max-w-[1340px] w-full mx-auto px-5 lg:px-8 py-6 sm:py-8">
          {activeTab === "overview" && (
            <OverviewView onNavigate={setActiveTab} stats={stats} />
          )}

          {activeTab === "providers" && (
            <ProvidersView
              apiKeys={apiKeys}
              onSaveKey={saveApiKey}
              onRemoveKey={removeApiKey}
              oauthTokens={oauthTokens}
              onSaveOAuthToken={saveOAuthToken}
              onRemoveOAuthToken={removeOAuthToken}
              onExportBackup={exportBackup}
              onImportBackup={importBackup}
              selectedProviderForModal={selectedProviderForModal}
            />
          )}

          {activeTab === "combos" && (
            <ComboBuilderView
              customCombos={customCombos}
              onSaveCombos={saveCombos}
            />
          )}

          {activeTab === "studio" && (
            <ChatStudioView
              apiKeys={apiKeys}
              customCombos={customCombos}
              onLogRequest={addRequestLog}
            />
          )}

          {activeTab === "compression" && <CompressionStudioView />}

          {activeTab === "inspector" && (
            <TrafficInspectorView
              requestLogs={requestLogs}
              onClearLogs={clearLogs}
            />
          )}

          {activeTab === "setup" && (
            <SetupGuidesView customCombos={customCombos} apiKeys={apiKeys} />
          )}
        </main>

        {/* Global Command Palette (⌘K) */}
        <CommandPaletteModal
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onSelectTab={setActiveTab}
          onOpenKeyModal={handleOpenKeyModal}
        />

        {/* Glass Footer */}
        <Footer />
      </div>
    </div>
  );
}
