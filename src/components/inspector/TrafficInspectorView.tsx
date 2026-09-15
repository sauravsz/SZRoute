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
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e6e6e6] pb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#262626] tracking-tight">
            Real-time Telemetry & Failover Stream
          </h2>
          <p className="text-[15px] text-[#3c3c3c] font-light mt-1">
            Live telemetry stream capturing routed requests, failover trails, latency, and RTK token savings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#6b6b6b] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter logs (Press /)..."
              className="bmw-input w-full pl-9 pr-3 py-2 text-[13px]"
            />
          </div>

          <button
            onClick={onClearLogs}
            disabled={requestLogs.length === 0}
            className="btn-secondary text-[12px] h-10 px-4 uppercase tracking-[0.5px] text-[#dc2626] disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            CLEAR
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bmw-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f7f7f7] border-b border-[#e6e6e6] text-[#262626] font-bold text-[11px] uppercase tracking-[1.5px]">
              <tr>
                <th className="py-3.5 px-4">TIMESTAMP</th>
                <th className="py-3.5 px-4">REQUESTED MODEL</th>
                <th className="py-3.5 px-4">RESOLVED PROVIDER</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4">LATENCY</th>
                <th className="py-3.5 px-4">TOKENS (SAVED)</th>
                <th className="py-3.5 px-4">FAILOVER TRAIL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e6e6] text-[#262626]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-[#6b6b6b] font-light">
                    No telemetry records captured yet. Send a completion from Oh My Pi (omp) or AI Studio to observe live streams.
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
                      className="hover:bg-[#fafafa] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-[12px] text-[#6b6b6b]">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#262626]">
                        {log.model}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-[#f7f7f7] border border-[#e6e6e6] text-[#1c69d4] font-mono font-bold text-[11px] uppercase">
                          {log.provider}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isSuccess ? (
                          <span className="text-[#22c55e] font-bold text-[12px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 200 OK
                          </span>
                        ) : isRateLimit ? (
                          <span className="text-[#f59e0b] font-bold text-[12px] flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> 429 RATELIMIT
                          </span>
                        ) : (
                          <span className="text-[#dc2626] font-bold text-[12px] flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> {log.status || 500} ERROR
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[12px] text-[#3c3c3c]">
                        {log.latencyMs}ms
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#262626]">{log.tokensProcessed}</span>
                        {log.tokensSaved > 0 && (
                          <span className="ml-1 text-[11px] text-[#e22718] font-mono font-bold">
                            (-{log.tokensSaved})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[12px]">
                        {log.failoverAttempts > 0 ? (
                          <span className="text-[#f59e0b] font-bold flex items-center gap-1 uppercase">
                            <span>{log.failoverAttempts} failover</span>
                            <ArrowRight className="w-3 h-3" />
                            <span className="text-[#22c55e]">RECOVERED</span>
                          </span>
                        ) : (
                          <span className="text-[#6b6b6b] font-light">DIRECT HIT</span>
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

      {/* Selected Payload Box */}
      {selectedEntry && (
        <div className="bmw-card p-6 space-y-4 border-2 border-[#1c69d4]">
          <div className="flex items-center justify-between border-b border-[#e6e6e6] pb-3">
            <h3 className="text-base font-bold text-[#262626] flex items-center gap-2">
              TELEMETRY PAYLOAD: <code className="text-[#1c69d4] font-mono">{selectedEntry.id}</code>
            </h3>
            <button
              onClick={() => setSelectedEntry(null)}
              className="text-[12px] font-bold uppercase tracking-[1px] text-[#6b6b6b] hover:text-[#262626]"
            >
              CLOSE
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[13px]">
            <div>
              <span className="text-[#6b6b6b] block text-[10px] font-bold uppercase tracking-[1px]">TIMESTAMP</span>
              <span className="text-[#262626] font-mono font-bold">{selectedEntry.timestamp}</span>
            </div>
            <div>
              <span className="text-[#6b6b6b] block text-[10px] font-bold uppercase tracking-[1px]">REQUESTED MODEL</span>
              <span className="text-[#262626] font-bold">{selectedEntry.model}</span>
            </div>
            <div>
              <span className="text-[#6b6b6b] block text-[10px] font-bold uppercase tracking-[1px]">RESOLVED PROVIDER</span>
              <span className="text-[#1c69d4] font-mono font-bold">{selectedEntry.provider}</span>
            </div>
            <div>
              <span className="text-[#6b6b6b] block text-[10px] font-bold uppercase tracking-[1px]">EDGE LATENCY</span>
              <span className="text-[#22c55e] font-mono font-bold">{selectedEntry.latencyMs} ms</span>
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <span className="text-[11px] uppercase font-bold tracking-[1px] text-[#6b6b6b]">
              CAPTURED PROMPT SNIPPET
            </span>
            <div className="bg-[#fafafa] border border-[#e6e6e6] p-4 text-[13px] font-mono text-[#262626] whitespace-pre-wrap font-light">
              {selectedEntry.promptSnippet || "No prompt snippet captured"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
