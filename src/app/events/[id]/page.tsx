"use client";

import { ChevronLeft, Calendar, MapPin, Users, Truck, Layers, MessageSquare, ExternalLink, Copy, Edit2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { formatEventDate } from "@/lib/demo-data";

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    async function fetchEvent() {
      const eventId = params.id;
      if (!eventId) return;

      const { data: eventData, error } = await supabase.from("event_list").select("*").eq("id", eventId).single();
      if (!error && eventData) setEvent(eventData);

      const { data: staffRows } = await supabase.from("event_staff").select("staff(*)").eq("event_id", eventId);
      if (staffRows && staffRows.length > 0) setStaff(staffRows.map((row: any) => row.staff).filter(Boolean));
    }
    fetchEvent().catch((err) => console.error("Error fetching event detail:", err));
  }, [params.id]);

  if (!event) {
    return (
      <div className="flex flex-col min-h-screen bg-white items-center justify-center">
        <p className="text-sm font-medium text-gray-500 animate-pulse">Loading event...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-10">
      <div className="p-5 flex items-center justify-between border-b border-gray-50">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Event Details</h1>
        <div className="w-10" />
      </div>

      <div className="p-5 space-y-6">
        <div className="bg-primary p-6 rounded-[2rem] text-white space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Calendar size={120} />
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black">{event.title}</h2>
              <div className="flex items-center gap-2 mt-2 opacity-90">
                <Calendar size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">{formatEventDate(event.event_date, event.event_time)}</span>
              </div>
            </div>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-[10px] font-black rounded-full uppercase">{event.status}</span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span className="text-xs font-bold">{event.location}</span>
            </div>
            {event.map_link && (
              <a href={event.map_link} target="_blank" className="flex items-center gap-1.5 text-[10px] font-black bg-white text-primary px-3 py-1.5 rounded-full uppercase tracking-tighter">
                View Map <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Resources</h3>
            <button className="text-xs font-bold text-primary flex items-center gap-1"><Edit2 size={12} /> Edit</button>
          </div>

          <div className="space-y-3">
            <ResourceItem icon={<Layers className="text-primary" size={20} />} label="Setup" value={event.setup_name || "No setup"} />
            <ResourceItem icon={<Truck className="text-primary" size={20} />} label="Vehicle" value={event.vehicle_name || "N/A"} />

            <div className="bg-card p-4 rounded-3xl border border-gray-50 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Users className="text-primary" size={20} />
                  <span className="text-sm font-bold text-gray-600">Staff ({staff.length})</span>
                </div>
              </div>
              <div className="flex -space-x-3">
                {staff.map((member, index) => (
                  <div key={member.id || index} className="w-10 h-10 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-sm">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} alt={member.name} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Actions</h3>
          <ActionButton icon={<MessageSquare size={20} />} label="Send to Team" color="bg-green-500" />
          <ActionButton icon={<MessageSquare size={20} />} label="Send to Customer" color="bg-primary" />
          <ActionButton icon={<Copy size={20} />} label="Copy Details" color="bg-purple-600" />
          <button className="w-full py-4 bg-danger/10 text-danger rounded-2xl font-black text-sm uppercase tracking-widest mt-4">
            Cancel Event
          </button>
        </div>
      </div>
    </div>
  );
}

function ResourceItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between bg-card p-4 rounded-3xl border border-gray-50">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">{label}</p>
          <p className="text-sm font-bold text-gray-900">{value}</p>
        </div>
      </div>
      <ChevronLeft className="rotate-180 text-gray-300" size={20} />
    </div>
  );
}

function ActionButton({ icon, label, color }: any) {
  return (
    <button className={cn("w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-white font-bold text-sm transition-transform active:scale-[0.98]", color)}>
      {icon}
      {label}
    </button>
  );
}
