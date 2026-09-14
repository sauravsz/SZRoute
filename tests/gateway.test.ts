import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { PROVIDER_CATALOG, DEFAULT_COMBOS } from "../src/lib/providers/catalog";
import { compressPrompt, compressMessages, estimateTokenCount, ContentBlock } from "../src/lib/compression/engine";
import { resolveRouteTargets } from "../src/lib/gateway/router";

describe("SZRoute Provider Catalog & Virtual Combos", () => {
  test("catalog contains top free and commercial providers", () => {
    assert.ok(PROVIDER_CATALOG.length >= 10, "Should have providers registered");
    const groq = PROVIDER_CATALOG.find((p) => p.id === "groq");
    const cerebras = PROVIDER_CATALOG.find((p) => p.id === "cerebras");
    const gemini = PROVIDER_CATALOG.find((p) => p.id === "gemini");
    const openrouter = PROVIDER_CATALOG.find((p) => p.id === "openrouter");

    assert.ok(groq && groq.freeTier.hasFree, "Groq should be in free tier");
    assert.ok(cerebras && cerebras.freeTier.hasFree, "Cerebras should be in free tier");
    assert.ok(gemini && gemini.freeTier.hasFree, "Gemini should be in free tier");
    assert.ok(openrouter && openrouter.freeTier.hasFree, "OpenRouter should be in free tier");
  });

  test("gemini provider includes x-goog-api-client header", () => {
    const gemini = PROVIDER_CATALOG.find((p) => p.id === "gemini");
    assert.ok(gemini && gemini.customHeaders?.["x-goog-api-client"]);
  });

  test("default virtual combos are configured with priority failover", () => {
    const freeAuto = DEFAULT_COMBOS.find((c) => c.id === "free-auto");
    assert.ok(freeAuto, "free-auto combo should exist");
    assert.ok(freeAuto.targets.length >= 3, "free-auto should have at least 3 fallback targets");
    assert.equal(freeAuto.strategy, "priority");
  });
});

describe("RTK + Caveman Token Compression Engine (Optimized Single-Pass)", () => {
  test("estimateTokenCount computes accurate heuristics", () => {
    const tokens = estimateTokenCount("Hello world, this is a test prompt for token estimation.");
    assert.ok(tokens > 5 && tokens < 20, "Token count heuristic within reasonable range");
  });

  test("compressPrompt strips AI boilerplates and whitespace in single pass", () => {
    const rawPrompt = `
    Please note that as an AI language model, I would like you to write a clean function.


    In order to accomplish this, could you please make sure to test it.
    `;

    const result = compressPrompt(rawPrompt, {
      enableRtk: true,
      enableCaveman: true,
      stripMarkdownSpacing: true,
      level: "standard",
    });

    assert.ok(result.tokensSaved > 0, "Should save tokens");
    assert.ok(result.percentSaved > 10, "Should save at least 10% tokens on verbose prompt");
    assert.ok(!result.compressedText.includes("as an ai language model"), "Should purge AI boilerplate");
  });

  test("compressMessages recursively compresses multimodal/vision content blocks for omp agent", () => {
    const messages = [
      {
        role: "user" as const,
        content: [
          {
            type: "text" as const,
            text: "Please note that as an AI language model, please explain this diagram.",
          },
          {
            type: "image_url" as const,
            image_url: { url: "https://example.com/diagram.png" },
          },
        ],
      },
    ];

    const result = compressMessages(messages);
    assert.equal(result.messages.length, 1);
    assert.ok(Array.isArray(result.messages[0].content));
    const blocks = result.messages[0].content as ContentBlock[];
    const firstBlock = blocks[0];
    assert.ok(firstBlock && "text" in firstBlock && typeof firstBlock.text === "string");
    assert.ok(!firstBlock.text.includes("as an ai language model"), "Should compress inner text block of array");
    assert.ok(result.tokensSaved > 0, "Should register saved tokens on multimodal block");
  });

  test("compressPrompt minifies embedded JSON blocks", () => {
    const jsonPrompt = `Config:
\`\`\`json
{
  "key1": "value1",
  "key2": "value2",
  "nested": {
    "num": 42
  }
}
\`\`\`
`;

    const result = compressPrompt(jsonPrompt, { compactJson: true });
    assert.ok(result.rulesApplied.includes("rtk-json-compaction"), "Should apply JSON compaction");
    assert.ok(result.compressedText.includes('{"key1":"value1","key2":"value2"'), "JSON should be minified");
  });

  test("compressMessages deduplicates repeated system prompts in conversations", () => {
    const messages = [
      { role: "system" as const, content: "You are an assistant." },
      { role: "user" as const, content: "Hello" },
      { role: "assistant" as const, content: "Hi" },
      { role: "system" as const, content: "You are an assistant." },
      { role: "user" as const, content: "How are you?" },
    ];

    const result = compressMessages(messages, { deduplicateContext: true });
    assert.equal(result.messages.length, 4, "Duplicate system message should be deduplicated");
    assert.ok(result.rulesApplied.includes("rtk-system-prompt-deduplication"));
  });
});

describe("Gateway Route Resolution & Fallback Logic", () => {
  test("resolves direct provider model", () => {
    const route = resolveRouteTargets("llama-3.3-70b-versatile");
    assert.equal(route.isCombo, false);
    assert.equal(route.targets.length, 1);
    assert.equal(route.targets[0].provider.id, "groq");
  });

  test("resolves virtual combo targets in priority order", () => {
    const route = resolveRouteTargets("free-auto");
    assert.equal(route.isCombo, true);
    assert.ok(route.targets.length >= 3);
    assert.equal(route.targets[0].priority, 1);
    assert.ok(route.targets[0].priority <= route.targets[1].priority);
  });

  test("gracefully falls back to free-auto if model not recognized", () => {
    const route = resolveRouteTargets("unknown-custom-model-xyz");
    assert.equal(route.isCombo, true);
    assert.ok(route.targets.length > 0);
  });
});
