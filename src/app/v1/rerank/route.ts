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
      req.headers.get("x-api-key") ||
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

    // Algorithmic Okapi BM25 Reranking Engine (Zero cost, Zero latency Edge Ranking)
    // Formula: Score(D, Q) = sum( IDF(qi) * (f(qi, D) * (k1 + 1)) / (f(qi, D) + k1 * (1 - b + b * (|D| / avgdl))) )
    const tokenize = (text: string): string[] => text.toLowerCase().match(/\b[\w'-]+\b/g) || [];

    const queryTokens = tokenize(query);
    const queryTerms = Array.from(new Set(queryTokens));

    const N = documents.length;
    const docItems = documents.map((doc: string | { text: string }, index: number) => {
      const text = typeof doc === "string" ? doc : doc && typeof doc.text === "string" ? doc.text : "";
      const tokens = tokenize(text);
      const tfMap = new Map<string, number>();
      for (const t of tokens) {
        tfMap.set(t, (tfMap.get(t) || 0) + 1);
      }
      return { index, text, tokens, tfMap, length: tokens.length };
    });

    const totalLength = docItems.reduce((acc, d) => acc + d.length, 0);
    const avgdl = N > 0 ? Math.max(1, totalLength / N) : 1;

    // Compute Document Frequencies for each unique query term
    const dfMap = new Map<string, number>();
    for (const term of queryTerms) {
      let count = 0;
      for (const d of docItems) {
        if (d.tfMap.has(term)) count++;
      }
      dfMap.set(term, count);
    }

    // Standard Okapi BM25 parameters
    const k1 = 1.2;
    const b = 0.75;

    const scored = docItems.map((doc) => {
      let bm25Score = 0;
      for (const term of queryTerms) {
        const f = doc.tfMap.get(term) || 0;
        if (f === 0) continue;

        const n = dfMap.get(term) || 0;
        // Robertson-Spärck Jones IDF with +1 smoothing to guarantee non-negative weight
        const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
        const numerator = f * (k1 + 1);
        const denominator = f + k1 * (1 - b + b * (doc.length / avgdl));
        bm25Score += idf * (numerator / denominator);
      }

      // Normalize BM25 score smoothly into [0, 1) probability range
      const relevance_score = bm25Score > 0 ? Number((bm25Score / (bm25Score + 1.0)).toFixed(6)) : 0;
      return {
        index: doc.index,
        relevance_score,
        document: { text: doc.text },
      };
    });

    scored.sort((a, b) => b.relevance_score - a.relevance_score || a.index - b.index);

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
