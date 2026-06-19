"use client";

import { Search, Filter, Calendar, MapPin, Users, Truck, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { demoEvents, formatEventDate } from "@/lib/demo-data";

const tabs = ["All", "Today", "Upcoming", "Completed"];

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [events, setEvents] = useState<any[]>(demoEvents);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase.from("event_list").select("*").order("event_date").order("event_time");
        if (error) throw error;
        setEvents(data && data.length > 0 ? data : demoEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setEvents(demoEvents);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const filteredEvents = events.filter((event) => {
    if (activeTab === "Today") return event.event_date === today;
    if (activeTab === "Upcoming") return event.event_date > today && event.status !== "Cancelled";
    if (activeTab === "Completed") return event.status === "Completed";
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="p-5 pb-2 space-y-4">
        <div className="flex items-center gap-4">
          <button className="p-2 -ml-2"><Filter size={20} className="text-gray-900" /></button>
          <h1 className="text-xl font-bold text-gray-900">Events</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search events..."
            className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2">
            <Filter size={18} className="text-primary" />
          </button>
        </div>

        <div className="flex justify-between border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-3 px-2 text-xs font-bold transition-all relative",
                activeTab === tab ? "text-primary" : "text-gray-400"
              )}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-4 overflow-y-auto">
        {loading ? (
          <p className="py-10 text-center text-sm font-medium text-gray-500">Loading events...</p>
        ) : (
          filteredEvents.map((event, index) => <EventCard key={event.id || index} event={event} />)
        )}
      </div>

      <Link href="/events/create" className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform z-10">
        <Plus size={28} />
      </Link>
    </div>
  );
}

function EventCard({ event }: any) {
  const statusStyles: any = {
    Planned: "bg-blue-100 text-primary",
    Confirmed: "bg-purple-100 text-purple-600",
    Completed: "bg-green-100 text-success",
    Cancelled: "bg-red-100 text-danger",
    Rental: "bg-orange-100 text-orange-600",
  };

  return (
    <Link href={`/events/${event.id}`} className="block bg-card p-4 rounded-3xl border border-gray-100 space-y-4 active:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-50">
            <Calendar className="text-primary" size={20} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">{event.title}</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{formatEventDate(event.event_date, event.event_time)}</p>
          </div>
        </div>
        <span className={cn("px-2.5 py-1 text-[9px] font-black rounded-full uppercase", statusStyles[event.status] || "bg-gray-100 text-gray-500")}>
          {event.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-3 pt-3 border-t border-dashed border-gray-200">
        <div className="flex items-center gap-2">
          <MapPin size={12} className="text-gray-400" />
          <span className="text-[11px] font-medium text-gray-600">{event.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={12} className="text-gray-400" />
          <span className="text-[11px] font-medium text-gray-600">{event.setup_name || "No setup"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={12} className="text-gray-400" />
          <span className="text-[11px] font-medium text-gray-600">{event.staff_count ? `${event.staff_count} Staff` : "No Staff"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck size={12} className="text-gray-400" />
          <span className="text-[11px] font-medium text-gray-600">{event.vehicle_name || "N/A"}</span>
        </div>
      </div>
    </Link>
  );
}
