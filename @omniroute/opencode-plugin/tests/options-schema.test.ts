/**
 * T-08 options-schema tests.
 *
 * Covers `parseSZRoutePluginOptions(opts)` — the strict Zod gate that
 * validates the second-arg `PluginOptions` bag from opencode.json before
 * any hook is wired. Anti-pattern checklist mirrored here:
 *
 *  - `null` / `undefined` must collapse to `{}` (defaults apply downstream).
 *  - Unknown keys must THROW (`.strict()` catches opencode.json typos).
 *  - Validation runs at parse time, not import time (module loads cleanly).
 */

import test from "node:test";
import assert from "node:assert/strict";
import { parseSZRoutePluginOptions } from "../src/index.js";

test("parseSZRoutePluginOptions: undefined → {}", () => {
  assert.deepEqual(parseSZRoutePluginOptions(undefined), {});
});

test("parseSZRoutePluginOptions: null → {}", () => {
  assert.deepEqual(parseSZRoutePluginOptions(null), {});
});

test("parseSZRoutePluginOptions: empty object → {}", () => {
  assert.deepEqual(parseSZRoutePluginOptions({}), {});
});

test("parseSZRoutePluginOptions: valid providerId → returns it", () => {
  const r = parseSZRoutePluginOptions({ providerId: "szroute-preprod" });
  assert.equal(r.providerId, "szroute-preprod");
});

test("parseSZRoutePluginOptions: invalid providerId (special chars) → throws", () => {
  assert.throws(
    () => parseSZRoutePluginOptions({ providerId: "szroute prod!" }),
    /providerId.*slug/i
  );
});

test("parseSZRoutePluginOptions: empty providerId → throws", () => {
  assert.throws(() => parseSZRoutePluginOptions({ providerId: "" }), /providerId/i);
});

test("parseSZRoutePluginOptions: valid modelCacheTtl → returns it", () => {
  const r = parseSZRoutePluginOptions({ modelCacheTtl: 60_000 });
  assert.equal(r.modelCacheTtl, 60_000);
});

test("parseSZRoutePluginOptions: negative modelCacheTtl → throws", () => {
  assert.throws(() => parseSZRoutePluginOptions({ modelCacheTtl: -1 }), /modelCacheTtl/i);
});

test("parseSZRoutePluginOptions: zero modelCacheTtl → throws (positive required)", () => {
  assert.throws(() => parseSZRoutePluginOptions({ modelCacheTtl: 0 }), /modelCacheTtl/i);
});

test("parseSZRoutePluginOptions: invalid baseURL (not a URL) → throws", () => {
  assert.throws(() => parseSZRoutePluginOptions({ baseURL: "not-a-url" }), /baseURL/i);
});

test("parseSZRoutePluginOptions: unknown key → throws (strict mode catches typos)", () => {
  assert.throws(
    () =>
      parseSZRoutePluginOptions({
        providerId: "szroute",
        provider_id: "typo-here",
      }),
    /provider_id|unrecognized/i
  );
});

test("parseSZRoutePluginOptions: all four fields populated correctly → returns them", () => {
  const opts = {
    providerId: "szroute-prod",
    displayName: "SZRoute Production",
    modelCacheTtl: 120_000,
    baseURL: "https://or.example.com/v1",
  };
  const r = parseSZRoutePluginOptions(opts);
  assert.deepEqual(r, opts);
});

test("parseSZRoutePluginOptions: error message lists every issue path", () => {
  // Two bad fields at once → error string should mention BOTH.
  try {
    parseSZRoutePluginOptions({
      providerId: "",
      baseURL: "garbage",
    });
    assert.fail("expected throw");
  } catch (err) {
    const msg = (err as Error).message;
    assert.match(msg, /providerId/);
    assert.match(msg, /baseURL/);
  }
});

test("parseSZRoutePluginOptions: module import alone does NOT throw", async () => {
  // Re-importing the entry must not trigger validation; validation only fires
  // on explicit parseSZRoutePluginOptions / SZRoutePlugin invocation.
  const mod = await import("../src/index.js");
  assert.equal(typeof mod.parseSZRoutePluginOptions, "function");
});
