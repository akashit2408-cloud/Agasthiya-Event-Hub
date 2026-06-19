"use client";

import { ChevronLeft, Calendar, MapPin, Users, Truck, Layers, MessageSquare, ExternalLink, Copy, XCircle, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function EventDetailsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-white pb-10">
      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b border-gray-50">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Event Details</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-5 space-y-6">
        {/* Banner Card */}
        <div className="bg-primary p-6 rounded-[2.5rem] text-white space-y-4 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Calendar size={120} />
           </div>
           <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black">Wedding Event</h2>
                <div className="flex items-center gap-2 mt-2 opacity-90">
                   <Calendar size={14} />
                   <span className="text-xs font-bold uppercase tracking-wider">20 Jun 2026 • 05:00 PM</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-[10px] font-black rounded-full uppercase">Planned</span>
           </div>

           <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <div className="flex items-center gap-2">
                 <MapPin size={16} />
                 <span className="text-xs font-bold">ECR, Chennai</span>
              </div>
              <button className="flex items-center gap-1.5 text-[10px] font-black bg-white text-primary px-3 py-1.5 rounded-full uppercase tracking-tighter">
                 View on Map <ExternalLink size={10} />
              </button>
           </div>
        </div>

        {/* Resources Section */}
        <div className="space-y-4">
           <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Resources</h3>
              <button className="text-xs font-bold text-primary flex items-center gap-1"><Edit2 size={12} /> Edit</button>
           </div>

           <div className="space-y-3">
              <ResourceItem icon={<Layers className="text-primary" size={20} />} label="Setup" value="Honeycomb Setup" />
              <ResourceItem icon={<Truck className="text-primary" size={20} />} label="Vehicle" value="Vehicle 2" />
              
              <div className="bg-card p-4 rounded-3xl border border-gray-50 space-y-4">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <Users className="text-primary" size={20} />
                       <span className="text-sm font-bold text-gray-600">Staff (5)</span>
                    </div>
                    <button className="text-[10px] font-black text-primary uppercase">View All</button>
                 </div>
                 <div className="flex -space-x-3">
                    {[1, 2, 3, 4, 5].map(i => (
                       <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-sm">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Staff${i}`} alt="staff" />
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
           <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Actions</h3>
           
           <ActionButton 
              icon={<MessageSquare size={20} />} 
              label="Send to Team" 
              color="bg-green-500" 
              onClick={() => alert('Sending to WhatsApp Team...')}
           />
           <ActionButton 
              icon={<MessageSquare size={20} />} 
              label="Send to Customer" 
              color="bg-primary" 
           />
           <ActionButton 
              icon={<Copy size={20} />} 
              label="Copy Details" 
              color="bg-purple-600" 
           />
           
           <button className="w-full py-4 bg-danger/10 text-danger rounded-2xl font-black text-sm uppercase tracking-widest mt-4">
              Cancel Event
           </button>
        </div>
      </div>
    </div>
  );
}

function ResourceItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between bg-card p-4 rounded-3xl border border-gray-50">
       <div className="flex items-center gap-3">
          {icon}
          <div>
             <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">{label}</p>
             <p className="text-sm font-bold text-gray-900">{value}</p>
          </div>
       </div>
       <ChevronLeft className="rotate-180 text-gray-300" size={20} />
    </div>
  );
}

function ActionButton({ icon, label, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn("w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-white font-bold text-sm transition-transform active:scale-[0.98]", color)}
    >
      {icon}
      {label}
    </button>
  );
}
