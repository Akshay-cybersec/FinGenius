"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Joyride, { CallBackProps, STATUS, Step, Styles } from 'react-joyride';
import { 
  User, GraduationCap, Briefcase, Home, TrendingUp, 
  AlertTriangle, CheckCircle2, Lock, Unlock, ArrowRight, 
  RefreshCcw, HeartPulse, Star, MapPin, ChevronRight, AlertCircle, LucideIcon, 
  Package, Sparkles, Timer, Gift, TrendingDown, RotateCcw, Wallet, ShieldCheck
} from 'lucide-react';

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
  accent: string;
  description: string;
  fixedExpenses: Record<string, number>;
  categories: string[];
  constraints?: Record<string, Constraint>;
  rules: FinancialRule;
  events: GameEvent[];
}

const LIFE_STAGES: LifeStage[] = [
  {
    id: 'teenager',
    label: 'Teenager',
    levels: [0, 1, 2],
    incomeRange: [2000, 3000],
    icon: User,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    accent: 'border-cyan-500/50',
    description: "Start of your journey. Learn to save pocket money.",
    fixedExpenses: {}, 
    categories: ['snacks', 'games', 'savings'],
    constraints: {
      snacks: { min: 500, label: "Min. Hunger" }
    },
    rules: { minSavings: 0.10 },
    events: [
      { text: "Found ₹500 on the street!", amount: 500, type: 'good' },
      { text: "Lost your wallet.", amount: -200, type: 'bad' },
      { text: "Grandma gave you birthday money.", amount: 1000, type: 'good' }
    ]
  },
  {
    id: 'student',
    label: 'College Student',
    levels: [3, 4, 5],
    incomeRange: [8000, 10000],
    icon: GraduationCap,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    accent: 'border-violet-500/50',
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
      { text: "Won a scholarship!", amount: 1500, type: 'good' },
      { text: "Laptop repair needed.", amount: -2000, type: 'bad' }
    ]
  },
  {
    id: 'entry_job',
    label: 'First Job',
    levels: [6, 7, 8, 9],
    incomeRange: [18000, 22000],
    icon: Briefcase,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    accent: 'border-emerald-500/50',
    description: "Real bills arrive. Inflation increases your food costs.",
    fixedExpenses: { rent: 6000, bills: 2000, transport: 2000 },
    categories: ['groceries', 'entertainment', 'shopping', 'savings'],
    constraints: {
      groceries: { min: 4000, label: "Healthy Diet" }
    },
    rules: { minSavings: 0.20 },
    events: [
      { text: "Performance Bonus!", amount: 3000, type: 'good' },
      { text: "Medical checkup.", amount: -2000, type: 'bad' },
      { text: "Side hustle payout.", amount: 1500, type: 'good' }
    ]
  },
  {
    id: 'independent',
    label: 'Independent',
    levels: [10, 11, 12, 13, 14],
    incomeRange: [40000, 50000],
    icon: Home,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    accent: 'border-amber-500/50',
    description: "Living alone is expensive. Lifestyle inflation is a trap.",
    fixedExpenses: { rent: 15000, bills: 5000, loan: 4000 },
    categories: ['lifestyle', 'travel', 'emergency_fund', 'savings'],
    constraints: {
        emergency_fund: { min: 2000, label: "Safety Net" }
    },
    rules: { minSavings: 0.25 },
    events: [
      { text: "Car breakdown.", amount: -5000, type: 'bad' },
      { text: "Tax refund!", amount: 4000, type: 'good' },
      { text: "Wedding gift for friend.", amount: -3000, type: 'neutral' }
    ]
  }
];

const getStageConfig = (level: number): LifeStage => {
  return LIFE_STAGES.find(s => level >= s.levels[0] && (s.levels.length > 2 ? level <= s.levels[s.levels.length - 1] : true)) || LIFE_STAGES[0];
};

