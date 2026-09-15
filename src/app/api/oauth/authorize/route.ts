import { NextRequest, NextResponse } from "next/server";
import { OAUTH_PROVIDERS, generateCodeVerifier, generateCodeChallenge } from "@/lib/oauth/providers";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get("provider") || "google";
    const origin = req.headers.get("origin") || req.nextUrl.origin || "https://szroute.vercel.app";
    const redirectUri = `${origin}/api/oauth/callback`;

    const provider = OAUTH_PROVIDERS[providerId];
    if (!provider || !provider.authorizationUrl) {
      return NextResponse.json(
        { error: `Provider '${providerId}' is not supported for OAuth redirect authorization.` },
        { status: 400 }
      );
    }

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = JSON.stringify({
      provider: providerId,
      verifier: codeVerifier,
      nonce: Math.random().toString(36).slice(2),
    });

    const params = new URLSearchParams({
      response_type: "code",
      client_id: provider.clientId,
      redirect_uri: redirectUri,
      scope: provider.scopes.join(" "),
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
      access_type: "offline",
      prompt: "consent",
    });

    const fullAuthUrl = `${provider.authorizationUrl}?${params.toString()}`;

    return NextResponse.json({
      authUrl: fullAuthUrl,
      provider: providerId,
      codeVerifier,
      redirectUri,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
