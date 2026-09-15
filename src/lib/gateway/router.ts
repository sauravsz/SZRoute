import { PROVIDER_CATALOG, DEFAULT_COMBOS, ProviderDefinition, VirtualCombo } from "@/lib/providers/catalog";
import { compressMessages, ChatMessage } from "@/lib/compression/engine";
import {
  isProviderCoolingDown,
  tripProviderCircuit,
  recordProviderSuccess,
  getNextPooledKey,
  normalizeToolsForProvider,
} from "@/lib/gateway/circuitBreaker";

export interface GatewayChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  tools?: unknown[];
  tool_choice?: unknown;
  response_format?: unknown;
  compress?: boolean;
}

export interface RouteTarget {
  provider: ProviderDefinition;
  upstreamModelId: string;
  priority: number;
}

export interface ResolvedRoute {
  isCombo: boolean;
  comboName?: string;
  targets: RouteTarget[];
}

export interface GatewayExecutionResult {
  response: Response;
  selectedProvider: string;
  selectedModel: string;
  failoverAttempts: number;
  tokensSaved: number;
  percentTokensSaved: number;
}

/**
 * Auto-detect provider identity from API key prefix
 */
export function detectProviderFromKey(key: string): string | null {
  if (!key || typeof key !== "string") return null;
  const k = key.trim();

  if (k.startsWith("gsk_")) return "groq";
  if (k.startsWith("AIzaSy")) return "gemini";
  if (k.startsWith("csk-") || k.startsWith("csk_")) return "cerebras";
  if (k.startsWith("sk-ant-")) return "anthropic";
  if (k.startsWith("sk-or-v1-") || k.startsWith("sk-or-")) return "openrouter";
  if (k.startsWith("together_")) return "together";

  return null;
}

/**
 * Resolve target provider candidates for a given model or virtual combo name
 */
export function resolveRouteTargets(
  modelId: string,
  customCombos: VirtualCombo[] = []
): ResolvedRoute {
  const normalizedModel = (modelId || "free-auto").toLowerCase().trim();

  // 1. Check if it matches a Virtual Combo
  const allCombos = [...DEFAULT_COMBOS, ...customCombos];
  const matchedCombo = allCombos.find(
    (c) => c.id.toLowerCase() === normalizedModel || c.name.toLowerCase() === normalizedModel
  );

  if (matchedCombo) {
    const targets: RouteTarget[] = [];
    for (const t of matchedCombo.targets) {
      const provider = PROVIDER_CATALOG.find((p) => p.id === t.providerId);
      if (provider) {
        targets.push({
          provider,
          upstreamModelId: t.modelId,
          priority: t.priority,
        });
      }
    }

    if (targets.length > 0) {
      return {
        isCombo: true,
        comboName: matchedCombo.name,
        targets: targets.sort((a, b) => a.priority - b.priority),
      };
    }
  }

  // 2. Direct model lookup across Provider Catalog
  for (const provider of PROVIDER_CATALOG) {
    const matchedModel = provider.models.find(
      (m) => m.id.toLowerCase() === normalizedModel || m.name.toLowerCase() === normalizedModel
    );
    if (matchedModel) {
      return {
        isCombo: false,
        targets: [
          {
            provider,
            upstreamModelId: matchedModel.id,
            priority: 1,
          },
        ],
      };
    }
  }

  // 3. Fallback heuristic: Try free-auto if model not recognized
  const defaultCombo = DEFAULT_COMBOS[0];
  const defaultTargets: RouteTarget[] = defaultCombo.targets
    .map((t) => {
      const p = PROVIDER_CATALOG.find((prov) => prov.id === t.providerId);
      return p ? { provider: p, upstreamModelId: t.modelId, priority: t.priority } : null;
    })
    .filter((t): t is RouteTarget => t !== null);

  return {
    isCombo: true,
    comboName: "SZRoute Auto-Fallback (Fallback)",
    targets: defaultTargets,
  };
}

/**
 * Executes chat completion with circuit-breaker cooldowns, multi-key pooling, & tool normalization
 */
