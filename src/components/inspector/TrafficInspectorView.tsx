"use client";

import React, { useState } from "react";
import {
  Activity,
  Search,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { RequestLogEntry } from "@/lib/store/useSZRouteStore";

interface TrafficInspectorViewProps {
  requestLogs: RequestLogEntry[];
  onClearLogs: () => void;
}

export function TrafficInspectorView({ requestLogs, onClearLogs }: TrafficInspectorViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<RequestLogEntry | null>(null);

  const filteredLogs = requestLogs.filter((log) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      log.model.toLowerCase().includes(q) ||
      log.provider.toLowerCase().includes(q) ||
      log.promptSnippet.toLowerCase().includes(q) ||
      String(log.status).includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Live Traffic Logs
          </h2>
          <p className="text-[14px] text-ink-body font-medium mt-0.5">
            Real-time telemetry stream capturing routed requests, failover trails, and latency
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-ink-mute absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter logs..."
              className="wise-input w-full pl-9 pr-3 py-1.5 text-[12px] rounded-full"
            />
          </div>

          <button
            onClick={onClearLogs}
            disabled={requestLogs.length === 0}
            className="btn-secondary text-[12px] h-8 px-3 text-negative disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="wise-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-subtle text-ink-body font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Model</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Tokens</th>
                <th className="py-3 px-4">Failover</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-ink">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-ink-mute font-medium">
                    No traffic logs recorded yet. Send a request from Oh My Pi (omp) or AI Studio!
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isSuccess = log.status >= 200 && log.status < 300;
                  const isRateLimit = log.status === 429;

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedEntry(log)}
                      className="hover:bg-subtle/50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-4 font-mono text-[12px] text-ink-mute">
                        {log.timestamp}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-ink">
                        {log.model}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="badge-positive py-0 text-[11px]">
                          {log.provider}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        {isSuccess ? (
                          <span className="text-positive font-bold text-[12px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 200 OK
                          </span>
                        ) : isRateLimit ? (
                          <span className="text-warning font-bold text-[12px] flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> 429
                          </span>
                        ) : (
                          <span className="text-negative font-bold text-[12px] flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> {log.status || 500}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[12px] text-ink-body font-semibold">
                        {log.latencyMs}ms
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="font-mono font-bold text-ink">{log.tokensProcessed}</span>
                        {log.tokensSaved > 0 && (
                          <span className="ml-1 text-[11px] text-negative font-mono font-bold">
                            (-{log.tokensSaved})
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-[12px]">
                        {log.failoverAttempts > 0 ? (
                          <span className="text-warning font-bold flex items-center gap-1">
                            <span>{log.failoverAttempts} failover</span>
                            <ArrowRight className="w-3 h-3" />
                            <span className="text-positive">OK</span>
                          </span>
                        ) : (
                          <span className="text-ink-mute">Direct</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Payload Modal */}
      {selectedEntry && (
        <div className="wise-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              Request Payload: <code className="text-positive font-mono">{selectedEntry.id}</code>
            </h3>
            <button
              onClick={() => setSelectedEntry(null)}
              className="text-[12px] font-bold text-ink-mute hover:text-ink"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px]">
            <div>
              <span className="text-ink-mute block text-[10px] font-bold uppercase">Time</span>
              <span className="text-ink font-mono font-bold">{selectedEntry.timestamp}</span>
            </div>
            <div>
              <span className="text-ink-mute block text-[10px] font-bold uppercase">Model</span>
              <span className="text-ink font-bold">{selectedEntry.model}</span>
            </div>
            <div>
              <span className="text-ink-mute block text-[10px] font-bold uppercase">Provider</span>
              <span className="text-positive font-mono font-bold">{selectedEntry.provider}</span>
            </div>
            <div>
              <span className="text-ink-mute block text-[10px] font-bold uppercase">Latency</span>
              <span className="text-positive font-mono font-bold">{selectedEntry.latencyMs} ms</span>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <span className="text-[11px] uppercase font-bold text-ink-mute">
              Prompt Snippet
            </span>
            <div className="bg-subtle p-3 rounded-xl text-[12px] font-mono text-ink whitespace-pre-wrap">
              {selectedEntry.promptSnippet || "No prompt snippet"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
