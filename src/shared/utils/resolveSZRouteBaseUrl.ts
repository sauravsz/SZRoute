const DEFAULT_SZROUTE_BASE_URL = "http://localhost:21128";

type SZRouteBaseUrlEnv = {
  SZROUTE_BASE_URL?: string;
  BASE_URL?: string;
  NEXT_PUBLIC_BASE_URL?: string;
};

function normalizeBaseUrl(value?: string): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/+$/, "");
}

export function resolveSZRouteBaseUrl(env: SZRouteBaseUrlEnv = process.env): string {
  return (
    normalizeBaseUrl(env.SZROUTE_BASE_URL) ||
    normalizeBaseUrl(env.BASE_URL) ||
    normalizeBaseUrl(env.NEXT_PUBLIC_BASE_URL) ||
    DEFAULT_SZROUTE_BASE_URL
  );
}

export { DEFAULT_SZROUTE_BASE_URL };
