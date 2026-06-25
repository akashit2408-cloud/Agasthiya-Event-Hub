"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ChevronRight, EyeOff, Eye, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: any) => {
    e.preventDefault();
    
    const localProfile = localStorage.getItem("admin_profile");
    let validEmail = "admin@djmaster.com";
    let validPassword = "";

    if (localProfile) {
      try {
        const parsed = JSON.parse(localProfile);
        if (parsed.email) validEmail = parsed.email;
        if (parsed.password !== undefined) validPassword = parsed.password;
      } catch (err) {}
    }

    if (email !== validEmail) {
      setError("Invalid email address.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (validPassword && password !== validPassword) {
      setError("Incorrect password.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    localStorage.setItem("isAuthenticated", "true");
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white p-8 relative overflow-hidden">
      
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-10 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-red-50 border border-red-200 p-4 rounded-2xl shadow-xl shadow-red-100 flex items-center gap-3 z-50"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-700">Login Failed</h3>
              <p className="text-xs font-medium text-red-500 mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col justify-center">
        <div className="flex flex-col items-center">
          <div className="mb-6">
            <img src="/logo.png" alt="App Logo" className="w-48 h-auto object-contain" />
          </div>
          
          <div className="mt-6 text-center">
             <h2 className="text-2xl font-bold text-gray-900">Welcome Back 👋</h2>
             <p className="text-sm text-gray-400 font-medium mt-1">Login to continue</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="mt-10 space-y-5">
          <div className="space-y-1.5">
             <label className="text-xs font-bold text-gray-500 ml-1">Email</label>
             <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  required
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
             </div>
          </div>

          <div className="space-y-1.5">
             <label className="text-xs font-bold text-gray-500 ml-1">Password</label>
             <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" 
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-12 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
             </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold mt-8 shadow-xl shadow-blue-100 active:scale-[0.98] transition-all"
          >
            LOGIN
          </button>
        </form>
      </div>

      <div className="mt-auto pt-6 pb-4 text-center">
         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Version 1.0.0</p>
      </div>
    </div>
  );
}