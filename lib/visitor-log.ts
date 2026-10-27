export type VisitGeo = {
  city: string;
  region: string;
  isp: string;
  country: string;
};

export type VisitLog = {
  id: string;
  ip: string;
  path: string;
  method: string;
  timestamp: string;
  userAgent: string;
  city?: string;
  region?: string;
  isp?: string;
  country?: string;
  geoResolved?: boolean;
};

const SKIP_EXACT = new Set([
  "/favicon.ico",
  "/icon.png",
  "/apple-icon.png",
  "/sitemap.xml",
  "/robots.txt",
]);

export function getRequestIp(request: Request): string {
  const headers = request.headers;
  const candidates = [
    headers.get("x-forwarded-for")?.split(",")[0],
    headers.get("x-real-ip"),
    headers.get("x-vercel-forwarded-for")?.split(",")[0],
    headers.get("cf-connecting-ip"),
    "ip" in request && typeof (request as Request & { ip?: string }).ip === "string"
      ? (request as Request & { ip?: string }).ip
      : undefined,
  ];

  for (const candidate of candidates) {
    const ip = normalizeIp(candidate);
    if (ip) return ip;
  }
  return "unknown";
}

export function isPrivateIp(ip: string): boolean {
  const value = ip.trim().toLowerCase();
  if (!value || value === "unknown" || value === "::1" || value === "127.0.0.1" || value === "0.0.0.0") return true;
  if (value.includes(":")) {
    return value === "::" || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe80");
  }
  const parts = value.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return true;
  const [a, b] = parts;
  if (a === 10 || a === 127) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

export function shouldLogPath(pathname: string): boolean {
  if (!pathname || SKIP_EXACT.has(pathname)) return false;
  if (pathname.startsWith("/_next")) return false;
  if (pathname.startsWith("/api/")) return false;
  if (/\.(?:png|jpe?g|gif|webp|svg|ico|css|js|map|txt|woff2?)$/i.test(pathname)) return false;
  return true;
}

export function buildVisitLog(request: Request): VisitLog {
  const url = new URL(request.url);
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    ip: getRequestIp(request),
    path: url.pathname || "/",
    method: request.method || "GET",
    timestamp: new Date().toISOString(),
    userAgent: (request.headers.get("user-agent") || "").slice(0, 300),
  };
}

function normalizeIp(value: string | null | undefined): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed === "unknown") return "";
  return trimmed.startsWith("::ffff:") ? trimmed.slice(7) : trimmed;
}
