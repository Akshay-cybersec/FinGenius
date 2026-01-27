"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Award, 
  PlayCircle, 
  MoreHorizontal, 
  Sparkles,
  Clock,
  Home 
} from "lucide-react";
import Link from "next/link";
import { useTheme } from 'next-themes';

export default function DashboardPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto space-y-8 pb-12 transition-colors duration-500"
      style={{ color: isDark ? '#ffffff' : '#0f172a' }}
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest mb-3 transition-colors duration-500"
            style={{ 
              backgroundColor: isDark ? 'rgba(45, 91, 255, 0.1)' : 'rgba(45, 91, 255, 0.05)',
              borderColor: isDark ? 'rgba(45, 91, 255, 0.3)' : 'rgba(45, 91, 255, 0.2)',
              color: '#2D5BFF'
            }}
          >
            <Sparkles size={12} /> Live Overview
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight transition-colors duration-500" style={{ color: isDark ? '#ffffff' : '#1A2B56' }}>
            Financial <span className="text-[#2D5BFF]">Intelligence.</span>
          </h1>
        </div>

        <Link 
          href="/" 
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all shadow-sm active:scale-95 w-fit"
          style={{ 
            backgroundColor: isDark ? 'rgba(30, 58, 138, 0.3)' : '#ffffff',
            borderColor: isDark ? 'rgba(30, 64, 175, 0.5)' : '#e2e8f0',
            color: isDark ? '#ffffff' : '#1e293b'
          }}
        >
          <Home size={14} className="text-[#2D5BFF]" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Net Worth Card */}
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#2D5BFF] to-[#6336FA] p-10 text-white shadow-2xl border border-white/10">
            <div className="relative z-10 flex justify-between">
              <div>
                <p className="text-blue-100 font-bold uppercase tracking-wider text-[10px] mb-2 opacity-80">Total Net Worth</p>
                <h2 className="text-6xl font-extrabold tracking-tighter mb-6">$12,450.00</h2>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl w-fit border border-white/10">
                  <TrendingUp size={18} className="text-emerald-300" />
                  <span className="text-sm font-bold tracking-wide">+8.2% THIS MONTH</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20">
                <DollarSign size={32} />
              </div>
            </div>
          </div>

          {/* Learning Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold transition-colors duration-500" style={{ color: isDark ? '#ffffff' : '#1A2B56' }}>Continuous Growth</h3>
              <button className="text-xs font-bold uppercase tracking-widest text-[#2D5BFF] hover:opacity-70">View All Courses</button>
            </div>
            
            <div 
              className="group relative p-6 rounded-[2rem] border shadow-sm hover:shadow-xl transition-all duration-300"
              style={{
                backgroundColor: isDark ? 'rgba(30, 58, 138, 0.3)' : '#ffffff',
                borderColor: isDark ? 'rgba(30, 64, 175, 0.3)' : '#e2e8f0'
              }}
            >
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-full md:w-1/3 relative h-40 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                   <PlayCircle size={40} className="text-white relative z-10 drop-shadow-md group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-[#2D5BFF]/10 text-[#2D5BFF] text-[10px] font-bold uppercase tracking-widest border border-[#2D5BFF]/20">Module 4</span>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock size={14} />
                      <span className="text-[10px] font-bold">25 MINS LEFT</span>
                    </div>
                  </div>
                  <h4 className={`text-2xl font-bold transition-colors tracking-tight ${isDark ? 'text-white group-hover:text-[#2D5BFF]' : 'text-[#1A2B56]'}`}>Understanding ETFs & Mutual Funds</h4>
                  <p className={`text-sm line-clamp-2 ${isDark ? 'text-blue-100/60' : 'text-slate-500'}`}>Master the difference between active and passive management.</p>
                  
                  <div className="space-y-2">
                    <div className="h-2.5 bg-slate-200/20 rounded-full overflow-hidden border border-slate-300/10">
                      <div className="h-full bg-[#2D5BFF] rounded-full relative" style={{ width: '65%' }}>
                        <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          <div 
            className="rounded-[2rem] p-8 border shadow-sm transition-colors duration-500"
            style={{
              backgroundColor: isDark ? 'rgba(30, 58, 138, 0.3)' : '#ffffff',
              borderColor: isDark ? 'rgba(30, 64, 175, 0.3)' : '#e2e8f0'
            }}
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-xl tracking-tight transition-colors duration-500" style={{ color: isDark ? '#ffffff' : '#1A2B56' }}>Market Pulse</h3>
              <MoreHorizontal size={20} className="text-slate-400 cursor-pointer" />
            </div>
            
            <div className="space-y-4">
              {[
                { sym: "AAPL", name: "Apple Inc.", price: "182.40", chg: "+1.2%", up: true },
                { sym: "TSLA", name: "Tesla, Inc.", price: "240.50", chg: "-0.8%", up: false },
                { sym: "BTC", name: "Bitcoin", price: "42,100", chg: "+5.4%", up: true },
                { sym: "ETH", name: "Ethereum", price: "2,250", chg: "+3.1%", up: true },
              ].map((stock, i) => (
                <div key={i} className={`flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer group border border-transparent ${isDark ? 'hover:bg-blue-800/40 hover:border-blue-700/50' : 'hover:bg-slate-50 hover:border-slate-100'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xs transition-transform group-hover:scale-110 ${stock.up ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {stock.sym[0]}
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm tracking-tight transition-colors ${isDark ? 'text-white' : 'text-[#1A2B56]'}`}>{stock.sym}</h4>
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-[#1A2B56]'}`}>${stock.price}</div>
                    <div className={`text-[10px] font-bold ${stock.up ? 'text-emerald-500' : 'text-red-500'}`}>{stock.chg}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] bg-[#2D5BFF] text-white hover:bg-[#1e45cc] transition-all shadow-lg shadow-blue-500/20">
              Open Simulator
            </button>
          </div>

          {/* Achievement Card */}
          <div className="bg-gradient-to-br from-[#1A2B56] to-[#0F1A36] rounded-[2rem] p-8 text-white relative overflow-hidden ring-1 ring-white/10 shadow-2xl">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 text-yellow-400">
                  <Award size={24} className="fill-yellow-400" />
                  <span className="font-bold text-[10px] tracking-wider uppercase">Leaderboard Status</span>
                </div>
                <h3 className="text-3xl font-bold mb-3 tracking-tight">You ranked #5!</h3>
                <p className="text-blue-100/60 text-sm font-medium mb-8 leading-relaxed">You are in the top 5% of students this week. Keep learning to reach #1.</p>
                <button className="bg-white text-[#1A2B56] px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#2D5BFF] hover:text-white transition-all w-full shadow-xl">View Standings</button>
              </div>
              <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-[#2D5BFF]/40 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}