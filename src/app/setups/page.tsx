"use client";

import { Search, Layers, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function SetupsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [activeCategory, setActiveCategory] = useState<"Setup" | "Equipment">("Setup");
  const [searchQuery, setSearchQuery] = useState("");
  const [setups, setSetups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSetup, setNewSetup] = useState({ name: "", category: "Setup", quantity: 1, status: "Available" });
  const [isSaving, setIsSaving] = useState(false);

  const fetchSetups = async () => {
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
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSetups();
  }, []);

  const handleAddSetup = async () => {
    if (!newSetup.name) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from("setups").insert(newSetup);
      if (error) throw error;
      setShowAddModal(false);
      setNewSetup({ name: "", category: activeCategory, quantity: 1, status: "Available" });
      await fetchSetups();
    } catch (err: any) {
      console.error(err);
      alert("Error adding setup: " + (err.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSetups = setups.filter((setup) => {
    const matchesCategory = (setup.category || "Setup") === activeCategory;
    const matchesStatus = activeTab === "All" || setup.status === activeTab;
    const matchesSearch = setup.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const openAddModal = () => {
    setNewSetup({ name: "", category: activeCategory, quantity: 1, status: "Available" });
    setShowAddModal(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      <div className="p-5 space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Setups & Equipment</h1>

        <div className="grid grid-cols-2 rounded-2xl bg-gray-100 p-1">
          {(["Setup", "Equipment"] as const).map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={cn(
                "rounded-xl py-3 text-sm font-bold transition-all",
                activeCategory === category ? "bg-white text-primary shadow-sm" : "text-gray-500"
              )}
            >
              {category === "Setup" ? "Setups" : "Equipment"}
            </button>
          ))}
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={`Search ${activeCategory === "Setup" ? "setups" : "equipment"}...`}
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
          filteredSetups.length > 0 ? (
            filteredSetups.map((setup, index) => <SetupCard key={setup.id || index} {...setup} />)
          ) : (
            <p className="py-10 text-center text-sm font-medium text-gray-500">
              No {activeCategory === "Setup" ? "setups" : "equipment"} found.
            </p>
          )
        )}
      </div>

      <button 
        onClick={openAddModal}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform z-10"
      >
        <Plus size={28} />
      </button>

      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-10 space-y-6 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-900">Add {activeCategory}</h3>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">{activeCategory} Name</label>
                <input 
                  type="text" 
                  value={newSetup.name}
                  onChange={(e) => setNewSetup({...newSetup, name: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder={activeCategory === "Setup" ? "e.g. Premium DJ Setup" : "e.g. VRX A-Plus Speakers"}
                />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Quantity</label>
                  <input 
                    type="number" 
                    min="1"
                    value={newSetup.quantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewSetup({...newSetup, quantity: val === "" ? ("" as any) : parseInt(val)});
                    }}
                    className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Status</label>
                  <select 
                    value={newSetup.status}
                    onChange={(e) => setNewSetup({...newSetup, status: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Available">Available</option>
                    <option value="Booked">Booked</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              onClick={handleAddSetup}
              disabled={isSaving || !newSetup.name}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold active:scale-95 transition-transform disabled:opacity-50"
            >
              {isSaving ? "Saving..." : `Save ${activeCategory}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SetupCard({ name, quantity, status, category }: any) {
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
          {category !== "Setup" && (
            <p className="text-[11px] text-gray-500 font-bold uppercase mt-0.5">Quantity: {quantity}</p>
          )}
        </div>
      </div>
      <span className={cn("px-2.5 py-1 text-[9px] font-black rounded-full uppercase", statusStyles[status])}>
        {status}
      </span>
    </div>
  );
}
