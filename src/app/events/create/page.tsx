"use client";

import { ChevronLeft, Calendar, MapPin, Phone, User, Link as LinkIcon, Layers, Camera, X, ImageIcon, MessageSquare, Truck } from "lucide-react";
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
  const [dropSequence, setDropSequence] = useState<string>("None");
  const [customVehicleName, setCustomVehicleName] = useState<string>("");
  const [showAllStaff, setShowAllStaff] = useState(false);
  const [selectedSetups, setSelectedSetups] = useState<Record<string, number>>({});
  const [resourceCategory, setResourceCategory] = useState<"Setup" | "Equipment">("Setup");
  const [saving, setSaving] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionError, setExtractionError] = useState("");
  const [invitationImage, setInvitationImage] = useState<string | null>(null);
  const [remark, setRemark] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getExtractionErrorMessage = (message?: string, status?: number) => {
    const rawMessage = (message || "").toLowerCase();
    
    if (rawMessage.includes("api key not configured") || rawMessage.includes("key is invalid")) {
      return "Setup Required: Please add your GEMINI_API_KEY to your Vercel Environment Variables!";
    }
    if (status === 413 || rawMessage.includes("payload too large")) {
      return "Image is too large! Please crop it or compress it before uploading.";
    }
    if (status === 503 || rawMessage.includes("503") || rawMessage.includes("service unavailable") || rawMessage.includes("high demand")) {
      return "Auto-fill is temporarily busy because Gemini is under high demand. Please try again after a minute.";
    }
    if (status === 400) {
      return "Please upload a clear invitation image and try auto-fill again.";
    }

    return message ? `Error: ${message}` : "Auto-fill could not extract the details now. Please try again or enter the details manually.";
  };

  const handleExtract = async (imageData: string) => {
    if (isExtracting) return;
    setExtractionError("");
    setExtractionProgress(1);
    setIsExtracting(true);
    try {
      const response = await fetch('/api/extract-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      });
      const result = await response.json();

      if (!response.ok || !result.data) {
        setExtractionError(getExtractionErrorMessage(result.error, response.status));
        return;
      }

      const { title, event_type, event_date, event_time, location, map_link } = result.data;
      
      const titleEl = document.getElementById('input-title') as HTMLInputElement;
      if (titleEl && title && !titleEl.value) titleEl.value = title;
      
      const typeEl = document.getElementById('select-event-type') as HTMLSelectElement;
      if (typeEl && event_type) typeEl.value = event_type;

      const dateEl = document.getElementById('input-date') as HTMLInputElement;
      if (dateEl && event_date && !dateEl.value) dateEl.value = event_date;

      const timeEl = document.getElementById('input-time') as HTMLInputElement;
      if (timeEl && event_time && !timeEl.value) timeEl.value = event_time;

      const locEl = document.getElementById('input-location') as HTMLInputElement;
      if (locEl && location && !locEl.value) locEl.value = location;

      const mapLinkEl = document.getElementById('input-map-link') as HTMLInputElement;
      if (mapLinkEl && map_link && !mapLinkEl.value) mapLinkEl.value = map_link;
    } catch (err: any) {
      console.error(err);
      setExtractionError(getExtractionErrorMessage(err.message));
    } finally {
      setExtractionProgress(100);
      await new Promise((resolve) => window.setTimeout(resolve, 450));
      setIsExtracting(false);
    }
  };

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
        setExtractionError("");
        setExtractionProgress(0);
        setInvitationImage(compressedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!isExtracting) return;

    const progressTimer = window.setInterval(() => {
      setExtractionProgress((current) => {
        if (current >= 94) return current;
        return Math.min(94, current + 3);
      });
    }, 140);

    return () => window.clearInterval(progressTimer);
  }, [isExtracting]);

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

    const form_vehicle_id = String(form.get("vehicle_id") || "");
    let final_vehicle_id: string | null = form_vehicle_id || null;

    if (form_vehicle_id === "others") {
      const cName = customVehicleName.trim() || "Others";
      const { data: existingCustom } = await supabase.from("vehicles").select("id").ilike("name", cName).maybeSingle();
      if (existingCustom) {
        final_vehicle_id = existingCustom.id;
      } else {
        const { data: newVehicle, error: newVehicleError } = await supabase.from("vehicles").insert({ name: cName, status: "Available" }).select("id").single();
        if (!newVehicleError && newVehicle) {
          final_vehicle_id = newVehicle.id;
        } else {
          final_vehicle_id = null;
        }
      }
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
        vehicle_id: final_vehicle_id,
        total_amount: Number(form.get("total_amount") || 0),
        notes: String(form.get("notes") || ""),
        invitation_url: invitationImage,
        remark: remark,
        drop_sequence: dropSequence === "None" ? null : dropSequence,
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
        <InputField id="input-title" name="title" label="Event Title" icon={<Calendar size={18} />} placeholder="Wedding Event" required />
        <SelectField id="select-event-type" name="event_type" label="Event Type" options={["Wedding", "Reception", "Birthday", "Corporate", "School Event", "College Event", "Sangeet", "Baby Shower", "Rental", "Other"]} />
        <InputField id="input-location" name="location" label="Location" icon={<MapPin size={18} />} placeholder="Enter location" required />
        <InputField id="input-map-link" name="map_link" label="Google Map Link" icon={<LinkIcon size={18} />} placeholder="Paste google map link" />

        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Event Invitation</label>
          <div className="bg-card border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            {invitationImage ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-full max-w-[200px] rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                  <img src={invitationImage} alt="Invitation Preview" className="w-full h-auto object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setInvitationImage(null);
                      setExtractionError("");
                      setExtractionProgress(0);
                    }}
                    disabled={isExtracting}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    <X size={14} />
                  </button>
                </div>
                {isExtracting ? (
                  <div className="w-full max-w-[220px] flex flex-col items-center gap-2 mt-2">
                    <div className="flex items-center justify-between w-full px-1">
                      <span className="text-xs font-bold text-purple-700 flex items-center gap-1">
                        <span className="animate-pulse">✨</span> Extracting...
                      </span>
                      <span className="text-xs font-bold text-purple-700">{extractionProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 transition-all duration-300 ease-out relative"
                        style={{ width: `${extractionProgress}%` }}
                      >
                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-[shimmer_1s_infinite]" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => handleExtract(invitationImage!)} className="px-4 py-2 bg-purple-50 text-purple-700 font-bold text-xs rounded-xl border border-purple-200 flex items-center gap-2 shadow-sm active:scale-95 transition-all mt-2">
                    <span>✨</span> Auto-fill Details
                  </button>
                )}
                {extractionError && (
                  <div className="text-[10px] text-red-500 bg-red-50 p-2.5 rounded-xl border border-red-100 text-center max-w-[250px] font-medium mt-1">
                    {extractionError}
                  </div>
                )}
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
          <InputField id="input-date" name="event_date" label="Date" type="date" icon={<Calendar size={18} />} required />
          <InputField id="input-time" name="event_time" label="Time" type="time" icon={<Calendar size={18} />} defaultValue="17:00" required />
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

              {selectedSetups[setup.id] && (
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
        <InputField name="notes" label="Additional Notes" icon={<Layers size={18} />} placeholder="Any other specific requirements?" />
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
            `}} />
          </div>
        </div>
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

function SelectField({ label, name, options, id }: any) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-gray-500 ml-1">{label}</span>
      <select id={id} name={name} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm font-medium outline-none">
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
