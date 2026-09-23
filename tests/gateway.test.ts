import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { PROVIDER_CATALOG, DEFAULT_COMBOS } from "../src/lib/providers/catalog";
import { compressPrompt, compressMessages, estimateTokenCount, ContentBlock } from "../src/lib/compression/engine";
import { resolveRouteTargets, detectProviderFromKey } from "../src/lib/gateway/router";
import { shouldTripCircuit, isProviderCoolingDown, tripProviderCircuit, getNextPooledKey } from "../src/lib/gateway/circuitBreaker";
import { OAUTH_PROVIDERS, generateCodeVerifier, generateCodeChallenge } from "../src/lib/oauth/providers";
import { refreshOAuthToken } from "../src/lib/oauth/refresh";

describe("SZRoute Provider Catalog & Virtual Combos", () => {
  test("catalog contains active free providers including Antigravity and Kiro", () => {
    assert.ok(PROVIDER_CATALOG.length >= 5, "Should have providers registered");
    const groq = PROVIDER_CATALOG.find((p) => p.id === "groq");
    const cerebras = PROVIDER_CATALOG.find((p) => p.id === "cerebras");
    const gemini = PROVIDER_CATALOG.find((p) => p.id === "gemini");
    const antigravity = PROVIDER_CATALOG.find((p) => p.id === "antigravity");
    const kiro = PROVIDER_CATALOG.find((p) => p.id === "kiro");

    assert.ok(groq && groq.freeTier.hasFree, "Groq should be in free tier");
    assert.ok(cerebras && cerebras.freeTier.hasFree, "Cerebras should be in free tier");
    assert.ok(gemini && gemini.freeTier.hasFree, "Gemini should be in free tier");
    assert.ok(antigravity && antigravity.freeTier.hasFree, "Antigravity should be in free tier");
    assert.ok(kiro && kiro.freeTier.hasFree, "Kiro should be in free tier");
  });

  test("gemini provider includes x-goog-api-client header", () => {
    const gemini = PROVIDER_CATALOG.find((p) => p.id === "gemini");
    assert.ok(gemini && gemini.customHeaders?.["x-goog-api-client"]);
  });

  test("openai is completely excluded from catalog and combos", () => {
    const hasOpenAIProvider = PROVIDER_CATALOG.some((p) => p.id === "openai");
    assert.equal(hasOpenAIProvider, false, "OpenAI should not exist in provider catalog");

    const hasOpenAITarget = DEFAULT_COMBOS.some((c) =>
      c.targets.some((t) => t.providerId === "openai")
    );
    assert.equal(hasOpenAITarget, false, "OpenAI should not exist in any combo targets");
  });

  test("default virtual combos are configured with priority failover", () => {
    const freeAuto = DEFAULT_COMBOS.find((c) => c.id === "free-auto");
    assert.ok(freeAuto, "free-auto combo should exist");
    assert.ok(freeAuto.targets.length >= 3, "free-auto should have at least 3 fallback targets");
    assert.equal(freeAuto.strategy, "priority");
  });
});

