import { NextResponse } from "next/server";
import { listReservations, upsertReservation } from "lib/ops-server";
import type { Reservation } from "lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export function GET() {
  return NextResponse.json(listReservations(), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Reservation>;
  if (!body?.id || !body.code || !body.vehicleId) {
    return NextResponse.json({ error: "Invalid reservation" }, { status: 400 });
  }
  const reservation: Reservation = {
    id: String(body.id),
    code: String(body.code),
    clientName: String(body.clientName || ""),
    clientPhone: String(body.clientPhone || ""),
    clientEmail: String(body.clientEmail || ""),
    vehicleId: String(body.vehicleId),
    pickupType: body.pickupType === "airport" || body.pickupType === "delivery" ? body.pickupType : "agency",
    location: String(body.location || "Agence Principale"),
    startAt: String(body.startAt || new Date().toISOString()),
    endAt: String(body.endAt || new Date().toISOString()),
    status: body.status === "confirmed" || body.status === "cancelled" || body.status === "converted" ? body.status : "pending",
    total: Number(body.total) || 0,
    createdAt: String(body.createdAt || new Date().toISOString()),
  };
  return NextResponse.json(upsertReservation(reservation), { status: 201 });
}
