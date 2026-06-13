// Provider definitions

/**
 * Service kind — declarative tag for what a provider can do beyond basic LLM chat.
 * Affects UI filtering and playground routing; does not influence request routing.
 */
export type ServiceKind =
  | "llm"
  | "embedding"
  | "image"
  | "imageToText"
  | "tts"
  | "stt"
  | "webSearch"
  | "webFetch"
  | "video"
  | "music";

export type RiskNoticeVariant = "oauth" | "webCookie" | "deprecated" | "embedded-service";

export interface ProviderRiskNoticeFields {
  subscriptionRisk?: boolean;
  riskNoticeVariant?: RiskNoticeVariant;
  isEmbeddedService?: boolean;
}

export const FREE_PROVIDERS = {};

// No-auth Providers
export const NOAUTH_PROVIDERS = {
  opencode: {
    id: "opencode",
    alias: "oc",
    name: "OpenCode Free",
    icon: "terminal",
    color: "#E87040",
    textIcon: "OC",
    website: "https://opencode.ai",
    noAuth: true,
    hasFree: true,
    serviceKinds: ["llm"],
    authHint: "No API key required — uses OpenCode's public free endpoint.",
    freeNote:
      "No API key required — public OpenCode endpoint with Kimi, GLM, Qwen, MiMo, MiniMax models.",
    notice: {
      text: "OpenCode Free uses the public OpenCode endpoint (https://opencode.ai/zen/v1). No signup or API key needed. Rate limits apply.",
    },
  }
};

export const FREE_APIKEY_PROVIDER_IDS = new Set(["qoder", "mimocode", "opencode"]);

export function supportsApiKeyOnFreeProvider(providerId: unknown): boolean {
  return typeof providerId === "string" && FREE_APIKEY_PROVIDER_IDS.has(providerId);
}

// OAuth Providers
export const OAUTH_PROVIDERS = {
  agy: {
    id: "agy",
    alias: "agy",
    name: "Antigravity CLI",
    icon: "terminal",
    color: "#F59E0B",
    textIcon: "AGY",
    website: "https://antigravity.google",
    subscriptionRisk: true,
    riskNoticeVariant: "oauth",
    hasFree: true,
    authHint:
      "Import your Antigravity CLI (`agy`) login (paste/upload its token file), auto-detect a local CLI login, or sign in with Google. Shares the Antigravity backend (incl. Claude models).",
  },
  antigravity: {
    id: "antigravity",
    alias: undefined,
    name: "Antigravity",
    icon: "rocket_launch",
    color: "#F59E0B",
    subscriptionRisk: true,
    riskNoticeVariant: "oauth",
  },
  github: { id: "github", alias: "gh", name: "GitHub Copilot", icon: "code", color: "#333333" }
};

// Web / Cookie Providers
export const WEB_COOKIE_PROVIDERS = {
};

