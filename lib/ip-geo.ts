import { isPrivateIp, type VisitGeo } from "./visitor-log";

const EMPTY_GEO: VisitGeo = { city: "", region: "", isp: "", country: "" };
const LOCAL_GEO: VisitGeo = { city: "", region: "", isp: "", country: "" };
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const FAIL_TTL_MS = 10 * 60 * 1000;
const LOOKUP_TIMEOUT_MS = 2500;

type CacheEntry = { geo: VisitGeo; expiresAt: number };

const cache = new Map<string, CacheEntry>();

function readCache(ip: string): VisitGeo | null {
  const entry = cache.get(ip);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(ip);
    return null;
  }
  return entry.geo;
}

function writeCache(ip: string, geo: VisitGeo, ttl = CACHE_TTL_MS) {
  cache.set(ip, { geo, expiresAt: Date.now() + ttl });
}

async function fetchJson(url: string): Promise<Record<string, unknown> | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function lookupIpinfo(ip: string): Promise<VisitGeo | null> {
  const token = process.env.IPINFO_TOKEN;
  const url = token ? `https://ipinfo.io/${ip}/json?token=${encodeURIComponent(token)}` : `https://ipinfo.io/${ip}/json`;
  const data = await fetchJson(url);
  if (!data || data.bogon || data.error) return null;
  const city = text(data.city);
  const region = text(data.region);
  const isp = text(data.org).replace(/^AS\d+\s+/, "");
  const country = text(data.country);
  if (!city && !region && !isp) return null;
  return { city, region, isp, country };
}

async function lookupIpapi(ip: string): Promise<VisitGeo | null> {
  const data = await fetchJson(`https://ipapi.co/${ip}/json/`);
  if (!data || data.error) return null;
  const city = text(data.city);
  const region = text(data.region);
  const isp = text(data.org) || text(data.asn);
  const country = text(data.country_name) || text(data.country);
  if (!city && !region && !isp) return null;
  return { city, region, isp, country };
}

async function lookupIpApiCom(ip: string): Promise<VisitGeo | null> {
  const data = await fetchJson(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,query`);
  if (!data || data.status !== "success") return null;
  const city = text(data.city);
  const region = text(data.regionName);
  const isp = text(data.isp);
  const country = text(data.country);
  if (!city && !region && !isp) return null;
  return { city, region, isp, country };
}

export async function lookupIpGeo(ip: string): Promise<VisitGeo> {
  const cached = readCache(ip);
  if (cached) return cached;
  if (isPrivateIp(ip)) {
    writeCache(ip, LOCAL_GEO);
    return LOCAL_GEO;
  }

  const geo = (await lookupIpinfo(ip)) || (await lookupIpapi(ip)) || (await lookupIpApiCom(ip));
  if (!geo) {
    writeCache(ip, EMPTY_GEO, FAIL_TTL_MS);
    return EMPTY_GEO;
  }
  writeCache(ip, geo);
  return geo;
}
