"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Scene3D so it doesn't break SSR
const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });

export default function SplashScreen() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden flex items-center justify-center">
      
      {/* 3D Canvas Layer */}
      <Scene3D />

      {/* 2D Overlay Layer (Synced with 3D animation timeline) */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center pt-64">
        
        {/* Scene 5: Company Name */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 5.5, ease: "easeOut" }}
        >
          <h1 
            className="text-3xl md:text-5xl font-black tracking-[0.25em] md:tracking-[0.3em] uppercase text-center"
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
            initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 1.5, delay: 6.5, ease: "easeOut" }}
          >
            CRAFTING UNFORGETTABLE EXPERIENCES
          </motion.p>
        </motion.div>
      </div>

    </div>
  );
}
