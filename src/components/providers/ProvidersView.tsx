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

  // Device Code Flow State (for GitHub Copilot / CLI agents)
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

  // OAuth Redirect Handlers (Google, OpenRouter, HuggingFace)
  const handleStartOAuthRedirect = async (providerId: string) => {
    try {
      const res = await fetch(`/api/oauth/authorize?provider=${providerId}`);
      const data = await res.json();
      if (data.authUrl) {
        // Open OAuth popup window
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
      console.error("OAuth init error:", err);
    }
  };

  // Device Code Flow Handlers (GitHub Copilot)
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
        // Start polling
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
      setBackupMessage("Backup downloaded!");
    }
  };

  const handleApplyImport = () => {
    if (onImportBackup && importJsonText.trim()) {
      const success = onImportBackup(importJsonText.trim());
      if (success) {
        setBackupMessage("Configuration restored!");
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
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
            Providers, API Keys & OAuth
          </h2>
          <p className="text-[14px] text-ink-body font-medium mt-1">
            Connect via zero-config OAuth 2.0 PKCE, Device code, or standard API keys.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* GitHub Copilot Device Code Trigger */}
          <button
            onClick={() => handleStartDeviceFlow("github_copilot")}
            className="btn-secondary text-[12px] h-9 px-3 flex items-center gap-1.5"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Copilot Device Auth</span>
          </button>

          <button
            onClick={handleBenchmarkAll}
            disabled={isBenchmarking}
            className="btn-secondary text-[12px] h-9 px-3"
          >
            <Zap className={`w-3.5 h-3.5 ${isBenchmarking ? "animate-spin text-primary" : ""}`} />
            <span>{isBenchmarking ? "Benchmarking..." : "Benchmark Speed"}</span>
          </button>

          <button
            onClick={() => setBackupModalOpen(true)}
            className="btn-secondary text-[12px] h-9 px-3"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup / Sync</span>
          </button>

          <div className="relative w-full sm:w-52">
            <Search className="w-4 h-4 text-ink-mute absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search (Press /)..."
              className="wise-input w-full pl-9 pr-3 py-1.5 text-[13px] rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Providers" },
            { id: "free", label: "100% Free Tiers" },
            { id: "commercial", label: "Commercial" },
            { id: "local", label: "Local" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3 py-1 text-[12px] font-bold rounded-full transition-all ${
                activeCategory === tab.id
                  ? "bg-ink text-card"
                  : "text-ink-body hover:text-ink hover:bg-subtle"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {sortByLatency && (
          <div className="text-[11px] text-positive font-bold flex items-center gap-1 font-mono">
            <ArrowUpDown className="w-3 h-3" /> Sorted by live speed
          </div>
        )}
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProviders.map((provider) => {
          const hasKey = Boolean(apiKeys[provider.id]);
          const hasOAuth = Boolean(oauthTokens[provider.id]);
          const oauthConfig = OAUTH_PROVIDERS[provider.id];
          const latency = pingLatencies[provider.id];

          return (
            <div
              key={provider.id}
              className="wise-card p-5 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-subtle flex items-center justify-center font-black text-ink text-xs">
                      {provider.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-ink">{provider.name}</h3>
                      <span className="text-[11px] font-mono font-bold text-ink-mute truncate max-w-[140px] block">
                        {provider.baseUrl.replace(/^https?:\/\//, "")}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {hasOAuth ? (
                      <span className="badge-positive text-[10px] py-0.5 px-2">
                        OAuth Connected
                      </span>
                    ) : provider.freeTier.hasFree ? (
                      <span className="badge-positive text-[10px] py-0.5 px-2">
                        Free
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-subtle text-ink-mute rounded-full">
                        Paid
                      </span>
                    )}
                    {latency !== undefined && latency < 9000 && (
                      <span className="text-[10px] font-mono font-bold text-positive">
                        {latency}ms
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[13px] text-ink-body leading-relaxed line-clamp-2">
                  {provider.description}
                </p>

                {/* Models Preview */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {provider.models.map((m) => (
                    <span
                      key={m.id}
                      className="px-2 py-0.5 text-[10px] font-semibold bg-subtle text-ink rounded-full truncate max-w-[170px]"
                      title={m.name}
                    >
                      {m.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-[12px]">
                <div className="font-semibold text-ink-body">
                  {hasOAuth ? (
                    <span className="text-positive flex items-center gap-1 font-bold">
                      <Check className="w-3 h-3" /> OAuth Active
                    </span>
                  ) : hasKey ? (
                    <span className="text-positive flex items-center gap-1 font-bold">
                      <Check className="w-3 h-3" /> Key Saved
                    </span>
                  ) : (
                    <span className="text-ink-mute">{provider.freeTier.monthlyFreeTokensEstimate || "Free ready"}</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {/* OAuth button if provider supports OAuth */}
                  {oauthConfig && !hasOAuth && (
                    <button
                      onClick={() => handleStartOAuthRedirect(provider.id)}
                      className="btn-primary text-[11px] h-7 px-2.5 font-bold"
                      title="Login via OAuth PKCE"
                    >
                      <span>OAuth</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenKeyModal(provider)}
                    className="btn-secondary text-[11px] h-7 px-2.5"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-md bg-card rounded-[24px] shadow-2xl p-6 space-y-4 border border-border-subtle text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mx-auto text-ink">
              <Github className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-ink">GitHub Copilot Device Login</h3>
              <p className="text-[13px] text-ink-body font-medium mt-1">
                Enter this 8-digit one-time code on GitHub to authorize SZRoute:
              </p>
            </div>

            {/* Code Box */}
            <div className="p-4 bg-subtle rounded-2xl border border-border-subtle">
              <div className="text-3xl font-mono font-black text-ink tracking-widest select-all">
                {deviceFlow.userCode}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={deviceFlow.verificationUri}
                target="_blank"
                rel="noreferrer"
                className="btn-primary w-full h-11 text-[14px] flex items-center justify-center gap-2"
              >
                <span>Open GitHub to Authorize</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="text-[12px] text-ink-mute flex items-center justify-center gap-1.5 pt-2">
                {deviceFlow.status === "polling" && (
                  <>
                    <Zap className="w-3.5 h-3.5 animate-spin text-primary" />
                    <span>Listening for authorization approval...</span>
                  </>
                )}
                {deviceFlow.status === "success" && (
                  <span className="text-positive font-bold">✓ Authorization approved! Connected.</span>
                )}
              </div>
            </div>

            <button
              onClick={() => setDeviceFlow(null)}
              className="text-[12px] text-ink-mute hover:text-ink font-bold pt-2 block mx-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Backup & Restore Modal */}
      {backupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-md bg-card rounded-[24px] shadow-2xl p-6 space-y-4 border border-border-subtle"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-base font-bold text-ink">Backup & Restore</h3>
              <button
                onClick={() => setBackupModalOpen(false)}
                className="p-1 text-ink-mute hover:text-ink rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-[13px]">
              <div className="p-3.5 bg-subtle rounded-[16px] space-y-2">
                <div className="font-bold text-ink">Export Configuration</div>
                <button
                  onClick={handleDownloadBackup}
                  className="btn-primary text-[12px] h-8 px-3"
                >
                  <Download className="w-3.5 h-3.5" /> Download JSON
                </button>
              </div>

              <div className="p-3.5 bg-subtle rounded-[16px] space-y-2">
                <div className="font-bold text-ink">Import Configuration</div>
                <textarea
                  rows={3}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Paste backup JSON..."
                  className="w-full bg-card text-ink border border-border-subtle rounded-xl p-2 text-[11px] font-mono outline-none"
                />
                <button
                  onClick={handleApplyImport}
                  disabled={!importJsonText.trim()}
                  className="btn-secondary text-[12px] h-8 px-3 disabled:opacity-40"
                >
                  <Upload className="w-3.5 h-3.5" /> Apply JSON
                </button>
              </div>

              {backupMessage && (
                <div className="p-2 rounded-lg bg-primary/20 text-primary-on text-[12px] font-bold">
                  {backupMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Key Config Modal */}
      {editingProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-md bg-card rounded-[24px] shadow-2xl p-6 space-y-4 border border-border-subtle"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center font-bold text-xs text-ink">
                  {editingProvider.name.slice(0, 2).toUpperCase()}
                </div>
                <h3 className="text-base font-bold text-ink">{editingProvider.name} Credentials</h3>
              </div>
              <button
                onClick={() => setEditingProvider(null)}
                className="p-1 text-ink-mute hover:text-ink rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-bold text-ink">API Key / Token</label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder={`Paste your ${editingProvider.name} key...`}
                className="wise-input w-full font-mono text-[13px]"
              />
            </div>

            {testResult.status !== "idle" && (
              <div
                className={`p-2.5 rounded-xl text-[12px] font-bold flex items-center gap-2 ${
                  testResult.status === "testing"
                    ? "bg-subtle text-ink"
                    : testResult.status === "ok"
                    ? "bg-primary/20 text-primary-on"
                    : "bg-negative/15 text-negative"
                }`}
              >
                {testResult.status === "testing" && <span>Testing connection...</span>}
                {testResult.status === "ok" && <span>✓ {testResult.message}</span>}
                {testResult.status === "error" && <span>⚠️ {testResult.message}</span>}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
              <button
                onClick={handleTestKey}
                disabled={testResult.status === "testing"}
                className="btn-secondary text-[12px] h-8 px-3"
              >
                <Play className="w-3 h-3" /> Test
              </button>

              <div className="flex items-center gap-2">
                {apiKeys[editingProvider.id] && (
                  <button
                    onClick={() => {
                      onRemoveKey(editingProvider.id);
                      if (onRemoveOAuthToken) onRemoveOAuthToken(editingProvider.id);
                      setEditingProvider(null);
                    }}
                    className="p-1.5 text-negative hover:bg-negative/10 rounded-full"
                    title="Remove saved credential"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setEditingProvider(null)}
                  className="btn-secondary text-[12px] h-8 px-3"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary text-[12px] h-8 px-4"
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
