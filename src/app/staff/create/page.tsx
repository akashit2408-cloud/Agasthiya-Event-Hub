"use client";

import { ChevronLeft, User, Phone, Briefcase, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function CreateStaffPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "Helper",
    status: "Available"
  });

  const roles = ["DJ Operator", "Sound Engineer", "Light Operator", "Helper", "Driver"];
  const statuses = ["Available", "Assigned", "Leave"];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white p-5 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 bg-gray-50 rounded-full active:scale-95 transition-transform">
          <ChevronLeft size={20} className="text-gray-900" />
        </button>
        <h1 className="text-base font-extrabold text-gray-900">Add New Staff</h1>
        <div className="w-9"></div>
      </div>

      <div className="p-5 space-y-6 flex-1">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="e.g. Ravi Kumar"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="tel" 
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>
        </div>

        {/* Role */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Role</label>
          <div className="grid grid-cols-2 gap-3">
             {roles.map(role => (
                <button
                  key={role}
                  onClick={() => setFormData({...formData, role})}
                  className={cn(
                    "py-3 px-4 rounded-xl text-xs font-bold border transition-all text-center",
                    formData.role === role 
                      ? "bg-primary/10 border-primary text-primary" 
                      : "bg-white border-gray-200 text-gray-600"
                  )}
                >
                  {role}
                </button>
             ))}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Initial Status</label>
          <div className="flex gap-3">
             {statuses.map(status => (
                <button
                  key={status}
                  onClick={() => setFormData({...formData, status})}
                  className={cn(
                    "flex-1 py-3 px-2 rounded-xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-1.5",
                    formData.status === status 
                      ? "bg-gray-900 border-gray-900 text-white" 
                      : "bg-white border-gray-200 text-gray-600"
                  )}
                >
                  {formData.status === status && <CheckCircle2 size={14} />}
                  {status}
                </button>
             ))}
          </div>
        </div>

      </div>

      <div className="p-5 pb-8 bg-white border-t border-gray-100">
        <button 
          onClick={() => router.push('/staff')}
          className="w-full bg-[#00A859] text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
        >
          <CheckCircle2 size={20} />
          Save Staff Member
        </button>
      </div>
    </div>
  );
}
