"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Mark as mounted to prevent hydration flash
    setMounted(true);
    
    // 2. Sync local state with the actual theme applied to the document
    const isDarkTheme = document.documentElement.classList.contains("dark");
    setIsDark(isDarkTheme);
  }, []);

  const toggleTheme = () => {
    const newDarkState = !isDark;
    setIsDark(newDarkState);
    if (newDarkState) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex transition-colors duration-300">
      
      {/* Sidebar remains fixed */}
      <Sidebar />

      <div className="flex-1 flex flex-col lg:pl-72 h-full overflow-hidden">
        {/* Navbar receives the synced theme state */}
        <Navbar isDark={isDark} toggleTheme={toggleTheme} />
        
        <main className="flex-1 p-6 md:p-10 overflow-y-auto overflow-x-hidden scroll-smooth relative">
          
          {/* Prevent the light-mode flash by only showing content after mounting */}
          {mounted ? (
            <div className="max-w-7xl mx-auto relative z-10 animate-in fade-in duration-500">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
              {children}
            </div>
          ) : (
            // Empty placeholder with background color to prevent white flash
            <div className="flex-1 bg-background" />
          )}
        </main>
      </div>
    </div>
  );
}