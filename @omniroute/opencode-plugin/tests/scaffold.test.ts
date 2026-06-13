import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import {
  SZRoutePlugin,
  SZROUTE_PROVIDER_KEY,
  DEFAULT_MODEL_CACHE_TTL_MS,
  resolveSZRoutePluginOptions,
} from "../src/index.js";

test("scaffold: exports public surface", () => {
  assert.equal(
    typeof SZRoutePlugin,
    "function",
    "SZRoutePlugin must be a function (Plugin factory)"
  );
  assert.equal(SZROUTE_PROVIDER_KEY, "szroute");
  assert.equal(DEFAULT_MODEL_CACHE_TTL_MS, 300_000);
});

test("scaffold: default export is v1 plugin shape { id, server: SZRoutePlugin }", async () => {
  const mod = await import("../src/index.js");
  assert.equal(typeof mod.default, "object");
  assert.equal(mod.default.id, "@szroute/opencode-plugin");
  assert.equal(mod.default.server, mod.SZRoutePlugin);
});

test("resolveSZRoutePluginOptions: defaults", () => {
  const r = resolveSZRoutePluginOptions();
  assert.equal(r.providerId, "szroute");
  assert.equal(r.displayName, "SZRoute");
  assert.equal(r.modelCacheTtl, 300_000);
  assert.equal(r.baseURL, undefined);
});

test("resolveSZRoutePluginOptions: custom providerId derives displayName", () => {
  const r = resolveSZRoutePluginOptions({ providerId: "szroute-preprod" });
  assert.equal(r.providerId, "szroute-preprod");
  assert.equal(r.displayName, "SZRoute (szroute-preprod)");
});

test("resolveSZRoutePluginOptions: explicit displayName wins", () => {
  const r = resolveSZRoutePluginOptions({
    providerId: "szroute-x",
    displayName: "Custom Label",
  });
  assert.equal(r.displayName, "Custom Label");
});

test("resolveSZRoutePluginOptions: invalid TTL falls back to default", () => {
  assert.equal(resolveSZRoutePluginOptions({ modelCacheTtl: 0 }).modelCacheTtl, 300_000);
  assert.equal(resolveSZRoutePluginOptions({ modelCacheTtl: -1 }).modelCacheTtl, 300_000);
});

test("resolveSZRoutePluginOptions: positive TTL respected", () => {
  assert.equal(resolveSZRoutePluginOptions({ modelCacheTtl: 60_000 }).modelCacheTtl, 60_000);
});

test("SZRoutePlugin: returns an empty hooks object (scaffold)", async () => {
  const fakeCtx = {} as Parameters<typeof SZRoutePlugin>[0];
  const hooks = await SZRoutePlugin(fakeCtx);
  assert.equal(typeof hooks, "object");
  assert.notEqual(hooks, null);
});

test("scaffold: CJS default export resolves via require() with v1 shape", () => {
  const require_ = createRequire(import.meta.url);
  const cjs = require_("../dist/index.cjs");
  // after cjsInterop:true, default export is on cjs.default
  assert.strictEqual(typeof cjs.default, "object");
  assert.strictEqual(cjs.default.id, "@szroute/opencode-plugin");
  assert.strictEqual(typeof cjs.default.server, "function");
});
