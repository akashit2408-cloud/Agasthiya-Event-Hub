"use client";

import { ChevronLeft, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RolesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProfiles() {
      const { data, error } = await supabase.from("profiles").select("*").order("role").order("full_name");
      if (!error && data) setProfiles(data);
    }
    fetchProfiles().catch((err) => console.error("Error fetching roles:", err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="p-5 flex items-center justify-between border-b border-gray-50">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Role Management</h1>
        <div className="w-10" />
      </div>
      <div className="p-5 space-y-3">
        {profiles.length === 0 ? (
          <p className="py-10 text-center text-sm font-medium text-gray-500">No user profiles yet.</p>
        ) : profiles.map((profile) => (
          <div key={profile.id} className="bg-card p-4 rounded-3xl border border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="text-primary" size={22} />
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{profile.full_name}</h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase">{profile.role}</p>
              </div>
            </div>
            <span className="text-[9px] font-black uppercase text-success bg-green-100 px-2 py-1 rounded-full">
              {profile.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
