"use client";

import { AlertCircle, ChevronLeft, Calendar, Wrench, IndianRupee, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface DynamicAlert {
  id: string;
  title: string;
  body: string;
  severity: "danger" | "warning" | "info";
  href: string;
  icon: any;
  colorClass: string;
}

export default function AlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<DynamicAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDynamicAlerts() {
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        const next3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        const [
          { count: eventsCount },
          { count: maintenanceCount },
          { count: unpaidCount }
        ] = await Promise.all([
          supabase
            .from("events")
            .select("*", { count: "exact", head: true })
            .gte("event_date", todayStr)
            .lte("event_date", next3Days)
            .not("status", "in", '("completed", "cancelled")'),
          supabase
            .from("rentals")
            .select("*", { count: "exact", head: true })
            .eq("status", "Maintenance"),
          supabase
            .from("event_staff")
            .select("*", { count: "exact", head: true })
            .eq("payment_status", "Unpaid")
        ]);

        const newAlerts: DynamicAlert[] = [];

        if (eventsCount && eventsCount > 0) {
          newAlerts.push({
            id: "upcoming-events",
            title: "Upcoming Events",
            body: `You have ${eventsCount} event${eventsCount > 1 ? 's' : ''} scheduled in the next 3 days. Make sure crew is assigned!`,
            severity: "info",
            href: "/events",
            icon: Calendar,
            colorClass: "bg-blue-50 text-blue-600 border-blue-100"
          });
        }

        if (unpaidCount && unpaidCount > 0) {
          newAlerts.push({
            id: "unpaid-staff",
            title: "Unpaid Staff Assignments",
            body: `There are ${unpaidCount} crew assignments marked as 'Unpaid'. Please settle payments.`,
            severity: "danger",
            href: "/events",
            icon: IndianRupee,
            colorClass: "bg-red-50 text-red-600 border-red-100"
          });
        }

        if (maintenanceCount && maintenanceCount > 0) {
          newAlerts.push({
            id: "maintenance",
            title: "Equipment Maintenance",
            body: `You have ${maintenanceCount} rental item${maintenanceCount > 1 ? 's' : ''} currently in 'Maintenance'. Check their repair status.`,
            severity: "warning",
            href: "/rentals",
            icon: Wrench,
            colorClass: "bg-orange-50 text-orange-600 border-orange-100"
          });
        }

        setAlerts(newAlerts);
      } catch (err) {
        console.error("Error fetching dynamic alerts:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDynamicAlerts();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] pb-10">
      <div className="bg-white p-5 flex items-center justify-between border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-50 active:scale-95 transition-all">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-[19px] font-extrabold text-gray-900">Alerts & Notifications</h1>
        <div className="w-10" />
      </div>

      <div className="p-5 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <p className="text-sm font-bold text-gray-500">Scanning for alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
             <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border-4 border-emerald-100/50 shadow-sm">
                <AlertCircle size={28} className="text-emerald-500" />
             </div>
             <p className="text-[17px] font-extrabold text-gray-900 mb-1.5">All Clear!</p>
             <p className="text-sm text-gray-500 max-w-[250px]">You have no urgent alerts right now. Everything is running smoothly.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const Icon = alert.icon;
              return (
                <Link key={alert.id} href={alert.href} className="block active:scale-[0.98] transition-transform">
                  <div className={cn("p-4 rounded-[20px] border shadow-sm flex gap-4", alert.colorClass)}>
                    <div className="mt-1 w-11 h-11 shrink-0 bg-white/60 rounded-full shadow-sm backdrop-blur-sm flex items-center justify-center">
                      <Icon size={22} className="currentColor" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-[15px] mb-0.5 tracking-tight">{alert.title}</h4>
                      <p className="text-[13px] font-medium opacity-90 leading-snug text-gray-700">{alert.body}</p>
                      <div className="mt-2.5 inline-flex items-center text-[11px] font-bold uppercase tracking-wider text-inherit bg-white/40 px-2 py-1 rounded shadow-sm">
                        Take Action →
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