// API Key Providers
export const APIKEY_PROVIDERS = {
  "command-code": {
    id: "command-code",
    alias: "cmd",
    name: "Command Code",
    icon: "terminal",
    color: "#111827",
    textIcon: "CC",
    website: "https://commandcode.ai/",
    authHint:
      "Use a Command Code API key. Requests are sent to Command Code's /alpha/generate endpoint.",
    apiHint: "Create or copy an API key from Command Code, then paste it here as a Bearer token.",
  },
  reka: {
    id: "reka",
    alias: "reka",
    name: "Reka",
    icon: "auto_awesome",
    color: "#111827",
    textIcon: "RK",
    website: "https://docs.reka.ai/chat/overview",
    authHint:
      "Use your Reka API key. SZRoute supports the OpenAI-compatible base URL https://api.reka.ai/v1 and sends both Authorization and X-Api-Key headers for compatibility.",
    apiHint:
      "Reka Chat is OpenAI-compatible on /v1. SZRoute probes /v1/models and routes chat traffic to /v1/chat/completions.",
    hasFree: true,
    freeNote: "$10/month recurring free API credits",
  },
  gemini: {
    id: "gemini",
    alias: "gemini",
    name: "Gemini (Google AI Studio)",
    icon: "diamond",
    color: "#4285F4",
    textIcon: "GE",
    website: "https://aistudio.google.com",
    hasFree: true,
    freeNote:
      "Free forever: 1,500 req/day for Gemini 2.5 Flash — no credit card, get key at aistudio.google.com",
  },
  nvidia: {
    id: "nvidia",
    alias: "nvidia",
    name: "NVIDIA NIM",
    icon: "developer_board",
    color: "#76B900",
    textIcon: "NV",
    website: "https://build.nvidia.com",
    hasFree: true,
    freeNote: "Free dev access: ~40 RPM, 70+ models (Kimi K2.5, GLM 4.7, DeepSeek V3.2...)",
  },
  "ollama-cloud": {
    id: "ollama-cloud",
    alias: "ollamacloud",
    name: "Ollama Cloud",
    icon: "cloud",
    color: "#58A6FF",
    textIcon: "OC",
    website: "https://ollama.com/settings/api-keys",
    hasFree: true,
  },
  // ── Web Fetch Providers ─────────────────────────────────────────────────────
  bluesminds: {
    id: "bluesminds",
    alias: "bm",
    name: "BluesMinds",
    icon: "psychology",
    color: "#3B82F6",
    textIcon: "BM",
    website: "https://www.bluesminds.com",
    hasFree: true,
    freeNote:
      "Free daily pi credits — supports 200+ models including GPT-4o, GPT-4.1, Claude Sonnet 4.5, Gemini 2.0 Flash, DeepSeek V4, Qwen, Kimi K2",
    apiHint:
      "Get your API key at https://www.bluesminds.com — OpenAI-compatible endpoint at https://api.bluesminds.com/v1 with free daily credits. VIP models (Claude Opus 4.5, Gemini 2.5 Pro) consume pi credits.",
  }
};

// Sub-categories within APIKEY_PROVIDERS (used by dashboard and catalog views).
export const IMAGE_ONLY_PROVIDER_IDS = new Set([
  "nanobanana",
  "fal-ai",
  "stability-ai",
  "black-forest-labs",
  "recraft",
  "topaz",
]);

export const AGGREGATOR_PROVIDER_IDS = new Set([
  "openrouter",
  "synthetic",
  "kilo-gateway",
  "aimlapi",
  "novita",
  "piapi",
  "getgoapi",
  "laozhang",
  "vercel-ai-gateway",
  "agentrouter",
  "glhf",
  "cablyai",
  "thebai",
  "fenayai",
  "empower",
  "poe",
  "chutes",
  "hackclub",
]);

export const ENTERPRISE_CLOUD_PROVIDER_IDS = new Set([
  "azure-openai",
  "azure-ai",
  "bedrock",
  "watsonx",
  "oci",
  "sap",
  "vertex",
  "vertex-partner",
  "databricks",
  "datarobot",
  "clarifai",
  "snowflake",
  "heroku",
  "modal",
]);

export const VIDEO_PROVIDER_IDS = new Set([
  "runwayml",
  "veoaifree-web",
  "pollinations",
  "minimax",
  "together",
  "replicate",
  "haiper",
  "leonardo",
]);

// IDE Providers: editors with built-in AI subscription (separate section in UI).
// These providers live in OAUTH_PROVIDERS but render under "IDE Providers"
// instead of "OAuth Providers" to avoid visual duplication.
export const IDE_PROVIDER_IDS = new Set(["cursor", "zed", "trae"]);

export const EMBEDDING_RERANK_PROVIDER_IDS = new Set(["voyage-ai", "jina-ai"]);

