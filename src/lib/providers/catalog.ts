export interface ProviderModel {
  id: string;
  name: string;
  contextWindow: number;
  maxOutput: number;
  costPer1kPrompt?: number;
  costPer1kCompletion?: number;
  isFree?: boolean;
  capabilities?: {
    toolCall?: boolean;
    vision?: boolean;
    streaming?: boolean;
    reasoning?: boolean;
  };
}

export interface ProviderDefinition {
  id: string;
  name: string;
  description: string;
  category: "free" | "commercial" | "local" | "specialized";
  baseUrl: string;
  authHeader: string;
  authPrefix?: string;
  defaultKeyEnv?: string;
  freeTier: {
    hasFree: boolean;
    badgeText?: string;
    details?: string;
    monthlyFreeTokensEstimate?: string;
  };
  accentColor: string;
  iconName?: string;
  models: ProviderModel[];
  customHeaders?: Record<string, string>;
}

export const PROVIDER_CATALOG: ProviderDefinition[] = [
  {
    id: "groq",
    name: "Groq",
    description: "Ultra-fast LPU inference engine with generous free rate limits.",
    category: "free",
    baseUrl: "https://api.groq.com/openai/v1",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    defaultKeyEnv: "GROQ_API_KEY",
    freeTier: {
      hasFree: true,
      badgeText: "30 RPM Free",
      details: "14,400 requests/day (~150M tokens/month)",
      monthlyFreeTokensEstimate: "150M tokens/mo",
    },
    accentColor: "#f55036",
    models: [
      {
        id: "llama-3.3-70b-versatile",
        name: "Llama 3.3 70B Versatile",
        contextWindow: 131072,
        maxOutput: 32768,
        isFree: true,
        capabilities: { toolCall: true, streaming: true },
      },
      {
        id: "llama-3.1-8b-instant",
        name: "Llama 3.1 8B Instant",
        contextWindow: 131072,
        maxOutput: 8192,
        isFree: true,
        capabilities: { toolCall: true, streaming: true },
      },
      {
        id: "mixtral-8x7b-32768",
        name: "Mixtral 8x7B 32k",
        contextWindow: 32768,
        maxOutput: 4096,
        isFree: true,
        capabilities: { streaming: true },
      },
      {
        id: "deepseek-r1-distill-llama-70b",
        name: "DeepSeek R1 Distill 70B (Groq)",
        contextWindow: 131072,
        maxOutput: 16384,
        isFree: true,
        capabilities: { streaming: true, reasoning: true },
      },
    ],
  },
  {
    id: "cerebras",
    name: "Cerebras",
    description: "Wafer-scale AI acceleration delivering 2,000+ tokens/sec.",
    category: "free",
    baseUrl: "https://api.cerebras.ai/v1",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    defaultKeyEnv: "CEREBRAS_API_KEY",
    freeTier: {
      hasFree: true,
      badgeText: "30 RPM Free",
      details: "30 RPM free tier with 2,000+ tokens/sec generation",
      monthlyFreeTokensEstimate: "30M tokens/mo",
    },
    accentColor: "#ec4899",
    models: [
      {
        id: "llama3.3-70b",
        name: "Llama 3.3 70B (Cerebras 2000 tps)",
        contextWindow: 131072,
        maxOutput: 8192,
        isFree: true,
        capabilities: { toolCall: true, streaming: true },
      },
      {
        id: "llama3.1-8b",
        name: "Llama 3.1 8B (Cerebras 2200 tps)",
        contextWindow: 131072,
        maxOutput: 8192,
        isFree: true,
        capabilities: { toolCall: true, streaming: true },
      },
    ],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Google AI Studio providing massive multimodal context and free RPM.",
    category: "free",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    defaultKeyEnv: "GEMINI_API_KEY",
    customHeaders: {
      "x-goog-api-client": "szroute-edge-v4",
    },
    freeTier: {
      hasFree: true,
      badgeText: "15 RPM Free",
      details: "1,500 RPD on 1.5/2.5 Flash models (~450M tokens/month)",
      monthlyFreeTokensEstimate: "450M tokens/mo",
    },
    accentColor: "#3b82f6",
    models: [
      {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        contextWindow: 1048576,
        maxOutput: 65536,
        isFree: true,
        capabilities: { toolCall: true, vision: true, streaming: true, reasoning: true },
      },
      {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        contextWindow: 2097152,
        maxOutput: 65536,
        isFree: true,
        capabilities: { toolCall: true, vision: true, streaming: true, reasoning: true },
      },
      {
        id: "gemini-2.0-flash-exp",
        name: "Gemini 2.0 Flash Experimental",
        contextWindow: 1048576,
        maxOutput: 8192,
        isFree: true,
        capabilities: { toolCall: true, vision: true, streaming: true },
      },
      {
        id: "gemini-1.5-flash",
        name: "Gemini 1.5 Flash",
        contextWindow: 1048576,
        maxOutput: 8192,
        isFree: true,
        capabilities: { toolCall: true, vision: true, streaming: true },
      },
    ],
  },
  {
    id: "antigravity",
    name: "Google Antigravity",
    description: "Google Cloud Code & Gemini Code Assist frontier models via Google OAuth PKCE.",
    category: "free",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    defaultKeyEnv: "ANTIGRAVITY_TOKEN",
    customHeaders: {
      "x-goog-api-client": "szroute-edge-antigravity",
    },
    freeTier: {
      hasFree: true,
      badgeText: "Cloud Code OAuth",
      details: "Unlimited free developer access via Google Cloud Code / Antigravity OAuth.",
      monthlyFreeTokensEstimate: "Free quota via OAuth",
    },
    accentColor: "#4285F4",
    models: [
      {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro (Antigravity)",
        contextWindow: 2097152,
        maxOutput: 65536,
        isFree: true,
        capabilities: { toolCall: true, vision: true, streaming: true, reasoning: true },
      },
      {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash (Antigravity)",
        contextWindow: 1048576,
        maxOutput: 65536,
        isFree: true,
        capabilities: { toolCall: true, vision: true, streaming: true, reasoning: true },
      },
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash (Antigravity)",
        contextWindow: 1048576,
        maxOutput: 8192,
        isFree: true,
        capabilities: { toolCall: true, vision: true, streaming: true, reasoning: true },
      },
      {
        id: "claude-3-5-sonnet",
        name: "Claude 3.5 Sonnet (Antigravity)",
        contextWindow: 200000,
        maxOutput: 8192,
        isFree: true,
        capabilities: { toolCall: true, vision: true, streaming: true, reasoning: true },
      },
    ],
  },
  {
    id: "kiro",
    name: "Kiro AI",
    description: "AWS Builder ID developer models (Claude 3.7 & Amazon Q) via AWS device code authentication.",
    category: "free",
    baseUrl: "https://codewhisperer.us-east-1.amazonaws.com",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    defaultKeyEnv: "KIRO_TOKEN",
    freeTier: {
      hasFree: true,
      badgeText: "AWS Builder ID",
      details: "Generous developer tier with Claude 3.7 Sonnet access via AWS Builder ID.",
      monthlyFreeTokensEstimate: "Free quota via OAuth",
    },
    accentColor: "#FF9900",
    models: [
      {
        id: "claude-3-7-sonnet",
        name: "Claude 3.7 Sonnet (Kiro)",
        contextWindow: 200000,
        maxOutput: 64000,
        isFree: true,
        capabilities: { toolCall: true, vision: true, streaming: true, reasoning: true },
      },
      {
        id: "claude-3-5-sonnet",
        name: "Claude 3.5 Sonnet (Kiro)",
        contextWindow: 200000,
        maxOutput: 8192,
        isFree: true,
        capabilities: { toolCall: true, vision: true, streaming: true, reasoning: true },
      },
      {
        id: "amazon-q-developer",
        name: "Amazon Q Developer (Kiro)",
        contextWindow: 128000,
        maxOutput: 4096,
        isFree: true,
        capabilities: { toolCall: true, vision: false, streaming: true, reasoning: false },
      },
    ],
  },
  {
    id: "ollama",
    name: "Ollama (Local)",
    description: "Self-hosted local inference with 0 API costs and complete data privacy.",
    category: "local",
    baseUrl: "http://localhost:11434/v1",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    defaultKeyEnv: "OLLAMA_API_KEY",
    freeTier: {
      hasFree: true,
      badgeText: "100% Free / Local",
      details: "Unlimited offline local token generation on your own hardware.",
      monthlyFreeTokensEstimate: "Unlimited",
    },
    accentColor: "#64748b",
    models: [
      {
        id: "llama3.3:latest",
        name: "Llama 3.3 (Local)",
        contextWindow: 131072,
        maxOutput: 8192,
        isFree: true,
        capabilities: { toolCall: true, streaming: true },
      },
      {
        id: "deepseek-r1:latest",
        name: "DeepSeek R1 (Local)",
        contextWindow: 65536,
        maxOutput: 8192,
        isFree: true,
        capabilities: { streaming: true, reasoning: true },
      },
      {
        id: "qwen2.5-coder:latest",
        name: "Qwen 2.5 Coder (Local)",
        contextWindow: 32768,
        maxOutput: 8192,
        isFree: true,
        capabilities: { toolCall: true, streaming: true },
      },
    ],
  },
];

