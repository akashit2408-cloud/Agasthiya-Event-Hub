"use client";

import { ChevronLeft, Calendar, MapPin, Users, Truck, Layers, ExternalLink, Edit2, Info, ImageIcon, ChevronRight, Phone } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { formatEventDate } from "@/lib/demo-data";

import Link from "next/link";

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [selectedStaffForPayment, setSelectedStaffForPayment] = useState<any>(null);

  const handleShare = async () => {
    if (!event) return;
    
    const combinedSetups = [event.setup_name, event.equipment_name].filter(Boolean).join(', ');
    const setupName = combinedSetups 
      ? combinedSetups.split(', ').map((s: string) => `• ${s}`).join('\n') 
      : "• No setup";
      
    const crewList = staff.length > 0 
      ? staff.map(s => {
          let rolePart = '';
          const isDJOperator = s.role && s.role.toLowerCase() === 'dj operator';
          if (s.role && s.role.toLowerCase() !== 'helper') {
            if (isDJOperator) {
              if (s.is_playing_dj) rolePart = ' (Playing DJ)';
            } else {
              rolePart = ` (${s.role.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')})`;
            }
          }
          const remarkPart = s.assigned_role ? ` - ${s.assigned_role}` : '';
          return `• ${s.name}${rolePart}${remarkPart}`;
        }).join('\n') 
      : "No crew assigned yet";
      
    const transportName = event.vehicle_name 
      ? `${event.vehicle_name}${event.vehicle_number ? ` [${event.vehicle_number}]` : ''}`
      : 'Not Assigned';
    const transport = event.drop_sequence 
      ? `${transportName} (${event.drop_sequence})`
      : transportName;

    const formatDateStr = (dateStr: string) => {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    };

    function formatTime12(timeStr: string) {
      if (!timeStr) return "";
      const [h, m] = timeStr.split(":");
      let hours = parseInt(h, 10);
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${hours.toString().padStart(2, "0")}:${m} ${ampm}`;
    }

    const validInvitationUrl = event.invitation_url && !event.invitation_url.startsWith('data:') ? event.invitation_url : null;

    let finalMapLink = '';
    if (event.map_link) {
      if (event.map_link.includes('http')) {
        finalMapLink = `Map: ${event.map_link.replace(/^https?:\/\//, '')}\n`;
      } else {
        const cleanQuery = encodeURIComponent(event.map_link).replace(/%20/g, '+');
        finalMapLink = `Map: www.google.com/maps/search/?api=1&query=${cleanQuery}\n`;
      }
    }

    const isRental = event.event_type?.toLowerCase() === 'rental';
    const displayTitle = isRental && event.customer_name ? `Setup for ${event.customer_name}` : event.title;

    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://agasthiya-event-hub.vercel.app';
    const previewUrl = event.invitation_url ? `${origin}/api/image/${event.id}` : null;

    const message = `🎵 *AE | AGASTHIYA EVENT*
*${isRental ? 'NEW RENTAL ASSIGNMENT' : 'NEW EVENT ASSIGNMENT'}*

${isRental ? '📦' : '🎂'} *Event:* ${displayTitle}
📌 *Type:* ${event.event_type}

📅 *Date & Time:* ${formatDateStr(event.event_date)}, ${formatTime12(event.event_time)}
🕐 *Reporting Time:* ${event.reporting_time || 'Check Notes'}

📍 *Location:* ${event.location?.split(',')[0] || event.location}
🗺️ *Venue:* ${event.location}
${finalMapLink}
🎵 *Setup Requirements:*
${setupName}

🚚 *Transport:* ${transport}

👷 *Crew Members:*
${crewList}

📝 *Notes:* ${event.remark ? event.remark : 'None'}

⚠️ *Important Instructions:*
• Verify all equipment before loading
• Coordinate with team members before departure
• Contact supervisor immediately if any issue arises

✅ Please confirm receipt of this assignment.

${previewUrl ? `📎 *View Invitation:*\n${previewUrl}\n\n` : ''}*AE | Agasthiya Event*`;

    navigator.clipboard.writeText(message).catch(e => console.error(e));
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappUrl;
    
    setTimeout(() => {
      alert("✅ Message copied to clipboard!\n\nTo share the Invitation Image on a computer:\n1. Right-click the invitation image below.\n2. Click 'Copy Image'.\n3. Paste it directly into your WhatsApp chat!");
    }, 500);
  };

  const handleStaffPaymentSubmit = async (method: "Cash" | "GPay") => {
    try {
      // Update in database
      const { error } = await supabase
        .from('event_staff')
        .update({ payment_status: 'Paid', payment_method: method })
        .eq('event_id', event?.id)
        .eq('staff_id', selectedStaffForPayment.id);

      if (error) throw error;

      // Update local state
      setStaff(staff.map(s => 
        s.id === selectedStaffForPayment.id 
          ? { ...s, payment_status: 'Paid', payment_method: method }
          : s
      ));

      if (method === 'GPay') {
          const upiId = selectedStaffForPayment.gpay_number?.trim();
          if (upiId && upiId.includes('@')) {
            const pa = encodeURIComponent(upiId);
            const pn = encodeURIComponent(selectedStaffForPayment.name);
            
            // Try GPay specific intent first
            window.location.href = `gpay://upi/pay?pa=${pa}&pn=${pn}&cu=INR`;
            
            // Fallback to standard UPI intent if GPay scheme fails
            setTimeout(() => {
                window.location.href = `upi://pay?pa=${pa}&pn=${pn}&cu=INR`;
            }, 300);
          } else {
            alert(`✅ Marked as Paid via GPay!\n\nPro Tip: To make the Google Pay app open automatically next time, go to the Staff tab and save their exact UPI ID (e.g., 9876543210@ptsbi) instead of just their phone number!`);
          }
      }
      
      setSelectedStaffForPayment(null);
    } catch (err: any) {
      alert("Failed to record payment: " + err.message);
    }
  };

  const handleCancelClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setShowCancelModal(true);
  };

  const confirmCancelEvent = async () => {
    if (!event) return;
    setIsCancelling(true);
    try {
      const { data: updatedEvent, error } = await supabase
        .from("events")
        .update({ status: "Cancelled" })
        .eq("id", event.id)
        .select("id, status")
        .single();

      if (error) throw error;
      setEvent((currentEvent: any) => ({
        ...currentEvent,
        status: updatedEvent.status,
      }));
      setShowCancelModal(false);
    } catch (err) {
      console.error("Error cancelling event:", err);
      alert("The event could not be cancelled. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCompleteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setShowCompleteModal(true);
  };

  const confirmCompleteEvent = async () => {
    if (!event) return;
    setIsCompleting(true);
    try {
      const { data: updatedEvent, error } = await supabase
        .from("events")
        .update({ status: "Completed" })
        .eq("id", event.id)
        .select("id, status")
        .single();

      if (error) throw error;
      setEvent((currentEvent: any) => ({
        ...currentEvent,
        status: updatedEvent.status,
      }));
      setShowCompleteModal(false);
    } catch (err) {
      console.error("Error completing event:", err);
      alert("The event could not be marked as completed. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  useEffect(() => {
    const eventId = params.id;
    async function fetchEventDetails() {
      try {
        const { data: eventData, error } = await supabase
          .from("events")
          .select(`
            id, title, event_category, event_type, location, map_link, event_date, event_time, status, notes, total_amount, invitation_url, remark, drop_sequence,
            customers (name, mobile, address),
            event_setups (
              quantity,
              setups (name, category)
            ),
            vehicles (name, registration_number),
            event_staff (
              assigned_role,
              is_playing_dj,
              payment_status,
              payment_method,
              staff (id, name, role, mobile, gpay_number, avatar_seed)
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
          setup_name: (eventData as any).event_setups
            ?.filter((es: any) => (es.setups?.category || "Setup") === "Setup")
            .map((es: any) => es.setups?.name).join(', ') || null,
          equipment_name: (eventData as any).event_setups
            ?.filter((es: any) => es.setups?.category === "Equipment")
            .map((es: any) => `${es.setups?.name} (${es.quantity})`).join(', ') || null,
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
          gpay_number: s.staff.gpay_number,
          avatar_seed: s.staff.avatar_seed,
          assigned_role: s.assigned_role,
          is_playing_dj: s.is_playing_dj,
          payment_status: s.payment_status,
          payment_method: s.payment_method
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
        <button type="button" onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Event Details</h1>
        <Link href={`/events/${event.id}/edit`} className="p-2 -mr-2 text-primary">
          <Edit2 size={20} />
        </Link>
      </div>

      <div className="p-5 space-y-6">
        <div className="bg-primary p-6 rounded-[2rem] text-white space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Calendar size={120} />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h2 className="text-xl font-black">{event.title}</h2>
              <div className="flex items-center gap-2 mt-2 opacity-90 flex-wrap">
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">
                  {event.event_category || 'Own Event'}
                </span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">
                  {event.event_type || 'Event'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-3 opacity-90">
                <Calendar size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">{formatEventDate(event.event_date, event.event_time)}</span>
              </div>
            </div>
            <span className={cn("px-3 py-1 backdrop-blur-md text-[10px] font-black rounded-full uppercase", event.status?.toLowerCase() === 'cancelled' ? "bg-red-500 text-white" : "bg-white/20 text-white")}>
              {event.status}
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/20 relative z-10">
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span className="text-xs font-bold">{event.location}</span>
            </div>
            {event.map_link && (
              <a 
                href={(() => {
                  const link = event.map_link.trim();
                  if (link.startsWith('http://') || link.startsWith('https://')) return link;
                  if (link.includes('maps.app.goo.gl') || link.includes('google.com') || link.includes('goo.gl/maps')) return `https://${link}`;
                  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(link)}`;
                })()}
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1.5 text-[10px] font-black bg-white text-primary px-3 py-1.5 rounded-full uppercase tracking-tighter hover:bg-gray-50 active:scale-95 transition-transform"
              >
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <ImageIcon size={16} className="text-primary" />
                </div>
                <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Invitation</p>
              </div>
              <a 
                href={event.invitation_url} 
                download={`invitation_${event.id}.jpg`} 
                className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1.5 rounded-full uppercase tracking-tighter hover:bg-primary/20 transition-colors"
              >
                Download
              </a>
            </div>
            <div className="w-full rounded-2xl overflow-hidden border border-gray-100">
              <img src={event.invitation_url} alt="Event Invitation" className="w-full h-auto object-cover" />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Resources</h3>
          </div>

          <div className="space-y-3">
            <ResourceItem icon={<Layers className="text-primary" size={20} />} label="Setup" value={event.setup_name || "No setup"} />
            {event.equipment_name && (
              <ResourceItem icon={<Layers className="text-primary" size={20} />} label="Equipment" value={event.equipment_name} />
            )}
            {event.vehicle_name && (
               <ResourceItem 
                 icon={<Truck className="text-primary" size={20} />} 
                 label="Vehicle" 
                 value={`${event.vehicle_name}${event.drop_sequence ? ` (${event.drop_sequence})` : ''}`} 
               />
            )}

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
                    <div 
                      key={member.id || index} 
                      className="flex items-center justify-between p-2 -mx-2 rounded-2xl hover:bg-gray-50 transition-colors w-full"
                    >
                      <button 
                        onClick={() => setSelectedStaffForPayment(member)}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shadow-sm shrink-0">
                          <img src={imageSrc} alt={member.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                            {member.name} {member.role && member.role.toLowerCase() !== 'helper' && <span className="font-medium text-gray-500">{member.role.toLowerCase()}</span>}
                            {member.is_playing_dj && (
                              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0">
                                Playing DJ
                              </span>
                            )}
                            {member.payment_status === 'Paid' ? (
                              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0">
                                Paid ({member.payment_method})
                              </span>
                            ) : (
                              <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0">
                                Unpaid
                              </span>
                            )}
                          </p>
                          {member.assigned_role && (
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">({member.assigned_role})</p>
                          )}
                        </div>
                      </button>
                      
                      <div className="flex items-center gap-1 pl-2 shrink-0">
                        {member.mobile && (
                          <a 
                            href={`tel:${member.mobile}`}
                            className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors active:scale-95"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone size={15} fill="currentColor" />
                          </a>
                        )}
                        <button 
                          onClick={() => setSelectedStaffForPayment(member)}
                          className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors active:scale-95 hidden sm:flex"
                        >
                          <ChevronRight size={18} />
                        </button>
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
          <button type="button" onClick={handleShare} className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 bg-[#00A859] text-white font-bold text-sm transition-transform active:scale-[0.98]">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
             Share Details
          </button>
            {event.status?.toLowerCase() !== 'cancelled' && event.status?.toLowerCase() !== 'completed' && (
              <button type="button" onClick={handleCompleteClick} className="w-full py-4 bg-primary/10 text-primary rounded-2xl font-black text-sm uppercase tracking-widest mt-4 active:scale-95 transition-transform">
                Mark as Completed
              </button>
            )}
            {event.status?.toLowerCase() !== 'cancelled' && (
              <button type="button" onClick={handleCancelClick} className="w-full py-4 bg-danger/10 text-danger rounded-2xl font-black text-sm uppercase tracking-widest mt-4 active:scale-95 transition-transform">
                Cancel Event
              </button>
            )}
         </div>
       </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden border border-red-50">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-red-500 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-5 text-red-500 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              </div>
              <h3 className="text-xl font-black text-center text-gray-900 mb-2">Cancel Event?</h3>
              <p className="text-sm text-center text-gray-500 mb-8 font-medium">
                Are you sure you want to cancel this event? This action cannot be undone.
              </p>
              
              <div className="flex flex-col gap-3 w-full">
                <button 
                  type="button"
                  onClick={confirmCancelEvent}
                  disabled={isCancelling}
                  className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50"
                >
                  {isCancelling ? "Cancelling..." : "Yes, Cancel Event"}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  disabled={isCancelling}
                  className="w-full py-4 bg-gray-100 text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50"
                >
                  No, Keep It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Confirmation Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden border border-primary/20">
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-5 text-primary shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
              </div>
              <h3 className="text-xl font-black text-center text-gray-900 mb-2">Complete Event?</h3>
              <p className="text-sm text-center text-gray-500 mb-8 font-medium">
                Are you sure you want to mark this event as completed?
              </p>
              
              <div className="flex flex-col gap-3 w-full">
                <button 
                  type="button"
                  onClick={confirmCompleteEvent}
                  disabled={isCompleting}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50"
                >
                  {isCompleting ? "Saving..." : "Yes, Completed"}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  disabled={isCompleting}
                  className="w-full py-4 bg-gray-100 text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Payment Modal */}
      {selectedStaffForPayment && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto" onClick={() => setSelectedStaffForPayment(null)}>
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden shadow-sm shrink-0">
                 <img 
                    src={selectedStaffForPayment.avatar_seed && selectedStaffForPayment.avatar_seed.startsWith('data:image/') 
                      ? selectedStaffForPayment.avatar_seed 
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStaffForPayment.name)}&background=random&font-size=0.35&rounded=true&bold=true`} 
                    alt={selectedStaffForPayment.name} className="w-full h-full object-cover" 
                 />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 leading-tight">Pay {selectedStaffForPayment.name}</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{selectedStaffForPayment.role}</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-500 text-center mb-2">How would you like to mark this payment?</p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={() => handleStaffPaymentSubmit('Cash')}
                  className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-transform"
                >
                  Pay Cash
                </button>
                <button 
                  onClick={() => handleStaffPaymentSubmit('GPay')}
                  className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-transform shadow-lg shadow-blue-500/30"
                >
                  Pay GPay
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}
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
