import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_SZROUTE_BASE_URL,
  resolveSZRouteBaseUrl,
} from "../../src/shared/utils/resolveSZRouteBaseUrl.ts";

test("resolveSZRouteBaseUrl prefers SZROUTE_BASE_URL", () => {
  assert.equal(
    resolveSZRouteBaseUrl({
      SZROUTE_BASE_URL: "https://internal.example.com/",
      BASE_URL: "https://base.example.com",
      NEXT_PUBLIC_BASE_URL: "https://public.example.com",
    }),
    "https://internal.example.com"
  );
});

test("resolveSZRouteBaseUrl falls back to BASE_URL", () => {
  assert.equal(
    resolveSZRouteBaseUrl({
      BASE_URL: "https://base.example.com/",
      NEXT_PUBLIC_BASE_URL: "https://public.example.com",
    }),
    "https://base.example.com"
  );
});

test("resolveSZRouteBaseUrl falls back to NEXT_PUBLIC_BASE_URL", () => {
  assert.equal(
    resolveSZRouteBaseUrl({
      NEXT_PUBLIC_BASE_URL: "https://public.example.com/",
    }),
    "https://public.example.com"
  );
});

test("resolveSZRouteBaseUrl ignores blank values", () => {
  assert.equal(
    resolveSZRouteBaseUrl({
      SZROUTE_BASE_URL: "   ",
      BASE_URL: "",
      NEXT_PUBLIC_BASE_URL: " https://public.example.com/ ",
    }),
    "https://public.example.com"
  );
});

test("resolveSZRouteBaseUrl uses the default localhost fallback", () => {
  assert.equal(resolveSZRouteBaseUrl({}), DEFAULT_SZROUTE_BASE_URL);
});
