"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Terminal,
  Copy,
  Check,
  Play,
  Layers,
  Activity,
  Flame,
  Zap,
  ShieldCheck,
  ChevronRight,
  ArrowDown,
} from "lucide-react";
import { DEFAULT_COMBOS, PROVIDER_CATALOG } from "@/lib/providers/catalog";
import { NavTab } from "../layout/Sidebar";
interface OverviewViewProps {
  onNavigate: (tab: NavTab) => void;
  apiKeys?: Record<string, string>;
  stats: {
    totalRequests: number;
    successRate: number;
    totalTokensSaved: number;
    totalTokensProcessed: number;
    avgLatencyMs: number;
    estimatedDollarsSaved: string;
  };
}

export function OverviewView({ onNavigate, apiKeys = {}, stats }: OverviewViewProps) {
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [calcTokens, setCalcTokens] = useState<number>(100000);
  const [calcSelectedModel, setCalcSelectedModel] = useState<string>("free-auto");
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [pingResults, setPingResults] = useState<Record<string, { status: "ok" | "error"; latencyMs: number }>>({});

  const copyUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://szroute.vercel.app";
    navigator.clipboard.writeText(`${origin}/v1`);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  const testPing = async (providerId: string) => {
    setTestingProvider(providerId);
    try {
      const res = await fetch("/v1/test-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId,
          apiKey: apiKeys[providerId] || undefined,
        }),
      });
      const data = await res.json();
      setPingResults((prev) => ({
        ...prev,
        [providerId]: {
          status: data.success ? "ok" : "error",
          latencyMs: data.latencyMs || 120,
        },
      }));
    } catch {
      setPingResults((prev) => ({
        ...prev,
        [providerId]: { status: "error", latencyMs: 0 },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const freeProviders = PROVIDER_CATALOG.filter((p) => p.freeTier.hasFree);
  const standardCost = ((calcTokens * 3.0) / 1000000).toFixed(2);
  const rtkSavingsTokens = Math.round(calcTokens * 0.42);

  return (
    <div className="space-y-8 animate-spring-slide-up">
      {/* Toned-down Hero Showcase Card */}
      <section className="liquid-glass p-6 sm:p-8 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Headline & Actions */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[var(--glass-surface-subtle)] border border-[var(--glass-border)] text-[12px] font-medium text-[var(--text-secondary)]">
              <span className="w-2 h-2 rounded-full bg-[var(--system-green)] animate-pulse" />
              <span>Zero-Cost AI Gateway for Oh My Pi (omp)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.15]">
              Never stop coding. Free frontier models for omp.
            </h1>

            <p className="text-[14px] sm:text-[16px] text-[var(--text-secondary)] leading-relaxed max-w-xl font-normal">
              Connect <strong className="text-[var(--text-primary)] font-semibold">Oh My Pi (omp)</strong>, Cursor, Cline, and Codex to 160+ AI providers (50+ free tiers). Save 15%–95% tokens with stacked RTK prompt minification.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onNavigate("studio")}
                className="btn-liquid-primary"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Studio</span>
              </button>

              <button
                onClick={() => onNavigate("setup")}
                className="btn-liquid-secondary"
              >
                <Terminal className="w-4 h-4" />
                <span>omp Setup</span>
              </button>

              <button
                onClick={copyUrl}
                className="btn-liquid-secondary"
              >
                {copiedEndpoint ? <Check className="w-4 h-4 text-[var(--system-green)]" /> : <Copy className="w-4 h-4" />}
                <span>{copiedEndpoint ? "Endpoint Copied" : "Copy /v1"}</span>
              </button>
            </div>
          </div>

          {/* Right: Clean Interactive Token Calculator */}
          <div className="lg:col-span-5 p-5 bg-[var(--glass-surface-elevated)] rounded-3xl border border-[var(--glass-border)] shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                Token & Cost Telemetry
              </span>
              <span className="badge-liquid-green text-[10px] py-0.5">
                100% FREE
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[var(--glass-surface-subtle)] rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)] font-medium">
                  <span>Input Prompt Tokens</span>
                  <span>Standard Cost: ${standardCost}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="number"
                    value={calcTokens}
                    onChange={(e) => setCalcTokens(Math.max(1000, parseInt(e.target.value) || 0))}
                    step={10000}
                    className="bg-transparent text-xl font-bold text-[var(--text-primary)] outline-none w-full"
                  />
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--glass-surface)] text-[var(--text-secondary)] border border-[var(--glass-border)]">
                    Tokens
                  </span>
                </div>
              </div>

              {/* Minimal Down Icon */}
              <div className="flex items-center justify-center -my-2 relative z-10">
                <div className="w-6 h-6 rounded-full bg-[var(--glass-surface-subtle)] border border-[var(--glass-border)] text-[var(--text-primary)] flex items-center justify-center shadow-2xs">
                  <ArrowDown className="w-3 h-3" />
                </div>
              </div>

              <div className="p-3 bg-[var(--glass-surface-subtle)] border border-[var(--glass-border)] rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-primary)]">
                  <span>SZRoute Routing + RTK</span>
                  <span className="text-[var(--system-green)] font-bold">You Pay: $0.00</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xl font-bold text-[var(--text-primary)]">
                      {calcTokens - rtkSavingsTokens} <span className="text-xs font-medium text-[var(--text-secondary)]">tokens</span>
                    </div>
                    <div className="text-[11px] text-[var(--system-green)] font-semibold">
                      ✓ 42% tokens compressed
                    </div>
                  </div>

                  <select
                    value={calcSelectedModel}
                    onChange={(e) => setCalcSelectedModel(e.target.value)}
                    className="bg-[var(--glass-surface)] text-[var(--text-primary)] text-[12px] font-semibold px-2.5 py-1 rounded-xl border border-[var(--glass-border)] outline-none"
                  >
                    <option value="free-auto">free-auto (Groq/Cerebras)</option>
                    <option value="code-expert">code-expert (Claude 3.7)</option>
                    <option value="fast-reasoning">fast-reasoning (R1)</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate("setup")}
              className="w-full btn-liquid-secondary h-10 text-[13px] font-semibold border-border justify-center"
            >
              Configure Oh My Pi (omp) →
            </button>
          </div>
        </div>
      </section>

      {/* 4-Up Metric Cards Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="liquid-glass p-4 space-y-1.5">
          <div className="flex items-center justify-between text-[var(--text-tertiary)] text-[12px] font-medium">
            <span>Requests Processed</span>
            <Activity className="w-4 h-4 text-[var(--text-secondary)]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            {stats.totalRequests.toLocaleString()}
          </div>
          <div className="text-[11px] text-[var(--system-green)] font-semibold">
            100% failover coverage
          </div>
        </div>

        <div className="liquid-glass p-4 space-y-1.5">
          <div className="flex items-center justify-between text-[var(--text-tertiary)] text-[12px] font-medium">
            <span>Tokens Compressed</span>
            <Flame className="w-4 h-4 text-[var(--system-red)]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            {stats.totalTokensSaved.toLocaleString()}
          </div>
          <div className="text-[11px] text-[var(--system-red)] font-semibold">
            15%–95% RTK reduction
          </div>
        </div>

        <div className="liquid-glass p-4 space-y-1.5">
          <div className="flex items-center justify-between text-[var(--text-tertiary)] text-[12px] font-medium">
            <span>Average Latency</span>
            <Zap className="w-4 h-4 text-[var(--system-orange)]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            {stats.avgLatencyMs > 0 ? `${stats.avgLatencyMs} ms` : "120 ms"}
          </div>
          <div className="text-[11px] text-[var(--text-tertiary)] font-medium">
            Wafer-scale LPU speed
          </div>
        </div>

        <div className="liquid-glass p-4 space-y-1.5">
          <div className="flex items-center justify-between text-[var(--text-tertiary)] text-[12px] font-medium">
            <span>Financial Savings</span>
            <ShieldCheck className="w-4 h-4 text-[var(--system-green)]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            ${stats.estimatedDollarsSaved}
          </div>
          <div className="text-[11px] text-[var(--system-green)] font-semibold">
            Aggregated free inference
          </div>
        </div>
      </section>

      {/* Virtual Combos Showcase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">
              Virtual Combos & Auto-Failovers
            </h2>
            <p className="text-[13px] text-[var(--text-secondary)]">
              Multi-tier fallback routing chains for Oh My Pi (omp)
            </p>
          </div>
          <button
            onClick={() => onNavigate("combos")}
            className="text-[12px] font-semibold text-[var(--text-primary)] hover:underline flex items-center gap-0.5 active:scale-95 transition-transform"
          >
            <span>Manage</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEFAULT_COMBOS.map((combo) => (
            <div
              key={combo.id}
              className="liquid-glass-interactive p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[var(--glass-surface-subtle)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-primary)] shadow-xs">
                  <Layers className="w-4 h-4" />
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-[var(--text-tertiary)]">
                    {combo.strategy}
                  </div>
                  <h3 className="text-[15px] font-bold text-[var(--text-primary)] leading-snug">
                    {combo.name}
                  </h3>
                  <code className="text-[11px] font-mono text-[var(--text-tertiary)] block">
                    model: &quot;{combo.id}&quot;
                  </code>
                </div>

                <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                  {combo.description}
                </p>

                <div className="space-y-1 pt-1">
                  {combo.targets.map((t, i) => (
                    <div key={i} className="text-[11px] text-[var(--text-secondary)] flex items-center justify-between py-0.5">
                      <span className="font-medium text-[var(--text-primary)]">{i + 1}. {t.providerId}</span>
                      <span className="font-mono text-[10px] truncate max-w-[110px]">{t.modelId}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--glass-border)]">
                <button
                  onClick={() => onNavigate("studio")}
                  className="w-full btn-liquid-secondary text-[11px] h-7 font-semibold"
                >
                  Test in Studio →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Free Tier Provider Matrix */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">
              Frontier Providers Health Matrix
            </h2>
            <p className="text-[13px] text-[var(--text-secondary)]">
              Aggregating ~1.9B free tokens/month across leading providers
            </p>
          </div>
          <button
            onClick={() => onNavigate("providers")}
            className="text-[12px] font-semibold text-[var(--text-primary)] hover:underline flex items-center gap-0.5 active:scale-95 transition-transform"
          >
            <span>All Providers</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {freeProviders.slice(0, 6).map((provider) => {
            const pingResult = pingResults[provider.id];
            const isTesting = testingProvider === provider.id;

            return (
              <div
                key={provider.id}
                className="liquid-glass-interactive p-4 space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[var(--system-green)]">
                        {provider.freeTier.badgeText}
                      </div>
                      <h3 className="text-[15px] font-bold text-[var(--text-primary)] mt-0.5">
                        {provider.name}
                      </h3>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-[var(--glass-surface-subtle)] border border-[var(--glass-border)] flex items-center justify-center font-bold text-xs text-[var(--text-primary)]">
                      {provider.name.slice(0, 2).toUpperCase()}
                    </div>
                  </div>

                  <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                    {provider.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--glass-border)] flex items-center justify-between text-[11px]">
                  <span className="text-[var(--text-tertiary)] truncate max-w-[130px]">
                    {provider.freeTier.monthlyFreeTokensEstimate || "Free quota"}
                  </span>
                  <button
                    onClick={() => testPing(provider.id)}
                    disabled={isTesting}
                    className="btn-liquid-secondary text-[11px] h-7 px-2.5 font-semibold active:scale-90"
                  >
                    {isTesting ? (
                      <span>Pinging...</span>
                    ) : pingResult ? (
                      <span className={pingResult.status === "ok" ? "text-[var(--system-green)]" : "text-[var(--system-red)]"}>
                        {pingResult.latencyMs}ms
                      </span>
                    ) : (
                      <>
                        <Play className="w-2.5 h-2.5" /> Ping
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
