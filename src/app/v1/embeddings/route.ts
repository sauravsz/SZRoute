import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input, model = "togethercomputer/m2-bert-80M-8k-retrieval" } = body;

    if (!input) {
      return NextResponse.json(
        { error: { message: "Invalid request: 'input' parameter is required." } },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.TOGETHER_API_KEY ||
      req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ||
      "";

    const upstreamUrl = "https://api.together.xyz/v1/embeddings";

    const res = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input,
        model,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*", "x-szroute-provider": "together" },
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
