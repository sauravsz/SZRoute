"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  TrendingDown,
  Sparkles,
  Sliders,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { compressPrompt, CompressionResult } from "@/lib/compression/engine";

const SAMPLE_PROMPTS = [
  {
    title: "Verbose Code Review Preamble",
    text: `Please note that as an AI language model, I would like you to kindly review the following TypeScript codebase.
In order to accomplish this task, could you please make sure to check for potential security vulnerabilities and performance bottlenecks.
Due to the fact that this code will run on Vercel Serverless, it is important to note that you should avoid native C++ dependencies.

\`\`\`json
{
  "name": "example-app",
  "version": "1.0.0",
  "dependencies": {
    "next": "15.2.0",
    "react": "19.0.0"
  }
}
\`\`\`
`,
  },
  {
    title: "System Prompt with Redundant Formatting",
    text: `You are an elite software architect.



Please note that you must always write modular code.
In order to guarantee optimal performance, kindly adhere to clean architecture principles.
For the purpose of maintaining strict consistency, please format all outputs in pure Markdown.`,
  },
  {
    title: "Long Multiline Function Prompt",
    text: `Could you please implement a Dijkstra algorithm in TypeScript?
Please note that it is important to note that the graph has weighted directed edges.
In order to prevent infinite loops, kindly track visited nodes in a Set.`,
  },
];

export function CompressionStudioView() {
  const [inputText, setInputText] = useState(SAMPLE_PROMPTS[0].text);
  const [enableRtk, setEnableRtk] = useState(true);
  const [enableCaveman, setEnableCaveman] = useState(true);
  const [compactJson, setCompactJson] = useState(true);
  const [stripMarkdown, setStripMarkdown] = useState(true);
  const [level, setLevel] = useState<"gentle" | "standard" | "aggressive">("standard");
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<CompressionResult | null>(null);

  useEffect(() => {
    const res = compressPrompt(inputText, {
      enableRtk,
      enableCaveman,
      compactJson,
      stripMarkdownSpacing: stripMarkdown,
      level,
    });
    setResult(res);
  }, [inputText, enableRtk, enableCaveman, compactJson, stripMarkdown, level]);

  const copyCompressed = () => {
    if (result?.compressedText) {
      navigator.clipboard.writeText(result.compressedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-[#ff6161]" />
            RTK + Caveman Token Compression Engine
          </h2>
          <p className="text-[14px] text-[#9c9c9d] mt-1">
            Stack algorithmic rules and natural language minification to strip 15%–95% input tokens without losing semantic instructions.
          </p>
        </div>

        {result && (
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-lg bg-[#ff6161]/10 border border-[#ff6161]/25 text-[#ff6161] text-[13px] font-semibold flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4" />
              <span>{result.percentSaved}% Tokens Saved</span>
            </div>
            <button onClick={copyCompressed} className="btn-primary text-[13px] flex items-center gap-1.5">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy Output"}
            </button>
          </div>
        )}
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] text-[#9c9c9d] font-medium mr-1">Sample Prompts:</span>
        {SAMPLE_PROMPTS.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => setInputText(sample.text)}
            className="px-3 py-1 bg-[#101111] hover:bg-[#121212] text-[#cdcdcd] hover:text-white border border-[#242728] rounded-md text-[12px] transition-colors"
          >
            {sample.title}
          </button>
        ))}
      </div>

      {/* Rules & Compression Controls */}
      <div className="raycast-card p-4 bg-[#0d0d0d] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-[13px]">
          <label className="flex items-center gap-2 cursor-pointer text-[#cdcdcd] hover:text-white">
            <input
              type="checkbox"
              checked={enableRtk}
              onChange={(e) => setEnableRtk(e.target.checked)}
              className="rounded bg-[#101111] border-[#242728] text-[#ff6161]"
            />
            <span>RTK Structural Purge</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-[#cdcdcd] hover:text-white">
            <input
              type="checkbox"
              checked={enableCaveman}
              onChange={(e) => setEnableCaveman(e.target.checked)}
              className="rounded bg-[#101111] border-[#242728] text-[#ff6161]"
            />
            <span>Caveman NLP Minification</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-[#cdcdcd] hover:text-white">
            <input
              type="checkbox"
              checked={compactJson}
              onChange={(e) => setCompactJson(e.target.checked)}
              className="rounded bg-[#101111] border-[#242728] text-[#ff6161]"
            />
            <span>Minify JSON</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-[#cdcdcd] hover:text-white">
            <input
              type="checkbox"
              checked={stripMarkdown}
              onChange={(e) => setStripMarkdown(e.target.checked)}
              className="rounded bg-[#101111] border-[#242728] text-[#ff6161]"
            />
            <span>Normalize Spacing</span>
          </label>
        </div>

        {/* Compression Level Selector */}
        <div className="flex items-center gap-1.5 bg-[#101111] p-1 border border-[#242728] rounded-lg text-[12px]">
          {(["gentle", "standard", "aggressive"] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`px-2.5 py-0.5 rounded font-medium capitalize transition-colors ${
                level === lvl
                  ? "bg-[#121212] text-white border border-[#242728]"
                  : "text-[#9c9c9d] hover:text-white"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Prompt Diff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Original Input */}
        <div className="raycast-card p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-white">Original Input Prompt</span>
              <span className="text-[12px] font-mono text-[#9c9c9d] bg-[#101111] px-2 py-0.5 rounded border border-[#242728]">
                {result?.originalTokens || 0} tokens
              </span>
            </div>
            <textarea
              rows={12}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste any prompt or conversation history..."
              className="w-full bg-[#101111] text-white border border-[#242728] rounded-lg p-3 text-[13px] font-mono outline-none resize-none focus:border-[#434345]"
            />
          </div>
          <div className="text-[12px] text-[#6a6b6c] flex items-center justify-between">
            <span>{inputText.length} characters</span>
            <span>Raw context</span>
          </div>
        </div>

        {/* Right: Compressed Output */}
        <div className="raycast-card p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#59d499] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Compressed Output (Dispatched to Model)
              </span>
              <span className="text-[12px] font-mono text-[#59d499] bg-[#59d499]/10 px-2 py-0.5 rounded border border-[#59d499]/20">
                {result?.compressedTokens || 0} tokens ({result?.tokensSaved || 0} saved)
              </span>
            </div>
            <textarea
              rows={12}
              readOnly
              value={result?.compressedText || ""}
              className="w-full bg-[#101111] text-[#cdcdcd] border border-[#242728] rounded-lg p-3 text-[13px] font-mono outline-none resize-none"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-[#242728]">
            <div className="text-[11px] uppercase tracking-wider text-[#6a6b6c] font-medium">
              Applied Compression Rules ({result?.rulesApplied.length || 0})
            </div>
            <div className="flex flex-wrap gap-1">
              {result?.rulesApplied.length === 0 ? (
                <span className="text-[12px] text-[#9c9c9d]">No rules needed (already optimal)</span>
              ) : (
                result?.rulesApplied.map((rule, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[11px] bg-[#121212] text-[#ff6161] border border-[#242728] rounded"
                  >
                    ✓ {rule}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
