"use client";

import { ChevronLeft, Truck, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        const [
          { data: vehicleData, error: vehicleError },
          { data: todayEvents }
        ] = await Promise.all([
          supabase.from("vehicles").select("*").order("name"),
          supabase.from("events").select("vehicle_id").eq("event_date", todayStr)
        ]);

        if (vehicleError) throw vehicleError;

        const assignedVehicleIds = new Set();
        (todayEvents || []).forEach(ev => {
          if (ev.vehicle_id) assignedVehicleIds.add(ev.vehicle_id);
        });

        const vehiclesWithDynamicStatus = (vehicleData || []).map(v => ({
          ...v,
          status: v.status === "Maintenance" ? "Maintenance" : (assignedVehicleIds.has(v.id) ? "Booked" : "Available")
        }));

        setVehicles(vehiclesWithDynamicStatus);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicles();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="p-5 flex items-center justify-between border-b border-gray-50">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Vehicles</h1>
        <div className="w-10"></div>
      </div>
      <div className="p-5 space-y-4">
        {loading ? (
          <p className="py-10 text-center text-sm font-medium text-gray-500">Loading vehicles...</p>
        ) : (
          vehicles.map((vehicle, index) => <VehicleCard key={vehicle.id || index} {...vehicle} />)
        )}
      </div>
    </div>
  );
}

function VehicleCard({ id, name, registration_number, status }: any) {
  const statusStyles: any = {
    Available: "bg-green-100 text-success",
    Booked: "bg-red-100 text-danger",
    Rented: "bg-blue-100 text-primary",
    Maintenance: "bg-orange-100 text-warning",
  };

  return (
    <div className="bg-card p-4 rounded-3xl border border-gray-50 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-50">
          <Truck className="text-primary" size={24} />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-sm">{name}</h4>
          <p className="text-[11px] text-gray-500 font-bold uppercase mt-0.5">{registration_number || "No registration"}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("px-2.5 py-1 text-[9px] font-black rounded-full uppercase", statusStyles[status] || "bg-gray-100 text-gray-500")}>
          {status}
        </span>
        <Link href={`/vehicles/${id}/edit`} className="p-2 bg-gray-50 rounded-xl shadow-none border border-gray-100 active:scale-95 transition-transform">
          <Pencil size={14} className="text-gray-600" />
        </Link>
      </div>
    </div>
  );
}
