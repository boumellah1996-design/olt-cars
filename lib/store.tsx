"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { addToFleet, getFleet, normalizeVehicle, updateFleet, useFleet } from "./fleet";
import { getOps, patchOps, pullRemoteReservations, pushActivity, syncReservationToApi, useOps } from "./ops";
import type {
  AppState,
  CashMovement,
  Client,
  Expense,
  Payment,
  PickupType,
  Reservation,
  Vehicle,
} from "./types";
import { daysBetween, isLate, nextCode, sameDay, uid } from "./utils";

export { brandKey, normalizeVehicle, useFleet } from "./fleet";

const AUTH_KEY = "olt-admin-auth";

type StoreContextValue = {
  state: AppState;
  hydrated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  createReservation: (payload: {
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    vehicleId: string;
    pickupType: PickupType;
    location: string;
    startAt: string;
    endAt: string;
  }) => Reservation;
  confirmReservation: (id: string) => void;
  cancelReservation: (id: string) => void;
  convertReservation: (id: string) => void;
  completeRental: (id: string) => void;
  addPayment: (payload: Omit<Payment, "id">) => void;
  addClient: (payload: Omit<Client, "id" | "createdAt">) => void;
  addVehicle: (payload: Omit<Vehicle, "id">) => void;
  addExpense: (payload: Omit<Expense, "id">) => void;
  addCash: (payload: Omit<CashMovement, "id">) => void;
  kpis: ReturnType<typeof computeKpis>;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function computeKpis(state: AppState) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const rentals = state.rentals.map((rental) =>
    isLate(rental, now) && rental.status !== "completed" ? { ...rental, status: "late" as const } : rental,
  );
  const available = state.vehicles.filter((v) => v.status === "available").length;
  const reserved = state.vehicles.filter((v) => v.status === "reserved").length;
  const rented = state.vehicles.filter((v) => v.status === "rented").length;
  const maintenance = state.vehicles.filter((v) => v.status === "maintenance").length;
  const unavailable = state.vehicles.filter((v) => v.status === "unavailable").length;
  const pending = state.reservations.filter((r) => r.status === "pending");
  const late = rentals.filter((r) => r.status === "late");
  const unpaid = rentals.reduce((sum, r) => sum + Math.max(0, r.total - r.paid), 0);
  const caToday = state.payments.filter((p) => sameDay(p.at)).reduce((sum, p) => sum + p.amount, 0);
  const caMonth = state.payments
    .filter((p) => {
      const d = new Date(p.at);
      return d.getMonth() === month && d.getFullYear() === year;
    })
    .reduce((sum, p) => sum + p.amount, 0);
  const departures = [...state.reservations, ...rentals].filter((item) => sameDay(item.startAt)).length;
  const returns = rentals.filter((item) => sameDay(item.endAt)).length;
  const newRes = state.reservations.filter((r) => sameDay(r.createdAt)).length;

  return {
    available,
    reserved,
    rented,
    maintenance,
    unavailable,
    totalVehicles: state.vehicles.length,
    pendingCount: pending.length,
    late,
    unpaid,
    caToday,
    caMonth,
    departures,
    returns,
    newRes,
    pending,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const ops = useOps();
  const { vehicles } = useFleet();
  const liveState = useMemo(() => ({ ...ops, vehicles }), [ops, vehicles]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIsAdmin(window.localStorage.getItem(AUTH_KEY) === "1");
    setHydrated(true);
    void pullRemoteReservations();
  }, []);

  const api = useMemo<StoreContextValue>(() => {
    return {
      state: liveState,
      hydrated,
      isAdmin,
      kpis: computeKpis(liveState),
      login: (email, password) => {
        const ok =
          email.trim().toLowerCase() === "riadboumellah94@gmail.com" && password === "admin";
        if (ok) {
          window.localStorage.setItem(AUTH_KEY, "1");
          setIsAdmin(true);
        }
        return ok;
      },
      logout: () => {
        window.localStorage.removeItem(AUTH_KEY);
        setIsAdmin(false);
      },
      createReservation: (payload) => {
        const vehicle = getFleet().find((v) => v.id === payload.vehicleId);
        const days = daysBetween(payload.startAt, payload.endAt);
        const reservation: Reservation = {
          id: uid("res"),
          code: nextCode("OLT-RES", getOps().reservations.map((r) => r.code)),
          ...payload,
          status: "pending",
          total: (vehicle?.pricePerDay ?? 0) * days,
          createdAt: new Date().toISOString(),
        };
        updateFleet((current) =>
          current.map((v) =>
            v.id === payload.vehicleId && v.status === "available" ? { ...v, status: "reserved" as const } : v,
          ),
        );
        patchOps((prev) =>
          pushActivity(
            { ...prev, reservations: [reservation, ...prev.reservations] },
            `Nouvelle réservation ${reservation.code}`,
            `حجز جديد ${reservation.code}`,
            `${payload.clientName} · ${vehicle?.brand} ${vehicle?.model}`,
            `${payload.clientName} · ${vehicle?.brand} ${vehicle?.model}`,
          ),
        );
        syncReservationToApi(reservation);
        return reservation;
      },
      confirmReservation: (id) => {
        const current = getOps().reservations.find((r) => r.id === id);
        if (!current) return;
        const reservation = { ...current, status: "confirmed" as const };
        patchOps((prev) =>
          pushActivity(
            {
              ...prev,
              reservations: prev.reservations.map((r) => (r.id === id ? reservation : r)),
            },
            `Réservation ${reservation.code} confirmée`,
            `تم تأكيد الحجز ${reservation.code}`,
            reservation.clientName,
            reservation.clientName,
          ),
        );
        syncReservationToApi(reservation, "PATCH");
      },
      cancelReservation: (id) => {
        const opsState = getOps();
        const current = opsState.reservations.find((r) => r.id === id);
        if (!current) return;
        const stillUsed = opsState.reservations.some(
          (r) => r.id !== id && r.vehicleId === current.vehicleId && r.status !== "cancelled",
        );
        updateFleet((list) =>
          list.map((v) =>
            v.id === current.vehicleId && !stillUsed && v.status === "reserved" ? { ...v, status: "available" as const } : v,
          ),
        );
        const reservation = { ...current, status: "cancelled" as const };
        patchOps((prev) =>
          pushActivity(
            {
              ...prev,
              reservations: prev.reservations.map((r) => (r.id === id ? reservation : r)),
            },
            `Réservation ${reservation.code} annulée`,
            `تم إلغاء الحجز ${reservation.code}`,
            reservation.clientName,
            reservation.clientName,
          ),
        );
        syncReservationToApi(reservation, "PATCH");
      },
      convertReservation: (id) => {
        const current = getOps().reservations.find((r) => r.id === id);
        if (!current) return;
        const rental = {
          id: uid("loc"),
          code: nextCode("OLT-LOC", getOps().rentals.map((r) => r.code)),
          reservationId: current.id,
          clientName: current.clientName,
          clientPhone: current.clientPhone,
          vehicleId: current.vehicleId,
          startAt: current.startAt,
          endAt: current.endAt,
          status: "active" as const,
          total: current.total,
          paid: 0,
          createdAt: new Date().toISOString(),
        };
        updateFleet((list) => list.map((v) => (v.id === current.vehicleId ? { ...v, status: "rented" as const } : v)));
        const reservation = { ...current, status: "converted" as const };
        patchOps((prev) =>
          pushActivity(
            {
              ...prev,
              reservations: prev.reservations.map((r) => (r.id === id ? reservation : r)),
              rentals: [rental, ...prev.rentals],
            },
            `Location ${rental.code} créée`,
            `تم إنشاء عقد ${rental.code}`,
            current.clientName,
            current.clientName,
          ),
        );
        syncReservationToApi(reservation, "PATCH");
      },
      completeRental: (id) => {
        const rental = getOps().rentals.find((r) => r.id === id);
        if (!rental) return;
        updateFleet((list) => list.map((v) => (v.id === rental.vehicleId ? { ...v, status: "available" as const } : v)));
        patchOps((prev) =>
          pushActivity(
            {
              ...prev,
              rentals: prev.rentals.map((r) => (r.id === id ? { ...r, status: "completed" as const } : r)),
            },
            `Location ${rental.code} clôturée`,
            `تم إغلاق العقد ${rental.code}`,
            rental.clientName,
            rental.clientName,
          ),
        );
      },
      addPayment: (payload) => {
        const payment: Payment = { ...payload, id: uid("pay") };
        patchOps((prev) =>
          pushActivity(
            {
              ...prev,
              payments: [payment, ...prev.payments],
              rentals: prev.rentals.map((r) =>
                r.id === payload.rentalId ? { ...r, paid: r.paid + payload.amount } : r,
              ),
              cash: [
                {
                  id: uid("cash"),
                  type: "in" as const,
                  amount: payload.amount,
                  at: payload.at,
                  note: payload.note || "Encaissement",
                },
                ...prev.cash,
              ],
            },
            `Paiement ${payload.amount} DA`,
            `تحصيل ${payload.amount} دج`,
            payload.clientName,
            payload.clientName,
          ),
        );
      },
      addClient: (payload) => {
        patchOps((prev) => ({
          ...prev,
          clients: [{ ...payload, id: uid("cli"), createdAt: new Date().toISOString() }, ...prev.clients],
        }));
      },
      addVehicle: (payload) => {
        addToFleet(normalizeVehicle({ ...payload, id: uid("veh"), status: payload.status || "available" }));
      },
      addExpense: (payload) => {
        patchOps((prev) => ({
          ...prev,
          expenses: [{ ...payload, id: uid("exp") }, ...prev.expenses],
          cash: [{ id: uid("cash"), type: "out", amount: payload.amount, at: payload.at, note: payload.note }, ...prev.cash],
        }));
      },
      addCash: (payload) => {
        patchOps((prev) => ({
          ...prev,
          cash: [{ ...payload, id: uid("cash") }, ...prev.cash],
        }));
      },
    };
  }, [liveState, isAdmin, hydrated]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
