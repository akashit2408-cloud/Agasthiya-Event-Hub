"use client";

import { ChevronLeft, Database, Download, FileSpreadsheet, Users, Calendar, DollarSign, Package, CheckCircle2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface BackupRecord {
  id: string;
  name: string;
  type: "EXCEL_EVENTS" | "EXCEL_STAFF" | "EXCEL_PAYMENTS" | "EXCEL_FULL" | "JSON_FULL";
  record_count: number;
  created_at: string;
  status: "COMPLETED";
}

export default function BackupPage() {
  const router = useRouter();
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [exportingType, setExportingType] = useState<string | null>(null);

  useEffect(() => {
    fetchBackupHistory();
  }, []);

  const fetchBackupHistory = () => {
    const saved = localStorage.getItem("djerp_backup_history");
    if (saved) {
      try {
        setBackups(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const saveToHistory = (newRecord: BackupRecord) => {
    const saved = localStorage.getItem("djerp_backup_history");
    const current: BackupRecord[] = saved ? JSON.parse(saved) : [];
    const updated = [newRecord, ...current].slice(0, 20); // Keep last 20
    localStorage.setItem("djerp_backup_history", JSON.stringify(updated));
    setBackups(updated);
  };

  // Helper to convert objects to CSV string with UTF-8 BOM for Excel compatibility
  const convertToCSV = (rows: Record<string, any>[]): string => {
    if (!rows || rows.length === 0) return "";

    const headers = Object.keys(rows[0]);
    const csvLines: string[] = [];

    // Header line
    csvLines.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","));

    // Data lines
    rows.forEach(row => {
      const line = headers.map(header => {
        let val = row[header];
        if (val === null || val === undefined) val = "";
        else if (typeof val === "object") val = JSON.stringify(val);
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      }).join(",");
      csvLines.push(line);
    });

    // Add UTF-8 BOM byte order mark so Excel opens special characters (₹, Tamil, emojis) correctly
    return "\uFEFF" + csvLines.join("\n");
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 1. Export Events to Excel (.csv)
  const handleExportEvents = async () => {
    setExportingType("EVENTS");
    try {
      const { data: events, error } = await supabase
        .from("event_list")
        .select("*")
        .order("event_date", { ascending: false });

      if (error) throw error;

      if (!events || events.length === 0) {
        alert("No events found to export.");
        return;
      }

      // Format for Excel
      const formattedRows = events.map(e => ({
        "Event ID": e.id,
        "Event Title": e.display_title || e.title,
        "Type": e.event_type || "N/A",
        "Date": e.event_date,
        "Time": e.event_time || "N/A",
        "Reporting Time": e.reporting_time || "N/A",
        "Location": e.location || "N/A",
        "Customer Name": e.customer_name || "N/A",
        "Customer Mobile": e.customer_mobile || "N/A",
        "Total Amount (₹)": e.total_amount || 0,
        "Advance Paid (₹)": e.advance_paid || 0,
        "Balance Due (₹)": (Number(e.total_amount || 0) - Number(e.advance_paid || 0)),
        "Status": e.status || "Confirmed",
        "Remarks": e.remark || ""
      }));

      const csvData = convertToCSV(formattedRows);
      const filename = `Agasthiya_Events_Export_${new Date().toISOString().split("T")[0]}.csv`;
      downloadFile(csvData, filename, "text/csv;charset=utf-8;");

      saveToHistory({
        id: Date.now().toString(),
        name: "Events Data Export (.csv)",
        type: "EXCEL_EVENTS",
        record_count: formattedRows.length,
        created_at: new Date().toISOString(),
        status: "COMPLETED"
      });
    } catch (err: any) {
      console.error("Export error:", err);
      alert("Failed to export events: " + (err.message || "Unknown error"));
    } finally {
      setExportingType(null);
    }
  };

  // 2. Export Staff to Excel (.csv)
  const handleExportStaff = async () => {
    setExportingType("STAFF");
    try {
      const { data: staff, error } = await supabase
        .from("staff")
        .select("*")
        .order("name");

      if (error) throw error;

      if (!staff || staff.length === 0) {
        alert("No staff records found to export.");
        return;
      }

      const formattedRows = staff.map(s => ({
        "Staff ID": s.id,
        "Name": s.name,
        "Role": s.role || "Technician",
        "Phone": s.mobile || s.phone || s.phone_number || "N/A",
        "GPay Number": s.gpay_number || "N/A",
        "Default Salary (₹)": s.default_salary || 0,
        "Status": s.status || "Active",
        "Created At": s.created_at ? new Date(s.created_at).toLocaleDateString("en-IN") : ""
      }));

      const csvData = convertToCSV(formattedRows);
      const filename = `Agasthiya_Staff_Export_${new Date().toISOString().split("T")[0]}.csv`;
      downloadFile(csvData, filename, "text/csv;charset=utf-8;");

      saveToHistory({
        id: Date.now().toString(),
        name: "Staff List Export (.csv)",
        type: "EXCEL_STAFF",
        record_count: formattedRows.length,
        created_at: new Date().toISOString(),
        status: "COMPLETED"
      });
    } catch (err: any) {
      console.error("Export error:", err);
      alert("Failed to export staff: " + (err.message || "Unknown error"));
    } finally {
      setExportingType(null);
    }
  };

  // 3. Export Financial Payments to Excel (.csv)
  const handleExportPayments = async () => {
    setExportingType("PAYMENTS");
    try {
      const { data: payments, error } = await supabase
        .from("payments")
        .select("*, events(title, customer_name)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!payments || payments.length === 0) {
        alert("No payment records found to export.");
        return;
      }

      const formattedRows = payments.map((p: any) => ({
        "Payment ID": p.id,
        "Event Title": p.events?.title || "N/A",
        "Customer": p.events?.customer_name || "N/A",
        "Amount (₹)": p.amount || 0,
        "Payment Date": p.payment_date || new Date(p.created_at).toLocaleDateString("en-IN"),
        "Payment Method": p.payment_method || "Cash",
        "Payment Status": p.status || "Received",
        "Remarks": p.remarks || ""
      }));

      const csvData = convertToCSV(formattedRows);
      const filename = `Agasthiya_Payments_Export_${new Date().toISOString().split("T")[0]}.csv`;
      downloadFile(csvData, filename, "text/csv;charset=utf-8;");

      saveToHistory({
        id: Date.now().toString(),
        name: "Payments Report Export (.csv)",
        type: "EXCEL_PAYMENTS",
        record_count: formattedRows.length,
        created_at: new Date().toISOString(),
        status: "COMPLETED"
      });
    } catch (err: any) {
      console.error("Export error:", err);
      alert("Failed to export payments: " + (err.message || "Unknown error"));
    } finally {
      setExportingType(null);
    }
  };

  // 4. Export Full Database (Combined Excel CSVS & JSON Backup)
  const handleFullBackup = async () => {
    setExportingType("FULL");
    try {
      const [
        { data: events },
        { data: staff },
        { data: setups },
        { data: vehicles },
        { data: payments }
      ] = await Promise.all([
        supabase.from("events").select("*"),
        supabase.from("staff").select("*"),
        supabase.from("setups").select("*"),
        supabase.from("vehicles").select("*"),
        supabase.from("payments").select("*")
      ]);

      const fullData = {
        meta: {
          app: "Agasthiya Event Hub ERP",
          exported_at: new Date().toISOString(),
          version: "1.0.0"
        },
        counts: {
          events: events?.length || 0,
          staff: staff?.length || 0,
          setups: setups?.length || 0,
          vehicles: vehicles?.length || 0,
          payments: payments?.length || 0
        },
        data: {
          events: events || [],
          staff: staff || [],
          setups: setups || [],
          vehicles: vehicles || [],
          payments: payments || []
        }
      };

      const jsonStr = JSON.stringify(fullData, null, 2);
      const filename = `Agasthiya_Full_System_Backup_${new Date().toISOString().split("T")[0]}.json`;
      downloadFile(jsonStr, filename, "application/json");

      saveToHistory({
        id: Date.now().toString(),
        name: "Full System JSON Backup",
        type: "JSON_FULL",
        record_count: (events?.length || 0) + (staff?.length || 0) + (setups?.length || 0),
        created_at: new Date().toISOString(),
        status: "COMPLETED"
      });
    } catch (err: any) {
      console.error("Full backup error:", err);
      alert("Failed to create full backup: " + (err.message || "Unknown error"));
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-slate-800" />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Backup & Data Export</h1>
            <p className="text-[11px] text-slate-500 font-medium">Export Excel sheets & system backups</p>
          </div>
        </div>
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
          <ShieldCheck size={20} />
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto w-full space-y-6">

        {/* Section 1: Excel Data Exports */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="text-emerald-600" size={20} />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Export Data to Excel (.CSV)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Events Excel Export */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Calendar size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Events Register</h3>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    Export all event details, dates, venues, customers & amounts.
                  </p>
                </div>
              </div>

              <button
                onClick={handleExportEvents}
                disabled={exportingType !== null}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {exportingType === "EVENTS" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    <span>Export Events (Excel)</span>
                  </>
                )}
              </button>
            </div>

            {/* Staff Excel Export */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                  <Users size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Staff & Crew List</h3>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    Export team members, phone numbers, roles & default salaries.
                  </p>
                </div>
              </div>

              <button
                onClick={handleExportStaff}
                disabled={exportingType !== null}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {exportingType === "STAFF" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    <span>Export Staff (Excel)</span>
                  </>
                )}
              </button>
            </div>

            {/* Payments Excel Export */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <DollarSign size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Payments & Revenue</h3>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    Export payment transactions, amounts, payment dates & methods.
                  </p>
                </div>
              </div>

              <button
                onClick={handleExportPayments}
                disabled={exportingType !== null}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {exportingType === "PAYMENTS" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    <span>Export Payments (Excel)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Full System Database Backup */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Database className="text-indigo-600" size={20} />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Full System Backup
            </h2>
          </div>

          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 rounded-3xl shadow-lg space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-bold text-base">Full Database Backup (JSON)</h3>
                <p className="text-xs text-indigo-200 leading-relaxed">
                  Downloads a complete backup file containing all events, staff, setups, vehicles, and payment records.
                </p>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
                <Database size={24} className="text-indigo-300" />
              </div>
            </div>

            <button
              onClick={handleFullBackup}
              disabled={exportingType !== null}
              className="w-full py-3 bg-white text-indigo-950 hover:bg-indigo-50 font-extrabold rounded-2xl text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {exportingType === "FULL" ? (
                <>
                  <div className="w-4 h-4 border-2 border-indigo-950 border-t-transparent rounded-full animate-spin" />
                  <span>Creating System Backup...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Download Full System Backup (.json)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section 3: Export History */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Recent Export History
          </h2>

          {backups.length === 0 ? (
            <div className="py-8 text-center bg-white rounded-2xl border border-slate-200/80 p-4">
              <p className="text-xs font-medium text-slate-400">No export files created yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {backups.map((b) => (
                <div
                  key={b.id}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{b.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {new Date(b.created_at).toLocaleString("en-IN")} • {b.record_count} Records
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

