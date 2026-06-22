"use client";

import { Search, Filter, Calendar, MapPin, Users, Truck, Plus, Eye, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formatEventDate } from "@/lib/demo-data";

const tabs = ["All", "Today", "Upcoming", "Completed"];

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from("events")
          .select(`
            id, title, event_type, location, map_link, event_date, event_time, status,
            customers (name, mobile),
            event_setups (
              quantity,
              setups (name)
            ),
            vehicles (name),
            event_staff (
              staff (name)
            )
          `)
          .order("event_date")
          .order("event_time");

        if (error) throw error;

        const formattedEvents = (data || []).map((e: any) => ({
          ...e,
          customer_name: e.customers?.name,
          customer_mobile: e.customers?.mobile,
          setup_name: e.event_setups?.map((es: any) => `${es.setups?.name} (${es.quantity})`).join(', ') || null,
          vehicle_name: e.vehicles?.name,
          staff_count: e.event_staff?.length || 0,
          staff_names: e.event_staff?.map((s: any) => s.staff?.name).filter(Boolean) || []
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
          <>
            <div className="flex justify-between items-center mb-1 mt-2">
               <h2 className="text-[13px] font-black text-gray-900 uppercase tracking-wide">Plan Details</h2>
               <span className="bg-green-50 text-[#00A859] px-2.5 py-1 rounded-md text-[10px] font-black uppercase">All Ready</span>
            </div>
            {filteredEvents.map((event, index) => <EventCard key={event.id || index} event={event} />)}
          </>
        )}
      </div>

      <Link href="/events/create" className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform z-10">
        <Plus size={28} />
      </Link>
    </div>
  );
}

function EventCard({ event }: any) {
  const crewNames = event.staff_names || [];
  const crewInitials = crewNames.map((n: string) => n.substring(0, 2).toUpperCase());
  const setupName = event.setup_name || "NO SETUP";
  
  const handleShare = () => {
    const message = `*Event Details*\n\n*Title:* ${event.title}\n*Time:* ${formatEventDate(event.event_date, event.event_time)}\n*Location:* ${event.location}\n*Setup:* ${setupName}\n*Crew Assigned:* ${event.staff_count || 0}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start gap-2">
         <div>
            <h3 className="font-extrabold text-gray-900 text-[17px] leading-tight">{event.title}</h3>
            <div className={cn("mt-2 inline-block px-3 py-1 text-[10px] font-bold rounded-md", event.staff_count > 0 ? "bg-green-50 text-[#00A859]" : "bg-orange-50 text-orange-600")}>
               {event.staff_count > 0 ? `${event.staff_count} CREW ASSIGNED` : "UNASSIGNED"}
            </div>
         </div>
         <span className={cn("px-3 py-1 text-[10px] font-bold rounded-md uppercase text-right shrink-0", event.setup_name ? "bg-indigo-50 text-indigo-600" : "bg-gray-50 text-gray-500")}>
            {setupName}
         </span>
      </div>

      {/* Details: Time and Location */}
      <div className="space-y-2 pt-1">
         <div className="flex items-start gap-2.5">
            <Clock size={15} className="text-gray-500" />
            <span className="text-xs font-medium text-gray-500">Time: {formatEventDate(event.event_date, event.event_time)}</span>
         </div>
         <div className="flex items-start gap-2.5">
            <MapPin size={15} className="text-gray-500" />
            <span className="text-xs font-medium text-gray-500">{event.location}</span>
         </div>
      </div>

      <div className="border-t border-gray-100"></div>

      {/* Crew */}
      <div className="flex items-center gap-3">
         {crewInitials.length > 0 ? (
           <div className="flex -space-x-1.5">
              {crewInitials.slice(0, 5).map((initial: string, idx: number) => (
                 <div key={idx} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-gray-900">
                   {initial}
                 </div>
              ))}
           </div>
         ) : (
           <div className="w-6 h-6 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-orange-600">
             !
           </div>
         )}
         <span className={cn("text-xs font-medium truncate", crewNames.length > 0 ? "text-gray-500" : "text-orange-500")}>
            {crewNames.length > 0 ? crewNames.join(", ") : "No crew assigned"}
         </span>
      </div>

      <div className="border-t border-gray-100"></div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
         <Link href={`/events/${event.id || '1'}`} className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 hover:bg-gray-50">
            <Eye size={16} /> View Card
         </Link>
         <button onClick={handleShare} className="flex items-center justify-center gap-2 py-2.5 bg-[#00A859] text-white rounded-xl text-xs font-bold hover:bg-[#00904C]">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            Share Details
         </button>
      </div>
    </div>
  );
}
