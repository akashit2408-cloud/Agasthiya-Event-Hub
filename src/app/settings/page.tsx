"use client";

import { ChevronLeft, Save, User, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState({ 
    name: "Akash Sharma", 
    role: "Super Admin", 
    avatar: "",
    email: "admin@djmaster.com",
    password: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const localProfile = localStorage.getItem("admin_profile");
    if (localProfile) {
      try {
        const parsed = JSON.parse(localProfile);
        setProfile({
          name: parsed.name || "Akash Sharma",
          role: parsed.role || "Super Admin",
          avatar: parsed.avatar || "",
          email: parsed.email || "admin@djmaster.com",
          password: parsed.password || ""
        });
      } catch (e) {
        console.error("Failed to parse local profile");
      }
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem("admin_profile", JSON.stringify(profile));
      
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setProfile({ ...profile, avatar: dataUrl });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
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
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 relative group"
              >
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : profile.name ? (
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name)}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="text-gray-300" size={32} />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={20} />
                </div>
              </button>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Profile Image</h3>
                <p className="text-xs text-gray-500 mt-0.5">Click the image to upload a custom photo</p>
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

        <section>
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-2 mt-4">Account & Security</h2>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide ml-1">Email Address</label>
              <input 
                type="email" 
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-400 placeholder:font-medium"
                placeholder="e.g. admin@djmaster.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide ml-1">Change Password</label>
              <input 
                type="password" 
                value={profile.password}
                onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-400 placeholder:font-medium"
                placeholder="Enter new password..."
              />
              <p className="text-[10px] font-semibold text-gray-400 mt-1 ml-1">
                Ensure your account uses a strong password for the login page
              </p>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full mt-2 py-4 rounded-2xl flex items-center justify-center gap-2 bg-danger/10 text-danger font-bold text-sm transition-transform active:scale-[0.98] disabled:opacity-70"
            >
              <Save size={18} />
              {isSaving ? "Saving..." : "Update Security"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
