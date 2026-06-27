"use client";

import { ChevronLeft, Calendar, MapPin, Truck, Phone, User, Link as LinkIcon, Layers, Camera, X, ImageIcon, MessageSquare } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [eventData, setEventData] = useState<any>(null);
  const [isFetchingEvent, setIsFetchingEvent] = useState(true);
  const [setups, setSetups] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [staffRemarks, setStaffRemarks] = useState<Record<string, string>>({});
  const [playingDjStaff, setPlayingDjStaff] = useState<Record<string, boolean>>({});
  const [showRemarkInputFor, setShowRemarkInputFor] = useState<Record<string, boolean>>({});
  const [dropSequence, setDropSequence] = useState<string>("None");
  const [customVehicleName, setCustomVehicleName] = useState<string>("");
  const [showAllStaff, setShowAllStaff] = useState(false);
  const [selectedSetups, setSelectedSetups] = useState<Record<string, number>>({});
  const [resourceCategory, setResourceCategory] = useState<"Setup" | "Equipment">("Setup");
  const [saving, setSaving] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [assignedStaffIds, setAssignedStaffIds] = useState<Set<string>>(new Set());
  const [invitationImage, setInvitationImage] = useState<string | null>(null);
  const [remark, setRemark] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/webp', 0.7);
        setInvitationImage(compressedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    async function fetchResources() {
      const [{ data: setupRows }, { data: vehicleRows }, { data: staffRows }] = await Promise.all([
        supabase.from("setups").select("*").order("name"),
        supabase.from("vehicles").select("*").order("name"),
        supabase.from("staff").select("*").order("role").order("name"),
      ]);
      setSetups(setupRows || []);
      
      const v = vehicleRows || [];
      if (!v.some((vh: any) => vh.name.toLowerCase() === 'others')) {
        v.push({ id: 'others', name: 'Others' });
      }
      setVehicles(v);
      
      setStaff(staffRows || []);

      const eventId = params.id;
      if (eventId) {
        const { data: eData } = await supabase
          .from("events")
          .select(`
            *,
            customers (name, mobile, address),
            event_setups (setup_id, quantity),
            event_staff (staff_id, assigned_role, is_playing_dj, payment_status, payment_method)
          `)
          .eq("id", eventId)
          .single();

        if (eData) {
          setEventData(eData);
          if (eData.event_date) setEventDate(eData.event_date);
          if (eData.invitation_url) setInvitationImage(eData.invitation_url);
          if (eData.remark) setRemark(eData.remark);
          if (eData.drop_sequence) setDropSequence(eData.drop_sequence);
          
          if (eData.event_setups) {
            const initialSetups: Record<string, number> = {};
            eData.event_setups.forEach((es: any) => {
              initialSetups[es.setup_id] = es.quantity;
            });
            setSelectedSetups(initialSetups);
          }

          if (eData.event_staff) {
            const initialStaff = eData.event_staff.map((es: any) => es.staff_id);
            setSelectedStaff(initialStaff);
            const initialRemarks: Record<string, string> = {};
            const initialPlayingDj: Record<string, boolean> = {};
            const initialShowRemarks: Record<string, boolean> = {};
            eData.event_staff.forEach((es: any) => {
              if (es.assigned_role) {
                 initialRemarks[es.staff_id] = es.assigned_role;
              }
              if (es.is_playing_dj) {
                 initialPlayingDj[es.staff_id] = es.is_playing_dj;
              }
              initialShowRemarks[es.staff_id] = true;
            });
            setStaffRemarks(initialRemarks);
            setPlayingDjStaff(initialPlayingDj);
            setShowRemarkInputFor(initialShowRemarks);
          }
        }
      }
      setIsFetchingEvent(false);
    }
    fetchResources().catch((err) => console.error("Error loading event resources:", err));
  }, [params.id]);

  useEffect(() => {
    if (!eventDate || !params.id) {
      setAssignedStaffIds(new Set());
      return;
    }
    async function fetchAssignedStaff() {
      const { data: eventsOnDate } = await supabase
        .from("events")
        .select("id, event_staff(staff_id)")
        .eq("event_date", eventDate)
        .neq("id", params.id);

      const assigned = new Set<string>();
      (eventsOnDate || []).forEach(ev => {
        (ev.event_staff || []).forEach((s: any) => assigned.add(s.staff_id));
      });
      setAssignedStaffIds(assigned);
    }
    fetchAssignedStaff();
  }, [eventDate, params.id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      const form = new FormData(event.currentTarget);
      const mobile = String(form.get("mobile") || "").trim();
      const customerName = String(form.get("customer_name") || "").trim();

      let customerId: string | null = null;
      
      if (mobile || customerName) {
        if (mobile) {
          const { data: existingCustomer } = await supabase.from("customers").select("id").eq("mobile", mobile).maybeSingle();
          
          if (existingCustomer) {
            customerId = existingCustomer.id;
            // Update existing customer details in case they changed their name or address
            await supabase.from("customers").update({
              name: customerName || "Unknown Customer",
              address: String(form.get("location") || "")
            }).eq("id", customerId);
          }
        }

        if (!customerId) {
          const { data: newCustomer, error: customerError } = await supabase
            .from("customers")
            .insert({
              name: customerName || "Unknown Customer",
              mobile: mobile || null,
              address: String(form.get("location") || ""),
            })
            .select("id");

          if (customerError) {
            setSaving(false);
            alert("Error saving customer: " + customerError.message);
            return;
          }
          if (newCustomer && newCustomer.length > 0) {
            customerId = newCustomer[0].id;
          }
        }
      }

      const form_vehicle_id = String(form.get("vehicle_id") || "");
      let final_vehicle_id: string | null = form_vehicle_id || null;

      if (form_vehicle_id === "others") {
        const cName = customVehicleName.trim() || "Others";
        const { data: existingCustom } = await supabase.from("vehicles").select("id").ilike("name", cName).maybeSingle();
        if (existingCustom) {
          final_vehicle_id = existingCustom.id;
        } else {
          const { data: newVehicle, error: newVehicleError } = await supabase.from("vehicles").insert({ name: cName, status: "Available" }).select("id");
          if (!newVehicleError && newVehicle && newVehicle.length > 0) {
            final_vehicle_id = newVehicle[0].id;
          } else {
            final_vehicle_id = null;
          }
        }
      }

      const { data: newEvent, error: eventError } = await supabase
        .from("events")
        .update({
          customer_id: customerId,
          title: String(form.get("title") || `${form.get("event_type")} Event`),
          event_category: String(form.get("event_category") || "Own Event"),
          event_type: String(form.get("event_type") || "Event"),
          location: String(form.get("location") || ""),
          map_link: String(form.get("map_link") || "") || null,
          event_date: String(form.get("event_date") || ""),
          event_time: String(form.get("event_time") || "17:00"),
          vehicle_id: final_vehicle_id,
          total_amount: Number(form.get("total_amount") || 0),
          notes: String(form.get("notes") || ""),
          invitation_url: invitationImage,
          remark: remark,
          drop_sequence: dropSequence === "None" ? null : dropSequence,
        })
        .eq("id", params.id)
        .select("id");

      if (eventError) {
        setSaving(false);
        alert("Error saving event: " + eventError.message);
        return;
      }
      
      if (!newEvent || newEvent.length === 0) {
         console.warn("Update may not have applied correctly. Check RLS policies.");
      }

      // Preserve payment status before deleting
      const { data: existingStaffData } = await supabase.from("event_staff").select("*").eq("event_id", params.id);

      const { error: staffDelErr } = await supabase.from("event_staff").delete().eq("event_id", params.id);
      if (staffDelErr) console.error("Error deleting old staff:", staffDelErr);

      if (selectedStaff.length > 0) {
        const { error: staffInsErr } = await supabase.from("event_staff").upsert(selectedStaff.map((staffId) => {
          const existing = existingStaffData?.find(es => es.staff_id === staffId);
          const isPlayingStr = form.get(`playing_dj_${staffId}`);
          return { 
            event_id: params.id, 
            staff_id: staffId,
            assigned_role: staffRemarks[staffId] || null,
            is_playing_dj: isPlayingStr === "true",
            payment_status: existing?.payment_status || 'Unpaid',
            payment_method: existing?.payment_method || null
          };
        }));
        if (staffInsErr) console.error("Error upserting staff:", staffInsErr);
      }

      const { error: setupDelErr } = await supabase.from("event_setups").delete().eq("event_id", params.id);
      if (setupDelErr) console.error("Error deleting old setups:", setupDelErr);

      const setupEntries = Object.entries(selectedSetups);
      if (setupEntries.length > 0) {
        const { error: setupInsErr } = await supabase.from("event_setups").upsert(
          setupEntries.map(([setupId, quantity]) => ({ event_id: params.id, setup_id: setupId, quantity }))
        );
        if (setupInsErr) console.error("Error upserting setups:", setupInsErr);
      }

      setSaving(false);
      window.location.href = `/events/${params.id}`;
    } catch (err: any) {
      console.error("Unhandled error in handleSubmit:", err);
      alert(err.message || "An unknown error occurred while saving.");
      setSaving(false);
    }
  }

  function toggleStaff(staffId: string) {
    setSelectedStaff((current) => current.includes(staffId) ? current.filter((id) => id !== staffId) : [...current, staffId]);
  }

  if (isFetchingEvent) {
    return <div className="flex flex-col min-h-screen bg-white items-center justify-center text-gray-500 font-medium animate-pulse">Loading event...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="p-5 flex items-center justify-between border-b border-gray-50">
        <button type="button" onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Edit Event</h1>
        <div className="w-10" />
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        <InputField name="customer_name" label="Customer Name" icon={<User size={18} />} placeholder="Enter customer name" defaultValue={eventData?.customers?.name || ""} />
        <InputField name="mobile" label="Mobile Number" icon={<Phone size={18} />} placeholder="Enter mobile number" defaultValue={eventData?.customers?.mobile || ""} />
        <SelectField name="event_category" label="Event Category" options={["Own Event", "Rental Event", "Others"]} defaultValue={eventData?.event_category || "Own Event"} />
        <InputField name="title" label="Event Title" icon={<Calendar size={18} />} placeholder="Wedding Event" defaultValue={eventData?.title || ""} required />
        <SelectField name="event_type" label="Event Type" options={["Wedding", "Reception", "Birthday", "Corporate", "School Event", "College Event", "Sangeet", "Baby Shower", "Other"]} defaultValue={eventData?.event_type || ""} />
        <InputField name="location" label="Location" icon={<MapPin size={18} />} placeholder="Enter location" defaultValue={eventData?.location || ""} required />
        <InputField name="map_link" label="Google Map Link" icon={<LinkIcon size={18} />} placeholder="Paste google map link" defaultValue={eventData?.map_link || ""} />

        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Event Invitation</label>
          <div className="bg-card border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            {invitationImage ? (
              <div className="relative w-full max-w-[200px] rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                <img src={invitationImage} alt="Invitation Preview" className="w-full h-auto object-cover" />
                <button type="button" onClick={() => setInvitationImage(null)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg active:scale-95">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
                  <ImageIcon size={24} />
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">Upload Invitation</p>
                <p className="text-xs text-gray-500 mb-4 max-w-[200px]">PNG, JPG up to 5MB (Will be auto-compressed)</p>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl shadow-sm hover:border-primary hover:text-primary transition-colors">
                  Select Image
                </button>
              </>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Remarks / Instructions</label>
          <div className="relative">
            <MessageSquare className="absolute left-4 top-4 text-gray-400" size={18} />
            <textarea 
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="e.g. Come to godown at 12:30 PM..."
              className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none min-h-[100px] resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField name="event_date" label="Date" type="date" icon={<Calendar size={18} />} value={eventDate} onChange={(e: any) => setEventDate(e.target.value)} required />
          <InputField name="event_time" label="Time" type="time" icon={<Calendar size={18} />} defaultValue={eventData?.event_time || "17:00"} required />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <Truck className="text-purple-600" size={20} />
            <h2 className="text-lg font-bold text-gray-800">Transport Allocation</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Vehicle</label>
                <select
                  name="vehicle_id"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                  defaultValue={eventData?.vehicle_id || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val !== "others") setCustomVehicleName("");
                  }}
                >
                  <option value="">No Vehicle Assigned</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Drop Sequence</label>
                <select
                  value={dropSequence}
                  onChange={(e) => setDropSequence(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                >
                  <option value="None">None</option>
                  <option value="Drop 1">Drop 1</option>
                  <option value="Drop 2">Drop 2</option>
                  <option value="Drop 3">Drop 3</option>
                  <option value="Drop 4">Drop 4</option>
                </select>
              </div>
            </div>
            <div id="custom-vehicle-input" className="mt-2" style={{ display: 'none' }}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Specify Vehicle (Uber, Rental, Friend&apos;s Car)</label>
              <input
                type="text"
                value={customVehicleName}
                onChange={(e) => setCustomVehicleName(e.target.value)}
                placeholder="e.g., Uber (TN 01 AB 1234)"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 transition-all outline-none"
              />
            </div>
            <script dangerouslySetInnerHTML={{__html: `
              document.querySelector('select[name="vehicle_id"]').addEventListener('change', function(e) {
                document.getElementById('custom-vehicle-input').style.display = e.target.value === 'others' ? 'block' : 'none';
              });
              setTimeout(() => {
                if (document.querySelector('select[name="vehicle_id"]').value === 'others') {
                  document.getElementById('custom-vehicle-input').style.display = 'block';
                }
              }, 500);
            `}} />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Select Resources ({Object.keys(selectedSetups).length})</h2>
          <div className="grid grid-cols-2 rounded-2xl bg-gray-100 p-1">
            {(["Setup", "Equipment"] as const).map((category) => {
              const selectedCount = setups.filter((item) => (item.category || "Setup") === category && selectedSetups[item.id]).length;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setResourceCategory(category)}
                  className={cn(
                    "rounded-xl py-3 text-xs font-bold transition-all",
                    resourceCategory === category ? "bg-white text-primary shadow-sm" : "text-gray-500"
                  )}
                >
                  {category === "Setup" ? "Setups" : "Equipment"} ({selectedCount})
                </button>
              );
            })}
          </div>
          {setups.filter((setup) => (setup.category || "Setup") === resourceCategory).map((setup) => (
            <div key={setup.id} className="w-full flex items-center justify-between p-3 bg-card border border-gray-50 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setSelectedSetups((prev) => {
                    const newSetups = { ...prev };
                    if (newSetups[setup.id]) {
                      delete newSetups[setup.id];
                    } else {
                      newSetups[setup.id] = 1;
                    }
                    return newSetups;
                  });
                }}
                className="flex-1 flex items-center gap-3 text-left"
              >
                <div className={cn("w-5 h-5 rounded flex items-center justify-center transition-colors", selectedSetups[setup.id] ? "bg-primary" : "border-2 border-gray-200")}>
                  {selectedSetups[setup.id] && <div className="w-2 h-2 bg-white rounded-sm" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{setup.name}</p>
                </div>
              </button>

              {selectedSetups[setup.id] && (setup.category || "Setup") !== "Setup" && (
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setSelectedSetups(prev => ({...prev, [setup.id]: Math.max(1, prev[setup.id] - 1)}))} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 font-bold">-</button>
                  <span className="text-sm font-bold w-4 text-center">{selectedSetups[setup.id]}</span>
                  <button type="button" onClick={() => setSelectedSetups(prev => ({...prev, [setup.id]: prev[setup.id] + 1}))} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 font-bold">+</button>
                </div>
              )}
            </div>
          ))}
          {setups.filter((setup) => (setup.category || "Setup") === resourceCategory).length === 0 && (
            <p className="py-6 text-center text-xs font-medium text-gray-500">
              No {resourceCategory === "Setup" ? "setups" : "equipment"} available.
            </p>
          )}
        </div>
        <InputField name="notes" label="Additional Notes" icon={<Layers size={18} />} placeholder="Any other specific requirements?" defaultValue={eventData?.notes || ""} />
        <InputField name="total_amount" label="Total Amount" type="number" icon={<Calendar size={18} />} placeholder="0" defaultValue={eventData?.total_amount || 0} />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Select Crew ({selectedStaff.length})</h2>
            <button 
              type="button" 
              onClick={() => setShowAllStaff(!showAllStaff)}
              className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full"
            >
              {showAllStaff ? "Show Selected" : "Show All Crew"}
            </button>
          </div>
          {(showAllStaff ? staff : staff.filter(m => selectedStaff.includes(m.id))).map((member) => {
            const isAssignedToOther = assignedStaffIds.has(member.id);
            return (
            <div key={member.id} className={cn("w-full flex flex-col gap-2 p-3 bg-card border border-gray-50 rounded-2xl", isAssignedToOther && "opacity-60")}>
              <button
                type="button"
                disabled={isAssignedToOther}
                onClick={() => toggleStaff(member.id)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                    <img src={member.avatar_seed && member.avatar_seed.startsWith('data:image/') ? member.avatar_seed : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&font-size=0.35&rounded=true&bold=true`} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-900">{member.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-gray-400 font-medium">{member.role}</p>
                      {isAssignedToOther && <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase tracking-wider">Booked</span>}
                    </div>
                  </div>
                </div>
                <div className={cn("w-5 h-5 rounded flex items-center justify-center transition-colors", selectedStaff.includes(member.id) ? "bg-primary" : "border-2 border-gray-200", isAssignedToOther && "bg-gray-200 border-gray-200")}>
                  {selectedStaff.includes(member.id) && <div className="w-2 h-2 bg-white rounded-sm" />}
                </div>
              </button>
              {selectedStaff.includes(member.id) && !isAssignedToOther && (
                <div className="flex flex-col gap-2 mt-1">
                  {member.role === 'DJ Operator' && (
                    <div 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPlayingDjStaff(prev => ({ ...prev, [member.id]: !prev[member.id] })); }}
                      className="flex items-center justify-between bg-purple-50/50 p-2.5 rounded-xl cursor-pointer"
                    >
                      <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider">Playing DJ?</span>
                      <div className={cn("w-10 h-6 rounded-full flex items-center p-1 transition-colors", playingDjStaff[member.id] ? "bg-purple-600" : "bg-gray-300")}>
                        <div className={cn("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", playingDjStaff[member.id] ? "translate-x-4" : "translate-x-0")} />
                      </div>
                      <input type="hidden" name={`playing_dj_${member.id}`} value={playingDjStaff[member.id] ? "true" : "false"} />
                    </div>
                  )}
                  {showRemarkInputFor[member.id] || staffRemarks[member.id] ? (
                    <input 
                      type="text" 
                      placeholder="Add remark/assigned role..." 
                      className="w-full bg-gray-50 border-none rounded-xl py-2 px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                      value={staffRemarks[member.id] || ""}
                      onChange={(e) => setStaffRemarks(prev => ({ ...prev, [member.id]: e.target.value }))}
                    />
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => setShowRemarkInputFor(prev => ({ ...prev, [member.id]: true }))}
                      className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg text-left w-fit hover:bg-gray-100 transition-colors"
                    >
                      + Add Remark
                    </button>
                  )}
                </div>
              )}
            </div>
          )})}
        </div>

        <div className="pt-6">
          <button type="submit" disabled={saving} className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2">
            {saving ? "Updating Event..." : "Update Event"}
          </button>
        </div>
      </form>
    </div>
  );
}

function InputField({ name, label, icon, placeholder, type = "text", required, defaultValue }: any) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-gray-500 ml-1">{label}</span>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
        <input name={name} type={type} placeholder={placeholder} defaultValue={defaultValue} required={required} className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
      </div>
    </label>
  );
}

function SelectField({ name, label, options, defaultValue }: any) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-gray-500 ml-1">{label}</span>
      <select name={name} defaultValue={defaultValue || ""} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm font-medium outline-none">
        {options.map((option: string) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function SelectRows({ name, label, rows, emptyLabel, defaultValue }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{label}</label>
      <div className="relative">
        <select name={name} defaultValue={defaultValue || ""} className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 px-4 text-sm font-bold text-gray-900 appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none">
          <option value="">{emptyLabel}</option>
          {rows.map((row: any) => (<option key={row.id} value={row.id}>{row.name}</option>))}
        </select>
      </div>
    </div>
  );
}
