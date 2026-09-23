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
  gemini: {
    id: "gemini",
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
  antigravity: {
    id: "antigravity",
    name: "Google Antigravity",
    type: "pkce",
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientId:
      process.env.ANTIGRAVITY_CLIENT_ID ||
      "1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com",
    scopes: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/cloud-platform",
    ],
    description: "Authenticate with Google Cloud Code to route requests through Google Antigravity & Code Assist tiers.",
    badge: "Cloud Code OAuth",
  },
  kiro: {
    id: "kiro",
    name: "Kiro AI (AWS Builder ID)",
    type: "device_code",
    authorizationUrl: "https://oidc.us-east-1.amazonaws.com/device_authorization",
    tokenUrl: "https://oidc.us-east-1.amazonaws.com/token",
    clientId: process.env.KIRO_CLIENT_ID || "kiro-client-id",
    scopes: ["codewhisperer:completions", "codewhisperer:analysis"],
    description: "Authenticate via AWS Builder ID Device Code to access Kiro AI and Amazon Q Developer coding models.",
    badge: "AWS Builder ID",
  },
  claude: {
    id: "claude",
    name: "Anthropic Claude (OAuth)",
    type: "pkce",
    authorizationUrl: "https://claude.ai/oauth/authorize",
    tokenUrl: "https://claude.ai/oauth/token",
    clientId: process.env.CLAUDE_OAUTH_CLIENT_ID || "9d1c250a-e61b-44d9-88ed-5944d1962f5e",
    scopes: ["user:read", "model:read", "inference:write"],
    description: "Log in with your Anthropic Claude account to route requests through your Claude Pro/Team plan.",
    badge: "Claude Account OAuth",
  },
  codex: {
    id: "codex",
    name: "OpenAI ChatGPT (OAuth)",
    type: "pkce",
    authorizationUrl: "https://auth.openai.com/authorize",
    tokenUrl: "https://auth.openai.com/oauth/token",
    clientId: process.env.CODEX_OAUTH_CLIENT_ID || "app_EMoamEEZ73f0CkXaXp7hrann",
    scopes: ["openid", "profile", "email", "model.request"],
    description: "Authenticate via OpenAI account to connect your ChatGPT Plus/Team subscription.",
    badge: "ChatGPT Plus/Team",
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
