"use client";

import { useSyncExternalStore } from "react";
import { initialState } from "./data";
import { APP_STATE_KEY } from "./fleet";
import type { Activity, AppState, Reservation } from "./types";
import { uid } from "./utils";

export const OPS_KEY = "olt-ops";
const CHANNEL_NAME = "olt-ops-sync";
const EVENT_NAME = "olt-ops-changed";

export type OpsState = Omit<AppState, "vehicles">;

const listeners = new Set<() => void>();
let memory: OpsState | null = null;
let channel: BroadcastChannel | null | undefined;

function emptyOps(): OpsState {
  const { vehicles: _ignored, ...ops } = initialState;
  return ops;
}

const SERVER_OPS: OpsState = emptyOps();

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function asOps(input: Partial<AppState> | Partial<OpsState> | null | undefined): OpsState {
  const seed = emptyOps();
  return {
    clients: Array.isArray(input?.clients) ? input!.clients! : seed.clients,
    reservations: Array.isArray(input?.reservations) ? input!.reservations! : seed.reservations,
    rentals: Array.isArray(input?.rentals) ? input!.rentals! : seed.rentals,
    payments: Array.isArray(input?.payments) ? input!.payments! : seed.payments,
    expenses: Array.isArray(input?.expenses) ? input!.expenses! : seed.expenses,
    maintenances: Array.isArray(input?.maintenances) ? input!.maintenances! : seed.maintenances,
    documents: Array.isArray(input?.documents) ? input!.documents! : seed.documents,
    incidents: Array.isArray(input?.incidents) ? input!.incidents! : seed.incidents,
    cash: Array.isArray(input?.cash) ? input!.cash! : seed.cash,
    activities: Array.isArray(input?.activities) ? input!.activities! : seed.activities,
  };
}

function readStoredOps(): OpsState {
  const dedicated = readJson<Partial<OpsState>>(OPS_KEY);
  if (dedicated && Array.isArray(dedicated.reservations)) return asOps(dedicated);
  const nested = readJson<Partial<AppState>>(APP_STATE_KEY);
  if (nested && Array.isArray(nested.reservations)) return asOps(nested);
  return emptyOps();
}

function notify() {
  listeners.forEach((listener) => listener());
}

function persistOps(state: OpsState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(OPS_KEY, JSON.stringify(state));
  } catch {
    try {
      window.localStorage.setItem(
        OPS_KEY,
        JSON.stringify({ ...state, activities: state.activities.slice(0, 40) }),
      );
    } catch {
      // Memory still holds the live operations for this session.
    }
  }
}

function applyIncoming(state: OpsState, persist = false) {
  memory = asOps(state);
  if (persist) persistOps(memory);
  notify();
  return memory;
}

function getChannel() {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  if (channel === undefined) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event.data?.ops) applyIncoming(event.data.ops);
      };
    } catch {
      channel = null;
    }
  }
  return channel;
}

function broadcast(state: OpsState) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: state }));
  try {
    getChannel()?.postMessage({ ops: state });
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
    if (event.key !== OPS_KEY && event.key !== APP_STATE_KEY) return;
    memory = null;
    getOps();
    notify();
  });
  window.addEventListener(EVENT_NAME, (event) => {
    const next = (event as CustomEvent<OpsState>).detail;
    if (next?.reservations) applyIncoming(next);
  });
  window.addEventListener("focus", () => {
    void pullRemoteReservations();
  });
}

bindGlobalSync();

export function getOps(): OpsState {
  if (memory) return memory;
  memory = typeof window === "undefined" ? SERVER_OPS : readStoredOps();
  return memory;
}

export function setOps(state: OpsState) {
  const next = applyIncoming(state, true);
  broadcast(next);
  return next;
}

export function patchOps(updater: (current: OpsState) => OpsState) {
  return setOps(updater(getOps()));
}

export function subscribeOps(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useOps() {
  return useSyncExternalStore(subscribeOps, getOps, () => SERVER_OPS);
}

export function pushActivity(
  state: OpsState,
  messageFr: string,
  messageAr: string,
  detailFr: string,
  detailAr: string,
): OpsState {
  const activity: Activity = {
    id: uid("act"),
    messageFr,
    messageAr,
    detailFr,
    detailAr,
    at: new Date().toISOString(),
  };
  return { ...state, activities: [activity, ...state.activities] };
}

export function syncReservationToApi(reservation: Reservation, method: "POST" | "PATCH" = "POST") {
  if (typeof window === "undefined") return;
  const url = method === "POST" ? "/api/reservations" : `/api/reservations/${reservation.id}`;
  void fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reservation),
    keepalive: true,
    cache: "no-store",
  }).catch(() => {
    // Local ops store already holds the reservation.
  });
}

export async function pullRemoteReservations() {
  if (typeof window === "undefined") return getOps();
  try {
    const response = await fetch("/api/reservations", { cache: "no-store" });
    if (!response.ok) return getOps();
    const remote = (await response.json()) as Reservation[];
    if (!Array.isArray(remote) || !remote.length) return getOps();
    return patchOps((prev) => {
      const byId = new Map(prev.reservations.map((item) => [item.id, item]));
      let changed = false;
      for (const item of remote) {
        if (!item?.id) continue;
        if (!byId.has(item.id)) {
          byId.set(item.id, item);
          changed = true;
        }
      }
      if (!changed) return prev;
      const reservations = Array.from(byId.values()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      return { ...prev, reservations };
    });
  } catch {
    return getOps();
  }
}
