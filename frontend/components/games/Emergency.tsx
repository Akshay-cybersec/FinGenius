"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Shield, Zap, PieChart, 
  ArrowRight, RefreshCcw, DollarSign, Activity, AlertTriangle, Trophy
} from 'lucide-react';

// ================= CONSTANTS =================

const TOTAL_YEARS = 5;
const INITIAL_BALANCE = 10000;

type AssetType = 'safe' | 'balanced' | 'risky';

interface MarketEvent {
  title: string;
  description: string;
  // Multipliers for each asset type (e.g., 1.10 = +10%, 0.90 = -10%)
  impact: {
    safe: number;
    balanced: number;
    risky: number;
  };
}

const MARKET_EVENTS: MarketEvent[] = [
  {
    title: "Economic Boom",
    description: "The economy is roaring! Businesses are expanding.",
    impact: { safe: 1.03, balanced: 1.15, risky: 1.40 } // Risky wins big
  },
  {
    title: "Market Correction",
    description: "Investors are panicking. Stocks take a dip.",
    impact: { safe: 1.02, balanced: 0.90, risky: 0.70 } // Risky crashes
  },
  {
    title: "Tech Bubble Burst",
    description: "Speculative tech stocks crash hard.",
    impact: { safe: 1.03, balanced: 0.95, risky: 0.50 } // Risky gets destroyed
  },
  {
    title: "Steady Growth",
    description: "A boring but profitable year for the markets.",
    impact: { safe: 1.03, balanced: 1.08, risky: 1.10 } // Balanced wins
  },
  {
    title: "Inflation Spike",
    description: "Cash loses value, but assets hold steady.",
    impact: { safe: 0.98, balanced: 1.02, risky: 1.05 } // Safe loses value
  }
];

// ================= HELPER COMPONENTS =================

