"use client";

import { ChevronLeft, Database } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BackupPage() {
  const router = useRouter();
  const [backups, setBackups] = useState<any[]>([]);

  useEffect(() => {
    async function fetchBackups() {
      const { data, error } = await supabase.from("backup_runs").select("*").order("created_at", { ascending: false });
      if (!error && data) setBackups(data);
    }
    fetchBackups().catch((err) => console.error("Error fetching backups:", err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="p-5 flex items-center justify-between border-b border-gray-50">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Backup & Restore</h1>
        <div className="w-10" />
      </div>
      <div className="p-5 space-y-3">
        {backups.length === 0 ? (
          <p className="py-10 text-center text-sm font-medium text-gray-500">No backup runs yet.</p>
        ) : backups.map((backup) => (
          <div key={backup.id} className="bg-card p-4 rounded-3xl border border-gray-50 flex gap-3">
            <Database className="text-purple-600" size={22} />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">{backup.status}</h4>
              <p className="text-xs text-gray-500 mt-1">{new Date(backup.created_at).toLocaleString("en-IN")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
