import { getProviderAlias } from "@/shared/constants/providers";
import { SZROUTE_RESPONSE_HEADERS } from "@/shared/constants/headers";

type UsageLike = Record<string, unknown> | null | undefined;

function toFiniteNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toNonNegativeInteger(value: unknown): number {
  return Math.max(0, Math.round(toFiniteNumber(value)));
}

export function getSZRouteTokenCounts(usage: UsageLike): { input: number; output: number } {
  if (!usage || typeof usage !== "object") {
    return { input: 0, output: 0 };
  }

  return {
    input: toNonNegativeInteger(
      usage.input ??
        usage.prompt_tokens ??
        usage.input_tokens ??
        usage.promptTokens ??
        usage.inputTokens
    ),
    output: toNonNegativeInteger(
      usage.output ??
        usage.completion_tokens ??
        usage.output_tokens ??
        usage.completionTokens ??
        usage.outputTokens
    ),
  };
}

export function formatSZRouteCost(costUsd: unknown): string {
  const normalized = toFiniteNumber(costUsd);
  return normalized > 0 ? normalized.toFixed(10) : "0.0000000000";
}

export function buildSZRouteResponseMetaHeaders({
  cacheHit = false,
  costUsd = 0,
  fallbackAttempts = 0,
  latencyMs = 0,
  model = null,
  provider = null,
  usage = null,
}: {
  cacheHit?: boolean;
  costUsd?: unknown;
  fallbackAttempts?: number;
  latencyMs?: unknown;
  model?: string | null;
  provider?: string | null;
  usage?: UsageLike;
}): Record<string, string> {
  const tokens = getSZRouteTokenCounts(usage);
  const headers: Record<string, string> = {
    [SZROUTE_RESPONSE_HEADERS.cacheHit]: String(cacheHit),
    [SZROUTE_RESPONSE_HEADERS.latencyMs]: String(toNonNegativeInteger(latencyMs)),
    [SZROUTE_RESPONSE_HEADERS.responseCost]: formatSZRouteCost(costUsd),
    [SZROUTE_RESPONSE_HEADERS.tokensIn]: String(tokens.input),
    [SZROUTE_RESPONSE_HEADERS.tokensOut]: String(tokens.output),
  };

  if (typeof model === "string" && model.trim().length > 0) {
    headers[SZROUTE_RESPONSE_HEADERS.model] = model;
  }

  if (typeof provider === "string" && provider.trim().length > 0) {
    headers[SZROUTE_RESPONSE_HEADERS.provider] = getProviderAlias(provider);
  }

  const attempts = toNonNegativeInteger(fallbackAttempts);
  if (attempts > 0) {
    headers[SZROUTE_RESPONSE_HEADERS.fallbackAttempts] = String(attempts);
  }

  return headers;
}

export function buildSZRouteSseMetadataComment(
  options: Parameters<typeof buildSZRouteResponseMetaHeaders>[0]
): string {
  const headers = buildSZRouteResponseMetaHeaders(options);
  const lines = Object.entries(headers)
    .filter(([, value]) => typeof value === "string" && value.trim().length > 0)
    .map(([name, value]) => `: ${name.toLowerCase()}=${value}`);

  return lines.length > 0 ? `${lines.join("\n")}\n` : "";
}
