export interface CompressionOptions {
  enableRtk?: boolean;
  enableCaveman?: boolean;
  stripMarkdownSpacing?: boolean;
  deduplicateContext?: boolean;
  compactJson?: boolean;
  level?: "gentle" | "standard" | "aggressive";
}

export interface CompressionResult {
  originalText: string;
  compressedText: string;
  originalTokens: number;
  compressedTokens: number;
  tokensSaved: number;
  percentSaved: number;
  rulesApplied: string[];
}

export type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail?: string } }
  | { type: "image"; source?: unknown }
  | { type: string; [key: string]: unknown };

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool" | "function";
  content: string | ContentBlock[];
  name?: string;
}

export interface CompressedMessagesResult {
  messages: ChatMessage[];
  originalTokens: number;
  compressedTokens: number;
  tokensSaved: number;
  percentSaved: number;
  rulesApplied: string[];
}

/**
 * Fast and accurate token count estimation (GPT/Claude/Gemini compatible heuristic)
 */
export function estimateTokenCount(text: string): number {
  if (!text || typeof text !== "string") return 0;
  const words = text.trim().split(/\s+/).length;
  const chars = text.length;
  const estimated = Math.ceil((chars * 0.26) + (words * 0.2));
  return Math.max(1, estimated);
}

const COMMON_FILLER_PATTERNS: Array<{ regex: RegExp; replacement: string; rule: string }> = [
  {
    regex: /\b(please note that|it is important to note that|it should be noted that)\b/gi,
    replacement: "Note:",
    rule: "caveman-filler-removal",
  },
  {
    regex: /\b(in order to|with the aim of)\b/gi,
    replacement: "to",
    rule: "caveman-phrase-simplifier",
  },
  {
    regex: /\b(as an ai language model|as a large language model|i am an ai)\b/gi,
    replacement: "",
    rule: "rtk-ai-boilerplate-purge",
  },
  {
    regex: /\b(could you please|would you please|can you please|please kindly|kindly)\b/gi,
    replacement: "",
    rule: "caveman-politeness-trim",
  },
  {
    regex: /\b(for the purpose of|with reference to|in regard to)\b/gi,
    replacement: "for",
    rule: "caveman-preamble-trim",
  },
  {
    regex: /\b(due to the fact that|owing to the fact that)\b/gi,
    replacement: "because",
    rule: "caveman-conjunction-compact",
  },
];

export function compressPrompt(
  text: string,
  options: CompressionOptions = {
    enableRtk: true,
    enableCaveman: true,
    stripMarkdownSpacing: true,
    deduplicateContext: true,
    compactJson: true,
    level: "standard",
  }
): CompressionResult {
  if (!text || typeof text !== "string") {
    return {
      originalText: text || "",
      compressedText: text || "",
      originalTokens: 0,
      compressedTokens: 0,
      tokensSaved: 0,
      percentSaved: 0,
      rulesApplied: [],
    };
  }

  const originalTokens = estimateTokenCount(text);
  let processed = text;
  const rulesApplied: string[] = [];

  // 1. RTK Markdown Spacing & Newline Normalization
  if (options.stripMarkdownSpacing !== false) {
    const beforeLength = processed.length;
    processed = processed.replace(/\n{3,}/g, "\n\n");
    processed = processed.replace(/[ \t]+$/gm, "");
    processed = processed.replace(/[ \t]{2,}/g, " ");
    if (processed.length < beforeLength) {
      rulesApplied.push("rtk-whitespace-minification");
    }
  }

  // 2. Compact JSON blocks if present
  if (options.compactJson !== false) {
    processed = processed.replace(/```json\s*([\s\S]*?)\s*```/g, (match, jsonStr) => {
      try {
        const parsed = JSON.parse(jsonStr);
        rulesApplied.push("rtk-json-compaction");
        return "```json\n" + JSON.stringify(parsed) + "\n```";
      } catch {
        return match;
      }
    });
  }

  // 3. Caveman NLP Minification
  if (options.enableCaveman !== false) {
    for (const { regex, replacement, rule } of COMMON_FILLER_PATTERNS) {
      if (regex.test(processed)) {
        processed = processed.replace(regex, replacement);
        if (!rulesApplied.includes(rule)) {
          rulesApplied.push(rule);
        }
      }
    }

    if (options.level === "aggressive") {
      processed = processed.replace(/(\!|\?){2,}/g, "$1");
      processed = processed.replace(/[-=]{4,}/g, "---");
      rulesApplied.push("caveman-aggressive-punctuation");
    }
  }

  const compressedTokens = estimateTokenCount(processed);
  const tokensSaved = Math.max(0, originalTokens - compressedTokens);
  const percentSaved = originalTokens > 0 ? Math.round((tokensSaved / originalTokens) * 100) : 0;

  return {
    originalText: text,
    compressedText: processed,
    originalTokens,
    compressedTokens,
    tokensSaved,
    percentSaved,
    rulesApplied,
  };
}