const AssetCard = ({ type, allocation, setAllocation, disabled }: any) => {
  const config = {
    safe: { label: "Bonds & Cash", color: "bg-blue-500", icon: Shield, desc: "Low Risk, Low Reward" },
    balanced: { label: "S&P 500 Index", color: "bg-purple-500", icon: PieChart, desc: "Medium Risk, Steady Growth" },
    risky: { label: "Crypto & Startups", color: "bg-orange-500", icon: Zap, desc: "High Risk, High Reward" }
  }[type as AssetType];

  return (
    <div className={`relative p-6 rounded-2xl border ${disabled ? 'opacity-80' : ''} bg-slate-800 border-slate-700 transition-all hover:border-slate-500`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${config.color} bg-opacity-20 text-white`}>
            <config.icon size={24} className={type === 'safe' ? 'text-blue-400' : type === 'balanced' ? 'text-purple-400' : 'text-orange-400'} />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{config.label}</h3>
            <p className="text-xs text-slate-400">{config.desc}</p>
          </div>
        </div>
        <div className="text-2xl font-black text-white">{allocation}%</div>
      </div>

      <input 
        type="range" 
        min="0" 
        max="100" 
        step="10"
        value={allocation}
        disabled={disabled}
        onChange={(e) => setAllocation(type, parseInt(e.target.value))}
        className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-white"
      />
    </div>
  );
};

// ================= MAIN COMPONENT =================

export default function PortfolioPilot() {
  const [year, setYear] = useState(1);
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [allocation, setAllocation] = useState({ safe: 30, balanced: 50, risky: 20 });
  const [history, setHistory] = useState<{ year: number, balance: number, event: MarketEvent | null }[]>([{ year: 0, balance: INITIAL_BALANCE, event: null }]);
  const [gameState, setGameState] = useState<'planning' | 'simulating' | 'summary' | 'gameover'>('planning');
  const [currentEvent, setCurrentEvent] = useState<MarketEvent | null>(null);

  // --- Logic ---

  const handleAllocationChange = (type: AssetType, value: number) => {
    // Simple logic: Adjust the other two to sum to 100% (simplified for UX)
    // For a smoother UX, we just let them set it and normalize it on "Run"
    setAllocation(prev => ({ ...prev, [type]: value }));
  };

  const runYear = () => {
    // 1. Normalize Allocation to ensure it equals 100%
    const total = allocation.safe + allocation.balanced + allocation.risky;
    const norm = {
      safe: allocation.safe / total,
      balanced: allocation.balanced / total,
      risky: allocation.risky / total
    };

    // 2. Select Event
    const randomEvent = MARKET_EVENTS[Math.floor(Math.random() * MARKET_EVENTS.length)];
    setCurrentEvent(randomEvent);
    setGameState('simulating');

    // 3. Calculate New Balance
    setTimeout(() => {
      const safeGrowth = (balance * norm.safe) * randomEvent.impact.safe;
      const balancedGrowth = (balance * norm.balanced) * randomEvent.impact.balanced;
      const riskyGrowth = (balance * norm.risky) * randomEvent.impact.risky;
      
      const newBalance = Math.round(safeGrowth + balancedGrowth + riskyGrowth);
      
      setBalance(newBalance);
      setHistory(prev => [...prev, { year, balance: newBalance, event: randomEvent }]);
      
      setGameState('summary');
    }, 2000); // 2 seconds of "simulation" suspense
  };

  const nextYear = () => {
    if (year >= TOTAL_YEARS) {
      setGameState('gameover');
    } else {
      setYear(prev => prev + 1);
      setGameState('planning');
      setCurrentEvent(null);
    }
  };

  const restartGame = () => {
    setYear(1);
    setBalance(INITIAL_BALANCE);
    setHistory([{ year: 0, balance: INITIAL_BALANCE, event: null }]);
    setGameState('planning');
  };

  // Calculate total for validation display
  const totalAlloc = allocation.safe + allocation.balanced + allocation.risky;

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans p-4 md:p-8 flex items-center justify-center">
      
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT: CONTROL PANEL --- */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Header */}
          <div className="flex justify-between items-end mb-4">
            <div>
              <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Portfolio Pilot</h1>
              <p className="text-slate-400">Year {year} of {TOTAL_YEARS}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Net Worth</p>
              <motion.div 
                key={balance}
                initial={{ scale: 1.2, color: '#10b981' }}
                animate={{ scale: 1, color: '#ffffff' }}
                className="text-4xl font-mono font-bold"
              >
                ${balance.toLocaleString()}
              </motion.div>
            </div>
          </div>

          {/* Allocation Cards */}
          <div className="space-y-4">
             <div className="flex justify-between items-center text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span>Asset Allocation</span>
                <span className={totalAlloc !== 100 ? "text-red-400" : "text-emerald-400"}>Total: {totalAlloc}%</span>
             </div>
             
             <AssetCard 
               type="safe" 
               allocation={allocation.safe} 
               setAllocation={handleAllocationChange} 
               disabled={gameState !== 'planning'}
             />
             <AssetCard 
               type="balanced" 
               allocation={allocation.balanced} 
               setAllocation={handleAllocationChange} 
               disabled={gameState !== 'planning'}
             />
             <AssetCard 
               type="risky" 
               allocation={allocation.risky} 
               setAllocation={handleAllocationChange} 
               disabled={gameState !== 'planning'}
             />
          </div>

          {/* Action Button */}
          {gameState === 'planning' && (
            <button 
              onClick={runYear}
              className="w-full py-5 rounded-2xl font-black text-xl shadow-lg bg-emerald-500 hover:bg-emerald-400 text-white transition-all flex items-center justify-center gap-3 mt-4"
            >
              <Activity /> Simulate Year {year}
            </button>
          )}

          {gameState === 'simulating' && (
             <div className="w-full py-5 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center gap-3 animate-pulse mt-4">
                <RefreshCcw className="animate-spin" /> Simulating Market...
             </div>
          )}

          {gameState === 'summary' && (
             <button 
               onClick={nextYear}
               className="w-full py-5 rounded-2xl font-black text-xl shadow-lg bg-blue-500 hover:bg-blue-400 text-white transition-all flex items-center justify-center gap-3 mt-4"
             >
               Next Year <ArrowRight />
             </button>
          )}

        </div>

        {/* --- RIGHT: VISUALIZATION & EVENTS --- */}
        <div className="lg:col-span-5 flex flex-col gap-6">
           
           {/* Chart / History */}
           <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-64 relative overflow-hidden flex items-end justify-between px-8">
              <div className="absolute top-4 left-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Portfolio Growth</div>
              
              {/* Simple CSS Bar Chart */}
              {history.map((h, i) => {
                 const height = (h.balance / (Math.max(...history.map(x => x.balance)) * 1.2)) * 100;
                 return (
                   <div key={i} className="flex flex-col items-center gap-2 group relative w-full">
                      {/* Tooltip */}
                      <div className="absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                         Year {h.year}: ${h.balance.toLocaleString()}
                      </div>
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(5, height)}%` }}
                        className={`w-full max-w-[40px] rounded-t-lg transition-all duration-1000 ${
                           i === 0 ? 'bg-slate-700' : 
                           h.balance > history[i-1].balance ? 'bg-emerald-500' : 'bg-red-500'
                        }`} 
                      />
                      <span className="text-[10px] text-slate-500">Y{h.year}</span>
                   </div>
                 )
              })}
           </div>

           {/* Event Card (Pops up after simulation) */}
           <AnimatePresence mode="wait">
             {(gameState === 'summary' || gameState === 'gameover') && currentEvent && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                >
                   {/* Background Gradient */}
                   <div className={`absolute top-0 left-0 w-1 h-full ${
                      currentEvent.impact.balanced > 1.05 ? 'bg-emerald-500' : 
                      currentEvent.impact.balanced < 0.95 ? 'bg-red-500' : 'bg-yellow-500'
                   }`} />

                   <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-slate-700 rounded-lg">
                         {currentEvent.impact.balanced > 1 ? <TrendingUp className="text-emerald-400" /> : <TrendingDown className="text-red-400" />}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Market News</span>
                   </div>
                   
                   <h2 className="text-2xl font-black text-white mb-2">{currentEvent.title}</h2>
                   <p className="text-slate-400 leading-relaxed">{currentEvent.description}</p>

                   {/* Impact Breakdown */}
                   <div className="mt-6 grid grid-cols-3 gap-2">
                      <ImpactBadge label="Safe" val={currentEvent.impact.safe} />
                      <ImpactBadge label="Index" val={currentEvent.impact.balanced} />
                      <ImpactBadge label="Risky" val={currentEvent.impact.risky} />
                   </div>
                </motion.div>
             )}

             {/* Game Over Screen */}
             {gameState === 'gameover' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-8 text-center shadow-2xl"
                >
                   <Trophy size={48} className="mx-auto text-yellow-400 mb-4" />
                   <h2 className="text-3xl font-black text-white mb-2">Simulation Complete!</h2>
                   <p className="text-slate-300 mb-6">
                      Final Net Worth: <span className="text-white font-mono font-bold">${balance.toLocaleString()}</span>
                   </p>
                   
                   <div className="bg-slate-900/50 p-4 rounded-xl text-left text-sm text-slate-400 mb-6 border border-slate-800">
                      <strong className="text-indigo-400 block mb-1">Lesson Learned:</strong>
                      Diversification protects you from bad years. Did you notice how "Risky" assets crashed during bad news, but "Safe" assets held steady?
                   </div>

                   <button onClick={restartGame} className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                      Play Again
                   </button>
                </motion.div>
             )}
           </AnimatePresence>

        </div>

      </div>
    </div>
  );
}

const ImpactBadge = ({ label, val }: any) => {
   const isPositive = val >= 1;
   const percentage = Math.round((val - 1) * 100);
   
   return (
      <div className={`p-2 rounded-lg text-center border ${isPositive ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
         <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">{label}</div>
         <div className={`font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{percentage}%
         </div>
      </div>
   )
}