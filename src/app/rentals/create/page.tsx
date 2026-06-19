"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CreateRentalPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      category: String(form.get("category") || ""),
      condition: String(form.get("condition") || "Good"),
      status: "Available",
      due_date: form.get("due_date") ? String(form.get("due_date")) : null,
      notes: String(form.get("notes") || ""),
    };

    const { error } = await supabase.from("rentals").insert(payload);
    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/rentals");
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="p-5 flex items-center justify-between border-b border-gray-50">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Add New Rental</h1>
        <div className="w-10" />
      </div>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <Input name="name" label="Item Name" placeholder="JBL Speaker" required />
        <Input name="category" label="Category" placeholder="Audio" required />
        <Select name="condition" label="Condition" options={["Excellent", "Good", "Fair", "Needs Repair"]} />
        <Input name="due_date" label="Due Date" type="date" />
        <label className="block space-y-1.5">
          <span className="text-xs font-bold text-gray-500 ml-1">Notes</span>
          <textarea name="notes" className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm font-medium outline-none min-h-24" />
        </label>
        <button disabled={saving} className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform disabled:opacity-60">
          {saving ? "Saving..." : "Save Rental"}
        </button>
      </form>
    </div>
  );
}

function Input({ label, ...props }: any) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-gray-500 ml-1">{label}</span>
      <input {...props} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm font-medium outline-none" />
    </label>
  );
}

function Select({ label, name, options }: any) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-gray-500 ml-1">{label}</span>
      <select name={name} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm font-medium outline-none">
        {options.map((option: string) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}
