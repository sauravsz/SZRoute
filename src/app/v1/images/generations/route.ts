import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { prompt, model = "black-forest-labs/FLUX.1-schnell-Free", n = 1, size = "1024x1024" } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: { message: "Invalid request: 'prompt' is required." } },
        { status: 400 }
      );
    }

    const togetherKey =
      process.env.TOGETHER_API_KEY ||
      req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ||
      "";

    const res = await fetch("https://api.together.xyz/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${togetherKey}`,
      },
      body: JSON.stringify({
        prompt,
        model,
        n,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, {
        headers: { "Access-Control-Allow-Origin": "*", "x-szroute-provider": "together-flux" },
      });
    }

    const errText = await res.text();
    return NextResponse.json(
      { error: { message: `Image generation error (${res.status}): ${errText}` } },
      { status: res.status }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: { message: `SZRoute Image generation error: ${msg}` } }, { status: 500 });
  }
}
