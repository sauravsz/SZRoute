import { NextRequest, NextResponse } from "next/server";
import { executeGatewayChat, GatewayChatRequest } from "@/lib/gateway/router";

export const runtime = "edge";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, x-szroute-provider, x-szroute-compress, x-szroute-keys",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: GatewayChatRequest = await req.json();

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: { message: "Invalid request: 'messages' array is required and must not be empty." } },
        { status: 400 }
      );
    }

    // Extract custom provider keys from client headers if supplied
    const apiKeyMap: Record<string, string> = {};
    const authHeader = req.headers.get("Authorization") || req.headers.get("x-api-key") || "";
    const customKeysHeader = req.headers.get("x-szroute-keys");
    const compressHeader = req.headers.get("x-szroute-compress");

    if (customKeysHeader) {
      try {
        const parsed = JSON.parse(customKeysHeader);
        if (typeof parsed === "object" && parsed !== null) {
          Object.assign(apiKeyMap, parsed);
        }
      } catch {
        // ignore parse error
      }
    }

    // If client supplied single bearer token, test if it maps directly or can be passed to the requested target
    if (authHeader) {
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : authHeader.trim();
      if (token) {
        apiKeyMap["default"] = token;
      }
    }

    const shouldCompress = compressHeader === "true" || Boolean(body.compress);

    const result = await executeGatewayChat(body, apiKeyMap, {
      compress: shouldCompress,
    });

    const responseHeaders = new Headers({
      "Access-Control-Allow-Origin": "*",
      "x-szroute-provider": result.selectedProvider,
      "x-szroute-model": result.selectedModel,
      "x-szroute-failover-attempts": String(result.failoverAttempts),
      "x-szroute-tokens-saved": String(result.tokensSaved),
      "x-szroute-compression-pct": `${result.percentTokensSaved}%`,
    });

    // If streaming response, return the stream directly
    if (body.stream && result.response.body) {
      responseHeaders.set("Content-Type", "text/event-stream; charset=utf-8");
      responseHeaders.set("Cache-Control", "no-cache, no-transform");
      responseHeaders.set("Connection", "keep-alive");

      return new Response(result.response.body, {
        status: 200,
        headers: responseHeaders,
      });
    }

    // Non-streaming response JSON
    const responseData: unknown = await result.response.json();
    return NextResponse.json(responseData, {
      status: result.response.status,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[SZRoute Chat Error]:", message);
    return NextResponse.json(
      {
        error: {
          message: `SZRoute Gateway routing error: ${message}`,
          type: "szroute_router_error",
          code: 502,
        },
      },
      { status: 502 }
    );
  }
}
