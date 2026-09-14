import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { action, payload, token } = await req.json();

    if (action === "ping") {
      return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
    }

    if (action === "encode") {
      // Encode config payload into base64 url-safe sync string
      const str = JSON.stringify(payload);
      const encoded = Buffer.from(str).toString("base64url");
      return NextResponse.json({ success: true, syncToken: encoded });
    }

    if (action === "decode" && token) {
      const decodedStr = Buffer.from(token, "base64url").toString("utf-8");
      const data = JSON.parse(decodedStr);
      return NextResponse.json({ success: true, payload: data });
    }

    return NextResponse.json({ error: "Invalid action. Supported: 'ping', 'encode', 'decode'" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
