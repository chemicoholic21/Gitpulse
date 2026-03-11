import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  // Use a type-safe way to access ip if it exists, otherwise fall back to headers
  const ip = (request as any).ip ?? realIp ?? forwarded?.split(",")[0] ?? "127.0.0.1";
  
  // To pass the IP to API routes, we must set it on the request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-forwarded-for", ip);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: "/api/:path*",
};
