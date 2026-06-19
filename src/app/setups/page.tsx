"use client";

import { Search, Filter, Layers, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function SetupsPage() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      <div className="p-5 space-y-4">
        <h1 className="text-xl font-bold text-gray-900">DJ Setups</h1>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search setups..." 
            className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none"
          />
        </div>
      </div>

      <div className="px-5 space-y-4">
        <SetupCard name="Basic Setup" quantity={2} status="Available" />
        <SetupCard name="Honeycomb Setup" quantity={2} status="Booked" />
        <SetupCard name="Premium Setup" quantity={1} status="Maintenance" />
        <SetupCard name="LED Dance Floor Setup" quantity={1} status="Available" />
        <SetupCard name="Line Array Setup" quantity={1} status="Available" />
        <SetupCard name="Outdoor Setup" quantity={1} status="Available" />
        <SetupCard name="Wedding Setup" quantity={1} status="Available" />
        <SetupCard name="Festival Setup" quantity={1} status="Available" />
      </div>
    </div>
  );
}

function SetupCard({ name, quantity, status }: any) {
  const statusStyles: any = {
    Available: "bg-green-100 text-success",
    Booked: "bg-red-100 text-danger",
    Maintenance: "bg-orange-100 text-warning",
  };

  return (
    <div className="bg-card p-4 rounded-3xl border border-gray-50 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-50">
          <Layers className="text-primary" size={24} />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-sm">{name}</h4>
          <p className="text-[11px] text-gray-500 font-bold uppercase mt-0.5">Quantity: {quantity}</p>
        </div>
      </div>
      <span className={cn("px-2.5 py-1 text-[9px] font-black rounded-full uppercase", statusStyles[status])}>
        {status}
      </span>
    </div>
  );
}
