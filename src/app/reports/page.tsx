"use client";

import { ChevronLeft, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ReportsPage() {
  const router = useRouter();
  const [report, setReport] = useState({ events: 0, revenue: 0, collected: 0, staff: 0 });

  useEffect(() => {
    async function fetchReport() {
      const [{ data: events }, { data: payments }, { count: staffCount }] = await Promise.all([
        supabase.from("events").select("total_amount,status"),
        supabase.from("payments").select("amount,status"),
        supabase.from("staff").select("*", { count: "exact", head: true }),
      ]);

      setReport({
        events: (events || []).filter((event: any) => event.status !== "Cancelled").length,
        revenue: (events || []).reduce((sum: number, event: any) => sum + Number(event.total_amount || 0), 0),
        collected: (payments || []).filter((payment: any) => payment.status === "Paid").reduce((sum: number, payment: any) => sum + Number(payment.amount || 0), 0),
        staff: staffCount || 0,
      });
    }
    fetchReport().catch((err) => console.error("Error fetching reports:", err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="p-5 flex items-center justify-between border-b border-gray-50">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Reports</h1>
        <div className="w-10" />
      </div>
      <div className="p-5 grid grid-cols-2 gap-4">
        <ReportCard label="Events" value={report.events} />
        <ReportCard label="Staff" value={report.staff} />
        <ReportCard label="Booked Revenue" value={`₹${report.revenue.toLocaleString("en-IN")}`} />
        <ReportCard label="Collected" value={`₹${report.collected.toLocaleString("en-IN")}`} />
      </div>
    </div>
  );
}

function ReportCard({ label, value }: any) {
  return (
    <div className="bg-card p-4 rounded-3xl border border-gray-50 space-y-3">
      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
        <BarChart3 className="text-primary" size={20} />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-[10px] font-bold text-gray-500 uppercase">{label}</p>
      </div>
    </div>
  );
}
