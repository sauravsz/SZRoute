"use client";

import { useState, useEffect } from "react";
import { DEFAULT_COMBOS, VirtualCombo } from "@/lib/providers/catalog";
import { OAuthTokenData } from "@/lib/oauth/providers";

export interface RequestLogEntry {
  id: string;
  timestamp: string;
  model: string;
  provider: string;
  latencyMs: number;
  status: number;
  tokensProcessed: number;
  tokensSaved: number;
  failoverAttempts: number;
  promptSnippet: string;
}

export interface CompressionSettings {
  enabled: boolean;
  level: "gentle" | "standard" | "aggressive";
  stripMarkdown: boolean;
  compactJson: boolean;
  deduplicate: boolean;
}

export interface ExportBackupData {
  version: "szroute-v4";
  exportedAt: string;
  apiKeys: Record<string, string>;
  oauthTokens?: Record<string, OAuthTokenData>;
  customCombos: VirtualCombo[];
  compressionSettings: CompressionSettings;
}

const STORAGE_KEY_API_KEYS = "szroute_api_keys_v4";
const STORAGE_KEY_OAUTH = "szroute_oauth_tokens_v4";
const STORAGE_KEY_COMBOS = "szroute_combos_v4";
const STORAGE_KEY_SETTINGS = "szroute_compression_settings_v4";
const STORAGE_KEY_LOGS = "szroute_request_logs_v4";

