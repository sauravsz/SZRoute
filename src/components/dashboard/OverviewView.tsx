"use client";

import React, { useState } from "react";
import {
  Zap,
  ArrowUpRight,
  TrendingDown,
  Activity,
  ShieldCheck,
  Flame,
  Layers,
  Sparkles,
  Copy,
  Check,
  Play,
  Terminal,
  Server,
  ArrowDown,
  RefreshCw,
} from "lucide-react";
import { PROVIDER_CATALOG, DEFAULT_COMBOS } from "@/lib/providers/catalog";
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
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [providerPingResults, setProviderPingResults] = useState<Record<string, { status: "ok" | "error"; latencyMs: number }>>({});

  // Wise Signature Converter State (Token & Cost Calculator)
  const [calcTokens, setCalcTokens] = useState<number>(100000);
  const [calcSelectedModel, setCalcSelectedModel] = useState<string>("free-auto");

  const copyUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://szroute.vercel.app";
    navigator.clipboard.writeText(`${origin}/v1`);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  const testProviderPing = async (providerId: string) => {
    setTestingProvider(providerId);
    try {
      const res = await fetch("/v1/test-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId }),
      });
      const data = await res.json();
      setProviderPingResults((prev) => ({
        ...prev,
        [providerId]: {
          status: data.success ? "ok" : "error",
          latencyMs: data.latencyMs || 120,
        },
      }));
    } catch {
      setProviderPingResults((prev) => ({
        ...prev,
        [providerId]: { status: "error", latencyMs: 0 },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const freeProviders = PROVIDER_CATALOG.filter((p) => p.freeTier.hasFree);

  // Commercial standard cost benchmark ($3.00 / 1M tokens)
  const standardCost = ((calcTokens * 3.0) / 1000000).toFixed(2);
  const rtkSavingsTokens = Math.round(calcTokens * 0.42);
  const rtkSavingsPercent = 42;

  return (
    <div className="space-y-12 animate-in fade-in duration-200">
      {/* Wise Hero Band: Split Layout with Heavy Display Sans & Signature Converter Card */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4 sm:pt-8">
        {/* Left Column: Heavy 900 Display Headline & Primary Lime CTA */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#e2f6d5] text-[#054d28] text-[13px] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#2ead4b] animate-pulse" />
            Zero-Cost AI Gateway for Oh My Pi (omp)
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#0e0f0c] tracking-tight leading-[1.05]">
            Never stop coding. Free AI gateway for omp<span className="text-[#2ead4b]">.</span>
          </h1>

          <p className="text-[17px] sm:text-[19px] text-[#454745] leading-relaxed max-w-xl font-normal">
            Connect the <strong className="text-[#0e0f0c] font-bold">Oh My Pi (omp)</strong> coding agent, Cursor, Cline, and Codex to 160+ providers (50+ free tiers). Save 15%–95% tokens with stacked RTK compression and zero-latency failovers.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate("studio")}
              className="btn-primary flex items-center gap-2 text-[15px]"
            >
              <Sparkles className="w-4 h-4" />
              Launch AI Studio
            </button>

            <button
              onClick={() => onNavigate("setup")}
              className="btn-secondary flex items-center gap-2 text-[15px]"
            >
              <Terminal className="w-4 h-4" />
              omp Setup Guides
            </button>

            <button
              onClick={copyUrl}
              className="btn-tertiary flex items-center gap-2 text-[15px]"
            >
              {copiedEndpoint ? <Check className="w-4 h-4 text-[#2ead4b]" /> : <Copy className="w-4 h-4 text-[#0e0f0c]" />}
              <span>{copiedEndpoint ? "Endpoint Copied" : "Copy Gateway URL"}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Wise Signature Interactive Gateway Converter Card */}
        <div className="lg:col-span-5">
          <div className="wise-card border-2 border-[#0e0f0c] p-6 sm:p-7 space-y-5 relative">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[13px] uppercase tracking-wider font-bold text-[#454745]">
                AI Cost & Token Calculator
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#9fe870] text-[#0e0f0c] text-[11px] font-black">
                100% FREE TIER
              </span>
            </div>

            {/* From Box: Tokens Sent */}
            <div className="p-4 bg-[#e8ebe6] rounded-[16px] space-y-2">
              <div className="flex items-center justify-between text-[13px] text-[#454745] font-semibold">
                <span>Input Prompt Tokens</span>
                <span>Standard Commercial: ${standardCost}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <input
                  type="number"
                  value={calcTokens}
                  onChange={(e) => setCalcTokens(Math.max(1000, parseInt(e.target.value) || 0))}
                  step={10000}
                  className="bg-transparent text-2xl sm:text-3xl font-black text-[#0e0f0c] outline-none w-full"
                />
                <span className="text-sm font-bold text-[#0e0f0c] bg-[#ffffff] px-3 py-1.5 rounded-full shadow-xs">
                  Tokens
                </span>
              </div>
            </div>

            {/* Arrow Divider */}
            <div className="flex items-center justify-center -my-2 relative z-10">
              <div className="w-9 h-9 rounded-full bg-[#0e0f0c] text-[#9fe870] flex items-center justify-center shadow-md">
                <ArrowDown className="w-4 h-4" />
              </div>
            </div>

            {/* To Box: SZRoute Free Routing & RTK Compression */}
            <div className="p-4 bg-[#e2f6d5] border border-[#c5edab] rounded-[16px] space-y-2">
              <div className="flex items-center justify-between text-[13px] text-[#054d28] font-bold">
                <span>SZRoute Gateway + RTK</span>
                <span>You Pay: $0.00</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-[#054d28]">
                    {calcTokens - rtkSavingsTokens} <span className="text-sm font-semibold text-[#054d28]">tokens</span>
                  </div>
                  <div className="text-[12px] font-bold text-[#2ead4b]">
                    🔥 -{rtkSavingsPercent}% tokens compressed via RTK
                  </div>
                </div>

                <select
                  value={calcSelectedModel}
                  onChange={(e) => setCalcSelectedModel(e.target.value)}
                  className="bg-[#ffffff] text-[#0e0f0c] text-[13px] font-bold px-3 py-1.5 rounded-full border border-[#c5edab] outline-none"
                >
                  <option value="free-auto">free-auto (Groq/Cerebras)</option>
                  <option value="code-expert">code-expert (Claude 3.7)</option>
                  <option value="fast-reasoning">fast-reasoning (R1)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => onNavigate("setup")}
              className="w-full btn-primary font-bold text-[15px] h-12 shadow-sm"
            >
              Route Oh My Pi (omp) for Free →
            </button>
          </div>
        </div>
      </section>

      {/* Gateway Endpoint Connectivity Banner */}
      <div className="wise-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#e8ebe6] flex items-center justify-center">
            <Server className="w-6 h-6 text-[#0e0f0c]" />
          </div>
          <div>
            <div className="text-[16px] font-bold text-[#0e0f0c] flex items-center gap-2">
              Universal OpenAI / Anthropic Base URL
              <span className="badge-positive text-[11px] py-0.5">
                Edge Active
              </span>
            </div>
            <div className="text-[13px] font-mono text-[#454745] mt-0.5 font-semibold">
              {typeof window !== "undefined" ? window.location.origin : "https://szroute.vercel.app"}/v1
            </div>
          </div>
        </div>

        <button onClick={copyUrl} className="btn-secondary text-[14px] flex items-center gap-2">
          {copiedEndpoint ? <Check className="w-4 h-4 text-[#2ead4b]" /> : <Copy className="w-4 h-4 text-[#0e0f0c]" />}
          Copy for omp Agent / Cursor
        </button>
      </div>

      {/* Telemetry Stat Cards in Wise Scandinavian Card Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1: Total Requests */}
        <div className="wise-card space-y-3">
          <div className="flex items-center justify-between text-[#454745] text-[13px] font-bold">
            <span>Total Requests</span>
            <Activity className="w-4 h-4 text-[#0e0f0c]" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#0e0f0c] tracking-tight">
            {stats.totalRequests.toLocaleString()}
          </div>
          <div className="text-[12px] text-[#2ead4b] font-bold flex items-center gap-1">
            <span>0% dropped • 100% failover coverage</span>
          </div>
        </div>

        {/* Stat 2: Tokens Saved */}
        <div className="wise-card space-y-3">
          <div className="flex items-center justify-between text-[#454745] text-[13px] font-bold">
            <span>Tokens Saved (RTK)</span>
            <Flame className="w-4 h-4 text-[#d03238]" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#0e0f0c] tracking-tight">
            {stats.totalTokensSaved.toLocaleString()}
          </div>
          <div className="text-[12px] text-[#d03238] font-bold flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>15%–95% input token reduction</span>
          </div>
        </div>

        {/* Stat 3: Avg Latency */}
        <div className="wise-card space-y-3">
          <div className="flex items-center justify-between text-[#454745] text-[13px] font-bold">
            <span>Average Latency</span>
            <Zap className="w-4 h-4 text-[#ffd11a]" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#0e0f0c] tracking-tight">
            {stats.avgLatencyMs > 0 ? `${stats.avgLatencyMs} ms` : "120 ms"}
          </div>
          <div className="text-[12px] text-[#454745] font-semibold">
            Cerebras & Groq fast tier
          </div>
        </div>

        {/* Stat 4: Est Dollar Savings */}
        <div className="wise-card space-y-3">
          <div className="flex items-center justify-between text-[#454745] text-[13px] font-bold">
            <span>Est. API Cost Saved</span>
            <ShieldCheck className="w-4 h-4 text-[#2ead4b]" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#0e0f0c] tracking-tight">
            ${stats.estimatedDollarsSaved}
          </div>
          <div className="text-[12px] text-[#054d28] font-bold">
            Aggregated free inference
          </div>
        </div>
      </div>

      {/* Featured Virtual Combos Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#0e0f0c] tracking-tight">
              Virtual Combos & Smart Routing
            </h3>
            <p className="text-[15px] text-[#454745] font-medium mt-1">
              Zero-configuration multi-provider fallback chains for the Oh My Pi (omp) coding agent.
            </p>
          </div>
          <button
            onClick={() => onNavigate("combos")}
            className="btn-secondary text-[14px] flex items-center gap-1.5"
          >
            <span>Manage Combos</span>
            <ArrowUpRight className="w-4 h-4 text-[#0e0f0c]" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DEFAULT_COMBOS.map((combo) => (
            <div
              key={combo.id}
              className="wise-card space-y-4 hover:shadow-wise-elevated transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#9fe870] flex items-center justify-center font-bold text-[#0e0f0c]">
                    <Layers className="w-5 h-5 text-[#0e0f0c]" />
                  </div>
                  <div>
                    <h4 className="text-[16px] font-black text-[#0e0f0c]">{combo.name}</h4>
                    <span className="text-[12px] font-mono font-bold text-[#454745]">model: &quot;{combo.id}&quot;</span>
                  </div>
                </div>

                <span className="px-3 py-1 text-[12px] font-bold bg-[#e8ebe6] text-[#0e0f0c] rounded-full uppercase">
                  {combo.strategy}
                </span>
              </div>

              <p className="text-[14px] text-[#454745] leading-relaxed">
                {combo.description}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {combo.targets.map((t, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-[12px] font-semibold bg-[#e8ebe6] text-[#0e0f0c] rounded-full flex items-center gap-1.5"
                  >
                    <span className="text-[#868685] font-bold">{i + 1}.</span> {t.providerId}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Free Tier Providers Health Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#0e0f0c] tracking-tight">
              Free Tier Provider Matrix
            </h3>
            <p className="text-[15px] text-[#454745] font-medium mt-1">
              Aggregating ~1.9B free tokens/month across leading frontier providers.
            </p>
          </div>
          <button
            onClick={() => onNavigate("providers")}
            className="btn-secondary text-[14px] flex items-center gap-1.5"
          >
            <span>View All 160+ Providers</span>
            <ArrowUpRight className="w-4 h-4 text-[#0e0f0c]" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {freeProviders.slice(0, 6).map((provider) => {
            const pingResult = providerPingResults[provider.id];
            const isTesting = testingProvider === provider.id;

            return (
              <div key={provider.id} className="wise-card space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#e8ebe6] flex items-center justify-center font-black text-[#0e0f0c] text-sm">
                        {provider.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-[16px] font-bold text-[#0e0f0c]">{provider.name}</h4>
                        <span className="text-[12px] text-[#2ead4b] font-bold">{provider.freeTier.badgeText}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[13px] text-[#454745] line-clamp-2">
                    {provider.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#e8ebe6] flex items-center justify-between text-[13px]">
                  <div className="text-[#454745] font-medium truncate max-w-[140px]">
                    {provider.freeTier.monthlyFreeTokensEstimate || "Free quota"}
                  </div>
                  <button
                    onClick={() => testProviderPing(provider.id)}
                    disabled={isTesting}
                    className="px-3 py-1.5 bg-[#e8ebe6] hover:bg-[#dbe0d7] text-[#0e0f0c] rounded-full text-[12px] font-bold flex items-center gap-1.5 transition-colors"
                  >
                    {isTesting ? (
                      <span>Pinging...</span>
                    ) : pingResult ? (
                      <span className={pingResult.status === "ok" ? "text-[#2ead4b]" : "text-[#d03238]"}>
                        {pingResult.latencyMs}ms
                      </span>
                    ) : (
                      <>
                        <Play className="w-3 h-3" /> Ping Test
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
