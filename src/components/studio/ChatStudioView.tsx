"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Zap,
  Flame,
  Clock,
  RotateCcw,
  Copy,
  Check,
  Layers,
  ChevronDown,
} from "lucide-react";
import { DEFAULT_COMBOS, PROVIDER_CATALOG, VirtualCombo } from "@/lib/providers/catalog";
import { ChatMessage } from "@/lib/compression/engine";

interface ChatStudioViewProps {
  apiKeys: Record<string, string>;
  customCombos: VirtualCombo[];
  onLogRequest?: (entry: {
    model: string;
    provider: string;
    latencyMs: number;
    status: number;
    tokensProcessed: number;
    tokensSaved: number;
    failoverAttempts: number;
    promptSnippet: string;
  }) => void;
}

export function ChatStudioView({ apiKeys, customCombos, onLogRequest }: ChatStudioViewProps) {
  const [selectedModel, setSelectedModel] = useState<string>("free-auto");
  const [enableCompression, setEnableCompression] = useState<boolean>(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I am connected through SZRoute. Choose any model (or virtual combo like `free-auto` / `code-expert`), and I'll route your request seamlessly across 160+ providers with RTK token compression.",
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponseTelemetry, setCurrentResponseTelemetry] = useState<{
    provider?: string;
    model?: string;
    latencyMs?: number;
    tokensSaved?: number;
    compressionPct?: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const allAvailableModels = [
    ...DEFAULT_COMBOS.map((c) => ({
      id: c.id,
      name: `Combo: ${c.name}`,
      isCombo: true,
      category: "Combos",
    })),
    ...customCombos
      .filter((c) => !DEFAULT_COMBOS.some((d) => d.id === c.id))
      .map((c) => ({
        id: c.id,
        name: `Custom: ${c.name}`,
        isCombo: true,
        category: "Custom Combos",
      })),
    ...PROVIDER_CATALOG.flatMap((p) =>
      p.models.map((m) => ({
        id: m.id,
        name: `${m.name} (${p.name})`,
        isCombo: false,
        category: p.name,
      }))
    ),
  ];

  const handleSendMessage = async () => {
    if (!inputPrompt.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: inputPrompt.trim() };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputPrompt("");
    setIsLoading(true);
    setCurrentResponseTelemetry(null);

    const startTime = Date.now();

    try {
      const res = await fetch("/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-szroute-keys": JSON.stringify(apiKeys),
          "x-szroute-compress": enableCompression ? "true" : "false",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: newHistory,
          compress: enableCompression,
          stream: true,
        }),
      });

      const providerHeader = res.headers.get("x-szroute-provider") || "auto";
      const modelHeader = res.headers.get("x-szroute-model") || selectedModel;
      const tokensSavedHeader = parseInt(res.headers.get("x-szroute-tokens-saved") || "0", 10);
      const compressionPctHeader = res.headers.get("x-szroute-compression-pct") || "0%";
      const failoverAttempts = parseInt(res.headers.get("x-szroute-failover-attempts") || "0", 10);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `Gateway returned HTTP ${res.status}`);
      }

      // Stream handling
      let assistantResponse = "";
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
              try {
                const data = JSON.parse(trimmed.slice(6));
                const delta = data.choices?.[0]?.delta?.content || "";
                if (delta) {
                  assistantResponse += delta;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: "assistant",
                      content: assistantResponse,
                    };
                    return updated;
                  });
                }
              } catch {}
            }
          }
        }
      }

      const latencyMs = Date.now() - startTime;
      setCurrentResponseTelemetry({
        provider: providerHeader,
        model: modelHeader,
        latencyMs,
        tokensSaved: tokensSavedHeader,
        compressionPct: compressionPctHeader,
      });

      if (onLogRequest) {
        onLogRequest({
          model: selectedModel,
          provider: providerHeader,
          latencyMs,
          status: 200,
          tokensProcessed: Math.round(assistantResponse.length / 4) + Math.round(userMessage.content.length / 4),
          tokensSaved: tokensSavedHeader,
          failoverAttempts,
          promptSnippet: String(userMessage.content).slice(0, 80),
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const latencyMs = Date.now() - startTime;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Error from SZRoute Gateway: ${message}`,
        },
      ]);

      if (onLogRequest) {
        onLogRequest({
          model: selectedModel,
          provider: "error",
          latencyMs,
          status: 502,
          tokensProcessed: 0,
          tokensSaved: 0,
          failoverAttempts: 1,
          promptSnippet: String(userMessage.content).slice(0, 80),
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared. Ask anything or test multi-provider fallbacks!",
      },
    ]);
    setCurrentResponseTelemetry(null);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4 animate-in fade-in duration-200">
      {/* Top Studio Control Bar */}
      <div className="raycast-card p-3 flex flex-wrap items-center justify-between gap-3 bg-[#0d0d0d]">
        <div className="flex items-center gap-3">
          {/* Model Switcher Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#9c9c9d] font-medium hidden sm:inline">Active Model:</span>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-[#101111] text-white border border-[#242728] rounded-lg px-3 py-1.5 text-[13px] font-medium outline-none cursor-pointer focus:border-[#434345]"
              >
                {allAvailableModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* RTK Compression Toggle */}
          <button
            onClick={() => setEnableCompression(!enableCompression)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border flex items-center gap-1.5 transition-colors ${
              enableCompression
                ? "bg-[#ff6161]/10 text-[#ff6161] border-[#ff6161]/25"
                : "bg-[#101111] text-[#6a6b6c] border-[#242728]"
            }`}
            title="Toggle RTK+Caveman token compression to save 15-95% tokens"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>RTK Compression {enableCompression ? "ON" : "OFF"}</span>
          </button>
        </div>

        {/* Right Actions: Telemetry & Reset */}
        <div className="flex items-center gap-3 text-[12px]">
          {currentResponseTelemetry && (
            <div className="hidden md:flex items-center gap-2 text-[#9c9c9d]">
              <span className="flex items-center gap-1 text-[#59d499]">
                <Zap className="w-3 h-3" /> {currentResponseTelemetry.provider}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {currentResponseTelemetry.latencyMs}ms
              </span>
              {currentResponseTelemetry.tokensSaved ? (
                <>
                  <span>•</span>
                  <span className="text-[#ff6161] font-medium">
                    Saved {currentResponseTelemetry.tokensSaved} tok ({currentResponseTelemetry.compressionPct})
                  </span>
                </>
              ) : null}
            </div>
          )}

          <button
            onClick={handleClearChat}
            className="p-1.5 text-[#9c9c9d] hover:text-white rounded hover:bg-[#101111]"
            title="Reset Conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-xl border border-[#242728] bg-[#07080a]">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={index}
              className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-[#121212] border border-[#242728] flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-[#ff6161]" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-xl p-4 text-[14px] leading-relaxed ${
                  isUser
                    ? "bg-[#101111] text-white border border-[#242728]"
                    : "bg-[#0d0d0d] text-[#cdcdcd] border border-[#242728]"
                }`}
              >
                <div className="whitespace-pre-wrap">{String(msg.content)}</div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-[#101111] border border-[#242728] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[#57c1ff]" />
                </div>
              )}
            </div>
          );
        })}
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#121212] border border-[#242728] flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-[#ff6161] animate-spin" />
            </div>
            <div className="bg-[#0d0d0d] border border-[#242728] rounded-xl px-4 py-3 text-[13px] text-[#9c9c9d] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#59d499] animate-pulse" />
              Streaming response via SZRoute Edge...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="raycast-card p-3 bg-[#0d0d0d] flex items-center gap-3">
        <textarea
          rows={1}
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={`Message ${selectedModel}... (Press Enter to send)`}
          className="flex-1 bg-transparent text-white placeholder-[#6a6b6c] text-[14px] outline-none resize-none px-2 py-1 max-h-32"
        />

        <button
          onClick={handleSendMessage}
          disabled={!inputPrompt.trim() || isLoading}
          className="btn-primary h-9 px-4 flex items-center gap-1.5 disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
}
