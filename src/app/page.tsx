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
import { Menu, X, Copy, Check, Command } from "lucide-react";

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
    <div className="min-h-screen bg-[#ffffff] text-[#262626] flex flex-col md:flex-row antialiased">
      {/* Mobile Top Header (Hidden on Desktop) */}
      <header className="md:hidden sticky top-0 z-40 bg-[#ffffff] border-b border-[#e6e6e6] px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#262626]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-[#262626] text-[16px] tracking-tight">SZRoute</span>
        </div>

        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="p-1.5 text-[#6b6b6b]"
        >
          <Command className="w-4 h-4" />
        </button>
      </header>

      {/* Desktop Fixed Left Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#1a2129]/80 backdrop-blur-xs flex">
          <div className="w-64 bg-[#ffffff] h-full shadow-2xl">
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
            />
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 max-w-[1320px] w-full mx-auto px-6 lg:px-12 py-8 sm:py-10">
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
