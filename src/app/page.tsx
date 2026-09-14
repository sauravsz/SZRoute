"use client";

import React, { useState, useEffect } from "react";
import { Navbar, NavTab } from "@/components/layout/Navbar";
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
  const [isDark, setIsDark] = useState<boolean>(false);

  const {
    apiKeys,
    saveApiKey,
    removeApiKey,
    customCombos,
    saveCombos,
    requestLogs,
    addRequestLog,
    clearLogs,
    exportBackup,
    importBackup,
    stats,
  } = useSZRouteStore();

  // Load theme preference on mount (Default to clean Wise Light Mode)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("szroute_theme");
      if (stored === "dark") {
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
    <div className="min-h-screen flex flex-col bg-page text-ink transition-colors duration-200">
      {/* Minimal Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1320px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === "overview" && (
          <OverviewView onNavigate={setActiveTab} stats={stats} />
        )}

        {activeTab === "providers" && (
          <ProvidersView
            apiKeys={apiKeys}
            onSaveKey={saveApiKey}
            onRemoveKey={removeApiKey}
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
  );
}
