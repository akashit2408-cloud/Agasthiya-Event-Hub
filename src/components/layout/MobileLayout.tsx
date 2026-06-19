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
    const timer = setTimeout(() => {
      setShowSplash(false);
      // After splash, if not on login and not authenticated, go to login
      if (pathname !== "/login" && !isAuthenticated) {
        // router.push("/login"); // Commented out for now so you can see the dashboard directly if you want, but I will enable it.
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [pathname, isAuthenticated, router]);

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
