"use client";

import React, { useState } from "react";
import {
  Search,
  Key,
  Check,
  Play,
  Trash2,
  X,
  Zap,
  Download,
  Upload,
  ArrowUpDown,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Github,
  ChevronRight,
} from "lucide-react";
import { PROVIDER_CATALOG, ProviderDefinition } from "@/lib/providers/catalog";
import { OAUTH_PROVIDERS, OAuthTokenData } from "@/lib/oauth/providers";

interface ProvidersViewProps {
  apiKeys: Record<string, string>;
  onSaveKey: (providerId: string, key: string) => void;
  onRemoveKey: (providerId: string) => void;
  oauthTokens?: Record<string, OAuthTokenData>;
  onSaveOAuthToken?: (providerId: string, data: OAuthTokenData) => void;
  onRemoveOAuthToken?: (providerId: string) => void;
  onExportBackup?: () => string;
  onImportBackup?: (json: string) => boolean;
  selectedProviderForModal?: string | null;
}

export function ProvidersView({
  apiKeys,
  onSaveKey,
  onRemoveKey,
  oauthTokens = {},
  onSaveOAuthToken,
  onRemoveOAuthToken,
  onExportBackup,
  onImportBackup,
  selectedProviderForModal = null,
}: ProvidersViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "free" | "commercial" | "local">("all");
  const [editingProvider, setEditingProvider] = useState<ProviderDefinition | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [testResult, setTestResult] = useState<{ status: "idle" | "testing" | "ok" | "error"; latencyMs?: number; message?: string }>({ status: "idle" });

  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [pingLatencies, setPingLatencies] = useState<Record<string, number>>({});
  const [sortByLatency, setSortByLatency] = useState(false);

  // Device Code Flow State
  const [deviceFlow, setDeviceFlow] = useState<{
    isOpen: boolean;
    providerId: string;
    userCode: string;
    verificationUri: string;
    deviceCode: string;
    isPolling: boolean;
    status: "idle" | "polling" | "success" | "error";
    errorMsg?: string;
  } | null>(null);

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
          message: `Connected in ${data.latencyMs}ms`,
        });
      } else {
        setTestResult({
          status: "error",
          message: data.error || "Authentication error",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({ status: "error", message: msg });
    }
  };

  const handleStartOAuthRedirect = async (providerId: string) => {
    try {
      const res = await fetch(`/api/oauth/authorize?provider=${providerId}`);
      const data = await res.json();
      if (data.authUrl) {
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        window.open(
          data.authUrl,
          `szroute_oauth_${providerId}`,
          `width=${width},height=${height},top=${top},left=${left}`
        );
      }
    } catch (err) {
      console.error("OAuth error:", err);
    }
  };

  const handleStartDeviceFlow = async (providerId = "github_copilot") => {
    try {
      const res = await fetch("/api/oauth/device/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId }),
      });
      const data = await res.json();
      if (data.userCode && data.verificationUri) {
        setDeviceFlow({
          isOpen: true,
          providerId,
          userCode: data.userCode,
          verificationUri: data.verificationUri,
          deviceCode: data.deviceCode,
          isPolling: true,
          status: "polling",
        });
        pollDeviceToken(data.deviceCode, providerId, data.interval || 5);
      }
    } catch (err) {
      console.error("Device flow error:", err);
    }
  };

  const pollDeviceToken = async (deviceCode: string, providerId: string, intervalSec = 5) => {
    const pollTimer = setInterval(async () => {
      try {
        const res = await fetch("/api/oauth/device/poll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceCode, providerId }),
        });
        const data = await res.json();
        if (data.status === "success" && data.tokenData) {
          clearInterval(pollTimer);
          if (onSaveOAuthToken) {
            onSaveOAuthToken(providerId, data.tokenData);
          }
          setDeviceFlow((prev) => (prev ? { ...prev, isPolling: false, status: "success" } : null));
          setTimeout(() => setDeviceFlow(null), 2000);
        } else if (data.status === "error") {
          clearInterval(pollTimer);
          setDeviceFlow((prev) =>
            prev ? { ...prev, isPolling: false, status: "error", errorMsg: data.error } : null
          );
        }
      } catch {
        clearInterval(pollTimer);
      }
    }, intervalSec * 1000);
  };

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

  const handleApplyImport = () => {
    if (onImportBackup && importJsonText.trim()) {
      const success = onImportBackup(importJsonText.trim());
      if (success) {
        setBackupMessage("Configuration restored successfully!");
        setTimeout(() => setBackupModalOpen(false), 1000);
      } else {
        setBackupMessage("Invalid backup JSON format.");
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
    <div className="space-y-6 animate-spring-slide-up">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--label-primary)] tracking-tight">
            Providers, API Keys & OAuth
          </h2>
          <p className="text-[14px] text-[var(--label-secondary)] mt-0.5">
            Configure upstream credentials, OAuth 2.0 PKCE, or GitHub Copilot device authentication.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleStartDeviceFlow("github_copilot")}
            className="btn-apple-secondary text-[12px] h-9 px-3.5"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Copilot Device Auth</span>
          </button>

          <button
            onClick={handleBenchmarkAll}
            disabled={isBenchmarking}
            className="btn-apple-secondary text-[12px] h-9 px-3.5"
          >
            <Zap className={`w-3.5 h-3.5 ${isBenchmarking ? "animate-spin text-[var(--system-blue)]" : ""}`} />
            <span>{isBenchmarking ? "Benchmarking..." : "Benchmark Speed"}</span>
          </button>

          <button
            onClick={() => setBackupModalOpen(true)}
            className="btn-apple-secondary text-[12px] h-9 px-3.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup / Sync</span>
          </button>

          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-[var(--label-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search (Press /)..."
              className="apple-input w-full pl-9 pr-3 py-1.5 text-[13px]"
            />
          </div>
        </div>
      </div>

      {/* Segmented Control Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--separator)] pb-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-[var(--bg-subtle)] p-1 rounded-2xl">
          {[
            { id: "all", label: "All Providers" },
            { id: "free", label: "100% Free Tiers" },
            { id: "commercial", label: "Commercial" },
            { id: "local", label: "Local" },
          ].map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-3 py-1 rounded-xl text-[12px] font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[var(--bg-card)] text-[var(--label-primary)] shadow-2xs"
                    : "text-[var(--label-secondary)] hover:text-[var(--label-primary)]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {sortByLatency && (
          <div className="text-[12px] text-[var(--system-green)] font-semibold flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sorted by live speed
          </div>
        )}
      </div>

      {/* 3-Up Provider Concentric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProviders.map((provider) => {
          const hasKey = Boolean(apiKeys[provider.id]);
          const hasOAuth = Boolean(oauthTokens[provider.id]);
          const oauthConfig = OAUTH_PROVIDERS[provider.id];
          const latency = pingLatencies[provider.id];

          return (
            <div
              key={provider.id}
              className="apple-card-interactive p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[11px] uppercase font-bold text-[var(--system-blue)]">
                      {hasOAuth ? "OAuth Active" : provider.freeTier.hasFree ? "Free Tier" : "Commercial API"}
                    </div>
                    <h3 className="text-[17px] font-bold text-[var(--label-primary)] mt-0.5">
                      {provider.name}
                    </h3>
                  </div>

                  {latency !== undefined && latency < 9000 && (
                    <span className="text-[11px] font-mono font-bold text-[var(--system-green)] bg-[var(--system-green)]/15 px-2.5 py-0.5 rounded-full">
                      {latency}ms
                    </span>
                  )}
                </div>

                <p className="text-[13px] text-[var(--label-secondary)] leading-relaxed line-clamp-2">
                  {provider.description}
                </p>

                {/* Models List */}
                <div className="space-y-1 pt-1">
                  <div className="flex flex-wrap gap-1">
                    {provider.models.map((m) => (
                      <span
                        key={m.id}
                        className="px-2.5 py-0.5 text-[11px] bg-[var(--bg-subtle)] text-[var(--label-secondary)] font-medium rounded-full truncate max-w-[180px]"
                        title={m.name}
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[var(--separator)] flex items-center justify-between text-[12px]">
                <div className="text-[var(--label-secondary)]">
                  {hasOAuth ? (
                    <span className="text-[var(--system-green)] font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> OAuth Ready
                    </span>
                  ) : hasKey ? (
                    <span className="text-[var(--system-green)] font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Key Saved
                    </span>
                  ) : (
                    <span>{provider.freeTier.monthlyFreeTokensEstimate || "Free quota"}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {oauthConfig && !hasOAuth && (
                    <button
                      onClick={() => handleStartOAuthRedirect(provider.id)}
                      className="btn-apple-primary text-[11px] h-7 px-3 font-semibold active:scale-95"
                    >
                      OAuth
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenKeyModal(provider)}
                    className="btn-apple-secondary text-[11px] h-7 px-3 font-semibold active:scale-95"
                  >
                    <Key className="w-3 h-3" />
                    <span>{hasKey || hasOAuth ? "Edit" : "Key"}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* GitHub Copilot Device Flow Modal */}
      {deviceFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-[var(--bg-card)] rounded-3xl border border-[var(--separator)] shadow-2xl p-6 space-y-4 text-center animate-spring-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-[var(--system-blue)]/15 text-[var(--system-blue)] flex items-center justify-center mx-auto">
              <Github className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[var(--label-primary)]">GitHub Copilot Device Login</h3>
              <p className="text-[13px] text-[var(--label-secondary)] mt-1">
                Enter this 8-digit verification code on GitHub:
              </p>
            </div>

            <div className="p-4 bg-[var(--bg-subtle)] rounded-2xl border border-[var(--separator)]">
              <div className="text-3xl font-mono font-bold text-[var(--system-blue)] tracking-widest select-all">
                {deviceFlow.userCode}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={deviceFlow.verificationUri}
                target="_blank"
                rel="noreferrer"
                className="btn-apple-primary w-full h-11 text-[13px] flex items-center justify-center gap-2"
              >
                <span>Open GitHub to Authorize</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="text-[12px] text-[var(--label-secondary)] flex items-center justify-center gap-1.5 pt-1">
                {deviceFlow.status === "polling" && (
                  <>
                    <Zap className="w-3.5 h-3.5 animate-spin text-[var(--system-blue)]" />
                    <span>Awaiting approval on GitHub...</span>
                  </>
                )}
                {deviceFlow.status === "success" && (
                  <span className="text-[var(--system-green)] font-semibold">✓ Copilot connected!</span>
                )}
              </div>
            </div>

            <button
              onClick={() => setDeviceFlow(null)}
              className="text-[12px] text-[var(--label-secondary)] hover:text-[var(--label-primary)] font-semibold pt-1 block mx-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Backup & Restore Modal */}
      {backupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg bg-[var(--bg-card)] rounded-3xl border border-[var(--separator)] shadow-2xl p-6 space-y-4 animate-spring-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--separator)] pb-3">
              <h3 className="text-base font-bold text-[var(--label-primary)]">Backup & Synchronization</h3>
              <button
                onClick={() => setBackupModalOpen(false)}
                className="p-1 rounded-full text-[var(--label-tertiary)] hover:text-[var(--label-primary)] hover:bg-[var(--bg-subtle)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-[13px]">
              <div className="p-4 bg-[var(--bg-subtle)] rounded-2xl space-y-2">
                <div className="font-semibold text-[var(--label-primary)]">Export Gateway State</div>
                <p className="text-[var(--label-secondary)] text-[12px]">
                  Download encrypted JSON snapshot containing your configured API keys, OAuth tokens, and combos.
                </p>
                <button
                  onClick={handleDownloadBackup}
                  className="btn-apple-primary text-[12px] h-8 px-4"
                >
                  <Download className="w-3.5 h-3.5" /> Download JSON
                </button>
              </div>

              <div className="p-4 bg-[var(--bg-subtle)] rounded-2xl space-y-2">
                <div className="font-semibold text-[var(--label-primary)]">Restore Gateway State</div>
                <textarea
                  rows={3}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Paste snapshot JSON..."
                  className="w-full bg-[var(--bg-card)] text-[var(--label-primary)] border border-[var(--separator)] rounded-xl p-2.5 text-[11px] font-mono outline-none"
                />
                <button
                  onClick={handleApplyImport}
                  disabled={!importJsonText.trim()}
                  className="btn-apple-secondary text-[12px] h-8 px-4 disabled:opacity-40"
                >
                  <Upload className="w-3.5 h-3.5" /> Restore Snapshot
                </button>
              </div>

              {backupMessage && (
                <div className="p-2.5 bg-[var(--system-green)]/15 text-[var(--system-green)] text-[12px] font-semibold rounded-xl">
                  {backupMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Key Config Modal */}
      {editingProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-[var(--bg-card)] rounded-3xl border border-[var(--separator)] shadow-2xl p-6 space-y-4 animate-spring-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--separator)] pb-3">
              <div>
                <div className="text-[11px] uppercase font-bold text-[var(--system-blue)]">Credential Setup</div>
                <h3 className="text-base font-bold text-[var(--label-primary)]">{editingProvider.name}</h3>
              </div>
              <button
                onClick={() => setEditingProvider(null)}
                className="p-1 rounded-full text-[var(--label-tertiary)] hover:text-[var(--label-primary)] hover:bg-[var(--bg-subtle)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-semibold text-[var(--label-primary)]">API Key / Secret Token</label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder={`Paste your ${editingProvider.name} key...`}
                className="apple-input w-full font-mono text-[13px]"
              />
            </div>

            {testResult.status !== "idle" && (
              <div
                className={`p-3 text-[12px] font-semibold rounded-2xl flex items-center gap-2 ${
                  testResult.status === "testing"
                    ? "bg-[var(--bg-subtle)] text-[var(--label-primary)]"
                    : testResult.status === "ok"
                    ? "bg-[var(--system-green)]/15 text-[var(--system-green)]"
                    : "bg-[var(--system-red)]/15 text-[var(--system-red)]"
                }`}
              >
                {testResult.status === "testing" && <span>Testing connection...</span>}
                {testResult.status === "ok" && <span>✓ {testResult.message}</span>}
                {testResult.status === "error" && <span>⚠️ {testResult.message}</span>}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[var(--separator)]">
              <button
                onClick={handleTestKey}
                disabled={testResult.status === "testing"}
                className="btn-apple-secondary text-[12px] h-9 px-4"
              >
                <Play className="w-3.5 h-3.5" /> Test Ping
              </button>

              <div className="flex items-center gap-2">
                {apiKeys[editingProvider.id] && (
                  <button
                    onClick={() => {
                      onRemoveKey(editingProvider.id);
                      if (onRemoveOAuthToken) onRemoveOAuthToken(editingProvider.id);
                      setEditingProvider(null);
                    }}
                    className="p-2 rounded-xl text-[var(--system-red)] hover:bg-[var(--system-red)]/10"
                    title="Remove credential"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setEditingProvider(null)}
                  className="btn-apple-secondary text-[12px] h-9 px-4"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn-apple-primary text-[12px] h-9 px-5"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
