"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, GraduationCap, Briefcase, Home, TrendingUp, 
  AlertTriangle, CheckCircle2, Lock, Unlock, ArrowRight, 
  RefreshCcw, HeartPulse, Star, MapPin, ChevronRight, AlertCircle, LucideIcon, 
  Package, Sparkles, Timer 
} from 'lucide-react';

// ================= TYPES =================

interface Constraint {
  min: number;
  label: string;
}

interface FinancialRule {
  minSavings?: number;
  maxEnt?: number;
  maxLifestyle?: number;
  minInvest?: number;
}

interface GameEvent {
  text: string;
  amount: number;
  type: 'good' | 'bad' | 'neutral';
}

interface LifeStage {
  id: string;
  label: string;
  levels: number[];
  incomeRange: [number, number];
  icon: LucideIcon;
  color: string;
  bg: string;
  description: string;
  fixedExpenses: Record<string, number>;
  categories: string[];
  constraints?: Record<string, Constraint>;
  rules: FinancialRule;
  events: GameEvent[];
}

// ================= GAME CONFIGURATION =================

const LIFE_STAGES: LifeStage[] = [
  {
    id: 'teenager',
    label: 'Teenager',
    levels: [0, 1, 2],
    incomeRange: [2000, 3000],
    icon: User,
    color: 'text-blue-400',
    bg: 'bg-blue-500',
    description: "Start of your journey. Learn to save pocket money.",
    fixedExpenses: {}, 
    categories: ['snacks', 'games', 'savings'],
    constraints: {
      snacks: { min: 500, label: "Min. Hunger" }
    },
    rules: { minSavings: 0.10 },
    events: [
      { text: "Found ₹500 on the street!", amount: 500, type: 'good' },
      { text: "Lost your wallet.", amount: -200, type: 'bad' }
    ]
  },
  {
    id: 'student',
    label: 'College Student',
    levels: [3, 4, 5],
    incomeRange: [8000, 10000],
    icon: GraduationCap,
    color: 'text-purple-400',
    bg: 'bg-purple-500',
    description: "Funds are tight. You MUST spend on food and books.",
    fixedExpenses: { travel: 1500, recharge: 300 },
    categories: ['food', 'entertainment', 'books', 'savings'],
    constraints: {
      food: { min: 2500, label: "Survival Diet" },
      books: { min: 1000, label: "Required Texts" }
    },
    rules: { minSavings: 0.10 },
    events: [
      { text: "Urgent textbook needed.", amount: -800, type: 'bad' },
      { text: "Won a scholarship!", amount: 1500, type: 'good' }
    ]
  },
  {
    id: 'entry_job',
    label: 'First Job',
    levels: [6, 7, 8, 9],
    incomeRange: [18000, 22000],
    icon: Briefcase,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500',
    description: "Real bills arrive. Inflation increases your food costs.",
    fixedExpenses: { rent: 6000, bills: 2000, transport: 2000 },
    categories: ['groceries', 'entertainment', 'shopping', 'savings'],
    constraints: {
      groceries: { min: 4000, label: "Healthy Diet" }
    },
    rules: { minSavings: 0.20 },
    events: [
      { text: "Performance Bonus!", amount: 3000, type: 'good' },
      { text: "Medical checkup.", amount: -2000, type: 'bad' }
    ]
  },
  {
    id: 'independent',
    label: 'Independent',
    levels: [10, 11, 12, 13, 14],
    incomeRange: [40000, 50000],
    icon: Home,
    color: 'text-orange-400',
    bg: 'bg-orange-500',
    description: "Living alone is expensive. Lifestyle inflation is a trap.",
    fixedExpenses: { rent: 15000, bills: 5000, loan: 4000 },
    categories: ['lifestyle', 'travel', 'emergency_fund', 'savings'],
    constraints: {
        emergency_fund: { min: 2000, label: "Safety Net" }
    },
    rules: { minSavings: 0.25 },
    events: [
      { text: "Car breakdown.", amount: -5000, type: 'bad' },
      { text: "Tax refund!", amount: 4000, type: 'good' }
    ]
  }
];

const getStageConfig = (level: number): LifeStage => {
  return LIFE_STAGES.find(s => level >= s.levels[0] && (s.levels.length > 2 ? level <= s.levels[s.levels.length - 1] : true)) || LIFE_STAGES[0];
};

