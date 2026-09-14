import { NextRequest, NextResponse } from "next/server";
import { PROVIDER_CATALOG, DEFAULT_COMBOS } from "@/lib/providers/catalog";
import { compressPrompt } from "@/lib/compression/engine";
import { executeGatewayChat } from "@/lib/gateway/router";

export const runtime = "edge";

interface McpRpcRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  try {
    const body: McpRpcRequest = await req.json();
    const { id, method, params } = body;

    // 1. Initialize MCP Handshake
    if (method === "initialize") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
            prompts: { listChanged: false },
          },
          serverInfo: {
            name: "szroute-mcp-server",
            version: "4.0.0",
            description: "SZRoute Edge AI Gateway MCP Server for Oh My Pi (omp) coding agent",
          },
        },
      });
    }

    // 2. List Tools for omp
    if (method === "tools/list") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          tools: [
            {
              name: "szroute_route_chat",
              description:
                "Execute chat completion across 160+ providers with automatic failover and RTK token compression.",
              inputSchema: {
                type: "object",
                properties: {
                  model: {
                    type: "string",
                    description: "Target model or virtual combo (e.g. 'free-auto', 'code-expert', 'llama-3.3-70b-versatile')",
                    default: "free-auto",
                  },
                  prompt: {
                    type: "string",
                    description: "User prompt or instructions to execute",
                  },
                  compress: {
                    type: "boolean",
                    description: "Enable RTK + Caveman token compression",
                    default: true,
                  },
                },
                required: ["prompt"],
              },
            },
            {
              name: "szroute_compress_prompt",
              description: "Minify and compress prompts or code context saving 15%–95% tokens.",
              inputSchema: {
                type: "object",
                properties: {
                  prompt: { type: "string", description: "Prompt or code text to compress" },
                  level: { type: "string", enum: ["gentle", "standard", "aggressive"], default: "standard" },
                },
                required: ["prompt"],
              },
            },
            {
              name: "szroute_discover_models",
              description: "Discover all active free/commercial models and virtual combos.",
              inputSchema: {
                type: "object",
                properties: {
                  category: { type: "string", enum: ["all", "free", "commercial", "local"], default: "all" },
                },
              },
            },
          ],
        },
      });
    }

    // 3. Execute Tools
    if (method === "tools/call") {
      const toolName = typeof params?.name === "string" ? params.name : "";
      const args = (params?.arguments as Record<string, unknown>) || {};

      if (toolName === "szroute_compress_prompt") {
        const text = typeof args.prompt === "string" ? args.prompt : "";
        const level = (args.level as any) || "standard";
        const res = compressPrompt(text, { level });
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(res, null, 2),
              },
            ],
          },
        });
      }

      if (toolName === "szroute_discover_models") {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    combos: DEFAULT_COMBOS.map((c) => ({ id: c.id, name: c.name, targets: c.targets })),
                    providers: PROVIDER_CATALOG.map((p) => ({
                      id: p.id,
                      name: p.name,
                      category: p.category,
                      models: p.models.map((m) => m.id),
                    })),
                  },
                  null,
                  2
                ),
              },
            ],
          },
        });
      }

      if (toolName === "szroute_route_chat") {
        const model = typeof args.model === "string" ? args.model : "free-auto";
        const prompt = typeof args.prompt === "string" ? args.prompt : "";
        const compress = args.compress !== false;

        const result = await executeGatewayChat(
          {
            model,
            messages: [{ role: "user", content: prompt }],
            compress,
          },
          {}
        );

        const responseJson: any = await result.response.json();
        const content = responseJson?.choices?.[0]?.message?.content || "";

        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: content,
              },
            ],
          },
        });
      }

      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Tool '${toolName}' not found` },
      });
    }

    // Default Ping / Version response
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: { status: "ok", server: "szroute-mcp", version: "4.0.0" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32603, message: msg },
      },
      { status: 500 }
    );
  }
}
