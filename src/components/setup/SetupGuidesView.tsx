"use client";

import React, { useState } from "react";
import {
  Terminal,
  Copy,
  Check,
  Code2,
  Cpu,
  Sparkles,
  ExternalLink,
  Layers,
  Zap,
  Sliders,
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
      badge: "One-line setup",
      description: "Connect the Oh My Pi (omp) coding agent to FREE frontier models via SZRoute with RTK token compression.",
      code: `export OPENAI_BASE_URL="${getBaseUrl()}"
export ANTHROPIC_BASE_URL="${getBaseUrl()}"
export OPENAI_API_KEY="szroute-free"
export ANTHROPIC_API_KEY="szroute-free"

# Run omp with your selected virtual combo
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
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header & Dynamic Combo Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#0e0f0c] tracking-tight flex items-center gap-2.5">
            <Terminal className="w-7 h-7 text-[#0e0f0c]" />
            Client Integration & Setup Guides
          </h2>
          <p className="text-[15px] text-[#454745] font-medium mt-1">
            Drop-in zero configuration integration snippets for Oh My Pi (omp) coding agent, Cursor, Cline, Codex, LiteLLM, Python, and cURL.
          </p>
        </div>

        {/* Dynamic Combo Selector */}
        <div className="flex items-center gap-2 bg-[#ffffff] p-2 rounded-full border border-[#e8ebe6] shadow-xs">
          <Sliders className="w-4 h-4 text-[#0e0f0c] ml-2" />
          <span className="text-[13px] text-[#454745] font-bold">Model / Combo:</span>
          <select
            value={selectedCombo}
            onChange={(e) => setSelectedCombo(e.target.value)}
            className="bg-[#e8ebe6] text-[#0e0f0c] rounded-full px-3 py-1 text-[13px] font-bold outline-none cursor-pointer"
          >
            {allCombos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Guides Grid in Wise Card Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {guides.map((guide) => (
          <div key={guide.id} className="wise-card space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#9fe870] flex items-center justify-center font-bold text-[#0e0f0c]">
                    <Terminal className="w-5 h-5 text-[#0e0f0c]" />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-black text-[#0e0f0c]">{guide.title}</h3>
                  </div>
                </div>
                <span className="px-3 py-1 text-[12px] font-bold bg-[#e2f6d5] text-[#054d28] rounded-full">
                  {guide.badge}
                </span>
              </div>

              <p className="text-[14px] text-[#454745] leading-relaxed font-medium">
                {guide.description}
              </p>

              {/* Code Snippet Box in Dark Polarity Container */}
              <div className="relative group">
                <pre className="bg-[#0e0f0c] rounded-[18px] p-4 text-[13px] font-mono text-[#e8ebe6] overflow-x-auto whitespace-pre leading-relaxed shadow-sm">
                  {guide.code}
                </pre>
                <button
                  onClick={() => copySnippet(guide.id, guide.code)}
                  className="absolute top-3 right-3 p-2 bg-[#1a1c17] hover:bg-[#252822] text-[#9fe870] rounded-full transition-all"
                  title="Copy code snippet"
                >
                  {copiedId === guide.id ? (
                    <Check className="w-4 h-4 text-[#9fe870]" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#ffffff]" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
