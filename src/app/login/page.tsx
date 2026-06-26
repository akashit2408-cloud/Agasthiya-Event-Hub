"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ChevronRight, EyeOff, Eye, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const localProfile = localStorage.getItem("admin_profile");
    let validEmail = "admin@djmaster.com";
    let alternateEmail = "agasthiya12@gmail.com";
    let validPassword = "";

    if (localProfile) {
      try {
        const parsed = JSON.parse(localProfile);
        if (parsed.email) validEmail = parsed.email;
        if (parsed.password !== undefined) validPassword = parsed.password;
      } catch (err) {}
    }

    if (email !== validEmail && email !== alternateEmail) {
      setError("Invalid email address.");
      setIsLoading(false);
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (validPassword && password !== validPassword) {
      setError("Incorrect password.");
      setIsLoading(false);
      setTimeout(() => setError(""), 3000);
      return;
    }

    localStorage.setItem("isAuthenticated", "true");
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 p-8 relative overflow-hidden">
      
      {/* Simplified background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-400/5 to-blue-400/5 rounded-full blur-3xl" />
      </div>

      {/* Error notification */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-10 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white border border-red-200 p-4 rounded-2xl shadow-lg flex items-center gap-3 z-50"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-red-700">Login Failed</h3>
              <p className="text-xs font-medium text-red-500 mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center relative z-10"
        >
          {/* Brand Logo */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-6 mt-12 relative"
          >
            <img src="/login logo.png" alt="App Logo" className="w-80 md:w-96 h-auto object-contain" />
          </motion.div>
        
        {/* Welcome text */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mt-4 text-center"
        >
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent flex items-center justify-center gap-2">
            Welcome Back 👋
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-1.5">
            Login to continue your journey
          </p>
        </motion.div>
        </motion.div>

        {/* Form */}
        <motion.form 
          onSubmit={handleLogin}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mt-10 space-y-5 relative z-10 w-full"
        >
        {/* Email field */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 ml-1">
            Email Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500" size={18} />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter your email" 
              required
              className={`w-full bg-white border-2 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all duration-200 ${
                focusedField === 'email' 
                  ? 'border-blue-400 shadow-lg shadow-blue-100/50' 
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            />
          </div>
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 ml-1">
            Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500" size={18} />
            <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter your password"
              className={`w-full bg-white border-2 rounded-2xl py-4 pl-12 pr-12 text-sm font-medium outline-none transition-all duration-200 ${
                focusedField === 'password' 
                  ? 'border-blue-400 shadow-lg shadow-blue-100/50' 
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all hover:scale-110 active:scale-95"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between mt-2 mb-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-blue-500 border-blue-500' : 'border-gray-300 group-hover:border-blue-400'}`}>
              {rememberMe && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 text-white"><path d="M3 7.5L5.5 10L11 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <span className="text-xs font-semibold text-gray-500 select-none">Remember me</span>
          </label>
          
          <button 
            type="button" 
            onClick={() => alert("Please contact the administrator to reset your password.")}
            className="text-xs font-bold text-blue-600 hover:text-purple-600 transition-colors"
          >
            Forgot Password?
          </button>
        </div>

        {/* Submit button */}
        <motion.button 
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="relative w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl font-bold mt-8 shadow-lg shadow-purple-200/50 overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed transition-all"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>LOGGING IN...</span>
              </>
            ) : (
              <>
                <span>LOGIN</span>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>

          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.button>
      </motion.form>
    </div>

      {/* Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="mt-auto pt-10 pb-4 text-center relative z-10"
      >
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
          Version 1.0.0
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
        </p>
      </motion.div>
    </div>
  );
}