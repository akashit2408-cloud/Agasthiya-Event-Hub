"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import BottomNav from "./BottomNav";
import SplashScreen from "./SplashScreen";

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
    if (hasSeenSplash) {
      setShowSplash(false);
    }
    // No timer here anymore, let the video trigger onComplete
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem("hasSeenSplash", "true");
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
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
