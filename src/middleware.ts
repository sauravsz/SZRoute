import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/v1/:path*", "/api/:path*"],
};

export function middleware(req: NextRequest) {
  // Handle CORS Pre-flight OPTIONS
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, x-api-key, anthropic-version, x-szroute-provider, x-szroute-compress, x-szroute-keys, x-goog-api-key, x-goog-api-client",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-api-key, anthropic-version, x-szroute-provider, x-szroute-compress, x-szroute-keys, x-goog-api-key, x-goog-api-client"
  );

  return response;
}
