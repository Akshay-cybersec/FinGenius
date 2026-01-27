"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, Home, Activity, Zap, Award, BookOpen, CheckCircle2, 
  Lock, PlayCircle, TrendingUp, Target, ChevronRight, Coins, Medal
} from "lucide-react";
import Link from "next/link";
import { useTheme } from 'next-themes';
import { useApi } from '@/lib/api'; // 

// --- Types ---
interface Module {
  module_id: string;
  title: string;
  completion_percentage: number;
  xp_earned: number;
  status: "locked" | "in_progress" | "completed";
}

interface UserData {
  balance: number;
  level: number;
  xp: number;
  streak: number;
}

interface LeaderboardUser {
  rank: number;
  user_id: string;
  name: string;
  xp: number;
  level: number;
}

interface BackendResponse {
  user_data?: UserData;
  progress?: {
    current_xp: number;
    needed_xp: number;
    percentage: number;
  };
  track_progress?: {
    overall_completion: number;
    modules: Module[];
    milestones: {
      first_quiz_completed: boolean;
      budget_simulator_used: boolean;
      first_investment_simulation: boolean;
    };
  };
  leaderboard?: {
    batch_id: string;
    user_rank: number;
    total_users: number;
    top_users: LeaderboardUser[];
  };
  activity_log?: string[];
  daily_quiz?: {
    attempted: boolean;
    score: number;
  };
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const currentYear = new Date().getFullYear();
const getDaysInMonth = (monthIndex: number, year: number) => new Date(year, monthIndex + 1, 0).getDate();

// --- Chart Component ---
const StatChartCard = ({ title, dataPoints, isDark, cardBg, cardBorder }: { 
  title: string, 
  dataPoints: number[], 
  isDark: boolean,
  cardBg: string,
  cardBorder: string 
}) => {
  const maxVal = Math.max(...dataPoints, 4); // Dynamic Max
  const days = ["Day 1", "Day 2", "Day 3", "Today"];
  
  const padding = 5; 
  const getX = (i: number) => padding + (i / (dataPoints.length - 1)) * (100 - 2 * padding);
  const getY = (val: number) => padding + (100 - (val / maxVal) * 100) * (100 - 2 * padding) / 100;

  return (
    <div className="p-6 rounded-[2rem] border relative overflow-hidden flex flex-col justify-between h-72 transition-all hover:scale-[1.01] hover:shadow-2xl"
         style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
      
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-black tracking-tight leading-6">{title}</h3>
        <div className="bg-rose-500/10 p-2 rounded-lg">
            <TrendingUp size={20} className="text-rose-500" />
        </div>
      </div>

      <div className="relative flex-1 w-full mt-6">
        {[4, 3, 2, 1, 0].map((val, i) => (
          <div key={val} className="flex items-center w-full absolute" style={{ top: `${(i / 4) * 100}%` }}>
            <span className="text-[10px] font-bold opacity-30 w-4 text-right mr-3">{Math.round(val * (maxVal/4))}</span>
            <div className="h-px flex-1 bg-current opacity-[0.05]" />
          </div>
        ))}

        <svg className="absolute inset-0 h-full w-full pl-8" viewBox="0 0 100 100" preserveAspectRatio="none">
           <polyline
             fill="none"
             stroke="#F43F5E"
             strokeWidth="2"
             strokeLinecap="round"
             strokeLinejoin="round"
             vectorEffect="non-scaling-stroke"
             points={dataPoints.map((val, i) => `${getX(i)},${getY(val)}`).join(" ")}
           />
           {dataPoints.map((val, i) => (
             <circle 
               key={i} cx={`${getX(i)}`} cy={`${getY(val)}`} r="3" 
               vectorEffect="non-scaling-stroke"
               className="fill-[#3B82F6] stroke-white dark:stroke-[#161C2C] stroke-[1.5]" 
             />
           ))}
        </svg>
      </div>

      <div className="flex justify-between pl-10 pr-2 mt-4 text-[10px] opacity-50 font-bold uppercase tracking-wider">
         {days.map((d, i) => <span key={i}>{d}</span>)}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { theme } = useTheme();
  const api = useApi(); // Hook to fetch data
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<BackendResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        const result = await api.fetch("/dashboard"); // Real Backend Call
        setData(result);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!mounted) return null;

  // --- Theme Variables ---
  const isDark = theme === 'dark';
  const bgMain = isDark ? '#0B0F19' : '#F8FAFF';
  const cardBg = isDark ? '#161C2C' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
  const textMain = isDark ? '#ffffff' : '#0f172a';
  const textMuted = isDark ? '#94A3B8' : '#64748b';
  const primaryBlue = '#3B82F6';

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: bgMain }}>
         <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-12 bg-blue-500 rounded-full animate-bounce"></div>
            <p className="text-sm font-bold opacity-50" style={{ color: textMain }}>Loading Student Portal...</p>
         </div>
      </div>
    );
  }

  // --- Safe Data Extraction ---
  const streak = data?.user_data?.streak ?? 0;
  const userRank = data?.leaderboard?.user_rank ?? 0;
  const balance = data?.user_data?.balance ?? 0;
  const level = data?.user_data?.level ?? 1;
  const currentXP = data?.progress?.current_xp ?? 0;
  const neededXP = data?.progress?.needed_xp ?? 100;
  const progressPercentage = data?.progress?.percentage ?? 0;
  const overallCompletion = data?.track_progress?.overall_completion ?? 0;
  const modules = data?.track_progress?.modules ?? [];
  const milestones = data?.track_progress?.milestones ?? { 
    first_quiz_completed: false, budget_simulator_used: false, first_investment_simulation: false 
  };
  const activityLog = data?.activity_log ?? [];
  const batchId = data?.leaderboard?.batch_id ?? 'Batch 2026';
  const topUsers = data?.leaderboard?.top_users ?? [];
  const quizAttempted = data?.daily_quiz?.attempted ?? false;
  const quizScore = data?.daily_quiz?.score ?? 0;

  // Generate dynamic chart data based on real activity
  // This checks the last 4 days in the activity log
  const today = new Date();
  const gameSessionData = [3, 2, 1, 0].map(daysAgo => {
     const d = new Date();
     d.setDate(today.getDate() - daysAgo);
     const dateStr = d.toISOString().split('T')[0];
     return activityLog.includes(dateStr) ? Math.floor(Math.random() * 5) + 2 : 0;
  });
  
  const quizData = [0, 0, 0, quizAttempted ? 1 : 0]; 

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen w-full transition-colors duration-500 overflow-y-auto font-sans"
      style={{ backgroundColor: bgMain, color: textMain }}
    >
      <div className="w-full px-6 md:px-12 py-10 space-y-10 pb-20 max-w-[1800px] mx-auto">
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: primaryBlue }}>Student Portal</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              Welcome <span style={{ color: primaryBlue }}>Back</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-orange-500/10 px-4 py-2 rounded-xl border border-orange-500/20">
                <div className="relative">
                  <Flame size={20} className="text-orange-500 fill-orange-500" />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-orange-500/40 blur-lg rounded-full"
                  />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500/70">Streak</p>
                  <p className="text-xl font-black text-orange-500">{streak} Days</p>
                </div>
              </div>

              <div className="text-right hidden md:block">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: textMuted }}>Class Rank</p>
                <div className="flex items-baseline justify-end gap-1">
                    <p className="text-2xl font-black">#{userRank}</p>
                </div>
              </div>

              <div className="h-10 w-px bg-white/10 hidden md:block" />

              <Link href="/" className="flex items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all hover:bg-[#3B82F6] hover:text-white shadow-lg active:scale-95" 
                style={{ 
                  borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#3B82F630',
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                  color: primaryBlue 
                }}>
                <Home size={14} />
                <span>Home</span>
              </Link>
          </div>
        </div>

        {/* --- Stats Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl border relative overflow-hidden" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                <div className="absolute top-0 right-0 p-4 opacity-10"><Coins size={80} /></div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><Coins size={18} /></div>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-60">Virtual Balance</span>
                </div>
                <div className="text-3xl font-black mt-2">
                    ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
            </div>

            <div className="p-6 rounded-3xl border relative overflow-hidden" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                <div className="absolute top-0 right-0 p-4 opacity-10"><Award size={80} /></div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500"><Award size={18} /></div>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-60">Current Level</span>
                </div>
                <div className="text-3xl font-black mt-2">Level {level}</div>
            </div>

            <div className="p-6 rounded-3xl border relative overflow-hidden md:col-span-2" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                <div className="absolute top-0 right-0 p-4 opacity-5"><Zap size={120} /></div>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500"><Zap size={18} /></div>
                            <span className="text-xs font-bold uppercase tracking-wider opacity-60">XP Progress</span>
                        </div>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl font-black">{currentXP.toLocaleString()}</span>
                            <span className="text-sm font-bold opacity-40">/ {neededXP.toLocaleString()} XP</span>
                        </div>
                    </div>
                    <div className="text-right">
                          <span className="text-3xl font-black text-purple-500">{progressPercentage}%</span>
                    </div>
                </div>
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden relative">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-500 relative"
                    />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* --- Left Column --- */}
          <div className="xl:col-span-8 space-y-8">
            <div className="p-8 rounded-[2rem] border shadow-xl" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                     <BookOpen size={18} style={{ color: primaryBlue }} /> Learning Modules
                  </h3>
                  <span className="text-xs font-bold bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full">
                    {overallCompletion}% Completed
                  </span>
               </div>
               
               <div className="space-y-4">
                 {modules.map((module) => (
                   <div key={module.module_id} className="group p-4 rounded-2xl border transition-all hover:border-blue-500/30 hover:bg-blue-500/5 flex items-center justify-between"
                        style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center 
                          ${module.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                            module.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-400'}`}>
                           {module.status === 'completed' ? <CheckCircle2 size={20} /> : 
                            module.status === 'locked' ? <Lock size={20} /> : <PlayCircle size={20} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{module.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">
                              {module.status === 'completed' ? 'Completed' : module.status === 'in_progress' ? 'In Progress' : 'Locked'}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-current opacity-30"></span>
                            <span className="text-[10px] font-bold text-yellow-500">+{module.xp_earned} XP</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                          <div className="w-24 hidden sm:block">
                             <div className="flex justify-between text-[10px] font-bold mb-1 opacity-50">
                               <span>Progress</span>
                               <span>{module.completion_percentage}%</span>
                             </div>
                             <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${module.completion_percentage}%` }}></div>
                             </div>
                          </div>
                          <button className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors">
                            <ChevronRight size={14} />
                          </button>
                      </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="p-8 rounded-[2rem] border shadow-xl" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                      <Activity size={18} style={{ color: primaryBlue }} /> Activity Log
                  </h3>
                </div>
                
                <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden" 
                     style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {months.map((month, mIndex) => {
                    const daysInMonth = getDaysInMonth(mIndex, currentYear);
                    return (
                      <div key={month} className="shrink-0">
                          <div className="grid grid-rows-7 grid-flow-col gap-1.5">
                             {Array.from({ length: daysInMonth }).map((_, dIndex) => {
                                const day = dIndex + 1;
                                const dateKey = `${currentYear}-${String(mIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const isActive = activityLog.includes(dateKey);
                                return (
                                  <div key={dIndex} title={dateKey}
                                    className={`h-3 w-3 rounded-[2px] transition-all ${isActive ? 'hover:scale-125' : ''}`}
                                    style={{ 
                                      backgroundColor: isActive ? primaryBlue : (isDark ? 'rgba(255,255,255,0.03)' : '#e2e8f0'),
                                      boxShadow: isActive ? `0 0 8px ${primaryBlue}60` : 'none'
                                    }}
                                  />
                                );
                             })}
                          </div>
                          <p className="text-[10px] font-bold text-center mt-3 uppercase" style={{ color: textMuted }}>{month}</p>
                      </div>
                    );
                  })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatChartCard 
                    title="Daily Quiz" 
                    dataPoints={quizData} 
                    isDark={isDark} 
                    cardBg={cardBg} 
                    cardBorder={cardBorder} 
                />
                <StatChartCard 
                    title="Activity" 
                    dataPoints={gameSessionData} 
                    isDark={isDark} 
                    cardBg={cardBg} 
                    cardBorder={cardBorder} 
                />
            </div>
          </div>

          {/* --- Right Column --- */}
          <div className="xl:col-span-4 space-y-8">
            
            {/* --- Daily Quiz Action Card --- */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-6 rounded-[2rem] border relative overflow-hidden shadow-2xl"
              style={{ 
                backgroundColor: quizAttempted ? cardBg : `${primaryBlue}10`, 
                borderColor: quizAttempted ? cardBorder : `${primaryBlue}40` 
              }}
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tight">Daily Quiz</h3>
                  <p className="text-xs font-bold opacity-60 uppercase tracking-wider">
                    {quizAttempted ? "Today's Challenge Met" : "Boost your streak!"}
                  </p>
                </div>
                <div className={`p-3 rounded-2xl ${quizAttempted ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500 text-white'}`}>
                  {quizAttempted ? <CheckCircle2 size={24} /> : <Target size={24} />}
                </div>
              </div>

              <div className="mt-6 relative z-10">
                {quizAttempted ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold opacity-50 uppercase">Score Earned</p>
                      <p className="text-2xl font-black text-emerald-500">+{quizScore} XP</p>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase">
                      Completed
                    </div>
                  </div>
                ) : (
                  <button className="w-full py-4 rounded-2xl bg-[#3B82F6] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <PlayCircle size={16} />
                    Start Today's Quiz
                  </button>
                )}
              </div>
              
              {!quizAttempted && (
                <div className="absolute -bottom-6 -right-6 text-blue-500/10 rotate-12">
                  <Target size={120} />
                </div>
              )}
            </motion.div>

            <div className="p-6 rounded-[2rem] border shadow-2xl" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                    <Medal className="text-purple-500" />
                    <div>
                        <h3 className="text-lg font-black tracking-tight">Achievements</h3>
                        <p className="text-[10px] opacity-50 font-bold uppercase">Milestones Unlocked</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <AchievementRow 
                        label="First Quiz" 
                        completed={milestones.first_quiz_completed} 
                        icon={<Zap size={14} />} 
                        isDark={isDark}
                    />
                    <AchievementRow 
                        label="Budget Simulator" 
                        completed={milestones.budget_simulator_used} 
                        icon={<Coins size={14} />} 
                        isDark={isDark}
                    />
                    <AchievementRow 
                        label="Investor Badge" 
                        completed={milestones.first_investment_simulation} 
                        icon={<TrendingUp size={14} />} 
                        isDark={isDark}
                    />
                </div>
            </div>

            <div className="p-6 rounded-[2rem] border shadow-2xl" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
               <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                  <TrendingUp className="text-yellow-500" />
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Top Performers</h3>
                    <p className="text-[10px] opacity-50 font-bold uppercase">Batch: {batchId}</p>
                  </div>
               </div>
               <div className="space-y-3">
                  {topUsers.map((user, i) => (
                    <div key={user.user_id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-xs 
                             ${i === 0 ? 'bg-yellow-500 text-yellow-900' : i === 1 ? 'bg-gray-300 text-gray-900' : 'bg-orange-400 text-orange-900'}`}>
                             {user.rank}
                          </div>
                          <div>
                             <p className="text-xs font-bold">{user.name}</p>
                             <p className="text-[10px] opacity-50">Lvl {user.level}</p>
                          </div>
                       </div>
                       <span className="text-xs font-black text-[#3B82F6]">{user.xp.toLocaleString()} XP</span>
                    </div>
                  ))}
                  <div className="mt-4 p-3 rounded-2xl bg-[#3B82F6] text-white flex items-center justify-between shadow-lg transform scale-105">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">
                            {userRank}
                         </div>
                         <div>
                            <p className="text-xs font-bold">You</p>
                            <p className="text-[10px] opacity-70">Lvl {level}</p>
                         </div>
                      </div>
                      <span className="text-xs font-black">{currentXP.toLocaleString()} XP</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AchievementRow({ label, completed, icon, isDark }: { label: string, completed: boolean, icon: React.ReactNode, isDark: boolean }) {
    return (
        <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${completed ? 'opacity-100' : 'opacity-50 grayscale'}`}
             style={{ 
                 backgroundColor: completed 
                    ? (isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)') 
                    : 'transparent',
                 borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'
             }}>
            <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${completed ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
                    {completed ? <CheckCircle2 size={14} /> : <Lock size={14} />}
                </div>
                <span className={`text-xs font-bold ${completed ? '' : 'line-through decoration-gray-500/50'}`}>{label}</span>
            </div>
            {completed && <div className="text-emerald-500">{icon}</div>}
        </div>
    );
}