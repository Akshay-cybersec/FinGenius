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
  LogOut, 
  Menu, 
  X,
  Laptop
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes"; // Added to handle theme states

const menuItems = [
  { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Quiz System", icon: BookOpen, href: "/dashboard/quiz" },
  { name: "Budget Simulator", icon: TrendingUp, href: "/dashboard/budget" },
  { name: "Investment Simulation", icon: PieChart, href: "/dashboard/investment" },
  { name: "Learning", icon: Gamepad2, href: "/dashboard/learning" },
  { name: "Redeem Store", icon: GraduationCap, href: "/dashboard/Redeem" },
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

  // Dynamic Styles based on your provided images
  const sidebarBg = isDark ? "#1A2B56" : "#F0F4FF";
  const borderColor = isDark ? "rgba(30, 64, 175, 0.3)" : "#e2e8f0";
  const textColor = isDark ? "rgba(219, 234, 254, 0.7)" : "#475569";
  const activeTextColor = isDark ? "#ffffff" : "#2D5BFF";
  const activeBg = isDark ? "rgba(45, 91, 255, 0.2)" : "rgba(45, 91, 255, 0.1)";

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl backdrop-blur-md shadow-lg border transition-all active:scale-95"
        style={{ 
          backgroundColor: isDark ? "rgba(26, 43, 86, 0.8)" : "rgba(240, 244, 255, 0.8)",
          borderColor: borderColor
        }}
      >
        {isOpen ? <X size={20} className="text-[#2D5BFF]" /> : <Menu size={20} className="text-[#2D5BFF]" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed top-0 left-0 z-40 h-screen w-72 transition-all duration-300 ease-in-out
          border-r flex flex-col overflow-hidden shadow-2xl
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ 
          backgroundColor: sidebarBg, 
          borderColor: borderColor 
        }}
      >
        
        {/* Brand/Logo Section */}
        <div className="p-8 shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#2D5BFF] rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-all duration-300 shadow-lg shadow-blue-500/20">
              <Laptop className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter flex items-center">
              <span style={{ color: isDark ? "#ffffff" : "#1e293b" }}>Fin</span>
              <span className="text-[#2D5BFF]">Genius</span>
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4 scrollbar-hide">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 group relative overflow-hidden"
                style={{
                  backgroundColor: isActive ? activeBg : "transparent",
                  color: isActive ? activeTextColor : textColor,
                }}
              >
                {/* Hover Background Layer */}
                {!isActive && (
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(45,91,255,0.05)" }}
                  />
                )}

                {/* Left Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#2D5BFF] rounded-r-full" />
                )}

                <item.icon 
                  size={20} 
                  className={`transition-all duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                  style={{ color: isActive ? "#2D5BFF" : textColor }}
                />
                
                <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer/Logout Section */}
        <div 
          className="p-6 border-t shrink-0"
          style={{ 
            backgroundColor: isDark ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.2)",
            borderColor: borderColor 
          }}
        >
          
        </div>
      </aside>
    </>
  );
}