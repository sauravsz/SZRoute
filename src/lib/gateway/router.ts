import { PROVIDER_CATALOG, DEFAULT_COMBOS, ProviderDefinition, VirtualCombo } from "@/lib/providers/catalog";
import { compressMessages, ChatMessage } from "@/lib/compression/engine";
import { refreshOAuthToken } from "@/lib/oauth/refresh";
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
  stop?: string | string[];
  seed?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  n?: number;
  user?: string;
  compress?: boolean;
  [key: string]: unknown;
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
  if (k.startsWith("nvapi-")) return "nvidia";
  if (k.startsWith("fw_")) return "fireworks";
  if (k.startsWith("hf_")) return "huggingface";

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
  // 2. Provider/Model format (e.g. "groq/llama-3.3-70b-versatile", "anthropic/claude-3-7-sonnet-20250219")
  if (modelId && modelId.includes("/")) {
    const slashIdx = modelId.indexOf("/");
    const providerPrefix = modelId.slice(0, slashIdx).toLowerCase().trim();
    const subModelId = modelId.slice(slashIdx + 1).trim();
    const provider = PROVIDER_CATALOG.find((p) => p.id.toLowerCase() === providerPrefix);
    if (provider && subModelId) {
      return {
        isCombo: false,
        targets: [{ provider, upstreamModelId: subModelId, priority: 1 }],
      };
    }
  }

  // 3. Direct model lookup across Provider Catalog (including hyphen/underscore aliases)
  for (const provider of PROVIDER_CATALOG) {
    const matchedModel = provider.models.find(
      (m) =>
        m.id.toLowerCase() === normalizedModel ||
        m.name.toLowerCase() === normalizedModel ||
        m.id.toLowerCase().replace(/[-_]/g, "") === normalizedModel.replace(/[-_]/g, "")
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
function createAnthropicToOpenAISSETransformStream(modelId: string): TransformStream<Uint8Array, Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";

  return new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          const raw = trimmed.slice(6);
          try {
            const data = JSON.parse(raw) as Record<string, unknown>;
            if (data.type === "content_block_delta" && typeof data.delta === "object" && data.delta !== null) {
              const delta = data.delta as Record<string, unknown>;
              if (delta.type === "text_delta" && typeof delta.text === "string") {
                const sseChunk = {
                  id: "chatcmpl-" + Math.random().toString(36).slice(2, 9),
                  object: "chat.completion.chunk",
                  created: Math.floor(Date.now() / 1000),
                  model: modelId,
                  choices: [
                    {
                      index: 0,
                      delta: { content: delta.text },
                      finish_reason: null,
                    },
                  ],
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(sseChunk)}\n\n`));
              }
            } else if (data.type === "message_delta" || data.type === "message_stop") {
              const delta = (data.delta as Record<string, unknown>) || {};
              const finishReason = delta.stop_reason === "max_tokens" ? "length" : "stop";
              const sseChunk = {
                id: "chatcmpl-" + Math.random().toString(36).slice(2, 9),
                object: "chat.completion.chunk",
                created: Math.floor(Date.now() / 1000),
                model: modelId,
                choices: [
                  {
                    index: 0,
                    delta: {},
                    finish_reason: finishReason,
                  },
                ],
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(sseChunk)}\n\n`));
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            }
          } catch {
            // Ignore non-json chunks
          }
        }
      }
    },
  });
}

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
    // If defaultToken was detected for a different provider, do NOT pass it to this provider
    let tokenCandidate = apiKeyMap[provider.id];
    if (!tokenCandidate) {
      if (detectedProvider === provider.id) {
        tokenCandidate = defaultToken;
      } else if (!detectedProvider) {
        tokenCandidate = defaultToken;
      }
    }

    const rawKeys =
      tokenCandidate ||
      (provider.defaultKeyEnv ? process.env[provider.defaultKeyEnv] : "") ||
      "";
    let apiKey = getNextPooledKey(provider.id, rawKeys);

    // If no active key is provided, check if a long-lived OAuth refresh token is available in env
    if (!apiKey) {
      const refreshTokenEnv =
        process.env[`${provider.id.toUpperCase()}_REFRESH_TOKEN`] ||
        process.env[`${provider.id.replace(/-/g, "_").toUpperCase()}_REFRESH_TOKEN`];
      if (refreshTokenEnv) {
        const refreshed = await refreshOAuthToken(provider.id, refreshTokenEnv);
        if (refreshed?.accessToken) {
          apiKey = refreshed.accessToken;
        }
      }
    }

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
    if (req.stop !== undefined) payload.stop = req.stop;
    if (req.seed !== undefined) payload.seed = req.seed;
    if (req.frequency_penalty !== undefined) payload.frequency_penalty = req.frequency_penalty;
    if (req.presence_penalty !== undefined) payload.presence_penalty = req.presence_penalty;
    if (req.n !== undefined) payload.n = req.n;
    if (req.user !== undefined) payload.user = req.user;

    let upstreamBaseUrl = provider.baseUrl;
    if (upstreamBaseUrl.includes("{ACCOUNT_ID}")) {
      const accountId =
        apiKeyMap["cloudflare_account_id"] ||
        apiKeyMap["account_id"] ||
        process.env.CLOUDFLARE_ACCOUNT_ID ||
        "";
      if (!accountId) {
        lastError = new Error("Cloudflare AI requires CLOUDFLARE_ACCOUNT_ID environment variable or apiKeyMap entry");
        continue;
      }
      upstreamBaseUrl = upstreamBaseUrl.replace("{ACCOUNT_ID}", accountId);
    }

    const isAnthropic = provider.id === "anthropic";
    let upstreamUrl = `${upstreamBaseUrl}/chat/completions`;
    let requestBody: Record<string, unknown> = payload;

    if (isAnthropic) {
      upstreamUrl = `${upstreamBaseUrl}/messages`;
      headers["anthropic-version"] = "2023-06-01";
      if (apiKey && apiKey !== "szroute-free") {
        headers["x-api-key"] = apiKey;
      }

      let anthropicSystem: string | undefined = undefined;
      const nonSystemMessages = finalMessages.filter((m) => {
        if (m.role === "system") {
          anthropicSystem = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
          return false;
        }
        return true;
      });

      requestBody = {
        model: upstreamModelId,
        messages: nonSystemMessages,
        max_tokens: req.max_tokens ?? 4096,
        stream: Boolean(req.stream),
        ...(req.temperature !== undefined ? { temperature: req.temperature } : {}),
        ...(req.top_p !== undefined ? { top_p: req.top_p } : {}),
        ...(anthropicSystem ? { system: anthropicSystem } : {}),
        ...(normalizedTools ? { tools: normalizedTools } : {}),
      };
    }

    try {
      let response = await fetch(upstreamUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      // On 401 Unauthorized: Attempt on-the-fly OAuth token refresh and retry
      if (response.status === 401) {
        const refreshTokenCandidate =
          apiKeyMap[`${provider.id}_refresh_token`] ||
          apiKeyMap["refresh_token"] ||
          process.env[`${provider.id.toUpperCase()}_REFRESH_TOKEN`] ||
          process.env[`${provider.id.replace(/-/g, "_").toUpperCase()}_REFRESH_TOKEN`] ||
          "";

        if (refreshTokenCandidate) {
          const refreshed = await refreshOAuthToken(provider.id, refreshTokenCandidate);
          if (refreshed?.accessToken) {
            const retryHeaders = { ...headers };
            if (provider.authHeader === "Authorization") {
              retryHeaders["Authorization"] = provider.authPrefix
                ? `${provider.authPrefix} ${refreshed.accessToken}`
                : refreshed.accessToken;
            } else {
              retryHeaders[provider.authHeader] = refreshed.accessToken;
            }
            if (provider.id === "gemini") {
              retryHeaders["x-goog-api-key"] = refreshed.accessToken;
            }

            const retryRes = await fetch(upstreamUrl, {
              method: "POST",
              headers: retryHeaders,
              body: JSON.stringify(requestBody),
            });

            if (retryRes.ok) {
              response = retryRes;
            }
          }
        }
      }
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

        if (isAnthropic) {
          if (req.stream) {
            const transformedStream = response.body?.pipeThrough(
              createAnthropicToOpenAISSETransformStream(upstreamModelId)
            );
            const streamHeaders = new Headers(response.headers);
            streamHeaders.set("Content-Type", "text/event-stream; charset=utf-8");
            return {
              response: new Response(transformedStream, {
                status: 200,
                headers: streamHeaders,
              }),
              selectedProvider: provider.id,
              selectedModel: upstreamModelId,
              failoverAttempts: attempts - 1,
              tokensSaved,
              percentTokensSaved,
            };
          } else {
            const anthropicJson = (await response.json()) as Record<string, unknown>;
            const contentBlocks = Array.isArray(anthropicJson.content)
              ? (anthropicJson.content as Array<Record<string, unknown>>)
              : [];
            const textContent = contentBlocks
              .filter((c) => c && c.type === "text" && typeof c.text === "string")
              .map((c) => String(c.text))
              .join("");

            const toolUseBlocks = contentBlocks.filter((c) => c && c.type === "tool_use");
            const toolCalls = toolUseBlocks.map((tu) => ({
              id: String(tu.id ?? ""),
              type: "function",
              function: {
                name: String(tu.name ?? ""),
                arguments: JSON.stringify(tu.input ?? {}),
              },
            }));
            const usage = anthropicJson.usage as Record<string, number> | undefined;
            const inputTokens = usage?.input_tokens ?? 0;
            const outputTokens = usage?.output_tokens ?? 0;

            const openaiFormat = {
              id: "chatcmpl-" + (anthropicJson.id ?? Math.random().toString(36).slice(2, 9)),
              object: "chat.completion",
              created: Math.floor(Date.now() / 1000),
              model: upstreamModelId,
              choices: [
                {
                  index: 0,
                  message: {
                    role: "assistant",
                    content: textContent,
                    ...(toolCalls.length > 0 ? { tool_calls: toolCalls } : {}),
                  },
                  finish_reason:
                    anthropicJson.stop_reason === "tool_use"
                      ? "tool_calls"
                      : anthropicJson.stop_reason === "max_tokens"
                      ? "length"
                      : "stop",
                },
              ],
              usage: {
                prompt_tokens: inputTokens,
                completion_tokens: outputTokens,
                total_tokens: inputTokens + outputTokens,
              },
            };

            const transformedHeaders = new Headers(response.headers);
            transformedHeaders.set("Content-Type", "application/json");

            return {
              response: new Response(JSON.stringify(openaiFormat), {
                status: 200,
                headers: transformedHeaders,
              }),
              selectedProvider: provider.id,
              selectedModel: upstreamModelId,
              failoverAttempts: attempts - 1,
              tokensSaved,
              percentTokensSaved,
            };
          }
        }

        return {
          response,
          selectedProvider: provider.id,
          selectedModel: upstreamModelId,
          failoverAttempts: attempts - 1,
          tokensSaved,
          percentTokensSaved,
        }
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