describe("OAuth 2.0 & Device Code Engine", () => {
  test("oauth providers registry contains Google, GitHub Copilot, HuggingFace, OpenRouter, Antigravity, Kiro", () => {
    assert.ok(OAUTH_PROVIDERS["google"]);
    assert.ok(OAUTH_PROVIDERS["github_copilot"]);
    assert.ok(OAUTH_PROVIDERS["huggingface"]);
    assert.ok(OAUTH_PROVIDERS["openrouter"]);
    assert.ok(OAUTH_PROVIDERS["antigravity"]);
    assert.ok(OAUTH_PROVIDERS["kiro"]);

    assert.equal(OAUTH_PROVIDERS["github_copilot"].type, "device_code");
    assert.equal(OAUTH_PROVIDERS["kiro"].type, "device_code");
    assert.equal(OAUTH_PROVIDERS["google"].type, "pkce");
    assert.equal(OAUTH_PROVIDERS["antigravity"].type, "pkce");
  });

  test("PKCE code verifier and challenge generation", async () => {
    const verifier = generateCodeVerifier(64);
    assert.equal(verifier.length, 64);
    const challenge = await generateCodeChallenge(verifier);
    assert.ok(challenge.length > 20, "Challenge should be generated");
    assert.ok(!challenge.includes("+"), "Challenge should be base64url safe");
  });

  test("detectProviderFromKey identifies key prefixes accurately", () => {
    assert.equal(detectProviderFromKey("gsk_test12345"), "groq");
    assert.equal(detectProviderFromKey("AIzaSyTest123"), "gemini");
    assert.equal(detectProviderFromKey("csk-test12345"), "cerebras");
    assert.equal(detectProviderFromKey("csk_test12345"), "cerebras");
    assert.equal(detectProviderFromKey("sk-ant-test123"), "anthropic");
    assert.equal(detectProviderFromKey("sk-or-v1-test123"), "openrouter");
    assert.equal(detectProviderFromKey("random_non_matching_token"), null);
  });

  test("refreshOAuthToken rejects empty or invalid refresh tokens safely", async () => {
    const resultEmpty = await refreshOAuthToken("antigravity", "");
    assert.equal(resultEmpty, null);

    const resultNull = await refreshOAuthToken("kiro", null as any);
    assert.equal(resultNull, null);

    const resultInvalidProvider = await refreshOAuthToken("non_existent_provider_xyz", "dummy_token");
    assert.equal(resultInvalidProvider, null);
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

  test("compressPrompt preserves Python/code block indentation inside code fences", () => {
    const pythonCode = "```python\ndef calculate_sum(numbers):\n    total = 0\n    for n in numbers:\n        total += n\n    return total\n```";
    const prompt = `Review this code:\n\n\n\n${pythonCode}\n\nPlease check performance.`;
    const result = compressPrompt(prompt);
    assert.ok(result.compressedText.includes("    total = 0"), "4-space indentation must be preserved");
    assert.ok(result.compressedText.includes("        total += n"), "8-space indentation must be preserved");
  });

  test("compressMessages preserves tool_calls, tool_call_id, and name attributes", () => {
    const messages = [
      {
        role: "assistant" as const,
        content: "Calling function now.",
        tool_calls: [
          {
            id: "call_abc123",
            type: "function",
            function: { name: "get_weather", arguments: "{\"city\":\"Tokyo\"}" },
          },
        ],
      },
      {
        role: "tool" as const,
        name: "get_weather",
        tool_call_id: "call_abc123",
        content: "Sunny, 22C",
      },
    ];

    const res = compressMessages(messages);
    assert.equal(res.messages.length, 2);
    assert.ok(Array.isArray((res.messages[0] as any).tool_calls), "tool_calls array must be preserved");
    assert.equal((res.messages[1] as any).tool_call_id, "call_abc123", "tool_call_id must be preserved");
    assert.equal((res.messages[1] as any).name, "get_weather", "tool name must be preserved");
  });

  test("estimateTokenCount handles boundary conditions safely", () => {
    assert.equal(estimateTokenCount(""), 0);
    assert.equal(estimateTokenCount(null as any), 0);
    assert.equal(estimateTokenCount(undefined as any), 0);
    assert.ok(estimateTokenCount("Hello world") >= 2);
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

describe("Circuit Breaker & Key Pooling Engine", () => {
  test("shouldTripCircuit correctly discriminates transient outages vs client errors", () => {
    // Client errors MUST NOT trip the provider circuit
    assert.equal(shouldTripCircuit(400), false, "400 Bad Request should not trip circuit");
    assert.equal(shouldTripCircuit(401), false, "401 Unauthorized should not trip circuit");
    assert.equal(shouldTripCircuit(403), false, "403 Forbidden should not trip circuit");
    assert.equal(shouldTripCircuit(404), false, "404 Not Found should not trip circuit");
    assert.equal(shouldTripCircuit(422), false, "422 Unprocessable Entity should not trip circuit");

    // Rate limits and server outages MUST trip the circuit
    assert.equal(shouldTripCircuit(429), true, "429 Too Many Requests must trip circuit");
    assert.equal(shouldTripCircuit(500), true, "500 Internal Server Error must trip circuit");
    assert.equal(shouldTripCircuit(502), true, "502 Bad Gateway must trip circuit");
    assert.equal(shouldTripCircuit(503), true, "503 Service Unavailable must trip circuit");
    assert.equal(shouldTripCircuit(504), true, "504 Gateway Timeout must trip circuit");
  });

  test("getNextPooledKey rotates keys safely using modulo", () => {
    const keys = ["key-1", "key-2", "key-3"];
    const first = getNextPooledKey("test-provider", keys);
    const second = getNextPooledKey("test-provider", keys);
    const third = getNextPooledKey("test-provider", keys);
    const fourth = getNextPooledKey("test-provider", keys);

    assert.equal(first, "key-1");
    assert.equal(second, "key-2");
    assert.equal(third, "key-3");
    assert.equal(fourth, "key-1");
  });
});

describe("Advanced Route Resolution & Provider Prefixing", () => {
  test("resolves slash-separated provider prefix models directly", () => {
    const groqRoute = resolveRouteTargets("groq/llama-3.3-70b-versatile");
    assert.equal(groqRoute.isCombo, false);
    assert.equal(groqRoute.targets[0].provider.id, "groq");
    assert.equal(groqRoute.targets[0].upstreamModelId, "llama-3.3-70b-versatile");

    const kiroRoute = resolveRouteTargets("kiro/claude-3-7-sonnet");
    assert.equal(kiroRoute.isCombo, false);
    assert.equal(kiroRoute.targets[0].provider.id, "kiro");
    assert.equal(kiroRoute.targets[0].upstreamModelId, "claude-3-7-sonnet");
  });

  test("resolves hyphen/underscore normalized model aliases", () => {
    // cerebras catalog model id is "llama3.3-70b" (no hyphen between llama and 3.3)
    const route = resolveRouteTargets("llama-3.3-70b");
    assert.equal(route.isCombo, false);
    assert.equal(route.targets[0].provider.id, "cerebras");
  });

  test("detectProviderFromKey correctly identifies API key signatures", () => {
    assert.equal(detectProviderFromKey("gsk_test123456"), "groq");
    assert.equal(detectProviderFromKey("csk-test123456"), "cerebras");
    assert.equal(detectProviderFromKey("sk-ant-api03-test"), "anthropic");
    assert.equal(detectProviderFromKey("AIzaSyTest123"), "gemini");
    assert.equal(detectProviderFromKey("together_test123"), "together");
    assert.equal(detectProviderFromKey("sk-or-v1-test"), "openrouter");
    assert.equal(detectProviderFromKey("random-bearer-token"), null);
  });
});

describe("Algorithmic Okapi BM25 Reranking Engine", () => {
  const tokenize = (text: string): string[] => text.toLowerCase().match(/\b[\w'-]+\b/g) || [];

  function computeBM25(query: string, documents: string[]) {
    const queryTokens = tokenize(query);
    const queryTerms = Array.from(new Set(queryTokens));
    const N = documents.length;
    if (N === 0) return [];

    const docItems = documents.map((text, index) => {
      const tokens = tokenize(text);
      const tfMap = new Map<string, number>();
      for (const t of tokens) {
        tfMap.set(t, (tfMap.get(t) || 0) + 1);
      }
      return { index, text, tokens, tfMap, length: tokens.length };
    });

    const totalLength = docItems.reduce((acc, d) => acc + d.length, 0);
    const avgdl = Math.max(1, totalLength / N);

    const dfMap = new Map<string, number>();
    for (const term of queryTerms) {
      let count = 0;
      for (const d of docItems) {
        if (d.tfMap.has(term)) count++;
      }
      dfMap.set(term, count);
    }

    const k1 = 1.2;
    const b = 0.75;

    return docItems.map((doc) => {
      let bm25Score = 0;
      for (const term of queryTerms) {
        const f = doc.tfMap.get(term) || 0;
        if (f === 0) continue;
        const n = dfMap.get(term) || 0;
        const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
        const numerator = f * (k1 + 1);
        const denominator = f + k1 * (1 - b + b * (doc.length / avgdl));
        bm25Score += idf * (numerator / denominator);
      }
      const relevance_score = bm25Score > 0 ? Number((bm25Score / (bm25Score + 1.0)).toFixed(6)) : 0;
      return { index: doc.index, relevance_score, text: doc.text };
    }).sort((a, b) => b.relevance_score - a.relevance_score || a.index - b.index);
  }

  test("ranks exact query matches higher than partial and irrelevant documents", () => {
    const query = "quantum computing algorithms";
    const docs = [
      "Quantum computing utilizes quantum superposition and entanglement to run algorithms exponentially faster.",
      "Classical algorithms for sorting include quicksort and mergesort.",
      "The weather in Tokyo is sunny today with a gentle breeze."
    ];

    const results = computeBM25(query, docs);
    assert.equal(results[0].index, 0, "Most relevant document must rank first");
    assert.equal(results[1].index, 1, "Partially relevant document must rank second");
    assert.equal(results[2].index, 2, "Irrelevant document must rank last");
    assert.equal(results[2].relevance_score, 0, "Completely disjoint document must score 0");
    assert.ok(results[0].relevance_score > results[1].relevance_score);
  });

  test("normalizes length so concise relevant docs score higher than bloated documents", () => {
    const query = "deep reinforcement learning";
    const conciseDoc = "A survey of deep reinforcement learning agents and value iteration.";
    const bloatedDoc = "Today we discuss deep reinforcement learning agents. " + "Here are irrelevant filler sentences without meaning. ".repeat(40);

    const results = computeBM25(query, [conciseDoc, bloatedDoc]);
    assert.equal(results[0].text, conciseDoc, "Concise document must score higher due to length normalization");
  });

  test("scores are strictly bounded within [0, 1)", () => {
    const query = "test query sample";
    const docs = ["test query sample", "test test test query query query sample sample sample"];
    const results = computeBM25(query, docs);
    for (const r of results) {
      assert.ok(r.relevance_score >= 0, "Relevance score cannot be negative");
      assert.ok(r.relevance_score < 1.0, "Relevance score must be strictly less than 1.0");
    }
  });
});
