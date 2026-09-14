import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input, model = "text-embedding-3-small" } = body;

    if (!input) {
      return NextResponse.json(
        { error: { message: "Invalid request: 'input' parameter is required." } },
        { status: 400 }
      );
    }

    // Default to Together AI / OpenAI / Cloudflare embeddings
    const apiKey =
      process.env.OPENAI_API_KEY ||
      process.env.TOGETHER_API_KEY ||
      req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ||
      "";

    const isTogether = Boolean(process.env.TOGETHER_API_KEY && !process.env.OPENAI_API_KEY);
    const upstreamUrl = isTogether
      ? "https://api.together.xyz/v1/embeddings"
      : "https://api.openai.com/v1/embeddings";

    const upstreamModel = isTogether ? "togethercomputer/m2-bert-80M-8k-retrieval" : model;

    const res = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input,
        model: upstreamModel,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*", "x-szroute-provider": isTogether ? "together" : "openai" },
      });
    }

    const errText = await res.text();
    return NextResponse.json(
      { error: { message: `Embedding upstream error (${res.status}): ${errText}` } },
      { status: res.status }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: { message: `SZRoute Embeddings error: ${msg}` } }, { status: 500 });
  }
}
