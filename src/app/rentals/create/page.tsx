"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateRentalPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="p-5 flex items-center justify-between border-b border-gray-50">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Add New Rental</h1>
        <div className="w-10"></div>
      </div>
      <div className="p-5 flex flex-col items-center justify-center flex-1">
        <p className="text-gray-500 font-medium">Add rental form coming soon.</p>
      </div>
    </div>
  );
}
