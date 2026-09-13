# 🚀 SZRoute — The Free AI Gateway & Router

SZRoute is an edge-native, multi-provider AI Gateway and intelligent proxy router. Connect **Claude Code, Cursor, Cline, Codex, Antigravity, and LiteLLM** to **160+ AI providers (50+ free tiers)** through a single OpenAI-compatible and Anthropic-compatible endpoint.

Styled with the **Raycast Developer Dark Design System** (pure near-black canvas `#07080a`, surface ladder, hairline borders, Inter `ss03` stylistic typography, and white CTA pills).

---

## ⚡ Core Features

- **Universal Multi-Provider Gateway**:
  - `POST /v1/chat/completions` — OpenAI-compatible streaming SSE & non-streaming router with tool/function calling.
  - `GET /v1/models` — Dynamic catalog aggregating 160+ providers and virtual combos.
  - `POST /v1/messages` — Anthropic Claude-compatible messages proxy with bidirectional translation.
  - `POST /v1/compress` — Standalone RTK + Caveman prompt minification API.
  - `GET /v1/providers` — Real-time provider discovery and capability matrix.
  - `POST /v1/test-provider` — Latency ping and credential testing.
- **50+ Free Tiers Aggregated (~1.9B free tokens/month)**:
  - Groq LPU (Llama 3.3 70B, DeepSeek R1 Distill)
  - Cerebras Wafer-Scale (2,000+ tokens/sec fast inference)
  - Google Gemini AI Studio (Gemini 2.5 Flash, 2.5 Pro)
  - OpenRouter `:free` auto-routes
  - Mistral AI developer tier
  - Cloudflare Workers AI (10,000 requests/day free)
  - SambaNova 405B & 70B RDUs
- **RTK + Caveman Token Compression Engine**:
  - Reduces input/output tokens by **15%–95%** through structural markdown normalization, AI boilerplate purging, and natural language minification without semantic loss.
- **Smart Virtual Combos & Auto-Failover**:
  - `free-auto` — Cascades seamlessly across 100% free models.
  - `code-expert` — Claude 3.7 Sonnet -> DeepSeek R1 -> Codestral -> OpenAI o3-mini.
  - `fast-reasoning` — Cerebras & Groq fast reasoning models.
- **100% Vercel Edge & Serverless Native**:
  - Zero native C++ or SQLite binary dependencies. Compiles and deploys instantly to Vercel with 1 click.

---

## 🛠️ Quick Start

### 1. Install & Run Locally

```bash
# Clone and enter repo
git clone https://github.com/sauravsz/SZRoute.git
cd SZRoute

# Install dependencies (Node 20+ / Bun)
bun install # or npm install

# Start development server
bun dev # or npm run dev
```

Open `http://localhost:3000` to access the SZRoute Web Dashboard.

### 2. Run Test Suite & Build

```bash
# Run unit & router tests
npm test

# Production build
npm run build
```

---

## 🚀 One-Click Vercel Deployment

Deploy directly to Vercel with zero server configuration:

```bash
npx vercel
```

Or connect your GitHub repository to Vercel.

---

## 🔌 Client Integrations

### Claude Code CLI
```bash
export ANTHROPIC_BASE_URL="https://your-szroute.vercel.app/v1"
export ANTHROPIC_API_KEY="szroute-free"
claude
```

### Cursor IDE
1. Open Cursor Settings -> Models.
2. Enable "Override OpenAI Base URL".
3. Set Base URL to: `https://your-szroute.vercel.app/v1`
4. Set API Key to: `szroute-free`
5. Add models: `free-auto`, `code-expert`, or `llama-3.3-70b-versatile`.

### Python OpenAI SDK
```python
from openai import OpenAI

client = OpenAI(
    base_url="https://your-szroute.vercel.app/v1",
    api_key="szroute-free" # or your custom provider keys
)

response = client.chat.completions.create(
    model="free-auto",
    messages=[{"role": "user", "content": "Explain quantum computing simply."}],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")
```

---

## 📄 License

MIT License. Designed for high-velocity AI workflows.