// Local / Self-Hosted Providers
export const LOCAL_PROVIDERS = {
  "lm-studio": {
    id: "lm-studio",
    alias: "lmstudio",
    name: "LM Studio",
    icon: "server",
    color: "#4A148C",
    textIcon: "LM",
    website: "https://lmstudio.ai",
    authHint:
      "API key optional. Configure the local LM Studio OpenAI-compatible base URL (default: http://localhost:1234/v1).",
    localDefault: "http://localhost:1234/v1",
    passthroughModels: true,
  },
  vllm: {
    id: "vllm",
    alias: "vllm",
    name: "vLLM",
    icon: "memory",
    color: "#0F766E",
    textIcon: "VL",
    website: "https://github.com/vllm-project/vllm",
    authHint:
      "API key optional. Configure the local vLLM OpenAI-compatible base URL (default: http://localhost:8000/v1).",
    localDefault: "http://localhost:8000/v1",
    passthroughModels: true,
  },
  lemonade: {
    id: "lemonade",
    alias: "lemonade",
    name: "Lemonade Server",
    icon: "bolt",
    color: "#F59E0B",
    textIcon: "LM",
    website: "https://lemonade-server.ai",
    authHint:
      "API key optional. Configure the local Lemonade OpenAI-compatible base URL (default: http://localhost:13305/api/v1).",
    localDefault: "http://localhost:13305/api/v1",
    passthroughModels: true,
  },
  llamafile: {
    id: "llamafile",
    alias: "llamafile",
    name: "Llamafile",
    icon: "article",
    color: "#EA580C",
    textIcon: "LF",
    website: "https://github.com/Mozilla-Ocho/llamafile",
    authHint:
      "API key optional. Configure the local Llamafile OpenAI-compatible base URL (default: http://127.0.0.1:8080/v1).",
    localDefault: "http://127.0.0.1:8080/v1",
    passthroughModels: true,
  },
  "llama-cpp": {
    id: "llama-cpp",
    alias: "llamacpp",
    name: "llama.cpp",
    icon: "memory",
    color: "#795548",
    textIcon: "LC",
    website: "https://github.com/ggml-org/llama.cpp",
    authHint:
      "API key optional (use any value, e.g. sk-no-key-required). Configure the llama-server OpenAI-compatible base URL (default: http://127.0.0.1:8080/v1). Note: if Llamafile is also installed, both default to port 8080 — run only one at a time or override the port.",
    localDefault: "http://127.0.0.1:8080/v1",
    passthroughModels: true,
  },
  triton: {
    id: "triton",
    alias: "triton",
    name: "NVIDIA Triton",
    icon: "developer_board",
    color: "#76B900",
    textIcon: "TR",
    website: "https://developer.nvidia.com/triton-inference-server",
    authHint:
      "API key optional. Configure the Triton OpenAI-compatible base URL (default: http://localhost:8000/v1).",
    localDefault: "http://localhost:8000/v1",
    passthroughModels: true,
  },
  "docker-model-runner": {
    id: "docker-model-runner",
    alias: "dmr",
    name: "Docker Model Runner",
    icon: "inventory_2",
    color: "#2496ED",
    textIcon: "DM",
    website: "https://docs.docker.com/ai/model-runner/",
    authHint:
      "API key optional. Configure the local Docker Model Runner OpenAI-compatible base URL (default: http://localhost:12434/v1).",
    localDefault: "http://localhost:12434/v1",
    passthroughModels: true,
  },
  xinference: {
    id: "xinference",
    alias: "xinference",
    name: "XInference",
    icon: "hub",
    color: "#DC2626",
    textIcon: "XI",
    website: "https://inference.readthedocs.io",
    authHint:
      "API key optional. Configure the local XInference OpenAI-compatible base URL (default: http://localhost:9997/v1).",
    localDefault: "http://localhost:9997/v1",
    passthroughModels: true,
  },
  oobabooga: {
    id: "oobabooga",
    alias: "ooba",
    name: "oobabooga",
    icon: "dns",
    color: "#8B5CF6",
    textIcon: "OO",
    website: "https://github.com/oobabooga/text-generation-webui",
    authHint:
      "API key optional. Configure the local oobabooga OpenAI-compatible base URL (default: http://localhost:5000/v1).",
    localDefault: "http://localhost:5000/v1",
    passthroughModels: true,
  },
  sdwebui: {
    id: "sdwebui",
    alias: "sdwebui",
    name: "SD WebUI",
    icon: "brush",
    color: "#FF7043",
    textIcon: "SD",
    website: "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
    hasFree: true,
    authHint:
      "No API key required. Configure the local WebUI base URL (default: http://localhost:7860).",
    localDefault: "http://localhost:7860",
  },
  comfyui: {
    id: "comfyui",
    alias: "comfyui",
    name: "ComfyUI",
    icon: "account_tree",
    color: "#4CAF50",
    textIcon: "CF",
    website: "https://github.com/comfyanonymous/ComfyUI",
    hasFree: true,
    authHint:
      "No API key required. Configure the local ComfyUI base URL (default: http://localhost:8188).",
    localDefault: "http://localhost:8188",
  },
};

