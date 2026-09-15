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

  // Load system theme on mount (default to system / light)
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

  // Global keyboard shortcuts (1-7 for tabs, / for search, Esc to clear)
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
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--label-primary)] flex flex-col md:flex-row antialiased transition-colors duration-200">
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-[var(--bg-card)]/85 backdrop-blur-md border-b border-[var(--separator)] px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-xl text-[var(--label-primary)] hover:bg-[var(--bg-subtle)] active:scale-90 transition-transform"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-[16px] tracking-tight">SZRoute</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleTheme}
            className="p-1.5 rounded-full text-[var(--label-secondary)] hover:bg-[var(--bg-subtle)]"
          >
            {isDark ? <Sun className="w-4 h-4 text-[#FFD60A]" /> : <Moon className="w-4 h-4 text-[var(--system-blue)]" />}
          </button>

          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="p-1.5 rounded-full text-[var(--label-secondary)] hover:bg-[var(--bg-subtle)]"
          >
            <Command className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Desktop Left Glass Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex animate-in fade-in duration-150">
          <div className="w-64 bg-[var(--bg-card)] h-full shadow-2xl animate-spring-pop">
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 max-w-[1320px] w-full mx-auto px-5 lg:px-10 py-6 sm:py-8">
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

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