// ================= COMPONENT: CHEST MODAL =================

const ChestModal = ({ onOpen }: { onOpen: () => void }) => {
    const [timeLeft, setTimeLeft] = useState(5);
    const [isOpen, setIsOpen] = useState(false);
  
    useEffect(() => {
      if (isOpen) return;
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleOpen();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }, [isOpen]);
  
    const handleOpen = () => {
      setIsOpen(true);
      // Small delay for animation before showing actual result
      setTimeout(onOpen, 1000); 
    };
  
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      >
        <div className="relative text-center w-full max-w-sm">
           
           {!isOpen ? (
             <motion.div
                key="closed"
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                className="flex flex-col items-center"
             >
                <div className="mb-6">
                    <h2 className="text-2xl font-black text-white mb-2">Month Complete!</h2>
                    <p className="text-slate-400">Open your rewards box...</p>
                </div>
  
                <motion.button 
                   onClick={handleOpen}
                   whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 1, 0] }}
                   whileTap={{ scale: 0.95 }}
                   animate={{ 
                      y: [0, -10, 0],
                      filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
                   }}
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="relative group cursor-pointer"
                >
                    <div className="absolute inset-0 bg-yellow-500 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity" />
                    <Package size={140} className="text-yellow-400 drop-shadow-2xl relative z-10" strokeWidth={1.5} />
                    <Sparkles className="absolute -top-4 -right-4 text-yellow-200 animate-pulse" size={40} />
                </motion.button>
  
                <div className="mt-8 w-full bg-slate-800 h-2 rounded-full overflow-hidden max-w-[200px] mx-auto relative">
                    <motion.div 
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 5, ease: "linear" }}
                        className="absolute left-0 top-0 h-full bg-yellow-500" 
                    />
                </div>
                <div className="mt-2 flex items-center justify-center gap-2 text-yellow-500 font-mono text-sm">
                    <Timer size={14} /> Auto-opening in {timeLeft}s
                </div>
             </motion.div>
           ) : (
             <motion.div
                key="opening"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 1 }}
                className="flex flex-col items-center"
             >
                 <div className="absolute inset-0 bg-white blur-[80px] opacity-30" />
                 <Sparkles size={100} className="text-yellow-300 animate-spin-slow" />
             </motion.div>
           )}
        </div>
      </motion.div>
    );
  };

// ================= COMPONENT: TIMELINE =================

