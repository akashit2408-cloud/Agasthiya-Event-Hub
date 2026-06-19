"use client";

import { Search, Filter, Phone, MessageSquare, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = ["All (20)", "Available (12)", "Assigned (8)", "Leave (0)"];

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState("All (20)");

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      <div className="p-5 space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Staff Directory</h1>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search staff..." 
            className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2">
             <Filter size={18} className="text-primary" />
          </button>
        </div>

        <div className="flex overflow-x-auto gap-4 no-scrollbar border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-3 text-xs font-bold whitespace-nowrap transition-all relative",
                activeTab === tab ? "text-primary" : "text-gray-400"
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-3">
        <StaffCard name="Ravi Kumar" role="DJ Operator" status="Available" />
        <StaffCard name="Mani Shankar" role="Sound Engineer" status="Assigned" />
        <StaffCard name="Arjun Prakash" role="Light Operator" status="Available" />
        <StaffCard name="Suresh Babu" role="Helper" status="Assigned" />
        <StaffCard name="Vicky" role="Helper" status="Available" />
        <StaffCard name="Kumar" role="Driver" status="Available" />
        <StaffCard name="Prakash" role="Sound Engineer" status="Leave" />
      </div>
      
      {/* FAB for adding employee */}
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform">
        <span className="text-2xl font-bold">+</span>
      </button>
    </div>
  );
}

function StaffCard({ name, role, status }: any) {
  const statusStyles: any = {
    Available: "text-success bg-green-100",
    Assigned: "text-orange-600 bg-orange-100",
    Leave: "text-danger bg-red-100",
  };

  return (
    <div className="bg-card p-3 rounded-[1.5rem] border border-gray-50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden shadow-sm border border-white">
           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt={name} />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-sm">{name}</h4>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{role}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <span className={cn("px-2 py-0.5 text-[8px] font-black rounded-full uppercase", statusStyles[status])}>
          {status}
        </span>
        <button className="p-2 bg-white rounded-xl shadow-sm border border-gray-50">
           <Phone size={14} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
}
