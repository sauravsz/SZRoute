import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const groqKey = process.env.GROQ_API_KEY || req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") || "";

    // Set Groq Whisper Large v3 as default free transcription model
    if (!formData.has("model") || formData.get("model") === "whisper-1") {
      formData.set("model", "whisper-large-v3-turbo");
    }

    const headers: Record<string, string> = {};
    if (groqKey) {
      headers["Authorization"] = `Bearer ${groqKey}`;
    }

    const upstreamUrl = "https://api.groq.com/openai/v1/audio/transcriptions";
    const res = await fetch(upstreamUrl, {
      method: "POST",
      headers,
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*", "x-szroute-provider": "groq-whisper" },
      });
    }

    const errText = await res.text();
    return NextResponse.json(
      { error: { message: `Transcription error (${res.status}): ${errText}` } },
      { status: res.status }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: { message: `SZRoute Audio error: ${msg}` } }, { status: 500 });
  }
}
