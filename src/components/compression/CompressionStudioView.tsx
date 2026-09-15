"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  TrendingDown,
  Sparkles,
  Copy,
  Check,
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
    title: "System Prompt Formatting",
    text: `You are an elite software architect for Oh My Pi (omp).



Please note that you must always write modular code.
In order to guarantee optimal performance, kindly adhere to clean architecture principles.
For the purpose of maintaining strict consistency, please format all outputs in pure Markdown.`,
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
    <div className="space-y-6 animate-spring-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--label-primary)] tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF3B30]/15 text-[#FF3B30] flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <span>RTK + Caveman Token Compression</span>
          </h2>
          <p className="text-[14px] text-[var(--label-secondary)] mt-0.5">
            Strip 15%–95% input tokens without losing semantic instructions.
          </p>
        </div>

        {result && (
          <div className="flex items-center gap-2.5">
            <div className="badge-apple-green text-[13px] py-1 font-bold">
              <TrendingDown className="w-4 h-4" />
              <span>{result.percentSaved}% Saved</span>
            </div>
            <button onClick={copyCompressed} className="btn-apple-primary text-[12px] h-9 px-4">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied" : "Copy Output"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Preset Samples */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] text-[var(--label-secondary)] font-semibold">Samples:</span>
        {SAMPLE_PROMPTS.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => setInputText(sample.text)}
            className="px-3.5 py-1 bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] text-[var(--label-primary)] font-medium text-[12px] rounded-full border border-[var(--separator)] active:scale-95 transition-all shadow-2xs"
          >
            {sample.title}
          </button>
        ))}
      </div>

      {/* Rules Controls */}
      <div className="apple-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-[13px] font-semibold text-[var(--label-primary)]">
          <label className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
            <input
              type="checkbox"
              checked={enableRtk}
              onChange={(e) => setEnableRtk(e.target.checked)}
              className="rounded accent-[var(--system-blue)]"
            />
            <span>RTK Structural Purge</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
            <input
              type="checkbox"
              checked={enableCaveman}
              onChange={(e) => setEnableCaveman(e.target.checked)}
              className="rounded accent-[var(--system-blue)]"
            />
            <span>Caveman NLP</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
            <input
              type="checkbox"
              checked={compactJson}
              onChange={(e) => setCompactJson(e.target.checked)}
              className="rounded accent-[var(--system-blue)]"
            />
            <span>Compact JSON</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
            <input
              type="checkbox"
              checked={stripMarkdown}
              onChange={(e) => setStripMarkdown(e.target.checked)}
              className="rounded accent-[var(--system-blue)]"
            />
            <span>Normalize Spacing</span>
          </label>
        </div>

        <div className="flex items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-2xl text-[12px] font-semibold">
          {(["gentle", "standard", "aggressive"] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`px-3 py-1 rounded-xl capitalize transition-all cursor-pointer ${
                level === lvl
                  ? "bg-[var(--bg-card)] text-[var(--label-primary)] shadow-2xs font-bold"
                  : "text-[var(--label-secondary)] hover:text-[var(--label-primary)]"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Prompt Diff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Original */}
        <div className="apple-card p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-[var(--label-primary)]">
                Original Prompt
              </span>
              <span className="text-[12px] font-mono font-bold text-[var(--label-secondary)] bg-[var(--bg-subtle)] px-2.5 py-0.5 rounded-full">
                {result?.originalTokens || 0} tokens
              </span>
            </div>
            <textarea
              rows={11}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste prompt context..."
              className="w-full bg-[var(--bg-subtle)] text-[var(--label-primary)] rounded-2xl p-3.5 text-[13px] font-mono outline-none resize-none"
            />
          </div>
          <div className="text-[12px] text-[var(--label-secondary)] flex items-center justify-between">
            <span>{inputText.length} characters</span>
            <span>Raw context</span>
          </div>
        </div>

        {/* Compressed */}
        <div className="apple-card p-5 space-y-3 flex flex-col justify-between border-2 border-[var(--system-blue)]">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-[var(--system-blue)] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Compressed Output (Dispatched)
              </span>
              <span className="badge-apple-green text-[12px] font-bold">
                {result?.compressedTokens || 0} tokens ({result?.tokensSaved || 0} saved)
              </span>
            </div>
            <textarea
              rows={11}
              readOnly
              value={result?.compressedText || ""}
              className="w-full bg-[var(--bg-subtle)] text-[var(--label-primary)] rounded-2xl p-3.5 text-[13px] font-mono outline-none resize-none font-medium"
            />
          </div>

          <div className="pt-2 border-t border-[var(--separator)] flex flex-wrap gap-1.5">
            {result?.rulesApplied.map((rule, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 text-[11px] font-semibold bg-[var(--system-blue)]/10 text-[var(--system-blue)] rounded-full"
              >
                ✓ {rule}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
