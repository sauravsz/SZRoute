import { NextRequest, NextResponse } from "next/server";
import { OAUTH_PROVIDERS, OAuthTokenData } from "@/lib/oauth/providers";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const stateRaw = searchParams.get("state");
    const origin = req.nextUrl.origin || "https://szroute.vercel.app";
    const redirectUri = `${origin}/api/oauth/callback`;

    if (!code) {
      const errorDescription = searchParams.get("error_description") || "OAuth authorization was cancelled or failed.";
      return new Response(
        `<html><body><script>window.opener ? window.opener.postMessage({ type: "szroute_oauth_error", error: "${errorDescription}" }, "*") : null; window.close();</script><p>OAuth failed: ${errorDescription}</p></body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    let providerId = "google";
    let verifier = "";

    if (stateRaw) {
      try {
        const parsedState = JSON.parse(stateRaw);
        providerId = parsedState.provider || providerId;
        verifier = parsedState.verifier || "";
      } catch {}
    }

    const provider = OAUTH_PROVIDERS[providerId];
    if (!provider) {
      return NextResponse.json({ error: "Invalid provider in state" }, { status: 400 });
    }

    // Exchange authorization code for Access Token
    const bodyParams = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: provider.clientId,
      code,
      redirect_uri: redirectUri,
    });

    if (verifier) {
      bodyParams.set("code_verifier", verifier);
    }

    const tokenRes = await fetch(provider.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: bodyParams.toString(),
    });

    const tokenText = await tokenRes.text().catch(() => "");
    let tokenJson: Record<string, unknown> = {};
    try {
      tokenJson = JSON.parse(tokenText);
    } catch {
      const parsedParams = new URLSearchParams(tokenText);
      tokenJson = Object.fromEntries(parsedParams.entries());
    }

    const accessToken = String(tokenJson.access_token || tokenJson.key || code || "");
    const refreshToken = String(tokenJson.refresh_token || "");
    const expiresIn =
      typeof tokenJson.expires_in === "number"
        ? tokenJson.expires_in
        : Number(tokenJson.expires_in) || 3600;
    const tokenData: OAuthTokenData = {
      accessToken,
      refreshToken,
      expiresIn,
      expiresAt: Date.now() + expiresIn * 1000,
      connectedAt: new Date().toISOString(),
      providerId,
    };

    // Return HTML that posts the message to the parent window and closes popup
    const html = `<!DOCTYPE html>
<html>
<head><title>SZRoute OAuth Success</title></head>
<body style="font-family: system-ui, sans-serif; background: #e8ebe6; color: #0e0f0c; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
  <div style="background: white; padding: 24px; border-radius: 20px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <h3 style="margin: 0 0 8px;">OAuth Connected!</h3>
    <p style="color: #454745; font-size: 14px; margin: 0 0 16px;">Transferring credentials to SZRoute Gateway...</p>
  </div>
  <script>
    if (window.opener) {
      window.opener.postMessage({
        type: "szroute_oauth_success",
        data: ${JSON.stringify(tokenData)}
      }, "*");
      setTimeout(() => window.close(), 1000);
    } else {
      window.location.href = "/";
    }
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(
      `<html><body><script>window.opener ? window.opener.postMessage({ type: "szroute_oauth_error", error: "${msg}" }, "*") : null; window.close();</script><p>OAuth error: ${msg}</p></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }
}