const TOUR_STYLES: Partial<Styles> = {
  options: {
    arrowColor: '#0f172a', 
    backgroundColor: '#0f172a',
    overlayColor: 'rgba(0, 0, 0, 0.85)',
    primaryColor: '#10b981', 
    textColor: '#f8fafc',
    width: 400,
    zIndex: 1000,
  },
  tooltip: {
    borderRadius: '16px',
    fontSize: '14px',
    padding: '24px', 
    border: '1px solid #334155'
  },
  buttonNext: {
    backgroundColor: '#10b981',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: 'bold',
    outline: 'none',
  },
  buttonBack: {
    color: '#94a3b8',
    marginRight: 10,
  },
  buttonSkip: {
    color: '#94a3b8',
  }
};

const TOUR_STEPS: Step[] = [
  {
    target: 'body',
    placement: 'center',
    content: (
      <div className="text-center">
        <h3 className="font-bold text-xl mb-3 text-emerald-400">Welcome to Budget Simulator! 🎓</h3>
        <p className="text-slate-300">Your goal is to survive the month, save money, and level up from a Teenager to a Wealth Builder.</p>
      </div>
    ),
    disableBeacon: true,
  },
  {
    target: '.tour-timeline',
    content: 'This is your Life Journey. As you pass levels, you will unlock new life stages like College and First Job.',
  },
  {
    target: '.tour-income',
    content: 'This is your Monthly Income. It changes based on your life stage.',
  },
  {
    target: '.tour-fixed',
    content: 'These are Fixed Expenses (like Rent). They are auto-deducted. You cannot change these.',
  },
  {
    target: '.tour-sliders',
    content: 'This is where you play! Use the sliders to allocate your remaining budget. Watch out for mandatory minimums (locks)!',
  },
  {
    target: '.tour-dashboard',
    content: 'Keep an eye on this! Make sure you have enough "Disposable Remaining" for emergencies.',
  },
  {
    target: '.tour-finish',
    content: 'Once you are happy with your budget, click here to end the month and see if you survived!',
  },
];

const ExplosionParticles = () => {
    const particles = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        angle: Math.random() * 360,
        dist: 50 + Math.random() * 100,
        size: 3 + Math.random() * 5,
        color: ['#FBBF24', '#34D399', '#60A5FA', '#F472B6', '#FFFFFF'][Math.floor(Math.random() * 5)],
        delay: Math.random() * 0.2
    }));

    return (
        <>
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{ 
                        x: p.dist * Math.cos(p.angle * (Math.PI / 180)), 
                        y: p.dist * Math.sin(p.angle * (Math.PI / 180)), 
                        scale: 0, 
                        opacity: 0 
                    }}
                    transition={{ duration: 0.6, delay: p.delay, ease: "easeOut" }}
                    style={{ 
                        position: 'absolute', 
                        width: p.size, 
                        height: p.size, 
                        borderRadius: '50%', 
                        backgroundColor: p.color,
                        zIndex: 10
                    }}
                />
            ))}
        </>
    );
};

