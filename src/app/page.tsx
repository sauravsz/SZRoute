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
import { Menu, X, Command, Sun, Moon, PanelLeftOpen } from "lucide-react";

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Global keyboard shortcuts (⌘B to toggle sidebar, 1-7 for tabs, / for search, Esc to clear)
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      // ⌘B or Ctrl+B to toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
        return;
      }

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
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col md:flex-row relative overflow-x-hidden antialiased selection:bg-[#3B82F6]/20 transition-colors duration-200">
      {/* ─── Gentle Atmospheric Ambient Glow (6-8% Subtle Opacity, Zero Glare) ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#3B82F6]/10 to-[#6366F1]/08 blur-[140px] animate-ambient-1" />
        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-[#8B5CF6]/08 via-[#3B82F6]/06 to-transparent blur-[160px] animate-ambient-2" />
      </div>

      {/* Mobile Top Glass Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-[var(--glass-surface)] backdrop-blur-md border-b border-[var(--glass-border)] px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-xl text-[var(--text-primary)] hover:bg-[var(--glass-surface-subtle)] active:scale-90 transition-transform"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-[15px] tracking-tight text-[var(--text-primary)]">SZRoute</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--glass-surface-subtle)] active:scale-90 transition-transform"
          >
            {isDark ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#2563EB]" />}
          </button>

          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--glass-surface-subtle)] active:scale-90 transition-transform"
          >
            <Command className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Desktop Left Glass Sidebar (Collapsible with ⌘B) */}
      <div
        className={`hidden md:block z-20 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-64 opacity-100" : "w-0 opacity-0 overflow-hidden pointer-events-none"
        }`}
      >
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
          onToggleSidebar={handleToggleSidebar}
        />
      </div>

      {/* Floating Re-Open Sidebar Button when Collapsed */}
      {!sidebarOpen && (
        <button
          onClick={handleToggleSidebar}
          className="hidden md:flex fixed top-4 left-4 z-30 p-2.5 rounded-xl bg-[var(--glass-surface)] hover:bg-[var(--glass-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--glass-border)] shadow-md active:scale-90 transition-all cursor-pointer animate-spring-pop"
          title="Open Sidebar (⌘B)"
        >
          <PanelLeftOpen className="w-4 h-4 text-[var(--accent)]" />
        </button>
      )}

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
