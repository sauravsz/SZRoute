import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSZRouteResponseMetaHeaders,
  buildSZRouteSseMetadataComment,
  formatSZRouteCost,
  getSZRouteTokenCounts,
} from "../../src/domain/szrouteResponseMeta.ts";

test("getSZRouteTokenCounts normalizes common usage shapes", () => {
  assert.deepEqual(
    getSZRouteTokenCounts({
      prompt_tokens: 12,
      completion_tokens: 5,
    }),
    { input: 12, output: 5 }
  );
  assert.deepEqual(
    getSZRouteTokenCounts({
      input_tokens: "9",
      output_tokens: "4",
    }),
    { input: 9, output: 4 }
  );
});

test("buildSZRouteResponseMetaHeaders formats provider alias, tokens, latency, and cost", () => {
  const headers = buildSZRouteResponseMetaHeaders({
    provider: "claude",
    model: "claude-sonnet-4-6",
    cacheHit: true,
    latencyMs: 1234.6,
    usage: {
      prompt_tokens: 11,
      completion_tokens: 7,
    },
    costUsd: 0.00123456789,
  });

  assert.equal(headers["X-SZRoute-Provider"], "cc");
  assert.equal(headers["X-SZRoute-Model"], "claude-sonnet-4-6");
  assert.equal(headers["X-SZRoute-Cache-Hit"], "true");
  assert.equal(headers["X-SZRoute-Latency-Ms"], "1235");
  assert.equal(headers["X-SZRoute-Tokens-In"], "11");
  assert.equal(headers["X-SZRoute-Tokens-Out"], "7");
  assert.equal(headers["X-SZRoute-Response-Cost"], "0.0012345679");
});

test("buildSZRouteSseMetadataComment emits comment lines compatible with SSE", () => {
  const comment = buildSZRouteSseMetadataComment({
    provider: "openai",
    model: "gpt-4o-mini",
    usage: {
      prompt_tokens: 4,
      completion_tokens: 2,
    },
    latencyMs: 50,
    costUsd: formatSZRouteCost(0),
  });

  assert.match(comment, /^: x-szroute-cache-hit=false/m);
  assert.match(comment, /^: x-szroute-provider=openai/m);
  assert.match(comment, /^: x-szroute-model=gpt-4o-mini/m);
  assert.match(comment, /^: x-szroute-tokens-in=4/m);
  assert.match(comment, /^: x-szroute-tokens-out=2/m);
  assert.match(comment, /^: x-szroute-response-cost=0\.0000000000/m);
});
