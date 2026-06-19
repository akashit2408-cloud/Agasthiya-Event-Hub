"use client";

import { Search, Filter, Calendar, MapPin, Users, Truck, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const tabs = ["All", "Today", "Upcoming", "Completed"];

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="p-5 pb-2 space-y-4">
        <div className="flex items-center gap-4">
           <button className="p-2 -ml-2"><Filter size={20} className="text-gray-900" /></button>
           <h1 className="text-xl font-bold text-gray-900">Events</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search events..." 
            className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2">
             <Filter size={18} className="text-primary" />
          </button>
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
        <EventCard 
          title="Wedding Event"
          date="20 Jun 2026 • 05:00 PM"
          location="ECR, Chennai"
          setup="Honeycomb Setup"
          staff="5 Staff"
          vehicle="Vehicle 2"
          status="Planned"
          statusColor="bg-blue-100 text-primary"
        />
        <EventCard 
          title="Birthday Party"
          date="20 Jun 2026 • 07:30 PM"
          location="OMR, Chennai"
          setup="Basic Setup"
          staff="3 Staff"
          vehicle="Vehicle 1"
          status="Planned"
          statusColor="bg-blue-100 text-primary"
        />
        <EventCard 
          title="Corporate Event"
          date="21 Jun 2026 • 10:00 AM"
          location="Nungambakkam, Chennai"
          setup="Premium Setup"
          staff="6 Staff"
          vehicle="Vehicle 1"
          status="Confirmed"
          statusColor="bg-purple-100 text-purple-600"
        />
        <EventCard 
          title="Rental Booking"
          date="21 Jun 2026 • 04:00 PM"
          location="T. Nagar, Chennai"
          setup="LED Dance Floor"
          staff="No Staff"
          vehicle="N/A"
          status="Rental"
          statusColor="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Floating Action Button */}
      <Link href="/events/create" className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform z-10">
        <Plus size={28} />
      </Link>
    </div>
  );
}

function EventCard({ title, date, location, setup, staff, vehicle, status, statusColor }: any) {
  return (
    <Link href="/events/1" className="block bg-card p-4 rounded-3xl border border-gray-100 space-y-4 active:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-50">
            <Calendar className="text-primary" size={20} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{date}</p>
          </div>
        </div>
        <span className={cn("px-2.5 py-1 text-[9px] font-black rounded-full uppercase", statusColor)}>{status}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-y-3 pt-3 border-t border-dashed border-gray-200">
        <div className="flex items-center gap-2">
           <MapPin size={12} className="text-gray-400" />
           <span className="text-[11px] font-medium text-gray-600">{location}</span>
        </div>
        <div className="flex items-center gap-2">
           <Calendar size={12} className="text-gray-400" />
           <span className="text-[11px] font-medium text-gray-600">{setup}</span>
        </div>
        <div className="flex items-center gap-2">
           <Users size={12} className="text-gray-400" />
           <span className="text-[11px] font-medium text-gray-600">{staff}</span>
        </div>
        <div className="flex items-center gap-2">
           <Truck size={12} className="text-gray-400" />
           <span className="text-[11px] font-medium text-gray-600">{vehicle}</span>
        </div>
      </div>
    </Link>
  );
}
