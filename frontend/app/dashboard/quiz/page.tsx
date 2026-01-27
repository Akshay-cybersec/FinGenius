"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Trophy, Clock, BrainCircuit, TrendingUp, DollarSign, 
  ShieldAlert, ChevronRight, X, Check, Zap, Flame, Star, Info, AlertTriangle, ArrowRight
} from "lucide-react";

// --- Types ---
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

// --- Constants & Helpers ---
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

// --- Mock Data ---
const categories = [
  {
    id: "budgeting",
    title: "Budgeting & Saving",
    description: "Master the 50/30/20 rule, debt management, and smart saving strategies.",
    icon: DollarSign,
    color: "from-emerald-400 to-teal-600",
    shadow: "shadow-emerald-500/40",
    border: "border-emerald-500/20",
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
    shadow: "shadow-violet-500/40",
    border: "border-violet-500/20",
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
    shadow: "shadow-orange-500/40",
    border: "border-orange-500/20",
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
  // --- Game State ---
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

  // --- Load User Data ---
  useEffect(() => {
    const saved = localStorage.getItem("fingenius_progress_v2");
    if (saved) {
      try {
        setUserProgress(JSON.parse(saved));
      } catch (e) { console.error(e); }
    }
  }, []);

  // --- Save User Data ---
  const saveProgress = (newProgress: UserProgress) => {
    setUserProgress(newProgress);
    localStorage.setItem("fingenius_progress_v2", JSON.stringify(newProgress));
  };

  // --- Timer Logic ---
  useEffect(() => {
    let interval: any;
    if (gameState === "playing" && timer > 0 && !isAnswered && !showExitConfirm) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0 && !isAnswered) {
      handleAnswer(-1); 
    }
    return () => clearInterval(interval);
  }, [gameState, timer, isAnswered, showExitConfirm]);

  // --- Game Logic ---
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
      shadow: "shadow-orange-500/40",
      border: "border-orange-500/20",
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

  // --- Framer Motion Variants ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const optionVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  if (gameState === "menu") {
    const { xpNeeded, progressPercent, nextLevelThreshold } = getLevelInfo(userProgress.xp, userProgress.level);

    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto space-y-10 p-6 relative">
        {/* XP INFO MODAL */}
        <AnimatePresence>
          {showXpInfo && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute top-24 right-6 z-50 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Star className="text-yellow-500" size={18} fill="currentColor" /> XP System
                </h3>
                <button onClick={() => setShowXpInfo(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={18} /></button>
              </div>
              
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex justify-between"><span>Correct Answer</span><span className="font-bold text-green-600 dark:text-green-500">+50 XP</span></div>
                <div className="flex justify-between"><span>Speed Bonus</span><span className="font-bold text-blue-600 dark:text-blue-500">Up to +30 XP</span></div>
                <div className="flex justify-between"><span>Streak Bonus</span><span className="font-bold text-orange-500">+5 XP per streak</span></div>
                <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  <p className="font-bold mb-1 text-slate-800 dark:text-white">Next Level ({userProgress.level + 1})</p>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-primary" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{userProgress.xp} / {nextLevelThreshold} XP</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <motion.div variants={itemVariants}>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 tracking-tight mb-2">
              Quiz Arena
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Prove your financial literacy.</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex gap-4">
             {/* Level Badge */}
             <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden group hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setShowXpInfo(!showXpInfo)}>
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-purple-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-yellow-500 dark:text-yellow-400 shadow-inner"><Star size={24} fill="currentColor" /></div>
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Level {userProgress.level}</p>
                  <p className="font-bold text-slate-900 dark:text-white text-lg">{userProgress.xp} XP</p>
                </div>
                <Info size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors ml-2" />
             </div>
          </motion.div>
        </div>

        {/* CATEGORIES */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startQuiz(cat)}
              className={`group cursor-pointer bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden transition-all duration-300 ${cat.shadow} hover:border-transparent`}
            >
              {/* Animated Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <cat.icon size={32} />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{cat.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed font-medium">{cat.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <Zap size={14} className="text-yellow-500 dark:text-yellow-400 fill-yellow-500 dark:fill-yellow-400" /> 10 Questions
                  </span>
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-900 text-slate-600 dark:text-white transition-all duration-300">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* RAPID FIRE CARD */}
        <motion.div 
          variants={itemVariants} 
          className="relative rounded-[2rem] bg-gradient-to-r from-indigo-600 to-slate-800 dark:from-slate-900 dark:to-slate-950 p-10 text-white overflow-hidden shadow-2xl shadow-indigo-500/20 border border-indigo-500/20 group"
        >
          {/* Animated Background Mesh */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/30 transition-colors duration-700" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <div className="p-5 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 shadow-xl">
                 <BrainCircuit size={48} className="text-indigo-300 dark:text-indigo-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/30 dark:bg-indigo-500/20 text-indigo-100 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-400/30 dark:border-indigo-500/30">Daily Event</span>
                </div>
                <h3 className="text-3xl font-black mb-2 tracking-tight">Rapid Fire Challenge</h3>
                <p className="text-indigo-100 dark:text-slate-400 max-w-lg font-medium text-lg">Double XP enabled! Test your reflexes with 5 random market scenario questions.</p>
              </div>
            </div>
            
            <motion.button 
              onClick={startRapidFire} 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              className="bg-white text-indigo-900 dark:text-slate-900 px-10 py-5 rounded-2xl font-bold shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] transition-all flex items-center gap-3 text-lg"
            >
              Start Challenge <ArrowRight size={20} />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // ================= RENDER: PLAYING SCREEN =================
  if (gameState === "playing") {
    const question = activeCategory.questions[currentQIndex];

    return (
      <div className="min-h-[80vh] flex flex-col max-w-5xl mx-auto py-4 px-4 relative justify-center">
        {/* BACKGROUND AMBIENCE */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-20 left-10 w-96 h-96 bg-gradient-to-br ${activeCategory.color} opacity-10 dark:opacity-20 blur-[150px] rounded-full animate-pulse`} />
            <div className={`absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-tr ${activeCategory.color} opacity-5 dark:opacity-10 blur-[100px] rounded-full`} />
        </div>

        {/* EXIT CONFIRMATION */}
        <AnimatePresence>
          {showExitConfirm && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm rounded-3xl"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-sm w-full text-center"
              >
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Quit Quiz?</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8">You will lose all progress for this session.</p>
                <div className="flex gap-4">
                  <button onClick={() => setShowExitConfirm(false)} className="flex-1 py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                  <button onClick={() => setGameState("menu")} className="flex-1 py-3 rounded-xl font-bold bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-500 transition-colors">Quit</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD / HEADER */}
        <div className="relative z-20 flex flex-col gap-6 mb-4">
           {/* SEGMENTED PROGRESS BAR */}
           <div className="flex gap-2 w-full">
              {activeCategory.questions.map((_: any, idx: number) => (
                  <div key={idx} className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: idx < currentQIndex ? "100%" : idx === currentQIndex ? "50%" : "0%" }}
                        className={`h-full bg-gradient-to-r ${activeCategory.color}`}
                      />
                  </div>
              ))}
           </div>

           <div className="flex justify-between items-center">
               {/* CATEGORY BADGE */}
               <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300">
                  {isRapidFire ? <Flame className="text-orange-500" size={18} /> : <activeCategory.icon className="text-primary" size={18} />}
                  <span className="font-bold text-sm tracking-wide">{activeCategory.title}</span>
               </div>

               {/* TIMER BADGE */}
               <div className={`flex items-center gap-3 px-5 py-2.5 rounded-xl font-mono font-bold text-xl shadow-lg transition-colors ${timer < 5 ? "bg-red-100 dark:bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse" : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"}`}>
                  <Clock size={20} />
                  <span>{timer}s</span>
               </div>

               <button onClick={() => setShowExitConfirm(true)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <X size={24} />
               </button>
           </div>
        </div>

        {/* QUESTION CARD */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex-1 relative z-10 flex flex-col justify-center"
          >
            {/* Question Text - COMPACT SIZE */}
            <div className="mb-8 px-4 text-center">
               <motion.h2 
                 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                 className="text-2xl md:text-4xl font-black text-slate-800 dark:text-white leading-tight drop-shadow-sm dark:drop-shadow-lg"
               >
                 {question.q}
               </motion.h2>
            </div>

            {/* Options Grid - CHANGED TO 2 COLUMNS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              {question.options.map((option: string, idx: number) => {
                const isSelected = idx === selectedOption;
                const showCorrect = isAnswered && idx === question.correct;
                const showWrong = isAnswered && isSelected && idx !== question.correct;
                
                let borderColor = "border-slate-200 dark:border-slate-700";
                let bgColor = "bg-white/50 dark:bg-slate-800/50";
                let textColor = "text-slate-700 dark:text-slate-300";
                let shadow = "";

                if (showCorrect) {
                    borderColor = "border-emerald-500";
                    bgColor = "bg-emerald-50 dark:bg-emerald-500/20";
                    textColor = "text-emerald-600 dark:text-emerald-400";
                    shadow = "shadow-[0_0_30px_rgba(16,185,129,0.2)] dark:shadow-[0_0_30px_rgba(16,185,129,0.3)]";
                } else if (showWrong) {
                    borderColor = "border-red-500";
                    bgColor = "bg-red-50 dark:bg-red-500/20";
                    textColor = "text-red-600 dark:text-red-400";
                } else if (!isAnswered) {
                    // Hover state handled by group-hover
                }

                return (
                  <motion.button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleAnswer(idx)}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={idx}
                    whileHover={!isAnswered ? { scale: 1.02, backgroundColor: "rgba(241, 245, 249, 0.9)" } : {}}
                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                    className={`group relative w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex justify-between items-center backdrop-blur-sm ${borderColor} ${bgColor} ${shadow}`}
                  >
                    <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border transition-colors shrink-0 ${showCorrect ? "bg-emerald-500 text-white border-emerald-500" : showWrong ? "bg-red-500 text-white border-red-500" : "border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 group-hover:border-slate-900 dark:group-hover:border-white group-hover:text-slate-900 dark:group-hover:text-white"}`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className={`text-lg font-semibold transition-colors ${textColor} group-hover:text-slate-900 dark:group-hover:text-white`}>{option}</span>
                    </div>
                    
                    {showCorrect && <Check className="text-emerald-500 dark:text-emerald-400" size={20} />}
                    {showWrong && <X className="text-red-500 dark:text-red-400" size={20} />}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ================= RENDER: RESULT SCREEN =================
  if (gameState === "result") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center max-w-2xl mx-auto py-12 px-4 text-center relative z-10">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-10 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-2xl w-full"
        >
          {hasLeveledUp && (
             <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute -top-6 left-0 right-0 flex justify-center">
                <div className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black text-sm rounded-full uppercase tracking-widest shadow-lg animate-bounce">
                    Level Up!
                </div>
             </motion.div>
          )}

          <div className="w-28 h-28 mx-auto bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-full flex items-center justify-center mb-8 border border-slate-200 dark:border-slate-700 shadow-inner">
            <Trophy size={56} className="text-yellow-500 dark:text-yellow-400 drop-shadow-md" />
          </div>
          
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Quiz Complete!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg">
            {isRapidFire ? "Reflexes sharp as ever." : "Financial literacy level increasing."}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/50">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">XP Earned</div>
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-500">+{sessionScore}</div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/50">
               <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Accuracy</div>
              <div className="text-4xl font-black text-slate-900 dark:text-white">{correctCount} <span className="text-xl text-slate-400 dark:text-slate-600 font-medium">/ {activeCategory.questions.length}</span></div>
            </div>
          </div>

          <div className="mb-8 text-left bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl p-2 max-h-64 overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-700/50">
             {reviewData.map((item, i) => {
                 const isCorrect = item.selected === item.correct;
                 return (
                     <div key={i} className="p-4 border-b border-slate-200 dark:border-slate-700/50 last:border-0">
                         <div className="flex items-start gap-3">
                             <div className={`mt-1 min-w-[20px] ${isCorrect ? "text-emerald-500" : "text-red-500"}`}>
                                 {isCorrect ? <Check size={16} /> : <X size={16} />}
                             </div>
                             <div>
                                 <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">{item.question}</p>
                                 <p className="text-xs text-slate-500">Correct: {item.options[item.correct]}</p>
                             </div>
                         </div>
                     </div>
                 );
             })}
          </div>

          <button onClick={() => setGameState("menu")} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/10 dark:shadow-white/10 transition-all transform hover:scale-[1.02]">
            Claim Rewards & Continue
          </button>
        </motion.div>
      </div>
    );
  }
  return null;
}