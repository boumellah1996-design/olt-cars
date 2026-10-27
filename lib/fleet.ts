"use client";

import { createContext, createElement, useContext, useMemo, useSyncExternalStore } from "react";
import { initialState } from "./data";
import { FALLBACK_VEHICLE_IMAGE } from "./images";
import type { Fuel, Transmission, Vehicle, VehicleStatus } from "./types";
import { uid } from "./utils";

export const VEHICLES_KEY = "olt-vehicles";
export const APP_STATE_KEY = "olt-app-state";

const VEHICLE_STATUSES: VehicleStatus[] = ["available", "rented", "reserved", "maintenance", "unavailable"];
const FUELS: Fuel[] = ["essence", "diesel", "hybrid", "electric"];
const TRANSMISSIONS: Transmission[] = ["auto", "manual"];

const CHANNEL_NAME = "olt-fleet-sync";
const EVENT_NAME = "olt-fleet-changed";
const listeners = new Set<() => void>();
let memory: Vehicle[] | null = null;
let channel: BroadcastChannel | null | undefined;

function isVehicleStatus(value: unknown): value is VehicleStatus {
  return typeof value === "string" && VEHICLE_STATUSES.includes(value as VehicleStatus);
}

export function brandKey(value: string) {
  return value.trim().toLowerCase();
}

function prettyName(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function normalizeVehicle(input: Partial<Vehicle> & Pick<Vehicle, "brand" | "model">): Vehicle {
  return {
    id: input.id || uid("veh"),
    brand: prettyName(input.brand || ""),
    model: (input.model || "").trim(),
    category: (input.category || "Confort").trim(),
    fuel: FUELS.includes(input.fuel as Fuel) ? (input.fuel as Fuel) : "essence",
    transmission: TRANSMISSIONS.includes(input.transmission as Transmission)
      ? (input.transmission as Transmission)
      : "auto",
    pricePerDay: Number(input.pricePerDay) || 0,
    price7Days: input.price7Days ? Number(input.price7Days) : undefined,
    image: input.image || input.images?.[0] || FALLBACK_VEHICLE_IMAGE,
    images: input.images?.length ? input.images : undefined,
    status: isVehicleStatus(input.status) ? input.status : "available",
    seats: Number(input.seats) || 5,
    year: Number(input.year) || new Date().getFullYear(),
    plate: (input.plate || "").trim(),
    color: (input.color || "Noir").trim(),
  };
}

const SERVER_FLEET: Vehicle[] = initialState.vehicles.map((item) => normalizeVehicle(item));

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function mergeLists(...lists: Array<Vehicle[] | undefined>) {
  const byId = new Map<string, Vehicle>();
  for (const list of lists) {
    for (const item of list || []) {
      if (!item?.brand && !item?.model && !item?.id) continue;
      const vehicle = normalizeVehicle(item);
      byId.set(vehicle.id, vehicle);
    }
  }
  const seedIds = new Set(initialState.vehicles.map((item) => item.id));
  const all = Array.from(byId.values());
  const added = all.filter((item) => !seedIds.has(item.id));
  const rest = all.filter((item) => seedIds.has(item.id));
  return [...added, ...rest];
}

function readStoredFleet() {
  const dedicated = readJson<Vehicle[]>(VEHICLES_KEY);
  if (Array.isArray(dedicated)) {
    return mergeLists(dedicated);
  }
  const nested = readJson<{ vehicles?: Vehicle[] }>(APP_STATE_KEY)?.vehicles;
  if (Array.isArray(nested) && nested.length) {
    return mergeLists(nested);
  }
  return initialState.vehicles.map((item) => normalizeVehicle(item));
}

function notify() {
  listeners.forEach((listener) => listener());
}

function persistFleet(vehicles: Vehicle[]) {
  if (typeof window === "undefined") return;
  const write = (payload: Vehicle[]) => window.localStorage.setItem(VEHICLES_KEY, JSON.stringify(payload));
  try {
    write(vehicles);
    return;
  } catch {
    // Photos as data URLs can exceed quota; keep the cars without heavy images.
  }
  try {
    write(
      vehicles.map((vehicle) => ({
        ...vehicle,
        images: undefined,
        image: vehicle.image?.startsWith("data:") ? FALLBACK_VEHICLE_IMAGE : vehicle.image,
      })),
    );
  } catch {
    // Memory still holds the live fleet for this session.
  }
}

function applyIncoming(vehicles: Vehicle[], persist = false) {
  memory = vehicles.map((item) => normalizeVehicle(item));
  if (persist) persistFleet(memory);
  notify();
  return memory;
}

function getChannel() {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  if (channel === undefined) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (Array.isArray(event.data?.vehicles)) applyIncoming(event.data.vehicles);
      };
    } catch {
      channel = null;
    }
  }
  return channel;
}

function broadcast(vehicles: Vehicle[]) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: vehicles }));
  try {
    getChannel()?.postMessage({ vehicles });
  } catch {
    // ignore unsupported broadcast targets
  }
}

let syncBound = false;

function bindGlobalSync() {
  if (typeof window === "undefined" || syncBound) return;
  syncBound = true;
  getChannel();
  window.addEventListener("storage", (event) => {
    if (event.key !== VEHICLES_KEY && event.key !== APP_STATE_KEY) return;
    memory = null;
    getFleet();
    notify();
  });
  window.addEventListener(EVENT_NAME, (event) => {
    const list = (event as CustomEvent<Vehicle[]>).detail;
    if (Array.isArray(list)) applyIncoming(list);
  });
}

bindGlobalSync();

export function getFleet(): Vehicle[] {
  if (memory) return memory;
  memory = typeof window === "undefined" ? SERVER_FLEET : readStoredFleet();
  return memory;
}

export function setFleet(vehicles: Vehicle[]) {
  const next = applyIncoming(vehicles, true);
  broadcast(next);
  return next;
}

export function addToFleet(vehicle: Vehicle) {
  const next = [normalizeVehicle(vehicle), ...getFleet().filter((item) => item.id !== vehicle.id)];
  return setFleet(next);
}

export function removeFromFleet(id: string) {
  return setFleet(getFleet().filter((item) => item.id !== id));
}

export function updateFleet(updater: (current: Vehicle[]) => Vehicle[]) {
  return setFleet(updater(getFleet()));
}

export function subscribeFleet(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

type FleetContextValue = {
  vehicles: Vehicle[];
  ready: boolean;
};

const FleetContext = createContext<FleetContextValue | null>(null);

function useFleetSnapshot(): FleetContextValue {
  const vehicles = useSyncExternalStore(subscribeFleet, getFleet, () => SERVER_FLEET);
  return useMemo(() => ({ vehicles, ready: true }), [vehicles]);
}

export function FleetProvider({ children }: { children: React.ReactNode }) {
  const value = useFleetSnapshot();
  return createElement(FleetContext.Provider, { value }, children);
}

export function useFleet() {
  const ctx = useContext(FleetContext);
  const snapshot = useFleetSnapshot();
  return ctx || snapshot;
}
