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
          if (blockStarted) {
            controller.enqueue(encoder.encode(`event: content_block_stop\ndata: {"type":"content_block_stop","index":0}\n\n`));
          }
          controller.enqueue(
            encoder.encode(
              `event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"end_turn","stop_sequence":null},"usage":{"output_tokens":0}}\n\n`
            )
          );
          controller.enqueue(encoder.encode(`event: message_stop\ndata: {"type":"message_stop"}\n\n`));
          continue;
        }

        if (trimmed.startsWith("data: ")) {
          try {
            const data = JSON.parse(trimmed.slice(6));

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
      if (blockStarted) {
        controller.enqueue(encoder.encode(`event: content_block_stop\ndata: {"type":"content_block_stop","index":0}\n\n`));
      }
      controller.enqueue(
        encoder.encode(
          `event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"end_turn","stop_sequence":null},"usage":{"output_tokens":0}}\n\n`
        )
      );
      controller.enqueue(encoder.encode(`event: message_stop\ndata: {"type":"message_stop"}\n\n`));
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: Record<string, unknown> = await req.json();

    const model = typeof body.model === "string" ? body.model : "free-auto";
    const rawMessages = Array.isArray(body.messages) ? body.messages : [];
    const system = typeof body.system === "string" ? body.system : "";
    const stream = Boolean(body.stream);
    const maxTokens = typeof body.max_tokens === "number" ? body.max_tokens : 4096;
    const temperature = typeof body.temperature === "number" ? body.temperature : 0.7;

    // Convert Anthropic messages to standard OpenAI format
    const messages: ChatMessage[] = [];
    if (system) {
      messages.push({ role: "system", content: system });
    }

    for (const msg of rawMessages) {
      if (typeof msg === "object" && msg !== null && "role" in msg && "content" in msg) {
        const role = msg.role === "assistant" ? "assistant" : "user";
        let content = msg.content;
        if (Array.isArray(content)) {
          // Handle Anthropic content blocks
          const textBlock = content.find((b) => typeof b === "object" && b !== null && b.type === "text");
          if (textBlock && typeof textBlock.text === "string") {
            content = textBlock.text;
          }
        }
        messages.push({ role, content });
      }
    }

    const gatewayReq: GatewayChatRequest = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream,
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

    let finalContent = "";
    if (
      responseJson &&
      Array.isArray(responseJson.choices) &&
      responseJson.choices.length > 0 &&
      responseJson.choices[0]?.message?.content
    ) {
      finalContent = String(responseJson.choices[0].message.content);
    }

    const anthropicResponse = {
      id: `msg_szroute_${Date.now()}`,
      type: "message",
      role: "assistant",
      model: result.selectedModel,
      content: [
        {
          type: "text",
          text: finalContent,
        },
      ],
      stop_reason: "end_turn",
      stop_sequence: null,
      usage: {
        input_tokens: 0,
        output_tokens: 0,
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
