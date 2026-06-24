"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden flex flex-col items-center justify-center">
      
      {/* Deep Atmosphere Glow */}
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg px-6 h-full">
        
        {/* Scene 1-3: Cinematic Focus Pull on Logo Image */}
        <div className="relative flex items-center justify-center w-full h-48 md:h-64 mb-8">
          <motion.div
            className="relative"
            initial={{ 
              opacity: 0, 
              scale: 1.5, 
              filter: "blur(20px) brightness(2)" 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              filter: "blur(0px) brightness(1)" 
            }}
            transition={{ 
              duration: 3, 
              ease: "circOut", // Strong cinematic ease-out
              delay: 0.5
            }}
          >
            {/* The Actual Logo Image provided by the user */}
            <img 
              src="/logo.png" 
              alt="Agasthiya Event Logo" 
              className="w-48 md:w-64 h-auto object-contain drop-shadow-[0_10px_30px_rgba(255,215,0,0.2)]"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = document.getElementById('logo-fallback-2d');
                if (fallback) fallback.style.display = 'flex';
              }}
            />

            {/* Fallback if logo.png is missing */}
            <div id="logo-fallback-2d" className="hidden items-center justify-center text-7xl md:text-9xl font-serif font-black tracking-tighter">
              <span className="text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] z-20">A</span>
              <span className="text-blue-600 drop-shadow-[0_0_15px_rgba(37,99,235,0.5)] -ml-4 md:-ml-6 z-10">E</span>
            </div>

            {/* Scene 3: Golden Shimmer / Light Sweep over Logo */}
            <motion.div 
              className="absolute inset-0 w-[200%] h-[150%] bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-30deg] pointer-events-none mix-blend-overlay"
              initial={{ left: "-150%" }}
              animate={{ left: "150%" }}
              transition={{ duration: 1.5, delay: 3.5, ease: "easeInOut" }}
            />
          </motion.div>
        </div>

        {/* Scene 4: Typography Reveal */}
        <motion.div
          className="flex flex-col items-center relative z-20"
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 2, delay: 3.8, ease: "easeOut" }}
        >
          <h1 
            className="text-3xl md:text-5xl font-black tracking-[0.25em] md:tracking-[0.3em] uppercase text-center"
            style={{
              background: "linear-gradient(135deg, #FFDF00 0%, #FFFFFF 50%, #00BFFF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0px 4px 20px rgba(255, 255, 255, 0.1)"
            }}
          >
            Agasthiya Event
          </h1>
          
          {/* Tagline */}
          <motion.p
            className="text-xs md:text-sm text-gray-400 tracking-[0.3em] mt-5 font-light text-center uppercase"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 5.2, ease: "easeOut" }}
          >
            Crafting Unforgettable Experiences
          </motion.p>
        </motion.div>

      </div>
    </div>
  );
}