export interface VirtualCombo {
  id: string;
  name: string;
  description: string;
  strategy: "priority" | "round-robin" | "lowest-latency" | "lowest-cost";
  targets: Array<{
    providerId: string;
    modelId: string;
    priority: number;
    weight?: number;
  }>;
}

export const DEFAULT_COMBOS: VirtualCombo[] = [
  {
    id: "free-auto",
    name: "SZRoute Auto-Free (Zero Cost)",
    description: "Cascades seamlessly across zero-cost providers: Groq -> Cerebras -> Gemini -> Antigravity -> Kiro.",
    strategy: "priority",
    targets: [
      { providerId: "groq", modelId: "llama-3.3-70b-versatile", priority: 1 },
      { providerId: "cerebras", modelId: "llama3.3-70b", priority: 2 },
      { providerId: "gemini", modelId: "gemini-2.5-flash", priority: 3 },
      { providerId: "antigravity", modelId: "gemini-2.5-flash", priority: 4 },
      { providerId: "kiro", modelId: "claude-3-5-sonnet", priority: 5 },
    ],
  },
  {
    id: "code-expert",
    name: "SZRoute Code Expert",
    description: "Premier coding combo: Kiro Claude 3.7 -> Antigravity Gemini 2.5 Pro -> Gemini 2.5 Pro -> Groq Llama 3.3.",
    strategy: "priority",
    targets: [
      { providerId: "kiro", modelId: "claude-3-7-sonnet", priority: 1 },
      { providerId: "antigravity", modelId: "gemini-2.5-pro", priority: 2 },
      { providerId: "gemini", modelId: "gemini-2.5-pro", priority: 3 },
      { providerId: "groq", modelId: "llama-3.3-70b-versatile", priority: 4 },
    ],
  },
  {
    id: "fast-reasoning",
    name: "SZRoute Ultra-Fast Reasoning",
    description: "Fast reasoning across Cerebras, Groq, Gemini, and Antigravity.",
    strategy: "priority",
    targets: [
      { providerId: "cerebras", modelId: "llama3.3-70b", priority: 1 },
      { providerId: "groq", modelId: "deepseek-r1-distill-llama-70b", priority: 2 },
      { providerId: "gemini", modelId: "gemini-2.5-flash", priority: 3 },
      { providerId: "antigravity", modelId: "gemini-2.5-flash", priority: 4 },
    ],
  },
  {
    id: "balanced-pro",
    name: "SZRoute Pro Balanced",
    description: "Production tier failover: Kiro Claude 3.7 -> Antigravity Gemini 2.5 Pro -> Gemini 2.5 Pro -> Cerebras.",
    strategy: "priority",
    targets: [
      { providerId: "kiro", modelId: "claude-3-7-sonnet", priority: 1 },
      { providerId: "antigravity", modelId: "gemini-2.5-pro", priority: 2 },
      { providerId: "gemini", modelId: "gemini-2.5-pro", priority: 3 },
      { providerId: "cerebras", modelId: "llama3.3-70b", priority: 4 },
    ],
  },
];
