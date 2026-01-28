"use client";

import React from 'react';
import { 
  Shield, 
  Zap, 
  Target,
  Flame,
  TrendingUp,
  Brain,
  PiggyBank,
  CheckCircle2,
  Lock,
  Medal,
  Crown
} from 'lucide-react';

type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

interface Achievement {
  id: string;
  title: string;
  description: string;
  rarity: Rarity;
  xpReward: number;
  icon: React.ReactNode;
  progress: number;
  unlocked: boolean;
  unlockedDate?: string;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first learning module.',
    rarity: 'Common',
    xpReward: 100,
    icon: <CheckCircle2 size={36} />,
    progress: 100,
    unlocked: true,
    unlockedDate: 'Jan 20, 2026'
  },
  {
    id: '2',
    title: 'Streak Master',
    description: 'Maintain a 7-day learning streak.',
    rarity: 'Rare',
    xpReward: 500,
    icon: <Flame size={36} />,
    progress: 71, 
    unlocked: false
  },
  {
    id: '3',
    title: 'Budget Architect',
    description: 'Create a balanced budget with <5% error margin.',
    rarity: 'Epic',
    xpReward: 1000,
    icon: <PiggyBank size={36} />,
    progress: 100,
    unlocked: true,
    unlockedDate: 'Jan 22, 2026'
  },
  {
    id: '4',
    title: 'Market Mogul',
    description: 'Make a 20% profit in the Stock Simulator.',
    rarity: 'Legendary',
    xpReward: 2500,
    icon: <TrendingUp size={36} />,
    progress: 45,
    unlocked: false
  },
  {
    id: '5',
    title: 'Quiz Whiz',
    description: 'Score 100% on 5 consecutive quizzes.',
    rarity: 'Rare',
    xpReward: 600,
    icon: <Brain size={36} />,
    progress: 60, 
    unlocked: false
  },
  {
    id: '6',
    title: 'Debt Destroyer',
    description: 'Pay off all loans in the Debt Simulator.',
    rarity: 'Epic',
    xpReward: 1200,
    icon: <Shield size={36} />,
    progress: 0,
    unlocked: false
  },
  {
    id: '7',
    title: 'Hall of Fame',
    description: 'Reach the Top 3 on the global leaderboard.',
    rarity: 'Mythic',
    xpReward: 5000,
    icon: <Crown size={36} />,
    progress: 10,
    unlocked: false
  },
  {
    id: '8',
    title: 'Early Adopter',
    description: 'Join the platform during the beta phase.',
    rarity: 'Common',
    xpReward: 50,
    icon: <Medal size={36} />,
    progress: 100,
    unlocked: true,
    unlockedDate: 'Jan 15, 2026'
  }
];

const getRarityStyles = (rarity: Rarity) => {
  switch (rarity) {
    case 'Common': 
      return { 
        borderGradient: 'from-slate-400 to-slate-600',
        bg: 'from-slate-700 via-slate-600 to-slate-800',
        shadow: 'shadow-slate-500/20', 
        text: 'text-slate-400',
        glow: 'bg-slate-500',
        iconColor: 'text-slate-200'
      };
    case 'Rare': 
      return { 
        borderGradient: 'from-cyan-400 to-blue-600',
        bg: 'from-blue-600 via-cyan-700 to-blue-900',
        shadow: 'shadow-cyan-500/40', 
        text: 'text-cyan-400',
        glow: 'bg-cyan-500',
        iconColor: 'text-cyan-100'
      };
    case 'Epic': 
      return { 
        borderGradient: 'from-fuchsia-400 to-purple-700',
        bg: 'from-purple-700 via-fuchsia-800 to-purple-950',
        shadow: 'shadow-purple-500/40', 
        text: 'text-purple-400',
        glow: 'bg-purple-500',
        iconColor: 'text-purple-100'
      };
    case 'Legendary': 
      return { 
        borderGradient: 'from-yellow-400 via-orange-500 to-red-600',
        bg: 'from-orange-600 via-red-700 to-rose-950',
        shadow: 'shadow-orange-500/50', 
        text: 'text-orange-400',
        glow: 'bg-orange-500',
        iconColor: 'text-yellow-100'
      };
    case 'Mythic': 
      return { 
        borderGradient: 'from-pink-400 via-purple-500 to-indigo-600',
        bg: 'from-indigo-600 via-purple-700 to-pink-900',
        shadow: 'shadow-pink-500/50', 
        text: 'text-pink-400',
        glow: 'bg-pink-500',
        iconColor: 'text-pink-50'
      };
  }
};

