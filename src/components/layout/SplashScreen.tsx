"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [mounted, setMounted] = useState(false);
  const particles = Array.from({ length: 40 });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden flex items-center justify-center">
      {/* Background Ambience / Volumetric Fog */}
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />

      {/* Scene 1: Darkness & Energy - Particles */}
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${i % 2 === 0 ? "bg-yellow-500 shadow-[0_0_10px_#EAB308]" : "bg-blue-500 shadow-[0_0_10px_#3B82F6]"}`}
          initial={{ 
            opacity: 0, 
            left: "50%", 
            top: "50%",
            scale: 0
          }}
          animate={{ 
            opacity: [0, 0.8, 0],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            scale: Math.random() * 2 + 0.5
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            delay: Math.random() * 2
          }}
          style={{
            width: Math.random() * 4 + 2 + "px",
            height: Math.random() * 4 + 2 + "px",
          }}
        />
      ))}

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg px-6">
        
        {/* Logo Area */}
        <div className="relative flex items-center justify-center w-full h-48 md:h-64 mb-4">
          
          {/* Scene 2: Golden 'A' */}
          <motion.div
            className="absolute text-7xl md:text-9xl font-serif tracking-tighter"
            style={{
              background: "linear-gradient(135deg, #FFDF00 0%, #D4AF37 50%, #996515 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0px 0px 20px rgba(212, 175, 55, 0.5))",
            }}
            initial={{ opacity: 0, x: -100, scale: 1.2, rotateY: 90 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              x: [-100, -20, -10, 0], 
              scale: [1.2, 1, 1, 0.9],
              rotateY: [90, 0, 0, 0] 
            }}
            transition={{ 
              times: [0, 0.2, 0.8, 1],
              duration: 4.5, // 0 to 4.5s
              ease: "easeOut" 
            }}
          >
            A
          </motion.div>

          {/* Scene 3: Blue 'E' */}
          <motion.div
            className="absolute text-7xl md:text-9xl font-serif tracking-tighter"
            style={{
              background: "linear-gradient(135deg, #00BFFF 0%, #0000CD 50%, #000080 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0px 0px 20px rgba(0, 0, 205, 0.5))",
            }}
            initial={{ opacity: 0, x: 100, scale: 1.2, rotateY: -90 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              x: [100, 20, 10, 0], 
              scale: [1.2, 1, 1, 0.9],
              rotateY: [-90, 0, 0, 0] 
            }}
            transition={{ 
              times: [0, 0.2, 0.8, 1],
              duration: 3, // starts at 1.5s -> 4.5s
              delay: 1.5,
              ease: "easeOut" 
            }}
          >
            E
          </motion.div>

          {/* Scene 4 & 5: Final Logo Image Reveal */}
          {/* It fades in exactly as A and E merge and fade out */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0, scale: 1.1, filter: "brightness(3) blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "brightness(1) blur(0px)" }}
            transition={{ duration: 1.5, delay: 4.2, ease: "easeOut" }}
          >
            <div className="relative flex items-center justify-center">
              {/* Note: I'll use a stylized text as fallback, or an img if the user provides one */}
              {/* Since we don't have the image file, the fallback will show first, unless the user uploads 'logo.png' */}
              <img 
                src="/logo.png" 
                alt="Agasthiya Event Logo" 
                className="w-48 md:w-64 h-auto object-contain drop-shadow-[0_0_25px_rgba(255,215,0,0.3)] z-10"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.getElementById('logo-fallback');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              
              {/* Fallback Text Logo if image is missing */}
              <div id="logo-fallback" className="hidden items-center justify-center text-8xl md:text-9xl font-serif font-black tracking-tighter z-10">
                <span className="text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] z-20">A</span>
                <span className="text-blue-600 drop-shadow-[0_0_15px_rgba(37,99,235,0.5)] -ml-4 md:-ml-6 z-10">E</span>
              </div>

              {/* Golden light sweep effect over the logo */}
              <motion.div 
                className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] z-30"
                initial={{ left: "-100%" }}
                animate={{ left: "100%" }}
                transition={{ duration: 1.5, delay: 5.5, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </div>

        {/* Scene 5: Company Name */}
        <motion.div
          className="flex flex-col items-center mt-2 z-20 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 5.5, ease: "easeOut" }}
        >
          <h1 
            className="text-2xl md:text-4xl font-black tracking-[0.25em] md:tracking-[0.3em] uppercase text-center"
            style={{
              background: "linear-gradient(to right, #D4AF37, #FFFFFF, #00BFFF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0px 4px 20px rgba(255, 255, 255, 0.15)"
            }}
          >
            Agasthiya Event
          </h1>
          
          {/* Scene 6: Tagline & Final Impact */}
          <motion.p
            className="text-xs md:text-sm text-gray-300 tracking-[0.3em] mt-4 font-light text-center"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 6.5 }}
          >
            CRAFTING UNFORGETTABLE EXPERIENCES
          </motion.p>
        </motion.div>
        
        {/* Scene 6 Impact - Blue energy pulse radiating */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.3)] pointer-events-none z-0"
          initial={{ width: 0, height: 0, opacity: 0 }}
          animate={{ width: "150vw", height: "150vw", opacity: [0, 1, 0] }}
          transition={{ duration: 2, delay: 6.5, ease: "easeOut" }}
        />
        
      </div>
    </div>
  );
}
