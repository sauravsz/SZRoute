# ⚡ Oh My Pi (omp) Coding Agent — SZRoute Integration Guide

SZRoute serves as the high-throughput, serverless AI gateway for the **Oh My Pi (omp)** coding harness. Connect `omp` to **160+ AI providers (50+ free tiers)** with automatic multi-tier failover and **RTK + Caveman token compression** (15%–95% input token reduction).

---

## 🚀 Quick Setup for omp

Export your SZRoute deployment endpoint in your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
# Point Oh My Pi (omp) coding agent to SZRoute Edge Gateway
export OPENAI_BASE_URL="https://your-szroute.vercel.app/v1"
export ANTHROPIC_BASE_URL="https://your-szroute.vercel.app/v1"
export OPENAI_API_KEY="szroute-free"
export ANTHROPIC_API_KEY="szroute-free"
```

### Launch omp with Virtual Combos

```bash
# 1. Zero-Cost Auto-Free Combo (Groq -> Cerebras -> Gemini -> OpenRouter)
omp --model free-auto

# 2. Premier Coding Specialist Combo (Claude 3.7 -> DeepSeek R1 -> Codestral -> o3-mini)
omp --model code-expert

# 3. Blazing Fast Reasoning Combo (Cerebras & Groq at 2,000+ tok/s)
omp --model fast-reasoning
```

---

## 🧠 Multimodal Prompts & Image Routing

When the `omp` coding agent sends multimodal messages containing screenshots, UI diagrams, and code context:

```json
{
  "role": "user",
  "content": [
    {
      "type": "text",
      "text": "Analyze this interface layout and refactor the Tailwind CSS..."
    },
    {
      "type": "image_url",
      "image_url": { "url": "data:image/png;base64,..." }
    }
  ]
}
```

- **RTK Structural Compression**: Recursively compresses the textual prompts, stripping markdown redundancies, AI boilerplate, and compacting JSON payloads.
- **Multimodal Block Preservation**: Safely preserves base64 image payloads (`image_url`) without byte corruption or degradation.
- **Automated Fallback**: If a target provider does not support vision (e.g. text-only models), SZRoute automatically fails over to multimodal-capable targets (`gemini-2.5-flash`, `gpt-4o`, `claude-3-7-sonnet`).

---

## 🛡️ Edge Auto-Failover Protocol

If an active provider hits rate limits (`429`), server errors (`5xx`), or network timeouts during coding tasks, SZRoute automatically:
1. Logs the transient error to the Traffic Inspector.
2. Promotes the next priority target in the combo chain within milliseconds.
3. Transparently streams the completion to `omp` via Server-Sent Events (SSE).