export function useSZRouteStore() {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [oauthTokens, setOauthTokens] = useState<Record<string, OAuthTokenData>>({});
  const [customCombos, setCustomCombos] = useState<VirtualCombo[]>(DEFAULT_COMBOS);
  const [compressionSettings, setCompressionSettings] = useState<CompressionSettings>({
    enabled: true,
    level: "standard",
    stripMarkdown: true,
    compactJson: true,
    deduplicate: true,
  });
  const [requestLogs, setRequestLogs] = useState<RequestLogEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedKeys = localStorage.getItem(STORAGE_KEY_API_KEYS);
      if (storedKeys) setApiKeys(JSON.parse(storedKeys));

      const storedOauth = localStorage.getItem(STORAGE_KEY_OAUTH);
      if (storedOauth) setOauthTokens(JSON.parse(storedOauth));

      const storedCombos = localStorage.getItem(STORAGE_KEY_COMBOS);
      if (storedCombos) setCustomCombos(JSON.parse(storedCombos));

      const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (storedSettings) setCompressionSettings(JSON.parse(storedSettings));

      const storedLogs = localStorage.getItem(STORAGE_KEY_LOGS);
      if (storedLogs) setRequestLogs(JSON.parse(storedLogs));
    } catch {
      // ignore parse errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Listen for OAuth postMessage events from popups
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === "szroute_oauth_success" && event.data?.data) {
        const tokenData = event.data.data as OAuthTokenData;
        saveOAuthToken(tokenData.providerId, tokenData);
      }
    };
    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [oauthTokens, apiKeys]);

  // Automatic OAuth Token Refresh Loop (proactively refreshes tokens before 60-min expiry)
  useEffect(() => {
    if (!isLoaded) return;

    let isCancelled = false;

    const checkAndRefreshTokens = async () => {
      const now = Date.now();
      const entries = Object.entries(oauthTokens);

      for (const [providerId, tokenData] of entries) {
        if (!tokenData || !tokenData.refreshToken) continue;

        // Proactively refresh if expired or expiring within 5 minutes (300,000 ms)
        const isExpiringSoon = !tokenData.expiresAt || tokenData.expiresAt - now < 300_000;
        if (!isExpiringSoon) continue;

        try {
          const res = await fetch("/api/oauth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              providerId,
              refreshToken: tokenData.refreshToken,
            }),
          });

          if (res.ok) {
            const json = await res.json();
            if (json.success && json.tokenData && !isCancelled) {
              const fresh: OAuthTokenData = {
                ...tokenData,
                accessToken: json.tokenData.accessToken,
                refreshToken: json.tokenData.refreshToken || tokenData.refreshToken,
                expiresIn: json.tokenData.expiresIn,
                expiresAt: json.tokenData.expiresAt,
              };
              saveOAuthToken(providerId, fresh);
              console.log(
                `[SZRoute Auto-Refresh] Successfully refreshed token for '${providerId}' (valid for ${Math.round(
                  json.tokenData.expiresIn / 60
                )}m)`
              );
            }
          }
        } catch (err) {
          console.warn(`[SZRoute Auto-Refresh] Background refresh attempt for '${providerId}' failed:`, err);
        }
      }
    };

    // Run check on mount
    checkAndRefreshTokens();

    // Check every 60 seconds
    const interval = setInterval(checkAndRefreshTokens, 60_000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [isLoaded, oauthTokens]);
  const saveApiKey = (providerId: string, key: string) => {
    const updated = { ...apiKeys, [providerId]: key };
    setApiKeys(updated);
    try {
      localStorage.setItem(STORAGE_KEY_API_KEYS, JSON.stringify(updated));
    } catch {}
  };

  const removeApiKey = (providerId: string) => {
    const updated = { ...apiKeys };
    delete updated[providerId];
    setApiKeys(updated);
    try {
      localStorage.setItem(STORAGE_KEY_API_KEYS, JSON.stringify(updated));
    } catch {}
  };

  const saveOAuthToken = (providerId: string, tokenData: OAuthTokenData) => {
    const updated = { ...oauthTokens, [providerId]: tokenData };
    setOauthTokens(updated);
    // Also save access token to apiKeys map for instant transparent gateway routing
    const updatedKeys = { ...apiKeys, [providerId]: tokenData.accessToken };
    setApiKeys(updatedKeys);
    try {
      localStorage.setItem(STORAGE_KEY_OAUTH, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEY_API_KEYS, JSON.stringify(updatedKeys));
    } catch {}
  };

  const removeOAuthToken = (providerId: string) => {
    const updated = { ...oauthTokens };
    delete updated[providerId];
    setOauthTokens(updated);
    const updatedKeys = { ...apiKeys };
    delete updatedKeys[providerId];
    setApiKeys(updatedKeys);
    try {
      localStorage.setItem(STORAGE_KEY_OAUTH, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEY_API_KEYS, JSON.stringify(updatedKeys));
    } catch {}
  };

  const saveCombos = (combos: VirtualCombo[]) => {
    setCustomCombos(combos);
    try {
      localStorage.setItem(STORAGE_KEY_COMBOS, JSON.stringify(combos));
    } catch {}
  };

  const saveCompressionSettings = (settings: CompressionSettings) => {
    setCompressionSettings(settings);
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {}
  };

  const addRequestLog = (entry: Omit<RequestLogEntry, "id" | "timestamp">) => {
    const newEntry: RequestLogEntry = {
      ...entry,
      id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    const updated = [newEntry, ...requestLogs].slice(0, 200);
    setRequestLogs(updated);
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
    } catch {}
  };

  const clearLogs = () => {
    setRequestLogs([]);
    try {
      localStorage.removeItem(STORAGE_KEY_LOGS);
    } catch {}
  };

  const exportBackup = (): string => {
    const data: ExportBackupData = {
      version: "szroute-v4",
      exportedAt: new Date().toISOString(),
      apiKeys,
      oauthTokens,
      customCombos,
      compressionSettings,
    };
    return JSON.stringify(data, null, 2);
  };

  const importBackup = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString) as ExportBackupData;
      if (parsed.version === "szroute-v4") {
        const mergedKeys = { ...(parsed.apiKeys || {}) };
        if (parsed.oauthTokens) {
          for (const [pId, tokenData] of Object.entries(parsed.oauthTokens)) {
            if (tokenData && tokenData.accessToken && !mergedKeys[pId]) {
              mergedKeys[pId] = tokenData.accessToken;
            }
          }
          setOauthTokens(parsed.oauthTokens);
          localStorage.setItem(STORAGE_KEY_OAUTH, JSON.stringify(parsed.oauthTokens));
        }
        setApiKeys(mergedKeys);
        localStorage.setItem(STORAGE_KEY_API_KEYS, JSON.stringify(mergedKeys));
        if (parsed.customCombos) {
          setCustomCombos(parsed.customCombos);
          localStorage.setItem(STORAGE_KEY_COMBOS, JSON.stringify(parsed.customCombos));
        }
        if (parsed.compressionSettings) {
          setCompressionSettings(parsed.compressionSettings);
          localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(parsed.compressionSettings));
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const totalRequests = requestLogs.length;
  const successfulLogs = requestLogs.filter(
    (l) => typeof l.status === "number" ? l.status >= 200 && l.status < 300 : true
  );
  const successRate = totalRequests > 0 ? Math.round((successfulLogs.length / totalRequests) * 100) : 100;
  const totalTokensSaved = requestLogs.reduce((acc, l) => acc + (l.tokensSaved || 0), 0);
  const totalTokensProcessed = successfulLogs.reduce((acc, l) => acc + (l.tokensProcessed || 0), 0);
  const avgLatencyMs =
    successfulLogs.length > 0
      ? Math.round(successfulLogs.reduce((acc, l) => acc + (l.latencyMs || 0), 0) / successfulLogs.length)
      : totalRequests > 0
      ? Math.round(requestLogs.reduce((acc, l) => acc + (l.latencyMs || 0), 0) / totalRequests)
      : 0;

  const dollarSavings = ((totalTokensSaved + totalTokensProcessed) * 0.000003).toFixed(4);
  return {
    isLoaded,
    apiKeys,
    saveApiKey,
    removeApiKey,
    oauthTokens,
    saveOAuthToken,
    removeOAuthToken,
    customCombos,
    saveCombos,
    compressionSettings,
    saveCompressionSettings,
    requestLogs,
    addRequestLog,
    clearLogs,
    exportBackup,
    importBackup,
    stats: {
      totalRequests,
      successRate,
      totalTokensSaved,
      totalTokensProcessed,
      avgLatencyMs,
      estimatedDollarsSaved: dollarSavings,
    },
  };
}
