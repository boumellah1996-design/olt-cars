import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { buildVisitLog, shouldLogPath } from "lib/visitor-log";

export function middleware(request: NextRequest, event: NextFetchEvent) {
  const pathname = request.nextUrl.pathname;
  if (request.method === "OPTIONS") return NextResponse.next();
  if (request.headers.get("next-router-prefetch") === "1") return NextResponse.next();
  if (!shouldLogPath(pathname)) return NextResponse.next();

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/visits|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
