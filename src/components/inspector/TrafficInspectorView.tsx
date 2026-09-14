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
          <h2 className="text-3xl font-black text-[#0e0f0c] tracking-tight flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-[#0e0f0c]" />
            Real-time Traffic & Failover Inspector
          </h2>
          <p className="text-[15px] text-[#454745] font-medium mt-1">
            Live telemetry stream capturing routed requests, failover cascades, latency, and RTK token savings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#868685] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by model/status..."
              className="w-full bg-[#ffffff] text-[#0e0f0c] placeholder-[#868685] border border-[#e8ebe6] rounded-full pl-9 pr-4 py-2 text-[13px] font-medium outline-none shadow-xs"
            />
          </div>

          <button
            onClick={onClearLogs}
            disabled={requestLogs.length === 0}
            className="btn-secondary text-[13px] flex items-center gap-1.5 text-[#d03238] disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
            Clear Logs
          </button>
        </div>
      </div>

      {/* Main Logs Table in Wise Card */}
      <div className="wise-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-[#e8ebe6] text-[#454745] font-bold text-[12px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Time</th>
                <th className="py-3.5 px-5">Requested Model</th>
                <th className="py-3.5 px-5">Resolved Provider</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Latency</th>
                <th className="py-3.5 px-5">Tokens (Saved)</th>
                <th className="py-3.5 px-5">Failover Trail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8ebe6] text-[#0e0f0c]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-[#868685] font-medium">
                    No traffic logs recorded yet. Send a request from Oh My Pi (omp) or AI Studio to observe live streams!
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
                      className="hover:bg-[#f7f8f6] cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-5 font-mono text-[13px] text-[#868685] font-medium">
                        {log.timestamp}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-[#0e0f0c]">
                        {log.model}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-1 text-[12px] bg-[#e2f6d5] text-[#054d28] font-mono font-bold rounded-full">
                          {log.provider}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        {isSuccess ? (
                          <span className="badge-positive py-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 200 OK
                          </span>
                        ) : isRateLimit ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ffd11a]/20 text-[#b86700] text-[12px] font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" /> 429 RateLimit
                          </span>
                        ) : (
                          <span className="badge-negative py-0.5">
                            <XCircle className="w-3.5 h-3.5" /> {log.status || 500} Error
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-[13px] text-[#454745] font-semibold">
                        {log.latencyMs}ms
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-mono font-bold text-[#0e0f0c]">{log.tokensProcessed}</span>
                        {log.tokensSaved > 0 && (
                          <span className="ml-1.5 text-[12px] text-[#d03238] font-mono font-bold">
                            (-{log.tokensSaved})
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-[13px]">
                        {log.failoverAttempts > 0 ? (
                          <span className="text-[#b86700] font-bold flex items-center gap-1">
                            <span>{log.failoverAttempts} failovers</span>
                            <ArrowRight className="w-3 h-3" />
                            <span className="text-[#2ead4b]">Recovered</span>
                          </span>
                        ) : (
                          <span className="text-[#868685] font-medium">Direct hit (0 failovers)</span>
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
        <div className="wise-card p-6 space-y-4 border-2 border-[#0e0f0c]">
          <div className="flex items-center justify-between border-b border-[#e8ebe6] pb-3">
            <h3 className="text-base font-bold text-[#0e0f0c] flex items-center gap-2">
              Request Payload Inspector: <code className="text-[#054d28] font-bold">{selectedEntry.id}</code>
            </h3>
            <button
              onClick={() => setSelectedEntry(null)}
              className="text-[13px] font-bold text-[#868685] hover:text-[#0e0f0c]"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[14px]">
            <div>
              <span className="text-[#868685] block text-[11px] font-bold uppercase">Timestamp</span>
              <span className="text-[#0e0f0c] font-mono font-bold">{selectedEntry.timestamp}</span>
            </div>
            <div>
              <span className="text-[#868685] block text-[11px] font-bold uppercase">Selected Model</span>
              <span className="text-[#0e0f0c] font-bold">{selectedEntry.model}</span>
            </div>
            <div>
              <span className="text-[#868685] block text-[11px] font-bold uppercase">Resolved Provider</span>
              <span className="text-[#054d28] font-mono font-bold">{selectedEntry.provider}</span>
            </div>
            <div>
              <span className="text-[#868685] block text-[11px] font-bold uppercase">Latency</span>
              <span className="text-[#2ead4b] font-mono font-bold">{selectedEntry.latencyMs} ms</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <span className="text-[12px] uppercase tracking-wider text-[#868685] font-bold">
              Prompt Snippet
            </span>
            <div className="bg-[#e8ebe6] p-4 rounded-[16px] text-[13px] font-mono text-[#0e0f0c] whitespace-pre-wrap font-medium">
              {selectedEntry.promptSnippet || "No prompt snippet captured"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
