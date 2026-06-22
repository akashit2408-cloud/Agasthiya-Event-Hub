"use client";

import { ChevronLeft, Calendar, MapPin, Phone, User, Link as LinkIcon, Layers, Camera, X, ImageIcon, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function CreateEventPage() {
  const router = useRouter();
  const [setups, setSetups] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [staffRemarks, setStaffRemarks] = useState<Record<string, string>>({});
  const [showRemarkInputFor, setShowRemarkInputFor] = useState<Record<string, boolean>>({});
  const [showAllStaff, setShowAllStaff] = useState(false);
  const [selectedSetups, setSelectedSetups] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
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
      setVehicles(vehicleRows || []);
      setStaff(staffRows || []);
    }
    fetchResources().catch((err) => console.error("Error loading event resources:", err));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const form = new FormData(event.currentTarget);
    const mobile = String(form.get("mobile") || "");
    const customerName = String(form.get("customer_name") || "");

    let customerId: string | null = null;
    const { data: existingCustomer } = await supabase.from("customers").select("id").eq("mobile", mobile).maybeSingle();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert({
          name: customerName,
          mobile,
          address: String(form.get("location") || ""),
        })
        .select("id")
        .single();

      if (customerError) {
        setSaving(false);
        alert(customerError.message);
        return;
      }
      customerId = newCustomer.id;
    }

    const { data: newEvent, error: eventError } = await supabase
      .from("events")
      .insert({
        customer_id: customerId,
        title: String(form.get("title") || `${form.get("event_type")} Event`),
        event_type: String(form.get("event_type") || "Event"),
        location: String(form.get("location") || ""),
        map_link: String(form.get("map_link") || "") || null,
        event_date: String(form.get("event_date") || ""),
        event_time: String(form.get("event_time") || "17:00"),
        vehicle_id: String(form.get("vehicle_id") || "") || null,
        total_amount: Number(form.get("total_amount") || 0),
        notes: String(form.get("notes") || ""),
        invitation_url: invitationImage,
        remark: remark,
        status: "Planned",
      })
      .select("id")
      .single();

    if (eventError) {
      setSaving(false);
      alert(eventError.message);
      return;
    }

    if (selectedStaff.length > 0) {
      await supabase.from("event_staff").insert(selectedStaff.map((staffId) => ({ 
        event_id: newEvent.id, 
        staff_id: staffId,
        assigned_role: staffRemarks[staffId] || null
      })));
    }

    const setupEntries = Object.entries(selectedSetups);
    if (setupEntries.length > 0) {
      await supabase.from("event_setups").insert(
        setupEntries.map(([setupId, quantity]) => ({ event_id: newEvent.id, setup_id: setupId, quantity }))
      );
    }

    setSaving(false);
    router.push("/events");
  }

  function toggleStaff(staffId: string) {
    setSelectedStaff((current) => current.includes(staffId) ? current.filter((id) => id !== staffId) : [...current, staffId]);
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="p-5 flex items-center justify-between border-b border-gray-50">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Create Event</h1>
        <div className="w-10" />
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        <InputField name="customer_name" label="Customer Name" icon={<User size={18} />} placeholder="Enter customer name" required />
        <InputField name="mobile" label="Mobile Number" icon={<Phone size={18} />} placeholder="Enter mobile number" required />
        <InputField name="title" label="Event Title" icon={<Calendar size={18} />} placeholder="Wedding Event" required />
        <SelectField name="event_type" label="Event Type" options={["Wedding", "Birthday", "Corporate", "Rental", "Other"]} />
        <InputField name="location" label="Location" icon={<MapPin size={18} />} placeholder="Enter location" required />
        <InputField name="map_link" label="Google Map Link" icon={<LinkIcon size={18} />} placeholder="Paste google map link" />

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
          <InputField name="event_date" label="Date" type="date" icon={<Calendar size={18} />} required />
          <InputField name="event_time" label="Time" type="time" icon={<Calendar size={18} />} defaultValue="17:00" required />
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Select Setups ({Object.keys(selectedSetups).length})</h2>
          {setups.map((setup) => (
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

              {selectedSetups[setup.id] && ["Cold Pyro", "3rd Dance Floor", "LED Dance Floor", "LED Dance Floor 12by12 size"].includes(setup.name) && (
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setSelectedSetups(prev => ({...prev, [setup.id]: Math.max(1, prev[setup.id] - 1)}))} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 font-bold">-</button>
                  <span className="text-sm font-bold w-4 text-center">{selectedSetups[setup.id]}</span>
                  <button type="button" onClick={() => setSelectedSetups(prev => ({...prev, [setup.id]: prev[setup.id] + 1}))} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 font-bold">+</button>
                </div>
              )}
            </div>
          ))}
        </div>
        <InputField name="notes" label="Additional Notes" icon={<Layers size={18} />} placeholder="Any other specific requirements?" />
        <SelectRows name="vehicle_id" label="Vehicle Required" rows={vehicles} emptyLabel="No vehicle" />
        <InputField name="total_amount" label="Total Amount" type="number" icon={<Calendar size={18} />} placeholder="0" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Select Staff ({selectedStaff.length})</h2>
            <button 
              type="button" 
              onClick={() => setShowAllStaff(!showAllStaff)}
              className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full"
            >
              {showAllStaff ? "Show Selected" : "Show All Staff"}
            </button>
          </div>
          {(showAllStaff ? staff : staff.filter(m => selectedStaff.includes(m.id))).map((member) => (
            <div key={member.id} className="w-full flex flex-col gap-2 p-3 bg-card border border-gray-50 rounded-2xl">
              <button
                type="button"
                onClick={() => toggleStaff(member.id)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    <img src={member.avatar_seed && member.avatar_seed.startsWith('data:image/') ? member.avatar_seed : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&font-size=0.35&rounded=true&bold=true`} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-900">{member.name}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{member.role}</p>
                  </div>
                </div>
                <div className={cn("w-5 h-5 rounded flex items-center justify-center transition-colors", selectedStaff.includes(member.id) ? "bg-primary" : "border-2 border-gray-200")}>
                  {selectedStaff.includes(member.id) && <div className="w-2 h-2 bg-white rounded-sm" />}
                </div>
              </button>
              {selectedStaff.includes(member.id) && (
                showRemarkInputFor[member.id] || staffRemarks[member.id] ? (
                  <input 
                    type="text" 
                    placeholder="Add remark/assigned role..." 
                    className="w-full bg-gray-50 border-none rounded-xl py-2 px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all mt-1"
                    value={staffRemarks[member.id] || ""}
                    onChange={(e) => setStaffRemarks(prev => ({ ...prev, [member.id]: e.target.value }))}
                  />
                ) : (
                  <button 
                    type="button" 
                    onClick={() => setShowRemarkInputFor(prev => ({ ...prev, [member.id]: true }))}
                    className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg text-left mt-1 w-fit ml-12 hover:bg-gray-100 transition-colors"
                  >
                    + Add Remark
                  </button>
                )
              )}
            </div>
          ))}
        </div>

        <button disabled={saving} className="w-full py-4 bg-primary text-white rounded-2xl font-bold mt-4 shadow-lg active:scale-95 transition-transform disabled:opacity-60">
          {saving ? "Saving..." : "Confirm Event"}
        </button>
      </form>
    </div>
  );
}

function InputField({ label, icon, ...props }: any) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-gray-500 ml-1">{label}</span>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
        <input {...props} className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
      </div>
    </label>
  );
}

function SelectField({ label, name, options }: any) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-gray-500 ml-1">{label}</span>
      <select name={name} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm font-medium outline-none">
        {options.map((option: string) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function SelectRows({ label, name, rows, emptyLabel }: any) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-gray-500 ml-1">{label}</span>
      <select name={name} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm font-medium outline-none">
        <option value="">{emptyLabel}</option>
        {rows.map((row: any) => <option key={row.id} value={row.id}>{row.name}</option>)}
      </select>
    </label>
  );
}
