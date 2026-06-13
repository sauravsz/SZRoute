import test from "node:test";
import assert from "node:assert/strict";
import { SZROUTE_RESPONSE_HEADERS } from "../../src/shared/constants/headers.ts";
import { buildSZRouteResponseMetaHeaders } from "../../src/domain/szrouteResponseMeta.ts";

test("headers constant exposes the fallback-attempts key", () => {
  assert.equal(
    SZROUTE_RESPONSE_HEADERS.fallbackAttempts,
    "X-SZRoute-Fallback-Attempts"
  );
});

test("buildSZRouteResponseMetaHeaders emits the fallback-attempts count when > 0", () => {
  const h = buildSZRouteResponseMetaHeaders({ model: "gpt", provider: "openai", fallbackAttempts: 2 });
  assert.equal(h["X-SZRoute-Fallback-Attempts"], "2");
});

test("buildSZRouteResponseMetaHeaders omits the header when 0 / absent", () => {
  const none = buildSZRouteResponseMetaHeaders({ model: "gpt" });
  assert.equal(none["X-SZRoute-Fallback-Attempts"], undefined);
  const zero = buildSZRouteResponseMetaHeaders({ model: "gpt", fallbackAttempts: 0 });
  assert.equal(zero["X-SZRoute-Fallback-Attempts"], undefined);
});
