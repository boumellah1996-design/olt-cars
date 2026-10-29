import { unstable_noStore as noStore } from "next/cache";
import { headers } from "next/headers";
import { listVehicles } from "lib/fleet-server";
import { VehiclesPageClient } from "./vehicles-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export default function VehiclesPage() {
  noStore();
  void headers();
  const initialVehicles = listVehicles();
  return <VehiclesPageClient initialVehicles={initialVehicles} />;
}
