"use client";

import React, { useState } from "react";
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
  const pathname = usePathname();

  const activeClass = `
    bg-primary/10 text-primary border-r-4 border-primary 
    shadow-[0_0_25px_rgba(99,54,250,0.15)] 
    dark:shadow-[0_0_30px_rgba(99,54,250,0.25)]
  `;

  const hoverClass = `
    text-muted-foreground hover:bg-primary/5 hover:text-primary 
    hover:shadow-[0_0_15px_rgba(99,54,250,0.1)]
    dark:hover:shadow-[0_0_20px_rgba(99,54,250,0.15)]
  `;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-background/80 backdrop-blur-md shadow-lg border border-border transition-all active:scale-95"
      >
        {isOpen ? <X size={20} className="text-primary" /> : <Menu size={20} className="text-primary" />}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-40 h-screen w-72 transition-all duration-300 ease-in-out
        bg-background border-r border-border flex flex-col overflow-hidden
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        
        <div className="p-8 shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-all duration-300 shadow-lg shadow-primary/30 group-hover:shadow-primary/50">
              <Laptop className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight flex items-center">
              <span className="text-foreground">Fin</span>
              <span className="bg-gradient-to-br from-[#6336FA] to-[#8B5CF6] bg-clip-text text-transparent">
                Genius
              </span>
            </span>
          </Link>
        </div>

        {/* CHANGE: Added 'scrollbar-hide' and 'overflow-y-auto' 
            to the nav only, preventing the main sidebar container 
            from flickering.
        */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4 scrollbar-hide">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 group relative overflow-hidden
                  ${isActive ? activeClass : hoverClass}
                `}
              >
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                )}

                <item.icon 
                  size={20} 
                  className={`
                    transition-all duration-300 
                    ${isActive ? "text-primary scale-110" : "group-hover:text-primary group-hover:scale-110"}
                  `} 
                />
                
                <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-border shrink-0 bg-background">
          <button className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all active:scale-95 group">
            <LogOut size={20} className="transition-transform group-hover:-translate-x-1" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}