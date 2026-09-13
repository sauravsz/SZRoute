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

export async function POST(req: NextRequest) {
  try {
    const body: Record<string, unknown> = await req.json();

    const model = typeof body.model === "string" ? body.model : "claude-3-7-sonnet-20250219";
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
      apiKeyMap["anthropic"] = apiKey.replace(/^Bearer\s+/i, "");
    }

    const result = await executeGatewayChat(gatewayReq, apiKeyMap);

    // If streaming, return the stream with anthropic headers
    if (stream && result.response.body) {
      return new Response(result.response.body, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*",
          "x-szroute-provider": result.selectedProvider,
          "x-szroute-model": result.selectedModel,
        },
      });
    }

    const responseJson: Record<string, unknown> = (await result.response.json()) as Record<string, unknown>;

    // If upstream was OpenAI formatted, translate to Anthropic format if requested by standard client
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
