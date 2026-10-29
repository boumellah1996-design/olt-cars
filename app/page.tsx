import { unstable_noStore as noStore } from "next/cache";
import { headers } from "next/headers";
import { HomePageClient } from "@/components/frontend/HomePageClient";
import { listVehicles } from "lib/fleet-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export default function HomePage() {
  noStore();
  void headers();
  const initialVehicles = listVehicles();
  return <HomePageClient initialVehicles={initialVehicles} />;
}
