"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Flame,
  RotateCcw,
  User,
  Zap,
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
        "SZRoute Liquid AI Studio initialized. Send a prompt to test multi-tier auto-failover, tool calling, and live RTK token compression.",
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
        const errText = await res.text().catch(() => "");
        const totalLatency = Date.now() - startTime;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: `⚠️ Gateway error ${res.status}: ${errText.slice(0, 160)}`, latencyMs: totalLatency }
              : m
          )
        );
        if (onLogRequest) {
          onLogRequest({
            model: selectedModel,
            provider: resolvedProvider,
            latencyMs: totalLatency,
            status: res.status,
            tokensProcessed: 0,
            tokensSaved: 0,
            failoverAttempts,
            promptSnippet: trimmed.slice(0, 80),
          });
        }
        return;
      }

      if (!res.body) throw new Error("No response stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = "";
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

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

      if (buffer.trim().startsWith("data: ") && buffer.trim() !== "data: [DONE]") {
        try {
          const data = JSON.parse(buffer.trim().slice(6));
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
      const totalLatency = Date.now() - startTime;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId ? { ...m, content: `⚠️ Connection error: ${msg}`, latencyMs: totalLatency } : m
        )
      );
      if (onLogRequest) {
        onLogRequest({
          model: selectedModel,
          provider: "unknown",
          latencyMs: totalLatency,
          status: 500,
          tokensProcessed: 0,
          tokensSaved: 0,
          failoverAttempts: 0,
          promptSnippet: trimmed.slice(0, 80),
        });
      }
      setIsGenerating(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: "assistant",
        content: "Chat arena reset. Ready for your next prompt.",
      },
    ]);
  };

  return (
    <div className="space-y-4 animate-spring-slide-up">
      {/* Studio Header & Controls Bar in Liquid Glass */}
      <div className="liquid-glass p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#AF52DE] to-[#5856D6] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[var(--text-primary)]">AI Chat Studio</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-[var(--glass-surface-subtle)] border border-[var(--glass-border-subtle)] px-3 py-1 rounded-2xl text-[12px] font-semibold">
            <span className="text-[var(--text-secondary)]">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-[var(--glass-surface)] text-[var(--text-primary)] text-[12px] font-semibold rounded-xl px-2.5 py-0.5 outline-none border border-[var(--glass-border)] shadow-2xs"
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

          <label className="flex items-center gap-1.5 cursor-pointer bg-[var(--glass-surface-subtle)] border border-[var(--glass-border-subtle)] px-3 py-1 rounded-2xl text-[12px] font-semibold text-[var(--text-primary)] active:scale-95 transition-transform">
            <input
              type="checkbox"
              checked={enableCompress}
              onChange={(e) => setEnableCompress(e.target.checked)}
              className="rounded accent-[#007AFF]"
            />
            <Flame className="w-3.5 h-3.5 text-[#FF3B30]" />
            <span>RTK</span>
          </label>

          <button
            onClick={handleClearChat}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--glass-surface-subtle)] hover:bg-[var(--glass-surface-elevated)] border border-[var(--glass-border-subtle)] active:scale-90 transition-all text-[var(--text-secondary)] shadow-xs"
            title="Clear Chat Arena"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Thread Container in Liquid Glass */}
      <div className="liquid-glass min-h-[500px] max-h-[600px] overflow-y-auto p-6 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-[#007AFF] via-[#5856D6] to-[#AF52DE] flex-shrink-0 flex items-center justify-center font-bold text-xs text-white shadow-xs">
                    SZ
                  </div>
                )}

                <div className={`space-y-1 max-w-2xl ${isUser ? "items-end" : "items-start"}`}>
                  <div
                    className={`p-4 rounded-3xl text-[14px] leading-relaxed shadow-xs border ${
                      isUser
                        ? "bg-gradient-to-r from-[#007AFF] to-[#5856D6] text-white font-medium rounded-br-md border-white/20"
                        : "bg-[var(--glass-surface-subtle)] text-[var(--text-primary)] rounded-bl-md border-[var(--glass-border-subtle)]"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content || (isGenerating && "Generating completion stream...")}</div>
                  </div>

                  {!isUser && (msg.provider || msg.latencyMs) && (
                    <div className="flex items-center gap-2.5 text-[11px] text-[var(--text-secondary)] px-1">
                      {msg.provider && (
                        <span className="badge-liquid-blue py-0 text-[10px]">
                          ⚡ {msg.provider} / {msg.model}
                        </span>
                      )}
                      {msg.latencyMs && <span>{msg.latencyMs}ms</span>}
                      {msg.tokensSaved ? (
                        <span className="text-[#34C759] font-bold">✓ {msg.tokensSaved} tokens compressed</span>
                      ) : null}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-2xl bg-[var(--glass-surface-subtle)] border border-[var(--glass-border)] text-[var(--text-primary)] flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Liquid Input Bar */}
        <form onSubmit={handleSendMessage} className="pt-3 border-t border-[var(--glass-border-subtle)]">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Send prompt or code instructions..."
              disabled={isGenerating}
              className="liquid-input w-full pr-24 py-3 text-[14px] rounded-full shadow-xs"
            />
            <button
              type="submit"
              disabled={isGenerating || !inputPrompt.trim()}
              className="absolute right-1.5 btn-liquid-primary h-9 px-4 text-[13px] disabled:opacity-40"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
