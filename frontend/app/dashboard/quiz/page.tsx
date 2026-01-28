"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Trophy,
  Clock,
  BrainCircuit,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  ChevronRight,
  X,
  Check,
  Zap,
  Flame,
  Star,
  Info,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

type QuizResult = {
  date: string;
  category: string;
  score: number;
  correct: number;
  total: number;
};

type UserProgress = {
  xp: number;
  level: number;
  history: QuizResult[];
};

type AnswerRecord = {
  question: string;
  options: string[];
  selected: number;
  correct: number;
};

const INITIAL_PROGRESS: UserProgress = {
  xp: 0,
  level: 1,
  history: []
};

const XP_PER_LEVEL_BASE = 1500;

const getLevelInfo = (xp: number, level: number) => {
  const currentLevelThreshold = (level - 1) * XP_PER_LEVEL_BASE;
  const nextLevelThreshold = level * XP_PER_LEVEL_BASE;
  const xpNeeded = nextLevelThreshold - xp;
  
  const xpInCurrentLevel = xp - currentLevelThreshold;
  const levelRange = nextLevelThreshold - currentLevelThreshold;
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / levelRange) * 100));
  
  return { nextLevelThreshold, xpNeeded, progressPercent };
};

const categories = [
  {
    id: "budgeting",
    title: "Budgeting & Saving",
    description: "Master the 50/30/20 rule, debt management, and smart saving strategies.",
    icon: DollarSign,
    color: "from-emerald-500 to-teal-600",
    accent: "text-emerald-400",
    bg: "bg-emerald-500/10",
    questions: [
      { q: "What does the 50/30/20 rule recommend for 'Needs'?", options: ["20% of income", "30% of income", "50% of income", "10% of income"], correct: 2 },
      { q: "Which debt payoff method targets the lowest balance first?", options: ["Debt Avalanche", "Debt Snowball", "Debt Consolidation", "Bankruptcy"], correct: 1 },
      { q: "What is an 'Emergency Fund' typically used for?", options: ["Vacations", "Down payment", "Unexpected expenses", "Investing"], correct: 2 },
      { q: "Which of these improves your Credit Score?", options: ["Missing payments", "High credit utilization", "Paying on time", "Closing old accounts"], correct: 2 },
      { q: "What is 'Compound Interest'?", options: ["Interest on principal only", "Interest on interest", "A bank fee", "Inflation rate"], correct: 1 },
      { q: "In the 50/30/20 rule, what does the '20' represent?", options: ["Savings & Debt", "Wants", "Needs", "Taxes"], correct: 0 },
      { q: "What is a common recommendation for Emergency Fund size?", options: ["1 month expenses", "3-6 months expenses", "1 year salary", "$1000"], correct: 1 },
      { q: "Which expense is a 'Fixed Expense'?", options: ["Groceries", "Entertainment", "Rent/Mortgage", "Dining out"], correct: 2 },
      { q: "What is 'Pay Yourself First'?", options: ["Buy wants before needs", "Save before spending", "Pay debts last", "Wait for tax refund"], correct: 1 },
      { q: "Which is a liability?", options: ["Stocks", "Real Estate", "Credit Card Debt", "Savings Account"], correct: 2 }
    ]
  },
  {
    id: "investing",
    title: "Stock Market & ETFs",
    description: "Bulls, Bears, Mutual Funds, and long-term wealth building.",
    icon: TrendingUp,
    color: "from-violet-500 to-purple-700",
    accent: "text-violet-400",
    bg: "bg-violet-500/10",
    questions: [
      { q: "What is an ETF?", options: ["Electronic Trade Fund", "Exchange Traded Fund", "Equity Transfer Fund", "Estimated Tax Form"], correct: 1 },
      { q: "A market characterized by rising prices is called a...", options: ["Bear Market", "Bull Market", "Stag Market", "Lion Market"], correct: 1 },
      { q: "What does 'Diversification' mean?", options: ["Buying one strong stock", "Spreading investments", "Day trading", "Holding cash only"], correct: 1 },
      { q: "What is a 'Dividend'?", options: ["A tax fee", "Profit share paid to shareholders", "Stock price increase", "Broker commission"], correct: 1 },
      { q: "Which generally has higher risk but higher potential return?", options: ["Government Bonds", "Savings Account", "Stocks", "CDs"], correct: 2 },
      { q: "What is the 'S&P 500'?", options: ["500 largest US companies", "500 banks", "A crypto token", "A government agency"], correct: 0 },
      { q: "What is a Mutual Fund?", options: ["A private loan", "Pooled money managed by pros", "A single stock", "An insurance policy"], correct: 1 },
      { q: "What does 'IPO' stand for?", options: ["Initial Public Offering", "Internal Profit Option", "International Price Org", "Invest Publicly Only"], correct: 0 },
      { q: "Which metric compares share price to earnings?", options: ["ROI", "P/E Ratio", "Market Cap", "Yield"], correct: 1 },
      { q: "What is 'Market Cap'?", options: ["Total company value", "Stock price", "Number of employees", "Yearly revenue"], correct: 0 }
    ]
  },
  {
    id: "risk",
    title: "Risk & Security",
    description: "Insurance, FDs, Inflation, and protecting your assets.",
    icon: ShieldAlert,
    color: "from-orange-400 to-red-600",
    accent: "text-orange-400",
    bg: "bg-orange-500/10",
    questions: [
      { q: "Which investment is generally considered the safest?", options: ["Crypto", "Penny Stocks", "Government Bonds", "Startups"], correct: 2 },
      { q: "What is 'Inflation'?", options: ["Rising purchasing power", "Rising prices of goods", "Stock market crash", "Lower taxes"], correct: 1 },
      { q: "FDIC insurance protects bank deposits up to...", options: ["$50,000", "$100,000", "$250,000", "$1,000,000"], correct: 2 },
      { q: "What is a 'Premium' in insurance?", options: ["The payout", "The amount you pay for coverage", "A bonus", "The deductible"], correct: 1 },
      { q: "High risk usually correlates with...", options: ["Low Return", "High Return", "No Return", "Fixed Return"], correct: 1 },
      { q: "What is a 'Deductible'?", options: ["Amount paid before insurance kicks in", "Monthly fee", "Tax refund", "Policy limit"], correct: 0 },
      { q: "Which asset is most liquid?", options: ["Real Estate", "Cash", "Art", "Private Equity"], correct: 1 },
      { q: "What protects you against financial loss from illness?", options: ["Life Insurance", "Health Insurance", "Car Insurance", "Home Insurance"], correct: 1 },
      { q: "What is 'Term Life Insurance'?", options: ["Coverage for whole life", "Coverage for a set period", "Investment vehicle", "Retirement plan"], correct: 1 },
      { q: "Ponzi schemes are an example of...", options: ["Smart investing", "Investment Fraud", "Mutual Funds", "Government Bonds"], correct: 1 }
    ]
  }
];

