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
    text: `You are an elite software architect for Oh My Pi (omp).



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
          <h2 className="text-3xl font-black text-[#0e0f0c] tracking-tight flex items-center gap-2.5">
            <Flame className="w-7 h-7 text-[#d03238]" />
            RTK + Caveman Token Compression Engine
          </h2>
          <p className="text-[15px] text-[#454745] font-medium mt-1">
            Stack algorithmic rules and natural language minification to strip 15%–95% input tokens without losing instructions.
          </p>
        </div>

        {result && (
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-full bg-[#e2f6d5] text-[#054d28] text-[14px] font-black flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              <span>{result.percentSaved}% Tokens Saved</span>
            </div>
            <button onClick={copyCompressed} className="btn-primary text-[14px] flex items-center gap-1.5">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy Output"}
            </button>
          </div>
        )}
      </div>

      {/* Preset Sample Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13px] text-[#454745] font-bold mr-1">Sample Prompts:</span>
        {SAMPLE_PROMPTS.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => setInputText(sample.text)}
            className="px-3.5 py-1.5 bg-[#ffffff] hover:bg-[#e8ebe6] text-[#0e0f0c] font-semibold rounded-full text-[13px] border border-[#e8ebe6] transition-colors shadow-xs"
          >
            {sample.title}
          </button>
        ))}
      </div>

      {/* Rules & Compression Controls */}
      <div className="wise-card p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-[14px] font-bold text-[#0e0f0c]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enableRtk}
              onChange={(e) => setEnableRtk(e.target.checked)}
              className="rounded accent-[#0e0f0c]"
            />
            <span>RTK Structural Purge</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enableCaveman}
              onChange={(e) => setEnableCaveman(e.target.checked)}
              className="rounded accent-[#0e0f0c]"
            />
            <span>Caveman NLP Minification</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={compactJson}
              onChange={(e) => setCompactJson(e.target.checked)}
              className="rounded accent-[#0e0f0c]"
            />
            <span>Minify JSON</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={stripMarkdown}
              onChange={(e) => setStripMarkdown(e.target.checked)}
              className="rounded accent-[#0e0f0c]"
            />
            <span>Normalize Spacing</span>
          </label>
        </div>

        {/* Compression Level Selector */}
        <div className="flex items-center gap-1.5 bg-[#e8ebe6] p-1 rounded-full text-[12px] font-bold">
          {(["gentle", "standard", "aggressive"] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`px-3 py-1 rounded-full capitalize transition-all ${
                level === lvl
                  ? "bg-[#0e0f0c] text-white shadow-xs"
                  : "text-[#454745] hover:text-[#0e0f0c]"
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
        <div className="wise-card space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold text-[#0e0f0c]">Original Prompt Context</span>
              <span className="text-[12px] font-mono font-bold text-[#454745] bg-[#e8ebe6] px-3 py-1 rounded-full">
                {result?.originalTokens || 0} tokens
              </span>
            </div>
            <textarea
              rows={12}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste any prompt or conversation history..."
              className="w-full bg-[#e8ebe6] text-[#0e0f0c] rounded-[16px] p-4 text-[14px] font-mono outline-none resize-none focus:ring-2 focus:ring-[#9fe870]"
            />
          </div>
          <div className="text-[13px] text-[#868685] font-medium flex items-center justify-between">
            <span>{inputText.length} characters</span>
            <span>Raw context</span>
          </div>
        </div>

        {/* Right: Compressed Output */}
        <div className="wise-card space-y-4 flex flex-col justify-between border-2 border-[#9fe870]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold text-[#054d28] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#2ead4b]" /> Compressed Output (Dispatched)
              </span>
              <span className="text-[12px] font-mono font-bold text-[#054d28] bg-[#e2f6d5] px-3 py-1 rounded-full">
                {result?.compressedTokens || 0} tokens ({result?.tokensSaved || 0} saved)
              </span>
            </div>
            <textarea
              rows={12}
              readOnly
              value={result?.compressedText || ""}
              className="w-full bg-[#e8ebe6] text-[#0e0f0c] rounded-[16px] p-4 text-[14px] font-mono outline-none resize-none font-medium"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-[#e8ebe6]">
            <div className="text-[12px] uppercase tracking-wider text-[#868685] font-bold">
              Applied Compression Rules ({result?.rulesApplied.length || 0})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result?.rulesApplied.length === 0 ? (
                <span className="text-[13px] text-[#868685]">No rules needed (already optimal)</span>
              ) : (
                result?.rulesApplied.map((rule, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-[11px] font-bold bg-[#e2f6d5] text-[#054d28] rounded-full"
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
