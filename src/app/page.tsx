"use client";

import { Bell, Calendar, Users, Truck, Layers, Plus } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-gray-500 flex items-center gap-1">
            <Layers size={14} /> Dashboard
          </h2>
          <div className="mt-4">
            <h1 className="text-2xl font-black text-gray-900">
              Good Morning, <br />
              <span className="text-primary flex items-center gap-2">
                Akash 👋
              </span>
            </h1>
            <p className="text-xs text-gray-400 font-bold mt-1">19 June 2026</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="relative p-2 bg-gray-50 rounded-xl">
            <Bell size={24} className="text-gray-700" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-white"></span>
          </button>
          <div className="w-12 h-12 rounded-xl bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
             <Calendar className="text-primary" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          label="Today's Events" 
          value="5" 
          icon={<Calendar className="text-primary" size={20} />} 
          color="bg-blue-50"
        />
        <StatCard 
          label="Available Staff" 
          value="12/20" 
          icon={<Users className="text-success" size={20} />} 
          color="bg-green-50"
        />
        <StatCard 
          label="Available Setups" 
          value="4/8" 
          icon={<Layers className="text-purple" size={20} />} 
          color="bg-purple-50"
        />
        <StatCard 
          label="Available Vehicles" 
          value="1/2" 
          icon={<Truck className="text-orange-500" size={20} />} 
          color="bg-orange-50"
        />
      </div>

      {/* Quick Action */}
      <Link href="/events/create" className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform">
        <Plus size={20} />
        New Event
      </Link>

      {/* Upcoming Events Header */}
      <div className="flex justify-between items-end">
        <h3 className="text-lg font-bold text-gray-900">Upcoming Events</h3>
        <Link href="/events" className="text-sm font-bold text-primary">View All</Link>
      </div>

      {/* Event Card */}
      <div className="bg-card p-4 rounded-2xl border border-gray-100 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-50">
              <Layers className="text-primary" size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Wedding Event</h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">20 Jun 2026 • 05:00 PM</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-primary text-[10px] font-black rounded-full uppercase">Planned</span>
        </div>
        
        <div className="pt-2 border-t border-dashed border-gray-200">
           <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Honeycomb Setup</span>
              <div className="flex -space-x-2">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="avatar" />
                   </div>
                 ))}
                 <div className="w-6 h-6 rounded-full border-2 border-white bg-primary flex items-center justify-center text-[8px] text-white font-bold">+2</div>
              </div>
           </div>
        </div>
      </div>

      {/* Recent Activity (Optional but good for ERP) */}
      <div className="space-y-4">
         <h3 className="text-lg font-bold text-gray-900">Quick Tools</h3>
         <div className="grid grid-cols-4 gap-4">
            <Link href="/rentals"><ToolIcon icon={<Truck size={20} />} label="Rentals" color="bg-orange-100 text-orange-600" /></Link>
            <Link href="/calendar"><ToolIcon icon={<Calendar size={20} />} label="Calendar" color="bg-blue-100 text-blue-600" /></Link>
            <Link href="/alerts"><ToolIcon icon={<Bell size={20} />} label="Alerts" color="bg-red-100 text-red-600" /></Link>
            <Link href="/reports"><ToolIcon icon={<Layers size={20} />} label="Reports" color="bg-green-100 text-green-600" /></Link>
         </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className={`${color} p-4 rounded-2xl border border-white shadow-sm space-y-3`}>
      <div className="flex justify-between items-center">
        <span className="p-1.5 bg-white rounded-lg shadow-sm">{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900 leading-tight">{value}</p>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{label}</p>
      </div>
    </div>
  );
}

function ToolIcon({ icon, label, color }: any) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shadow-sm`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">{label}</span>
    </div>
  );
}