// Search Providers
export const SEARCH_PROVIDERS = {
  "perplexity-search": {
    id: "perplexity-search",
    alias: "pplx-search",
    name: "Perplexity Search",
    icon: "search",
    color: "#20808D",
    textIcon: "PS",
    website: "https://docs.perplexity.ai/guides/search-quickstart",
    authHint: "Same API key as Perplexity (pplx-...)",
  },
  "serper-search": {
    id: "serper-search",
    alias: "serper-search",
    name: "Serper Search",
    icon: "search",
    color: "#4285F4",
    textIcon: "SP",
    website: "https://serper.dev",
    hasFree: true,
    authHint: "API key from serper.dev dashboard",
    serviceKinds: ["webSearch"],
  },
  "brave-search": {
    id: "brave-search",
    alias: "brave-search",
    name: "Brave Search",
    icon: "travel_explore",
    color: "#FB542B",
    textIcon: "BR",
    website: "https://brave.com/search/api",
    hasFree: true,
    authHint: "Subscription token from Brave Search API dashboard",
  },
  "exa-search": {
    id: "exa-search",
    alias: "exa-search",
    name: "Exa Search",
    icon: "neurology",
    color: "#1E40AF",
    textIcon: "EX",
    website: "https://exa.ai",
    hasFree: true,
    authHint: "API key from dashboard.exa.ai",
    serviceKinds: ["webSearch", "webFetch"],
  },
  "tavily-search": {
    id: "tavily-search",
    alias: "tavily-search",
    name: "Tavily Search",
    icon: "manage_search",
    color: "#5B4FDB",
    textIcon: "TV",
    website: "https://tavily.com",
    hasFree: true,
    authHint: "API key from app.tavily.com (format: tvly-...)",
    serviceKinds: ["webSearch", "webFetch"],
  },
  "google-pse-search": {
    id: "google-pse-search",
    alias: "google-pse",
    name: "Google Programmable Search",
    icon: "travel_explore",
    color: "#4285F4",
    textIcon: "GP",
    website: "https://developers.google.com/custom-search/v1/overview",
    authHint: "Requires a Google API key and your Programmable Search Engine ID (cx)",
  },
  "linkup-search": {
    id: "linkup-search",
    alias: "linkup",
    name: "Linkup Search",
    icon: "public",
    color: "#0F766E",
    textIcon: "LU",
    website: "https://docs.linkup.so",
    authHint: "Bearer API key from the Linkup dashboard",
  },
  "searchapi-search": {
    id: "searchapi-search",
    alias: "searchapi",
    name: "SearchAPI",
    icon: "manage_search",
    color: "#2563EB",
    textIcon: "SA",
    website: "https://www.searchapi.io/docs",
    authHint: "API key from SearchAPI (query param or Bearer auth)",
  },
  "youcom-search": {
    id: "youcom-search",
    alias: "youcom-search",
    name: "You.com Search",
    icon: "travel_explore",
    color: "#2563EB",
    textIcon: "YOU",
    website: "https://you.com/docs/search/overview",
    authHint: "X-API-Key from the You.com platform dashboard",
  },
  "searxng-search": {
    id: "searxng-search",
    alias: "searxng",
    name: "SearXNG Search",
    icon: "search",
    color: "#1A237E",
    textIcon: "SX",
    website: "https://docs.searxng.org",
    hasFree: true,
    authHint:
      "API key is optional. Set your SearXNG base URL. Some instances may require a bearer token for access.",
  },
  "ollama-search": {
    id: "ollama-search",
    alias: "ollama-search",
    name: "Ollama Search",
    icon: "search",
    color: "#58A6FF",
    textIcon: "OS",
    website: "https://ollama.com/settings/api-keys",
    authHint: "Same API key as Ollama Cloud (from ollama.com/settings/api-keys)",
  },
};

