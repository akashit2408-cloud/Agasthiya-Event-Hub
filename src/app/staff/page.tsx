"use client";

import { Search, Filter, Phone, MessageSquare, ChevronRight, Plus, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchStaff() {
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        const [
          { data: staffData, error: staffError },
          { data: todayEvents }
        ] = await Promise.all([
          supabase.from("staff").select("*").order("role").order("name"),
          supabase.from("events").select("event_staff(staff_id)").eq("event_date", todayStr)
        ]);

        if (staffError) throw staffError;

        const assignedStaffIds = new Set();
        (todayEvents || []).forEach(ev => {
          (ev.event_staff || []).forEach((s: any) => assignedStaffIds.add(s.staff_id));
        });

        const staffWithDynamicStatus = (staffData || []).map(s => ({
          ...s,
          status: assignedStaffIds.has(s.id) ? "Assigned" : "Available"
        }));

        setStaff(staffWithDynamicStatus);
      } catch (err) {
        console.error("Error fetching staff:", err);
        setStaff([]);
      } finally {
        setLoading(false);
      }
    }
    fetchStaff();
  }, []);

  const counts = {
    All: staff.length,
    Available: staff.filter(s => s.status === "Available").length,
    Assigned: staff.filter(s => s.status === "Assigned").length,
  };

  const tabs = [
    { id: "All", label: `All (${counts.All})` },
    { id: "Available", label: `Available (${counts.Available})` },
    { id: "Assigned", label: `Assigned (${counts.Assigned})` },
  ];

  const filteredStaff = staff.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || member.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "All" || member.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      <div className="p-5 space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Crew Directory</h1>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search crew..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2">
             <Filter size={18} className="text-primary" />
          </button>
        </div>

        <div className="flex overflow-x-auto gap-4 no-scrollbar border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-3 text-xs font-bold whitespace-nowrap transition-all relative",
                activeTab === tab.id ? "text-primary" : "text-gray-400"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-3">
        {loading ? (
          <p className="py-10 text-center text-sm font-medium text-gray-500">Loading crew...</p>
        ) : (
          filteredStaff.map((member, index) => <StaffCard key={member.id || index} {...member} />)
        )}
      </div>
      
      {/* FAB for adding employee */}
      <Link href="/staff/create" className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform z-10">
        <Plus size={28} />
      </Link>
    </div>
  );
}

function StaffCard({ id, name, role, status, avatar_seed, mobile }: any) {
  const statusStyles: any = {
    Available: "text-success bg-green-100",
    Assigned: "text-orange-600 bg-orange-100",
    Leave: "text-danger bg-red-100",
  };

  const imageSrc = avatar_seed && avatar_seed.startsWith('data:image/') 
    ? avatar_seed 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&font-size=0.35&rounded=true&bold=true`;

  return (
    <div className="bg-card p-3 rounded-[1.5rem] border border-gray-50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden shadow-sm border border-white">
           <img src={imageSrc} alt={name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-sm">{name}</h4>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{role}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className={cn("px-2 py-0.5 text-[8px] font-black rounded-full uppercase", statusStyles[status])}>
          {status}
        </span>
        <Link href={`/staff/${id}/edit`} className="p-2 bg-gray-50 rounded-xl shadow-none border border-gray-100 active:scale-95 transition-transform">
          <Pencil size={14} className="text-gray-600" />
        </Link>
        {mobile ? (
          <a href={`tel:${mobile}`} className="p-2 bg-white rounded-xl shadow-sm border border-gray-50 active:scale-95 transition-transform">
             <Phone size={14} className="text-gray-900" />
          </a>
        ) : (
          <button disabled className="p-2 bg-gray-50 rounded-xl shadow-none border border-gray-50 opacity-50 cursor-not-allowed">
             <Phone size={14} className="text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}
