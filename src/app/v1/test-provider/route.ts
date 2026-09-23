import { NextRequest, NextResponse } from "next/server";
import { PROVIDER_CATALOG } from "@/lib/providers/catalog";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { providerId, apiKey } = await req.json();

    const provider = PROVIDER_CATALOG.find((p) => p.id === providerId);
    if (!provider) {
      return NextResponse.json({ error: "Provider not found in catalog" }, { status: 404 });
    }

    const testModel = provider.models[0]?.id || "default";
    const effectiveApiKey =
      apiKey ||
      (provider.defaultKeyEnv ? process.env[provider.defaultKeyEnv] : "") ||
      "";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(provider.customHeaders || {}),
    };

    if (effectiveApiKey) {
      if (provider.authHeader === "Authorization") {
        headers["Authorization"] = provider.authPrefix ? `${provider.authPrefix} ${effectiveApiKey}` : effectiveApiKey;
      } else {
        headers[provider.authHeader] = effectiveApiKey;
      }
    }

    let upstreamBaseUrl = provider.baseUrl;
    if (upstreamBaseUrl.includes("{ACCOUNT_ID}")) {
      const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "";
      if (!accountId) {
        return NextResponse.json({
          success: false,
          latencyMs: Date.now() - startTime,
          error: "Cloudflare requires CLOUDFLARE_ACCOUNT_ID environment variable",
        });
      }
      upstreamBaseUrl = upstreamBaseUrl.replace("{ACCOUNT_ID}", accountId);
    }

    const isAnthropic = provider.id === "anthropic";
    const upstreamUrl = isAnthropic ? `${upstreamBaseUrl}/messages` : `${upstreamBaseUrl}/chat/completions`;
    if (isAnthropic) {
      headers["anthropic-version"] = "2023-06-01";
    }

    const res = await fetch(upstreamUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: testModel,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 5,
      }),
    });

    const latencyMs = Date.now() - startTime;

    if (res.ok) {
      return NextResponse.json({
        success: true,
        status: res.status,
        latencyMs,
        provider: provider.name,
        model: testModel,
      });
    }

    const errorText = await res.text();
    return NextResponse.json({
      success: false,
      status: res.status,
      latencyMs,
      provider: provider.name,
      error: errorText.slice(0, 300),
    });
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      success: false,
      latencyMs,
      error: message,
    });
  }
}
