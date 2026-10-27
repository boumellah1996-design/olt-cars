import fs from "fs";
import path from "path";
import { initialState } from "./data";
import type { Reservation } from "./types";

type OpsFile = { reservations: Reservation[] };

const FILE = path.join(process.cwd(), "data", "ops.json");
let memory: OpsFile | null = null;

function seed(): OpsFile {
  return { reservations: initialState.reservations.map((item) => ({ ...item })) };
}

function readFile(): OpsFile {
  if (memory) return memory;
  try {
    const raw = fs.readFileSync(FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<OpsFile>;
    if (Array.isArray(parsed.reservations)) {
      memory = { reservations: parsed.reservations };
      return memory;
    }
  } catch {
    // Fall through to seed; the file is created on the first write.
  }
  memory = seed();
  return memory;
}

function writeFile(data: OpsFile) {
  memory = data;
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf8");
  } catch {
    // Serverless/read-only hosts keep the in-memory copy for this instance.
  }
}

export function listReservations() {
  return readFile().reservations;
}

export function upsertReservation(reservation: Reservation) {
  const current = readFile();
  const reservations = [reservation, ...current.reservations.filter((item) => item.id !== reservation.id)];
  writeFile({ reservations });
  return reservation;
}

export function patchReservation(id: string, patch: Partial<Reservation>) {
  const current = readFile();
  const existing = current.reservations.find((item) => item.id === id);
  if (!existing) return null;
  const next = { ...existing, ...patch, id };
  writeFile({
    reservations: current.reservations.map((item) => (item.id === id ? next : item)),
  });
  return next;
}
