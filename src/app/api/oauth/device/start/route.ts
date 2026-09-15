import { NextRequest, NextResponse } from "next/server";
import { OAUTH_PROVIDERS } from "@/lib/oauth/providers";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { providerId = "github_copilot" } = await req.json().catch(() => ({}));
    const provider = OAUTH_PROVIDERS[providerId];

    if (!provider || provider.type !== "device_code") {
      return NextResponse.json(
        { error: `Provider '${providerId}' does not support device code authorization.` },
        { status: 400 }
      );
    }

    const res = await fetch("https://github.com/login/device/code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: provider.clientId,
        scope: provider.scopes.join(" "),
      }),
    });

    const data = await res.json();

    if (data.device_code && data.user_code) {
      return NextResponse.json({
        success: true,
        deviceCode: data.device_code,
        userCode: data.user_code,
        verificationUri: data.verification_uri || "https://github.com/login/device",
        expiresIn: data.expires_in || 900,
        interval: data.interval || 5,
        provider: providerId,
      });
    }

    return NextResponse.json(
      { error: data.error_description || "Failed to initiate device code flow" },
      { status: 400 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
