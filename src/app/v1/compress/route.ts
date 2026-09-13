import { NextRequest, NextResponse } from "next/server";
import { compressPrompt, compressMessages } from "@/lib/compression/engine";

export const runtime = "edge";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: Record<string, unknown> = await req.json();

    if (typeof body.prompt === "string") {
      const options = (body.options as Record<string, unknown>) || {};
      const result = compressPrompt(body.prompt, options);
      return NextResponse.json(
        {
          success: true,
          type: "single_prompt",
          data: result,
        },
        {
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    if (Array.isArray(body.messages)) {
      const options = (body.options as Record<string, unknown>) || {};
      const result = compressMessages(body.messages, options);
      return NextResponse.json(
        {
          success: true,
          type: "chat_messages",
          data: result,
        },
        {
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    return NextResponse.json(
      { error: "Provide either 'prompt' (string) or 'messages' (array of ChatMessage) to compress." },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
