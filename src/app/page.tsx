"use client";

import { Bell, Calendar, Users, Truck, Layers, Plus, MapPin, Clock } from "lucide-react";
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
  const [adminName, setAdminName] = useState("Mari");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Fetch profile name
    const localProfile = localStorage.getItem("admin_profile");
    if (localProfile) {
      try {
        const parsed = JSON.parse(localProfile);
        if (parsed.name) {
          // Get the first name
          setAdminName(parsed.name.split(' ')[0]);
        }
      } catch (e) {}
    }

    async function fetchDashboard() {
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        const [
          { data: totalStaff },
          { data: totalSetups },
          { data: totalVehicles },
          { data: todayEventsData },
          { data: eventData }
        ] = await Promise.all([
          supabase.from("staff").select("id"),
          supabase.from("setups").select("id"),
          supabase.from("vehicles").select("id"),
          supabase.from("events").select("id, vehicle_id, event_staff(staff_id), event_setups(setup_id)").eq("event_date", todayStr),
          supabase.from("events")
            .select(`
              id, title, event_type, location, map_link, event_date, event_time, status,
              event_setups (
                quantity,
                setups (name)
              ),
              event_staff (staff (name))
            `)
            .gte("event_date", todayStr)
            .order("event_date")
            .order("event_time")
            .limit(5),
        ]);

        const totalStaffCount = totalStaff?.length || 0;
        const totalSetupsCount = totalSetups?.length || 0;
        const totalVehiclesCount = totalVehicles?.length || 0;

        const assignedStaffIds = new Set();
        const assignedSetupIds = new Set();
        const assignedVehicleIds = new Set();

        (todayEventsData || []).forEach(ev => {
          if (ev.vehicle_id) assignedVehicleIds.add(ev.vehicle_id);
          (ev.event_staff || []).forEach((s: any) => assignedStaffIds.add(s.staff_id));
          (ev.event_setups || []).forEach((s: any) => assignedSetupIds.add(s.setup_id));
        });

        setSummary({
          todays_events: todayEventsData?.length || 0,
          total_staff: totalStaffCount,
          available_staff: Math.max(0, totalStaffCount - assignedStaffIds.size),
          total_setups: totalSetupsCount,
          available_setups: Math.max(0, totalSetupsCount - assignedSetupIds.size),
          total_vehicles: totalVehiclesCount,
          available_vehicles: Math.max(0, totalVehiclesCount - assignedVehicleIds.size),
        });


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
      } finally {
        setIsLoaded(true);
      }
    }
    fetchDashboard();
  }, []);

  if (!isLoaded) {
    return <div className="min-h-screen bg-gray-50/50"></div>;
  }

  const nextEvent = events[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getEventTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "wedding": return "from-pink-500 to-rose-500";
      case "birthday": return "from-amber-400 to-orange-500";
      case "corporate": return "from-blue-500 to-indigo-500";
      default: return "from-emerald-400 to-teal-500";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed": return "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200";
      case "completed": return "bg-blue-50 text-blue-600 ring-1 ring-blue-200";
      case "cancelled": return "bg-red-50 text-red-600 ring-1 ring-red-200";
      default: return "bg-amber-50 text-amber-600 ring-1 ring-amber-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* ── Gradient Header ── */}
      <div className="dashboard-header relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.3),_transparent_60%)]" />
        <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-white/5 blur-xl" />
        <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-white/5 blur-xl" />
        
        <div className="relative z-10 px-5 pt-6 pb-20">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-semibold text-blue-100 uppercase tracking-widest">Dashboard</span>
              </div>
              <h1 className="text-[26px] font-extrabold text-white leading-tight">
                {getGreeting()},
                <br />
                <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">{adminName}</span>
              </h1>
              <p className="text-[13px] text-blue-200/80 font-medium mt-1.5">
                {new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date())}
              </p>
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <Link href="/alerts" className="relative p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 active:scale-90 transition-transform">
                <Bell size={20} className="text-white" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border-2 border-[#1e3a8a] animate-pulse" />
              </Link>
              <Link href="/calendar" className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 active:scale-90 transition-transform">
                <Calendar size={20} className="text-white" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards (overlapping header) ── */}
      <div className="px-4 -mt-14 relative z-20">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Today's Events"
            value={String(summary.todays_events ?? 0)}
            icon={<Calendar size={18} />}
            accentColor="border-l-blue-500"
            iconBg="bg-blue-50 text-blue-600"
            delay="0"
          />
          <StatCard
            label="Available Crew"
            value={`${summary.available_staff ?? 0}/${summary.total_staff ?? 0}`}
            icon={<Users size={18} />}
            accentColor="border-l-emerald-500"
            iconBg="bg-emerald-50 text-emerald-600"
            delay="1"
          />
          <StatCard
            label="Available Setups"
            value={`${summary.available_setups ?? 0}/${summary.total_setups ?? 0}`}
            icon={<Layers size={18} />}
            accentColor="border-l-violet-500"
            iconBg="bg-violet-50 text-violet-600"
            delay="2"
          />
          <StatCard
            label="Available Vehicles"
            value={`${summary.available_vehicles ?? 0}/${summary.total_vehicles ?? 0}`}
            icon={<Truck size={18} />}
            accentColor="border-l-orange-500"
            iconBg="bg-orange-50 text-orange-600"
            delay="3"
          />
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="px-4 pt-5 pb-4 space-y-5">
        {/* New Event Button */}
        <Link href="/events/create" className="gradient-btn flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl font-bold text-white text-[15px] active:scale-[0.97] transition-all duration-200">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
            <Plus size={18} strokeWidth={3} />
          </div>
          Create New Event
        </Link>

        {/* Upcoming Events */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[16px] font-bold text-gray-900">Upcoming Events</h3>
            <Link href="/events" className="text-[13px] font-semibold text-primary flex items-center gap-1 active:opacity-60">
              View All
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
          </div>

          {nextEvent ? (
            <Link href={`/events/${nextEvent.id}`} className="event-card block bg-white rounded-2xl overflow-hidden border border-gray-100/80 active:scale-[0.98] transition-all duration-200">
              <div className={`h-1.5 w-full bg-gradient-to-r ${getEventTypeColor(nextEvent.event_type)}`} />
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getEventTypeColor(nextEvent.event_type)} flex items-center justify-center shadow-sm`}>
                      <Layers className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-[15px]">{nextEvent.title}</h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={11} className="text-gray-400" />
                        <p className="text-[11px] text-gray-500 font-semibold">{formatEventDate(nextEvent.event_date, nextEvent.event_time)}</p>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide ${getStatusStyle(nextEvent.status)}`}>
                    {nextEvent.status}
                  </span>
                </div>

                <div className="pt-2.5 border-t border-dashed border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Layers size={12} className="text-gray-400" />
                      <span className="text-[12px] text-gray-500 font-medium">{nextEvent.setup_name || "No setup"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-primary" />
                      <span className="text-[12px] font-bold text-primary">{nextEvent.staff_count || 0} Crew</span>
                    </div>
                  </div>
                  {nextEvent.location && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <MapPin size={12} className="text-gray-400" />
                      <span className="text-[12px] text-gray-400 font-medium">{nextEvent.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <Calendar size={22} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400 font-medium">No upcoming events</p>
              <p className="text-xs text-gray-300 mt-1">Create one to get started!</p>
            </div>
          )}
        </div>

        {/* Quick Tools */}
        <div>
          <h3 className="text-[16px] font-bold text-gray-900 mb-3">Quick Tools</h3>
          <div className="grid grid-cols-4 gap-3">
            <Link href="/rentals"><ToolIcon icon={<Truck size={20} />} label="Rentals" gradient="from-orange-400 to-amber-500" /></Link>
            <Link href="/calendar"><ToolIcon icon={<Calendar size={20} />} label="Calendar" gradient="from-blue-500 to-indigo-500" /></Link>
            <Link href="/alerts"><ToolIcon icon={<Bell size={20} />} label="Alerts" gradient="from-rose-400 to-pink-500" /></Link>
            <Link href="/reports"><ToolIcon icon={<Layers size={20} />} label="Reports" gradient="from-emerald-400 to-teal-500" /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, accentColor, iconBg, delay }: any) {
  return (
    <div
      className={`stat-card bg-white p-3.5 rounded-2xl border-l-[3px] ${accentColor} shadow-[0_2px_12px_rgba(0,0,0,0.04)] active:scale-[0.97] transition-all duration-200`}
      style={{ animationDelay: `${delay * 80}ms` }}
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[22px] font-extrabold text-gray-900 leading-none">{value}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5 truncate">{label}</p>
        </div>
      </div>
    </div>
  );
}

function ToolIcon({ icon, label, gradient }: any) {
  return (
    <div className="flex flex-col items-center gap-2 active:scale-90 transition-transform duration-200">
      <div className={`tool-icon w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{label}</span>
    </div>
  );
}