export default function AchievementsPage() {
  const total = ACHIEVEMENTS.length;
  const unlocked = ACHIEVEMENTS.filter(a => a.unlocked).length;
  const completion = Math.round((unlocked / total) * 100);

  return (
    <div className="w-full min-h-full bg-slate-950 text-slate-50 font-sans selection:bg-cyan-500/30 relative">
      
      {/* FIXED BACKGROUND LAYER - Solves double scrollbar issue */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-900/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>
      
      <div className="relative z-10">
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/60">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <span className="font-black text-xl tracking-tight text-white flex items-center gap-2">
                    <Target className="text-cyan-400 animate-pulse" /> TROPHY ROOM
                </span>
            </div>
        </nav>

        <div className="max-w-7xl mx-auto p-6 md:p-12 pb-32">
            
            <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div>
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 text-white">
                Your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x">
                    Achievements
                </span>
                </h1>
                <p className="text-slate-400 max-w-lg text-lg leading-relaxed">
                Prove your financial mastery. Collect badges, earn XP, and showcase your progress to the world.
                </p>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-8 rounded-[2rem] shadow-2xl w-full md:w-auto min-w-[340px] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[60px] rounded-full group-hover:bg-cyan-500/20 transition-colors" />
                
                <div className="flex justify-between items-center mb-5 relative z-10">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Unlocked</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black font-mono text-white">{unlocked}</span>
                    <span className="text-xl font-bold text-slate-500">/{total}</span>
                </div>
                </div>
                
                <div className="relative z-10">
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                    <span>Progress</span>
                    <span>{completion}%</span>
                </div>
                <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 relative box-border p-[2px]">
                    <div 
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-1000 relative overflow-hidden" 
                    style={{ width: `${completion}%` }}
                    >
                        <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite] skew-x-12" />
                    </div>
                </div>
                </div>
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            {ACHIEVEMENTS.map((item, idx) => {
                const styles = getRarityStyles(item.rarity);
                
                return (
                <div 
                    key={item.id}
                    className={`
                    group relative bg-slate-900/40 backdrop-blur-sm rounded-[2.5rem] border border-slate-800/80
                    overflow-visible flex flex-col transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-black/50 hover:border-slate-700/80
                    ${item.unlocked ? 'opacity-100' : 'opacity-75'}
                    `}
                    style={{ animationDelay: `${idx * 100}ms` }}
                >
                    
                    <div className="h-48 relative flex items-center justify-center z-20 -mt-8">
                    
                    <div className={`absolute inset-0 bg-gradient-to-tr ${styles.bg} blur-[60px] opacity-0 group-hover:opacity-40 transition-opacity duration-700 rounded-full transform scale-75 group-hover:scale-110`} />

                    <div className={`
                        relative w-36 h-36 z-10
                        rotate-12 group-hover:rotate-[20deg] transition-all duration-500 ease-out
                        group-hover:scale-110
                    `}>
                        <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${styles.borderGradient} shadow-xl ${styles.shadow} p-[4px]`}>
                        <div className={`
                            w-full h-full rounded-[calc(2rem-4px)] 
                            bg-gradient-to-br ${styles.bg}
                            shadow-[inset_0_5px_20px_rgba(0,0,0,0.6),_inset_0_-2px_5px_rgba(255,255,255,0.1)]
                            flex items-center justify-center
                            overflow-hidden relative
                        `}>
                            
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-[shimmer_3s_infinite_linear] -skew-x-12" style={{ backgroundSize: '200% 100%' }} />

                            <div className={`
                            -rotate-12 transform transition-transform duration-500 group-hover:scale-105 relative z-20 
                            ${styles.iconColor} drop-shadow-[0_8px_8px_rgba(0,0,0,0.5)]
                            ${item.unlocked ? 'filter brightness-110' : 'filter grayscale brightness-75'}
                            `}>
                            {item.icon}
                            </div>

                            {!item.unlocked && (
                            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[3px] flex items-center justify-center z-30 -rotate-12">
                                <div className="bg-slate-900/80 p-3 rounded-2xl border border-white/10 shadow-lg">
                                <Lock className="text-white/60 w-8 h-8" />
                                </div>
                            </div>
                            )}
                        </div>
                        </div>
                    </div>
                    </div>

                    <div className="p-8 pt-4 flex-1 flex flex-col relative z-10">
                    
                    <div className="flex justify-center mb-6 relative">
                        <span className={`
                        px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-slate-950/50 backdrop-blur-md
                        ${styles.text} border-current shadow-lg relative z-10
                        `}>
                        {item.rarity}
                        </span>
                        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] ${styles.glow} blur-[4px] opacity-50 group-hover:opacity-100 transition-opacity`} />
                    </div>

                    <div className="text-center mb-8">
                        <h3 className={`text-xl font-black text-white mb-3 leading-tight transition-all duration-300 group-hover:${styles.text} ${!item.unlocked && 'opacity-60'}`}>
                        {item.title}
                        </h3>
                        <p className={`text-sm text-slate-400 leading-relaxed font-medium ${!item.unlocked && 'opacity-50'}`}>
                        {item.description}
                        </p>
                    </div>

                    <div className="mt-auto">
                        {item.unlocked ? (
                        <div className="w-full py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center gap-1 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-shadow">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                            <CheckCircle2 size={16} /> Unlocked
                            </div>
                            <span className="text-[10px] font-medium text-emerald-500/70">{item.unlockedDate}</span>
                        </div>
                        ) : (
                        <div className="space-y-3 opacity-70 group-hover:opacity-100 transition-opacity">
                            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                            <span>Progress</span>
                            <span className={styles.text}>{item.progress}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 p-[1px]">
                            <div 
                                className={`h-full rounded-full ${styles.glow} shadow-[0_0_15px_currentColor] relative overflow-hidden`} 
                                style={{ width: `${item.progress}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                            </div>
                            </div>
                        </div>
                        )}
                    </div>

                    <div className="absolute top-6 right-6 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg z-30 group-hover:-translate-y-3/4 transition-all">
                        <Zap size={12} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold font-mono text-white">{item.xpReward} XP</span>
                    </div>

                    </div>
                </div>
                );
            })}
            </div>

        </div>
      </div>
    </div>
  );
}