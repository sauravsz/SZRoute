export interface CompressionOptions {
  enableRtk?: boolean;
  enableCaveman?: boolean;
  stripMarkdownSpacing?: boolean;
  compactJson?: boolean;
  deduplicateContext?: boolean;
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

export interface ContentBlockText {
  type: "text";
  text: string;
}

export interface ContentBlockImage {
  type: "image_url" | "image";
  image_url?: { url: string };
  source?: { type: string; media_type: string; data: string };
}

export type ContentBlock = ContentBlockText | ContentBlockImage | Record<string, unknown>;

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | ContentBlock[];
}

// Pre-compiled regex patterns (Cut #2: Single-pass compiled regex execution)
const RE_EXCESS_BLANK_LINES = /\n{3,}/g;
const RE_EXCESS_HORIZONTAL_SPACES = /[ \t]{2,}/g;
const RE_TRAILING_SPACES = /[ \t]+$/gm;
const RE_JSON_BLOCKS = /```(?:json)?\s*([\s\S]*?)\s*```/gi;

const RE_AI_BOILERPLATES = [
  /please note that as an ai language model,?\s*/gi,
  /as an ai,? (?:i can|i am able to|i will)\s*/gi,
  /i am just an ai language model,?\s*/gi,
  /in order to accomplish this task,?\s*/gi,
  /for the purpose of (?:maintaining|ensuring),?\s*/gi,
  /due to the fact that\s*/gi,
  /it is important to note that\s*/gi,
];

const RE_FILLER_PHRASES = [
  /\bkindly\b\s*/gi,
  /\bplease make sure to\b\s*/gi,
  /\bwould you be so kind as to\b\s*/gi,
  /\bcould you please\b\s*/gi,
  /\bi would like you to\b\s*/gi,
  /\bfor your information,?\b\s*/gi,
];

/**
 * Heuristic fast token count estimation (~4 chars/token in English, ~1.5 chars/token for code/JSON)
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 3.8));
}

/**
 * Compresses an input prompt string using stacked RTK + Caveman compression
 */
export function compressPrompt(
  prompt: string,
  options: CompressionOptions = {}
): CompressionResult {
  if (!prompt || typeof prompt !== "string") {
    return {
      originalText: prompt || "",
      compressedText: prompt || "",
      originalTokens: 0,
      compressedTokens: 0,
      tokensSaved: 0,
      percentSaved: 0,
      rulesApplied: [],
    };
  }

  const {
    enableRtk = true,
    enableCaveman = true,
    stripMarkdownSpacing = true,
    compactJson = true,
    level = "standard",
  } = options;

  let current = prompt;
  const applied: string[] = [];
  const originalTokens = estimateTokenCount(prompt);

  // 1. RTK: Structural Markdown & Whitespace Normalization
  if (stripMarkdownSpacing) {
    const before = current;
    current = current
      .replace(RE_EXCESS_BLANK_LINES, "\n\n")
      .replace(RE_EXCESS_HORIZONTAL_SPACES, " ")
      .replace(RE_TRAILING_SPACES, "");
    if (current !== before) applied.push("rtk-whitespace-minification");
  }

  // 2. RTK: JSON Payload Compaction
  if (compactJson) {
    const before = current;
    current = current.replace(RE_JSON_BLOCKS, (match, jsonContent) => {
      try {
        const parsed = JSON.parse(jsonContent);
        return "```json\n" + JSON.stringify(parsed) + "\n```";
      } catch {
        return match;
      }
    });
    if (current !== before) applied.push("rtk-json-compaction");
  }

  // 3. Caveman: NLP Filler & Conversational Fluff Removal
  if (enableCaveman) {
    const before = current;
    for (const pat of RE_FILLER_PHRASES) {
      current = current.replace(pat, "");
    }
    if (current !== before) applied.push("caveman-filler-removal");
  }

  // 4. RTK: AI Boilerplate & Metacognitive Noise Purge
  if (enableRtk) {
    const before = current;
    for (const pat of RE_AI_BOILERPLATES) {
      current = current.replace(pat, "");
    }
    if (level === "aggressive") {
      current = current.replace(/^(?:sure|certainly|of course|here is|here are)[\s,:!.-]*/gim, "");
    }
    if (current !== before) applied.push("rtk-ai-boilerplate-purge");
  }

  current = current.trim();

  const compressedTokens = estimateTokenCount(current);
  const tokensSaved = Math.max(0, originalTokens - compressedTokens);
  const percentSaved =
    originalTokens > 0 ? Math.round((tokensSaved / originalTokens) * 100) : 0;

  return {
    originalText: prompt,
    compressedText: current,
    originalTokens,
    compressedTokens,
    tokensSaved,
    percentSaved,
    rulesApplied: applied,
  };
}

/**
 * Compresses an array of ChatMessages for multi-turn conversations and multimodal vision blocks
 */
export function compressMessages(
  messages: ChatMessage[],
  options: CompressionOptions = {}
): {
  messages: ChatMessage[];
  tokensSaved: number;
  percentSaved: number;
  rulesApplied: string[];
} {
  const { deduplicateContext = true } = options;
  let totalOriginal = 0;
  let totalCompressed = 0;
  const allRules = new Set<string>();

  let working = [...messages];

  // System Prompt Deduplication
  if (deduplicateContext) {
    const seenSystemPrompts = new Set<string>();
    working = working.filter((m) => {
      if (m.role === "system") {
        const str = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
        if (seenSystemPrompts.has(str)) {
          allRules.add("rtk-system-prompt-deduplication");
          return false;
        }
        seenSystemPrompts.add(str);
      }
      return true;
    });
  }

  const processedMessages: ChatMessage[] = working.map((msg) => {
    // 1. Text-only content
    if (typeof msg.content === "string") {
      const res = compressPrompt(msg.content, options);
      totalOriginal += res.originalTokens;
      totalCompressed += res.compressedTokens;
      res.rulesApplied.forEach((r) => allRules.add(r));
      return { role: msg.role, content: res.compressedText };
    }

    // 2. Multimodal / Vision Array Content Blocks
    if (Array.isArray(msg.content)) {
      const processedBlocks: ContentBlock[] = msg.content.map((block) => {
        if (block && typeof block === "object" && "type" in block && block.type === "text" && "text" in block && typeof block.text === "string") {
          const res = compressPrompt(block.text, options);
          totalOriginal += res.originalTokens;
          totalCompressed += res.compressedTokens;
          res.rulesApplied.forEach((r) => allRules.add(r));
          return { type: "text", text: res.compressedText };
        }
        // Preserve image and other blocks as-is
        const blockStr = JSON.stringify(block);
        const tok = estimateTokenCount(blockStr);
        totalOriginal += tok;
        totalCompressed += tok;
        return block;
      });

      return { role: msg.role, content: processedBlocks };
    }

    return msg;
  });

  const tokensSaved = Math.max(0, totalOriginal - totalCompressed);
  const percentSaved =
    totalOriginal > 0 ? Math.round((tokensSaved / totalOriginal) * 100) : 0;

  return {
    messages: processedMessages,
    tokensSaved,
    percentSaved,
    rulesApplied: Array.from(allRules),
  };
}
