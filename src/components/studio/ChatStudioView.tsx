"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Flame,
  RotateCcw,
  User,
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
        "Hello! I am SZRoute AI Gateway. Send a prompt to test multi-provider failover and live RTK token compression.",
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
        content: "Chat cleared. Ready for your next prompt.",
      },
    ]);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Minimal Studio Controls */}
      <div className="wise-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-ink">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-black text-ink">AI Studio</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-subtle px-2.5 py-1 rounded-full text-[12px] font-bold">
            <span className="text-ink-mute">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-card text-ink text-[12px] font-bold rounded-full px-2 py-0.5 outline-none"
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

          <label className="flex items-center gap-1.5 cursor-pointer bg-subtle px-2.5 py-1 rounded-full text-[12px] font-bold text-ink">
            <input
              type="checkbox"
              checked={enableCompress}
              onChange={(e) => setEnableCompress(e.target.checked)}
              className="rounded accent-primary"
            />
            <Flame className="w-3 h-3 text-negative" />
            <span>RTK</span>
          </label>

          <button
            onClick={handleClearChat}
            className="p-1.5 text-ink-mute hover:text-ink bg-subtle hover:bg-subtle-hover rounded-full"
            title="Clear Chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="wise-card min-h-[480px] max-h-[580px] overflow-y-auto p-5 space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
          {messages.map((msg) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-primary flex-shrink-0 flex items-center justify-center font-black text-[10px] text-ink">
                    SZ
                  </div>
                )}

                <div className={`space-y-1 max-w-xl ${isUser ? "items-end" : "items-start"}`}>
                  <div
                    className={`p-3.5 rounded-[18px] text-[14px] leading-relaxed ${
                      isUser
                        ? "bg-ink text-card font-medium"
                        : "bg-subtle text-ink"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content || (isGenerating && "Generating...")}</div>
                  </div>

                  {!isUser && (msg.provider || msg.latencyMs) && (
                    <div className="flex items-center gap-2 text-[11px] font-bold text-ink-mute px-2">
                      {msg.provider && (
                        <span className="badge-positive py-0 text-[10px]">
                          ⚡ {msg.provider}
                        </span>
                      )}
                      {msg.latencyMs && <span>{msg.latencyMs}ms</span>}
                      {msg.tokensSaved ? (
                        <span className="text-positive">🔥 {msg.tokensSaved} tokens saved</span>
                      ) : null}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-subtle flex-shrink-0 flex items-center justify-center font-bold text-ink text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="pt-3 border-t border-border-subtle">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask anything or write code..."
              disabled={isGenerating}
              className="wise-input w-full rounded-full pl-4 pr-24 py-2.5 text-[14px]"
            />
            <button
              type="submit"
              disabled={isGenerating || !inputPrompt.trim()}
              className="absolute right-1.5 btn-primary h-8 px-3 text-[12px] disabled:opacity-40"
            >
              <span>Send</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
