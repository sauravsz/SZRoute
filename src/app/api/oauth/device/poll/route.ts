import { NextRequest, NextResponse } from "next/server";
import { OAUTH_PROVIDERS, OAuthTokenData } from "@/lib/oauth/providers";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { deviceCode, providerId = "github_copilot" } = await req.json();

    if (!deviceCode) {
      return NextResponse.json({ error: "Missing 'deviceCode' in request." }, { status: 400 });
    }

    const provider = OAUTH_PROVIDERS[providerId];
    if (!provider) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    const tokenEndpoint = provider.tokenUrl || "https://github.com/login/oauth/access_token";
    const res = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: provider.clientId,
        device_code: deviceCode,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      }),
    });

    const data = await res.json();

    // 1. Still pending authorization
    if (data.error === "authorization_pending") {
      return NextResponse.json({ status: "pending", message: "Waiting for user authorization..." });
    }

    // 2. Slow down polling
    if (data.error === "slow_down") {
      return NextResponse.json({ status: "slow_down", interval: (data.interval || 5) + 5 });
    }

    // 3. Expired or denied
    if (data.error) {
      return NextResponse.json({ status: "error", error: data.error_description || data.error });
    }

    // 4. Success: User approved and token granted
    const accessToken = data.access_token || data.accessToken;
    if (accessToken) {
      let finalToken = accessToken;
      if (providerId === "github_copilot") {
        // For Copilot, fetch copilot internal session token
        try {
          const copilotRes = await fetch("https://api.github.com/copilot_internal/v2/token", {
            headers: {
              Authorization: `token ${accessToken}`,
              Accept: "application/json",
              "User-Agent": "SZRoute/4.0",
            },
          });
          const copilotJson = await copilotRes.json().catch(() => null);
          if (copilotJson && copilotJson.token) {
            finalToken = copilotJson.token;
          }
        } catch {}
      }

      const refreshToken = data.refresh_token || data.refreshToken;
      const expiresIn = data.expires_in || data.expiresIn;

      const tokenData: OAuthTokenData = {
        accessToken: finalToken,
        refreshToken,
        tokenType: data.token_type || data.tokenType || "Bearer",
        expiresIn,
        expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : undefined,
        scope: data.scope,
        connectedAt: new Date().toISOString(),
        providerId,
      };
      return NextResponse.json({
        status: "success",
        tokenData,
      });
    }

    return NextResponse.json({ status: "pending" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
