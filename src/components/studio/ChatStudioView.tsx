"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Flame,
  RotateCcw,
  User,
  Bot,
} from "lucide-react";
import { DEFAULT_COMBOS, PROVIDER_CATALOG, VirtualCombo } from "@/lib/providers/catalog";
import { RequestLogEntry } from "@/lib/store/useSZRouteStore";

interface ChatStudioViewProps {
  apiKeys: Record<string, string>;
  customCombos: VirtualCombo[];
  onLogRequest?: (entry: Omit<RequestLogEntry, "id" | "timestamp">) => void;
}

interface StudioMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  provider?: string;
  model?: string;
  latencyMs?: number;
  tokensSaved?: number;
}

export function ChatStudioView({ apiKeys, customCombos, onLogRequest }: ChatStudioViewProps) {
  const [selectedModel, setSelectedModel] = useState("free-auto");
  const [enableCompress, setEnableCompress] = useState(true);
  const [inputPrompt, setInputPrompt] = useState("");
  const [messages, setMessages] = useState<StudioMessage[]>([
    {
      id: "msg_welcome",
      role: "assistant",
      content:
        "SZRoute Corporate Gateway online. Ready for multi-provider streaming completions and RTK prompt minification.",
      provider: "szroute-edge",
      model: "free-auto",
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const allCombos = [...DEFAULT_COMBOS, ...customCombos];

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputPrompt.trim();
    if (!trimmed || isGenerating) return;

    const userMsgId = `user_${Date.now()}`;
    const userMsg: StudioMessage = {
      id: userMsgId,
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setIsGenerating(true);

    const startTime = Date.now();
    const assistantMsgId = `asst_${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        model: selectedModel,
      },
    ]);

    try {
      const chatMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-szroute-compress": enableCompress ? "true" : "false",
          "x-szroute-keys": JSON.stringify(apiKeys),
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: chatMessages,
          stream: true,
        }),
      });

      const resolvedProvider = res.headers.get("x-szroute-provider") || "groq";
      const resolvedModel = res.headers.get("x-szroute-model") || selectedModel;
      const tokensSaved = parseInt(res.headers.get("x-szroute-tokens-saved") || "0", 10);
      const failoverAttempts = parseInt(res.headers.get("x-szroute-failover-attempts") || "0", 10);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ error: { message: "Unknown error" } }));
        const errMsg = errJson?.error?.message || "Failed to generate completion";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, content: `⚠️ Error: ${errMsg}`, provider: resolvedProvider } : m
          )
        );
        return;
      }

      if (!res.body) throw new Error("No response stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith("data: ") && trimmedLine !== "data: [DONE]") {
            try {
              const data = JSON.parse(trimmedLine.slice(6));
              const delta = data.choices?.[0]?.delta?.content || "";
              if (delta) {
                streamedContent += delta;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: streamedContent,
                          provider: resolvedProvider,
                          model: resolvedModel,
                          tokensSaved,
                        }
                      : m
                  )
                );
              }
            } catch {}
          }
        }
      }

      const totalLatency = Date.now() - startTime;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId ? { ...m, latencyMs: totalLatency, tokensSaved } : m
        )
      );

      if (onLogRequest) {
        onLogRequest({
          model: selectedModel,
          provider: resolvedProvider,
          latencyMs: totalLatency,
          status: 200,
          tokensProcessed: Math.ceil(streamedContent.length / 3.8),
          tokensSaved,
          failoverAttempts,
          promptSnippet: trimmed.slice(0, 80),
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId ? { ...m, content: `⚠️ Connection error: ${msg}` } : m
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: "assistant",
        content: "Chat cleared. Ready for your next completion request.",
      },
    ]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls Bar */}
      <div className="bmw-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[1.5px] text-[#1c69d4] font-bold">
            STREAMING COMPLETIONS
          </div>
          <h2 className="text-xl font-bold text-[#262626] mt-0.5">
            AI Studio Test Arena
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#f7f7f7] border border-[#cccccc] px-3 py-1.5 text-[12px] font-bold">
            <span className="text-[#6b6b6b] uppercase tracking-[0.5px]">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-[#ffffff] text-[#262626] font-bold px-2 py-0.5 outline-none"
            >
              <optgroup label="Virtual Combos">
                {allCombos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Direct Models">
                {PROVIDER_CATALOG.flatMap((p) =>
                  p.models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {p.name}: {m.name}
                    </option>
                  ))
                )}
              </optgroup>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-[#f7f7f7] border border-[#cccccc] px-3 py-1.5 text-[12px] font-bold text-[#262626]">
            <input
              type="checkbox"
              checked={enableCompress}
              onChange={(e) => setEnableCompress(e.target.checked)}
              className="accent-[#1c69d4]"
            />
            <span className="uppercase tracking-[0.5px]">RTK Compression</span>
          </label>

          <button
            onClick={handleClearChat}
            className="btn-secondary h-9 px-3 text-[11px] uppercase tracking-[0.5px]"
            title="Reset Chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="bmw-card min-h-[500px] max-h-[600px] overflow-y-auto p-6 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 border border-[#1c69d4] bg-[#ffffff] flex-shrink-0 flex items-center justify-center font-bold text-[10px] text-[#1c69d4]">
                    SZ
                  </div>
                )}

                <div className={`space-y-1.5 max-w-2xl ${isUser ? "items-end" : "items-start"}`}>
                  <div
                    className={`p-4 text-[14px] leading-relaxed ${
                      isUser
                        ? "bg-[#1a2129] text-[#ffffff] font-light"
                        : "bg-[#f7f7f7] text-[#262626] border border-[#e6e6e6]"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content || (isGenerating && "Streaming response...")}</div>
                  </div>

                  {!isUser && (msg.provider || msg.latencyMs) && (
                    <div className="flex items-center gap-3 text-[11px] font-mono text-[#6b6b6b] px-1">
                      {msg.provider && (
                        <span className="text-[#1c69d4] font-bold">
                          [PROVIDER: {msg.provider}]
                        </span>
                      )}
                      {msg.latencyMs && <span>LATENCY: {msg.latencyMs}ms</span>}
                      {msg.tokensSaved ? (
                        <span className="text-[#22c55e] font-bold">SAVED: {msg.tokensSaved} TOKENS</span>
                      ) : null}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 bg-[#262626] flex-shrink-0 flex items-center justify-center font-bold text-white text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="pt-4 border-t border-[#e6e6e6]">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Send prompt or code to test routing and latency..."
              disabled={isGenerating}
              className="bmw-input w-full pl-4 pr-32 py-3 text-[14px]"
            />
            <button
              type="submit"
              disabled={isGenerating || !inputPrompt.trim()}
              className="absolute right-1.5 btn-primary h-9 px-4 text-[12px] uppercase tracking-[0.5px] disabled:opacity-40"
            >
              <span>SEND</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
