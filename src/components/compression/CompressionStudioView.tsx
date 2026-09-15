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
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e6e6e6] pb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#262626] tracking-tight">
            RTK + Caveman Token Compression Engine
          </h2>
          <p className="text-[15px] text-[#3c3c3c] font-light mt-1">
            Engineered prompt minification stripping 15%–95% input tokens without semantic degradation.
          </p>
        </div>

        {result && (
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-[#f7f7f7] border border-[#cccccc] text-[#262626] text-[13px] font-bold uppercase tracking-[0.5px]">
              {result.percentSaved}% TOKENS SAVED
            </div>
            <button onClick={copyCompressed} className="btn-primary text-[12px] h-10 px-5 uppercase tracking-[0.5px]">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "COPIED" : "COPY OUTPUT"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Preset Samples */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] text-[#6b6b6b] uppercase font-bold tracking-[1px]">Sample Prompts:</span>
        {SAMPLE_PROMPTS.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => setInputText(sample.text)}
            className="px-3 py-1.5 bg-[#f7f7f7] hover:bg-[#ebebeb] text-[#262626] font-bold text-[12px] border border-[#cccccc] transition-colors"
          >
            {sample.title}
          </button>
        ))}
      </div>

      {/* Rules Controls */}
      <div className="bmw-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-[13px] font-bold text-[#262626]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enableRtk}
              onChange={(e) => setEnableRtk(e.target.checked)}
              className="accent-[#1c69d4]"
            />
            <span className="uppercase tracking-[0.5px]">RTK Structural Purge</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enableCaveman}
              onChange={(e) => setEnableCaveman(e.target.checked)}
              className="accent-[#1c69d4]"
            />
            <span className="uppercase tracking-[0.5px]">Caveman NLP Minification</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={compactJson}
              onChange={(e) => setCompactJson(e.target.checked)}
              className="accent-[#1c69d4]"
            />
            <span className="uppercase tracking-[0.5px]">Compact JSON Payloads</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={stripMarkdown}
              onChange={(e) => setStripMarkdown(e.target.checked)}
              className="accent-[#1c69d4]"
            />
            <span className="uppercase tracking-[0.5px]">Normalize Spacing</span>
          </label>
        </div>

        <div className="flex items-center gap-1 bg-[#f7f7f7] border border-[#cccccc] p-1 text-[11px] font-bold">
          {(["gentle", "standard", "aggressive"] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`px-3 py-1 uppercase tracking-[0.5px] transition-all ${
                level === lvl
                  ? "bg-[#1c69d4] text-[#ffffff]"
                  : "text-[#6b6b6b] hover:text-[#262626]"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Prompt Diff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original */}
        <div className="bmw-card space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-[#e6e6e6] pb-2">
              <span className="text-[13px] font-bold uppercase tracking-[1px] text-[#262626]">
                Original Input Context
              </span>
              <span className="text-[12px] font-mono font-bold text-[#6b6b6b] bg-[#f7f7f7] px-2 py-0.5 border border-[#e6e6e6]">
                {result?.originalTokens || 0} TOKENS
              </span>
            </div>
            <textarea
              rows={11}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste prompt context..."
              className="w-full bg-[#fafafa] text-[#262626] border border-[#cccccc] p-3 text-[13px] font-mono outline-none resize-none"
            />
          </div>
          <div className="text-[12px] text-[#6b6b6b] font-light flex items-center justify-between pt-1">
            <span>{inputText.length} characters</span>
            <span>Raw context</span>
          </div>
        </div>

        {/* Compressed */}
        <div className="bmw-card space-y-3 flex flex-col justify-between border-2 border-[#1c69d4]">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-[#e6e6e6] pb-2">
              <span className="text-[13px] font-bold uppercase tracking-[1px] text-[#1c69d4] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Compressed Output (Dispatched to Model)
              </span>
              <span className="text-[12px] font-mono font-bold text-[#1c69d4] bg-[#f7f7f7] px-2 py-0.5 border border-[#1c69d4]">
                {result?.compressedTokens || 0} TOKENS ({result?.tokensSaved || 0} SAVED)
              </span>
            </div>
            <textarea
              rows={11}
              readOnly
              value={result?.compressedText || ""}
              className="w-full bg-[#f7f7f7] text-[#262626] border border-[#cccccc] p-3 text-[13px] font-mono outline-none resize-none font-medium"
            />
          </div>

          <div className="pt-2 border-t border-[#e6e6e6] flex flex-wrap gap-1.5">
            {result?.rulesApplied.map((rule, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.5px] bg-[#fafafa] border border-[#e6e6e6] text-[#1c69d4]"
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
