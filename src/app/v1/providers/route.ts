import { NextResponse } from "next/server";
import { PROVIDER_CATALOG, DEFAULT_COMBOS } from "@/lib/providers/catalog";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json(
    {
      providers: PROVIDER_CATALOG,
      combos: DEFAULT_COMBOS,
      total_providers: PROVIDER_CATALOG.length,
      free_tier_count: PROVIDER_CATALOG.filter((p) => p.freeTier.hasFree).length,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=3600",
      },
    }
  );
}
