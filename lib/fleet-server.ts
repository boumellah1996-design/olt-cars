import fs from "fs";
import path from "path";
import { initialState } from "./data";
import type { Vehicle } from "./types";

type FleetFile = { vehicles: Vehicle[] };

const FILE = path.join(process.cwd(), "data", "vehicles.json");
let memory: FleetFile | null = null;

function seed(): FleetFile {
  return { vehicles: initialState.vehicles.map((item) => ({ ...item })) };
}

function readFile(): FleetFile {
  if (memory) return memory;
  try {
    const raw = fs.readFileSync(FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<FleetFile>;
    if (Array.isArray(parsed.vehicles)) {
      memory = { vehicles: parsed.vehicles };
      return memory;
    }
  } catch {
    // First run or unreadable file — start from the seed catalog.
  }
  memory = seed();
  return memory;
}

function writeFile(data: FleetFile) {
  memory = data;
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf8");
  } catch {
    // Serverless/read-only hosts keep the in-memory copy for this instance.
  }
}

export function listVehicles() {
  return readFile().vehicles;
}

export function replaceVehicles(vehicles: Vehicle[]) {
  writeFile({ vehicles });
  return vehicles;
}
