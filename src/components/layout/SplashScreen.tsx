"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface SplashScreenProps {
  onComplete?: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [mounted, setMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Ensure video is muted and plays to bypass some mobile autoplay restrictions
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch((e) => {
        console.warn("Autoplay prevented:", e);
        // If autoplay fails, we just call onComplete so the user isn't stuck
        if (onComplete) onComplete();
      });
    }
  }, [mounted, onComplete]);

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
        ref={videoRef}
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
        <source src="/entrance_video.mp4" type="video/mp4" />
      </video>
    </motion.div>
  );
}