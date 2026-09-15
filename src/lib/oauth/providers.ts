export interface OAuthProviderConfig {
  id: string;
  name: string;
  type: "pkce" | "device_code" | "oauth2";
  authorizationUrl?: string;
  tokenUrl: string;
  clientId: string;
  scopes: string[];
  audience?: string;
  description: string;
  badge: string;
}

export interface OAuthTokenData {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  expiresAt?: number;
  scope?: string;
  connectedAt: string;
  providerId: string;
  accountEmail?: string;
  accountName?: string;
}

export const OAUTH_PROVIDERS: Record<string, OAuthProviderConfig> = {
  google: {
    id: "google",
    name: "Google Gemini (AI Studio)",
    type: "pkce",
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || "szroute-public-client.apps.googleusercontent.com",
    scopes: [
      "https://www.googleapis.com/auth/generative-language",
      "openid",
      "email",
    ],
    description: "Authorize directly with your Google account for Gemini 2.5 Flash and Pro access.",
    badge: "15 RPM Free Access",
  },
  github_copilot: {
    id: "github_copilot",
    name: "GitHub Copilot",
    type: "device_code",
    authorizationUrl: "https://github.com/login/device/code",
    tokenUrl: "https://github.com/login/oauth/access_token",
    clientId: process.env.GITHUB_COPILOT_CLIENT_ID || "Iv1.b507a08c87ecfe98",
    scopes: ["read:user", "copilot"],
    description: "Log in with GitHub Device Code to route coding tasks through Copilot frontier models.",
    badge: "Device Code Auth",
  },
  huggingface: {
    id: "huggingface",
    name: "Hugging Face Hub",
    type: "pkce",
    authorizationUrl: "https://huggingface.co/oauth/authorize",
    tokenUrl: "https://huggingface.co/oauth/token",
    clientId: process.env.HUGGINGFACE_CLIENT_ID || "szroute-huggingface-app",
    scopes: ["inference-api", "read-repos"],
    description: "Connect your Hugging Face account to access thousands of free open models.",
    badge: "Inference API OAuth",
  },
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    type: "pkce",
    authorizationUrl: "https://openrouter.ai/auth",
    tokenUrl: "https://openrouter.ai/api/v1/auth/keys",
    clientId: process.env.OPENROUTER_CLIENT_ID || "szroute-gateway",
    scopes: ["read", "write"],
    description: "OAuth connect OpenRouter to auto-provision and manage free API keys.",
    badge: "Auto-Provision OAuth",
  },
};

/**
 * Generate cryptographically secure random PKCE code verifier
 */
export function generateCodeVerifier(length = 64): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues)
    .map((b) => charset[b % charset.length])
    .join("");
}

/**
 * Generate SHA-256 base64url PKCE code challenge from verifier
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hash);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
