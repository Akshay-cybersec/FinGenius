"use client";
import React, { useState, useEffect } from "react";
import {
  Home,
  Gamepad2,
  PiggyBank,
  ArrowRight,
  XCircle,
  CheckCircle2,
  Info,
  RotateCcw,
  Sparkles
} from "lucide-react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

// --- Data: Real World Expenses ---
type Category = 'needs' | 'wants' | 'savings';

interface ExpenseItem {
  id: string;
  name: string;
  cost: number;
  category: Category;
  explanation: string;
}

const EXPENSE_DECK: ExpenseItem[] = [
  { id: '1', name: 'Apartment Rent', cost: 1500, category: 'needs', explanation: "Shelter is your #1 survival need. It always comes first." },
  { id: '2', name: 'Weekly Groceries', cost: 400, category: 'needs', explanation: "You need to eat to survive. Basic groceries are a non-negotiable Need." },
  { id: '3', name: 'Netflix & Spotify', cost: 50, category: 'wants', explanation: "Entertainment is great for mental health, but strictly speaking, it's a Want." },
  { id: '4', name: 'Emergency Fund', cost: 500, category: 'savings', explanation: "This isn't spending; it's security. Paying your future self is Savings." },
  { id: '5', name: 'Electricity Bill', cost: 150, category: 'needs', explanation: "Utilities keep your home running. Definitely a Need." },
  { id: '6', name: 'Weekend Pizza', cost: 100, category: 'wants', explanation: "Food is a need, but *dining out* is a luxury. Classify as a Want." },
  { id: '7', name: 'Stock Market', cost: 500, category: 'savings', explanation: "Investing grows your wealth. This belongs in the Savings bucket." },
  { id: '8', name: 'New Sneakers', cost: 150, category: 'wants', explanation: "Unless you have no shoes, brand new kicks are a Want." },
  { id: '9', name: 'Car Insurance', cost: 100, category: 'needs', explanation: "Legally required to drive? Then it's a Need." },
  { id: '10', name: 'Video Games', cost: 60, category: 'wants', explanation: "Pure entertainment. A fun Want!" },
  { id: '11', name: 'Health Insurance', cost: 200, category: 'needs', explanation: "Protecting your health and finances from disaster is a Need." },
  { id: '12', name: 'Vacation Fund', cost: 300, category: 'wants', explanation: "Saving for a trip? Even though you save it, the end goal is luxury. It's a Want." },
];

const TOTAL_BUDGET = 5000;

// Joyride steps
const joyrideSteps: Step[] = [
  {
    target: 'body',
    placement: 'center',
    title: 'Welcome to Budget Architect!',
    content: 'Your goal is to sort common expenses into the correct categories based on the 50/30/20 rule. Let\'s build a balanced budget!',
    disableBeacon: true,
  },
  {
    target: '.needs-btn',
    title: 'Needs (50%)',
    content: 'These are essential for survival: housing, food, utilities, transportation, and insurance.',
    spotlightPadding: 5,
  },
  {
    target: '.wants-btn',
    title: 'Wants (30%)',
    content: 'These are non-essentials that improve your quality of life: entertainment, dining out, hobbies, and shopping.',
    spotlightPadding: 5,
  },
  {
    target: '.savings-btn',
    title: 'Savings (20%)',
    content: 'Pay yourself first! This includes emergency funds, retirement contributions, and investments for future goals.',
    spotlightPadding: 5,
  },
  {
    target: '.tower-needs',
    title: 'Track Your Progress',
    content: 'As you sort, these towers will fill up. Try not to exceed the target for each category.',
  }
];

