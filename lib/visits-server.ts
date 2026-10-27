import fs from "fs";
import path from "path";
import { lookupIpGeo } from "./ip-geo";
import { shouldLogPath, type VisitGeo, type VisitLog } from "./visitor-log";

const FILE = path.join(process.cwd(), "data", "visits.json");
const MAX_VISITS = 2000;

type VisitsFile = { visits: VisitLog[] };

let memory: VisitsFile | null = null;

function readFile(): VisitsFile {
  if (memory) return memory;
  try {
    const raw = fs.readFileSync(FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<VisitsFile>;
    if (Array.isArray(parsed.visits)) {
      memory = { visits: parsed.visits };
      return memory;
    }
  } catch {
    // First run or unreadable file — start empty.
  }
  memory = { visits: [] };
  return memory;
}

function writeFile(data: VisitsFile) {
  memory = data;
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf8");
  } catch {
    // Serverless/read-only hosts keep the in-memory copy for this instance.
  }
}

export function listVisits() {
  const current = readFile();
  const visits = current.visits.filter((item) => shouldLogPath(item.path));
  if (visits.length !== current.visits.length) writeFile({ visits });
  return visits;
}

export function applyGeoToIp(ip: string, geo: VisitGeo) {
  const current = readFile();
  writeFile({
    visits: current.visits.map((item) =>
      item.ip === ip
        ? { ...item, city: geo.city, region: geo.region, isp: geo.isp, country: geo.country, geoResolved: true }
        : item,
    ),
  });
}

export async function enrichMissingGeo() {
  const pending = Array.from(new Set(listVisits().filter((item) => !item.geoResolved).map((item) => item.ip))).slice(0, 8);
  await Promise.all(
    pending.map(async (ip) => {
      applyGeoToIp(ip, await lookupIpGeo(ip));
    }),
  );
  return listVisits();
}

export function appendVisit(visit: VisitLog) {
  if (!shouldLogPath(visit.path)) return visit;
  const current = readFile();
  const visits = [visit, ...current.visits.filter((item) => shouldLogPath(item.path))].slice(0, MAX_VISITS);
  writeFile({ visits });
  return visit;
}
