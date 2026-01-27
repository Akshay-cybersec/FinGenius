"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, Award, Clock, ArrowRight, PlayCircle, MoreHorizontal } from "lucide-react";

export default function DashboardPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-purple-600 p-8 text-white shadow-2xl shadow-primary/20">
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-purple-100 font-medium mb-1">Total Net Worth</p>
                  <h2 className="text-5xl font-bold tracking-tight mb-4">$12,450.00</h2>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg w-fit">
                    <TrendingUp size={16} className="text-green-300" />
                    <span className="text-sm font-semibold">+8.2% this month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <svg width="300" height="200" viewBox="0 0 300 200" fill="none">
                <path d="M0 200L50 150L100 180L150 120L200 160L300 50V200H0Z" fill="white" />
              </svg>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Continue Learning</h3>
              <button className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">View All Courses</button>
            </div>
            
            <div className="group relative bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-full md:w-1/3 relative h-32 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center overflow-hidden shrink-0">
                   <div className="absolute inset-0 bg-black/10"></div>
                   <PlayCircle size={40} className="text-white relative z-10 drop-shadow-md group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wide">Module 4</span>
                    <span className="text-sm font-medium text-slate-500">25 mins left</span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Understanding ETFs & Mutual Funds</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">Dive deep into the world of funds. Learn the difference between active and passive management.</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[65%] rounded-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]"></div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">65%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Market Watch</h3>
              <MoreHorizontal size={20} className="text-slate-400 cursor-pointer" />
            </div>
            
            <div className="space-y-4">
              {[
                { sym: "AAPL", name: "Apple Inc.", price: "182.40", chg: "+1.2%", up: true },
                { sym: "TSLA", name: "Tesla, Inc.", price: "240.50", chg: "-0.8%", up: false },
                { sym: "BTC", name: "Bitcoin", price: "42,100", chg: "+5.4%", up: true },
                { sym: "ETH", name: "Ethereum", price: "2,250", chg: "+3.1%", up: true },
              ].map((stock, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm transition-colors ${stock.up ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {stock.sym[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors">{stock.sym}</h4>
                      <p className="text-xs text-slate-500">{stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-slate-900 dark:text-white">${stock.price}</div>
                    <div className={`text-xs font-semibold ${stock.up ? 'text-green-500' : 'text-red-500'}`}>{stock.chg}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Open Simulator
            </button>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white relative overflow-hidden">
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-2 text-yellow-400">
                 <Award size={20} className="fill-yellow-400" />
                 <span className="font-bold text-sm tracking-wide">LEADERBOARD</span>
               </div>
               <h3 className="text-2xl font-bold mb-2">You ranked #5!</h3>
               <p className="text-slate-400 text-sm mb-6">You are in the top 5% of students this week. Keep learning to reach #1.</p>
               <button className="bg-white text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors w-full">View Standings</button>
             </div>
             
             {/* Decorative circles */}
             <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-primary rounded-full blur-2xl opacity-50"></div>
             <div className="absolute bottom-[-10px] left-[-10px] w-20 h-20 bg-purple-500 rounded-full blur-2xl opacity-40"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}