// The cars Jogja Travel drives, with their day rates. Edited in /admin/fleet; read with getFleet()
// from @/lib/content/public. All amounts are whole rupiah.
import type { VehicleRecord } from "@/lib/content/schema";

export type Vehicle = Omit<VehicleRecord, "published">;
