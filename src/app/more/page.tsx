"use client";

import { motion, AnimatePresence } from "framer-motion";

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

import { useEffect, useState } from "react";

export default function MorePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({ name: "Akash Sharma", role: "Super Admin", avatar: "" });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const localProfile = localStorage.getItem("admin_profile");
    if (localProfile) {
      try {
        const parsed = JSON.parse(localProfile);
        setProfile({
          name: parsed.name || "Akash Sharma",
          role: parsed.role || "Super Admin",
          avatar: parsed.avatar || ""
        });
      } catch (e) {
        console.error("Failed to parse local profile");
      }
    }
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return <div className="flex flex-col min-h-screen bg-white"></div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white relative">
      
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowLogoutConfirm(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] p-6 shadow-2xl relative w-full max-w-sm"
            >
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 mx-auto">
                <LogOut size={28} className="text-danger" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Logout?</h3>
              <p className="text-sm text-gray-500 text-center mb-8">
                Are you sure you want to log out of your account? You will need to log back in to access the dashboard.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-900 font-bold rounded-2xl text-sm active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    localStorage.removeItem("isAuthenticated");
                    router.push('/login');
                  }}
                  className="flex-1 py-4 bg-danger text-white font-bold rounded-2xl text-sm active:scale-95 transition-all shadow-xl shadow-red-200"
                >
                  Yes, Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Header */}
      <div className="p-8 bg-gray-50 flex flex-col items-center">
         <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-xl relative">
            <div className="w-full h-full rounded-[1.25rem] overflow-hidden">
               {profile.avatar ? (
                 <img src={profile.avatar} alt="profile" className="w-full h-full object-cover" />
               ) : (
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name)}`} alt="profile" className="w-full h-full object-cover" />
               )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success border-4 border-white rounded-full"></div>
         </div>
         <h2 className="mt-4 text-xl font-bold text-gray-900">{profile.name}</h2>
         <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">{profile.role}</p>
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
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-4 bg-red-50 text-danger rounded-2xl flex items-center justify-center gap-3 font-bold text-sm mt-4 active:scale-95 transition-transform"
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
