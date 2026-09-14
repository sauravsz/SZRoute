"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Zap,
  Flame,
  Clock,
  Layers,
  Bot,
  User,
  RotateCcw,
  Sliders,
  Check,
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

    // Add placeholder assistant message
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

      if (!res.body) {
        throw new Error("No response stream available");
      }

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
            } catch {
              // ignore parse chunk error
            }
          }
        }
      }

      const totalLatency = Date.now() - startTime;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId ? { ...m, latencyMs: totalLatency, tokensSaved } : m
        )
      );

      // Log request for traffic telemetry
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls Bar */}
      <div className="wise-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#9fe870] flex items-center justify-center font-black text-[#0e0f0c]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#0e0f0c] tracking-tight">AI Chat Studio Playground</h2>
            <p className="text-[13px] text-[#454745] font-medium">
              Multi-model streaming test arena for Oh My Pi (omp) virtual combos
            </p>
          </div>
        </div>

        {/* Studio Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Model Switcher */}
          <div className="flex items-center gap-2 bg-[#e8ebe6] p-1.5 rounded-full">
            <span className="text-[12px] font-bold text-[#454745] pl-2">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-[#ffffff] text-[#0e0f0c] text-[13px] font-bold rounded-full px-3 py-1 outline-none border border-[#e8ebe6]"
            >
              <optgroup label="Virtual Combos">
                {allCombos.map((c) => (
                  <option key={c.id} value={c.id}>
                    Combo: {c.name}
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

          {/* RTK Compression Toggle */}
          <label className="flex items-center gap-2 cursor-pointer bg-[#e8ebe6] px-3.5 py-1.5 rounded-full text-[13px] font-bold text-[#0e0f0c]">
            <input
              type="checkbox"
              checked={enableCompress}
              onChange={(e) => setEnableCompress(e.target.checked)}
              className="rounded accent-[#0e0f0c]"
            />
            <Flame className="w-3.5 h-3.5 text-[#d03238]" />
            <span>RTK</span>
          </label>

          {/* Reset Chat */}
          <button
            onClick={handleClearChat}
            className="p-2 text-[#454745] hover:text-[#0e0f0c] bg-[#e8ebe6] hover:bg-[#dbe0d7] rounded-full transition-colors"
            title="Clear Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="wise-card min-h-[480px] max-h-[580px] overflow-y-auto p-6 space-y-5 flex flex-col justify-between">
        <div className="space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#9fe870] flex-shrink-0 flex items-center justify-center font-bold text-xs text-[#0e0f0c]">
                    SZ
                  </div>
                )}

                <div className={`space-y-1.5 max-w-2xl ${isUser ? "items-end" : "items-start"}`}>
                  <div
                    className={`p-4 rounded-[20px] text-[15px] leading-relaxed ${
                      isUser
                        ? "bg-[#0e0f0c] text-white font-medium"
                        : "bg-[#e8ebe6] text-[#0e0f0c] border border-[#e8ebe6]"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content || (isGenerating && "Streaming response...")}</div>
                  </div>

                  {/* Message Telemetry Badge */}
                  {!isUser && (msg.provider || msg.latencyMs) && (
                    <div className="flex items-center gap-2 text-[12px] font-bold text-[#454745] px-2">
                      {msg.provider && (
                        <span className="px-2 py-0.5 bg-[#e2f6d5] text-[#054d28] rounded-full font-mono">
                          ⚡ {msg.provider}
                        </span>
                      )}
                      {msg.latencyMs && (
                        <span>{msg.latencyMs}ms</span>
                      )}
                      {msg.tokensSaved ? (
                        <span className="text-[#2ead4b]">🔥 {msg.tokensSaved} tokens saved</span>
                      ) : null}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#e8ebe6] flex-shrink-0 flex items-center justify-center font-bold text-xs text-[#0e0f0c]">
                    <User className="w-4 h-4 text-[#0e0f0c]" />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="pt-4 border-t border-[#e8ebe6]">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask anything, write code, or test failovers..."
              disabled={isGenerating}
              className="w-full bg-[#e8ebe6] text-[#0e0f0c] placeholder-[#868685] font-medium rounded-full pl-5 pr-28 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#9fe870]"
            />
            <button
              type="submit"
              disabled={isGenerating || !inputPrompt.trim()}
              className="absolute right-2 btn-primary h-9 px-4 text-[13px] flex items-center gap-1.5 disabled:opacity-40"
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
