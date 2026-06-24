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
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch((e) => {
        console.warn("Autoplay prevented:", e);
        // If autoplay fails, we just call onComplete so the user isn't stuck
        if (onComplete) onComplete();
      });
    }

    // Force exactly 5 seconds duration
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [mounted, onComplete]);

  if (!mounted) return null;

  return (
    <motion.div 
      className="fixed inset-0 z-[100] bg-[#020617] overflow-hidden flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Video with scale to hide the watermark star */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover scale-[1.15] pointer-events-none"
        autoPlay
        muted
        playsInline
      >
        <source src="/entrance_video.mp4" type="video/mp4" />
      </video>

      {/* Overlay Patch to fully obscure any remaining parts of the star if scale isn't enough */}
      <div className="absolute bottom-[5%] right-[5%] w-24 h-24 bg-[#0a1128]/80 backdrop-blur-2xl rounded-full blur-xl pointer-events-none" />

      {/* 4 Corner DJ Lights */}
      <div className="absolute inset-0 pointer-events-none mix-blend-screen">
        {/* Top Left Light */}
        <motion.div
          className="absolute -top-10 -left-10 w-32 h-[60vh] bg-gradient-to-b from-blue-500/50 via-blue-600/10 to-transparent blur-2xl"
          style={{ transformOrigin: 'top center' }}
          animate={{
            rotate: [-20, 45, -10, 30, -20],
            opacity: [0.4, 0.8, 0.3, 0.7, 0.4]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Top Right Light */}
        <motion.div
          className="absolute -top-10 -right-10 w-32 h-[60vh] bg-gradient-to-b from-purple-500/50 via-purple-600/10 to-transparent blur-2xl"
          style={{ transformOrigin: 'top center' }}
          animate={{
            rotate: [20, -45, 10, -30, 20],
            opacity: [0.4, 0.8, 0.3, 0.7, 0.4]
          }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        {/* Bottom Left Light */}
        <motion.div
          className="absolute -bottom-10 -left-10 w-32 h-[60vh] bg-gradient-to-t from-cyan-500/50 via-cyan-600/10 to-transparent blur-2xl"
          style={{ transformOrigin: 'bottom center' }}
          animate={{
            rotate: [20, -45, 10, -30, 20],
            opacity: [0.4, 0.8, 0.3, 0.7, 0.4]
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        {/* Bottom Right Light */}
        <motion.div
          className="absolute -bottom-10 -right-10 w-32 h-[60vh] bg-gradient-to-t from-pink-500/50 via-pink-600/10 to-transparent blur-2xl"
          style={{ transformOrigin: 'bottom center' }}
          animate={{
            rotate: [-20, 45, -10, 30, -20],
            opacity: [0.4, 0.8, 0.3, 0.7, 0.4]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
      </div>
    </motion.div>
  );
}