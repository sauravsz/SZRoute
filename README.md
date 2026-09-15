<div align="center">

# ⚡ SZRoute

### Universal AI Gateway & Multi-Provider Router for Oh My Pi (`omp`)

**Connect Oh My Pi (`omp`), Cursor, Cline, and Codex to 160+ AI providers (50+ free tiers) with 15%–95% RTK token compression, automatic failovers, and Edge streaming.**

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Vercel Edge](https://img.shields.io/badge/Vercel-Edge%20Serverless-007AFF?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)
[![Design System](https://img.shields.io/badge/Design-Apple%20HIG%20%2B%20SwiftUI-007AFF?style=flat)](https://szroute.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[**Live Production Deployment**](https://szroute.vercel.app) • [**Oh My Pi Integration**](#-oh-my-pi-omp-quick-start) • [**Virtual Combos**](#-virtual-combos--model-chains) • [**MCP Server Protocol**](#-model-context-protocol-mcp-server)

<br/>

<img src="./public/screenshots/overview.png" alt="SZRoute Apple HIG Overview" width="100%" />

</div>

---

## 🍏 Apple Human Interface Guidelines (HIG) & SwiftUI Animations

SZRoute features a fluid, native macOS/iOS design language with purposeful SwiftUI micro-interactions:
- **SF Pro Typography & System Colors**: Apple System Blue (`#007AFF`), Green (`#34C759`), Purple (`#AF52DE`), and Orange (`#FF9500`).
- **Concentric Squircle Curves**: Progressive 28px card squircle curvature (`rounded-3xl` outer $\to$ `rounded-2xl` inner items $\to$ `rounded-full` capsule buttons).
- **SwiftUI Spring Micro-Interactions**: Tactile press scaling (`active:scale-[0.98]`), spring keyframe transitions, and smooth hover feedback.
- **Glassmorphic App Shell**: Translucent backdrop-blurred navigation bars and Spotlight search overlay.
- **Adaptive Light & Dark Modes**: Native macOS dynamic theming with instant sun/moon toggle.

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

# 2. Premier Coding Specialist (Claude 3.7 Sonnet -> DeepSeek R1 -> Codestral -> Qwen 2.5)
omp --model code-expert

# 3. Ultra-Fast Reasoning (Cerebras & Groq at 2,000+ tok/s)
omp --model fast-reasoning
```

---

## 📸 Interactive Web Surfaces

<div align="center">

### 1. 160+ Providers Catalog & OAuth PKCE / Device Auth
*Configure API keys, OAuth 2.0 PKCE, GitHub Copilot device authentication, and live latency benchmarking.*
<img src="./public/screenshots/providers.png" alt="SZRoute Providers & Credentials" width="100%" />

<br/><br/>

### 2. Virtual Combos & Model Chains
*Concentric squircle cards with priority failover execution ladders (Tier 1 $\to$ Tier 2 $\to$ Tier 3).*
<img src="./public/screenshots/combos.png" alt="SZRoute Virtual Combos" width="100%" />

<br/><br/>

### 3. RTK + Caveman Token Compression Studio
*Save 15%–95% input tokens via single-pass structural markdown purge, AI boilerplate removal, and JSON minification.*
<img src="./public/screenshots/compression.png" alt="SZRoute Token Compression Studio" width="100%" />

<br/><br/>

### 4. Real-time Telemetry & Failover Inspector
*Inspect live request streams, HTTP status codes, latency telemetry, and failover trails.*
<img src="./public/screenshots/inspector.png" alt="SZRoute Telemetry Inspector" width="100%" />

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
| `/v1/models` | `GET` | Discovery catalog aggregating 36+ models and virtual combos |
| `/v1/messages` | `POST` | Anthropic Claude-compatible endpoint with strict SSE event translation |
| `/v1/compress` | `POST` | Standalone RTK + Caveman prompt minification API (saves 15%–95% tokens) |
| `/api/mcp` | `POST` | Model Context Protocol (MCP) server for `omp` tool discovery & routing |
| `/api/oauth/authorize` | `GET` | OAuth 2.0 PKCE authorization endpoint (Google, OpenRouter, HuggingFace) |
| `/api/oauth/device/start` | `POST` | GitHub Copilot RFC 8628 device code authentication |
| `/v1/audio/transcriptions` | `POST` | Groq Whisper Large v3 free audio transcription (200x real-time) |
| `/v1/embeddings` | `POST` | Vector embeddings proxy (Together / Cloudflare Workers AI) |
| `/v1/rerank` | `POST` | BM25 / Cohere code search reranking for fast codebase navigation |
| `/v1/images/generations` | `POST` | FLUX.1 / SDXL image generation free tier routing |
| `/v1/providers` | `GET` | Real-time provider capability and status matrix |
| `/v1/test-provider` | `POST` | Upstream latency ping and credential verification |

---

## 🛠️ Local Development & Deployment

```bash
# 1. Clone repository
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

Deploy directly to Vercel with zero native configuration:

```bash
npx vercel --prod
```

---

## 📄 License

MIT License. Designed for autonomous AI workflows with the **Oh My Pi (`omp`)** coding agent.
