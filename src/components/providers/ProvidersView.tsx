"use client";

import React, { useState } from "react";
import {
  Search,
  Key,
  Check,
  Play,
  Trash2,
  Lock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  X,
  Plus,
  Zap,
  Download,
  Upload,
  ArrowUpDown,
} from "lucide-react";
import { PROVIDER_CATALOG, ProviderDefinition } from "@/lib/providers/catalog";

interface ProvidersViewProps {
  apiKeys: Record<string, string>;
  onSaveKey: (providerId: string, key: string) => void;
  onRemoveKey: (providerId: string) => void;
  onExportBackup?: () => string;
  onImportBackup?: (json: string) => boolean;
  selectedProviderForModal?: string | null;
}

export function ProvidersView({
  apiKeys,
  onSaveKey,
  onRemoveKey,
  onExportBackup,
  onImportBackup,
  selectedProviderForModal = null,
}: ProvidersViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "free" | "commercial" | "local">("all");
  const [editingProvider, setEditingProvider] = useState<ProviderDefinition | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [testResult, setTestResult] = useState<{ status: "idle" | "testing" | "ok" | "error"; latencyMs?: number; message?: string }>({ status: "idle" });

  // QoL 1: Backup & Restore Modal State
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  // QoL 3: Benchmark All Providers State
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [pingLatencies, setPingLatencies] = useState<Record<string, number>>({});
  const [sortByLatency, setSortByLatency] = useState(false);

  // Handle open modal from external trigger
  React.useEffect(() => {
    if (selectedProviderForModal) {
      const p = PROVIDER_CATALOG.find((prov) => prov.id === selectedProviderForModal);
      if (p) {
        setEditingProvider(p);
        setKeyInput(apiKeys[p.id] || "");
      }
    }
  }, [selectedProviderForModal, apiKeys]);

  const handleOpenKeyModal = (p: ProviderDefinition) => {
    setEditingProvider(p);
    setKeyInput(apiKeys[p.id] || "");
    setTestResult({ status: "idle" });
  };

  const handleSave = () => {
    if (editingProvider) {
      if (keyInput.trim()) {
        onSaveKey(editingProvider.id, keyInput.trim());
      } else {
        onRemoveKey(editingProvider.id);
      }
      setEditingProvider(null);
    }
  };

  const handleTestKey = async () => {
    if (!editingProvider) return;
    setTestResult({ status: "testing" });

    try {
      const res = await fetch("/v1/test-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: editingProvider.id,
          apiKey: keyInput.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({
          status: "ok",
          latencyMs: data.latencyMs,
          message: `Connected successfully in ${data.latencyMs}ms`,
        });
      } else {
        setTestResult({
          status: "error",
          message: data.error || "Authentication or upstream error",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({ status: "error", message: msg });
    }
  };

  // QoL 3: Benchmark All Providers in parallel
  const handleBenchmarkAll = async () => {
    setIsBenchmarking(true);
    setSortByLatency(true);
    const results: Record<string, number> = {};

    const pingPromises = PROVIDER_CATALOG.map(async (provider) => {
      try {
        const res = await fetch("/v1/test-provider", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            providerId: provider.id,
            apiKey: apiKeys[provider.id] || undefined,
          }),
        });
        const data = await res.json();
        results[provider.id] = data.latencyMs || (data.success ? 100 : 9999);
      } catch {
        results[provider.id] = 9999;
      }
    });

    await Promise.allSettled(pingPromises);
    setPingLatencies(results);
    setIsBenchmarking(false);
  };

  // QoL 1: Export JSON file
  const handleDownloadBackup = () => {
    if (onExportBackup) {
      const json = onExportBackup();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `szroute-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupMessage("Backup exported successfully!");
    }
  };

  // QoL 1: Import JSON text
  const handleApplyImport = () => {
    if (onImportBackup && importJsonText.trim()) {
      const success = onImportBackup(importJsonText.trim());
      if (success) {
        setBackupMessage("Backup imported successfully!");
        setTimeout(() => setBackupModalOpen(false), 1200);
      } else {
        setBackupMessage("Error: Invalid backup JSON format.");
      }
    }
  };

  const filteredProviders = PROVIDER_CATALOG.filter((p) => {
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.models.some((m) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortByLatency) {
      const latA = pingLatencies[a.id] ?? 9998;
      const latB = pingLatencies[b.id] ?? 9998;
      return latA - latB;
    }
    return 0;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">
            160+ AI Providers & Credentials
          </h2>
          <p className="text-[14px] text-[#9c9c9d] mt-1">
            Configure upstream API keys or route through zero-config free tiers. Keys are stored locally in your browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* QoL 3: Benchmark All Button */}
          <button
            onClick={handleBenchmarkAll}
            disabled={isBenchmarking}
            className="btn-tertiary text-[12px] flex items-center gap-1.5"
          >
            <Zap className={`w-3.5 h-3.5 text-[#ffc533] ${isBenchmarking ? "animate-spin" : ""}`} />
            <span>{isBenchmarking ? "Pinging All..." : "Benchmark Latency"}</span>
          </button>

          {/* QoL 1: Backup / Restore Button */}
          <button
            onClick={() => setBackupModalOpen(true)}
            className="btn-tertiary text-[12px] flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#57c1ff]" />
            <span>Backup / Restore</span>
          </button>

          {/* Search Field */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#9c9c9d] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="providers-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search providers or models (Press /)..."
              className="w-full bg-[#101111] text-white placeholder-[#6a6b6c] border border-[#242728] rounded-lg pl-9 pr-4 py-1.5 text-[13px] outline-none focus:border-[#434345]"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#242728] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Providers" },
            { id: "free", label: "100% Free Tiers" },
            { id: "commercial", label: "Commercial Frontier" },
            { id: "local", label: "Local / Self-Hosted" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3.5 py-1 text-[13px] font-medium rounded-full transition-colors ${
                activeCategory === tab.id
                  ? "bg-[#101111] text-white border border-[#242728]"
                  : "text-[#cdcdcd] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {sortByLatency && (
          <div className="text-[12px] text-[#59d499] flex items-center gap-1 font-mono">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sorted by live latency (fastest first)
          </div>
        )}
      </div>

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProviders.map((provider) => {
          const hasKey = Boolean(apiKeys[provider.id]);
          const latency = pingLatencies[provider.id];

          return (
            <div
              key={provider.id}
              className="raycast-card p-5 space-y-4 flex flex-col justify-between hover:border-[#434345] transition-colors"
            >
              <div className="space-y-3">
                {/* Top Row: Icon + Name + Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg bg-[#121212] border border-[#242728] flex items-center justify-center font-bold text-sm"
                      style={{ color: provider.accentColor }}
                    >
                      {provider.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-medium text-white flex items-center gap-1.5">
                        {provider.name}
                      </h3>
                      <span className="text-[11px] font-mono text-[#9c9c9d]">{provider.baseUrl}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {provider.freeTier.hasFree ? (
                      <span className="px-2 py-0.5 text-[11px] font-medium bg-[#59d499]/10 text-[#59d499] border border-[#59d499]/20 rounded">
                        Free Tier
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[11px] font-medium bg-[#101111] text-[#9c9c9d] border border-[#242728] rounded">
                        Paid API
                      </span>
                    )}
                    {latency !== undefined && latency < 9000 && (
                      <span className="text-[11px] font-mono text-[#59d499]">
                        ⚡ {latency}ms
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[13px] text-[#cdcdcd] leading-relaxed">
                  {provider.description}
                </p>

                {/* Models List Preview */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#6a6b6c] font-medium">
                    Available Models
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {provider.models.map((m) => (
                      <span
                        key={m.id}
                        className="px-2 py-0.5 text-[11px] bg-[#121212] text-[#cdcdcd] border border-[#242728] rounded truncate max-w-[200px]"
                        title={m.name}
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action Strip */}
              <div className="pt-3 border-t border-[#242728] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {hasKey ? (
                    <span className="flex items-center gap-1 text-[12px] text-[#59d499]">
                      <Check className="w-3.5 h-3.5" /> Key Saved
                    </span>
                  ) : provider.freeTier.hasFree ? (
                    <span className="text-[12px] text-[#9c9c9d]">
                      {provider.freeTier.monthlyFreeTokensEstimate || "Free access ready"}
                    </span>
                  ) : (
                    <span className="text-[12px] text-[#ffc533]">
                      Key Required
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleOpenKeyModal(provider)}
                  className="btn-tertiary text-[12px] h-8 px-3 flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5 text-[#cdcdcd]" />
                  {hasKey ? "Edit Key" : "Configure Key"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* QoL 1: Backup & Restore Modal */}
      {backupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-100">
          <div
            className="w-full max-w-lg bg-[#0d0d0d] border border-[#242728] rounded-xl shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#242728] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-[#121212] border border-[#242728] flex items-center justify-center">
                  <Download className="w-4 h-4 text-[#57c1ff]" />
                </div>
                <h3 className="text-base font-medium text-white">Backup & Restore Credentials</h3>
              </div>
              <button
                onClick={() => setBackupModalOpen(false)}
                className="p-1 text-[#6a6b6c] hover:text-white rounded hover:bg-[#121212]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-[#101111] border border-[#242728] rounded-lg space-y-2">
                <h4 className="text-[13px] font-medium text-white">Export Local Configuration</h4>
                <p className="text-[12px] text-[#9c9c9d]">
                  Download an encrypted JSON snapshot containing your configured provider keys, custom combos, and RTK rules.
                </p>
                <button
                  onClick={handleDownloadBackup}
                  className="btn-primary text-[12px] flex items-center gap-1.5 mt-2"
                >
                  <Download className="w-3.5 h-3.5" /> Download Backup JSON
                </button>
              </div>

              <div className="p-4 bg-[#101111] border border-[#242728] rounded-lg space-y-2">
                <h4 className="text-[13px] font-medium text-white">Restore from Backup JSON</h4>
                <textarea
                  rows={4}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Paste your backup JSON content here..."
                  className="w-full bg-[#121212] text-white border border-[#242728] rounded-lg p-2 text-[12px] font-mono outline-none"
                />
                <button
                  onClick={handleApplyImport}
                  disabled={!importJsonText.trim()}
                  className="btn-tertiary text-[12px] flex items-center gap-1.5 mt-1 disabled:opacity-40"
                >
                  <Upload className="w-3.5 h-3.5" /> Apply & Restore Config
                </button>
              </div>

              {backupMessage && (
                <div className="p-2.5 rounded bg-[#59d499]/10 text-[#59d499] text-[12px] border border-[#59d499]/20 flex items-center gap-2">
                  <Check className="w-3.5 h-3.5" /> {backupMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Key Configuration Modal */}
      {editingProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-100">
          <div
            className="w-full max-w-lg bg-[#0d0d0d] border border-[#242728] rounded-xl shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#242728] pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg bg-[#121212] border border-[#242728] flex items-center justify-center font-bold"
                  style={{ color: editingProvider.accentColor }}
                >
                  {editingProvider.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-medium text-white">{editingProvider.name} API Key</h3>
                  <p className="text-[12px] text-[#9c9c9d]">
                    Header: <code className="font-mono text-white">{editingProvider.authHeader}</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingProvider(null)}
                className="p-1 text-[#6a6b6c] hover:text-white rounded hover:bg-[#121212]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-[13px] font-medium text-[#cdcdcd] block">
                API Key / Token
              </label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder={`Paste your ${editingProvider.name} key...`}
                className="w-full bg-[#101111] text-white border border-[#242728] rounded-lg px-3.5 py-2 text-[14px] outline-none font-mono focus:border-[#434345]"
              />
              <p className="text-[12px] text-[#6a6b6c]">
                Keys are stored only in your browser localStorage or passed statelessly via request headers.
              </p>
            </div>

            {/* Ping Test Feedback */}
            {testResult.status !== "idle" && (
              <div
                className={`p-3 rounded-lg border text-[13px] flex items-center gap-2 ${
                  testResult.status === "testing"
                    ? "bg-[#101111] text-[#cdcdcd] border-[#242728]"
                    : testResult.status === "ok"
                    ? "bg-[#59d499]/10 text-[#59d499] border-[#59d499]/20"
                    : "bg-[#ff6161]/10 text-[#ff6161] border-[#ff6161]/20"
                }`}
              >
                {testResult.status === "testing" && <span>Testing connection...</span>}
                {testResult.status === "ok" && (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{testResult.message}</span>
                  </>
                )}
                {testResult.status === "error" && (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>{testResult.message}</span>
                  </>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#242728]">
              <button
                onClick={handleTestKey}
                disabled={testResult.status === "testing"}
                className="btn-tertiary text-[13px] flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                Test Ping
              </button>

              <div className="flex items-center gap-2">
                {apiKeys[editingProvider.id] && (
                  <button
                    onClick={() => {
                      onRemoveKey(editingProvider.id);
                      setEditingProvider(null);
                    }}
                    className="p-2 text-[#ff6161] hover:bg-[#ff6161]/10 rounded-lg transition-colors"
                    title="Remove saved key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setEditingProvider(null)}
                  className="btn-secondary text-[13px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary text-[13px] px-4"
                >
                  Save Credential
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
