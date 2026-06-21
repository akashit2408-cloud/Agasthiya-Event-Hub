"use client";

import { ChevronLeft, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatEventDate } from "@/lib/demo-data";

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
            id, title, event_date, event_time, status,
            setups (name),
            event_staff (staff (id))
          `)
          .order("event_date")
          .order("event_time");
          
        if (error) throw error;
        
        const formattedEvents = (data || []).map((e: any) => ({
          ...e,
          setup_name: e.setups?.name,
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

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="p-5 flex items-center justify-between border-b border-gray-50">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Calendar View</h1>
        <div className="w-10" />
      </div>
      <div className="p-5 space-y-3">
        {events.map((event, index) => (
          <div key={event.id || index} className="bg-card p-4 rounded-3xl border border-gray-50 flex gap-3">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-50">
              <Calendar className="text-primary" size={22} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">{event.title}</h4>
              <p className="text-[11px] font-bold text-gray-500 uppercase">{formatEventDate(event.event_date, event.event_time)}</p>
              <p className="text-xs text-gray-500 mt-1">{event.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