export default function QuizFeature() {
  const [userProgress, setUserProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [gameState, setGameState] = useState<"menu" | "playing" | "result">("menu");
  
  const [activeCategory, setActiveCategory] = useState<any>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timer, setTimer] = useState(15);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameStreak, setGameStreak] = useState(0);
  const [isRapidFire, setIsRapidFire] = useState(false);
  const [hasLeveledUp, setHasLeveledUp] = useState(false);
  const [showXpInfo, setShowXpInfo] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  const [reviewData, setReviewData] = useState<AnswerRecord[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("fingenius_progress_v2");
    if (saved) {
      try {
        setUserProgress(JSON.parse(saved));
      } catch (e) { console.error(e); }
    }
  }, []);

  const saveProgress = (newProgress: UserProgress) => {
    setUserProgress(newProgress);
    localStorage.setItem("fingenius_progress_v2", JSON.stringify(newProgress));
  };

  useEffect(() => {
    let interval: any;
    if (gameState === "playing" && timer > 0 && !isAnswered && !showExitConfirm) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0 && !isAnswered) {
      handleAnswer(-1); 
    }
    return () => clearInterval(interval);
  }, [gameState, timer, isAnswered, showExitConfirm]);

  const startQuiz = (category: any) => {
    setActiveCategory(category);
    setIsRapidFire(false);
    setGameState("playing");
    resetGame();
  };

  const startRapidFire = () => {
    const allQuestions = categories.flatMap(cat => cat.questions);
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    const rapidCategory = {
      id: "rapid-fire",
      title: "Rapid Fire",
      description: "5 random questions. Double XP!",
      icon: Flame,
      color: "from-red-500 to-orange-600",
      accent: "text-red-400",
      bg: "bg-red-500/10",
      questions: selected
    };

    setActiveCategory(rapidCategory);
    setIsRapidFire(true);
    setGameState("playing");
    resetGame();
  };

  const resetGame = () => {
    setCurrentQIndex(0);
    setSessionScore(0);
    setCorrectCount(0);
    setTimer(isRapidFire ? 10 : 15);
    setGameStreak(0);
    setIsAnswered(false);
    setSelectedOption(null);
    setHasLeveledUp(false);
    setShowExitConfirm(false);
    setReviewData([]); 
  };

  const handleAnswer = (index: number) => {
    setSelectedOption(index);
    setIsAnswered(true);

    const questionObj = activeCategory.questions[currentQIndex];
    const isCorrect = index === questionObj.correct;

    setReviewData(prev => [...prev, {
        question: questionObj.q,
        options: questionObj.options,
        correct: questionObj.correct,
        selected: index
    }]);

    if (isCorrect) {
      const basePoints = 50;
      const timeBonus = timer * 2; 
      const streakBonus = gameStreak * 5; 
      const multiplier = isRapidFire ? 2 : 1;
      
      const totalPoints = (basePoints + timeBonus + streakBonus) * multiplier;
      
      setSessionScore((prev) => prev + totalPoints);
      setCorrectCount((prev) => prev + 1);
      setGameStreak((prev) => prev + 1);
      
      confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 }, colors: ['#10B981', '#34D399'] });
    } else {
      setGameStreak(0); 
    }

    setTimeout(() => {
      if (currentQIndex < activeCategory.questions.length - 1) {
        setCurrentQIndex((prev) => prev + 1);
        setTimer(isRapidFire ? 10 : 15); 
        setIsAnswered(false);
        setSelectedOption(null);
      } else {
        finishQuiz();
      }
    }, 1500); 
  };

  const finishQuiz = () => {
    let newXp = userProgress.xp + sessionScore;
    let newLevel = userProgress.level;
    const nextLevelThreshold = newLevel * XP_PER_LEVEL_BASE;

    if (newXp >= nextLevelThreshold) {
        newLevel++;
        setHasLeveledUp(true);
        confetti({ particleCount: 100, spread: 360, origin: { y: 0.5 } });
    }

    const result: QuizResult = {
        date: new Date().toLocaleDateString(),
        category: activeCategory.title,
        score: sessionScore,
        correct: correctCount,
        total: activeCategory.questions.length
    };

    const newProgress: UserProgress = {
        xp: newXp,
        level: newLevel,
        history: [result, ...userProgress.history].slice(0, 10)
    };
    saveProgress(newProgress);

    setGameState("result");
    if (!hasLeveledUp) {
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (gameState === "menu") {
    const { xpNeeded, progressPercent, nextLevelThreshold } = getLevelInfo(userProgress.xp, userProgress.level);

    return (
      <div className="min-h-full w-full bg-slate-950 text-slate-50 relative overflow-hidden p-6 font-sans">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto space-y-12 relative z-10">
          <AnimatePresence>
            {showXpInfo && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute top-24 right-6 z-50 w-80 bg-slate-900 text-slate-200 rounded-2xl shadow-2xl border border-slate-700 p-6 backdrop-blur-xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                    <Star className="text-amber-400" size={18} fill="currentColor" /> XP System
                  </h3>
                  <button onClick={() => setShowXpInfo(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
                </div>
                
                <div className="space-y-4 text-sm text-slate-400">
                  <div className="flex justify-between"><span>Correct Answer</span><span className="font-bold text-emerald-400">+50 XP</span></div>
                  <div className="flex justify-between"><span>Speed Bonus</span><span className="font-bold text-cyan-400">Up to +30 XP</span></div>
                  <div className="flex justify-between"><span>Streak Bonus</span><span className="font-bold text-orange-400">+5 XP per streak</span></div>
                  <div className="h-px bg-slate-800 my-2" />
                  <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                    <p className="font-bold mb-2 text-white flex justify-between">
                        <span>Level {userProgress.level + 1} Progress</span>
                        <span className="text-slate-400 font-normal">{progressPercent.toFixed(0)}%</span>
                    </p>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mb-1 ring-1 ring-slate-700">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <p className="text-xs text-slate-500 text-right mt-1">{userProgress.xp} / {nextLevelThreshold} XP</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-800 pb-8">
            <motion.div variants={itemVariants}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
                    <BrainCircuit size={14} /> Knowledge Hub
                </div>
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight mb-2">
                    Quiz Arena
                </h1>
                <p className="text-slate-400 text-lg font-medium max-w-lg">
                    Test your financial literacy, earn XP, and climb the ranks of the master investors.
                </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex gap-4">
                <button 
                    onClick={() => setShowXpInfo(!showXpInfo)}
                    className="relative group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/30 transition-all duration-300 rounded-2xl p-1 pr-6 flex items-center gap-4 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 group-hover:border-amber-500/50 transition-colors">
                        <Star className="text-amber-400" fill="currentColor" size={24} />
                    </div>
                    <div className="text-left">
                        <p className="text-xs font-bold text-amber-500/80 uppercase tracking-wider">Level {userProgress.level}</p>
                        <p className="font-bold text-white text-xl font-mono">{userProgress.xp.toLocaleString()} XP</p>
                    </div>
                </button>
            </motion.div>
          </div>

          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startQuiz(cat)}
                className="group cursor-pointer bg-slate-900/60 backdrop-blur-md rounded-[2rem] p-8 border border-slate-800 relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-900/20 hover:border-slate-700"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <div className={`absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0`}>
                    <ArrowRight className="text-slate-500 group-hover:text-white" />
                </div>
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-6 shadow-lg shadow-black/40 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ring-1 ring-white/20`}>
                    <cat.icon size={28} />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
                      {cat.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">
                      {cat.description}
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs font-bold text-slate-300 group-hover:border-slate-600 transition-colors">
                        <Zap size={12} className="text-amber-400 fill-amber-400" /> 10 Qs
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-bold ${cat.accent} opacity-60 group-hover:opacity-100 transition-opacity`}>
                        +500 XP Max
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            variants={itemVariants} 
            className="relative rounded-[2.5rem] bg-gradient-to-r from-red-900/40 to-orange-900/40 p-1 overflow-hidden border border-red-500/30 group"
          >
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl rounded-[2.4rem]"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-red-600/20 blur-[100px] rounded-full group-hover:bg-red-500/30 transition-colors duration-700"></div>
            
            <div className="relative z-10 p-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-8">
                <div className="relative">
                    <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 animate-pulse"></div>
                    <div className="relative p-5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-xl">
                        <Flame size={40} className="text-red-500" />
                    </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-wider animate-pulse">Limited Time</span>
                  </div>
                  <h3 className="text-3xl font-black mb-2 tracking-tight text-white">Rapid Fire Challenge</h3>
                  <p className="text-slate-400 max-w-md font-medium">
                      5 random questions. Double XP enabled. Test your market reflexes before the timer runs out.
                  </p>
                </div>
              </div>
              
              <motion.button 
                onClick={startRapidFire} 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-red-900/50 hover:shadow-orange-500/20 transition-all flex items-center gap-3 text-lg border-t border-white/20"
              >
                Start Challenge <ArrowRight size={20} />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (gameState === "playing") {
    const question = activeCategory.questions[currentQIndex];

    return (
      <div className="min-h-full flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-50 relative overflow-hidden font-sans">
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20`}></div>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r ${activeCategory.color} opacity-10 blur-[120px] rounded-full`}></div>
        </div>

        <AnimatePresence>
          {showExitConfirm && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl border border-slate-700 max-w-sm w-full text-center"
              >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 text-red-500">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Abandon Quiz?</h3>
                <p className="text-slate-400 mb-8">You will lose all progress and XP earned in this session.</p>
                <div className="flex gap-4">
                  <button onClick={() => setShowExitConfirm(false)} className="flex-1 py-3 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors">Cancel</button>
                  <button onClick={() => setGameState("menu")} className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-900/30">Quit</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-20 w-full max-w-4xl flex flex-col gap-8">
           {/* Top Bar */}
           <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl flex justify-between items-center shadow-lg">
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${activeCategory.color} text-white shadow-inner`}>
                    {isRapidFire ? <Flame size={20} /> : <activeCategory.icon size={20} />}
                  </div>
                  <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</p>
                      <p className="font-bold text-sm text-slate-200">{activeCategory.title}</p>
                  </div>
               </div>

               <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2">
                   <div className={`text-2xl font-mono font-black tabular-nums transition-colors ${timer < 5 ? "text-red-500 scale-110" : "text-white"}`}>
                       00:{timer.toString().padStart(2, '0')}
                   </div>
                   <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Time Remaining</div>
               </div>

               <button onClick={() => setShowExitConfirm(true)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
               </button>
           </div>

           {/* Progress */}
           <div className="flex gap-1.5 w-full">
              {activeCategory.questions.map((_: any, idx: number) => (
                  <div key={idx} className="h-1 flex-1 rounded-full bg-slate-800 overflow-hidden">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: idx < currentQIndex ? "100%" : idx === currentQIndex ? "100%" : "0%" }}
                        className={`h-full ${idx === currentQIndex ? "bg-white animate-pulse" : `bg-gradient-to-r ${activeCategory.color}`}`}
                      />
                  </div>
              ))}
           </div>

           {/* Question Card */}
           <AnimatePresence mode="wait">
            <motion.div
                key={currentQIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-8"
            >
                <div className="py-4 text-center">
                   <h2 className="text-3xl md:text-4xl font-bold leading-tight text-white drop-shadow-lg">
                     {question.q}
                   </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {question.options.map((option: string, idx: number) => {
                    const isSelected = idx === selectedOption;
                    const showCorrect = isAnswered && idx === question.correct;
                    const showWrong = isAnswered && isSelected && idx !== question.correct;
                    const dim = isAnswered && !showCorrect && !showWrong;
                    
                    let borderColor = "border-slate-800";
                    let bgColor = "bg-slate-900/40";
                    let textColor = "text-slate-300";
                    let glow = "";

                    if (showCorrect) {
                        borderColor = "border-emerald-500";
                        bgColor = "bg-emerald-500/10";
                        textColor = "text-emerald-400";
                        glow = "shadow-[0_0_30px_rgba(16,185,129,0.1)]";
                    } else if (showWrong) {
                        borderColor = "border-red-500";
                        bgColor = "bg-red-500/10";
                        textColor = "text-red-400";
                    } else if (dim) {
                        bgColor = "bg-slate-900/20";
                        textColor = "text-slate-600";
                        borderColor = "border-slate-800/50";
                    } else if (isSelected) {
                        borderColor = "border-white/50";
                        textColor = "text-white";
                    }

                    return (
                      <motion.button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => handleAnswer(idx)}
                        whileHover={!isAnswered ? { scale: 1.02, backgroundColor: "rgba(30, 41, 59, 0.8)" } : {}}
                        whileTap={!isAnswered ? { scale: 0.98 } : {}}
                        className={`relative w-full p-6 rounded-2xl border-2 text-left transition-all duration-200 flex justify-between items-center backdrop-blur-sm ${borderColor} ${bgColor} ${textColor} ${glow}`}
                      >
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold border transition-colors shrink-0 ${showCorrect ? "bg-emerald-500 text-white border-emerald-500" : showWrong ? "bg-red-500 text-white border-red-500" : "border-slate-700 bg-slate-800 text-slate-400"}`}>
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <span className="text-lg font-semibold">{option}</span>
                        </div>
                        {showCorrect && <div className="p-1 bg-emerald-500 rounded-full"><Check className="text-white" size={16} /></div>}
                        {showWrong && <div className="p-1 bg-red-500 rounded-full"><X className="text-white" size={16} /></div>}
                      </motion.button>
                    );
                  })}
                </div>
            </motion.div>
           </AnimatePresence>
        </div>
      </div>
    );
  }

  if (gameState === "result") {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-slate-950 text-white relative overflow-hidden font-sans p-6">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="bg-slate-900/80 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] border border-slate-700 shadow-2xl w-full max-w-3xl relative z-10"
        >
          {hasLeveledUp && (
             <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute -top-6 left-0 right-0 flex justify-center">
                <div className="px-8 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-sm rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(251,191,36,0.5)] animate-bounce border border-white/20">
                    Level Up!
                </div>
             </motion.div>
          )}

          <div className="text-center mb-8">
            <div className="inline-block relative">
                <div className="absolute inset-0 bg-amber-500/30 blur-2xl rounded-full"></div>
                <div className="relative w-32 h-32 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center border-4 border-slate-800 shadow-xl mb-6 mx-auto">
                    <Trophy size={64} className="text-amber-400 drop-shadow-md" />
                </div>
            </div>
            
            <h2 className="text-5xl font-black mb-3 text-white tracking-tight">Quiz Complete!</h2>
            <p className="text-slate-400 text-lg">
                {sessionScore > 0 ? "Outstanding performance investor." : "Keep learning to master the market."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/5"></div>
              <div className="text-xs text-emerald-500 font-bold uppercase tracking-widest mb-2 relative z-10">XP Earned</div>
              <div className="text-5xl font-black text-white relative z-10">+{sessionScore}</div>
            </div>
            <div className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5"></div>
                <div className="text-xs text-blue-500 font-bold uppercase tracking-widest mb-2 relative z-10">Accuracy</div>
              <div className="text-5xl font-black text-white relative z-10">{correctCount} <span className="text-2xl text-slate-600 font-medium">/ {activeCategory.questions.length}</span></div>
            </div>
          </div>

          <div className="mb-8 bg-slate-950/50 rounded-2xl border border-slate-800 overflow-hidden">
             <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex items-center gap-2">
                 <BrainCircuit size={16} className="text-slate-400" />
                 <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Session Review</span>
             </div>
             <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                 {reviewData.map((item, i) => {
                     const isCorrect = item.selected === item.correct;
                     return (
                         <div key={i} className="p-4 border-b border-slate-800/50 last:border-0 hover:bg-slate-900/30 rounded-lg transition-colors">
                             <div className="flex items-start gap-4">
                                 <div className={`mt-1 p-1 rounded-full ${isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                                     {isCorrect ? <Check size={14} /> : <X size={14} />}
                                 </div>
                                 <div className="flex-1">
                                     <p className="text-sm font-semibold text-slate-200 mb-1">{item.question}</p>
                                     <div className="flex flex-col gap-1 text-xs">
                                        {!isCorrect && <span className="text-red-400">You picked: {item.options[item.selected] || "Time out"}</span>}
                                        <span className="text-emerald-400">Correct: {item.options[item.correct]}</span>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     );
                 })}
             </div>
          </div>

          <button onClick={() => setGameState("menu")} className="w-full bg-white text-slate-950 hover:bg-slate-200 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-white/10 transition-all transform hover:scale-[1.01] active:scale-95">
            Claim Rewards & Continue
          </button>
        </motion.div>
      </div>
    );
  }
  return null;
}