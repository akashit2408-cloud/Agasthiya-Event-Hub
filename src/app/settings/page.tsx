"use client";

import { ChevronLeft, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<any[]>([]);

  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase.from("app_settings").select("*").order("key");
      if (!error && data) setSettings(data);
    }
    fetchSettings().catch((err) => console.error("Error fetching settings:", err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="p-5 flex items-center justify-between border-b border-gray-50">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Settings</h1>
        <div className="w-10" />
      </div>
      <div className="p-5 space-y-3">
        {settings.length === 0 ? (
          <p className="py-10 text-center text-sm font-medium text-gray-500">No settings found.</p>
        ) : settings.map((setting) => (
          <div key={setting.key} className="bg-card p-4 rounded-3xl border border-gray-50 flex gap-3">
            <Settings className="text-gray-500" size={20} />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">{setting.key}</h4>
              <p className="text-xs text-gray-500 mt-1 break-all">{JSON.stringify(setting.value)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
