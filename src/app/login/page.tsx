"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ChevronRight, EyeOff, Eye, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";
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

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API delay for smooth animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check credentials against local storage profile
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
    
    // Add success delay before navigation
    await new Promise(resolve => setTimeout(resolve, 500));
    router.push("/");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        duration: 0.6
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const shimmerVariants = {
    animate: {
      backgroundPosition: ["200% 0", "-200% 0"],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 p-8 relative overflow-hidden">
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-400 to-blue-400 rounded-full blur-3xl"
        />
      </div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20"
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: i * 0.5
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
        />
      ))}

      {/* Error notification */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
              }
            }}
            exit={{ 
              opacity: 0, 
              y: -20, 
              scale: 0.9,
              transition: {
                duration: 0.2
              }
            }}
            className="absolute top-10 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/95 backdrop-blur-xl border border-red-200 p-4 rounded-2xl shadow-2xl shadow-red-100/50 flex items-center gap-3 z-50"
          >
            <motion.div 
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shrink-0"
            >
              <AlertCircle size={20} className="text-red-600" />
            </motion.div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-red-700">Login Failed</h3>
              <p className="text-xs font-medium text-red-500 mt-0.5">{error}</p>
            </div>
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 3 }}
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-12 flex flex-col items-center relative z-10"
      >
        {/* Logo */}
        <motion.div 
          variants={logoVariants}
          whileHover={{ scale: 1.05, rotate: 5 }}
          className="mb-6 relative"
        >
          <motion.div
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.3)",
                "0 0 40px rgba(147, 51, 234, 0.4)",
                "0 0 20px rgba(59, 130, 246, 0.3)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 blur-xl"
          />
          <img src="/logo.png" alt="App Logo" className="w-48 h-auto object-contain relative z-10" />
        </motion.div>
        
        {/* Welcome text */}
        <motion.div 
          variants={itemVariants}
          className="mt-10 text-center"
        >
          <motion.h2 
            className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent flex items-center justify-center gap-2"
            animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            Welcome Back 
            <motion.span
              animate={{ rotate: [0, 14, -8, 14, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              👋
            </motion.span>
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-sm text-gray-500 font-medium mt-2"
          >
            Login to continue your journey
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Form */}
      <motion.form 
        onSubmit={handleLogin} 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-12 space-y-6 relative z-10"
      >
        {/* Email field */}
        <motion.div 
          variants={itemVariants}
          className="space-y-2"
        >
          <label className="text-xs font-bold text-gray-600 ml-1 flex items-center gap-1">
            Email Address
            {focusedField === 'email' && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-blue-500"
              >
                <Sparkles size={12} />
              </motion.span>
            )}
          </label>
          <motion.div 
            className="relative"
            whileTap={{ scale: 0.99 }}
          >
            <motion.div
              animate={{
                rotate: focusedField === 'email' ? [0, -10, 10, 0] : 0,
                scale: focusedField === 'email' ? 1.1 : 1
              }}
              transition={{ duration: 0.3 }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <Mail size={18} />
            </motion.div>
            <motion.input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter your email" 
              required
              whileFocus={{ scale: 1.01 }}
              className="w-full bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:border-blue-400 focus:bg-white focus:shadow-lg focus:shadow-blue-100/50 transition-all duration-300"
              style={{
                background: focusedField === 'email' 
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(239,246,255,0.9) 100%)'
                  : undefined
              }}
            />
          </motion.div>
        </motion.div>

        {/* Password field */}
        <motion.div 
          variants={itemVariants}
          className="space-y-2"
        >
          <label className="text-xs font-bold text-gray-600 ml-1 flex items-center gap-1">
            Password
            {focusedField === 'password' && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-blue-500"
              >
                <Sparkles size={12} />
              </motion.span>
            )}
          </label>
          <motion.div 
            className="relative"
            whileTap={{ scale: 0.99 }}
          >
            <motion.div
              animate={{
                rotate: focusedField === 'password' ? [0, -10, 10, 0] : 0,
                scale: focusedField === 'password' ? 1.1 : 1
              }}
              transition={{ duration: 0.3 }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <Lock size={18} />
            </motion.div>
            <motion.input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter your password" 
              whileFocus={{ scale: 1.01 }}
              className="w-full bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-12 text-sm font-medium outline-none focus:border-blue-400 focus:bg-white focus:shadow-lg focus:shadow-blue-100/50 transition-all duration-300"
              style={{
                background: focusedField === 'password' 
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(239,246,255,0.9) 100%)'
                  : undefined
              }}
            />
            <motion.button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <motion.div
                animate={{ rotate: showPassword ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </motion.div>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Submit button */}
        <motion.button 
          type="submit"
          disabled={isLoading}
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="relative w-full py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white rounded-2xl font-bold mt-8 shadow-2xl shadow-blue-200/50 overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            variants={shimmerVariants}
            animate="animate"
            style={{ backgroundSize: "200% 100%" }}
          />
          
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
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronRight size={20} />
                </motion.div>
              </>
            )}
          </span>

          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          />
        </motion.button>
      </motion.form>

      {/* Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-auto pt-10 pb-4 text-center relative z-10"
      >
        <motion.p 
          variants={floatingVariants}
          animate="animate"
          className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
          Version 1.0.0
          <motion.span
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
          />
        </motion.p>
      </motion.div>
    </div>
  );
}