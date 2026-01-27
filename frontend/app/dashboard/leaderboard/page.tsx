"use client";

import React from 'react';

// --- Types & Interfaces ---
type Tier = 'Diamond' | 'Gold' | 'Silver' | 'Bronze';
type TaskStatus = 'Completed' | 'Not Completed';

interface User {
  id: number;
  username: string;
  rank: number;
  status: TaskStatus;
}

// --- Mock Data ---
const mockUsers: User[] = [
  { id: 1, rank: 1, username: "Viper_Elite", status: 'Completed' },
  { id: 2, rank: 2, username: "Gold_Rush", status: 'Completed' },
  { id: 3, rank: 3, username: "Speed_Demon", status: 'Not Completed' },
  { id: 4, rank: 4, username: "Iron_Will", status: 'Completed' },
  { id: 5, rank: 5, username: "Steel_Shadow", status: 'Not Completed' },
  { id: 6, rank: 6, username: "Bronze_Beast", status: 'Completed' },
];

// --- Helper Functions ---

const getTier = (rank: number): Tier => {
  if (rank === 1) return 'Diamond';
  if (rank <= 3) return 'Gold';
  if (rank <= 5) return 'Silver';
  return 'Bronze';
};

const getBadgeStyles = (tier: Tier) => {
  switch (tier) {
    case 'Diamond':
      return {
        // Cyan/Blue Metallic Gradient
        rim: 'bg-gradient-to-tr from-cyan-600 via-cyan-300 to-blue-500',
        ribbon: 'from-blue-600 to-blue-900',
        inner: 'bg-gradient-to-b from-slate-900 via-cyan-950 to-slate-900',
        text: 'text-cyan-200',
        pill: 'bg-cyan-500/20 border-cyan-400/50 text-cyan-100',
        glow: 'shadow-[0_0_30px_rgba(6,182,212,0.6)]' 
      };
    case 'Gold':
      return {
        // Gold Metallic Gradient
        rim: 'bg-gradient-to-tr from-yellow-700 via-yellow-300 to-amber-600',
        ribbon: 'from-amber-700 to-amber-900',
        inner: 'bg-gradient-to-b from-slate-900 via-amber-950 to-slate-900',
        text: 'text-yellow-200',
        pill: 'bg-yellow-500/20 border-yellow-400/50 text-yellow-100',
        glow: 'shadow-[0_0_30px_rgba(234,179,8,0.6)]'
      };
    case 'Silver':
      return {
        // Silver Metallic Gradient
        rim: 'bg-gradient-to-tr from-slate-500 via-slate-200 to-slate-400',
        ribbon: 'from-slate-600 to-slate-800',
        inner: 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900',
        text: 'text-slate-200',
        pill: 'bg-slate-500/20 border-slate-300/50 text-slate-100',
        glow: 'shadow-[0_0_30px_rgba(100,116,139,0.5)]'
      };
    case 'Bronze':
    default:
      return {
        // Bronze Metallic Gradient
        rim: 'bg-gradient-to-tr from-orange-800 via-orange-400 to-orange-700',
        ribbon: 'from-orange-800 to-orange-950',
        inner: 'bg-gradient-to-b from-slate-900 via-orange-950 to-slate-900',
        text: 'text-orange-200',
        pill: 'bg-orange-500/20 border-orange-400/50 text-orange-100',
        glow: 'shadow-none'
      };
  }
};

