import { NextRequest, NextResponse } from "next/server";
import { executeGatewayChat, GatewayChatRequest } from "@/lib/gateway/router";
import { ChatMessage } from "@/lib/compression/engine";

export const runtime = "edge";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, anthropic-version, x-szroute-keys, x-szroute-compress",
    },
  });
}

/**
 * Transforms an upstream OpenAI SSE stream into standard Anthropic SSE events
 */
function createOpenAIToAnthropicTransformStream(modelName: string): TransformStream<Uint8Array, Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";
  let messageStarted = false;
  let blockStarted = false;
  let messageStopped = false;
  let lastStopReason = "end_turn";
  let accumulatedOutputTokens = 0;
  const messageId = `msg_szroute_${Date.now()}`;

  return new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(":")) continue;

        if (trimmed === "data: [DONE]") {
          if (!messageStopped) {
            messageStopped = true;
            if (blockStarted) {
              controller.enqueue(encoder.encode(`event: content_block_stop\ndata: {"type":"content_block_stop","index":0}\n\n`));
            }
            controller.enqueue(
              encoder.encode(
                `event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"${lastStopReason}","stop_sequence":null},"usage":{"output_tokens":${accumulatedOutputTokens}}}\n\n`
              )
            );
            controller.enqueue(encoder.encode(`event: message_stop\ndata: {"type":"message_stop"}\n\n`));
          }
          continue;
        }
        if (trimmed.startsWith("data: ")) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.usage?.completion_tokens) {
              accumulatedOutputTokens = Number(data.usage.completion_tokens);
            }
            if (data.choices?.[0]?.finish_reason === "length") {
              lastStopReason = "max_tokens";
            } else if (data.choices?.[0]?.finish_reason === "tool_calls") {
              lastStopReason = "tool_use";
            }
            // 1. Emit message_start if not emitted yet
            if (!messageStarted) {
              messageStarted = true;
              const startPayload = {
                type: "message_start",
                message: {
                  id: messageId,
                  type: "message",
                  role: "assistant",
                  model: modelName,
                  content: [],
                  stop_reason: null,
                  stop_sequence: null,
                  usage: { input_tokens: 0, output_tokens: 0 },
                },
              };
              controller.enqueue(encoder.encode(`event: message_start\ndata: ${JSON.stringify(startPayload)}\n\n`));
            }

            // 2. Emit content_block_start before first delta
            if (!blockStarted) {
              blockStarted = true;
              const blockStartPayload = {
                type: "content_block_start",
                index: 0,
                content_block: { type: "text", text: "" },
              };
              controller.enqueue(encoder.encode(`event: content_block_start\ndata: ${JSON.stringify(blockStartPayload)}\n\n`));
            }

            // 3. Extract text delta
            const deltaText = data.choices?.[0]?.delta?.content || "";
            if (deltaText) {
              const deltaPayload = {
                type: "content_block_delta",
                index: 0,
                delta: { type: "text_delta", text: deltaText },
              };
              controller.enqueue(encoder.encode(`event: content_block_delta\ndata: ${JSON.stringify(deltaPayload)}\n\n`));
            }
          } catch {
            // If raw non-JSON chunk, pass through
          }
        }
      }
    },
    flush(controller) {
      if (!messageStopped) {
        messageStopped = true;
        if (blockStarted) {
          controller.enqueue(encoder.encode(`event: content_block_stop\ndata: {"type":"content_block_stop","index":0}\n\n`));
        }
        controller.enqueue(
          encoder.encode(
            `event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"${lastStopReason}","stop_sequence":null},"usage":{"output_tokens":${accumulatedOutputTokens}}}\n\n`
          )
        );
        controller.enqueue(encoder.encode(`event: message_stop\ndata: {"type":"message_stop"}\n\n`));
      }
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: Record<string, unknown> = await req.json();

    const model = typeof body.model === "string" ? body.model : "free-auto";
    const rawMessages = Array.isArray(body.messages) ? body.messages : [];
    let systemText = "";
    if (typeof body.system === "string") {
      systemText = body.system;
    } else if (Array.isArray(body.system)) {
      systemText = body.system
        .map((b) => (typeof b === "object" && b !== null && "text" in b ? String(b.text) : ""))
        .filter(Boolean)
        .join("\n\n");
    }
    const stream = Boolean(body.stream);
    const maxTokens = typeof body.max_tokens === "number" ? body.max_tokens : 4096;
    const temperature = typeof body.temperature === "number" ? body.temperature : 0.7;

    // Convert Anthropic messages to standard OpenAI format
    const messages: ChatMessage[] = [];
    if (systemText) {
      messages.push({ role: "system", content: systemText });
    }

    for (const msg of rawMessages) {
      if (typeof msg === "object" && msg !== null && "role" in msg && "content" in msg) {
        const role = msg.role === "assistant" ? "assistant" : "user";
        const content = msg.content;

        if (Array.isArray(content)) {
          const toolUseBlocks = content.filter((b) => typeof b === "object" && b !== null && b.type === "tool_use");
          const toolCalls =
            toolUseBlocks.length > 0
              ? toolUseBlocks.map((tu) => ({
                  id: String(tu.id ?? ""),
                  type: "function",
                  function: {
                    name: String(tu.name ?? ""),
                    arguments: JSON.stringify(tu.input ?? {}),
                  },
                }))
              : undefined;

          const toolResultBlocks = content.filter((b) => typeof b === "object" && b !== null && b.type === "tool_result");
          if (toolResultBlocks.length > 0) {
            for (const tr of toolResultBlocks) {
              const resultText =
                typeof tr.content === "string"
                  ? tr.content
                  : Array.isArray(tr.content)
                  ? tr.content.map((c: any) => (c && typeof c === "object" && "text" in c ? String(c.text) : "")).join("")
                  : JSON.stringify(tr.content ?? "");
              messages.push({
                role: "tool",
                tool_call_id: String(tr.tool_use_id ?? ""),
                content: resultText,
              });
            }
          }

          const textBlocks = content.filter((b) => typeof b === "object" && b !== null && b.type === "text");
          const combinedText = textBlocks.map((b) => String(b.text ?? "")).filter(Boolean).join("\n");

          const imageBlocks = content.filter((b) => typeof b === "object" && b !== null && b.type === "image");
          if (imageBlocks.length > 0) {
            const multimodalParts: unknown[] = [];
            if (combinedText) {
              multimodalParts.push({ type: "text", text: combinedText });
            }
            for (const img of imageBlocks) {
              if (img.source && img.source.data) {
                multimodalParts.push({
                  type: "image_url",
                  image_url: {
                    url: `data:${img.source.media_type || "image/png"};base64,${img.source.data}`,
                  },
                });
              }
            }
            messages.push({
              role,
              content: multimodalParts as any,
              ...(toolCalls ? { tool_calls: toolCalls } : {}),
            });
            continue;
          }

          if (combinedText || toolCalls) {
            messages.push({
              role,
              content: combinedText,
              ...(toolCalls ? { tool_calls: toolCalls } : {}),
            });
            continue;
          }
        } else {
          messages.push({ role, content: typeof content === "string" ? content : String(content ?? "") });
        }
      }
    }

    const gatewayReq: GatewayChatRequest = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream,
      ...(body.tools ? { tools: body.tools as unknown[] } : {}),
      ...(body.tool_choice ? { tool_choice: body.tool_choice } : {}),
    };

    const apiKeyMap: Record<string, string> = {};
    const apiKey = req.headers.get("x-api-key") || req.headers.get("Authorization") || "";
    if (apiKey) {
      const cleanKey = apiKey.replace(/^Bearer\s+/i, "").trim();
      apiKeyMap["anthropic"] = cleanKey;
      apiKeyMap["default"] = cleanKey;
    }

    const customKeysHeader = req.headers.get("x-szroute-keys");
    if (customKeysHeader) {
      try {
        const parsed = JSON.parse(customKeysHeader);
        if (typeof parsed === "object" && parsed !== null) {
          Object.assign(apiKeyMap, parsed);
        }
      } catch {}
    }

    const result = await executeGatewayChat(gatewayReq, apiKeyMap);

    // If streaming, transform OpenAI SSE chunks to Anthropic SSE events
    if (stream && result.response.body) {
      const transformedStream = result.response.body.pipeThrough(
        createOpenAIToAnthropicTransformStream(result.selectedModel)
      );

      return new Response(transformedStream, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*",
          "x-szroute-provider": result.selectedProvider,
          "x-szroute-model": result.selectedModel,
          "x-szroute-failover-attempts": String(result.failoverAttempts),
        },
      });
    }

    const responseJson: Record<string, unknown> = (await result.response.json()) as Record<string, unknown>;

    const firstChoice = Array.isArray(responseJson?.choices) ? responseJson.choices[0] : undefined;
    const choiceMessage = firstChoice?.message as Record<string, unknown> | undefined;
    const textContent = choiceMessage?.content ? String(choiceMessage.content) : "";

    const contentBlocks: unknown[] = [];
    if (textContent) {
      contentBlocks.push({ type: "text", text: textContent });
    }

    const toolCalls = Array.isArray(choiceMessage?.tool_calls) ? choiceMessage.tool_calls : [];
    for (const tc of toolCalls) {
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(tc.function?.arguments || "{}");
      } catch {}
      contentBlocks.push({
        type: "tool_use",
        id: tc.id,
        name: tc.function?.name,
        input: parsedArgs,
      });
    }

    const finishReason = firstChoice?.finish_reason;
    const stopReason =
      toolCalls.length > 0 || finishReason === "tool_calls"
        ? "tool_use"
        : finishReason === "length"
        ? "max_tokens"
        : "end_turn";

    const usage = (responseJson?.usage as Record<string, number> | undefined) || {};
    const inputTokens = usage.prompt_tokens ?? 0;
    const outputTokens = usage.completion_tokens ?? 0;

    const anthropicResponse = {
      id: `msg_szroute_${Date.now()}`,
      type: "message",
      role: "assistant",
      model: result.selectedModel,
      content: contentBlocks.length > 0 ? contentBlocks : [{ type: "text", text: "" }],
      stop_reason: stopReason,
      stop_sequence: null,
      usage: {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
      },
    };

    return NextResponse.json(anthropicResponse, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "x-szroute-provider": result.selectedProvider,
        "x-szroute-model": result.selectedModel,
        "x-szroute-failover-attempts": String(result.failoverAttempts),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        type: "error",
        error: {
          type: "invalid_request_error",
          message: `SZRoute Anthropic Messages routing error: ${message}`,
        },
      },
      { status: 502 }
    );
  }
}
