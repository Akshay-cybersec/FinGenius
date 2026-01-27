"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
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
      
      <Sidebar />

      <div className="flex-1 flex flex-col lg:pl-72 h-full overflow-hidden">
        <Navbar isDark={isDark} toggleTheme={toggleTheme} />
        
        <main className="flex-1 p-6 md:p-10 overflow-y-auto overflow-x-hidden scroll-smooth relative">
          
          {mounted ? (
            <div className="w-full relative z-10 animate-in fade-in duration-500">
              <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
              {children}
            </div>
          ) : (
            <div className="flex-1 bg-background" />
          )}
        </main>
      </div>
    </div>
  );
}