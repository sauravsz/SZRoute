"use client";

import React, { useState } from "react";
import {
  Terminal,
  Copy,
  Check,
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
      description: "Connect the Oh My Pi (omp) coding agent to FREE frontier models with RTK token compression.",
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Dynamic Combo Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight flex items-center gap-2">
            <Terminal className="w-6 h-6" />
            Client Setup Guides
          </h2>
          <p className="text-[14px] text-ink-body font-medium mt-0.5">
            Drop-in zero configuration integration snippets for Oh My Pi (omp), Cursor, Cline, and Codex
          </p>
        </div>

        {/* Dynamic Combo Selector */}
        <div className="flex items-center gap-2 bg-card p-1.5 rounded-full border border-border-subtle">
          <Sliders className="w-3.5 h-3.5 text-ink ml-1.5" />
          <span className="text-[12px] text-ink-mute font-bold">Model:</span>
          <select
            value={selectedCombo}
            onChange={(e) => setSelectedCombo(e.target.value)}
            className="bg-subtle text-ink rounded-full px-2.5 py-0.5 text-[12px] font-bold outline-none cursor-pointer"
          >
            {allCombos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {guides.map((guide) => (
          <div key={guide.id} className="wise-card p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center font-bold text-ink text-xs">
                    <Terminal className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-[15px] font-black text-ink">{guide.title}</h3>
                </div>
                <span className="badge-positive text-[10px] py-0 px-2">
                  {guide.badge}
                </span>
              </div>

              <p className="text-[13px] text-ink-body leading-relaxed font-medium">
                {guide.description}
              </p>

              {/* Code Snippet Box */}
              <div className="relative group">
                <pre className="bg-[#0e0f0c] text-[#e8ebe6] rounded-[16px] p-3.5 text-[12px] font-mono overflow-x-auto whitespace-pre leading-relaxed shadow-xs">
                  {guide.code}
                </pre>
                <button
                  onClick={() => copySnippet(guide.id, guide.code)}
                  className="absolute top-2.5 right-2.5 p-1.5 bg-[#1a1c17] hover:bg-[#252822] text-primary rounded-full transition-all"
                  title="Copy code snippet"
                >
                  {copiedId === guide.id ? (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-white" />
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
