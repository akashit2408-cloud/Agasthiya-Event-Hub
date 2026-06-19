"use client";

import { AlertCircle, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function AlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAlerts() {
      const { data, error } = await supabase.from("alerts").select("*").order("created_at", { ascending: false });
      if (!error && data) setAlerts(data);
    }
    fetchAlerts().catch((err) => console.error("Error fetching alerts:", err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="p-5 flex items-center justify-between border-b border-gray-50">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Alerts</h1>
        <div className="w-10" />
      </div>
      <div className="p-5 space-y-3">
        {alerts.length === 0 ? (
          <p className="py-10 text-center text-sm font-medium text-gray-500">No alerts yet.</p>
        ) : alerts.map((alert) => (
          <div key={alert.id} className="bg-card p-4 rounded-3xl border border-gray-50 flex gap-3">
            <AlertCircle className={cn("mt-0.5", alert.severity === "danger" ? "text-danger" : alert.severity === "warning" ? "text-warning" : "text-primary")} size={22} />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">{alert.title}</h4>
              <p className="text-xs text-gray-500 mt-1">{alert.body || "No details"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
