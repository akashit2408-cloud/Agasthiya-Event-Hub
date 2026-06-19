"use client";

import { Search, Filter, Box, Plus, ChevronLeft, Wrench, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";

const tabs = ["All", "Available", "Rented", "Maintenance"];

export default function RentalsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");

  const allRentals = [
    { name: "JBL SRX828SP Subwoofer", category: "Audio", status: "Available", condition: "Good" },
    { name: "Pioneer CDJ-3000", category: "DJ Gear", status: "Rented", condition: "Excellent", dueDate: "21 Jun" },
    { name: "Sharpy Beam Moving Head", category: "Lighting", status: "Maintenance", condition: "Needs Repair" },
    { name: "Yamaha QL5 Digital Console", category: "Audio", status: "Available", condition: "Excellent" },
    { name: "Smoke Machine 1500W", category: "Effects", status: "Rented", condition: "Good", dueDate: "20 Jun" },
    { name: "Truss 2m Aluminum", category: "Staging", status: "Available", condition: "Fair" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="p-5 pb-2 space-y-4">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
             <button onClick={() => router.back()} className="p-2 -ml-2"><ChevronLeft size={24} className="text-gray-900" /></button>
             <h1 className="text-xl font-bold text-gray-900">Rentals</h1>
           </div>
           <button className="p-2 bg-gray-50 rounded-xl"><Filter size={20} className="text-gray-900" /></button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search rental inventory..." 
            className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
        </div>

        {/* Tabs */}
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
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="p-5 space-y-4 overflow-y-auto">
        {allRentals
          .filter(rental => activeTab === "All" || rental.status === activeTab)
          .map((rental, idx) => (
             <RentalCard key={idx} {...rental} />
          ))}
      </div>

      {/* Floating Action Button */}
      <Link href="/rentals/create" className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform z-10">
        <Plus size={28} />
      </Link>
    </div>
  );
}

function RentalCard({ name, category, status, condition, dueDate }: any) {
  const statusStyles: any = {
    Available: "bg-green-100 text-success",
    Rented: "bg-blue-100 text-primary",
    Maintenance: "bg-orange-100 text-warning",
  };

  return (
    <div className="bg-card p-4 rounded-3xl border border-gray-50 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-50">
            <Box className="text-primary" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm leading-tight pr-2">{name}</h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{category}</p>
          </div>
        </div>
        <span className={cn("px-2.5 py-1 text-[9px] font-black rounded-full uppercase shrink-0", statusStyles[status])}>
          {status}
        </span>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-200">
         <div className="flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-gray-400" />
            <span className="text-[10px] font-medium text-gray-500">Condition: <span className="font-bold text-gray-700">{condition}</span></span>
         </div>
         {status === 'Rented' && dueDate && (
            <div className="flex items-center gap-1.5">
               <Clock size={12} className="text-gray-400" />
               <span className="text-[10px] font-bold text-primary">Due: {dueDate}</span>
            </div>
         )}
         {status === 'Maintenance' && (
            <div className="flex items-center gap-1.5">
               <Wrench size={12} className="text-warning" />
               <span className="text-[10px] font-bold text-warning">In Repair</span>
            </div>
         )}
      </div>
    </div>
  );
}
