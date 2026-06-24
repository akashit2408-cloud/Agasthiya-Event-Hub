"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import BottomNav from "./BottomNav";
import SplashScreen from "./SplashScreen";

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === "undefined") return true;
    return !sessionStorage.getItem("hasSeenSplash");
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!showSplash) {
      return;
    }

    const timer = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem("hasSeenSplash", "true");
    }, 8500); // Extended for cinematic entrance animation
    return () => clearTimeout(timer);
  }, [showSplash]);

  if (showSplash) {
    return <SplashScreen />;
  }

  const isAuthPage = pathname === "/login";

  return (
    <div className="mobile-container flex flex-col min-h-screen bg-white">
      <main className="flex-1 pb-20">
        {children}
      </main>
      {!isAuthPage && <BottomNav />}
    </div>
  );
}
