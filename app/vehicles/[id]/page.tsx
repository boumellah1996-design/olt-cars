import { unstable_noStore as noStore } from "next/cache";
import { headers } from "next/headers";
import { listVehicles } from "lib/fleet-server";
import { VehicleDetailClient } from "./vehicle-detail-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export default function VehicleDetailPage({ params }: { params: { id: string } }) {
  noStore();
  void headers();
  const initialVehicle = listVehicles().find((item) => item.id === params.id) ?? null;
  return <VehicleDetailClient initialVehicle={initialVehicle} />;
}
