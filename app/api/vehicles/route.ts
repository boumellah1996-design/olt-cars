import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { listVehicles, replaceVehicles } from "lib/fleet-server";
import type { Vehicle } from "lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

function purgeVehicleCaches() {
  revalidatePath("/", "layout");
  revalidatePath("/vehicles", "layout");
  revalidatePath("/vehicles", "page");
  revalidatePath("/booking", "layout");
  revalidatePath("/admin/vehicles", "layout");
}

export function GET() {
  return NextResponse.json(listVehicles(), { headers: NO_STORE });
}

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid fleet payload" }, { status: 400, headers: NO_STORE });
  }
  const vehicles = Array.isArray(body)
    ? (body as Vehicle[])
    : Array.isArray((body as { vehicles?: Vehicle[] })?.vehicles)
      ? (body as { vehicles: Vehicle[] }).vehicles
      : null;
  if (!vehicles) {
    return NextResponse.json({ error: "Invalid fleet payload" }, { status: 400, headers: NO_STORE });
  }
  const saved = replaceVehicles(
    vehicles.filter((item) => item && typeof item.id === "string" && item.brand && item.model),
  );
  purgeVehicleCaches();
  return NextResponse.json(saved, { headers: NO_STORE });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing vehicle id" }, { status: 400, headers: NO_STORE });
  }
  const saved = replaceVehicles(listVehicles().filter((item) => item.id !== id));
  purgeVehicleCaches();
  return NextResponse.json(saved, { headers: NO_STORE });
}
