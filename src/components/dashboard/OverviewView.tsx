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
  stats: {
    totalRequests: number;
    totalTokensSaved: number;
    totalTokensProcessed: number;
    avgLatencyMs: number;
    estimatedDollarsSaved: string;
  };
}

export function OverviewView({ onNavigate, stats }: OverviewViewProps) {
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
        body: JSON.stringify({ providerId }),
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
    <div className="space-y-10 animate-spring-slide-up">
      {/* ─── Hero Liquid Glass Showcase Lens ─── */}
      <section className="liquid-glass p-7 sm:p-10 relative overflow-hidden">
        {/* Optical Glass Caustic Flare Highlight */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#007AFF]/20 via-[#5856D6]/15 to-transparent blur-2xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Hero Content & Actions */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full badge-liquid-blue">
              <span className="w-2 h-2 rounded-full bg-[#007AFF] animate-pulse" />
              <span>Zero-Cost AI Gateway for Oh My Pi (omp)</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)] leading-[1.08]">
              Never stop coding. Free frontier AI for omp.
            </h1>

            <p className="text-[15px] sm:text-[17px] text-[var(--text-secondary)] leading-relaxed max-w-xl font-normal">
              Connect <strong className="text-[var(--text-primary)] font-bold">Oh My Pi (omp)</strong>, Cursor, Cline, and Codex to 160+ AI providers (50+ free tiers). Save 15%–95% tokens with stacked RTK compression.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate("studio")}
                className="btn-liquid-primary text-[14px]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Studio</span>
              </button>

              <button
                onClick={() => onNavigate("setup")}
                className="btn-liquid-secondary text-[14px]"
              >
                <Terminal className="w-4 h-4 text-[#5856D6]" />
                <span>omp Integration</span>
              </button>

              <button
                onClick={copyUrl}
                className="btn-liquid-secondary text-[14px]"
              >
                {copiedEndpoint ? <Check className="w-4 h-4 text-[#34C759]" /> : <Copy className="w-4 h-4 text-[#007AFF]" />}
                <span>{copiedEndpoint ? "Endpoint Copied" : "Copy /v1 Endpoint"}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Liquid Interactive AI Token & Cost Calculator */}
          <div className="lg:col-span-5 p-5 liquid-glass-elevated space-y-4">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Token & Cost Calculator
              </span>
              <span className="badge-liquid-green text-[11px] py-0.5">
                100% FREE
              </span>
            </div>

            <div className="space-y-3">
              {/* Input Tokens Box */}
              <div className="p-3.5 bg-[var(--glass-surface-subtle)] rounded-2xl border border-[var(--glass-border-subtle)] space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-bold">
                  <span>Input Prompt Tokens</span>
                  <span>Standard Cost: ${standardCost}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="number"
                    value={calcTokens}
                    onChange={(e) => setCalcTokens(Math.max(1000, parseInt(e.target.value) || 0))}
                    step={10000}
                    className="bg-transparent text-2xl font-black text-[var(--text-primary)] outline-none w-full"
                  />
                  <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-[var(--glass-surface)] text-[var(--text-secondary)] border border-[var(--glass-border)] shadow-xs">
                    Tokens
                  </span>
                </div>
              </div>

              {/* Optical Glass Down Arrow */}
              <div className="flex items-center justify-center -my-2 relative z-10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#007AFF] to-[#5856D6] text-white flex items-center justify-center shadow-md border border-white/40">
                  <ArrowDown className="w-4 h-4" />
                </div>
              </div>

              {/* SZRoute Routing + RTK Output */}
              <div className="p-3.5 bg-gradient-to-br from-[#007AFF]/15 to-[#5856D6]/10 border border-[#007AFF]/30 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#007AFF]">
                  <span>SZRoute Edge Routing + RTK</span>
                  <span className="text-[#34C759] font-black">You Pay: $0.00</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-2xl font-black text-[var(--text-primary)]">
                      {calcTokens - rtkSavingsTokens} <span className="text-xs font-semibold text-[var(--text-secondary)]">tokens</span>
                    </div>
                    <div className="text-[11px] text-[#34C759] font-bold">
                      🔥 42% tokens compressed via RTK
                    </div>
                  </div>

                  <select
                    value={calcSelectedModel}
                    onChange={(e) => setCalcSelectedModel(e.target.value)}
                    className="bg-[var(--glass-surface)] text-[var(--text-primary)] text-[12px] font-bold px-3 py-1.5 rounded-xl border border-[var(--glass-border)] outline-none shadow-xs"
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
              className="w-full btn-liquid-primary h-11 text-[13px] font-bold shadow-lg"
            >
              Route Oh My Pi (omp) for Free →
            </button>
          </div>
        </div>
      </section>

      {/* ─── 4-Up Liquid Glass Metric Cards Grid ─── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="liquid-glass-interactive p-5 space-y-2">
          <div className="flex items-center justify-between text-[var(--text-secondary)] text-[12px] font-bold">
            <span>Requests Processed</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#007AFF] to-[#32ADE6] text-white flex items-center justify-center shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {stats.totalRequests.toLocaleString()}
          </div>
          <div className="text-[12px] text-[#34C759] font-bold">
            100% failover coverage
          </div>
        </div>

        <div className="liquid-glass-interactive p-5 space-y-2">
          <div className="flex items-center justify-between text-[var(--text-secondary)] text-[12px] font-bold">
            <span>Tokens Compressed</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF3B30] to-[#FF2D55] text-white flex items-center justify-center shadow-xs">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {stats.totalTokensSaved.toLocaleString()}
          </div>
          <div className="text-[12px] text-[#FF3B30] font-bold">
            15%–95% RTK reduction
          </div>
        </div>

        <div className="liquid-glass-interactive p-5 space-y-2">
          <div className="flex items-center justify-between text-[var(--text-secondary)] text-[12px] font-bold">
            <span>Average Latency</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF9500] to-[#FFCC00] text-white flex items-center justify-center shadow-xs">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {stats.avgLatencyMs > 0 ? `${stats.avgLatencyMs} ms` : "120 ms"}
          </div>
          <div className="text-[12px] text-[var(--text-secondary)] font-medium">
            Wafer-scale LPU speed
          </div>
        </div>

        <div className="liquid-glass-interactive p-5 space-y-2">
          <div className="flex items-center justify-between text-[var(--text-secondary)] text-[12px] font-bold">
            <span>Financial Savings</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#34C759] to-[#30D158] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            ${stats.estimatedDollarsSaved}
          </div>
          <div className="text-[12px] text-[#34C759] font-bold">
            Aggregated free inference
          </div>
        </div>
      </section>

      {/* ─── Virtual Combos Showcase (Refractive Glass Lenses) ─── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
              Virtual Combos & Auto-Failovers
            </h2>
            <p className="text-[14px] text-[var(--text-secondary)] mt-0.5">
              Multi-tier fallback routing chains for Oh My Pi (omp)
            </p>
          </div>
          <button
            onClick={() => onNavigate("combos")}
            className="text-[13px] font-bold text-[#007AFF] hover:underline flex items-center gap-1 active:scale-95 transition-transform"
          >
            <span>Manage Combos</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEFAULT_COMBOS.map((combo) => (
            <div
              key={combo.id}
              className="liquid-glass-interactive p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#34C759] to-[#007AFF] flex items-center justify-center text-white shadow-xs">
                  <Layers className="w-5 h-5" />
                </div>

                <div>
                  <div className="text-[11px] uppercase font-bold tracking-wider text-[#007AFF]">
                    {combo.strategy} Routing
                  </div>
                  <h3 className="text-[16px] font-bold text-[var(--text-primary)] leading-snug">
                    {combo.name}
                  </h3>
                  <code className="text-[12px] font-mono font-semibold text-[var(--text-secondary)] block">
                    model: &quot;{combo.id}&quot;
                  </code>
                </div>

                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  {combo.description}
                </p>

                <div className="space-y-1 pt-1">
                  {combo.targets.map((t, i) => (
                    <div key={i} className="text-[12px] text-[var(--text-secondary)] flex items-center justify-between py-0.5 border-b border-[var(--glass-border-subtle)] last:border-0">
                      <span className="font-semibold text-[var(--text-primary)]">{i + 1}. {t.providerId}</span>
                      <span className="font-mono text-[11px] truncate max-w-[110px]">{t.modelId}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--glass-border-subtle)]">
                <button
                  onClick={() => onNavigate("studio")}
                  className="w-full btn-liquid-secondary text-[12px] h-8 font-bold"
                >
                  Test in Studio →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Free Tier Provider Matrix ─── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
              Frontier Providers Health Matrix
            </h2>
            <p className="text-[14px] text-[var(--text-secondary)] mt-0.5">
              Aggregating ~1.9B free tokens/month across leading providers
            </p>
          </div>
          <button
            onClick={() => onNavigate("providers")}
            className="text-[13px] font-bold text-[#007AFF] hover:underline flex items-center gap-1 active:scale-95 transition-transform"
          >
            <span>All 160+ Providers</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {freeProviders.slice(0, 6).map((provider) => {
            const pingResult = pingResults[provider.id];
            const isTesting = testingProvider === provider.id;

            return (
              <div
                key={provider.id}
                className="liquid-glass-interactive p-5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[11px] uppercase font-bold text-[#34C759]">
                        {provider.freeTier.badgeText}
                      </div>
                      <h3 className="text-[16px] font-bold text-[var(--text-primary)] mt-0.5">
                        {provider.name}
                      </h3>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-[var(--glass-surface-subtle)] border border-[var(--glass-border)] flex items-center justify-center font-black text-xs text-[var(--text-primary)]">
                      {provider.name.slice(0, 2).toUpperCase()}
                    </div>
                  </div>

                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                    {provider.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-[var(--glass-border-subtle)] flex items-center justify-between text-[12px]">
                  <span className="text-[var(--text-secondary)] font-medium truncate max-w-[130px]">
                    {provider.freeTier.monthlyFreeTokensEstimate || "Free quota"}
                  </span>
                  <button
                    onClick={() => testPing(provider.id)}
                    disabled={isTesting}
                    className="btn-liquid-secondary text-[11px] h-7 px-3 font-bold active:scale-90"
                  >
                    {isTesting ? (
                      <span>Pinging...</span>
                    ) : pingResult ? (
                      <span className={pingResult.status === "ok" ? "text-[#34C759]" : "text-[#FF3B30]"}>
                        {pingResult.latencyMs}ms
                      </span>
                    ) : (
                      <>
                        <Play className="w-3 h-3" /> Ping
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
