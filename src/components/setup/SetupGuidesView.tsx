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
      badge: "PRIMARY HARNESS",
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
      badge: "OPENAI COMPATIBLE",
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
      badge: "VS CODE EXTENSION",
      description: "Use OpenAI Compatible provider in Cline / Roo Code settings.",
      code: `API Provider: OpenAI Compatible
Base URL: ${getBaseUrl()}
API Key: szroute-free
Model ID: ${selectedCombo}`,
    },
    {
      id: "python-sdk",
      title: "Python OpenAI SDK",
      badge: "STANDARD SDK",
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
      badge: "GATEWAY PROXY",
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
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Dynamic Combo Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e6e6e6] pb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#262626] tracking-tight">
            Client Integration & Setup Guides
          </h2>
          <p className="text-[15px] text-[#3c3c3c] font-light mt-1">
            Engineered integration snippets for Oh My Pi (omp), Cursor, Cline, Codex, Python SDK, and cURL.
          </p>
        </div>

        {/* Dynamic Combo Selector */}
        <div className="flex items-center gap-3 bg-[#f7f7f7] border border-[#cccccc] p-2">
          <Sliders className="w-4 h-4 text-[#1c69d4]" />
          <span className="text-[12px] text-[#262626] font-bold uppercase tracking-[1px]">Target Model:</span>
          <select
            value={selectedCombo}
            onChange={(e) => setSelectedCombo(e.target.value)}
            className="bg-[#ffffff] text-[#262626] px-3 py-1 text-[12px] font-bold outline-none border border-[#cccccc] cursor-pointer"
          >
            {allCombos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Guides 2-Up Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {guides.map((guide) => (
          <div key={guide.id} className="bmw-card space-y-4 flex flex-col justify-between hover:border-[#1c69d4] transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#f7f7f7] pb-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[1.5px] text-[#1c69d4] font-bold">
                    {guide.badge}
                  </div>
                  <h3 className="text-[17px] font-bold text-[#262626] mt-0.5">
                    {guide.title}
                  </h3>
                </div>

                <div className="w-8 h-8 bg-[#fafafa] border border-[#e6e6e6] flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-[#1c69d4]" />
                </div>
              </div>

              <p className="text-[13px] text-[#3c3c3c] font-light leading-relaxed">
                {guide.description}
              </p>

              {/* Code Snippet Box */}
              <div className="relative group pt-1">
                <pre className="bg-[#1a2129] text-[#ffffff] border-l-2 border-[#1c69d4] p-4 text-[13px] font-mono overflow-x-auto whitespace-pre leading-relaxed font-light">
                  {guide.code}
                </pre>
                <button
                  onClick={() => copySnippet(guide.id, guide.code)}
                  className="absolute top-3 right-3 p-2 bg-[#262e38] hover:bg-[#3b4552] text-[#ffffff] transition-colors"
                  title="Copy code snippet"
                >
                  {copiedId === guide.id ? (
                    <Check className="w-4 h-4 text-[#22c55e]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-bold text-[#1c69d4] uppercase tracking-[1px] flex items-center gap-1">
                TESTED ON VERCEL EDGE <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
