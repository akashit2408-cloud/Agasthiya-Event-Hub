"use client";

import { motion } from "framer-motion";
import { Mail, Lock, Key, ChevronRight, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: any) => {
    e.preventDefault();
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white p-8">
      <div className="mt-12 flex flex-col items-center">
        <div className="flex gap-3 mb-6 scale-125">
          <span className="text-3xl">🎵</span>
          <span className="text-3xl">🎧</span>
          <span className="text-3xl">🎵</span>
        </div>
        
        <h1 className="text-2xl font-black text-primary tracking-tighter text-center">
          DJ MASTER <br />
          <span className="text-secondary uppercase">Planner</span>
        </h1>
        
        <div className="mt-10 text-center">
           <h2 className="text-xl font-bold text-gray-900">Welcome Back 👋</h2>
           <p className="text-sm text-gray-400 font-medium mt-1">Login to continue</p>
        </div>
      </div>

      <form onSubmit={handleLogin} className="mt-12 space-y-5">
        <div className="space-y-1.5">
           <label className="text-xs font-bold text-gray-500 ml-1">Email</label>
           <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none"
              />
           </div>
        </div>

        <div className="space-y-1.5">
           <label className="text-xs font-bold text-gray-500 ml-1">Password</label>
           <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                placeholder="Enter your password" 
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-12 text-sm font-medium outline-none"
              />
              <EyeOff className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
           </div>
        </div>

        <div className="space-y-1.5">
           <label className="text-xs font-bold text-gray-500 ml-1">Invitation Code (Optional)</label>
           <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Enter invitation code" 
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none"
              />
           </div>
        </div>

        <div className="flex items-center justify-between px-1">
           <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <span className="text-xs font-bold text-gray-600">Remember me</span>
           </label>
           <button type="button" className="text-xs font-bold text-primary">Forgot Password?</button>
        </div>

        <button 
          type="submit"
          className="w-full py-4 bg-primary text-white rounded-2xl font-bold mt-4 shadow-xl shadow-blue-100 active:scale-[0.98] transition-all"
        >
          LOGIN
        </button>
      </form>

      <div className="mt-auto pt-10 pb-4 text-center">
         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Version 1.0.0</p>
      </div>
    </div>
  );
}
