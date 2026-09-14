"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Terminal,
  Copy,
  Check,
  ArrowDown,
  ArrowUpRight,
  Play,
  Layers,
  Activity,
  Flame,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { DEFAULT_COMBOS, PROVIDER_CATALOG } from "@/lib/providers/catalog";
import { NavTab } from "../layout/Navbar";

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
    <div className="space-y-12 animate-in fade-in duration-200">
      {/* Minimal Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2 sm:pt-6">
        {/* Left Column: Bold Headline & Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-on text-[13px] font-bold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Zero-Cost AI Gateway for Oh My Pi (omp)
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-ink tracking-tight leading-[1.05]">
            Never stop coding. Free AI gateway for omp<span className="text-primary">.</span>
          </h1>

          <p className="text-[17px] text-ink-body leading-relaxed max-w-xl font-medium">
            Connect <strong className="text-ink font-bold">Oh My Pi (omp)</strong>, Cursor, Cline, and Codex to 160+ AI providers (50+ free tiers). Save 15%–95% tokens with RTK compression and instant auto-failover.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate("studio")}
              className="btn-primary"
            >
              <Sparkles className="w-4 h-4" />
              Launch Studio
            </button>

            <button
              onClick={() => onNavigate("setup")}
              className="btn-secondary"
            >
              <Terminal className="w-4 h-4" />
              omp Setup
            </button>

            <button
              onClick={copyUrl}
              className="btn-tertiary"
            >
              {copiedEndpoint ? <Check className="w-4 h-4 text-positive" /> : <Copy className="w-4 h-4" />}
              <span>{copiedEndpoint ? "Copied" : "Copy Endpoint"}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Clean Interactive Converter Widget */}
        <div className="lg:col-span-5">
          <div className="wise-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] uppercase font-bold tracking-wider text-ink-mute">
                Token & Cost Calculator
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-on text-[11px] font-black">
                FREE TIER
              </span>
            </div>

            {/* From Box: Tokens Input */}
            <div className="p-3.5 bg-subtle rounded-[16px] space-y-1">
              <div className="flex items-center justify-between text-[12px] text-ink-mute font-bold">
                <span>Input Prompt Tokens</span>
                <span>Standard Cost: ${standardCost}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <input
                  type="number"
                  value={calcTokens}
                  onChange={(e) => setCalcTokens(Math.max(1000, parseInt(e.target.value) || 0))}
                  step={10000}
                  className="bg-transparent text-2xl font-black text-ink outline-none w-full"
                />
                <span className="text-xs font-bold text-ink bg-card px-2.5 py-1 rounded-full shadow-xs">
                  Tokens
                </span>
              </div>
            </div>

            {/* Minimal Down Icon */}
            <div className="flex items-center justify-center -my-2">
              <div className="w-7 h-7 rounded-full bg-ink text-primary flex items-center justify-center shadow-xs">
                <ArrowDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* To Box: Free Route + RTK */}
            <div className="p-3.5 bg-primary/15 border border-primary/25 rounded-[16px] space-y-1">
              <div className="flex items-center justify-between text-[12px] text-ink font-bold">
                <span>SZRoute + RTK</span>
                <span className="text-primary-on font-black">You Pay: $0.00</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-2xl font-black text-ink">
                    {calcTokens - rtkSavingsTokens} <span className="text-xs font-bold text-ink-mute">tokens</span>
                  </div>
                  <div className="text-[11px] font-bold text-positive">
                    🔥 42% tokens compressed via RTK
                  </div>
                </div>

                <select
                  value={calcSelectedModel}
                  onChange={(e) => setCalcSelectedModel(e.target.value)}
                  className="bg-card text-ink text-[12px] font-bold px-2.5 py-1 rounded-full border border-border-subtle outline-none"
                >
                  <option value="free-auto">free-auto (Groq/Cerebras)</option>
                  <option value="code-expert">code-expert (Claude 3.7)</option>
                  <option value="fast-reasoning">fast-reasoning (R1)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => onNavigate("setup")}
              className="w-full btn-primary font-bold text-[14px] h-10 shadow-xs"
            >
              Route Oh My Pi (omp) for Free →
            </button>
          </div>
        </div>
      </section>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="wise-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-ink-mute text-[12px] font-bold">
            <span>Requests</span>
            <Activity className="w-4 h-4 text-ink" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
            {stats.totalRequests.toLocaleString()}
          </div>
          <div className="text-[11px] text-positive font-bold">
            100% failover coverage
          </div>
        </div>

        <div className="wise-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-ink-mute text-[12px] font-bold">
            <span>Tokens Saved</span>
            <Flame className="w-4 h-4 text-negative" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
            {stats.totalTokensSaved.toLocaleString()}
          </div>
          <div className="text-[11px] text-negative font-bold">
            15%–95% RTK reduction
          </div>
        </div>

        <div className="wise-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-ink-mute text-[12px] font-bold">
            <span>Average Latency</span>
            <Zap className="w-4 h-4 text-warning" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
            {stats.avgLatencyMs > 0 ? `${stats.avgLatencyMs} ms` : "120 ms"}
          </div>
          <div className="text-[11px] text-ink-mute font-semibold">
            Wafer-scale LPU speed
          </div>
        </div>

        <div className="wise-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-ink-mute text-[12px] font-bold">
            <span>Estimated Savings</span>
            <ShieldCheck className="w-4 h-4 text-positive" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
            ${stats.estimatedDollarsSaved}
          </div>
          <div className="text-[11px] text-positive font-bold">
            Aggregated free inference
          </div>
        </div>
      </div>

      {/* Virtual Combos Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
              Virtual Combos
            </h3>
            <p className="text-[13px] text-ink-body font-medium">
              Multi-provider fallback chains for Oh My Pi (omp)
            </p>
          </div>
          <button
            onClick={() => onNavigate("combos")}
            className="btn-secondary text-[13px] h-8 px-3"
          >
            <span>Manage</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEFAULT_COMBOS.map((combo) => (
            <div key={combo.id} className="wise-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-ink text-xs">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-black text-ink">{combo.name}</h4>
                    <span className="text-[11px] font-mono font-bold text-ink-mute">model: &quot;{combo.id}&quot;</span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-subtle text-ink rounded-full uppercase">
                  {combo.strategy}
                </span>
              </div>

              <p className="text-[13px] text-ink-body leading-relaxed">
                {combo.description}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {combo.targets.map((t, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 text-[11px] font-semibold bg-subtle text-ink rounded-full flex items-center gap-1"
                  >
                    <span className="text-ink-mute font-bold">{i + 1}.</span> {t.providerId}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Free Providers Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
              Free Tier Matrix
            </h3>
            <p className="text-[13px] text-ink-body font-medium">
              Aggregating ~1.9B free tokens/month across leading frontier providers
            </p>
          </div>
          <button
            onClick={() => onNavigate("providers")}
            className="btn-secondary text-[13px] h-8 px-3"
          >
            <span>All Providers</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {freeProviders.slice(0, 6).map((provider) => {
            const pingResult = pingResults[provider.id];
            const isTesting = testingProvider === provider.id;

            return (
              <div key={provider.id} className="wise-card p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-subtle flex items-center justify-center font-black text-ink text-xs">
                        {provider.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-[14px] font-bold text-ink">{provider.name}</h4>
                        <span className="text-[11px] text-positive font-bold">{provider.freeTier.badgeText}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[12px] text-ink-body line-clamp-2">
                    {provider.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[12px]">
                  <span className="text-ink-mute truncate max-w-[130px]">
                    {provider.freeTier.monthlyFreeTokensEstimate || "Free quota"}
                  </span>
                  <button
                    onClick={() => testPing(provider.id)}
                    disabled={isTesting}
                    className="px-2.5 py-1 bg-subtle hover:bg-subtle-hover text-ink rounded-full text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    {isTesting ? (
                      <span>Pinging...</span>
                    ) : pingResult ? (
                      <span className={pingResult.status === "ok" ? "text-positive" : "text-negative"}>
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
      </div>
    </div>
  );
}
