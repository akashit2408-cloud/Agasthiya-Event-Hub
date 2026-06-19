"use client";

import { ChevronLeft, TrendingUp, Calendar, Box, Users, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const router = useRouter();
  const [report, setReport] = useState({
    monthlyRevenue: 0,
    eventCount: 0,
    rentalRevenue: 0,
    staffAssigned: 0,
    staffTotal: 0,
    setupBooked: 0,
    setupTotal: 0,
    loading: true
  });

  useEffect(() => {
    async function fetchReport() {
      try {
        const [{ data: events }, { data: staff }, { data: setups }] = await Promise.all([
          supabase.from("events").select("total_amount, status, event_type, event_date"),
          supabase.from("staff").select("status"),
          supabase.from("setups").select("status, quantity"),
        ]);

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        let monthlyRevenue = 0;
        let eventCount = 0;
        let rentalRevenue = 0;

        (events || []).forEach((e: any) => {
          if (e.status !== "Cancelled") {
            eventCount++;
            
            const eventDate = new Date(e.event_date);
            if (eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear) {
              monthlyRevenue += Number(e.total_amount || 0);
            }

            if (e.event_type && e.event_type.toLowerCase().includes('rental')) {
              rentalRevenue += Number(e.total_amount || 0);
            }
          }
        });

        let staffAssigned = 0;
        let staffTotal = 0;
        (staff || []).forEach((s: any) => {
          if (s.status !== "Inactive") {
            staffTotal++;
            if (s.status === "Assigned") staffAssigned++;
          }
        });

        let setupBooked = 0;
        let setupTotal = 0;
        (setups || []).forEach((s: any) => {
          const qty = Number(s.quantity || 1);
          setupTotal += qty;
          if (s.status === "Booked" || s.status === "Rented") {
            setupBooked += qty;
          }
        });

        setReport({
          monthlyRevenue,
          eventCount,
          rentalRevenue,
          staffAssigned,
          staffTotal,
          setupBooked,
          setupTotal,
          loading: false
        });

      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    }
    fetchReport();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-5 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <button onClick={() => router.back()} className="p-2 -ml-2 bg-gray-50 rounded-full active:scale-95 transition-transform hover:bg-gray-100">
          <ChevronLeft size={20} className="text-gray-900" />
        </button>
        <h1 className="text-base font-extrabold text-gray-900">Reports Overview</h1>
        <div className="w-9" />
      </div>

      <div className="p-5 space-y-4">
        {/* Monthly Revenue Card (Featured) */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <TrendingUp size={100} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                <TrendingUp size={16} className="text-white" />
              </div>
              <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Monthly Revenue</span>
            </div>
            <p className="text-4xl font-black mt-2">
              {report.loading ? "..." : `₹${report.monthlyRevenue.toLocaleString("en-IN")}`}
            </p>
            <p className="text-[10px] text-white/60 mt-1 uppercase font-bold">Current Month</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ReportCard 
            icon={<Calendar className="text-primary" size={20} />} 
            label="Event Count" 
            value={report.loading ? "..." : report.eventCount.toString()} 
            color="bg-blue-100" 
          />
          <ReportCard 
            icon={<CreditCard className="text-green-600" size={20} />} 
            label="Rental Revenue" 
            value={report.loading ? "..." : `₹${report.rentalRevenue.toLocaleString("en-IN")}`} 
            color="bg-green-100" 
          />
          <ReportCard 
            icon={<Users className="text-orange-500" size={20} />} 
            label="Staff Utilization" 
            value={report.loading ? "..." : `${report.staffAssigned} / ${report.staffTotal}`} 
            color="bg-orange-100" 
            subtext="Assigned"
          />
          <ReportCard 
            icon={<Box className="text-purple-600" size={20} />} 
            label="Setup Usage" 
            value={report.loading ? "..." : `${report.setupBooked} / ${report.setupTotal}`} 
            color="bg-purple-100" 
            subtext="Booked"
          />
        </div>
      </div>
    </div>
  );
}

function ReportCard({ icon, label, value, color, subtext }: any) {
  return (
    <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", color)}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</p>
        {subtext && <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}
