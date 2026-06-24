"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface SplashScreenProps {
  onComplete?: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div 
      className="fixed inset-0 z-[100] bg-black overflow-hidden flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <video
        className="w-full h-full object-contain pointer-events-none"
        autoPlay
        muted
        playsInline
        onEnded={() => {
          if (onComplete) onComplete();
        }}
        onError={() => {
          // Fallback if video fails to load
          if (onComplete) onComplete();
        }}
      >
        <source src="/AGASTHIYA_EVENT_-_Premium_Logo.mp4" type="video/mp4" />
      </video>
    </motion.div>
  );
}