<div align="center">

# ⚡ SZRoute

### The Free AI Gateway & Multi-Provider Router for Oh My Pi (`omp`)

**Connect Oh My Pi (`omp`), Cursor, Cline, and Codex to 160+ AI providers (50+ free tiers) with 15%–95% RTK token compression, automatic failovers, and Edge streaming.**

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Vercel Edge](https://img.shields.io/badge/Vercel-Edge%20Serverless-9fe870?style=flat&logo=vercel&logoColor=black)](https://vercel.com/)
[![Design System](https://img.shields.io/badge/Design-Wise%20Fintech-9fe870?style=flat)](https://szroute.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[**Live Demo (Vercel)**](https://szroute.vercel.app) • [**Oh My Pi Integration**](#-oh-my-pi-omp-quick-start) • [**Virtual Combos**](#-smart-virtual-combos) • [**MCP Server Protocol**](#-model-context-protocol-mcp-server)

<br/>

<img src="./public/screenshots/overview.png" alt="SZRoute Overview & AI Cost Converter" width="100%" />

</div>

---

## 🎨 Scandinavian Fintech Aesthetic (Wise Design Language)

SZRoute is designed with an editorial Scandinavian fintech visual identity:
- **Wise Lime Green (`#9fe870`)**: Primary conversion pill CTAs (`btn-primary`), active indicators, and brand anchors.
- **Sage-Tinted Canvas (`#e8ebe6`)**: Soft, calming page background and surface containers.
- **Elevated White Cards (`#ffffff`)**: 24px pill-rounded cards (`rounded-xl`) with subtle surface contrast elevation.
- **Heavy Display Sans (Weight 900)**: Headlines rendered in bold, geometric 900-weight typography.
- **Signature AI Token & Cost Converter**: Interactive widget calculating prompt tokens, commercial baseline costs, and live RTK token savings.

---

## 🚀 Oh My Pi (`omp`) Quick Start

SZRoute is purpose-built as the high-throughput, edge-native gateway for the **Oh My Pi (`omp`)** coding harness.

### 1. Export Gateway Environment Variables

Add to your `~/.zshrc` or `~/.bashrc`:

```bash
# Connect Oh My Pi (omp) to SZRoute Edge Gateway
export OPENAI_BASE_URL="https://szroute.vercel.app/v1"
export ANTHROPIC_BASE_URL="https://szroute.vercel.app/v1"
export OPENAI_API_KEY="szroute-free"
export ANTHROPIC_API_KEY="szroute-free"
```

### 2. Launch `omp` with Virtual Combos

```bash
# 1. Zero-Cost Auto-Free Combo (Groq -> Cerebras -> Gemini -> OpenRouter -> SambaNova)
omp --model free-auto

# 2. Premier Coding Specialist (Claude 3.7 Sonnet -> DeepSeek R1 -> Codestral -> o3-mini)
omp --model code-expert

# 3. Ultra-Fast Reasoning (Cerebras & Groq at 2,000+ tok/s)
omp --model fast-reasoning
```

---

## 📸 Interactive Web Surfaces

<div align="center">

### 1. Providers Catalog & Credential Manager
*Explore 160+ AI providers, 50+ free tiers, test live latency pings, and export encrypted configuration backups.*
<img src="./public/screenshots/providers.png" alt="SZRoute Providers & Credentials" width="100%" />

<br/><br/>

### 2. Virtual Combos & Multi-Tier Fallbacks
*Build priority fallback ladders (Tier 1 $\to$ Tier 2 $\to$ Tier 3) with zero-cost failovers.*
<img src="./public/screenshots/combos.png" alt="SZRoute Virtual Combos" width="100%" />

<br/><br/>

### 3. RTK + Caveman Token Compression Studio
*Save 15%–95% input tokens via single-pass structural markdown purge, AI boilerplate removal, and JSON minification.*
<img src="./public/screenshots/compression.png" alt="SZRoute Token Compression Studio" width="100%" />

<br/><br/>

### 4. Real-time Traffic & Failover Inspector
*Inspect live request streams, HTTP status codes, latency telemetry, and failover trails.*
<img src="./public/screenshots/inspector.png" alt="SZRoute Traffic Inspector" width="100%" />

<br/><br/>

### 5. Client Integration & Dynamic Setup Guides
*Dynamic code generator for Oh My Pi (`omp`), Cursor, Cline, Codex, Python SDK, and cURL.*
<img src="./public/screenshots/setup.png" alt="SZRoute Setup Guides" width="100%" />

</div>

---

## ⚡ Core Gateway Capabilities

| Endpoint | Method | Description |
|---|---|---|
| `/v1/chat/completions` | `POST` | OpenAI-compatible streaming SSE & non-streaming router with tool calling |
| `/v1/models` | `GET` | Discovery catalog aggregating 160+ models and virtual combos |
| `/v1/messages` | `POST` | Anthropic Claude-compatible endpoint with strict SSE event translation |
| `/v1/compress` | `POST` | Standalone RTK + Caveman prompt minification API (saves 15%–95% tokens) |
| `/api/mcp` | `POST` | Model Context Protocol (MCP) server for `omp` tool discovery & routing |
| `/v1/audio/transcriptions` | `POST` | Groq Whisper Large v3 free audio transcription (200x real-time) |
| `/v1/embeddings` | `POST` | Vector embeddings proxy (OpenAI / Together / Cloudflare) |
| `/v1/rerank` | `POST` | BM25 / Cohere code search reranking for fast codebase navigation |
| `/v1/images/generations` | `POST` | FLUX.1 / SDXL image generation free tier routing |
| `/v1/providers` | `GET` | Real-time provider capability and status matrix |
| `/v1/test-provider` | `POST` | Upstream latency ping and credential verification |

---

## 🤖 Model Context Protocol (MCP) Server

SZRoute exposes a full Edge-native MCP Server (`/api/mcp`) supporting JSON-RPC 2.0 tool execution for the `omp` coding agent:

- **`szroute_route_chat`**: Execute chat completion with auto-fallback and RTK compression.
- **`szroute_compress_prompt`**: Algorithmic prompt minification for large repositories.
- **`szroute_discover_models`**: Discover available free/commercial models and virtual combos.

---

## 🛠️ Local Development & Deployment

```bash
# 1. Clone the repository
git clone https://github.com/sauravsz/SZRoute.git
cd SZRoute

# 2. Install dependencies
bun install # or npm install

# 3. Run test suite
npm test

# 4. Start local development server
bun dev # or npm run dev
```

### 1-Click Vercel Deployment

Deploy instantly to Vercel with zero native configuration:

```bash
npx vercel --prod
```

---

## 📄 License

MIT License. Designed for autonomous AI workflows with the **Oh My Pi (`omp`)** coding agent.
