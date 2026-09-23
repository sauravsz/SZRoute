import { OAUTH_PROVIDERS } from "./providers";

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
  providerId: string;
  error?: string;
}

/**
 * Universal OAuth 2.0 Token Refresh Engine
 * Supports Google Antigravity, Google AI Studio, Kiro AI (AWS OIDC), Claude Code, and OpenAI Codex.
 */
export async function refreshOAuthToken(
  providerId: string,
  refreshToken: string,
  extraData: Record<string, unknown> = {}
): Promise<RefreshResult | null> {
  if (!refreshToken || typeof refreshToken !== "string") {
    return null;
  }

  try {
    // 1. Google Antigravity (Google Cloud Code / Gemini Code Assist)
    if (providerId === "antigravity") {
      const clientId =
        (extraData.clientId as string) ||
        process.env.ANTIGRAVITY_CLIENT_ID ||
        "1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com";
      const clientSecret =
        (extraData.clientSecret as string) ||
        process.env.ANTIGRAVITY_CLIENT_SECRET ||
        "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";

      const params = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      });

      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: params.toString(),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        console.warn(`[SZRoute OAuth Refresh] Antigravity refresh failed (${res.status}): ${errorText.slice(0, 120)}`);
        return null;
      }

      const data = await res.json();
      const expiresIn = typeof data.expires_in === "number" ? data.expires_in : 3600;

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresIn,
        expiresAt: Date.now() + expiresIn * 1000,
        providerId: "antigravity",
      };
    }

    // 2. Google AI Studio / Gemini
    if (providerId === "google") {
      const clientId =
        (extraData.clientId as string) ||
        process.env.GOOGLE_OAUTH_CLIENT_ID ||
        OAUTH_PROVIDERS.google.clientId;
      const clientSecret =
        (extraData.clientSecret as string) ||
        process.env.GOOGLE_OAUTH_CLIENT_SECRET ||
        "";

      const params = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        ...(clientSecret ? { client_secret: clientSecret } : {}),
      });

      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: params.toString(),
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      const expiresIn = typeof data.expires_in === "number" ? data.expires_in : 3600;

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresIn,
        expiresAt: Date.now() + expiresIn * 1000,
        providerId: "google",
      };
    }

    // 3. Kiro AI / AWS SSO OIDC
    if (providerId === "kiro") {
      const region = (extraData.region as string) || "us-east-1";
      const clientId = (extraData.clientId as string) || process.env.KIRO_CLIENT_ID;
      const clientSecret = (extraData.clientSecret as string) || process.env.KIRO_CLIENT_SECRET;

      // If client credentials are present, use AWS SSO OIDC refresh
      if (clientId && clientSecret) {
        const endpoint = `https://oidc.${region}.amazonaws.com/token`;
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            clientId,
            clientSecret,
            refreshToken,
            grantType: "refresh_token",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const expiresIn = typeof data.expiresIn === "number" ? data.expiresIn : 3600;
          return {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken || refreshToken,
            expiresIn,
            expiresAt: Date.now() + expiresIn * 1000,
            providerId: "kiro",
          };
        }
      }

      // Kiro Social Desktop Auth refresh fallback
      const socialEndpoint = "https://prod.us-east-1.auth.desktop.kiro.dev/refreshToken";
      const socialRes = await fetch(socialEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (socialRes.ok) {
        const data = await socialRes.json();
        const expiresIn = typeof data.expiresIn === "number" ? data.expiresIn : 3600;
        return {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken || refreshToken,
          expiresIn,
          expiresAt: Date.now() + expiresIn * 1000,
          providerId: "kiro",
        };
      }

      return null;
    }

    // 4. Anthropic Claude (OAuth)
    if (providerId === "claude") {
      const clientId =
        (extraData.clientId as string) ||
        process.env.CLAUDE_OAUTH_CLIENT_ID ||
        "9d1c250a-e61b-44d9-88ed-5944d1962f5e";

      const res = await fetch("https://claude.ai/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const expiresIn = typeof data.expires_in === "number" ? data.expires_in : 3600;
        return {
          accessToken: data.access_token,
          refreshToken: data.refresh_token || refreshToken,
          expiresIn,
          expiresAt: Date.now() + expiresIn * 1000,
          providerId: "claude",
        };
      }

      return null;
    }

    // 5. OpenAI ChatGPT (OAuth)
    if (providerId === "codex") {
      const clientId =
        (extraData.clientId as string) ||
        process.env.CODEX_OAUTH_CLIENT_ID ||
        "app_EMoamEEZ73f0CkXaXp7hrann";

      const res = await fetch("https://auth.openai.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const expiresIn = typeof data.expires_in === "number" ? data.expires_in : 3600;
        return {
          accessToken: data.access_token,
          refreshToken: data.refresh_token || refreshToken,
          expiresIn,
          expiresAt: Date.now() + expiresIn * 1000,
          providerId: "codex",
        };
      }

      return null;
    }

    // 6. GitHub Copilot session refresh
    if (providerId === "github_copilot") {
      const res = await fetch("https://api.github.com/copilot_internal/v2/token", {
        headers: {
          Authorization: `token ${refreshToken}`,
          Accept: "application/json",
          "User-Agent": "SZRoute/4.0.0",
        },
      });

      if (res.ok) {
        const data = await res.json();
        const expiresIn = typeof data.expires_at === "number" ? Math.max(60, data.expires_at - Math.floor(Date.now() / 1000)) : 1800;
        return {
          accessToken: data.token,
          refreshToken: refreshToken,
          expiresIn,
          expiresAt: (data.expires_at ? data.expires_at * 1000 : Date.now() + expiresIn * 1000),
          providerId: "github_copilot",
        };
      }

      return null;
    }

    // 7. Generic OAuth 2.0 Token Refresh Fallback
    const provider = OAUTH_PROVIDERS[providerId];
    if (provider && provider.tokenUrl) {
      const params = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: provider.clientId,
      });

      const res = await fetch(provider.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: params.toString(),
      });

      if (res.ok) {
        const data = await res.json();
        const expiresIn = typeof data.expires_in === "number" ? data.expires_in : 3600;
        return {
          accessToken: data.access_token,
          refreshToken: data.refresh_token || refreshToken,
          expiresIn,
          expiresAt: Date.now() + expiresIn * 1000,
          providerId,
        };
      }
    }

    return null;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[SZRoute OAuth Refresh] Exception refreshing token for '${providerId}': ${msg}`);
    return null;
  }
}
