"use client";

import { Search, Filter, Layers, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function SetupsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [setups, setSetups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSetups() {
      try {
        const { data, error } = await supabase.from("setups").select("*").order("name");
        if (error) throw error;
        setSetups(data || []);
      } catch (err) {
        console.error("Error fetching setups:", err);
        setSetups([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSetups();
  }, []);

  const filteredSetups = activeTab === "All" ? setups : setups.filter((setup) => setup.status === activeTab);

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

        <div className="flex gap-4 overflow-x-auto no-scrollbar border-b border-gray-100">
          {["All", "Available", "Booked", "Maintenance"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-3 text-xs font-bold whitespace-nowrap transition-all relative",
                activeTab === tab ? "text-primary" : "text-gray-400"
              )}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-4">
        {loading ? (
          <p className="py-10 text-center text-sm font-medium text-gray-500">Loading setups...</p>
        ) : (
          filteredSetups.map((setup, index) => <SetupCard key={setup.id || index} {...setup} />)
        )}
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
