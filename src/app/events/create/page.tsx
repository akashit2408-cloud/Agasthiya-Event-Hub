"use client";

import { ChevronLeft, Calendar, MapPin, Phone, User, Link as LinkIcon, Clock, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function CreateEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b border-gray-50">
        <button onClick={() => step === 1 ? router.back() : setStep(1)} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">{step === 1 ? "Create Event" : "Plan Resources"}</h1>
        <div className="w-10"></div>
      </div>

      {step === 1 ? (
        <div className="p-5 space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Event Details</h2>
            
            <InputField label="Customer Name" icon={<User size={18}/>} placeholder="Enter customer name" />
            <InputField label="Mobile Number" icon={<Phone size={18}/>} placeholder="Enter mobile number" />
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 ml-1">Event Type</label>
              <div className="relative">
                <select className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-4 pr-10 text-sm font-medium appearance-none outline-none">
                  <option>Select event type</option>
                  <option>Wedding</option>
                  <option>Birthday</option>
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <InputField label="Location" icon={<MapPin size={18}/>} placeholder="Enter location" />
            <InputField label="Google Map Link" icon={<LinkIcon size={18}/>} placeholder="Paste google map link" />

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 ml-1">Date</label>
                  <div className="relative">
                    <input type="date" defaultValue="2026-06-19" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-xs font-medium outline-none" />
                  </div>
               </div>
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 ml-1">Time</label>
                  <div className="relative">
                    <input type="time" defaultValue="17:00" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-xs font-medium outline-none" />
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
             <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Setup & Resources</h2>
             <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 ml-1">Setup Required</label>
                <div className="relative">
                  <select className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm font-medium outline-none">
                    <option>Select setup</option>
                  </select>
                </div>
             </div>
             <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 ml-1">Vehicle Required</label>
                <div className="relative">
                  <select className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm font-medium outline-none">
                    <option>Select option</option>
                  </select>
                </div>
             </div>
          </div>

          <button 
            onClick={() => setStep(2)}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold mt-4 shadow-lg active:scale-95 transition-transform"
          >
            Next: Plan Resources →
          </button>
        </div>
      ) : (
        <div className="p-5 space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <ResourceSelector label="Setup" value="Honeycomb Setup" status="Available" />
              <ResourceSelector label="Vehicle" value="Vehicle 2" status="Available" />
           </div>

           <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <h2 className="text-sm font-bold text-gray-900">Staff Required</h2>
                 <div className="flex items-center gap-4 bg-gray-50 rounded-xl px-3 py-1.5">
                    <button className="text-primary font-bold text-xl">-</button>
                    <span className="font-bold text-sm w-4 text-center">5</span>
                    <button className="text-primary font-bold text-xl">+</button>
                 </div>
              </div>

              <div className="space-y-3">
                 <h3 className="text-xs font-bold text-primary uppercase">Select Staff (5)</h3>
                 <p className="text-[10px] text-gray-400 font-bold uppercase">Available Staff</p>
                 
                 <div className="space-y-2">
                    <StaffSelectItem name="Ravi Kumar" role="DJ Operator" selected={true} />
                    <StaffSelectItem name="Mani Shankar" role="Sound Engineer" selected={true} />
                    <StaffSelectItem name="Arjun Prakash" role="Light Operator" selected={true} />
                    <StaffSelectItem name="Suresh Babu" role="Helper" selected={true} />
                    <StaffSelectItem name="Vicky" role="Helper" selected={true} />
                 </div>
              </div>
           </div>

           <button 
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold mt-4 shadow-lg active:scale-95 transition-transform"
            onClick={() => router.push('/events')}
          >
            Confirm Event
          </button>
        </div>
      )}
    </div>
  );
}

function InputField({ label, icon, placeholder }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-500 ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
        <input 
          type="text" 
          placeholder={placeholder} 
          className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all"
        />
      </div>
    </div>
  );
}

function ResourceSelector({ label, value, status }: any) {
  return (
    <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
       <p className="text-[10px] font-bold text-primary uppercase mb-1">{label}</p>
       <p className="text-xs font-bold text-gray-900 mb-1">{value}</p>
       <span className="text-[9px] font-bold text-success bg-green-100 px-2 py-0.5 rounded-full">{status}</span>
    </div>
  );
}

function StaffSelectItem({ name, role, selected }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-card border border-gray-50 rounded-2xl">
       <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt={name} />
          </div>
          <div>
             <p className="text-xs font-bold text-gray-900">{name}</p>
             <p className="text-[10px] text-gray-400 font-medium">{role}</p>
          </div>
       </div>
       <div className={cn("w-5 h-5 rounded flex items-center justify-center transition-colors", selected ? "bg-primary" : "border-2 border-gray-200")}>
          {selected && <div className="w-2 h-2 bg-white rounded-sm"></div>}
       </div>
    </div>
  );
}
