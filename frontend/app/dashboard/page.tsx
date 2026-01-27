"use client";

import React from "react";
import { motion } from "framer-motion";
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

export default function DashboardPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-3">
            <Sparkles size={12} /> Live Overview
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Financial <span className="text-primary">Intelligence.</span>
          </h1>
        </div>

        <Link 
          href="/" 
          className="flex items-center gap-2 px-5 py-2.5 bg-background border border-input rounded-xl text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-muted hover:border-primary/50 transition-all shadow-sm active:scale-95 w-fit"
        >
          <Home size={14} className="text-primary" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-[#8B5CF6] p-10 text-white shadow-2xl shadow-primary/30 border border-white/10">
            <div className="relative z-10 flex justify-between">
              <div>
                <p className="text-purple-100 font-bold uppercase tracking-wider text-[10px] mb-2 opacity-80">Total Net Worth</p>
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
            <div className="absolute right-[-10%] bottom-[-10%] opacity-20 pointer-events-none">
               <div className="w-64 h-64 bg-white blur-[80px] rounded-full" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-foreground">Continuous Growth</h3>
              <button className="text-xs font-bold uppercase tracking-widest text-primary hover:opacity-70">View All Courses</button>
            </div>
            
            <div className="group relative bg-card p-6 rounded-[2rem] border border-input shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-full md:w-1/3 relative h-40 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center overflow-hidden shrink-0">
                   <div className="absolute inset-0 bg-black/10"></div>
                   <PlayCircle size={40} className="text-white relative z-10 drop-shadow-md group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">Module 4</span>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock size={14} />
                      <span className="text-[10px] font-bold">25 MINS LEFT</span>
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">Understanding ETFs & Mutual Funds</h4>
                  <p className="text-muted-foreground text-sm line-clamp-2">Dive deep into the world of funds. Learn the difference between active and passive management.</p>
                  
                  <div className="space-y-2">
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden border border-input">
                      <div className="h-full bg-primary rounded-full relative" style={{ width: '65%' }}>
                        <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
                      <span>Progress</span>
                      <span className="text-foreground">65%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-card rounded-[2rem] p-8 border border-input shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-xl text-foreground tracking-tight">Market Pulse</h3>
              <MoreHorizontal size={20} className="text-muted-foreground cursor-pointer" />
            </div>
            
            <div className="space-y-4">
              {[
                { sym: "AAPL", name: "Apple Inc.", price: "182.40", chg: "+1.2%", up: true },
                { sym: "TSLA", name: "Tesla, Inc.", price: "240.50", chg: "-0.8%", up: false },
                { sym: "BTC", name: "Bitcoin", price: "42,100", chg: "+5.4%", up: true },
                { sym: "ETH", name: "Ethereum", price: "2,250", chg: "+3.1%", up: true },
              ].map((stock, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-muted transition-all cursor-pointer group border border-transparent hover:border-input">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xs transition-transform group-hover:scale-110 ${stock.up ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                      {stock.sym[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm tracking-tight text-foreground group-hover:text-primary">{stock.sym}</h4>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-foreground">${stock.price}</div>
                    <div className={`text-[10px] font-bold ${stock.up ? 'text-emerald-500' : 'text-red-500'}`}>{stock.chg}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-4 rounded-xl bg-foreground text-background font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-primary hover:text-primary-foreground transition-all">
              Open Simulator
            </button>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 text-white relative overflow-hidden ring-1 ring-white/10 shadow-2xl">
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-4 text-yellow-400">
                 <Award size={24} className="fill-yellow-400" />
                 <span className="font-bold text-[10px] tracking-wider uppercase">Leaderboard Status</span>
               </div>
               <h3 className="text-3xl font-bold mb-3 tracking-tight">You ranked #5!</h3>
               <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">You are in the top 5% of students this week. Keep learning to reach #1.</p>
               <button className="bg-white text-slate-900 px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all w-full shadow-xl">View Standings</button>
             </div>
             <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-primary/40 rounded-full blur-3xl" />
             <div className="absolute bottom-[-20%] left-[-20%] w-32 h-32 bg-purple-500/30 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}