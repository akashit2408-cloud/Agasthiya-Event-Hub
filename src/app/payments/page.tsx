"use client";

import { ChevronLeft, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PaymentsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPayments() {
      const [{ data: events }, { data: payments }] = await Promise.all([
        supabase.from("events").select("id,title,total_amount,customer_id,customers(name)").order("event_date", { ascending: false }),
        supabase.from("payments").select("event_id,amount,status"),
      ]);

      const paidByEvent = new Map<string, number>();
      (payments || []).forEach((payment: any) => {
        if (payment.status === "Paid") paidByEvent.set(payment.event_id, (paidByEvent.get(payment.event_id) || 0) + Number(payment.amount || 0));
      });

      setRows((events || []).map((event: any) => {
        const paid = paidByEvent.get(event.id) || 0;
        return { ...event, paid, balance: Number(event.total_amount || 0) - paid };
      }));
    }
    fetchPayments().catch((err) => console.error("Error fetching payments:", err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="p-5 flex items-center justify-between border-b border-gray-50">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Payments & Revenue</h1>
        <div className="w-10" />
      </div>
      <div className="p-5 space-y-4">
        {rows.length === 0 ? (
          <p className="py-10 text-center text-sm font-medium text-gray-500">No payment records yet.</p>
        ) : rows.map((row) => (
          <div key={row.id} className="bg-card p-4 rounded-3xl border border-gray-50 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center">
                <CreditCard className="text-success" size={22} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{row.title}</h4>
                <p className="text-[11px] text-gray-500 font-bold uppercase">{row.customers?.name || "Customer"}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <Amount label="Total" value={row.total_amount} />
              <Amount label="Paid" value={row.paid} />
              <Amount label="Balance" value={row.balance} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Amount({ label, value }: any) {
  return (
    <div className="bg-white rounded-2xl p-2 border border-gray-50">
      <p className="text-[9px] font-black text-gray-400 uppercase">{label}</p>
      <p className="text-xs font-black text-gray-900">₹{Number(value || 0).toLocaleString("en-IN")}</p>
    </div>
  );
}
