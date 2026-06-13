export const SZROUTE_RESPONSE_HEADERS = {
  cache: "X-SZRoute-Cache",
  cacheHit: "X-SZRoute-Cache-Hit",
  fallbackAttempts: "X-SZRoute-Fallback-Attempts",
  latencyMs: "X-SZRoute-Latency-Ms",
  model: "X-SZRoute-Model",
  progress: "X-SZRoute-Progress",
  provider: "X-SZRoute-Provider",
  responseCost: "X-SZRoute-Response-Cost",
  tokensIn: "X-SZRoute-Tokens-In",
  tokensOut: "X-SZRoute-Tokens-Out",
} as const;