// Audio Only Providers
export const AUDIO_ONLY_PROVIDERS = {
  deepgram: {
    id: "deepgram",
    alias: "dg",
    name: "Deepgram",
    icon: "mic",
    color: "#13EF93",
    textIcon: "DG",
    website: "https://deepgram.com",
  },
  assemblyai: {
    id: "assemblyai",
    alias: "aai",
    name: "AssemblyAI",
    icon: "record_voice_over",
    color: "#0062FF",
    textIcon: "AA",
    website: "https://assemblyai.com",
  },
  elevenlabs: {
    id: "elevenlabs",
    alias: "el",
    name: "ElevenLabs",
    icon: "record_voice_over",
    color: "#6C47FF",
    textIcon: "EL",
    website: "https://elevenlabs.io",
  },
  cartesia: {
    id: "cartesia",
    alias: "cartesia",
    name: "Cartesia",
    icon: "spatial_audio",
    color: "#FF4F8B",
    textIcon: "CA",
    website: "https://cartesia.ai",
  },
  playht: {
    id: "playht",
    alias: "playht",
    name: "PlayHT",
    icon: "play_circle",
    color: "#00B4D8",
    textIcon: "PH",
    website: "https://play.ht",
  },
  inworld: {
    id: "inworld",
    alias: "inworld",
    name: "Inworld",
    icon: "voice_chat",
    color: "#7B2EF2",
    textIcon: "IW",
    website: "https://inworld.ai",
  },
  "aws-polly": {
    id: "aws-polly",
    alias: "polly",
    name: "AWS Polly",
    icon: "record_voice_over",
    color: "#FF9900",
    textIcon: "PL",
    website: "https://aws.amazon.com/polly/",
    authHint:
      "Use AWS Secret Access Key as API key; set providerSpecificData.accessKeyId and optional region.",
  },
};

export const OPENAI_COMPATIBLE_PREFIX = "openai-compatible-";
export const ANTHROPIC_COMPATIBLE_PREFIX = "anthropic-compatible-";
export const CLAUDE_CODE_COMPATIBLE_PREFIX = "anthropic-compatible-cc-";

export function isOpenAICompatibleProvider(providerId: unknown): providerId is string {
  return typeof providerId === "string" && providerId.startsWith(OPENAI_COMPATIBLE_PREFIX);
}

export function isAnthropicCompatibleProvider(providerId: unknown): providerId is string {
  return typeof providerId === "string" && providerId.startsWith(ANTHROPIC_COMPATIBLE_PREFIX);
}

export const UPSTREAM_PROXY_PROVIDERS = {
  cliproxyapi: {
    id: "cliproxyapi",
    alias: "cpa",
    name: "CLIProxyAPI",
    icon: "proxy",
    color: "#6366F1",
    textIcon: "CPA",
    website: "https://github.com/router-for-me/CLIProxyAPI",
    defaultPort: 8317,
    healthEndpoint: "/v1/models",
    managementPrefix: "/v0/management",
    configDir: "~/.cli-proxy-api",
    binaryName: "cli-proxy-api",
    githubRepo: "router-for-me/CLIProxyAPI",
  },
  "9router": {
    id: "9router",
    alias: "nr",
    name: "9router",
    icon: "router",
    color: "#0EA5E9",
    textIcon: "9R",
    website: "https://www.npmjs.com/package/9router",
    defaultPort: 20130,
    healthEndpoint: "/api/health",
    npmPackage: "9router",
    embedded: true,
    isEmbeddedService: true,
    riskNoticeVariant: "embedded-service" as const,
  },
};