const ChestModal = ({ eventData, onComplete }: { eventData: GameEvent, onComplete: () => void }) => {
    const [timeLeft, setTimeLeft] = useState(5);
    const [phase, setPhase] = useState<'closed' | 'opening' | 'revealed'>('closed');
  
    useEffect(() => {
      if (phase !== 'closed') return;
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
    }, [phase]);
  
    const handleOpen = () => {
      setPhase('opening');
      setTimeout(() => setPhase('revealed'), 600); 
    };

    const isGood = eventData.type === 'good';
  
    return (
      <motion.div 
        key="chest-modal"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4"
      >
        <div className="relative text-center w-full max-w-sm flex flex-col items-center justify-center min-h-[400px]">
           
           {phase === 'closed' && (
             <motion.div
                key="closed"
                initial={{ scale: 0.5, y: 100, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.2 } }}
                className="flex flex-col items-center relative z-10"
             >
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-200 to-amber-500 mb-2 drop-shadow-sm">Mystery Event</h2>
                    <p className="text-slate-400 font-medium">Fate decides your fortune...</p>
                </div>
  
                <motion.button 
                   onClick={handleOpen}
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, -2, 2, -2, 0]
                   }}
                   transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                   className="relative group cursor-pointer"
                >
                    <div className="absolute inset-0 bg-amber-500 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
                    <Package size={160} className="text-amber-400 drop-shadow-2xl relative z-10 filter brightness-110" strokeWidth={1.5} />
                    <Sparkles className="absolute -top-4 -right-4 text-white drop-shadow-lg animate-pulse" size={40} />
                </motion.button>
  
                <div className="mt-8 flex items-center justify-center gap-2 text-amber-500 font-mono font-bold text-sm bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    <Timer size={14} /> Opening in {timeLeft}s
                </div>
             </motion.div>
           )}

           {phase === 'opening' && (
             <motion.div key="opening" className="flex flex-col items-center relative">
                 <ExplosionParticles />
                 <motion.div
                    initial={{ scale: 0.8, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-20"
                 >
                     <Package size={160} className="text-white" />
                 </motion.div>
             </motion.div>
           )}

           {phase === 'revealed' && (
             <motion.div
                key="revealed"
                initial={{ scale: 0.5, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className={`
                    relative z-30 p-8 rounded-3xl border shadow-2xl w-full max-w-sm overflow-hidden
                    ${isGood ? 'bg-slate-900 border-amber-500/50 shadow-amber-500/20' : 'bg-slate-900 border-rose-500/50 shadow-rose-500/20'}
                `}
             >
                <div className={`absolute inset-0 blur-3xl opacity-10 ${isGood ? 'bg-amber-500' : 'bg-rose-500'}`} />
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                    className={`absolute -top-[50%] -left-[50%] w-[200%] h-[200%] opacity-5 bg-[conic-gradient(from_0deg,transparent_0deg,white_90deg,transparent_180deg)]`} 
                />

                <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring" }}
                    className={`relative w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 border-4 
                    ${isGood ? 'bg-amber-500 border-white text-white' : 'bg-rose-500 border-slate-900 text-white'}
                    `}
                >
                    {isGood ? <Gift size={40} /> : <AlertTriangle size={40} />}
                </motion.div>

                <h3 className={`relative text-sm font-bold uppercase tracking-widest mb-2 ${isGood ? 'text-amber-400' : 'text-rose-400'}`}>
                    {isGood ? 'Lucky Surprise!' : 'Unexpected Event'}
                </h3>
                
                <h2 className="relative text-2xl font-black text-white mb-4 leading-tight">
                    {eventData.text}
                </h2>

                <div className={`relative text-4xl font-black mb-8 ${isGood ? 'text-emerald-400' : 'text-rose-500'}`}>
                    {isGood ? '+' : ''}₹{Math.abs(eventData.amount)}
                </div>

                <motion.button
                    onClick={onComplete}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative w-full py-4 rounded-xl font-bold text-lg text-slate-900 shadow-lg cursor-pointer
                        ${isGood ? 'bg-amber-400 hover:bg-amber-300' : 'bg-white hover:bg-slate-200'}
                    `}
                >
                    See Level Results <ArrowRight size={18} className="inline ml-1" />
                </motion.button>

             </motion.div>
           )}
        </div>
      </motion.div>
    );
};

const ResultModal = ({ result, onNext, onRetry, isMaxLevel }: any) => {
  const isPass = result.score >= 60 && result.balance >= 0;

  return (
    <motion.div 
      key="result-modal"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className={`absolute top-0 left-0 w-full h-2 ${isPass ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        
        <div className="text-center mb-6">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ring-8 ring-slate-800 ${isPass ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
            {isPass ? <TrendingUp size={48} /> : <TrendingDown size={48} />}
          </div>
          <h2 className="text-3xl font-black text-white mb-2">{isPass ? 'Month Passed!' : 'Budget Failed'}</h2>
          <p className="text-slate-400">{isPass ? 'Level complete! You survived.' : 'You ran out of money or broke rules.'}</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-slate-950 p-4 rounded-xl flex justify-between items-center border border-slate-800">
            <span className="text-slate-400 font-medium">Financial Score</span>
            <span className={`text-2xl font-black ${isPass ? 'text-emerald-400' : 'text-rose-400'}`}>{Math.round(result.score)}/100</span>
          </div>
          
          <div className="bg-slate-950 p-4 rounded-xl text-left max-h-40 overflow-y-auto custom-scrollbar border border-slate-800">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                <ShieldCheck size={14} /> Performance Report
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              {result.feedback.map((f: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                   <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${f.includes('Failed') || f.includes('low') || f.includes('Bankruptcy') ? 'text-rose-500' : 'text-emerald-500'}`} />
                   <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          {!isPass ? (
             <button onClick={onRetry} className="flex-1 py-4 rounded-xl font-bold bg-white text-slate-900 hover:bg-slate-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-white/10 transition-transform active:scale-95">
               <RefreshCcw size={18} /> Retry Level
             </button>
          ) : (
            <button onClick={onNext} className="flex-1 py-4 rounded-xl font-bold bg-emerald-500 text-white hover:bg-emerald-400 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-transform active:scale-95">
               {isMaxLevel ? 'Finish Game' : 'Next Level'} <ArrowRight size={18} />
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const LevelTimeline = ({ currentLevel, maxReached, onSelectLevel }: any) => {
  const levels = Array.from({ length: 15 }, (_, i) => i);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        const activeNode = scrollRef.current.children[currentLevel] as HTMLElement;
        if(activeNode) {
            activeNode.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }
  }, [currentLevel]);

  return (
    <div className="tour-timeline w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60 py-6 px-2 mb-6 sticky top-0 z-40">
      <div 
        ref={scrollRef}
        className="flex items-center gap-6 overflow-x-auto px-10 pb-4 pt-4 scrollbar-hide snap-x no-scrollbar relative max-w-7xl mx-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="absolute top-[50%] left-0 w-full h-1 bg-slate-800 -z-10 translate-y-[-50%] rounded-full opacity-50" />

        {levels.map((lvl, index) => {
          const isLocked = lvl > maxReached;
          const isActive = lvl === currentLevel;
          const isCompleted = lvl < currentLevel;

          return (
            <motion.div
              key={lvl}
              onClick={() => !isLocked && onSelectLevel(lvl)}
              className={`relative flex-shrink-0 snap-center flex flex-col items-center gap-2 cursor-pointer group min-w-[60px]`}
            >
              {isCompleted && index < levels.length - 1 && (
                  <div className="absolute top-[50%] left-[50%] w-[calc(100%+1.5rem)] h-1 bg-emerald-500 -z-0 origin-left translate-y-[-50%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              )}

              <div className="relative">
                 {isActive && (
                    <motion.div
                        layoutId="avatar-walker"
                        className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        <div className="bg-white p-1.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] border-4 border-emerald-500">
                             <User size={16} className="text-emerald-600 fill-emerald-100" />
                        </div>
                        <div className="w-2 h-2 bg-emerald-500 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                    </motion.div>
                 )}

                 <motion.div
                    whileHover={!isLocked ? { scale: 1.1, y: -2 } : {}}
                    className={`
                        relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black border-2 shadow-xl transition-all duration-300
                        ${isActive 
                            ? 'bg-emerald-500 text-white border-white scale-110 shadow-[0_5px_20px_rgba(16,185,129,0.4)] ring-4 ring-emerald-500/20' 
                            : isCompleted
                                ? 'bg-slate-900 text-emerald-500 border-emerald-500'
                                : 'bg-slate-900 text-slate-600 border-slate-700 opacity-60'
                        }
                    `}
                  >
                    {isLocked ? <Lock size={16} /> : (isCompleted ? <CheckCircle2 size={20} /> : lvl + 1)}
                 </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default function FinancialSimulationGame() {
  const [level, setLevel] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [income, setIncome] = useState(2000);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  
  const [gameState, setGameState] = useState<'playing' | 'chest' | 'result'>('playing');
  const [lastResult, setLastResult] = useState<any>(null);
  const [savingsError, setSavingsError] = useState(false);
  const [runTour, setRunTour] = useState(true);

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

  const handleResetGame = () => {
    if (confirm("Are you sure you want to reset your progress?")) {
      setLevel(0);
      setMaxReached(0);
      setGameState('playing');
      setRunTour(true);
    }
  };

  const handleFinishClick = () => {
    const savingsAmount = allocations['savings'] || 0;
    if (savingsAmount <= 0) {
        setSavingsError(true);
        setTimeout(() => setSavingsError(false), 500);
        return;
    }

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

    setGameState('chest');
  };

  const handleTourCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRunTour(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans pb-20 selection:bg-emerald-500/30 relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none fixed" />
      
      <Joyride
        steps={TOUR_STEPS}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        styles={TOUR_STYLES}
        callback={handleTourCallback}
      />

      <LevelTimeline 
        currentLevel={level} 
        maxReached={maxReached} 
        onSelectLevel={(lvl: number) => {
             setLevel(lvl);
             setGameState('playing');
        }} 
      />

      <div className="max-w-6xl mx-auto p-4 space-y-8 relative z-10">
        
        <header className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6 border-b border-slate-800/60">
           <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                 <div className={`p-4 rounded-2xl ${stage.bg} border ${stage.accent} text-white shadow-[0_0_30px_rgba(0,0,0,0.3)]`}>
                    <stage.icon size={32} />
                 </div>
                 <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-1">{stage.label}</h1>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 border border-slate-700 ${stage.color}`}>
                        Level {level + 1}
                    </div>
                 </div>
              </div>
              <p className="text-slate-400 text-base max-w-xl leading-relaxed font-medium">{stage.description}</p>
           </div>
           
           <div className="flex gap-4 items-center w-full md:w-auto">
              <button 
                onClick={handleResetGame}
                className="flex items-center gap-2 px-5 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 font-bold text-sm hover:text-white hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-lg"
                title="Reset Game"
              >
                <RotateCcw size={20} />
              </button>
              
              <div className="tour-income flex-1 md:flex-none text-right bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl group hover:border-slate-700 transition-colors">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1 group-hover:text-emerald-400 transition-colors">Monthly Income</p>
                <p className="text-4xl font-black text-white tracking-tight">₹{income.toLocaleString()}</p>
              </div>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-7 space-y-6">
               
               {Object.keys(stage.fixedExpenses).length > 0 && (
                 <div className="tour-fixed bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 rounded-3xl p-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                       <Lock size={14} /> Fixed Auto-Debits
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                       {Object.entries(stage.fixedExpenses).map(([key, val]) => (
                          <div key={key} className="flex justify-between items-center p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                             <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                <span className="capitalize text-slate-300 font-medium text-sm">{key}</span>
                             </div>
                             <span className="font-mono text-rose-400 font-bold text-sm">-₹{val.toLocaleString()}</span>
                          </div>
                       ))}
                    </div>
                 </div>
               )}

               <div className="tour-sliders bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 w-64 h-64 ${stage.bg} rounded-full blur-[100px] opacity-50 group-hover:opacity-70 transition-opacity`} />
                  
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-8 flex items-center gap-2 relative z-10">
                     <Unlock size={14} /> Allocate Your Budget
                  </h3>
                  
                  <div className="space-y-8 relative z-10">
                    {stage.categories.map((cat) => {
                      const constraint = stage.constraints?.[cat];
                      const minVal = constraint?.min || 0;
                      const currentVal = allocations[cat] || 0;
                      const isError = cat === 'savings' && savingsError;

                      return (
                        <div key={cat} className={`space-y-3 transition-all ${isError ? 'p-4 -m-4 bg-rose-950/20 rounded-2xl border border-rose-500/30' : ''}`}>
                          <div className="flex justify-between text-sm font-medium items-end">
                            <div className="flex flex-col gap-1">
                                <span className="capitalize text-white font-bold text-lg">{cat.replace(/_/g, ' ')}</span>
                                <div className="flex items-center gap-2">
                                    {constraint && (
                                        <div className="flex items-center gap-1 text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800 font-mono">
                                            <Lock size={10} /> MIN: ₹{minVal}
                                        </div>
                                    )}
                                    {isError && (
                                        <span className="text-rose-400 text-xs font-bold animate-pulse flex items-center gap-1">
                                            <AlertTriangle size={12} /> Required!
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className={`font-mono text-xl ${currentVal === minVal && constraint ? 'text-slate-500' : 'text-emerald-400'} font-bold`}>
                                ₹{(currentVal).toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="relative h-4 w-full group/slider">
                            <input
                                type="range"
                                min={minVal}
                                max={income - totalFixed}
                                step="100"
                                value={currentVal}
                                onChange={(e) => handleSliderChange(cat, parseInt(e.target.value))}
                                className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                            />
                            <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                                <motion.div 
                                    className={`h-full ${constraint && currentVal === minVal ? 'bg-slate-700' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'}`}
                                    style={{ width: `${Math.min(100, (currentVal / income) * 100)}%` }}
                                />
                            </div>
                            <div 
                                className="absolute top-1/2 h-6 w-6 bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.5)] -translate-y-1/2 pointer-events-none z-10 border-2 border-slate-200 transition-transform group-hover/slider:scale-110"
                                style={{ left: `calc(${Math.min(100, (currentVal / (income - totalFixed)) * 100)}% - 12px)` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
               </div>
            </div>

            <div className="lg:col-span-5 space-y-6 sticky top-32">
               <div className={`tour-dashboard p-8 rounded-[2.5rem] border-2 transition-all relative overflow-hidden shadow-2xl ${remaining < 0 ? 'bg-rose-950/20 border-rose-500/50' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="relative z-10">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                            <Wallet size={16} /> Disposable Remaining
                        </span>
                        {remaining < 0 && <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">Overdraft</span>}
                      </div>
                      <div className={`text-6xl font-black mb-6 tracking-tight ${remaining < 0 ? 'text-rose-500' : (remaining < 500 ? 'text-amber-400' : 'text-emerald-400')}`}>
                        ₹{remaining.toLocaleString()}
                      </div>
                      
                      <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                              <span>Budget Usage</span>
                              <span>{Math.min(100, Math.round(((income - remaining) / income) * 100))}%</span>
                          </div>
                          <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                            <motion.div 
                              initial={{ width: '100%' }}
                              animate={{ width: `${Math.max(0, (remaining / income) * 100)}%` }}
                              className={`h-full ${remaining < 0 ? 'bg-rose-500' : (remaining < 500 ? 'bg-amber-400' : 'bg-emerald-500')}`} 
                            />
                          </div>
                      </div>
                  </div>
               </div>

               <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                        <HeartPulse size={20} /> 
                     </div>
                     <span className="font-bold text-white">Financial Health</span>
                  </div>
                  <ul className="space-y-4">
                     <li className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/50">
                        <span className="text-sm text-slate-400 font-medium">Savings Rate</span>
                        <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold ${((allocations['savings']||0)/income) >= (stage.rules.minSavings||0) ? "text-emerald-400" : "text-amber-400"}`}>
                                {Math.round(((allocations['savings']||0)/income)*100)}%
                            </span>
                            {(allocations['savings']||0)/income >= (stage.rules.minSavings || 0.1) 
                                ? <CheckCircle2 size={16} className="text-emerald-500" /> 
                                : <div className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">Target: {((stage.rules.minSavings||0)*100)}%</div>
                            }
                        </div>
                     </li>
                     <li className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/50">
                        <span className="text-sm text-slate-400 font-medium">Essentials Met</span>
                         <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                             <CheckCircle2 size={16} /> Covered
                         </div>
                     </li>
                  </ul>
               </div>

               <motion.button
                  className={`tour-finish w-full py-6 rounded-2xl font-black text-xl shadow-xl flex items-center justify-center gap-3 transition-all relative overflow-hidden group
                    ${savingsError 
                        ? 'bg-rose-500 text-white' 
                        : 'bg-white text-slate-950 hover:bg-slate-200'
                    } disabled:opacity-50 disabled:grayscale cursor-pointer`}
                  onClick={handleFinishClick}
                  disabled={remaining < 0}
                  animate={savingsError ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }} 
                  whileTap={{ scale: 0.98 }}
               >
                  {savingsError ? (
                      <span className="flex items-center gap-2"><AlertTriangle size={24} /> Save at least ₹1 !</span>
                  ) : (
                      <>
                        <span className="relative z-10">Finish Month</span> 
                        <div className="p-1 bg-slate-900 rounded-full text-white group-hover:translate-x-1 transition-transform">
                             <ChevronRight size={20} />
                        </div>
                      </>
                  )}
               </motion.button>

            </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'chest' && lastResult && (
             <ChestModal 
                key="chest-modal"
                eventData={lastResult.event} 
                onComplete={() => setGameState('result')} 
             />
        )}
        
        {gameState === 'result' && lastResult && (
          <ResultModal 
            key="result-modal"
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