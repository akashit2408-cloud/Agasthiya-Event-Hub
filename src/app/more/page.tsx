"use client";

import { 
  User, 
  Settings, 
  FileText, 
  MessageSquare, 
  LogOut, 
  ChevronRight, 
  Shield, 
  Database,
  Truck,
  Layers,
  Calendar,
  CreditCard,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MorePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {/* Profile Header */}
      <div className="p-8 bg-gray-50 flex flex-col items-center">
         <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-xl relative">
            <div className="w-full h-full rounded-[1.25rem] overflow-hidden">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Akash" alt="profile" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success border-4 border-white rounded-full"></div>
         </div>
         <h2 className="mt-4 text-xl font-bold text-gray-900">Akash Sharma</h2>
         <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">Super Admin</p>
      </div>

      <div className="p-5 space-y-6">
        <Section label="Management">
          <MenuItem icon={<Truck className="text-orange-500" />} label="Vehicles" href="/vehicles" />
          <MenuItem icon={<Layers className="text-purple-500" />} label="Rentals" href="/rentals" />
          <MenuItem icon={<Calendar className="text-blue-500" />} label="Calendar View" href="/calendar" />
          <MenuItem icon={<CreditCard className="text-green-500" />} label="Payments & Revenue" href="/payments" />
        </Section>

        <Section label="Communication">
          <MenuItem icon={<MessageSquare className="text-green-600" />} label="WhatsApp Templates" href="/whatsapp" />
          <MenuItem icon={<FileText className="text-gray-500" />} label="Reports" href="/reports" />
        </Section>

        <Section label="System">
          <MenuItem icon={<Shield className="text-blue-600" />} label="Role Management" href="/roles" />
          <MenuItem icon={<Database className="text-purple-600" />} label="Backup & Restore" href="/backup" />
          <MenuItem icon={<Settings className="text-gray-400" />} label="Settings" href="/settings" />
        </Section>

        <button 
          onClick={() => router.push('/login')}
          className="w-full py-4 bg-red-50 text-danger rounded-2xl flex items-center justify-center gap-3 font-bold text-sm mt-4"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

function Section({ label, children }: any) {
  return (
    <div className="space-y-3">
       <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{label}</h3>
       <div className="bg-card rounded-3xl border border-gray-50 overflow-hidden">
          {children}
       </div>
    </div>
  );
}

function MenuItem({ icon, label, href }: any) {
  return (
    <Link href={href || "#"} className="w-full p-4 flex items-center justify-between border-b border-gray-50 last:border-none active:bg-gray-50 transition-colors">
       <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-gray-50">
             {icon}
          </div>
          <span className="text-sm font-bold text-gray-700">{label}</span>
       </div>
       <ChevronRight size={18} className="text-gray-300" />
    </Link>
  );
}