export async function executeGatewayChat(
  req: GatewayChatRequest,
  apiKeyMap: Record<string, string> = {},
  options: {
    compress?: boolean;
    customCombos?: VirtualCombo[];
  } = {}
): Promise<GatewayExecutionResult> {
  const resolved = resolveRouteTargets(req.model, options.customCombos);

  // Apply RTK + Caveman compression if enabled
  let finalMessages = req.messages;
  let tokensSaved = 0;
  let percentTokensSaved = 0;

  if (req.compress || options.compress) {
    const compResult = compressMessages(req.messages);
    finalMessages = compResult.messages;
    tokensSaved = compResult.tokensSaved;
    percentTokensSaved = compResult.percentSaved;
  }

  let lastError: Error | null = null;
  let attempts = 0;

  const defaultToken = apiKeyMap["default"] || "";
  const detectedProvider = detectProviderFromKey(defaultToken);

  for (const target of resolved.targets) {
    const { provider, upstreamModelId } = target;

    // Feature 1: Circuit breaker check (Skip providers that are currently on 429/5xx cooldown)
    if (isProviderCoolingDown(provider.id)) {
      console.warn(`[SZRoute Router] Provider '${provider.id}' is on cooldown. Fast-skipping to next tier.`);
      continue;
    }

    attempts++;

    // Feature 2: Multi-Key pooling and auto-detection
    const rawKeys =
      apiKeyMap[provider.id] ||
      (detectedProvider === provider.id ? defaultToken : "") ||
      (provider.defaultKeyEnv ? process.env[provider.defaultKeyEnv] : "") ||
      defaultToken;

    const apiKey = getNextPooledKey(provider.id, rawKeys);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(provider.customHeaders || {}),
    };

    if (apiKey && apiKey !== "szroute-free") {
      if (provider.authHeader === "Authorization") {
        headers["Authorization"] = provider.authPrefix ? `${provider.authPrefix} ${apiKey}` : apiKey;
      } else {
        headers[provider.authHeader] = apiKey;
      }

      if (provider.id === "gemini") {
        headers["x-goog-api-key"] = apiKey;
      }
    }

    // Feature 3: Universal Tool Calling Schema Normalization
    const normalizedTools = normalizeToolsForProvider(req.tools, provider.id);

    const payload: Record<string, unknown> = {
      model: upstreamModelId,
      messages: finalMessages,
      temperature: req.temperature ?? 0.7,
      stream: Boolean(req.stream),
    };

    if (req.max_tokens) payload.max_tokens = req.max_tokens;
    if (req.top_p) payload.top_p = req.top_p;
    if (normalizedTools) payload.tools = normalizedTools;
    if (req.tool_choice) payload.tool_choice = req.tool_choice;
    if (req.response_format) payload.response_format = req.response_format;

    try {
      const upstreamUrl = `${provider.baseUrl}/chat/completions`;
      const response = await fetch(upstreamUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";

        // If streaming requested but upstream returned JSON, check for error payload
        if (req.stream && contentType.includes("application/json")) {
          const cloned = response.clone();
          const jsonBody = (await cloned.json().catch(() => null)) as Record<string, unknown> | null;
          if (jsonBody && "error" in jsonBody) {
            const errMsg = JSON.stringify(jsonBody.error);
            tripProviderCircuit(provider.id, 502, errMsg);
            lastError = new Error(`Provider ${provider.id} in-stream error: ${errMsg}`);
            continue;
          }
        }

        // Record success and clear failure counter
        recordProviderSuccess(provider.id);

        return {
          response,
          selectedProvider: provider.id,
          selectedModel: upstreamModelId,
          failoverAttempts: attempts - 1,
          tokensSaved,
          percentTokensSaved,
        };
      }

      const errorText = await response.text();
      tripProviderCircuit(provider.id, response.status, errorText);

      lastError = new Error(`Provider ${provider.id} error (${response.status}): ${errorText}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      tripProviderCircuit(provider.id, 500, message);
      lastError = err instanceof Error ? err : new Error(message);
    }
  }

  throw new Error(
    `All available providers failed in route for model '${req.model}'. Last error: ${lastError?.message || "Unknown error"}`
  );
}