const LevelTimeline = ({ currentLevel, maxReached, onSelectLevel }: any) => {
  const levels = Array.from({ length: 15 }, (_, i) => i);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to center
  useEffect(() => {
    if (scrollRef.current) {
        const activeNode = scrollRef.current.children[currentLevel] as HTMLElement;
        if(activeNode) {
            activeNode.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }
  }, [currentLevel]);

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 py-4 px-2 mb-6 shadow-xl sticky top-0 z-30">
      <div 
        ref={scrollRef}
        className="flex items-center gap-4 overflow-x-auto px-4 scrollbar-hide snap-x no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {levels.map((lvl, index) => {
          const isLocked = lvl > maxReached;
          const isActive = lvl === currentLevel;
          const isPast = lvl < currentLevel;

          return (
            <motion.div
              key={lvl}
              layout // Helps with smooth layout shifts
              onClick={() => !isLocked && onSelectLevel(lvl)}
              className={`
                 relative flex-shrink-0 snap-center flex flex-col items-center gap-2 cursor-pointer group min-w-[60px]
              `}
            >
              <div className="relative flex items-center justify-center">
                 {/* Connection Line Behind */}
                 {index !== 0 && (
                    <div className={`absolute right-[50%] top-1/2 -translate-y-1/2 w-10 h-1 z-0 ${lvl <= maxReached ? 'bg-emerald-500/50' : 'bg-slate-800'}`} />
                 )}
                 
                 {/* Circle Node */}
                 <div className={`
                    relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                    ${isActive 
                        ? 'bg-emerald-500 text-white border-emerald-300 scale-110 shadow-[0_0_20px_rgba(16,185,129,0.6)]' 
                        : isLocked 
                            ? 'bg-slate-800 text-slate-600 border-slate-700' 
                            : 'bg-slate-900 text-emerald-500 border-emerald-500 hover:bg-emerald-500/10'
                    }
                 `}>
                    {isLocked ? <Lock size={14} /> : (isActive ? <Star size={16} fill="currentColor" /> : lvl + 1)}
                 </div>
              </div>

              {/* Level Label (Only visible for active or hovered) */}
              <span className={`text-[10px] font-bold uppercase transition-all ${isActive ? 'text-emerald-400 opacity-100' : 'text-slate-500 opacity-0 group-hover:opacity-100'}`}>
                {lvl === 14 ? 'Final' : `Lvl ${lvl + 1}`}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ================= RESULT MODAL =================

const ResultModal = ({ result, onNext, onRetry, isMaxLevel }: any) => {
  const isPass = result.score >= 60 && result.balance >= 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className={`absolute top-0 left-0 w-full h-2 ${isPass ? 'bg-emerald-500' : 'bg-red-500'}`} />
        
        <div className="text-center mb-6">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${isPass ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
            {isPass ? <CheckCircle2 size={40} /> : <AlertTriangle size={40} />}
          </div>
          <h2 className="text-3xl font-black text-white mb-2">{isPass ? 'Level Passed!' : 'Budget Failed'}</h2>
          <p className="text-slate-400">{isPass ? 'Good job managing your funds.' : 'Review your mistakes and try again.'}</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-slate-800 p-4 rounded-xl flex justify-between items-center">
            <span className="text-slate-400">Score</span>
            <span className={`text-2xl font-bold ${isPass ? 'text-emerald-400' : 'text-red-400'}`}>{Math.round(result.score)}/100</span>
          </div>
          
          <div className="bg-slate-800 p-4 rounded-xl text-left max-h-40 overflow-y-auto custom-scrollbar">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Feedback</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              {result.feedback.map((f: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                   <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-slate-500" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          {!isPass && (
             <button onClick={onRetry} className="flex-1 py-4 rounded-xl font-bold bg-white text-slate-900 hover:bg-slate-200 flex items-center justify-center gap-2">
               <RefreshCcw size={18} /> Retry
             </button>
          )}
          {isPass && (
            <button onClick={onNext} className="flex-1 py-4 rounded-xl font-bold bg-emerald-500 text-white hover:bg-emerald-400 flex items-center justify-center gap-2">
               {isMaxLevel ? 'Finish Game' : 'Next Level'} <ArrowRight size={18} />
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ================= MAIN COMPONENT =================

export default function FinancialSimulationGame() {
  const [level, setLevel] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [income, setIncome] = useState(2000);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  
  // Game States: playing -> chest -> result
  const [gameState, setGameState] = useState<'playing' | 'chest' | 'result'>('playing');
  const [lastResult, setLastResult] = useState<any>(null);
  const [savingsError, setSavingsError] = useState(false); // To trigger shake animation

  const stage = useMemo(() => getStageConfig(level), [level]);

  useEffect(() => {
    const baseIncome = Math.floor(Math.random() * (stage.incomeRange[1] - stage.incomeRange[0]) + stage.incomeRange[0]);
    const roundedIncome = Math.round(baseIncome / 100) * 100;
    setIncome(roundedIncome);
    
    const initialAlloc: Record<string, number> = {};
    stage.categories.forEach(cat => {
      const minRequired = stage.constraints?.[cat]?.min || 0;
      initialAlloc[cat] = minRequired;
    });
    setAllocations(initialAlloc);
    setGameState('playing');
    setSavingsError(false);
  }, [level, stage]);

  const totalFixed = Object.values(stage.fixedExpenses).reduce((a, b) => a + b, 0);
  const totalAllocated = Object.values(allocations).reduce((a, b) => a + b, 0);
  const remaining = income - totalFixed - totalAllocated;

  const handleSliderChange = (category: string, value: number) => {
    const currentVal = allocations[category] || 0;
    const minRequired = stage.constraints?.[category]?.min || 0;
    
    // Reset savings error if user starts saving
    if(category === 'savings' && value > 0) setSavingsError(false);

    if (value < minRequired) return;

    const diff = value - currentVal;
    if (remaining - diff >= 0) {
      setAllocations(prev => ({ ...prev, [category]: value }));
    }
  };

  const handleLevelComplete = (success: boolean) => {
    if (success) {
      if (level === maxReached) {
        setMaxReached(prev => prev + 1);
      }
      setLevel(prev => prev + 1);
    }
    setGameState('playing');
  };

  const handleFinishClick = () => {
    // 1. MANDATORY SAVINGS CHECK
    const savingsAmount = allocations['savings'] || 0;
    if (savingsAmount <= 0) {
        setSavingsError(true);
        // Reset animation after it plays
        setTimeout(() => setSavingsError(false), 500);
        return;
    }

    // 2. Prepare Results but don't show yet (Show Chest first)
    const randomEvent = stage.events[Math.floor(Math.random() * stage.events.length)];
    const finalBalance = remaining + randomEvent.amount;
    
    let score = 100;
    const feedback: string[] = [];
    
    const savingsRate = savingsAmount / income;
    
    if (stage.rules.minSavings && savingsRate < stage.rules.minSavings) {
      score -= 20;
      feedback.push(`Savings low! Goal: ${(stage.rules.minSavings * 100)}%`);
    } else {
      feedback.push("Good savings discipline! (+10 pts)");
    }

    if (stage.constraints) {
      Object.entries(stage.constraints).forEach(([cat, limit]) => {
          if ((allocations[cat] || 0) < limit.min) {
              score -= 30;
              feedback.push(`Failed constraint: spent too little on ${cat}.`);
          }
      });
    }

    feedback.push(`Event: ${randomEvent.text} (${randomEvent.amount > 0 ? '+' : ''}₹${randomEvent.amount})`);
    
    if (finalBalance < 0) {
      score = 0;
      feedback.push("Bankruptcy! The event wiped out your funds.");
    }

    setLastResult({
      score: Math.max(0, score),
      feedback,
      balance: finalBalance,
      event: randomEvent
    });

    // 3. TRIGGER CHEST ANIMATION
    setGameState('chest');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20">
      
      <LevelTimeline 
        currentLevel={level} 
        maxReached={maxReached} 
        onSelectLevel={(lvl: number) => {
             setLevel(lvl);
             setGameState('playing');
        }} 
      />

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6 border-b border-slate-800">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <div className={`p-3 rounded-xl ${stage.bg} text-white shadow-lg`}>
                    <stage.icon size={28} />
                 </div>
                 <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">{stage.label}</h1>
                    <p className={`text-sm font-bold ${stage.color}`}>Level {level + 1}</p>
                 </div>
              </div>
              <p className="text-slate-400 text-sm max-w-md leading-relaxed">{stage.description}</p>
           </div>
           
           <div className="text-right bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Monthly Income</p>
              <p className="text-3xl font-black text-white tracking-tight">₹{income.toLocaleString()}</p>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LEFT: CONTROLS */}
            <div className="space-y-6">
               
               {Object.keys(stage.fixedExpenses).length > 0 && (
                 <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                       <Lock size={14} /> Fixed Auto-Debits
                    </h3>
                    <div className="space-y-3">
                       {Object.entries(stage.fixedExpenses).map(([key, val]) => (
                          <div key={key} className="flex justify-between items-center text-sm">
                             <span className="capitalize text-slate-300">{key}</span>
                             <span className="font-mono text-red-400 font-bold">-₹{val.toLocaleString()}</span>
                          </div>
                       ))}
                    </div>
                 </div>
               )}

               <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
                  
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-6 flex items-center gap-2 relative z-10">
                     <Unlock size={14} /> Allocate Your Budget
                  </h3>
                  
                  <div className="space-y-8 relative z-10">
                    {stage.categories.map((cat) => {
                      const constraint = stage.constraints?.[cat];
                      const minVal = constraint?.min || 0;
                      const currentVal = allocations[cat] || 0;
                      
                      // Highlight savings slider if there is an error
                      const isError = cat === 'savings' && savingsError;

                      return (
                        <div key={cat} className={`space-y-3 transition-all ${isError ? 'p-2 bg-red-900/20 rounded-lg border border-red-500' : ''}`}>
                          <div className="flex justify-between text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <span className="capitalize text-white">{cat.replace(/_/g, ' ')}</span>
                                {constraint && (
                                    <div className="flex items-center gap-1 text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">
                                        <Lock size={10} /> Min: ₹{minVal}
                                    </div>
                                )}
                                {isError && (
                                    <span className="text-red-400 text-xs font-bold animate-pulse">Required!</span>
                                )}
                            </div>
                            <span className={`${currentVal === minVal && constraint ? 'text-red-400' : 'text-emerald-400'} font-bold`}>
                                ₹{currentVal.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="relative h-2 w-full">
                            <input
                                type="range"
                                min={minVal}
                                max={income - totalFixed}
                                step="100"
                                value={currentVal}
                                onChange={(e) => handleSliderChange(cat, parseInt(e.target.value))}
                                className="absolute w-full h-full rounded-lg appearance-none cursor-pointer z-20 opacity-0"
                            />
                            <div className="absolute w-full h-full bg-slate-800 rounded-lg overflow-hidden">
                                <motion.div 
                                    className={`h-full ${constraint && currentVal === minVal ? 'bg-red-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${Math.min(100, (currentVal / income) * 100)}%` }}
                                />
                            </div>
                            <div 
                                className="absolute top-1/2 h-4 w-4 bg-white rounded-full shadow-md -translate-y-1/2 pointer-events-none z-10"
                                style={{ left: `${Math.min(100, (currentVal / (income - totalFixed)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
               </div>
            </div>

            {/* RIGHT: DASHBOARD */}
            <div className="space-y-6">
               
               <div className={`p-8 rounded-[2rem] border transition-colors relative overflow-hidden ${remaining < 0 ? 'bg-red-950/30 border-red-500/50' : 'bg-slate-900 border-slate-700'}`}>
                  <div className="relative z-10">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-slate-400 font-medium">Disposable Remaining</span>
                      </div>
                      <div className={`text-5xl font-black mb-4 tracking-tight ${remaining < 500 ? 'text-red-500' : 'text-emerald-400'}`}>
                        ₹{remaining.toLocaleString()}
                      </div>
                      <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: '100%' }}
                          animate={{ width: `${Math.max(0, (remaining / income) * 100)}%` }}
                          className={`h-full ${remaining < 500 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                        />
                      </div>
                  </div>
               </div>

               <div className="bg-indigo-900/10 border border-indigo-500/20 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4 text-indigo-400 font-bold">
                     <HeartPulse size={20} /> Budget Analysis
                  </div>
                  <ul className="space-y-3 text-sm text-slate-400">
                     <li className="flex items-center justify-between">
                        <span>Savings Rate</span>
                        <div className="flex items-center gap-2">
                            <span className={((allocations['savings']||0)/income) >= (stage.rules.minSavings||0) ? "text-emerald-400" : "text-yellow-500"}>
                                {Math.round(((allocations['savings']||0)/income)*100)}%
                            </span>
                            {(allocations['savings']||0)/income >= (stage.rules.minSavings || 0.1) 
                                ? <CheckCircle2 size={16} className="text-emerald-500" /> 
                                : <AlertCircle size={16} className="text-yellow-500" />
                            }
                        </div>
                     </li>
                     <li className="flex items-center justify-between">
                        <span>Mandatory Costs Met</span>
                         <CheckCircle2 size={16} className="text-emerald-500" />
                     </li>
                  </ul>
               </div>

               {/* FINISH BUTTON - FIX: CHANGED TRANSITION TYPE TO FIX SPRING ERROR */}
               <motion.button
                  onClick={handleFinishClick}
                  disabled={remaining < 0}
                  animate={savingsError ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }} 
                  className={`w-full py-5 rounded-2xl font-black text-xl shadow-lg flex items-center justify-center gap-2 transition-all 
                    ${savingsError 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:brightness-110'
                    } disabled:opacity-50 disabled:grayscale`}
               >
                  {savingsError ? "Save at least ₹1 !" : <>Finish Month <ChevronRight /></>}
               </motion.button>

            </div>
        </div>
      </div>

      <AnimatePresence>
        {gameState === 'chest' && (
             <ChestModal onOpen={() => setGameState('result')} />
        )}
        
        {gameState === 'result' && lastResult && (
          <ResultModal 
            result={lastResult} 
            onNext={() => handleLevelComplete(true)}
            onRetry={() => handleLevelComplete(false)} 
            isMaxLevel={level >= 14}
          />
        )}
      </AnimatePresence>

    </div>
  );
}