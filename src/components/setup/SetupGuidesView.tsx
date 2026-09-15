"use client";

import React, { useState } from "react";
import {
  Terminal,
  Copy,
  Check,
  Sliders,
  ChevronRight,
} from "lucide-react";
import { DEFAULT_COMBOS, VirtualCombo } from "@/lib/providers/catalog";

interface SetupGuidesViewProps {
  customCombos?: VirtualCombo[];
  apiKeys?: Record<string, string>;
}

export function SetupGuidesView({ customCombos = DEFAULT_COMBOS, apiKeys = {} }: SetupGuidesViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCombo, setSelectedCombo] = useState<string>("free-auto");

  const getBaseUrl = () => {
    return typeof window !== "undefined" ? `${window.location.origin}/v1` : "https://szroute.vercel.app/v1";
  };

  const copySnippet = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const allCombos = customCombos.length > 0 ? customCombos : DEFAULT_COMBOS;

  const guides = [
    {
      id: "omp-coding-agent",
      title: "Oh My Pi (omp) Coding Agent",
      badge: "Primary Harness",
      description: "Connect the Oh My Pi (omp) coding agent to frontier models with automated failovers and RTK compression.",
      code: `export OPENAI_BASE_URL="${getBaseUrl()}"
export ANTHROPIC_BASE_URL="${getBaseUrl()}"
export OPENAI_API_KEY="szroute-free"
export ANTHROPIC_API_KEY="szroute-free"

# Launch omp with virtual combo
omp --model ${selectedCombo}`,
    },
    {
      id: "cursor",
      title: "Cursor IDE",
      badge: "OpenAI Compatible",
      description: "Set custom model endpoint in Cursor Settings -> Models -> OpenAI API Key.",
      code: `// In Cursor Settings -> Models:
1. Turn ON "Override OpenAI Base URL"
2. Base URL: ${getBaseUrl()}
3. API Key: szroute-free
4. Add Model Name: ${selectedCombo}`,
    },
    {
      id: "cline",
      title: "Cline & Roo Code",
      badge: "VS Code Extension",
      description: "Use OpenAI Compatible provider in Cline / Roo Code settings.",
      code: `API Provider: OpenAI Compatible
Base URL: ${getBaseUrl()}
API Key: szroute-free
Model ID: ${selectedCombo}`,
    },
    {
      id: "python-sdk",
      title: "Python OpenAI SDK",
      badge: "Standard SDK",
      description: "Drop-in OpenAI SDK compatibility in 3 lines.",
      code: `from openai import OpenAI

client = OpenAI(
    base_url="${getBaseUrl()}",
    api_key="szroute-free"
)

response = client.chat.completions.create(
    model="${selectedCombo}",
    messages=[{"role": "user", "content": "Explain Dijkstra algorithm simply."}],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")`,
    },
    {
      id: "curl-api",
      title: "cURL / HTTP Endpoint",
      badge: "REST API",
      description: "Universal chat completions cURL command with SSE streaming.",
      code: `curl -X POST "${getBaseUrl()}/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer szroute-free" \\
  -H "x-szroute-compress: true" \\
  -d '{
    "model": "${selectedCombo}",
    "messages": [{"role": "user", "content": "Explain quantum computing simply."}],
    "stream": true
  }'`,
    },
    {
      id: "litellm",
      title: "LiteLLM Proxy",
      badge: "Gateway Proxy",
      description: "Route LiteLLM traffic directly through SZRoute.",
      code: `model_list:
  - model_name: szroute-${selectedCombo}
    litellm_params:
      model: openai/${selectedCombo}
      api_base: "${getBaseUrl()}"
      api_key: "szroute-free"`,
    },
  ];

  return (
    <div className="space-y-6 animate-spring-slide-up">
      {/* Header & Dynamic Combo Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--label-primary)] tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5856D6]/15 text-[#5856D6] flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <span>Client Integration & Setup Guides</span>
          </h2>
          <p className="text-[14px] text-[var(--label-secondary)] mt-0.5">
            Drop-in configuration snippets for Oh My Pi (omp), Cursor, Cline, Codex, Python SDK, and cURL.
          </p>
        </div>

        {/* Dynamic Combo Selector Pill */}
        <div className="flex items-center gap-2 bg-[var(--bg-subtle)] px-3 py-1.5 rounded-2xl">
          <Sliders className="w-4 h-4 text-[var(--system-blue)]" />
          <span className="text-[12px] text-[var(--label-secondary)] font-semibold">Target:</span>
          <select
            value={selectedCombo}
            onChange={(e) => setSelectedCombo(e.target.value)}
            className="bg-[var(--bg-card)] text-[var(--label-primary)] px-3 py-1 text-[12px] font-semibold rounded-xl outline-none border border-[var(--separator)] cursor-pointer"
          >
            {allCombos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Guides 2-Up Concentric Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {guides.map((guide) => (
          <div
            key={guide.id}
            className="apple-card-interactive p-6 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-[var(--system-blue)]/12 text-[var(--system-blue)] flex items-center justify-center">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[var(--label-primary)]">
                      {guide.title}
                    </h3>
                  </div>
                </div>
                <span className="badge-apple-blue text-[11px] py-0.5">
                  {guide.badge}
                </span>
              </div>

              <p className="text-[13px] text-[var(--label-secondary)] leading-relaxed">
                {guide.description}
              </p>

              {/* Code Snippet Box */}
              <div className="relative group pt-1">
                <pre className="bg-[var(--bg-card-secondary)] dark:bg-black/60 text-[var(--label-primary)] border border-[var(--separator)] rounded-2xl p-4 text-[13px] font-mono overflow-x-auto whitespace-pre leading-relaxed shadow-xs">
                  {guide.code}
                </pre>
                <button
                  onClick={() => copySnippet(guide.id, guide.code)}
                  className="absolute top-3 right-3 p-2 bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] text-[var(--label-primary)] rounded-xl border border-[var(--separator)] active:scale-90 transition-all shadow-xs"
                  title="Copy code snippet"
                >
                  {copiedId === guide.id ? (
                    <Check className="w-4 h-4 text-[var(--system-green)]" />
                  ) : (
                    <Copy className="w-4 h-4 text-[var(--label-secondary)]" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--separator)]">
              <span className="text-[12px] font-semibold text-[var(--system-blue)] flex items-center gap-1">
                Tested on Vercel Edge <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