export const CLOUD_AGENT_PROVIDERS = {
  jules: {
    id: "jules",
    alias: "jules",
    name: "Google Jules",
    icon: "engineering",
    color: "#4285F4",
    textIcon: "JL",
    website: "https://jules.google",
    authHint: "Jules API key for creating and managing cloud coding tasks.",
  },
  devin: {
    id: "devin",
    alias: "devin",
    name: "Devin",
    icon: "smart_toy",
    color: "#111827",
    textIcon: "DV",
    website: "https://devin.ai",
    authHint: "Devin API key for cloud agent sessions.",
  },
  "codex-cloud": {
    id: "codex-cloud",
    alias: "codex-cloud",
    name: "Codex Cloud",
    icon: "cloud",
    color: "#10A37F",
    textIcon: "CC",
    website: "https://openai.com/codex",
    authHint: "OpenAI API key with Codex Cloud task access.",
  },
};

export function isClaudeCodeCompatibleProvider(providerId: unknown): providerId is string {
  return typeof providerId === "string" && providerId.startsWith(CLAUDE_CODE_COMPATIBLE_PREFIX);
}

export function isLocalProvider(providerId: unknown): boolean {
  return (
    typeof providerId === "string" &&
    Object.prototype.hasOwnProperty.call(LOCAL_PROVIDERS, providerId)
  );
}

export const SELF_HOSTED_CHAT_PROVIDER_IDS = new Set([
  "lm-studio",
  "vllm",
  "lemonade",
  "llamafile",
  "llama-cpp",
  "triton",
  "docker-model-runner",
  "xinference",
  "oobabooga",
]);

export function isSelfHostedChatProvider(providerId: unknown): boolean {
  return typeof providerId === "string" && SELF_HOSTED_CHAT_PROVIDER_IDS.has(providerId);
}

export function providerAllowsOptionalApiKey(providerId: unknown): boolean {
  return (
    providerId === "searxng-search" ||
    providerId === "pollinations" ||
    providerId === "copilot-web" ||
    providerId === "duckduckgo-web" ||
    providerId === "veoaifree-web" ||
    providerId === "hackclub" ||
    providerId === "huggingchat" ||
    providerId === "gitlawb" ||
    providerId === "gitlawb-gmi" ||
    providerId === "mimocode" ||
    providerId === "opencode" ||
    isLocalProvider(providerId) ||
    isSelfHostedChatProvider(providerId) ||
    isOpenAICompatibleProvider(providerId) ||
    isAnthropicCompatibleProvider(providerId)
  );
}

/**
 * Providers explicitly excluded from bulk API key add — auth is heterogeneous,
 * OAuth-based, multi-field, or requires manual setup per connection.
 */
const BULK_API_KEY_EXCLUDED = new Set([
  "vertex",
  "vertex-partner",
  "ollama-local",
  "grok-web",
  "perplexity-web",
  "blackbox-web",
  "muse-spark-web",
  "deepseek-web",
  "inner-ai",
  "qoder",
  "google-pse-search",
  "command-code",
  "azure",
  "cloudflare-ai",
]);

export function supportsBulkApiKey(providerId: unknown): boolean {
  if (typeof providerId !== "string" || !providerId) return false;
  if (BULK_API_KEY_EXCLUDED.has(providerId)) return false;
  if (isLocalProvider(providerId)) return false;
  if (isSelfHostedChatProvider(providerId)) return false;
  if (isClaudeCodeCompatibleProvider(providerId)) return false;
  return true;
}

// ── System Providers (virtual, not user-connectable) ──────────────────────────
export const SYSTEM_PROVIDERS = {
  auto: {
    id: "auto",
    alias: "auto",
    name: "Auto (Zero-Config)",
    icon: "auto_awesome",
    color: "#6366F1",
    textIcon: "Auto",
    systemOnly: true,
    description: "Zero-config auto-routing with LKGP across all connected providers",
  },
};

const _PROVIDER_SECTIONS = [
  NOAUTH_PROVIDERS,
  OAUTH_PROVIDERS,
  APIKEY_PROVIDERS,
  WEB_COOKIE_PROVIDERS,
  LOCAL_PROVIDERS,
  SEARCH_PROVIDERS,
  AUDIO_ONLY_PROVIDERS,
  UPSTREAM_PROXY_PROVIDERS,
  CLOUD_AGENT_PROVIDERS,
  SYSTEM_PROVIDERS,
] as const;

let _aiProviders: Record<string, any> | null = null;

