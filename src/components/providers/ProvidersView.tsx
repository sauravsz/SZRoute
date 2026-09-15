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
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e6e6e6] pb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#262626] tracking-tight">
            Providers, Credentials & OAuth
          </h2>
          <p className="text-[15px] text-[#3c3c3c] font-light mt-1">
            Configure upstream API credentials, OAuth 2.0 PKCE, or GitHub Copilot device authentication.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleStartDeviceFlow("github_copilot")}
            className="btn-secondary text-[12px] h-10 px-4 uppercase tracking-[0.5px]"
          >
            <Github className="w-3.5 h-3.5" />
            <span>COPILOT DEVICE AUTH</span>
          </button>

          <button
            onClick={handleBenchmarkAll}
            disabled={isBenchmarking}
            className="btn-secondary text-[12px] h-10 px-4 uppercase tracking-[0.5px]"
          >
            <Zap className={`w-3.5 h-3.5 ${isBenchmarking ? "animate-spin text-[#1c69d4]" : ""}`} />
            <span>{isBenchmarking ? "BENCHMARKING..." : "BENCHMARK SPEED"}</span>
          </button>

          <button
            onClick={() => setBackupModalOpen(true)}
            className="btn-secondary text-[12px] h-10 px-4 uppercase tracking-[0.5px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>BACKUP / SYNC</span>
          </button>

          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-[#6b6b6b] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter providers (Press /)..."
              className="bmw-input w-full pl-9 pr-3 py-2 text-[13px]"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs with 2px Underline */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e6e6e6] pb-1">
        <div className="flex flex-wrap items-center gap-6">
          {[
            { id: "all", label: "ALL PROVIDERS" },
            { id: "free", label: "100% FREE TIERS" },
            { id: "commercial", label: "COMMERCIAL FRONTIER" },
            { id: "local", label: "LOCAL INFERENCE" },
          ].map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`py-3 text-[12px] font-bold tracking-[1.5px] uppercase transition-colors relative ${
                  isActive ? "text-[#1c69d4]" : "text-[#6b6b6b] hover:text-[#262626]"
                }`}
              >
                {tab.label}
                {isActive && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1c69d4]" />}
              </button>
            );
          })}
        </div>

        {sortByLatency && (
          <div className="text-[12px] text-[#22c55e] font-bold flex items-center gap-1 font-mono uppercase tracking-[0.5px]">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sorted by live speed
          </div>
        )}
      </div>

      {/* 3-Up Provider Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.map((provider) => {
          const hasKey = Boolean(apiKeys[provider.id]);
          const hasOAuth = Boolean(oauthTokens[provider.id]);
          const oauthConfig = OAUTH_PROVIDERS[provider.id];
          const latency = pingLatencies[provider.id];

          return (
            <div
              key={provider.id}
              className="bmw-card space-y-4 flex flex-col justify-between hover:border-[#1c69d4] transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-[1.5px] text-[#1c69d4] font-bold">
                      {hasOAuth ? "OAUTH ACTIVE" : provider.freeTier.hasFree ? "FREE TIER" : "COMMERCIAL API"}
                    </div>
                    <h3 className="text-[18px] font-bold text-[#262626] mt-0.5">
                      {provider.name}
                    </h3>
                  </div>

                  {latency !== undefined && latency < 9000 && (
                    <span className="text-[11px] font-mono font-bold text-[#22c55e] bg-[#f7f7f7] px-2 py-0.5 border border-[#e6e6e6]">
                      {latency}ms
                    </span>
                  )}
                </div>

                <p className="text-[13px] text-[#3c3c3c] font-light leading-relaxed line-clamp-2">
                  {provider.description}
                </p>

                {/* Models List */}
                <div className="space-y-1 pt-1">
                  <div className="text-[11px] uppercase tracking-[1px] text-[#6b6b6b] font-bold">
                    Models ({provider.models.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {provider.models.map((m) => (
                      <span
                        key={m.id}
                        className="px-2 py-0.5 text-[11px] bg-[#fafafa] border border-[#e6e6e6] text-[#262626] font-light truncate max-w-[180px]"
                        title={m.name}
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[#e6e6e6] flex items-center justify-between text-[12px]">
                <div className="text-[#3c3c3c]">
                  {hasOAuth ? (
                    <span className="text-[#22c55e] font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> OAuth Ready
                    </span>
                  ) : hasKey ? (
                    <span className="text-[#22c55e] font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Key Stored
                    </span>
                  ) : (
                    <span className="text-[#6b6b6b] font-light">
                      {provider.freeTier.monthlyFreeTokensEstimate || "Free quota"}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {oauthConfig && !hasOAuth && (
                    <button
                      onClick={() => handleStartOAuthRedirect(provider.id)}
                      className="btn-primary text-[11px] h-8 px-3 uppercase tracking-[0.5px]"
                    >
                      OAUTH
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenKeyModal(provider)}
                    className="btn-secondary text-[11px] h-8 px-3 uppercase tracking-[0.5px]"
                  >
                    <Key className="w-3 h-3" />
                    <span>{hasKey || hasOAuth ? "EDIT" : "KEY"}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* GitHub Copilot Device Flow Modal */}
      {deviceFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2129]/75 backdrop-blur-xs">
          <div
            className="w-full max-w-md bg-[#ffffff] border-2 border-[#1c69d4] shadow-2xl p-8 space-y-5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 border-2 border-[#1c69d4] bg-[#ffffff] flex items-center justify-center mx-auto text-[#1c69d4]">
              <Github className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#262626]">GitHub Copilot Device Auth</h3>
              <p className="text-[14px] text-[#3c3c3c] font-light mt-1">
                Enter this 8-digit verification code on GitHub:
              </p>
            </div>

            <div className="p-4 bg-[#f7f7f7] border border-[#cccccc]">
              <div className="text-3xl font-mono font-bold text-[#1c69d4] tracking-widest select-all">
                {deviceFlow.userCode}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href={deviceFlow.verificationUri}
                target="_blank"
                rel="noreferrer"
                className="btn-primary w-full h-11 text-[13px] uppercase tracking-[1px] flex items-center justify-center gap-2"
              >
                <span>OPEN GITHUB VERIFICATION</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="text-[12px] text-[#6b6b6b] font-light flex items-center justify-center gap-1.5 pt-1">
                {deviceFlow.status === "polling" && (
                  <>
                    <Zap className="w-3.5 h-3.5 animate-spin text-[#1c69d4]" />
                    <span>Awaiting authorization on GitHub...</span>
                  </>
                )}
                {deviceFlow.status === "success" && (
                  <span className="text-[#22c55e] font-bold">✓ Copilot successfully connected!</span>
                )}
              </div>
            </div>

            <button
              onClick={() => setDeviceFlow(null)}
              className="text-[12px] text-[#6b6b6b] hover:text-[#262626] uppercase font-bold tracking-[1px] pt-2"
            >
              DISMISS
            </button>
          </div>
        </div>
      )}

      {/* Backup & Restore Modal */}
      {backupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2129]/75 backdrop-blur-xs">
          <div
            className="w-full max-w-lg bg-[#ffffff] border border-[#cccccc] shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e6e6e6] pb-3">
              <h3 className="text-lg font-bold text-[#262626]">Backup & State Synchronization</h3>
              <button
                onClick={() => setBackupModalOpen(false)}
                className="p-1 text-[#6b6b6b] hover:text-[#262626]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-[13px]">
              <div className="p-4 bg-[#f7f7f7] border border-[#e6e6e6] space-y-2">
                <div className="font-bold text-[#262626] uppercase tracking-[0.5px]">Export Gateway State</div>
                <p className="text-[#3c3c3c] font-light">
                  Download encrypted JSON snapshot containing your configured API keys, OAuth tokens, and combos.
                </p>
                <button
                  onClick={handleDownloadBackup}
                  className="btn-primary text-[12px] h-9 px-4 uppercase tracking-[0.5px]"
                >
                  <Download className="w-3.5 h-3.5" /> DOWNLOAD SNAPSHOT JSON
                </button>
              </div>

              <div className="p-4 bg-[#f7f7f7] border border-[#e6e6e6] space-y-2">
                <div className="font-bold text-[#262626] uppercase tracking-[0.5px]">Restore Gateway State</div>
                <textarea
                  rows={3}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Paste snapshot JSON..."
                  className="w-full bg-[#ffffff] text-[#262626] border border-[#cccccc] p-2 text-[12px] font-mono outline-none"
                />
                <button
                  onClick={handleApplyImport}
                  disabled={!importJsonText.trim()}
                  className="btn-secondary text-[12px] h-9 px-4 uppercase tracking-[0.5px] disabled:opacity-40"
                >
                  <Upload className="w-3.5 h-3.5" /> RESTORE SNAPSHOT
                </button>
              </div>

              {backupMessage && (
                <div className="p-2.5 bg-[#f7f7f7] text-[#22c55e] text-[12px] font-bold border border-[#22c55e]">
                  {backupMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Key Configuration Modal */}
      {editingProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2129]/75 backdrop-blur-xs">
          <div
            className="w-full max-w-md bg-[#ffffff] border-2 border-[#1c69d4] shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e6e6e6] pb-3">
              <div>
                <div className="text-[11px] uppercase tracking-[1.5px] text-[#1c69d4] font-bold">CREDENTIAL CONFIG</div>
                <h3 className="text-lg font-bold text-[#262626]">{editingProvider.name}</h3>
              </div>
              <button
                onClick={() => setEditingProvider(null)}
                className="p-1 text-[#6b6b6b] hover:text-[#262626]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#262626] uppercase tracking-[0.5px]">API Key / Secret Token</label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder={`Paste your ${editingProvider.name} key...`}
                className="bmw-input w-full font-mono text-[13px]"
              />
            </div>

            {testResult.status !== "idle" && (
              <div
                className={`p-3 text-[12px] font-bold border ${
                  testResult.status === "testing"
                    ? "bg-[#f7f7f7] text-[#262626] border-[#cccccc]"
                    : testResult.status === "ok"
                    ? "bg-[#ffffff] text-[#22c55e] border-[#22c55e]"
                    : "bg-[#ffffff] text-[#dc2626] border-[#dc2626]"
                }`}
              >
                {testResult.status === "testing" && <span>Testing connection...</span>}
                {testResult.status === "ok" && <span>✓ {testResult.message}</span>}
                {testResult.status === "error" && <span>⚠️ {testResult.message}</span>}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[#e6e6e6]">
              <button
                onClick={handleTestKey}
                disabled={testResult.status === "testing"}
                className="btn-secondary text-[12px] h-9 px-4 uppercase tracking-[0.5px]"
              >
                <Play className="w-3.5 h-3.5" /> TEST
              </button>

              <div className="flex items-center gap-2">
                {apiKeys[editingProvider.id] && (
                  <button
                    onClick={() => {
                      onRemoveKey(editingProvider.id);
                      if (onRemoveOAuthToken) onRemoveOAuthToken(editingProvider.id);
                      setEditingProvider(null);
                    }}
                    className="p-2 text-[#dc2626] hover:bg-[#fafafa] border border-[#dc2626]"
                    title="Remove credential"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setEditingProvider(null)}
                  className="btn-secondary text-[12px] h-9 px-4 uppercase tracking-[0.5px]"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary text-[12px] h-9 px-5 uppercase tracking-[0.5px]"
                >
                  SAVE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
