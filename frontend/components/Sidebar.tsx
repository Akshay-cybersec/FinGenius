"use client";

import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  BookOpen, 
  TrendingUp, 
  PieChart, 
  Gamepad2, 
  GraduationCap, 
  Trophy, 
  Menu, 
  X,
  Laptop
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

const menuItems = [
  { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Quiz System", icon: BookOpen, href: "/dashboard/quiz" },
  { name: "Budget Simulator", icon: TrendingUp, href: "/dashboard/budget" },
  { name: "Investment Simulation", icon: PieChart, href: "/dashboard/investment" },
  { name: "Game", icon: Gamepad2, href: "/dashboard/game" },
  { name: "Learning", icon: GraduationCap, href: "/dashboard/learning" },
  { name: "LeaderBoard", icon: Trophy, href: "/dashboard/leaderboard" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  // --- Refined Blue-ish Midnight Theme Colors ---
  // Background: Saturated navy-black for that "blue" dark mode feel
  const sidebarBg = isDark ? "#0D121F" : "#F8FAFF"; 
  // Borders: Subtle transparency to let the blue tint breathe
  const borderColor = isDark ? "rgba(255, 255, 255, 0.06)" : "#e2e8f0"; 
  // Text: Cool, desaturated blue-grey for better contrast
  const textColor = isDark ? "#8F9BB3" : "#475569"; 
  const activeTextColor = isDark ? "#FFFFFF" : "#2D5BFF";
  // Active background: Stronger blue tint for the selected tab
  const activeBg = isDark ? "rgba(45, 91, 255, 0.18)" : "rgba(45, 91, 255, 0.1)";

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl backdrop-blur-md shadow-lg border transition-all active:scale-95"
        style={{ 
          backgroundColor: isDark ? "rgba(13, 18, 31, 0.8)" : "rgba(248, 250, 255, 0.8)",
          borderColor: borderColor
        }}
      >
        {isOpen ? <X size={20} className="text-[#2D5BFF]" /> : <Menu size={20} className="text-[#2D5BFF]" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed top-0 left-0 z-40 h-screen w-72 transition-all duration-300 ease-in-out
          border-r flex flex-col overflow-hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ 
          backgroundColor: sidebarBg, 
          borderColor: borderColor,
          boxShadow: isDark ? "10px 0 30px rgba(0,0,0,0.2)" : "none"
        }}
      >
        
        {/* Brand/Logo Section */}
        <div className="p-8 shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#2D5BFF] rounded-xl flex items-center justify-center transform group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-blue-500/40">
              <Laptop className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight flex items-center">
              <span style={{ color: isDark ? "#ffffff" : "#1e293b" }}>Fin</span>
              <span className="text-[#2D5BFF]">Genius</span>
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto py-4 scrollbar-hide">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all duration-200 group relative overflow-hidden"
                style={{
                  backgroundColor: isActive ? activeBg : "transparent",
                  color: isActive ? activeTextColor : textColor,
                }}
              >
                {/* Active Indicator Bar - Matches the glowing blue accent in the image */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-[#2D5BFF] rounded-r-full shadow-[2px_0_12px_rgba(45,91,255,0.8)]" />
                )}

                <item.icon 
                  size={19} 
                  className={`transition-all duration-200 ${isActive ? "scale-105" : "group-hover:scale-105"}`}
                  style={{ color: isActive ? "#2D5BFF" : "inherit" }}
                />
                
                <span className="relative z-10">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div 
          className="p-6 border-t shrink-0 mt-auto"
          style={{ 
            borderColor: borderColor,
            background: isDark ? "linear-gradient(to top, rgba(0,0,0,0.2), transparent)" : "transparent"
          }}
        >
          {/* Status Indicator: Glowing Emerald */}
          <div className="flex items-center gap-3 px-2">
             <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </div>
             <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                Live Simulation
             </span>
          </div>
        </div>
      </aside>
    </>
  );
}