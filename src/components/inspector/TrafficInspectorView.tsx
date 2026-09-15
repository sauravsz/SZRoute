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
    <div className="space-y-6 animate-spring-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--label-primary)] tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5AC8FA]/15 text-[#5AC8FA] flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <span>Live Telemetry & Traffic Logs</span>
          </h2>
          <p className="text-[14px] text-[var(--label-secondary)] mt-0.5">
            Real-time request stream capturing model routing, failover cascades, latency, and RTK compression.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-[var(--label-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter logs..."
              className="apple-input w-full pl-9 pr-3 py-1.5 text-[13px]"
            />
          </div>

          <button
            onClick={onClearLogs}
            disabled={requestLogs.length === 0}
            className="btn-apple-secondary text-[12px] h-9 px-3.5 text-[var(--system-red)] disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Main Telemetry Apple Grouped Card */}
      <div className="apple-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[var(--bg-subtle)] text-[var(--label-secondary)] font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Target Model</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Tokens</th>
                <th className="py-3 px-4">Failover Trail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--separator)] text-[var(--label-primary)]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[var(--label-tertiary)] font-medium">
                    No traffic logs recorded. Send a prompt from Oh My Pi (omp) or AI Studio to observe live telemetry.
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
                      className="hover:bg-[var(--bg-subtle)]/60 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-[12px] text-[var(--label-secondary)]">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[var(--label-primary)]">
                        {log.model}
                      </td>
                      <td className="py-3 px-4">
                        <span className="badge-apple-blue py-0 text-[11px]">
                          {log.provider}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isSuccess ? (
                          <span className="text-[var(--system-green)] font-semibold text-[12px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 200 OK
                          </span>
                        ) : isRateLimit ? (
                          <span className="text-[var(--system-orange)] font-semibold text-[12px] flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> 429
                          </span>
                        ) : (
                          <span className="text-[var(--system-red)] font-semibold text-[12px] flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> {log.status || 500}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[12px] text-[var(--label-secondary)]">
                        {log.latencyMs}ms
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-[var(--label-primary)]">{log.tokensProcessed}</span>
                        {log.tokensSaved > 0 && (
                          <span className="ml-1 text-[11px] text-[var(--system-red)] font-mono font-bold">
                            (-{log.tokensSaved})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[12px]">
                        {log.failoverAttempts > 0 ? (
                          <span className="text-[var(--system-orange)] font-semibold flex items-center gap-1">
                            <span>{log.failoverAttempts} failover</span>
                            <ArrowRight className="w-3 h-3" />
                            <span className="text-[var(--system-green)]">Recovered</span>
                          </span>
                        ) : (
                          <span className="text-[var(--label-tertiary)]">Direct</span>
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

      {/* Selected Log Detail Card */}
      {selectedEntry && (
        <div className="apple-card p-6 space-y-3 border border-[var(--system-blue)]">
          <div className="flex items-center justify-between border-b border-[var(--separator)] pb-2.5">
            <h3 className="text-sm font-bold text-[var(--label-primary)] flex items-center gap-2">
              Request Payload: <code className="text-[var(--system-blue)] font-mono">{selectedEntry.id}</code>
            </h3>
            <button
              onClick={() => setSelectedEntry(null)}
              className="text-[12px] font-semibold text-[var(--label-secondary)] hover:text-[var(--label-primary)]"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px]">
            <div>
              <span className="text-[var(--label-tertiary)] block text-[11px] font-semibold uppercase">Time</span>
              <span className="text-[var(--label-primary)] font-mono font-bold">{selectedEntry.timestamp}</span>
            </div>
            <div>
              <span className="text-[var(--label-tertiary)] block text-[11px] font-semibold uppercase">Model</span>
              <span className="text-[var(--label-primary)] font-semibold">{selectedEntry.model}</span>
            </div>
            <div>
              <span className="text-[var(--label-tertiary)] block text-[11px] font-semibold uppercase">Provider</span>
              <span className="text-[var(--system-blue)] font-mono font-bold">{selectedEntry.provider}</span>
            </div>
            <div>
              <span className="text-[var(--label-tertiary)] block text-[11px] font-semibold uppercase">Latency</span>
              <span className="text-[var(--system-green)] font-mono font-bold">{selectedEntry.latencyMs} ms</span>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <span className="text-[11px] uppercase font-bold text-[var(--label-tertiary)]">
              Prompt Snippet
            </span>
            <div className="bg-[var(--bg-subtle)] p-3 rounded-2xl text-[12px] font-mono text-[var(--label-primary)] whitespace-pre-wrap">
              {selectedEntry.promptSnippet || "No prompt snippet"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
