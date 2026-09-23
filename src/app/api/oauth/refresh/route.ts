import { NextRequest, NextResponse } from "next/server";
import { refreshOAuthToken } from "@/lib/oauth/refresh";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { providerId, refreshToken, extraData } = body;

    if (!providerId || typeof providerId !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'providerId'" }, { status: 400 });
    }

    if (!refreshToken || typeof refreshToken !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'refreshToken'" }, { status: 400 });
    }

    const result = await refreshOAuthToken(providerId, refreshToken, extraData);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to refresh token for provider '${providerId}'. Upstream authorization may be revoked or expired.`,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      tokenData: result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
