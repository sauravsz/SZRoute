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
      badgeText: "100% Free Tier",
      details: "30 RPM, 14,400 RPD, high throughput",
      monthlyFreeTokensEstimate: "150M tokens/mo",
    },
    accentColor: "#ff6161",
    models: [
      {
        id: "llama-3.3-70b-versatile",
        name: "Llama 3.3 70B Versatile",
        contextWindow: 131072,
        maxOutput: 32768,
        isFree: true,
        capabilities: { toolCall: true, streaming: true, reasoning: true },
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
        capabilities: { toolCall: true, streaming: true },
      },
      {
        id: "deepseek-r1-distill-llama-70b",
        name: "DeepSeek R1 Distill 70B (Groq)",
        contextWindow: 131072,
        maxOutput: 16384,
        isFree: true,
        capabilities: { toolCall: true, streaming: true, reasoning: true },
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
      badgeText: "Free Developer Tier",
      details: "30 RPM, 1M tokens/day free",
      monthlyFreeTokensEstimate: "30M tokens/mo",
    },
    accentColor: "#57c1ff",
    models: [
      {
        id: "llama3.3-70b",
        name: "Llama 3.3 70B (Cerebras 2000 tps)",
        contextWindow: 131072,
        maxOutput: 8192,
        isFree: true,
        capabilities: { toolCall: true, streaming: true, reasoning: true },
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
      badgeText: "15 RPM Free Tier",
      details: "15 RPM, 1M TPM, 1,500 RPD free",
      monthlyFreeTokensEstimate: "450M tokens/mo",
    },
    accentColor: "#59d499",
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
    id: "openrouter",
    name: "OpenRouter",
    description: "Universal aggregator with 200+ models and curated :free routes.",
    category: "free",
    baseUrl: "https://openrouter.ai/api/v1",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    defaultKeyEnv: "OPENROUTER_API_KEY",
    freeTier: {
      hasFree: true,
      badgeText: "Free Auto-Routes",
      details: "Free DeepSeek R1, Llama 3.3, Qwen 2.5",
      monthlyFreeTokensEstimate: "100M tokens/mo",
    },
    accentColor: "#ffc533",
    models: [
      {
        id: "deepseek/deepseek-r1:free",
        name: "DeepSeek R1 (OpenRouter Free)",
        contextWindow: 65536,
        maxOutput: 8192,
        isFree: true,
        capabilities: { toolCall: true, streaming: true, reasoning: true },
      },
      {
        id: "meta-llama/llama-3.3-70b-instruct:free",
        name: "Llama 3.3 70B (OpenRouter Free)",
        contextWindow: 131072,
        maxOutput: 8192,
        isFree: true,
        capabilities: { toolCall: true, streaming: true },
      },
      {
        id: "qwen/qwen-2.5-coder-32b-instruct:free",
        name: "Qwen 2.5 Coder 32B (OpenRouter Free)",
        contextWindow: 32768,
        maxOutput: 8192,
        isFree: true,
        capabilities: { toolCall: true, streaming: true },
      },
      {
        id: "google/gemini-2.0-flash-exp:free",
        name: "Gemini 2.0 Flash (OpenRouter Free)",
        contextWindow: 1048576,
        maxOutput: 8192,
        isFree: true,
        capabilities: { toolCall: true, streaming: true },
      },
    ],
  },
  {
    id: "mistral",
    name: "Mistral AI",
    description: "European frontier open-weight & specialized coding models with free tier.",
    category: "free",
    baseUrl: "https://api.mistral.ai/v1",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    defaultKeyEnv: "MISTRAL_API_KEY",
    freeTier: {
      hasFree: true,
      badgeText: "La Plateforme Free Tier",
      details: "1 RPS, 1M tokens/min on open models",
      monthlyFreeTokensEstimate: "50M tokens/mo",
    },
    accentColor: "#ff6161",
    models: [
      {
        id: "mistral-large-latest",
        name: "Mistral Large 2411",
        contextWindow: 128000,
        maxOutput: 8192,
        isFree: false,
        capabilities: { toolCall: true, streaming: true, reasoning: true },
      },
      {
        id: "codestral-latest",
        name: "Codestral 2501 (Coding Specialist)",
        contextWindow: 256000,
        maxOutput: 8192,
        isFree: false,
        capabilities: { toolCall: true, streaming: true },
      },
      {
        id: "mistral-small-latest",
        name: "Mistral Small (Free Developer API)",
        contextWindow: 32768,
        maxOutput: 8192,
        isFree: true,
        capabilities: { toolCall: true, streaming: true },
      },
      {
        id: "pixtral-12b-2409",
        name: "Pixtral 12B (Vision)",
        contextWindow: 128000,
        maxOutput: 8192,
        isFree: true,
        capabilities: { toolCall: true, vision: true, streaming: true },
      },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "Industry-leading reasoning (R1) and general chat (V3) at disruptive economics.",
    category: "commercial",
    baseUrl: "https://api.deepseek.com/v1",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    defaultKeyEnv: "DEEPSEEK_API_KEY",
    freeTier: {
      hasFree: true,
      badgeText: "5M Free Tokens on Signup",
      details: "$0.14/1M tokens prompt caching",
      monthlyFreeTokensEstimate: "5M initial signup",
    },
    accentColor: "#57c1ff",
    models: [
      {
        id: "deepseek-reasoner",
        name: "DeepSeek R1 (Full Reasoning)",
        contextWindow: 65536,
        maxOutput: 8192,
        capabilities: { toolCall: true, streaming: true, reasoning: true },
      },
      {
        id: "deepseek-chat",
        name: "DeepSeek V3",
        contextWindow: 65536,
        maxOutput: 8192,
        capabilities: { toolCall: true, streaming: true },
      },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    description: "Frontier reasoning, coding, and hybrid thinking Claude 3.7 architecture.",
    category: "commercial",
    baseUrl: "https://api.anthropic.com/v1",
    authHeader: "x-api-key",
    defaultKeyEnv: "ANTHROPIC_API_KEY",
    customHeaders: {
      "anthropic-version": "2023-06-01",
    },
    freeTier: {
      hasFree: false,
      badgeText: "Paid API",
      details: "Top-tier coding benchmark scores",
    },
    accentColor: "#ffc533",
    models: [
      {
        id: "claude-3-7-sonnet-20250219",
        name: "Claude 3.7 Sonnet (Hybrid Thinking)",
        contextWindow: 200000,
        maxOutput: 64000,
        capabilities: { toolCall: true, vision: true, streaming: true, reasoning: true },
      },
      {
        id: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
        contextWindow: 200000,
        maxOutput: 8192,
        capabilities: { toolCall: true, vision: true, streaming: true },
      },
      {
        id: "claude-3-5-haiku-20241022",
        name: "Claude 3.5 Haiku",
        contextWindow: 200000,
        maxOutput: 8192,
        capabilities: { toolCall: true, vision: true, streaming: true },
      },
    ],
  },
  {
    id: "together",
    name: "Together AI",
    description: "High-performance open-source cloud with $5 initial credits.",
    category: "free",
    baseUrl: "https://api.together.xyz/v1",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    defaultKeyEnv: "TOGETHER_API_KEY",
    freeTier: {
      hasFree: true,
      badgeText: "$5 Free Credit",
      details: "$5 starter grant (~25M tokens)",
      monthlyFreeTokensEstimate: "25M starter tokens",
    },
    accentColor: "#57c1ff",
    models: [
      {
        id: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        name: "Llama 3.3 70B Turbo",
        contextWindow: 131072,
        maxOutput: 4096,
        isFree: true,
        capabilities: { toolCall: true, streaming: true },
      },
      {
        id: "deepseek-ai/DeepSeek-R1",
        name: "DeepSeek R1 (Together)",
        contextWindow: 65536,
        maxOutput: 8192,
        capabilities: { streaming: true, reasoning: true },
      },
    ],
  },
  {
    id: "sambanova",
    name: "SambaNova",
    description: "Reconfigurable Dataflow Unit (RDU) providing blazing fast full 405B inference.",
    category: "free",
    baseUrl: "https://api.sambanova.ai/v1",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    defaultKeyEnv: "SAMBANOVA_API_KEY",
    freeTier: {
      hasFree: true,
      badgeText: "Free Developer Tier",
      details: "Fast 405B and 70B models free",
      monthlyFreeTokensEstimate: "20M tokens/mo",
    },
    accentColor: "#ff6161",
    models: [
      {
        id: "Meta-Llama-3.1-405B-Instruct",
        name: "Llama 3.1 405B (SambaNova)",
        contextWindow: 16384,
        maxOutput: 4096,
        isFree: true,
        capabilities: { toolCall: true, streaming: true },
      },
      {
        id: "Meta-Llama-3.3-70B-Instruct",
        name: "Llama 3.3 70B (SambaNova)",
        contextWindow: 131072,
        maxOutput: 4096,
        isFree: true,
        capabilities: { toolCall: true, streaming: true },
      },
    ],
  },
  {
    id: "cloudflare",
    name: "Cloudflare Workers AI",
    description: "Edge serverless AI inference with 10,000 requests/day free.",
    category: "free",
    baseUrl: "https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/v1",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    defaultKeyEnv: "CLOUDFLARE_API_KEY",
    freeTier: {
      hasFree: true,
      badgeText: "10,000 Req/Day Free",
      details: "Edge inference with 0 cold starts",
      monthlyFreeTokensEstimate: "300M tokens/mo",
    },
    accentColor: "#ffc533",
    models: [
      {
        id: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
        name: "Llama 3.3 70B (Cloudflare Edge)",
        contextWindow: 131072,
        maxOutput: 4096,
        isFree: true,
        capabilities: { streaming: true },
      },
      {
        id: "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
        name: "DeepSeek R1 Distill 32B (Cloudflare Edge)",
        contextWindow: 32768,
        maxOutput: 4096,
        isFree: true,
        capabilities: { streaming: true, reasoning: true },
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
    freeTier: {
      hasFree: true,
      badgeText: "100% Free & Local",
      details: "Zero cost, unlimited local inference",
      monthlyFreeTokensEstimate: "Unlimited",
    },
    accentColor: "#59d499",
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
  {
    id: "nvidia",
    name: "NVIDIA NIM",
    description: "NVIDIA Inference Microservices offering high-throughput GPU inference with free developer credits.",
    category: "free",
    baseUrl: "https://integrate.api.nvidia.com/v1",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    defaultKeyEnv: "NVIDIA_API_KEY",
    freeTier: {
      hasFree: true,
      badgeText: "1,000 Free Credits",
      details: "Free developer access across 70+ accelerated models",
      monthlyFreeTokensEstimate: "50M tokens/mo",
    },
    accentColor: "#76b900",
    models: [
      {
        id: "meta/llama-3.3-70b-instruct",
        name: "Llama 3.3 70B (NVIDIA NIM)",
        contextWindow: 131072,
        maxOutput: 8192,
        isFree: true,
        capabilities: { toolCall: true, streaming: true },
      },
      {
        id: "deepseek-ai/deepseek-r1",
        name: "DeepSeek R1 (NVIDIA NIM)",
        contextWindow: 131072,
        maxOutput: 8192,
        isFree: true,
        capabilities: { streaming: true, reasoning: true },
      },
      {
        id: "nvidia/llama-3.1-nemotron-70b-instruct",
        name: "Nemotron 70B (NVIDIA)",
        contextWindow: 131072,
        maxOutput: 4096,
        isFree: true,
        capabilities: { toolCall: true, streaming: true, reasoning: true },
      },
    ],
  },
  {
    id: "siliconflow",
    name: "SiliconFlow",
    description: "High-speed inference cloud with permanent free tier for DeepSeek and Qwen open-weights models.",
    category: "free",
    baseUrl: "https://api.siliconflow.cn/v1",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    defaultKeyEnv: "SILICONFLOW_API_KEY",
    freeTier: {
      hasFree: true,
      badgeText: "Free Tier",
      details: "Free tokens for DeepSeek-R1 and Qwen 2.5",
      monthlyFreeTokensEstimate: "100M tokens/mo",
    },
    accentColor: "#8b5cf6",
    models: [
      {
        id: "deepseek-ai/DeepSeek-R1",
        name: "DeepSeek R1 (SiliconFlow)",
        contextWindow: 65536,
        maxOutput: 8192,
        isFree: true,
        capabilities: { streaming: true, reasoning: true },
      },
      {
        id: "deepseek-ai/DeepSeek-V3",
        name: "DeepSeek V3 (SiliconFlow)",
        contextWindow: 65536,
        maxOutput: 8192,
        isFree: true,
        capabilities: { toolCall: true, streaming: true },
      },
      {
        id: "Qwen/Qwen2.5-Coder-32B-Instruct",
        name: "Qwen 2.5 Coder 32B (SiliconFlow)",
        contextWindow: 32768,
        maxOutput: 8192,
        isFree: true,
        capabilities: { toolCall: true, streaming: true },
      },
    ],
  },
  {
    id: "fireworks",
    name: "Fireworks AI",
    description: "Fast production inference platform with low latency and developer credits.",
    category: "commercial",
    baseUrl: "https://api.fireworks.ai/inference/v1",
    authHeader: "Authorization",
    authPrefix: "Bearer",
    defaultKeyEnv: "FIREWORKS_API_KEY",
    freeTier: {
      hasFree: true,
      badgeText: "$1 Free Trial",
      details: "High throughput open-source models",
      monthlyFreeTokensEstimate: "10M tokens/mo",
    },
    accentColor: "#f97316",
    models: [
      {
        id: "accounts/fireworks/models/llama-v3p3-70b-instruct",
        name: "Llama 3.3 70B (Fireworks)",
        contextWindow: 131072,
        maxOutput: 8192,
        capabilities: { toolCall: true, streaming: true },
      },
      {
        id: "accounts/fireworks/models/deepseek-r1",
        name: "DeepSeek R1 (Fireworks)",
        contextWindow: 131072,
        maxOutput: 8192,
        capabilities: { streaming: true, reasoning: true },
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
    description: "Cascades seamlessly across 100% free providers: Groq -> Cerebras -> Gemini -> OpenRouter -> SambaNova.",
    strategy: "priority",
    targets: [
      { providerId: "groq", modelId: "llama-3.3-70b-versatile", priority: 1 },
      { providerId: "cerebras", modelId: "llama3.3-70b", priority: 2 },
      { providerId: "gemini", modelId: "gemini-2.5-flash", priority: 3 },
      { providerId: "openrouter", modelId: "deepseek/deepseek-r1:free", priority: 4 },
      { providerId: "sambanova", modelId: "Meta-Llama-3.3-70B-Instruct", priority: 5 },
    ],
  },
  {
    id: "code-expert",
    name: "SZRoute Code Expert",
    description: "Premier coding combo: Claude 3.7 Sonnet -> DeepSeek R1 -> Codestral -> Qwen 2.5 Coder.",
    strategy: "priority",
    targets: [
      { providerId: "anthropic", modelId: "claude-3-7-sonnet-20250219", priority: 1 },
      { providerId: "deepseek", modelId: "deepseek-reasoner", priority: 2 },
      { providerId: "mistral", modelId: "codestral-latest", priority: 3 },
      { providerId: "openrouter", modelId: "qwen/qwen-2.5-coder-32b-instruct:free", priority: 4 },
    ],
  },
  {
    id: "fast-reasoning",
    name: "SZRoute Ultra-Fast Reasoning",
    description: "DeepSeek R1 and Llama 3.3 at 1000–2000 tokens/sec across Groq and Cerebras.",
    strategy: "priority",
    targets: [
      { providerId: "cerebras", modelId: "llama3.3-70b", priority: 1 },
      { providerId: "groq", modelId: "deepseek-r1-distill-llama-70b", priority: 2 },
      { providerId: "gemini", modelId: "gemini-2.5-flash", priority: 3 },
    ],
  },
  {
    id: "balanced-pro",
    name: "SZRoute Pro Balanced",
    description: "Production tier failover: Claude 3.7 Sonnet -> Gemini 2.5 Pro -> DeepSeek R1 -> Mistral Large.",
    strategy: "priority",
    targets: [
      { providerId: "anthropic", modelId: "claude-3-7-sonnet-20250219", priority: 1 },
      { providerId: "gemini", modelId: "gemini-2.5-pro", priority: 2 },
      { providerId: "deepseek", modelId: "deepseek-reasoner", priority: 3 },
      { providerId: "mistral", modelId: "mistral-large-latest", priority: 4 },
    ],
  },
];
