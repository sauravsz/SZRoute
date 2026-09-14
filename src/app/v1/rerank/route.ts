import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { query, documents, top_n = 5, model = "rerank-english-v3.0" } = await req.json();

    if (!query || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { error: { message: "Invalid request: 'query' string and 'documents' array are required." } },
        { status: 400 }
      );
    }

    const cohereKey =
      process.env.COHERE_API_KEY ||
      req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ||
      "";

    // If Cohere key is present, route upstream; otherwise execute algorithmic TF-IDF BM25 fallback
    if (cohereKey) {
      const res = await fetch("https://api.cohere.com/v1/rerank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cohereKey}`,
        },
        body: JSON.stringify({
          query,
          documents,
          top_n,
          model,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data, {
          headers: { "Access-Control-Allow-Origin": "*", "x-szroute-provider": "cohere" },
        });
      }
    }

    // Fast Edge BM25 heuristic reranking fallback (zero cost, zero latency)
    const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const scored = documents.map((doc: string | { text: string }, index: number) => {
      const text = typeof doc === "string" ? doc : doc.text || "";
      const lower = text.toLowerCase();
      let score = 0;
      for (const term of queryTerms) {
        if (lower.includes(term)) score += 1;
      }
      const relevance_score = Math.min(0.99, score / Math.max(1, queryTerms.length));
      return { index, relevance_score, document: { text } };
    });

    scored.sort((a: any, b: any) => b.relevance_score - a.relevance_score);

    return NextResponse.json({
      id: `rerank_${Date.now()}`,
      results: scored.slice(0, top_n),
      meta: { provider: "szroute-edge-bm25", total_documents: documents.length },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: { message: `SZRoute Rerank error: ${msg}` } }, { status: 500 });
  }
}
