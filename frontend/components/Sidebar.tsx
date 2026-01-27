"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, TrendingUp, Trophy, PieChart, Target, LifeBuoy, LogOut } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Learn", icon: BookOpen, href: "/dashboard/learn" },
    { name: "Market Sim", icon: TrendingUp, href: "/dashboard/market" },
    { name: "Budgeting", icon: PieChart, href: "/dashboard/budget" },
    { name: "Goals", icon: Target, href: "/dashboard/goals" },
    { name: "Leaderboard", icon: Trophy, href: "/dashboard/leaderboard" },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 z-40">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
            <TrendingUp size={22} strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">FinGenius</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.href}>
              <div className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-primary text-white shadow-xl shadow-primary/25 font-semibold' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary-light'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:text-primary'} />
                <span>{item.name}</span>
                {isActive && <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
              </div>
            </Link>
          );
        })}

        <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mt-8 mb-2">Support</p>
        <Link href="/dashboard/help">
          <div className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all">
            <LifeBuoy size={20} />
            <span>Help Center</span>
          </div>
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-medium">
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}