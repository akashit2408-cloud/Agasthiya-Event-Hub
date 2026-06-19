"use client";

import { motion } from "framer-motion";

export default function SplashScreen() {
  return (
    <div className="mobile-container h-screen flex flex-col items-center justify-center bg-white">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="flex gap-4 mb-8">
          <span className="text-4xl animate-bounce">🎵</span>
          <span className="text-4xl animate-bounce delay-100">🎧</span>
          <span className="text-4xl animate-bounce delay-200">🎵</span>
        </div>
        
        <h1 className="text-3xl font-black text-primary tracking-tighter text-center px-8">
          DJ EVENTER <br />
          <span className="text-secondary">CHENNAI</span>
        </h1>
        
        <div className="mt-12 flex flex-col items-center">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold mb-2">Powered By</p>
          <p className="text-sm font-bold text-gray-800">AGASTHIYA EVENTS</p>
        </div>
        
        <div className="absolute bottom-20 flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-gray-500 font-medium">Managing Events...</p>
        </div>
      </motion.div>
    </div>
  );
}
