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
      
      {/* Animated Particle Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0,
              opacity: 0
            }}
            animate={{ 
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Pulsing Gradient Background */}
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-purple-900/10 to-black"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: [0, 1, 0.8],
          scale: [0.8, 1.2, 1]
        }}
        transition={{ 
          duration: 3,
          times: [0, 0.5, 1],
          ease: "easeOut"
        }}
      />

      {/* Rotating Ring Background */}
      <motion.div
        className="absolute w-[300px] h-[300px] border-2 border-yellow-500/20 rounded-full"
        initial={{ scale: 0, rotate: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 1.5, 1.2],
          rotate: 360,
          opacity: [0, 0.5, 0]
        }}
        transition={{ 
          duration: 4,
          ease: "easeOut",
          delay: 0.5
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center w-full px-6 h-full">
        
        {/* LOGO CONTAINER with Advanced Animations */}
        <div className="relative flex items-center justify-center w-full mb-12">
          
          {/* Outer Glow Ring */}
          <motion.div
            className="absolute w-72 h-72 rounded-full bg-gradient-to-r from-yellow-500/20 via-blue-500/20 to-purple-500/20 blur-3xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.5, 1],
              opacity: [0, 0.6, 0.3],
              rotate: 360
            }}
            transition={{ 
              duration: 3,
              ease: "easeOut",
              delay: 0.3
            }}
          />

          {/* Main Logo Animation */}
          <motion.div
            className="relative z-10"
            initial={{ 
              opacity: 0, 
              scale: 0.3,
              rotateY: 180,
              filter: "blur(20px) brightness(3)" 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              rotateY: 0,
              filter: "blur(0px) brightness(1)" 
            }}
            transition={{ 
              duration: 2.5, 
              ease: [0.6, 0.05, 0.01, 0.9], // Custom cubic bezier
              delay: 0.8
            }}
          >
            {/* Logo with Perspective */}
            <motion.div
              className="relative"
              animate={{ 
                rotateY: [0, 5, -5, 0],
                rotateX: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 3.5
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <img 
                src="/logo.png" 
                alt="Agasthiya Event Logo" 
                className="w-64 h-auto object-contain drop-shadow-[0_20px_50px_rgba(255,215,0,0.4)]"
                style={{ filter: "drop-shadow(0 0 30px rgba(59, 130, 246, 0.3))" }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.getElementById('logo-fallback-2d');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />

              {/* Fallback */}
              <div id="logo-fallback-2d" className="hidden items-center justify-center text-8xl font-serif font-black tracking-tighter">
                <span className="text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.8)] z-20">A</span>
                <span className="text-blue-600 drop-shadow-[0_0_30px_rgba(37,99,235,0.8)] -ml-6 z-10">E</span>
              </div>

              {/* Animated Border Rings */}
              <motion.div 
                className="absolute inset-0 -m-8 border-2 border-yellow-500/30 rounded-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [0.8, 1.1, 1],
                  opacity: [0, 1, 0],
                  rotate: 360
                }}
                transition={{ 
                  duration: 3,
                  delay: 2.5,
                  ease: "easeOut"
                }}
              />

              <motion.div 
                className="absolute inset-0 -m-12 border border-blue-500/30 rounded-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [0.8, 1.2, 1],
                  opacity: [0, 1, 0],
                  rotate: -360
                }}
                transition={{ 
                  duration: 3,
                  delay: 2.7,
                  ease: "easeOut"
                }}
              />
            </motion.div>

            {/* Double Light Sweep */}
            <motion.div 
              className="absolute inset-0 w-[300%] h-[200%] bg-gradient-to-r from-transparent via-yellow-300/60 to-transparent skew-x-[-25deg] pointer-events-none mix-blend-screen"
              initial={{ left: "-200%" }}
              animate={{ left: "200%" }}
              transition={{ 
                duration: 1.2, 
                delay: 3.3, 
                ease: "easeInOut" 
              }}
            />
            
            <motion.div 
              className="absolute inset-0 w-[300%] h-[200%] bg-gradient-to-r from-transparent via-blue-300/40 to-transparent skew-x-[-25deg] pointer-events-none mix-blend-screen"
              initial={{ left: "-200%" }}
              animate={{ left: "200%" }}
              transition={{ 
                duration: 1.2, 
                delay: 3.6, 
                ease: "easeInOut" 
              }}
            />
          </motion.div>

          {/* Orbiting Particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-blue-400 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                x: Math.cos((i / 6) * Math.PI * 2) * 140,
                y: Math.sin((i / 6) * Math.PI * 2) * 140,
              }}
              transition={{
                duration: 2,
                delay: 3 + (i * 0.1),
                ease: "easeOut"
              }}
            />
          ))}
        </div>

        {/* TYPOGRAPHY with Stagger Animation */}
        <motion.div
          className="flex flex-col items-center relative z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4, duration: 1 }}
        >
          {/* Letter-by-letter Animation */}
          <div className="flex items-center justify-center mb-2 overflow-hidden">
            {["A","G","A","S","T","H","I","Y","A"].map((letter, i) => (
              <motion.span
                key={i}
                className="text-4xl font-black tracking-wider"
                style={{
                  background: "linear-gradient(135deg, #FFDF00 0%, #FFFFFF 50%, #00BFFF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0px 4px 20px rgba(255, 255, 255, 0.3)",
                  display: "inline-block"
                }}
                initial={{ 
                  opacity: 0, 
                  y: 50,
                  rotateX: -90,
                  filter: "blur(10px)"
                }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  rotateX: 0,
                  filter: "blur(0px)"
                }}
                transition={{ 
                  duration: 0.6,
                  delay: 4.2 + (i * 0.08),
                  ease: [0.6, 0.05, 0.01, 0.9]
                }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          <div className="flex items-center justify-center overflow-hidden">
            {["E","V","E","N","T"].map((letter, i) => (
              <motion.span
                key={i}
                className="text-4xl font-black tracking-wider"
                style={{
                  background: "linear-gradient(135deg, #00BFFF 0%, #FFFFFF 50%, #FFDF00 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0px 4px 20px rgba(255, 255, 255, 0.3)",
                  display: "inline-block"
                }}
                initial={{ 
                  opacity: 0, 
                  y: 50,
                  rotateX: -90,
                  filter: "blur(10px)"
                }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  rotateX: 0,
                  filter: "blur(0px)"
                }}
                transition={{ 
                  duration: 0.6,
                  delay: 4.9 + (i * 0.08),
                  ease: [0.6, 0.05, 0.01, 0.9]
                }}
              >
                {letter}
              </motion.span>
            ))}
          </div>
          
          {/* Animated Underline */}
          <motion.div
            className="h-1 bg-gradient-to-r from-yellow-500 via-white to-blue-500 rounded-full mt-4"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ 
              duration: 1.2,
              delay: 5.5,
              ease: "easeOut"
            }}
          />

          {/* Tagline with Fade + Slide */}
          <motion.p
            className="text-xs text-gray-400 tracking-[0.4em] mt-6 font-light text-center uppercase"
            initial={{ 
              opacity: 0, 
              y: 20,
              filter: "blur(5px)"
            }}
            animate={{ 
              opacity: 1, 
              y: 0,
              filter: "blur(0px)"
            }}
            transition={{ 
              duration: 1.5, 
              delay: 6,
              ease: "easeOut" 
            }}
          >
            Crafting Unforgettable Experiences
          </motion.p>

          {/* Pulsing Dots */}
          <div className="flex gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-blue-500"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                  opacity: [0, 1, 0.6]
                }}
                transition={{
                  duration: 0.8,
                  delay: 6.5 + (i * 0.2),
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        </motion.div>

      </div>

      {/* Screen Flash Effect */}
      <motion.div
        className="absolute inset-0 bg-white pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ 
          duration: 0.5,
          delay: 3.2,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}