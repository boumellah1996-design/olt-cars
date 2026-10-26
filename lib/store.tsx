"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initialState } from "./data";
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

const STORAGE_KEY = "olt-app-state";
const AUTH_KEY = "olt-admin-auth";

type StoreContextValue = {
  state: AppState;
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

function pushActivity(
  state: AppState,
  messageFr: string,
  messageAr: string,
  detailFr: string,
  detailAr: string,
): AppState {
  return {
    ...state,
    activities: [
      {
        id: uid("act"),
        messageFr,
        messageAr,
        detailFr,
        detailAr,
        at: new Date().toISOString(),
      },
      ...state.activities,
    ],
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setState(JSON.parse(raw) as AppState);
      } catch {
        setState(initialState);
      }
    }
    setIsAdmin(window.localStorage.getItem(AUTH_KEY) === "1");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const api = useMemo<StoreContextValue>(() => {
    return {
      state,
      isAdmin,
      kpis: computeKpis(state),
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
        const vehicle = state.vehicles.find((v) => v.id === payload.vehicleId);
        const days = daysBetween(payload.startAt, payload.endAt);
        const reservation: Reservation = {
          id: uid("res"),
          code: nextCode("OLT-RES", state.reservations.map((r) => r.code)),
          ...payload,
          status: "pending",
          total: (vehicle?.pricePerDay ?? 0) * days,
          createdAt: new Date().toISOString(),
        };
        setState((prev) => {
          const next = {
            ...prev,
            reservations: [reservation, ...prev.reservations],
            vehicles: prev.vehicles.map((v) =>
              v.id === payload.vehicleId && v.status === "available" ? { ...v, status: "reserved" as const } : v,
            ),
          };
          return pushActivity(
            next,
            `Nouvelle réservation ${reservation.code}`,
            `حجز جديد ${reservation.code}`,
            `${payload.clientName} · ${vehicle?.brand} ${vehicle?.model}`,
            `${payload.clientName} · ${vehicle?.brand} ${vehicle?.model}`,
          );
        });
        return reservation;
      },
      confirmReservation: (id) => {
        setState((prev) => {
          const res = prev.reservations.find((r) => r.id === id);
          if (!res) return prev;
          const next = {
            ...prev,
            reservations: prev.reservations.map((r) => (r.id === id ? { ...r, status: "confirmed" as const } : r)),
          };
          return pushActivity(next, `Réservation ${res.code} confirmée`, `تم تأكيد الحجز ${res.code}`, res.clientName, res.clientName);
        });
      },
      cancelReservation: (id) => {
        setState((prev) => {
          const res = prev.reservations.find((r) => r.id === id);
          if (!res) return prev;
          const stillUsed = prev.reservations.some((r) => r.id !== id && r.vehicleId === res.vehicleId && r.status !== "cancelled");
          const next = {
            ...prev,
            reservations: prev.reservations.map((r) => (r.id === id ? { ...r, status: "cancelled" as const } : r)),
            vehicles: prev.vehicles.map((v) =>
              v.id === res.vehicleId && !stillUsed && v.status === "reserved" ? { ...v, status: "available" as const } : v,
            ),
          };
          return pushActivity(next, `Réservation ${res.code} annulée`, `تم إلغاء الحجز ${res.code}`, res.clientName, res.clientName);
        });
      },
      convertReservation: (id) => {
        setState((prev) => {
          const res = prev.reservations.find((r) => r.id === id);
          if (!res) return prev;
          const rental = {
            id: uid("loc"),
            code: nextCode("OLT-LOC", prev.rentals.map((r) => r.code)),
            reservationId: res.id,
            clientName: res.clientName,
            clientPhone: res.clientPhone,
            vehicleId: res.vehicleId,
            startAt: res.startAt,
            endAt: res.endAt,
            status: "active" as const,
            total: res.total,
            paid: 0,
            createdAt: new Date().toISOString(),
          };
          const next = {
            ...prev,
            reservations: prev.reservations.map((r) => (r.id === id ? { ...r, status: "converted" as const } : r)),
            rentals: [rental, ...prev.rentals],
            vehicles: prev.vehicles.map((v) => (v.id === res.vehicleId ? { ...v, status: "rented" as const } : v)),
          };
          return pushActivity(next, `Location ${rental.code} créée`, `تم إنشاء عقد ${rental.code}`, res.clientName, res.clientName);
        });
      },
      completeRental: (id) => {
        setState((prev) => {
          const rental = prev.rentals.find((r) => r.id === id);
          if (!rental) return prev;
          const next = {
            ...prev,
            rentals: prev.rentals.map((r) => (r.id === id ? { ...r, status: "completed" as const } : r)),
            vehicles: prev.vehicles.map((v) => (v.id === rental.vehicleId ? { ...v, status: "available" as const } : v)),
          };
          return pushActivity(next, `Location ${rental.code} clôturée`, `تم إغلاق العقد ${rental.code}`, rental.clientName, rental.clientName);
        });
      },
      addPayment: (payload) => {
        setState((prev) => {
          const payment: Payment = { ...payload, id: uid("pay") };
          const next = {
            ...prev,
            payments: [payment, ...prev.payments],
            rentals: prev.rentals.map((r) =>
              r.id === payload.rentalId ? { ...r, paid: r.paid + payload.amount } : r,
            ),
            cash: [
              { id: uid("cash"), type: "in" as const, amount: payload.amount, at: payload.at, note: payload.note || "Encaissement" },
              ...prev.cash,
            ],
          };
          return pushActivity(next, `Paiement ${payload.amount} DA`, `تحصيل ${payload.amount} دج`, payload.clientName, payload.clientName);
        });
      },
      addClient: (payload) => {
        setState((prev) => ({
          ...prev,
          clients: [{ ...payload, id: uid("cli"), createdAt: new Date().toISOString() }, ...prev.clients],
        }));
      },
      addVehicle: (payload) => {
        setState((prev) => ({
          ...prev,
          vehicles: [{ ...payload, id: uid("veh") }, ...prev.vehicles],
        }));
      },
      addExpense: (payload) => {
        setState((prev) => ({
          ...prev,
          expenses: [{ ...payload, id: uid("exp") }, ...prev.expenses],
          cash: [{ id: uid("cash"), type: "out", amount: payload.amount, at: payload.at, note: payload.note }, ...prev.cash],
        }));
      },
      addCash: (payload) => {
        setState((prev) => ({
          ...prev,
          cash: [{ ...payload, id: uid("cash") }, ...prev.cash],
        }));
      },
    };
  }, [state, isAdmin]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
