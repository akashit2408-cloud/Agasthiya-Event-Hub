"use client";

import { ChevronLeft, Calendar, Layers, Clock, Users, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatEventDate } from "@/lib/demo-data";
import Link from "next/link";

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from("events")
          .select(`
            id, title, event_type, location, event_date, event_time, status,
            event_setups (
              quantity,
              setups (name)
            ),
            event_staff (staff (id))
          `)
          .order("event_date")
          .order("event_time");
          
        if (error) throw error;
        
        const formattedEvents = (data || []).map((e: any) => ({
          ...e,
          setup_name: e.event_setups?.map((es: any) => `${es.setups?.name} (${es.quantity})`).join(', ') || null,
          staff_count: e.event_staff?.length || 0
        }));
        
        setEvents(formattedEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

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
        
        <div className="relative z-10 px-5 pt-6 pb-8">
          <div className="flex items-center justify-between">
            <button onClick={() => router.back()} className="p-2 -ml-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 active:scale-90 transition-transform">
              <ChevronLeft size={24} className="text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">Calendar</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {loading ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : events.length === 0 ? (
           <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <Calendar size={22} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400 font-medium">No events found</p>
            </div>
        ) : (
          events.map((event, index) => (
            <Link key={event.id || index} href={`/events/${event.id}`} className="event-card block bg-white rounded-2xl overflow-hidden border border-gray-100/80 active:scale-[0.98] transition-all duration-200" style={{ animationDelay: `${index * 50}ms` }}>
              <div className={`h-1.5 w-full bg-gradient-to-r ${getEventTypeColor(event.event_type)}`} />
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getEventTypeColor(event.event_type)} flex items-center justify-center shadow-sm`}>
                      <Calendar className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-[15px]">{event.title}</h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={11} className="text-gray-400" />
                        <p className="text-[11px] text-gray-500 font-semibold">{formatEventDate(event.event_date, event.event_time)}</p>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide ${getStatusStyle(event.status)}`}>
                    {event.status}
                  </span>
                </div>

                <div className="pt-2.5 border-t border-dashed border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Layers size={12} className="text-gray-400" />
                      <span className="text-[12px] text-gray-500 font-medium">{event.setup_name || "No setup"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-primary" />
                      <span className="text-[12px] font-bold text-primary">{event.staff_count || 0} Staff</span>
                    </div>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <MapPin size={12} className="text-gray-400" />
                      <span className="text-[12px] text-gray-400 font-medium">{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
