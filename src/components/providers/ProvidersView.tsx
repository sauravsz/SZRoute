"use client";

import React, { useState, useRef } from "react";
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
  Cpu,
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string" && text.trim()) {
        setImportJsonText(text.trim());
        if (onImportBackup) {
          const success = onImportBackup(text.trim());
          if (success) {
            setBackupMessage("Backup restored successfully from file!");
            setTimeout(() => setBackupModalOpen(false), 1200);
          } else {
            setBackupMessage("Invalid backup JSON format.");
          }
        }
      }
    };
    reader.readAsText(file);
  };
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
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Providers, API Keys & OAuth
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)] mt-0.5">
            Configure upstream credentials, OAuth 2.0 PKCE, or GitHub Copilot device authentication.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleStartDeviceFlow("github_copilot")}
            className="btn-liquid-secondary text-[12px] h-9 px-3.5"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Copilot Device Auth</span>
          </button>

          <button
            onClick={handleBenchmarkAll}
            disabled={isBenchmarking}
            className="btn-liquid-secondary text-[12px] h-9 px-3.5"
          >
            <Zap className={`w-3.5 h-3.5 ${isBenchmarking ? "animate-spin text-[#007AFF]" : ""}`} />
            <span>{isBenchmarking ? "Benchmarking..." : "Benchmark Speed"}</span>
          </button>

          <button
            onClick={() => setBackupModalOpen(true)}
            className="btn-liquid-secondary text-[12px] h-9 px-3.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup / Sync</span>
          </button>

          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search (Press /)..."
              className="liquid-input w-full pl-9 pr-3 py-1.5 text-[13px]"
            />
          </div>
        </div>
      </div>

      {/* Segmented Category Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--glass-border-subtle)] pb-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-[var(--glass-surface-subtle)] p-1 rounded-2xl border border-[var(--glass-border-subtle)]">
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
                className={`px-3.5 py-1 rounded-xl text-[12px] font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[#007AFF] to-[#5856D6] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {sortByLatency && (
          <div className="text-[12px] text-[#34C759] font-bold flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sorted by live speed
          </div>
        )}
      </div>

      {/* 3-Up Liquid Glass Provider Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProviders.map((provider) => {
          const hasKey = Boolean(apiKeys[provider.id]);
          const hasOAuth = Boolean(oauthTokens[provider.id]);
          const oauthConfig = OAUTH_PROVIDERS[provider.id];
          const latency = pingLatencies[provider.id];

          return (
            <div
              key={provider.id}
              className="liquid-glass-interactive p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[11px] uppercase font-bold text-[#007AFF]">
                      {hasOAuth ? "OAuth Active" : provider.freeTier.hasFree ? "Free Tier" : "Commercial API"}
                    </div>
                    <h3 className="text-[17px] font-bold text-[var(--text-primary)] mt-0.5">
                      {provider.name}
                    </h3>
                  </div>

                  {latency !== undefined && latency < 9000 && (
                    <span className="text-[11px] font-mono font-bold text-[#34C759] bg-[#34C759]/15 px-2.5 py-0.5 rounded-full border border-[#34C759]/30">
                      {latency}ms
                    </span>
                  )}
                </div>

                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                  {provider.description}
                </p>

                {/* Models List */}
                <div className="space-y-1 pt-1">
                  <div className="flex flex-wrap gap-1">
                    {provider.models.map((m) => (
                      <span
                        key={m.id}
                        className="px-2.5 py-0.5 text-[11px] bg-[var(--glass-surface-subtle)] text-[var(--text-secondary)] font-medium rounded-full border border-[var(--glass-border-subtle)] truncate max-w-[180px]"
                        title={m.name}
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[var(--glass-border-subtle)] flex items-center justify-between text-[12px]">
                <div className="text-[var(--text-secondary)]">
                  {hasOAuth ? (
                    <span className="text-[#34C759] font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> OAuth Ready
                    </span>
                  ) : hasKey ? (
                    <span className="text-[#34C759] font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Key Saved
                    </span>
                  ) : (
                    <span>{provider.freeTier.monthlyFreeTokensEstimate || "Free quota"}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {oauthConfig && !hasOAuth && (
                    <button
                      onClick={() => {
                        if (oauthConfig.type === "device_code") {
                          handleStartDeviceFlow(provider.id);
                        } else {
                          handleStartOAuthRedirect(provider.id);
                        }
                      }}
                      className="btn-liquid-primary text-[11px] h-7 px-3 font-semibold"
                    >
                      OAuth
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenKeyModal(provider)}
                    className="btn-liquid-secondary text-[11px] h-7 px-3 font-semibold"
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

      {/* Device Flow Glass Modal */}
      {deviceFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="w-full max-w-md liquid-glass-elevated p-7 space-y-4 text-center animate-spring-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center mx-auto border border-[#007AFF]/30">
              {deviceFlow.providerId === "github_copilot" ? (
                <Github className="w-6 h-6" />
              ) : (
                <Cpu className="w-6 h-6 text-[#FF9900]" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-black text-[var(--text-primary)]">
                {deviceFlow.providerId === "kiro"
                  ? "Kiro AI (AWS Builder ID) Login"
                  : "GitHub Copilot Device Login"}
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1 font-medium">
                {deviceFlow.providerId === "kiro"
                  ? "Enter this verification code on AWS Builder ID:"
                  : "Enter this 8-digit verification code on GitHub:"}
              </p>
            </div>

            <div className="p-4 bg-[var(--glass-surface-subtle)] rounded-2xl border border-[var(--glass-border)] shadow-inner">
              <div className="text-3xl font-mono font-black text-[#007AFF] tracking-widest select-all">
                {deviceFlow.userCode}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={deviceFlow.verificationUri}
                target="_blank"
                rel="noreferrer"
                className="btn-liquid-primary w-full h-11 text-[13px] flex items-center justify-center gap-2"
              >
                <span>
                  {deviceFlow.providerId === "kiro"
                    ? "Open AWS to Authorize"
                    : "Open GitHub to Authorize"}
                </span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="text-[12px] text-[var(--text-secondary)] flex items-center justify-center gap-1.5 pt-1">
                {deviceFlow.status === "polling" && (
                  <>
                    <Zap className="w-3.5 h-3.5 animate-spin text-[#007AFF]" />
                    <span>
                      {deviceFlow.providerId === "kiro"
                        ? "Awaiting approval on AWS..."
                        : "Awaiting approval on GitHub..."}
                    </span>
                  </>
                )}
                {deviceFlow.status === "success" && (
                  <span className="text-[#34C759] font-bold">
                    ✓ {deviceFlow.providerId === "kiro" ? "Kiro AI connected!" : "Copilot connected!"}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setDeviceFlow(null)}
              className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold pt-1 block mx-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Backup & Restore Glass Modal */}
      {backupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg liquid-glass-elevated p-6 space-y-4 animate-spring-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--glass-border-subtle)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Backup & Synchronization</h3>
              <button
                onClick={() => setBackupModalOpen(false)}
                className="p-1 rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-surface-subtle)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-[13px]">
              <div className="p-4 bg-[var(--glass-surface-subtle)] rounded-2xl border border-[var(--glass-border-subtle)] space-y-2">
                <div className="font-bold text-[var(--text-primary)]">Export Gateway State</div>
                <p className="text-[var(--text-secondary)] text-[12px]">
                  Download a portable JSON snapshot containing your {Object.keys(apiKeys).length} configured API key(s)
                  {oauthTokens && Object.keys(oauthTokens).length > 0
                    ? ` and ${Object.keys(oauthTokens).length} connected OAuth account(s)`
                    : ""}.
                </p>
                <button
                  onClick={handleDownloadBackup}
                  className="btn-liquid-primary text-[12px] h-8 px-4"
                >
                  <Download className="w-3.5 h-3.5" /> Download JSON Backup
                </button>
              </div>

              <div className="p-4 bg-[var(--glass-surface-subtle)] rounded-2xl border border-[var(--glass-border-subtle)] space-y-2">
                <div className="font-bold text-[var(--text-primary)]">Restore Gateway State</div>
                <p className="text-[var(--text-secondary)] text-[12px]">
                  Upload a previously exported backup file or paste its JSON content below.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-liquid-secondary text-[12px] h-8 px-4"
                  >
                    <Upload className="w-3.5 h-3.5" /> Choose .json File
                  </button>
                  <span className="text-[11px] text-[var(--text-secondary)]">or paste JSON</span>
                </div>
                <textarea
                  rows={3}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Paste backup snapshot JSON..."
                  className="w-full bg-[var(--glass-surface)] text-[var(--text-primary)] border border-[var(--glass-border)] rounded-xl p-2.5 text-[11px] font-mono outline-none"
                />
                <button
                  onClick={handleApplyImport}
                  disabled={!importJsonText.trim()}
                  className="btn-liquid-primary text-[12px] h-8 px-4 disabled:opacity-40"
                >
                  <Check className="w-3.5 h-3.5" /> Restore Snapshot
                </button>
              </div>

              {backupMessage && (
                <div className="p-2.5 bg-[#34C759]/20 text-[#34C759] text-[12px] font-bold rounded-xl border border-[#34C759]/30">
                  {backupMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Key Config Glass Modal */}
      {editingProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="w-full max-w-md liquid-glass-elevated p-6 space-y-4 animate-spring-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--glass-border-subtle)] pb-3">
              <div>
                <div className="text-[11px] uppercase font-bold text-[#007AFF]">Credential Setup</div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">{editingProvider.name}</h3>
              </div>
              <button
                onClick={() => setEditingProvider(null)}
                className="p-1 rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-surface-subtle)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-semibold text-[var(--text-primary)]">API Key / Secret Token</label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder={`Paste your ${editingProvider.name} key...`}
                className="liquid-input w-full font-mono text-[13px]"
              />
            </div>

            {testResult.status !== "idle" && (
              <div
                className={`p-3 text-[12px] font-semibold rounded-2xl flex items-center gap-2 ${
                  testResult.status === "testing"
                    ? "bg-[var(--glass-surface-subtle)] text-[var(--text-primary)]"
                    : testResult.status === "ok"
                    ? "bg-[#34C759]/20 text-[#34C759] border border-[#34C759]/30"
                    : "bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/30"
                }`}
              >
                {testResult.status === "testing" && <span>Testing connection...</span>}
                {testResult.status === "ok" && <span>✓ {testResult.message}</span>}
                {testResult.status === "error" && <span>⚠️ {testResult.message}</span>}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[var(--glass-border-subtle)]">
              <button
                onClick={handleTestKey}
                disabled={testResult.status === "testing"}
                className="btn-liquid-secondary text-[12px] h-9 px-4"
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
                    className="p-2 rounded-xl text-[#FF3B30] hover:bg-[#FF3B30]/15"
                    title="Remove credential"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setEditingProvider(null)}
                  className="btn-liquid-secondary text-[12px] h-9 px-4"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn-liquid-primary text-[12px] h-9 px-5"
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
