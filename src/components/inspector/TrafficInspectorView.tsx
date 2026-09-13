"use client";

import React, { useState } from "react";
import {
  Activity,
  Search,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  Flame,
  Clock,
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
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#57c1ff]" />
            Real-time Traffic & Failover Inspector
          </h2>
          <p className="text-[14px] text-[#9c9c9d] mt-1">
            Live telemetry stream capturing routed requests, failover cascades, latency, and RTK token savings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#9c9c9d] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter logs by model/status..."
              className="w-full bg-[#101111] text-white placeholder-[#6a6b6c] border border-[#242728] rounded-lg pl-9 pr-3 py-1.5 text-[13px] outline-none"
            />
          </div>

          <button
            onClick={onClearLogs}
            disabled={requestLogs.length === 0}
            className="btn-secondary text-[13px] flex items-center gap-1.5 text-[#ff6161] hover:bg-[#ff6161]/10 disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
            Clear Logs
          </button>
        </div>
      </div>

      {/* Main Logs Table */}
      <div className="raycast-card overflow-hidden bg-[#0d0d0d]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#101111] border-b border-[#242728] text-[#9c9c9d] font-medium text-[12px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Requested Model</th>
                <th className="py-3 px-4">Resolved Provider</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Tokens (Saved)</th>
                <th className="py-3 px-4">Failover Trail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242728] text-[#cdcdcd]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#6a6b6c]">
                    No traffic logs recorded yet. Send a request from AI Studio or your connected client!
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
                      className="hover:bg-[#101111] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-[12px] text-[#9c9c9d]">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-4 font-medium text-white">
                        {log.model}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 text-[11px] bg-[#121212] text-[#57c1ff] border border-[#242728] rounded font-mono">
                          {log.provider}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1 text-[#59d499]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 200 OK
                          </span>
                        ) : isRateLimit ? (
                          <span className="inline-flex items-center gap-1 text-[#ffc533]">
                            <AlertTriangle className="w-3.5 h-3.5" /> 429 RateLimit
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#ff6161]">
                            <XCircle className="w-3.5 h-3.5" /> {log.status || 500} Error
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[12px] text-[#9c9c9d]">
                        {log.latencyMs}ms
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-white">{log.tokensProcessed}</span>
                        {log.tokensSaved > 0 && (
                          <span className="ml-1 text-[11px] text-[#ff6161] font-mono">
                            (-{log.tokensSaved})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[12px]">
                        {log.failoverAttempts > 0 ? (
                          <span className="text-[#ffc533] flex items-center gap-1">
                            <span>{log.failoverAttempts} failovers</span>
                            <ArrowRight className="w-3 h-3" />
                            <span className="text-[#59d499]">Recovered</span>
                          </span>
                        ) : (
                          <span className="text-[#6a6b6c]">Direct hit (0 failovers)</span>
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

      {/* Selected Entry Detail Card */}
      {selectedEntry && (
        <div className="raycast-card p-6 bg-[#0d0d0d] space-y-4 border border-[#434345]">
          <div className="flex items-center justify-between border-b border-[#242728] pb-3">
            <h3 className="text-base font-medium text-white flex items-center gap-2">
              Request Payload Inspector: <code className="text-[#57c1ff]">{selectedEntry.id}</code>
            </h3>
            <button
              onClick={() => setSelectedEntry(null)}
              className="text-[12px] text-[#9c9c9d] hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[13px]">
            <div>
              <span className="text-[#6a6b6c] block text-[11px] uppercase">Timestamp</span>
              <span className="text-white font-mono">{selectedEntry.timestamp}</span>
            </div>
            <div>
              <span className="text-[#6a6b6c] block text-[11px] uppercase">Selected Model</span>
              <span className="text-white">{selectedEntry.model}</span>
            </div>
            <div>
              <span className="text-[#6a6b6c] block text-[11px] uppercase">Resolved Provider</span>
              <span className="text-[#57c1ff] font-mono">{selectedEntry.provider}</span>
            </div>
            <div>
              <span className="text-[#6a6b6c] block text-[11px] uppercase">Latency</span>
              <span className="text-[#59d499] font-mono">{selectedEntry.latencyMs} ms</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <span className="text-[11px] uppercase tracking-wider text-[#6a6b6c] font-medium">
              Prompt Snippet
            </span>
            <div className="bg-[#101111] p-3 rounded-lg border border-[#242728] text-[13px] font-mono text-[#cdcdcd] whitespace-pre-wrap">
              {selectedEntry.promptSnippet || "No prompt snippet captured"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