function getOrCreateAiProviders(): Record<string, any> {
  if (!_aiProviders) {
    _aiProviders = {};
    for (const section of _PROVIDER_SECTIONS) {
      Object.assign(_aiProviders, section);
    }
  }
  return _aiProviders;
}

let _ALIAS_TO_ID: Record<string, string> | null = null;

function getOrCreateAliasToId(): Record<string, string> {
  if (!_ALIAS_TO_ID) {
    _ALIAS_TO_ID = {};
    for (const section of _PROVIDER_SECTIONS) {
      for (const p of Object.values(section)) {
        if ((p as any).alias) _ALIAS_TO_ID[(p as any).alias] = (p as any).id;
      }
    }
  }
  return _ALIAS_TO_ID;
}

let _ID_TO_ALIAS: Record<string, string> | null = null;

function getOrCreateIdToAlias(): Record<string, string> {
  if (!_ID_TO_ALIAS) {
    _ID_TO_ALIAS = {};
    for (const section of _PROVIDER_SECTIONS) {
      for (const p of Object.values(section)) {
        _ID_TO_ALIAS[(p as any).id] = (p as any).alias || (p as any).id;
      }
    }
  }
  return _ID_TO_ALIAS;
}

export function getProviderById(id: string) {
  return (
    (NOAUTH_PROVIDERS as Record<string, any>)[id] ??
    (OAUTH_PROVIDERS as Record<string, any>)[id] ??
    (APIKEY_PROVIDERS as Record<string, any>)[id] ??
    (WEB_COOKIE_PROVIDERS as Record<string, any>)[id] ??
    (LOCAL_PROVIDERS as Record<string, any>)[id] ??
    (SEARCH_PROVIDERS as Record<string, any>)[id] ??
    (AUDIO_ONLY_PROVIDERS as Record<string, any>)[id] ??
    (UPSTREAM_PROXY_PROVIDERS as Record<string, any>)[id] ??
    (CLOUD_AGENT_PROVIDERS as Record<string, any>)[id] ??
    (SYSTEM_PROVIDERS as Record<string, any>)[id] ??
    undefined
  );
}

export const AI_PROVIDERS = new Proxy({} as Record<string, any>, {
  get(_, key) {
    if (key === "then") return undefined;
    return typeof key === "string" ? getOrCreateAiProviders()[key] : undefined;
  },
  ownKeys() {
    return Reflect.ownKeys(getOrCreateAiProviders());
  },
  has(_, key) {
    return key in getOrCreateAiProviders();
  },
  getOwnPropertyDescriptor(_, key) {
    const obj = getOrCreateAiProviders();
    if (typeof key === "string" && key in obj) {
      return { configurable: true, enumerable: true, value: obj[key] };
    }
    return undefined;
  },
});

export type AiProviderId =
  | keyof typeof NOAUTH_PROVIDERS
  | keyof typeof OAUTH_PROVIDERS
  | keyof typeof APIKEY_PROVIDERS
  | keyof typeof WEB_COOKIE_PROVIDERS
  | keyof typeof LOCAL_PROVIDERS
  | keyof typeof SEARCH_PROVIDERS
  | keyof typeof AUDIO_ONLY_PROVIDERS
  | keyof typeof UPSTREAM_PROXY_PROVIDERS
  | keyof typeof CLOUD_AGENT_PROVIDERS
  | keyof typeof SYSTEM_PROVIDERS;

export type AiProviderDefinition =
  | (typeof NOAUTH_PROVIDERS)[keyof typeof NOAUTH_PROVIDERS]
  | (typeof OAUTH_PROVIDERS)[keyof typeof OAUTH_PROVIDERS]
  | (typeof APIKEY_PROVIDERS)[keyof typeof APIKEY_PROVIDERS]
  | (typeof WEB_COOKIE_PROVIDERS)[keyof typeof WEB_COOKIE_PROVIDERS]
  | (typeof LOCAL_PROVIDERS)[keyof typeof LOCAL_PROVIDERS]
  | (typeof SEARCH_PROVIDERS)[keyof typeof SEARCH_PROVIDERS]
  | (typeof AUDIO_ONLY_PROVIDERS)[keyof typeof AUDIO_ONLY_PROVIDERS]
  | (typeof UPSTREAM_PROXY_PROVIDERS)[keyof typeof UPSTREAM_PROXY_PROVIDERS]
  | (typeof CLOUD_AGENT_PROVIDERS)[keyof typeof CLOUD_AGENT_PROVIDERS]
  | (typeof SYSTEM_PROVIDERS)[keyof typeof SYSTEM_PROVIDERS];

