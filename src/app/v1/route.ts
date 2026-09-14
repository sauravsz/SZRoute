import { NextResponse } from "next/server";
import { PROVIDER_CATALOG, DEFAULT_COMBOS } from "@/lib/providers/catalog";

export const runtime = "edge";

export async function GET() {
  const origin = "https://szroute.vercel.app";

  return NextResponse.json(
    {
      status: "ok",
      gateway: "SZRoute",
      version: "4.0.0",
      description: "High-performance Serverless AI Gateway & Multi-Provider Router for Oh My Pi (omp)",
      design_system: "Wise Scandinavian Fintech",
      uptime: "100%",
      active_providers: PROVIDER_CATALOG.length,
      active_combos: DEFAULT_COMBOS.length,
      endpoints: {
        chat_completions: `${origin}/v1/chat/completions`,
        models: `${origin}/v1/models`,
        messages: `${origin}/v1/messages`,
        compress: `${origin}/v1/compress`,
        mcp_server: `${origin}/api/mcp`,
        audio_transcriptions: `${origin}/v1/audio/transcriptions`,
        embeddings: `${origin}/v1/embeddings`,
        rerank: `${origin}/v1/rerank`,
        image_generation: `${origin}/v1/images/generations`,
        providers: `${origin}/v1/providers`,
      },
      omp_quick_start: {
        openai_base_url: `${origin}/v1`,
        anthropic_base_url: `${origin}/v1`,
        default_model: "free-auto",
        coding_model: "code-expert",
      },
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
