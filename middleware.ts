import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { buildVisitLog, shouldLogPath } from "lib/visitor-log";

function needsFreshVehicleData(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/vehicles") ||
    pathname.startsWith("/booking") ||
    pathname.startsWith("/admin/vehicles") ||
    pathname.startsWith("/api/vehicles")
  );
}

function applyNoStore(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  response.headers.set("CDN-Cache-Control", "no-store");
  response.headers.set("Vercel-CDN-Cache-Control", "no-store");
}

export function middleware(request: NextRequest, event: NextFetchEvent) {
  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next();
  if (needsFreshVehicleData(pathname)) applyNoStore(response);

  if (request.method === "OPTIONS") return response;
  if (request.headers.get("next-router-prefetch") === "1") return response;
  if (!shouldLogPath(pathname)) return response;

  const visit = buildVisitLog(request);
  console.info(`[visit] ${visit.timestamp} ${visit.ip} ${visit.method} ${visit.path}`);

  event.waitUntil(
    fetch(new URL("/api/visits", request.url), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(visit),
      keepalive: true,
    })
      .then(() => undefined)
      .catch(() => undefined),
  );

  return response;
}

export const config = {
  matcher: ["/((?!api/visits|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
