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
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Assume true initially to prevent flash, then check
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem("hasSeenSplash", "true");
  };

  useEffect(() => {
    if (!showSplash) {
      return;
    }

    // Fallback timer just in case the video fails to load or play
    // Increased to 15 seconds so longer videos don't get accidentally cut off
    const timer = setTimeout(() => {
      handleSplashComplete();
    }, 15000); // 15 seconds fallback
    return () => clearTimeout(timer);
  }, [showSplash]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("isAuthenticated") === "true";
      setIsAuthenticated(auth);
      setIsCheckingAuth(false);
      
      if (!auth && pathname !== "/login") {
        router.push("/login");
      } else if (auth && pathname === "/login") {
        router.push("/");
      }
    }
  }, [pathname, router]);

  if (showSplash || isCheckingAuth) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  const isAuthPage = pathname === "/login";

  return (
    <div className="mobile-container flex flex-col min-h-screen bg-white">
      <main className={`flex-1 ${!isAuthPage ? 'pb-20' : ''}`}>
        {children}
      </main>
      {!isAuthPage && <BottomNav />}
    </div>
  );
}
