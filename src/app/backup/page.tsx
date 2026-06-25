"use client";

import { ChevronLeft, Database } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BackupPage() {
  const router = useRouter();
  const [backups, setBackups] = useState<any[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const fetchBackups = async () => {
    const { data, error } = await supabase.from("backup_runs").select("*").order("created_at", { ascending: false });
    if (!error && data) setBackups(data);
  };

  useEffect(() => {
    fetchBackups().catch((err) => console.error("Error fetching backups:", err));
  }, []);

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    // Simulate backup delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create backup record
    const { error } = await supabase.from("backup_runs").insert([
      { status: "COMPLETED" }
    ]);
    
    if (!error) {
      await fetchBackups();
    }
    setIsBackingUp(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="p-5 flex items-center justify-between border-b border-gray-50">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Backup & Restore</h1>
        <div className="w-10" />
      </div>

      <div className="p-5">
        <button 
          onClick={handleCreateBackup}
          disabled={isBackingUp}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 disabled:opacity-70 flex justify-center items-center gap-2 transition-all active:scale-95"
        >
          {isBackingUp ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              CREATING BACKUP...
            </>
          ) : (
            <>
              <Database size={20} />
              CREATE NEW BACKUP
            </>
          )}
        </button>
      </div>
      <div className="p-5 space-y-3">
        {backups.length === 0 ? (
          <p className="py-10 text-center text-sm font-medium text-gray-500">No backup runs yet.</p>
        ) : backups.map((backup) => (
          <div key={backup.id} className="bg-card p-4 rounded-3xl border border-gray-50 flex gap-3">
            <Database className="text-purple-600" size={22} />
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-sm">Full System Backup</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{new Date(backup.created_at).toLocaleString("en-IN")}</span>
                <span className="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                  {backup.status}
                </span>
              </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-colors">
              <Database size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
