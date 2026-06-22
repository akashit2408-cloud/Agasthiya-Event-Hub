"use client";

import { ChevronLeft, Calendar, MapPin, Users, Truck, Layers, MessageSquare, ExternalLink, Copy, Edit2, Info, ImageIcon } from "lucide-react";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const eventId = params.id;
    async function fetchEventDetails() {
      try {
        const { data: eventData, error } = await supabase
          .from("events")
          .select(`
            id, title, event_type, location, map_link, event_date, event_time, status, notes, total_amount, invitation_url, remark,
            customers (name, mobile, address),
            event_setups (
              quantity,
              setups (name)
            ),
            vehicles (name, registration_number),
            event_staff (
              assigned_role,
              staff (id, name, role, mobile, avatar_seed)
            )
          `)
          .eq("id", eventId)
          .single();
          
        if (error) throw error;
        
        // Format to match old structure
        const formattedEvent = {
          ...eventData,
          customer_name: (eventData as any).customers?.name,
          customer_mobile: (eventData as any).customers?.mobile,
          customer_address: (eventData as any).customers?.address,
          setup_name: (eventData as any).event_setups?.map((es: any) => `${es.setups?.name} (${es.quantity})`).join(', ') || null,
          vehicle_name: (eventData as any).vehicles?.name,
          vehicle_number: (eventData as any).vehicles?.registration_number,
          staff_count: (eventData as any).event_staff?.length || 0,
        };
        
        setEvent(formattedEvent);
        setStaff((eventData as any).event_staff?.map((s: any) => ({
          id: s.staff.id,
          name: s.staff.name,
          role: s.staff.role,
          mobile: s.staff.mobile,
          avatar_seed: s.staff.avatar_seed,
          assigned_role: s.assigned_role
        })) || []);
      } catch (err) {
        console.error("Error fetching event details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (eventId) fetchEventDetails();
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

        {event.remark && (
          <div className="bg-orange-50 p-4 rounded-3xl border border-orange-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <Info size={16} className="text-orange-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Remarks / Instructions</p>
              <p className="text-sm font-bold text-orange-900 leading-snug">{event.remark}</p>
            </div>
          </div>
        )}

        {event.invitation_url && (
          <div className="bg-card p-4 rounded-3xl border border-gray-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <ImageIcon size={16} className="text-primary" />
              </div>
              <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Invitation</p>
            </div>
            <div className="w-full rounded-2xl overflow-hidden border border-gray-100">
              <img src={event.invitation_url} alt="Event Invitation" className="w-full h-auto object-cover" />
            </div>
          </div>
        )}

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
              <div className="flex flex-col gap-3 mt-3">
                {staff.map((member, index) => {
                  const imageSrc = member.avatar_seed && member.avatar_seed.startsWith('data:image/') 
                    ? member.avatar_seed 
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&font-size=0.35&rounded=true&bold=true`;
                  
                  return (
                    <div key={member.id || index} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shadow-sm shrink-0">
                        <img src={imageSrc} alt={member.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{member.name}</p>
                        {member.assigned_role && (
                          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{member.assigned_role}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
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
