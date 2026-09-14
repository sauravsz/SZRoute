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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-negative" />
            RTK + Caveman Token Compression
          </h2>
          <p className="text-[14px] text-ink-body font-medium mt-0.5">
            Strip 15%–95% input tokens without losing semantic instructions
          </p>
        </div>

        {result && (
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-primary/20 text-primary-on text-[13px] font-black flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4" />
              <span>{result.percentSaved}% Saved</span>
            </div>
            <button onClick={copyCompressed} className="btn-primary text-[13px] h-8 px-3">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Output"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Preset Samples */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] text-ink-mute font-bold">Samples:</span>
        {SAMPLE_PROMPTS.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => setInputText(sample.text)}
            className="px-3 py-1 bg-card hover:bg-subtle text-ink font-semibold rounded-full text-[12px] border border-border-subtle transition-colors shadow-xs"
          >
            {sample.title}
          </button>
        ))}
      </div>

      {/* Rules Controls */}
      <div className="wise-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-[13px] font-bold text-ink">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={enableRtk}
              onChange={(e) => setEnableRtk(e.target.checked)}
              className="rounded accent-primary"
            />
            <span>RTK Structural</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={enableCaveman}
              onChange={(e) => setEnableCaveman(e.target.checked)}
              className="rounded accent-primary"
            />
            <span>Caveman NLP</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={compactJson}
              onChange={(e) => setCompactJson(e.target.checked)}
              className="rounded accent-primary"
            />
            <span>Minify JSON</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={stripMarkdown}
              onChange={(e) => setStripMarkdown(e.target.checked)}
              className="rounded accent-primary"
            />
            <span>Spacing</span>
          </label>
        </div>

        <div className="flex items-center gap-1 bg-subtle p-0.5 rounded-full text-[11px] font-bold">
          {(["gentle", "standard", "aggressive"] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`px-2.5 py-0.5 rounded-full capitalize transition-all ${
                level === lvl
                  ? "bg-ink text-card"
                  : "text-ink-body hover:text-ink"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Prompt Diff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original */}
        <div className="wise-card p-4 space-y-2 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-ink">Original Prompt</span>
              <span className="text-[11px] font-mono font-bold text-ink-mute bg-subtle px-2 py-0.5 rounded-full">
                {result?.originalTokens || 0} tokens
              </span>
            </div>
            <textarea
              rows={10}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste prompt..."
              className="w-full bg-subtle text-ink rounded-xl p-3 text-[13px] font-mono outline-none resize-none"
            />
          </div>
          <div className="text-[11px] text-ink-mute font-medium flex items-center justify-between">
            <span>{inputText.length} characters</span>
            <span>Raw context</span>
          </div>
        </div>

        {/* Compressed */}
        <div className="wise-card p-4 space-y-2 flex flex-col justify-between border-2 border-primary">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-positive flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Compressed Output
              </span>
              <span className="text-[11px] font-mono font-bold text-positive bg-primary/20 px-2 py-0.5 rounded-full">
                {result?.compressedTokens || 0} tokens ({result?.tokensSaved || 0} saved)
              </span>
            </div>
            <textarea
              rows={10}
              readOnly
              value={result?.compressedText || ""}
              className="w-full bg-subtle text-ink rounded-xl p-3 text-[13px] font-mono outline-none resize-none font-medium"
            />
          </div>

          <div className="pt-2 border-t border-border-subtle flex flex-wrap gap-1">
            {result?.rulesApplied.map((rule, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-[10px] font-bold bg-primary/20 text-primary-on rounded-full"
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
