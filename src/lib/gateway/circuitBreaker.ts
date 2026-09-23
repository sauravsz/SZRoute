export interface CooldownEntry {
  providerId: string;
  cooldownUntil: number;
  reason: string;
  consecutiveFailures: number;
}

// In-memory sliding window for provider cooldowns on Edge
const providerCooldowns = new Map<string, CooldownEntry>();
const providerKeyIndices = new Map<string, number>();

const DEFAULT_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Check if a provider is currently on cooldown (e.g. following rate-limit 429 or server error 5xx)
 */
export function isProviderCoolingDown(providerId: string): boolean {
  const entry = providerCooldowns.get(providerId);
  if (!entry) return false;

  if (Date.now() >= entry.cooldownUntil) {
    providerCooldowns.delete(providerId);
    return false;
  }

  return true;
}

/**
 * Determines if an HTTP status code represents a transient provider outage (429 or 5xx)
 * Client errors (400, 401, 403, 404, 422) must not trip provider-wide circuits.
 */
export function shouldTripCircuit(status: number): boolean {
  return status === 429 || (status >= 500 && status <= 599);
}

/**
 * Report a provider failure and trip the circuit breaker cooldown
 */
export function tripProviderCircuit(providerId: string, status: number, reason: string): void {
  if (!shouldTripCircuit(status)) {
    return;
  }

  const existing = providerCooldowns.get(providerId);
  const consecutive = (existing?.consecutiveFailures || 0) + 1;
  const cooldownDuration = Math.min(DEFAULT_COOLDOWN_MS * consecutive, MAX_COOLDOWN_MS);

  providerCooldowns.set(providerId, {
    providerId,
    cooldownUntil: Date.now() + cooldownDuration,
    reason: `HTTP ${status}: ${reason.slice(0, 80)}`,
    consecutiveFailures: consecutive,
  });

  console.warn(
    `[SZRoute Circuit Breaker] Tripped cooldown for provider '${providerId}' for ${Math.round(
      cooldownDuration / 1000
    )}s (Consecutive failures: ${consecutive}). Reason: ${reason.slice(0, 80)}`
  );
}

/**
 * Report a successful provider response and reset circuit failure count
 */
export function recordProviderSuccess(providerId: string): void {
  providerCooldowns.delete(providerId);
}

/**
 * Select the next API key from a multi-key pool using round-robin rotation
 */
export function getNextPooledKey(providerId: string, rawKeys: string | string[]): string {
  if (!rawKeys) return "";
  if (typeof rawKeys === "string") {
    // Support comma-separated or newline-separated key pools
    const splitKeys = rawKeys.split(/[\n,]+/).map((k) => k.trim()).filter(Boolean);
    if (splitKeys.length <= 1) return splitKeys[0] || rawKeys.trim();
    rawKeys = splitKeys;
  }

  if (!Array.isArray(rawKeys) || rawKeys.length === 0) return "";
  if (rawKeys.length === 1) return rawKeys[0];

  const currentIndex = (providerKeyIndices.get(providerId) || 0) % rawKeys.length;
  const nextIndex = (currentIndex + 1) % rawKeys.length;
  providerKeyIndices.set(providerId, nextIndex);

  return rawKeys[currentIndex] || rawKeys[0];
}

/**
 * Normalizes OpenAI-format tools to Anthropic, Gemini, or standard OpenAI schemas
 */
export function normalizeToolsForProvider(
  tools: unknown[] | undefined,
  providerId: string
): unknown[] | undefined {
  if (!tools || !Array.isArray(tools) || tools.length === 0) return undefined;

  // 1. Google Gemini format (function_declarations)
  if (providerId === "gemini") {
    return tools.map((t: any) => {
      if (t.type === "function" && t.function) {
        return {
          name: t.function.name,
          description: t.function.description || "",
          parameters: t.function.parameters || {},
        };
      }
      return t;
    });
  }

  // 2. Anthropic format (name, description, input_schema)
  if (providerId === "anthropic") {
    return tools.map((t: any) => {
      if (t.type === "function" && t.function) {
        return {
          name: t.function.name,
          description: t.function.description || "",
          input_schema: t.function.parameters || { type: "object", properties: {} },
        };
      }
      if (t.name && (t.input_schema || t.parameters)) {
        return {
          name: t.name,
          description: t.description || "",
          input_schema: t.input_schema || t.parameters,
        };
      }
      return t;
    });
  }

  // 3. OpenAI / Groq / Mistral / DeepSeek standard format
  return tools.map((t: any) => {
    if (t.name && t.input_schema) {
      return {
        type: "function",
        function: {
          name: t.name,
          description: t.description || "",
          parameters: t.input_schema,
        },
      };
    }
    return t;
  });
}
