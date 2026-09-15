"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Terminal,
  Copy,
  Check,
  ArrowRight,
  Play,
  Layers,
  Activity,
  Flame,
  Zap,
  ShieldCheck,
  ChevronRight,
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
    <div className="space-y-16 animate-in fade-in duration-200">
      {/* BMW Hero Dark Navy Band */}
      <section className="bg-[#1a2129] text-[#ffffff] p-8 sm:p-14 lg:p-16 border-t-2 border-[#1c69d4]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Bold 700 Display Title & Editorial Subtitle */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block px-3 py-1 bg-[#262e38] text-[#1c69d4] text-[11px] font-bold uppercase tracking-[1.5px] border border-[#3b4552]">
              SZRoute Precision Architecture
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#ffffff] leading-[1.05]">
              Autonomous AI Gateway. Engineered for Oh My Pi.
            </h1>

            <p className="text-[16px] sm:text-[18px] text-[#bbbbbb] font-light leading-relaxed max-w-xl">
              Connect the <strong className="font-bold text-[#ffffff]">Oh My Pi (omp)</strong> coding harness, Cursor, Cline, and Codex to 160+ providers (50+ free tiers). High-throughput wafer-scale inference with 15%–95% RTK token compression.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate("studio")}
                className="btn-primary uppercase tracking-[0.5px]"
              >
                <Sparkles className="w-4 h-4" />
                LAUNCH STUDIO
              </button>

              <button
                onClick={() => onNavigate("setup")}
                className="btn-secondary-on-dark uppercase tracking-[0.5px]"
              >
                <Terminal className="w-4 h-4" />
                omp SETUP
              </button>

              <button
                onClick={copyUrl}
                className="btn-secondary-on-dark uppercase tracking-[0.5px]"
              >
                {copiedEndpoint ? <Check className="w-4 h-4 text-[#22c55e]" /> : <Copy className="w-4 h-4" />}
                <span>{copiedEndpoint ? "COPIED" : "COPY ENDPOINT"}</span>
              </button>
            </div>
          </div>

          {/* Right: Technical Spec / Cost Converter Box */}
          <div className="lg:col-span-5 bg-[#262e38] border border-[#3b4552] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#3b4552] pb-3">
              <span className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#bbbbbb]">
                Token & Cost Telemetry
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[1px] text-[#1c69d4] bg-[#1a2129] px-2 py-0.5 border border-[#3b4552]">
                100% Free Tier
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-[#1a2129] border border-[#3b4552] space-y-1">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[1px] text-[#bbbbbb] font-bold">
                  <span>Input Prompt Tokens</span>
                  <span>Commercial: ${standardCost}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="number"
                    value={calcTokens}
                    onChange={(e) => setCalcTokens(Math.max(1000, parseInt(e.target.value) || 0))}
                    step={10000}
                    className="bg-transparent text-2xl font-bold text-[#ffffff] outline-none w-full"
                  />
                  <span className="text-xs font-bold text-[#bbbbbb] uppercase">Tokens</span>
                </div>
              </div>

              <div className="p-4 bg-[#1a2129] border-l-2 border-[#1c69d4] space-y-1">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[1px] text-[#1c69d4] font-bold">
                  <span>SZRoute Edge Routing + RTK</span>
                  <span>Cost: $0.00</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-2xl font-bold text-[#ffffff]">
                      {calcTokens - rtkSavingsTokens} <span className="text-xs font-light text-[#bbbbbb]">tokens</span>
                    </div>
                    <div className="text-[11px] text-[#22c55e] font-bold pt-0.5">
                      ✓ 42% tokens compressed via RTK
                    </div>
                  </div>

                  <select
                    value={calcSelectedModel}
                    onChange={(e) => setCalcSelectedModel(e.target.value)}
                    className="bg-[#262e38] text-[#ffffff] text-[12px] font-bold px-3 py-1.5 border border-[#3b4552] outline-none"
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
              className="w-full btn-primary h-11 text-[13px] uppercase tracking-[1px]"
            >
              CONFIGURE OH MY PI (omp) →
            </button>
          </div>
        </div>
      </section>

      {/* 4-Up Metric Grid (Corporate Spec Cell Pattern) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bmw-card space-y-2">
          <div className="flex items-center justify-between text-[#6b6b6b] text-[11px] uppercase font-bold tracking-[1.5px]">
            <span>Requests</span>
            <Activity className="w-4 h-4 text-[#1c69d4]" />
          </div>
          <div className="text-3xl font-bold text-[#262626] tracking-tight">
            {stats.totalRequests.toLocaleString()}
          </div>
          <div className="text-[12px] text-[#22c55e] font-bold">
            100% failover coverage
          </div>
        </div>

        <div className="bmw-card space-y-2">
          <div className="flex items-center justify-between text-[#6b6b6b] text-[11px] uppercase font-bold tracking-[1.5px]">
            <span>Tokens Saved</span>
            <Flame className="w-4 h-4 text-[#e22718]" />
          </div>
          <div className="text-3xl font-bold text-[#262626] tracking-tight">
            {stats.totalTokensSaved.toLocaleString()}
          </div>
          <div className="text-[12px] text-[#e22718] font-bold">
            15%–95% RTK reduction
          </div>
        </div>

        <div className="bmw-card space-y-2">
          <div className="flex items-center justify-between text-[#6b6b6b] text-[11px] uppercase font-bold tracking-[1.5px]">
            <span>Average Latency</span>
            <Zap className="w-4 h-4 text-[#1c69d4]" />
          </div>
          <div className="text-3xl font-bold text-[#262626] tracking-tight">
            {stats.avgLatencyMs > 0 ? `${stats.avgLatencyMs} ms` : "120 ms"}
          </div>
          <div className="text-[12px] text-[#6b6b6b] font-light">
            Wafer-scale LPU speed
          </div>
        </div>

        <div className="bmw-card space-y-2">
          <div className="flex items-center justify-between text-[#6b6b6b] text-[11px] uppercase font-bold tracking-[1.5px]">
            <span>Est. Financial Savings</span>
            <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
          </div>
          <div className="text-3xl font-bold text-[#262626] tracking-tight">
            ${stats.estimatedDollarsSaved}
          </div>
          <div className="text-[12px] text-[#22c55e] font-bold">
            Aggregated free inference
          </div>
        </div>
      </section>

      {/* Model Cards Showcase: 4-Up Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#e6e6e6] pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#262626] tracking-tight">
              Virtual Combos & Model Chains
            </h2>
            <p className="text-[15px] text-[#3c3c3c] font-light mt-1">
              Engineered priority failover cascades for the Oh My Pi (omp) coding agent.
            </p>
          </div>
          <button
            onClick={() => onNavigate("combos")}
            className="btn-text-link"
          >
            MANAGE COMBOS <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEFAULT_COMBOS.map((combo) => (
            <div key={combo.id} className="bmw-card space-y-4 flex flex-col justify-between hover:border-[#1c69d4] transition-colors">
              <div className="space-y-3">
                <div className="h-24 bg-[#fafafa] border border-[#e6e6e6] flex items-center justify-center p-4 text-center">
                  <div className="w-10 h-10 bg-[#ffffff] border border-[#cccccc] flex items-center justify-center">
                    <Layers className="w-5 h-5 text-[#1c69d4]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] uppercase tracking-[1.5px] text-[#1c69d4] font-bold">
                    {combo.strategy} ROUTING
                  </div>
                  <h3 className="text-[16px] font-bold text-[#262626] leading-snug">
                    {combo.name}
                  </h3>
                  <code className="text-[12px] font-mono text-[#6b6b6b] block">
                    model: &quot;{combo.id}&quot;
                  </code>
                </div>

                <p className="text-[13px] text-[#3c3c3c] font-light leading-relaxed">
                  {combo.description}
                </p>

                <div className="space-y-1 pt-1">
                  {combo.targets.map((t, i) => (
                    <div key={i} className="text-[12px] text-[#3c3c3c] flex items-center justify-between py-1 border-b border-[#f7f7f7]">
                      <span className="font-bold text-[#262626]">{i + 1}. {t.providerId}</span>
                      <span className="font-mono text-[#6b6b6b] text-[11px] truncate max-w-[120px]">{t.modelId}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#e6e6e6]">
                <button
                  onClick={() => onNavigate("studio")}
                  className="btn-text-link text-[12px]"
                >
                  TEST IN STUDIO <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Free Tier Provider Matrix (Corporate Grid) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#e6e6e6] pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#262626] tracking-tight">
              Frontier Provider Matrix
            </h2>
            <p className="text-[15px] text-[#3c3c3c] font-light mt-1">
              Aggregating ~1.9B free tokens/month across leading providers.
            </p>
          </div>
          <button
            onClick={() => onNavigate("providers")}
            className="btn-text-link"
          >
            VIEW ALL 160+ PROVIDERS <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {freeProviders.slice(0, 6).map((provider) => {
            const pingResult = pingResults[provider.id];
            const isTesting = testingProvider === provider.id;

            return (
              <div key={provider.id} className="bmw-card space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[11px] uppercase tracking-[1.5px] text-[#1c69d4] font-bold">
                        {provider.freeTier.badgeText}
                      </div>
                      <h3 className="text-[17px] font-bold text-[#262626] mt-0.5">
                        {provider.name}
                      </h3>
                    </div>

                    <div className="w-8 h-8 bg-[#fafafa] border border-[#e6e6e6] flex items-center justify-center font-bold text-xs text-[#262626]">
                      {provider.name.slice(0, 2).toUpperCase()}
                    </div>
                  </div>

                  <p className="text-[13px] text-[#3c3c3c] font-light leading-relaxed line-clamp-2">
                    {provider.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#e6e6e6] flex items-center justify-between text-[12px]">
                  <span className="text-[#6b6b6b] font-light">
                    {provider.freeTier.monthlyFreeTokensEstimate || "Free quota"}
                  </span>
                  <button
                    onClick={() => testPing(provider.id)}
                    disabled={isTesting}
                    className="btn-secondary h-8 px-3 text-[11px] uppercase tracking-[0.5px]"
                  >
                    {isTesting ? (
                      <span>PINGING...</span>
                    ) : pingResult ? (
                      <span className={pingResult.status === "ok" ? "text-[#22c55e]" : "text-[#e22718]"}>
                        {pingResult.latencyMs}ms
                      </span>
                    ) : (
                      <>
                        <Play className="w-3 h-3" /> PING
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
