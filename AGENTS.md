# AGENTS.md & Repository Instructions — SZRoute

## Overview
SZRoute is a high-performance, Edge-native AI Gateway and Multi-Provider Router built on Next.js 15 (App Router), React 19, and TypeScript. It is designed to be deployed serverlessly to Vercel and serve as the AI gateway for the **Oh My Pi (omp)** coding agent, Cursor, Cline, and other developer tools.

## Architecture
- **Framework**: Next.js 15 App Router (Edge Runtime).
- **Design System**: Raycast Developer Dark Design System (`#07080a` canvas, `#0d0d0d` surface, Inter `ss03`, `#ffffff` primary CTA pill, `#242728` hairline borders).
- **Gateway Endpoints**:
  - `POST /v1/chat/completions`: Streaming SSE & non-streaming OpenAI chat router.
  - `GET /v1/models`: 160+ models & virtual combos discovery.
  - `POST /v1/messages`: Anthropic-compatible streaming router.
  - `POST /v1/compress`: RTK + Caveman prompt minification engine (15%–95% token savings).
  - `GET /v1/providers`: Provider registry & health check.
  - `POST /v1/test-provider`: Upstream ping & credential testing.

## Testing & Verification
- `npm test`: Node test runner executing `tests/gateway.test.ts`.
- `npm run build`: Production Next.js 15 build with zero type errors.