export function compressMessages(
  messages: ChatMessage[],
  options?: CompressionOptions
): CompressedMessagesResult {
  if (!messages || !Array.isArray(messages)) {
    return {
      messages: [],
      originalTokens: 0,
      compressedTokens: 0,
      tokensSaved: 0,
      percentSaved: 0,
      rulesApplied: [],
    };
  }

  let totalOriginalTokens = 0;
  let totalCompressedTokens = 0;
  const allRules: Set<string> = new Set();
  const seenSystemPrompts = new Set<string>();

  const compressedMessages: ChatMessage[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    // Case 1: Plain string content
    if (typeof msg.content === "string") {
      if (msg.role === "system" && options?.deduplicateContext !== false) {
        const trimmed = msg.content.trim();
        if (seenSystemPrompts.has(trimmed)) {
          allRules.add("rtk-system-prompt-deduplication");
          totalOriginalTokens += estimateTokenCount(msg.content);
          continue;
        }
        seenSystemPrompts.add(trimmed);
      }

      const result = compressPrompt(msg.content, options);
      totalOriginalTokens += result.originalTokens;
      totalCompressedTokens += result.compressedTokens;
      result.rulesApplied.forEach((r) => allRules.add(r));

      compressedMessages.push({
        ...msg,
        content: result.compressedText,
      });
    }
    // Case 2: Multi-part vision / content block array
    else if (Array.isArray(msg.content)) {
      const newBlocks: ContentBlock[] = [];

      for (const block of msg.content) {
        if (typeof block === "object" && block !== null && block.type === "text" && typeof block.text === "string") {
          const result = compressPrompt(block.text, options);
          totalOriginalTokens += result.originalTokens;
          totalCompressedTokens += result.compressedTokens;
          result.rulesApplied.forEach((r) => allRules.add(r));
          newBlocks.push({
            ...block,
            text: result.compressedText,
          });
        } else {
          // Pass image/tool block through, calculate standard token weight
          const tokenEst = estimateTokenCount(JSON.stringify(block));
          totalOriginalTokens += tokenEst;
          totalCompressedTokens += tokenEst;
          newBlocks.push(block);
        }
      }

      compressedMessages.push({
        ...msg,
        content: newBlocks,
      });
    }
    // Case 3: Pass-through unknown object shape
    else {
      const tokenEst = estimateTokenCount(JSON.stringify(msg.content));
      totalOriginalTokens += tokenEst;
      totalCompressedTokens += tokenEst;
      compressedMessages.push(msg);
    }
  }

  const tokensSaved = Math.max(0, totalOriginalTokens - totalCompressedTokens);
  const percentSaved = totalOriginalTokens > 0 ? Math.round((tokensSaved / totalOriginalTokens) * 100) : 0;

  return {
    messages: compressedMessages,
    originalTokens: totalOriginalTokens,
    compressedTokens: totalCompressedTokens,
    tokensSaved,
    percentSaved,
    rulesApplied: Array.from(allRules),
  };
}