export default function BudgetArchitect() {
  const [deck, setDeck] = useState<ExpenseItem[]>(EXPENSE_DECK);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [towers, setTowers] = useState({ needs: 0, wants: 0, savings: 0 });
  const [feedback, setFeedback] = useState<{ msg: string; type: 'neutral' | 'success' | 'error' }>({
    msg: "Welcome, Architect! Sort the expenses to build your budget.",
    type: 'neutral'
  });
  const [history, setHistory] = useState<ExpenseItem[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [runJoyride, setRunJoyride] = useState(false);

  const TARGETS = {
    needs: TOTAL_BUDGET * 0.50,
    wants: TOTAL_BUDGET * 0.30,
    savings: TOTAL_BUDGET * 0.20
  };

  const currentCard = deck[currentCardIndex];

  useEffect(() => {
    const tourShown = localStorage.getItem('budgetArchitectTourShown');
    if (!tourShown) {
      setRunJoyride(true);
    }
  }, []);

  // FIX: Type casting 'status' to allow comparison
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatus: string = STATUS.FINISHED;
    const skippedStatus: string = STATUS.SKIPPED;

    if ([finishedStatus, skippedStatus].includes(status)) {
      setRunJoyride(false);
      localStorage.setItem('budgetArchitectTourShown', 'true');
    }
  };

  const handleSort = (selectedCategory: Category) => {
    if (!currentCard) return;

    if (selectedCategory !== currentCard.category) {
      setFeedback({
        msg: `❌ Incorrect! ${currentCard.name} is actually a ${currentCard.category.toUpperCase()}. Logic: ${currentCard.explanation}`,
        type: 'error'
      });
      return;
    }

    const newTotal = towers[selectedCategory] + currentCard.cost;
    setTowers(prev => ({ ...prev, [selectedCategory]: newTotal }));
    setHistory(prev => [currentCard, ...prev]);

    setFeedback({
      msg: `✅ Correct! ${currentCard.explanation}`,
      type: 'success'
    });

    if (currentCardIndex < deck.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    setIsComplete(true);
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
    setFeedback({ msg: "🎉 Analysis Complete! Let's review your financial structure.", type: 'success' });
  };

  const resetGame = () => {
    setTowers({ needs: 0, wants: 0, savings: 0 });
    setCurrentCardIndex(0);
    setHistory([]);
    setIsComplete(false);
    setFeedback({ msg: "Let's try again. Focus on the category definitions.", type: 'neutral' });
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-gradient-to-br from-slate-900 to-slate-950 text-slate-100 rounded-[2rem] shadow-2xl border border-slate-800/50 overflow-hidden flex flex-col md:flex-row min-h-[700px] relative">

      <Joyride
        steps={joyrideSteps}
        run={runJoyride}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            arrowColor: '#1e293b',
            backgroundColor: '#1e293b',
            overlayColor: 'rgba(0, 0, 0, 0.6)',
            primaryColor: '#3b82f6',
            textColor: '#fff',
            zIndex: 1000,
          },
          tooltip: {
            fontSize: '14px',
            borderRadius: '1rem',
          },
          buttonNext: {
            backgroundColor: '#3b82f6',
            borderRadius: '0.5rem',
            color: '#fff',
            fontFamily: 'inherit',
            fontWeight: 'bold',
            outline: 'none',
          },
          buttonBack: {
            color: '#64748b',
            fontFamily: 'inherit',
            marginRight: '10px',
          },
          buttonSkip: {
            color: '#64748b',
            fontFamily: 'inherit',
          },
        }}
      />

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      {/* --- LEFT PANEL --- */}
      <div className="w-full md:w-5/12 p-8 flex flex-col relative border-r border-slate-800/50 z-10 backdrop-blur-sm bg-slate-900/50">

        <div className="mb-6">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-1">Budget Architect</h1>
          <p className="text-slate-400 text-sm font-medium">Build your financial future, one card at a time.</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={feedback.msg}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-8 p-5 rounded-2xl text-sm leading-relaxed border backdrop-blur-md shadow-lg transition-colors duration-300 ${feedback.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-200 shadow-red-500/10' :
                feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200 shadow-emerald-500/10' :
                  'bg-slate-800/50 border-slate-700 text-slate-300 shadow-black/20'
              }`}
          >
            <div className="flex gap-3 items-start">
              <div className={`mt-0.5 p-1.5 rounded-full ${feedback.type === 'error' ? 'bg-red-500/20 text-red-400' :
                  feedback.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-slate-700 text-slate-400'
                }`}>
                {feedback.type === 'success' ? <CheckCircle2 size={16} /> : feedback.type === 'error' ? <XCircle size={16} /> : <Info size={16} />}
              </div>
              <p className="font-medium">{feedback.msg}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex-1 flex flex-col justify-center items-center relative perspective-1000 min-h-[400px]">
          {!isComplete ? (
            <div className="relative w-full max-w-sm flex flex-col items-center">

              <div className="absolute top-4 scale-[0.9] opacity-40 w-full h-[420px] bg-slate-800 rounded-3xl border border-slate-700 shadow-xl z-0 transform rotate-6 transition-transform duration-500" />
              <div className="absolute top-2 scale-[0.95] opacity-60 w-full h-[420px] bg-slate-800 rounded-3xl border border-slate-700 shadow-xl z-0 transform -rotate-3 transition-transform duration-500" />

              <motion.div
                key={currentCard.id}
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 1.1, opacity: 0, x: 200 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative w-full bg-white text-slate-900 rounded-3xl shadow-2xl flex flex-col items-center justify-between p-8 z-10 border border-white/20 h-[450px]"
              >
                <div className="w-full text-center space-y-4">
                  <div className="flex justify-between items-center w-full">
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200">
                      #{currentCardIndex + 1} / {EXPENSE_DECK.length}
                    </span>
                    <div className="p-2 bg-slate-50 rounded-full text-slate-300">
                      <Sparkles size={16} />
                    </div>
                  </div>

                  <div className="py-4">
                    <h3 className="text-3xl font-black mb-2 text-slate-800 leading-tight">{currentCard.name}</h3>
                    <div className="inline-flex items-baseline justify-center gap-1">
                      <span className="text-slate-400 font-medium">$</span>
                      <span className="text-5xl font-black text-slate-900 tracking-tight">{currentCard.cost}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full grid grid-cols-1 gap-3 mt-auto">
                  <p className="text-center text-xs text-slate-400 font-bold uppercase tracking-wide mb-2">Assign Category</p>
                  <button
                    onClick={() => handleSort('needs')}
                    className="needs-btn group relative w-full py-3.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all duration-300 border border-blue-100 hover:border-blue-500 shadow-sm hover:shadow-blue-500/30 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2"><Home size={18} /> Needs</span>
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleSort('wants')}
                      className="wants-btn group w-full py-3.5 bg-purple-50 hover:bg-purple-600 text-purple-600 hover:text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 border border-purple-100 hover:border-purple-500 shadow-sm hover:shadow-purple-500/30"
                    >
                      <Gamepad2 size={18} /> Wants
                    </button>
                    <button
                      onClick={() => handleSort('savings')}
                      className="savings-btn group w-full py-3.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 border border-emerald-100 hover:border-emerald-500 shadow-sm hover:shadow-emerald-500/30"
                    >
                      <PiggyBank size={18} /> Savings
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col justify-center items-center text-center p-8 bg-slate-800/50 rounded-3xl border border-slate-700/50 backdrop-blur-md"
            >
              <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <CheckCircle2 size={48} strokeWidth={3} />
              </div>
              <h3 className="text-3xl font-black text-white mb-2">Budget Built!</h3>
              <p className="text-slate-400 mb-8 max-w-xs mx-auto text-sm font-medium">You've successfully categorized all expenses.</p>
              <button
                onClick={resetGame}
                className="px-8 py-4 bg-slate-100 text-slate-900 hover:bg-white hover:scale-105 rounded-xl font-bold flex items-center gap-3 transition-all shadow-xl shadow-slate-900/20"
              >
                <RotateCcw size={18} /> Build Another Budget
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* --- RIGHT PANEL --- */}
      <div className="w-full md:w-7/12 p-8 flex flex-col relative z-10">

        <div className="mb-10 flex justify-between items-end bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Financial Blueprint</h2>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Monthly Income:</span>
              <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">$5,000</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Budget Used</p>
            <p className="font-mono text-2xl font-bold text-white">
              ${(towers.needs + towers.wants + towers.savings).toLocaleString()} <span className="text-slate-600 text-lg">/ $5k</span>
            </p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-3 gap-4 md:gap-8 h-full items-end pb-8 px-4">
          <Tower
            className="tower-needs"
            label="Needs"
            subLabel="50%"
            color="bg-blue-500"
            gradient="from-blue-500 to-indigo-600"
            currentAmount={towers.needs}
            targetAmount={TARGETS.needs}
            icon={<Home size={20} />}
          />
          <Tower
            label="Wants"
            subLabel="30%"
            color="bg-purple-500"
            gradient="from-purple-500 to-pink-600"
            currentAmount={towers.wants}
            targetAmount={TARGETS.wants}
            icon={<Gamepad2 size={20} />}
          />
          <Tower
            label="Savings"
            subLabel="20%"
            color="bg-emerald-500"
            gradient="from-emerald-500 to-teal-600"
            currentAmount={towers.savings}
            targetAmount={TARGETS.savings}
            icon={<PiggyBank size={20} />}
          />
        </div>

        <div className="mt-4 pt-6 border-t border-slate-800/50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Transaction Log</h4>
            <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-500">{history.length} items sorted</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mask-fade-right">
            <AnimatePresence>
              {history.map((item, idx) => (
                <motion.div
                  key={item.id + idx}
                  initial={{ opacity: 0, x: -20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  className="flex-shrink-0 px-4 py-3 bg-slate-800/60 rounded-xl border border-slate-700/50 text-xs flex flex-col gap-1 min-w-[120px] shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${item.category === 'needs' ? 'bg-blue-500 shadow-blue-500' :
                        item.category === 'wants' ? 'bg-purple-500 shadow-purple-500' : 'bg-emerald-500 shadow-emerald-500'
                      }`} />
                    <span className="text-[10px] font-bold uppercase text-slate-500">{item.category}</span>
                  </div>
                  <span className="font-bold text-slate-200 truncate">{item.name}</span>
                  <span className="text-slate-400 font-mono">-${item.cost}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {history.length === 0 && (
              <div className="w-full text-center py-4 text-slate-600 text-sm font-medium border border-dashed border-slate-800 rounded-xl">
                No expenses sorted yet. Start building!
              </div>
            )}
          </div>
        </div>

        {/* Description Box */}
        <div className="mt-4 p-4 bg-slate-800/60 rounded-xl border border-slate-700/50 text-sm text-slate-300 leading-relaxed backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-slate-100 font-bold">
            <Info size={16} className="text-blue-400" />
            <span>About this Exercise</span>
          </div>
          <p>
            This simulation is designed to help you understand the 50/30/20 budgeting rule. You'll practice categorizing real-world expenses into Needs (50%), Wants (30%), and Savings (20%) to build a balanced financial plan.
          </p>
        </div>
      </div>
    </div>
  );
}

