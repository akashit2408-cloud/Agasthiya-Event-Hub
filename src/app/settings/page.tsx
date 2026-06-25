"use client";

import { ChevronLeft, Save, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState({ name: "Akash Sharma", role: "Super Admin" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase.from("app_settings").select("value").eq("key", "admin_profile").single();
      if (!error && data?.value) {
        setProfile({ name: data.value.name || "", role: data.value.role || "" });
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from("app_settings").upsert({
        key: "admin_profile",
        value: profile
      });
      if (error) throw error;
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-5 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-50 active:scale-95 transition-all">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-black text-gray-900 tracking-wide">Settings</h1>
        <div className="w-10" />
      </div>
      
      <div className="p-5 space-y-6">
        <section>
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Edit Profile</h2>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
                {profile.name ? (
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name)}`} alt="Avatar" />
                ) : (
                  <User className="text-gray-300" size={32} />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Avatar</h3>
                <p className="text-xs text-gray-500 mt-0.5">Updates automatically based on your name</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide ml-1">Display Name</label>
              <input 
                type="text" 
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-400 placeholder:font-medium"
                placeholder="e.g. Akash Sharma"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide ml-1">Role Title</label>
              <input 
                type="text" 
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-400 placeholder:font-medium"
                placeholder="e.g. Super Admin"
              />
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full mt-2 py-4 rounded-2xl flex items-center justify-center gap-2 bg-gray-900 text-white font-bold text-sm transition-transform active:scale-[0.98] disabled:opacity-70"
            >
              <Save size={18} />
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
