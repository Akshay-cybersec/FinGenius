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
    icon: <CheckCircle2 size={32} />,
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
    icon: <Flame size={32} />,
    progress: 71, 
    unlocked: false
  },
  {
    id: '3',
    title: 'Budget Architect',
    description: 'Create a balanced budget with <5% error margin.',
    rarity: 'Epic',
    xpReward: 1000,
    icon: <PiggyBank size={32} />,
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
    icon: <TrendingUp size={32} />,
    progress: 45,
    unlocked: false
  },
  {
    id: '5',
    title: 'Quiz Whiz',
    description: 'Score 100% on 5 consecutive quizzes.',
    rarity: 'Rare',
    xpReward: 600,
    icon: <Brain size={32} />,
    progress: 60, 
    unlocked: false
  },
  {
    id: '6',
    title: 'Debt Destroyer',
    description: 'Pay off all loans in the Debt Simulator.',
    rarity: 'Epic',
    xpReward: 1200,
    icon: <Shield size={32} />,
    progress: 0,
    unlocked: false
  },
  {
    id: '7',
    title: 'Hall of Fame',
    description: 'Reach the Top 3 on the global leaderboard.',
    rarity: 'Mythic',
    xpReward: 5000,
    icon: <Crown size={32} />,
    progress: 10,
    unlocked: false
  },
  {
    id: '8',
    title: 'Early Adopter',
    description: 'Join the platform during the beta phase.',
    rarity: 'Common',
    xpReward: 50,
    icon: <Medal size={32} />,
    progress: 100,
    unlocked: true,
    unlockedDate: 'Jan 15, 2026'
  }
];

const getRarityStyles = (rarity: Rarity) => {
  switch (rarity) {
    case 'Common': 
      return { 
        bg: 'from-slate-200 to-slate-400', 
        border: 'border-slate-300', 
        shadow: 'shadow-slate-500/20', 
        text: 'text-slate-600',
        glow: 'bg-slate-400'
      };
    case 'Rare': 
      return { 
        bg: 'from-blue-300 to-indigo-500', 
        border: 'border-blue-300', 
        shadow: 'shadow-blue-500/30', 
        text: 'text-blue-600',
        glow: 'bg-blue-400'
      };
    case 'Epic': 
      return { 
        bg: 'from-purple-300 to-fuchsia-600', 
        border: 'border-purple-300', 
        shadow: 'shadow-purple-500/30', 
        text: 'text-purple-600',
        glow: 'bg-purple-400'
      };
    case 'Legendary': 
      return { 
        bg: 'from-amber-200 to-orange-500', 
        border: 'border-amber-300', 
        shadow: 'shadow-amber-500/40', 
        text: 'text-amber-600',
        glow: 'bg-amber-400'
      };
    case 'Mythic': 
      return { 
        bg: 'from-cyan-300 via-blue-500 to-purple-600', 
        border: 'border-cyan-300', 
        shadow: 'shadow-cyan-500/50', 
        text: 'text-cyan-600',
        glow: 'bg-cyan-400'
      };
  }
};

export default function AchievementsPage() {
  const total = ACHIEVEMENTS.length;
  const unlocked = ACHIEVEMENTS.filter(a => a.unlocked).length;
  const completion = Math.round((unlocked / total) * 100);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-white font-sans transition-colors duration-500">
      
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-[#0B0F19]/70 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
            <span className="font-black text-lg tracking-tight">TROPHY ROOM</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 md:p-12 pb-32">
        
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
              Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">
                Achievements
              </span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-lg text-lg">
              Collect badges by mastering skills, maintaining streaks, and topping the leaderboards.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xl w-full md:w-auto min-w-[280px]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Unlocked</span>
              <span className="text-2xl font-black font-mono">{unlocked}/{total}</span>
            </div>
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-1000" 
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ACHIEVEMENTS.map((item, idx) => {
            const styles = getRarityStyles(item.rarity);
            
            return (
              <div 
                key={item.id}
                className={`
                  group relative bg-white dark:bg-[#131722] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 
                  overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl
                  ${item.unlocked ? 'opacity-100' : 'opacity-60 grayscale-[0.5]'}
                `}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                
                <div className={`h-48 relative overflow-hidden flex items-center justify-center p-8 z-0`}>
                  
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-transparent dark:from-slate-800 dark:via-[#0B0F19] dark:to-transparent opacity-80" />
                  
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-45 translate-y-full group-hover:-translate-y-full" />

                  <div className={`
                    relative z-10 w-24 h-24 flex items-center justify-center
                    bg-gradient-to-br ${styles.bg} 
                    rounded-2xl rotate-45 border-4 border-white/20 shadow-xl ${styles.shadow}
                    transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[50deg]
                  `}>
                    <div className="-rotate-45 text-white drop-shadow-md">
                      {item.icon}
                    </div>

                    {!item.unlocked && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-xl flex items-center justify-center -rotate-0">
                        <Lock className="text-white/80 w-8 h-8 -rotate-45" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-2 flex-1 flex flex-col relative z-10 bg-white dark:bg-[#131722]">
                  
                  <div className="flex justify-center mb-4">
                    <span className={`
                      px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-opacity-10
                      ${styles.text} border-current
                    `}>
                      {item.rarity}
                    </span>
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-auto">
                    {item.unlocked ? (
                      <div className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                        <CheckCircle2 size={14} /> Unlocked
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                          <span>Progress</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${styles.glow}`} 
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="absolute top-0 right-6 -translate-y-1/2 bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Zap size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold font-mono">{item.xpReward}</span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}