// --- Component: Shield Badge ---
const GraduationBadge = ({ rank, status }: { rank: number; status: TaskStatus }) => {
  const tier = getTier(rank);
  const styles = getBadgeStyles(tier);
  const isCompleted = status === 'Completed';

  const activeClass = isCompleted 
    ? `filter-none scale-100 ${styles.glow} animate-[float_4s_ease-in-out_infinite]` 
    : 'grayscale opacity-60 scale-95 saturate-0 contrast-75';

  return (
    <div className={`relative flex flex-col items-center justify-center transition-all duration-500 ${activeClass}`}>
      
      {/* Ribbon Tails */}
      <div className="absolute -bottom-6 w-full flex justify-center gap-6 z-0">
        <div 
          className={`w-8 h-12 bg-gradient-to-b ${styles.ribbon} shadow-lg`} 
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)', transform: 'rotate(15deg) translateY(-5px)' }}
        />
        <div 
          className={`w-8 h-12 bg-gradient-to-b ${styles.ribbon} shadow-lg`} 
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)', transform: 'rotate(-15deg) translateY(-5px)' }}
        />
      </div>

      {/* Shield Body */}
      <div 
        className={`relative w-32 h-36 flex items-center justify-center z-10 shadow-2xl overflow-hidden ${styles.rim}`}
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)' }}
      >
        {/* Metallic Shine Animation Overlay */}
        {isCompleted && (
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        )}

        {/* Inner Shield */}
        <div 
          className={`w-[7.5rem] h-[8.5rem] flex flex-col items-center justify-start pt-3 gap-1 z-20 ${styles.inner}`}
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)' }}
        >
          <div className="text-center leading-tight">
            <span className={`block text-[8px] font-bold uppercase tracking-[0.2em] ${styles.text} opacity-80`}>Official</span>
            <span className={`block text-[10px] font-black uppercase tracking-widest ${styles.text}`}>Rank</span>
          </div>

          <div className="relative flex items-center justify-center mt-1">
            <span className={`text-2xl transform -scale-x-100 opacity-60 mr-1 ${styles.text}`}>🌿</span>
            <span className={`text-5xl font-black text-white drop-shadow-md`}>{rank}</span>
            <span className={`text-2xl opacity-60 ml-1 ${styles.text}`}>🌿</span>
          </div>

          {/* Tier Name Pill - ADJUSTED SIZE HERE */}
          {/* Changed padding to px-3 py-1 and text size to text-[9px] */}
          <div className={`mt-2 px-3 py-1 rounded-full border border-opacity-50 backdrop-blur-md shadow-lg ${styles.pill}`}>
            <span className={`block text-[9px] font-black uppercase tracking-[0.15em] drop-shadow-sm leading-none`}>
              {tier}
            </span>
          </div>

          <div className="flex gap-1 mt-3 opacity-80">
            <span className="text-[8px] text-white">★</span>
            <span className={`text-[10px] ${styles.text}`}>★</span>
            <span className="text-[8px] text-white">★</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6 md:p-12 overflow-x-hidden">
      
      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-card-entry {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      <div className="relative max-w-6xl mx-auto z-10">
        
        <header className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-500 drop-shadow-sm mb-4">
            Achievements 
          </h1>
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Live Rankings</span>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {mockUsers.map((user, index) => {
            const isCompleted = user.status === 'Completed';

            return (
              <div 
                key={user.id} 
                style={{ animationDelay: `${index * 150}ms` }}
                className={`
                  animate-card-entry group relative flex flex-col items-center p-8 pt-12 rounded-3xl border transition-all duration-300
                  ${isCompleted 
                    ? 'bg-white border-slate-200 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:border-blue-200 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] hover:-translate-y-2' 
                    : 'bg-slate-100/50 border-slate-200'
                  }
                `}
              >
                {/* 1. Badge Section */}
                <div className="absolute -top-14 transition-transform duration-500 group-hover:scale-110 z-20">
                  <GraduationBadge rank={user.rank} status={user.status} />
                </div>

                {/* Spacer */}
                <div className="h-20 w-full" />

                {/* 2. User Info */}
                <div className="flex flex-col items-center gap-1 w-full mb-6">
                   <h3 className={`text-2xl font-bold tracking-wide ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                     {user.username}
                   </h3>
                   <div className="flex items-center gap-2">
                     <span className="h-[1px] w-4 bg-slate-300"></span>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                       Class of 2026
                     </p>
                     <span className="h-[1px] w-4 bg-slate-300"></span>
                   </div>
                </div>

                {/* 3. Footer Status Bar */}
                <div className={`
                  w-full py-3 flex items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest border
                  transition-colors duration-300
                  ${isCompleted 
                    ? 'bg-green-50 text-green-600 border-green-200 group-hover:bg-green-100' 
                    : 'bg-red-50 text-red-400 border-red-100'}
                `}>
                  {isCompleted ? (
                    <>
                      <span>Badge Unlocked</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                    </>
                  ) : (
                    <>
                      <span>Requirements Pending</span>
                    </>
                  )}
                </div>

                {/* Locked Overlay Hint */}
                {!isCompleted && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-slate-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      Complete Tasks to Unlock
                    </div>
                  </div>
                )}
                
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}