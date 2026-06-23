"use client";

import { motion } from "framer-motion";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="mobile-container h-screen flex flex-col items-center justify-center bg-black overflow-hidden relative">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 w-full h-full"
      >
        <video 
          autoPlay 
          muted 
          playsInline 
          onEnded={onComplete}
          className="w-full h-full object-cover"
        >
          <source src="/splash-video.mp4" type="video/mp4" />
        </video>
      </motion.div>
    </div>
  );
}
