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

    const authEndpoint = provider.authorizationUrl || "https://github.com/login/device/code";
    const res = await fetch(authEndpoint, {
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

    const deviceCode = data.device_code || data.deviceCode;
    const userCode = data.user_code || data.userCode;
    const verificationUri =
      data.verification_uri_complete ||
      data.verificationUriComplete ||
      data.verification_uri ||
      data.verificationUri ||
      "https://github.com/login/device";
    const expiresIn = data.expires_in || data.expiresIn || 900;
    const interval = data.interval || 5;

    if (deviceCode && userCode) {
      return NextResponse.json({
        success: true,
        deviceCode,
        userCode,
        verificationUri,
        expiresIn,
        interval,
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
