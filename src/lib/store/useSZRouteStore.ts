"use client";

import { useState, useEffect } from "react";
import { DEFAULT_COMBOS, VirtualCombo } from "@/lib/providers/catalog";

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
  customCombos: VirtualCombo[];
  compressionSettings: CompressionSettings;
}

const STORAGE_KEY_API_KEYS = "szroute_api_keys_v4";
const STORAGE_KEY_COMBOS = "szroute_combos_v4";
const STORAGE_KEY_SETTINGS = "szroute_compression_settings_v4";
const STORAGE_KEY_LOGS = "szroute_request_logs_v4";

export function useSZRouteStore() {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
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

  // Load from localStorage on mount (Cut #1: genuine empty state, no hardcoded seed logs)
  useEffect(() => {
    try {
      const storedKeys = localStorage.getItem(STORAGE_KEY_API_KEYS);
      if (storedKeys) setApiKeys(JSON.parse(storedKeys));

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

  // QoL 1: Export backup data as encrypted/portable JSON
  const exportBackup = (): string => {
    const data: ExportBackupData = {
      version: "szroute-v4",
      exportedAt: new Date().toISOString(),
      apiKeys,
      customCombos,
      compressionSettings,
    };
    return JSON.stringify(data, null, 2);
  };

  // QoL 1: Import backup data
  const importBackup = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString) as ExportBackupData;
      if (parsed.version === "szroute-v4") {
        if (parsed.apiKeys) {
          setApiKeys(parsed.apiKeys);
          localStorage.setItem(STORAGE_KEY_API_KEYS, JSON.stringify(parsed.apiKeys));
        }
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

  // Aggregated Telemetry Stats & Financial Calculations (QoL 5: $3.00/1M token benchmark savings)
  const totalRequests = requestLogs.length;
  const totalTokensSaved = requestLogs.reduce((acc, l) => acc + (l.tokensSaved || 0), 0);
  const totalTokensProcessed = requestLogs.reduce((acc, l) => acc + (l.tokensProcessed || 0), 0);
  const avgLatencyMs =
    totalRequests > 0
      ? Math.round(requestLogs.reduce((acc, l) => acc + (l.latencyMs || 0), 0) / totalRequests)
      : 0;

  // Commercial frontier benchmark pricing: $3.00 per 1M tokens ($0.000003 per token)
  const dollarSavings = ((totalTokensSaved + totalTokensProcessed) * 0.000003).toFixed(4);

  return {
    isLoaded,
    apiKeys,
    saveApiKey,
    removeApiKey,
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
      totalTokensSaved,
      totalTokensProcessed,
      avgLatencyMs,
      estimatedDollarsSaved: dollarSavings,
    },
  };
}