// Auth methods
export const AUTH_METHODS = {
  oauth: { id: "oauth", name: "OAuth", icon: "lock" },
  apikey: { id: "apikey", name: "API Key", icon: "key" },
};

export function getProviderByAlias(alias: string): AiProviderDefinition | null {
  for (const section of _PROVIDER_SECTIONS) {
    for (const provider of Object.values(section)) {
      if (provider.alias === alias || provider.id === alias) {
        return provider as AiProviderDefinition;
      }
    }
  }
  return null;
}

// Helper: Get provider ID from alias
export function resolveProviderId(aliasOrId: string): string {
  const provider = getProviderByAlias(aliasOrId);
  return provider?.id || aliasOrId;
}

export function getProviderAlias(providerId: string): string {
  const provider = getProviderById(providerId);
  return provider?.alias || providerId;
}

export const ALIAS_TO_ID = new Proxy({} as Record<string, string>, {
  get(_, key) {
    return typeof key === "string" ? getOrCreateAliasToId()[key] : undefined;
  },
  ownKeys() {
    return Reflect.ownKeys(getOrCreateAliasToId());
  },
  has(_, key) {
    return key in getOrCreateAliasToId();
  },
  getOwnPropertyDescriptor(_, key) {
    const obj = getOrCreateAliasToId();
    if (typeof key === "string" && key in obj) {
      return { configurable: true, enumerable: true, value: obj[key] };
    }
    return undefined;
  },
});

export const ID_TO_ALIAS = new Proxy({} as Record<string, string>, {
  get(_, key) {
    return typeof key === "string" ? getOrCreateIdToAlias()[key] : undefined;
  },
  ownKeys() {
    return Reflect.ownKeys(getOrCreateIdToAlias());
  },
  has(_, key) {
    return key in getOrCreateIdToAlias();
  },
  getOwnPropertyDescriptor(_, key) {
    const obj = getOrCreateIdToAlias();
    if (typeof key === "string" && key in obj) {
      return { configurable: true, enumerable: true, value: obj[key] };
    }
    return undefined;
  },
});

// Providers that support usage/quota API
export const USAGE_SUPPORTED_PROVIDERS = [
  "antigravity",
  "agy",
  "gemini-cli",
  "kiro",
  "amazon-q",
  "github",
  "codex",
  "claude",
  "cursor",
  "kimi-coding",
  "glm",
  "glm-cn",
  "zai",
  "glmt",
  "opencode-go",
  "minimax",
  "minimax-cn",
  "crof",
  "nanogpt",
  "deepseek",
  "xiaomi-mimo",
];

// ── Zod validation at module load (Phase 7.2) ──
import { validateProviders } from "../validation/providerSchema";

validateProviders(NOAUTH_PROVIDERS, "NOAUTH_PROVIDERS");
validateProviders(OAUTH_PROVIDERS, "OAUTH_PROVIDERS");
validateProviders(APIKEY_PROVIDERS, "APIKEY_PROVIDERS");
validateProviders(WEB_COOKIE_PROVIDERS, "WEB_COOKIE_PROVIDERS");
validateProviders(LOCAL_PROVIDERS, "LOCAL_PROVIDERS");
validateProviders(SEARCH_PROVIDERS, "SEARCH_PROVIDERS");
validateProviders(AUDIO_ONLY_PROVIDERS, "AUDIO_ONLY_PROVIDERS");
validateProviders(UPSTREAM_PROXY_PROVIDERS, "UPSTREAM_PROXY_PROVIDERS");
validateProviders(CLOUD_AGENT_PROVIDERS, "CLOUD_AGENT_PROVIDERS");