const Tower = ({ label, subLabel, color, gradient, currentAmount, targetAmount, icon, className }: any) => {
  const fillPercentage = Math.min((currentAmount / targetAmount) * 100, 100);
  const isOverBudget = currentAmount > targetAmount;
  const isComplete = currentAmount >= targetAmount;

  return (
    <div className={`flex flex-col items-center h-full justify-end group w-full ${className}`}>

      <div className="mb-4 text-center transition-transform duration-300 group-hover:-translate-y-1">
        <div className={`text-lg font-mono font-bold transition-colors ${isOverBudget ? 'text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]' : 'text-white'}`}>
          ${currentAmount.toLocaleString()}
        </div>
        <div className="h-1 w-8 bg-slate-700 rounded-full mx-auto mt-2 mb-1" />
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target: ${targetAmount.toLocaleString()}</p>
      </div>

      <div className="w-full max-w-[100px] h-[350px] bg-slate-800/50 rounded-[1.5rem] relative overflow-hidden border border-slate-700/50 backdrop-blur-sm shadow-inner group-hover:border-slate-600 transition-colors">

        <div className="absolute top-0 left-0 right-0 border-b-2 border-dashed border-white/10 z-20 h-full flex items-start justify-center pt-3 pointer-events-none">
          <span className="text-[10px] font-black text-white/30 tracking-widest">{subLabel}</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 w-full h-full z-10 flex items-end">
          <motion.div
            initial={{ height: "0%" }}
            animate={{ height: `${fillPercentage}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            className={`w-full relative transition-colors duration-500 ${isOverBudget ? 'bg-red-500' : `bg-gradient-to-t ${gradient}`}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/50 shadow-[0_0_10px_white]" />
          </motion.div>
        </div>

        <div className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center gap-2">
        <div className={`p-3 rounded-2xl ${color} bg-opacity-20 text-white shadow-lg border border-white/5 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <span className="text-sm font-bold text-slate-300 tracking-wide">{label}</span>
      </div>
    </div>
  );
};