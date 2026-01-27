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
  RotateCcw
} from "lucide-react";
import confetti from "canvas-confetti";

// --- Data: Real World Expenses ---
type Category = 'needs' | 'wants' | 'savings';

interface ExpenseItem {
  id: string;
  name: string;
  cost: number;
  category: Category;
  explanation: string; // The "Logic" explanation
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
  // Note: Vacation is tricky, often debated, but usually fits "Wants" or "Short term savings for wants"
];

const TOTAL_BUDGET = 5000; // Sum of all costs roughly matches this for the game balance

export default function BudgetArchitect() {
  // --- State ---
  const [deck, setDeck] = useState<ExpenseItem[]>(EXPENSE_DECK);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [towers, setTowers] = useState({ needs: 0, wants: 0, savings: 0 }); // Track $ amounts
  const [feedback, setFeedback] = useState<{ msg: string; type: 'neutral' | 'success' | 'error' }>({ 
    msg: "Welcome, Architect! Sort the expenses to build your budget.", 
    type: 'neutral' 
  });
  const [history, setHistory] = useState<ExpenseItem[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  // Targets
  const TARGETS = {
    needs: TOTAL_BUDGET * 0.50, // $2500
    wants: TOTAL_BUDGET * 0.30, // $1500
    savings: TOTAL_BUDGET * 0.20 // $1000
  };

  const currentCard = deck[currentCardIndex];

  // --- Logic ---
  const handleSort = (selectedCategory: Category) => {
    if (!currentCard) return;

    // 1. Check Logic: Is the category correct?
    if (selectedCategory !== currentCard.category) {
      setFeedback({ 
        msg: `❌ Incorrect! ${currentCard.name} is actually a ${currentCard.category.toUpperCase()}. logic: ${currentCard.explanation}`, 
        type: 'error' 
      });
      return; // Stop them from proceeding until they get it right
    }

    // 2. Check Balance: Does it fit in the budget?
    const newTotal = towers[selectedCategory] + currentCard.cost;
    /* In a harder version, you could block them here. For learning, we let them overfill then warn them. */
    
    // 3. Success Move
    setTowers(prev => ({ ...prev, [selectedCategory]: newTotal }));
    setHistory(prev => [currentCard, ...prev]);
    
    setFeedback({ 
      msg: `✅ Correct! ${currentCard.explanation}`, 
      type: 'success' 
    });

    // 4. Advance Deck
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
    <div className="w-full max-w-5xl mx-auto bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
      
      {/* --- LEFT PANEL: The Sorting Station --- */}
      <div className="w-full md:w-5/12 bg-slate-800 p-8 flex flex-col relative border-r border-slate-700">
        
        {/* Mentor Message Bubble */}
        <div className={`mb-6 p-4 rounded-xl text-sm leading-relaxed border transition-all duration-300 ${
          feedback.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-200' :
          feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200' :
          'bg-slate-700 border-slate-600 text-slate-300'
        }`}>
          <div className="flex gap-3">
            <Info className="flex-shrink-0 w-5 h-5 mt-0.5" />
            <p>{feedback.msg}</p>
          </div>
        </div>

        {/* The Card Deck */}
        {!isComplete ? (
          <div className="flex-1 flex flex-col justify-center items-center relative perspective-1000">
            {/* Card Stack Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 bg-slate-700 rounded-2xl border border-slate-600 rotate-3 opacity-50 scale-95"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 bg-slate-700 rounded-2xl border border-slate-600 -rotate-2 opacity-70 scale-95"></div>
            
            {/* Active Card */}
            <div className="relative w-72 h-96 bg-white text-slate-900 rounded-2xl shadow-2xl flex flex-col items-center justify-between p-6 transform transition-all hover:scale-105 duration-300 z-10">
              <div className="w-full text-center">
                <span className="inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                  Expense #{currentCardIndex + 1}
                </span>
                <h3 className="text-2xl font-extrabold mb-2">{currentCard.name}</h3>
                <div className="text-4xl font-mono font-bold text-indigo-600">${currentCard.cost}</div>
              </div>
              
              <div className="w-full space-y-3">
                <p className="text-center text-xs text-slate-400 font-medium uppercase">Where does this belong?</p>
                <button 
                  onClick={() => handleSort('needs')}
                  className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Home size={18} /> Needs
                </button>
                <button 
                  onClick={() => handleSort('wants')}
                  className="w-full py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Gamepad2 size={18} /> Wants
                </button>
                <button 
                  onClick={() => handleSort('savings')}
                  className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <PiggyBank size={18} /> Savings
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-6" />
            <h3 className="text-2xl font-bold mb-2">Simulation Complete</h3>
            <p className="text-slate-400 mb-8">You've sorted all monthly expenses. Check your detailed breakdown on the right.</p>
            <button 
              onClick={resetGame}
              className="px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-full font-bold flex items-center gap-2 transition-all"
            >
              <RotateCcw size={18} /> Restart
            </button>
          </div>
        )}
      </div>

      {/* --- RIGHT PANEL: The Towers (Visualization) --- */}
      <div className="w-full md:w-7/12 bg-slate-900 p-8 flex flex-col relative">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold">Budget Structure</h2>
            <p className="text-slate-400 text-sm">Monthly Income: <span className="text-white font-mono">$5,000</span></p>
          </div>
          <div className="text-right">
             <p className="text-xs text-slate-500 uppercase font-bold">Spent / Total</p>
             <p className="font-mono text-xl">
               ${(towers.needs + towers.wants + towers.savings).toLocaleString()} / $5,000
             </p>
          </div>
        </div>

        {/* The 3 Columns */}
        <div className="flex-1 grid grid-cols-3 gap-4 md:gap-6 h-full items-end pb-4">
          <Tower 
            label="Needs" 
            percent={50} 
            color="bg-blue-500" 
            currentAmount={towers.needs} 
            targetAmount={TARGETS.needs}
            icon={<Home size={20} />}
          />
          <Tower 
            label="Wants" 
            percent={30} 
            color="bg-purple-500" 
            currentAmount={towers.wants} 
            targetAmount={TARGETS.wants}
            icon={<Gamepad2 size={20} />}
          />
          <Tower 
            label="Savings" 
            percent={20} 
            color="bg-emerald-500" 
            currentAmount={towers.savings} 
            targetAmount={TARGETS.savings}
            icon={<PiggyBank size={20} />}
          />
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800">
           <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recent Transactions</h4>
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
             {history.slice(0, 5).map((item, idx) => (
               <div key={idx} className="flex-shrink-0 px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 text-xs flex items-center gap-2">
                 <span className={`w-2 h-2 rounded-full ${
                   item.category === 'needs' ? 'bg-blue-500' : 
                   item.category === 'wants' ? 'bg-purple-500' : 'bg-emerald-500'
                 }`} />
                 <span className="font-medium">{item.name}</span>
                 <span className="text-slate-400 font-mono">-${item.cost}</span>
               </div>
             ))}
             {history.length === 0 && <span className="text-slate-600 text-xs italic">No expenses sorted yet...</span>}
           </div>
        </div>
      </div>
    </div>
  );
}

const Tower = ({ label, percent, color, currentAmount, targetAmount, icon }: any) => {
  const fillPercentage = Math.min((currentAmount / targetAmount) * 100, 100);
  const isOverBudget = currentAmount > targetAmount;
  const isComplete = currentAmount === targetAmount;

  return (
    <div className="flex flex-col items-center h-full justify-end group">
      
      <div className="mb-3 text-center opacity-60 group-hover:opacity-100 transition-opacity">
        <p className={`text-lg font-mono font-bold ${isOverBudget ? 'text-red-400' : 'text-white'}`}>
          ${currentAmount.toLocaleString()}
        </p>
        <p className="text-[10px] text-slate-400">Target: ${targetAmount.toLocaleString()}</p>
      </div>

      <div className="w-full max-w-[80px] h-[300px] bg-slate-800 rounded-t-2xl relative overflow-hidden border border-slate-700">
        <div className="absolute top-0 left-0 right-0 border-b border-dashed border-white/20 z-10 h-full flex items-start justify-center pt-2">
           <span className="text-[10px] text-slate-500 font-bold">{percent}% Limit</span>
        </div>

        <div 
          className={`absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out ${
            isOverBudget ? 'bg-red-500' : color
          } ${isComplete ? 'shadow-[0_0_20px_rgba(255,255,255,0.3)]' : ''}`}
          style={{ height: `${fillPercentage}%` }}
        >
          <div className="absolute inset-0 w-full h-full opacity-20" 
               style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 p-2 rounded-xl bg-slate-800 border border-slate-700">
        <div className={`p-1.5 rounded-lg ${color} text-white`}>
          {icon}
        </div>
        <span className="text-sm font-bold text-slate-300 hidden md:inline">{label}</span>
      </div>
    </div>
  );
};