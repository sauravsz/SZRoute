"use client";

import React, { useState } from "react";
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

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [selectedProviderForModal, setSelectedProviderForModal] = useState<string | null>(null);

  const {
    apiKeys,
    saveApiKey,
    removeApiKey,
    customCombos,
    saveCombos,
    requestLogs,
    addRequestLog,
    clearLogs,
    stats,
  } = useSZRouteStore();

  const handleOpenKeyModal = (providerId: string) => {
    setSelectedProviderForModal(providerId);
    setActiveTab("providers");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07080a]">
      {/* Universal Raycast Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === "overview" && (
          <OverviewView onNavigate={setActiveTab} stats={stats} />
        )}

        {activeTab === "providers" && (
          <ProvidersView
            apiKeys={apiKeys}
            onSaveKey={saveApiKey}
            onRemoveKey={removeApiKey}
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

        {activeTab === "setup" && <SetupGuidesView />}
      </main>

      {/* Global Command Palette (⌘K) */}
      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectTab={setActiveTab}
        onOpenKeyModal={handleOpenKeyModal}
      />

      {/* Universal Dark Footer */}
      <Footer />
    </div>
  );
}
