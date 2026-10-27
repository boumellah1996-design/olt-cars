import { NextResponse } from "next/server";
import { patchReservation, upsertReservation } from "lib/ops-server";
import type { Reservation } from "lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = (await request.json()) as Partial<Reservation>;
  const updated = body.id
    ? upsertReservation({ ...(body as Reservation), id: params.id })
    : patchReservation(params.id, body);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}
