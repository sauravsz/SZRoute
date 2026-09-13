import { NextResponse } from "next/server";
import { PROVIDER_CATALOG, DEFAULT_COMBOS } from "@/lib/providers/catalog";

export const runtime = "edge";

export async function GET() {
  const modelsList = [];

  // 1. Add Virtual Combos as top-level models
  for (const combo of DEFAULT_COMBOS) {
    modelsList.push({
      id: combo.id,
      object: "model",
      created: 1710000000,
      owned_by: "szroute-combo",
      permission: [],
      root: combo.id,
      parent: null,
      description: combo.description,
      is_combo: true,
      strategy: combo.strategy,
      targets: combo.targets,
    });
  }

  // 2. Add individual models from all providers
  for (const provider of PROVIDER_CATALOG) {
    for (const model of provider.models) {
      modelsList.push({
        id: model.id,
        object: "model",
        created: 1710000000,
        owned_by: provider.id,
        permission: [],
        root: model.id,
        parent: null,
        name: model.name,
        context_window: model.contextWindow,
        max_output: model.maxOutput,
        is_free: Boolean(model.isFree),
        provider_name: provider.name,
        provider_category: provider.category,
      });
    }
  }

  return NextResponse.json(
    {
      object: "list",
      data: modelsList,
      total: modelsList.length,
      combos_count: DEFAULT_COMBOS.length,
      providers_count: PROVIDER_CATALOG.length,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    }
  );
}
