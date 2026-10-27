import { NextResponse } from "next/server";
import { lookupIpGeo } from "lib/ip-geo";
import { appendVisit, enrichMissingGeo } from "lib/visits-server";
import type { VisitLog } from "lib/visitor-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function asVisit(body: Partial<VisitLog>): VisitLog | null {
  if (!body?.ip || !body.path || !body.timestamp) return null;
  return {
    id: String(body.id || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`),
    ip: String(body.ip).slice(0, 64),
    path: String(body.path).slice(0, 500),
    method: String(body.method || "GET").slice(0, 12),
    timestamp: String(body.timestamp),
    userAgent: String(body.userAgent || "").slice(0, 300),
  };
}

export async function GET() {
  return NextResponse.json(await enrichMissingGeo(), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  let body: Partial<VisitLog>;
  try {
    body = (await request.json()) as Partial<VisitLog>;
  } catch {
    return NextResponse.json({ error: "Invalid visit payload" }, { status: 400 });
  }
  const visit = asVisit(body);
  if (!visit) {
    return NextResponse.json({ error: "Invalid visit payload" }, { status: 400 });
  }
  const geo = await lookupIpGeo(visit.ip);
  const saved = appendVisit({ ...visit, ...geo, geoResolved: true });
  console.info(`[visit] ${saved.timestamp} ${saved.ip} ${saved.city || "-"} ${saved.region || "-"} ${saved.isp || "-"} ${saved.method} ${saved.path}`);
  return NextResponse.json({ ok: true }, { status: 201 });
}
