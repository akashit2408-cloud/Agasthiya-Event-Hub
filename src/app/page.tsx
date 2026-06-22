"use client";

import { Bell, Calendar, Users, Truck, Layers, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatEventDate } from "@/lib/demo-data";

export default function Dashboard() {
  const [summary, setSummary] = useState<any>({
    todays_events: 0,
    available_staff: 0,
    total_staff: 0,
    available_setups: 0,
    total_setups: 0,
    available_vehicles: 0,
    total_vehicles: 0,
  });
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [{ data: summaryData }, { data: eventData }] = await Promise.all([
          supabase.from("dashboard_summary").select("*").single(),
          supabase.from("events")
            .select(`
              id, title, event_type, location, map_link, event_date, event_time, status,
              event_setups (
                quantity,
                setups (name)
              ),
              event_staff (staff (name))
            `)
            .gte("event_date", new Date().toISOString().slice(0, 10))
            .order("event_date")
            .order("event_time")
            .limit(5),
        ]);

        if (summaryData) setSummary(summaryData);
        if (eventData && eventData.length > 0) {
          const formattedEvents = eventData.map((e: any) => ({
            ...e,
            setup_name: e.event_setups?.map((es: any) => `${es.setups?.name} (${es.quantity})`).join(', ') || null,
            staff_count: e.event_staff?.length || 0,
          }));
          setEvents(formattedEvents);
        }
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      }
    }
    fetchDashboard();
  }, []);

  const nextEvent = events[0];

  return (
    <div className="p-5 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-gray-500 flex items-center gap-1">
            <Layers size={14} /> Dashboard
          </h2>
          <div className="mt-4">
            <h1 className="text-2xl font-black text-gray-900">
              Good Morning, <br />
              <span className="text-primary flex items-center gap-2">Akash</span>
            </h1>
            <p className="text-xs text-gray-400 font-bold mt-1">{new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "long", year: "numeric" }).format(new Date())}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/alerts" className="relative p-2 bg-gray-50 rounded-xl">
            <Bell size={24} className="text-gray-700" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-white" />
          </Link>
          <div className="w-12 h-12 rounded-xl bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
            <Calendar className="text-primary" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Today's Events" value={String(summary.todays_events ?? 0)} icon={<Calendar className="text-primary" size={20} />} color="bg-blue-50" />
        <StatCard label="Available Staff" value={`${summary.available_staff ?? 0}/${summary.total_staff ?? 0}`} icon={<Users className="text-success" size={20} />} color="bg-green-50" />
        <StatCard label="Available Setups" value={`${summary.available_setups ?? 0}/${summary.total_setups ?? 0}`} icon={<Layers className="text-purple" size={20} />} color="bg-purple-50" />
        <StatCard label="Available Vehicles" value={`${summary.available_vehicles ?? 0}/${summary.total_vehicles ?? 0}`} icon={<Truck className="text-orange-500" size={20} />} color="bg-orange-50" />
      </div>

      <Link href="/events/create" className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform">
        <Plus size={20} />
        New Event
      </Link>

      <div className="flex justify-between items-end">
        <h3 className="text-lg font-bold text-gray-900">Upcoming Events</h3>
        <Link href="/events" className="text-sm font-bold text-primary">View All</Link>
      </div>

      {nextEvent && (
        <Link href={`/events/${nextEvent.id}`} className="block bg-card p-4 rounded-2xl border border-gray-100 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-50">
                <Layers className="text-primary" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{nextEvent.title}</h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{formatEventDate(nextEvent.event_date, nextEvent.event_time)}</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-primary text-[10px] font-black rounded-full uppercase">{nextEvent.status}</span>
          </div>

          <div className="pt-2 border-t border-dashed border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">{nextEvent.setup_name || "No setup selected"}</span>
              <span className="text-[10px] font-bold text-primary">{nextEvent.staff_count || 0} Staff</span>
            </div>
          </div>
        </Link>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Quick Tools</h3>
        <div className="grid grid-cols-4 gap-4">
          <Link href="/rentals"><ToolIcon icon={<Truck size={20} />} label="Rentals" color="bg-orange-100 text-orange-600" /></Link>
          <Link href="/calendar"><ToolIcon icon={<Calendar size={20} />} label="Calendar" color="bg-blue-100 text-blue-600" /></Link>
          <Link href="/alerts"><ToolIcon icon={<Bell size={20} />} label="Alerts" color="bg-red-100 text-red-600" /></Link>
          <Link href="/reports"><ToolIcon icon={<Layers size={20} />} label="Reports" color="bg-green-100 text-green-600" /></Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className={`${color} p-4 rounded-2xl border border-white shadow-sm space-y-3`}>
      <div className="flex justify-between items-center">
        <span className="p-1.5 bg-white rounded-lg shadow-sm">{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900 leading-tight">{value}</p>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{label}</p>
      </div>
    </div>
  );
}

function ToolIcon({ icon, label, color }: any) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shadow-sm`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">{label}</span>
    </div>
  );
}
