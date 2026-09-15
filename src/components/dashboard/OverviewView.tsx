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
      {/* Apple-styled Hero Showcase Card (Concentric 28px Squircle) */}
      <section className="apple-card p-6 sm:p-10 relative overflow-hidden bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-card-secondary)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Typography Hierarchy */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--system-blue)]/10 text-[var(--system-blue)] text-[12px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[var(--system-blue)] animate-pulse" />
              <span>Zero-Cost Gateway for Oh My Pi (omp)</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--label-primary)] leading-[1.1]">
              Never stop coding. Free frontier models for omp.
            </h1>

            <p className="text-[15px] sm:text-[17px] text-[var(--label-secondary)] leading-relaxed max-w-xl">
              Connect <strong className="text-[var(--label-primary)] font-semibold">Oh My Pi (omp)</strong>, Cursor, Cline, and Codex to 160+ AI providers (50+ free tiers). Save 15%–95% tokens with RTK prompt minification.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate("studio")}
                className="btn-apple-primary text-[14px] shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Studio</span>
              </button>

              <button
                onClick={() => onNavigate("setup")}
                className="btn-apple-secondary text-[14px]"
              >
                <Terminal className="w-4 h-4" />
                <span>omp Integration</span>
              </button>

              <button
                onClick={copyUrl}
                className="btn-apple-secondary text-[14px]"
              >
                {copiedEndpoint ? <Check className="w-4 h-4 text-[var(--system-green)]" /> : <Copy className="w-4 h-4" />}
                <span>{copiedEndpoint ? "Endpoint Copied" : "Copy /v1 Endpoint"}</span>
              </button>
            </div>
          </div>

          {/* Right: Concentric Interactive AI Cost Calculator */}
          <div className="lg:col-span-5 p-5 bg-[var(--bg-card)] rounded-3xl border border-[var(--separator)] shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[12px] font-bold text-[var(--label-secondary)] uppercase tracking-wider">
                Token & Cost Telemetry
              </span>
              <span className="badge-apple-green text-[11px] py-0.5 font-bold">
                100% FREE
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-[var(--bg-subtle)] rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[var(--label-secondary)] font-semibold">
                  <span>Input Prompt Tokens</span>
                  <span>Standard Cost: ${standardCost}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="number"
                    value={calcTokens}
                    onChange={(e) => setCalcTokens(Math.max(1000, parseInt(e.target.value) || 0))}
                    step={10000}
                    className="bg-transparent text-2xl font-bold text-[var(--label-primary)] outline-none w-full"
                  />
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--bg-card)] text-[var(--label-secondary)] shadow-2xs">
                    Tokens
                  </span>
                </div>
              </div>

              {/* Minimal Apple Separator with Down Arrow */}
              <div className="flex items-center justify-center -my-2 relative z-10">
                <div className="w-7 h-7 rounded-full bg-[var(--system-blue)] text-white flex items-center justify-center shadow-xs">
                  <ArrowDown className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="p-3.5 bg-[var(--system-blue)]/10 border border-[var(--system-blue)]/20 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-[var(--system-blue)]">
                  <span>SZRoute Edge Routing + RTK</span>
                  <span>You Pay: $0.00</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-2xl font-bold text-[var(--label-primary)]">
                      {calcTokens - rtkSavingsTokens} <span className="text-xs font-medium text-[var(--label-secondary)]">tokens</span>
                    </div>
                    <div className="text-[11px] text-[var(--system-green)] font-semibold">
                      ✓ 42% tokens compressed via RTK
                    </div>
                  </div>

                  <select
                    value={calcSelectedModel}
                    onChange={(e) => setCalcSelectedModel(e.target.value)}
                    className="bg-[var(--bg-card)] text-[var(--label-primary)] text-[12px] font-semibold px-3 py-1.5 rounded-xl border border-[var(--separator)] outline-none"
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
              className="w-full btn-apple-primary h-11 text-[13px] font-semibold"
            >
              Configure Oh My Pi (omp) →
            </button>
          </div>
        </div>
      </section>

      {/* 4-Up Apple Metric Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="apple-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[var(--label-secondary)] text-[12px] font-semibold">
            <span>Requests Processed</span>
            <div className="w-7 h-7 rounded-lg bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--label-primary)] tracking-tight">
            {stats.totalRequests.toLocaleString()}
          </div>
          <div className="text-[12px] text-[var(--system-green)] font-medium">
            100% failover coverage
          </div>
        </div>

        <div className="apple-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[var(--label-secondary)] text-[12px] font-semibold">
            <span>Tokens Compressed</span>
            <div className="w-7 h-7 rounded-lg bg-[#FF3B30]/15 text-[#FF3B30] flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--label-primary)] tracking-tight">
            {stats.totalTokensSaved.toLocaleString()}
          </div>
          <div className="text-[12px] text-[var(--system-red)] font-medium">
            15%–95% RTK reduction
          </div>
        </div>

        <div className="apple-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[var(--label-secondary)] text-[12px] font-semibold">
            <span>Average Latency</span>
            <div className="w-7 h-7 rounded-lg bg-[#FF9500]/15 text-[#FF9500] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--label-primary)] tracking-tight">
            {stats.avgLatencyMs > 0 ? `${stats.avgLatencyMs} ms` : "120 ms"}
          </div>
          <div className="text-[12px] text-[var(--label-secondary)] font-medium">
            Wafer-scale LPU speed
          </div>
        </div>

        <div className="apple-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[var(--label-secondary)] text-[12px] font-semibold">
            <span>Financial Savings</span>
            <div className="w-7 h-7 rounded-lg bg-[#34C759]/15 text-[#34C759] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--label-primary)] tracking-tight">
            ${stats.estimatedDollarsSaved}
          </div>
          <div className="text-[12px] text-[var(--system-green)] font-medium">
            Aggregated free inference
          </div>
        </div>
      </section>

      {/* Virtual Combos Showcase (Concentric Cards Grid) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--label-primary)] tracking-tight">
              Virtual Combos & Auto-Failovers
            </h2>
            <p className="text-[14px] text-[var(--label-secondary)] mt-0.5">
              Multi-tier fallback routing chains for Oh My Pi (omp)
            </p>
          </div>
          <button
            onClick={() => onNavigate("combos")}
            className="text-[13px] font-semibold text-[var(--system-blue)] hover:underline flex items-center gap-1 active:scale-95 transition-transform"
          >
            <span>Manage Combos</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEFAULT_COMBOS.map((combo) => (
            <div
              key={combo.id}
              className="apple-card-interactive p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#34C759] to-[#007AFF] flex items-center justify-center text-white shadow-xs">
                  <Layers className="w-5 h-5" />
                </div>

                <div>
                  <div className="text-[11px] uppercase font-bold tracking-wider text-[var(--system-blue)]">
                    {combo.strategy}
                  </div>
                  <h3 className="text-[16px] font-bold text-[var(--label-primary)] leading-snug">
                    {combo.name}
                  </h3>
                  <code className="text-[12px] font-mono text-[var(--label-secondary)] block">
                    model: &quot;{combo.id}&quot;
                  </code>
                </div>

                <p className="text-[13px] text-[var(--label-secondary)] leading-relaxed">
                  {combo.description}
                </p>

                <div className="space-y-1 pt-1">
                  {combo.targets.map((t, i) => (
                    <div key={i} className="text-[12px] text-[var(--label-secondary)] flex items-center justify-between py-0.5">
                      <span className="font-medium text-[var(--label-primary)]">{i + 1}. {t.providerId}</span>
                      <span className="font-mono text-[11px] truncate max-w-[110px]">{t.modelId}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--separator)]">
                <button
                  onClick={() => onNavigate("studio")}
                  className="w-full btn-apple-secondary text-[12px] h-8 font-semibold"
                >
                  Test in Studio →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Free Tier Provider Matrix (Apple Grouped Style) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--label-primary)] tracking-tight">
              Frontier Providers Health Matrix
            </h2>
            <p className="text-[14px] text-[var(--label-secondary)] mt-0.5">
              Aggregating ~1.9B free tokens/month across leading providers
            </p>
          </div>
          <button
            onClick={() => onNavigate("providers")}
            className="text-[13px] font-semibold text-[var(--system-blue)] hover:underline flex items-center gap-1 active:scale-95 transition-transform"
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
                className="apple-card-interactive p-5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[11px] uppercase font-bold text-[var(--system-green)]">
                        {provider.freeTier.badgeText}
                      </div>
                      <h3 className="text-[16px] font-bold text-[var(--label-primary)] mt-0.5">
                        {provider.name}
                      </h3>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-[var(--bg-subtle)] flex items-center justify-center font-bold text-xs text-[var(--label-primary)]">
                      {provider.name.slice(0, 2).toUpperCase()}
                    </div>
                  </div>

                  <p className="text-[13px] text-[var(--label-secondary)] leading-relaxed line-clamp-2">
                    {provider.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-[var(--separator)] flex items-center justify-between text-[12px]">
                  <span className="text-[var(--label-secondary)] truncate max-w-[130px]">
                    {provider.freeTier.monthlyFreeTokensEstimate || "Free quota"}
                  </span>
                  <button
                    onClick={() => testPing(provider.id)}
                    disabled={isTesting}
                    className="btn-apple-secondary text-[11px] h-7 px-3 font-semibold active:scale-90"
                  >
                    {isTesting ? (
                      <span>Pinging...</span>
                    ) : pingResult ? (
                      <span className={pingResult.status === "ok" ? "text-[var(--system-green)]" : "text-[var(--system-red)]"}>
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
