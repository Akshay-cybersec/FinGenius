"use client";
import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Car, 
  GraduationCap, 
  Ship, 
  Briefcase, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Landmark,
  XCircle,
  CheckCircle2
} from "lucide-react";
import confetti from "canvas-confetti";

// --- Types ---
interface Deal {
  id: string;
  title: string;
  type: 'asset' | 'liability';
  cost: number;        // Principal amount
  interestRate: number; // Annual %
  monthlyRevenue: number; // $0 for bad debt, >$0 for good debt
  description: string;
  icon: any;
}

// --- Data: The Market Deals ---
// Some are obvious, some are tricky math problems
const DEALS: Deal[] = [
  { 
    id: '1', title: 'Luxury SUV', type: 'liability', 
    cost: 60000, interestRate: 0.09, monthlyRevenue: 0, 
    description: "Look rich, be poor. High interest, depreciating asset.",
    icon: Car
  },
  { 
    id: '2', title: 'Duplex Rental', type: 'asset', 
    cost: 200000, interestRate: 0.04, monthlyRevenue: 1400, 
    description: "Tenants pay the mortgage. Positive cash flow machine.",
    icon: Building2
  },
  { 
    id: '3', title: 'Credit Card Spree', type: 'liability', 
    cost: 5000, interestRate: 0.24, monthlyRevenue: 0, 
    description: "Clothes and dinners. Extremely high interest trap.",
    icon: CreditCard
  },
  { 
    id: '4', title: 'Small Business Loan', type: 'asset', 
    cost: 50000, interestRate: 0.07, monthlyRevenue: 800, 
    description: "Risky, but high potential return on investment.",
    icon: Briefcase
  },
  { 
    id: '5', title: 'Boat Financing', type: 'liability', 
    cost: 80000, interestRate: 0.10, monthlyRevenue: 0, 
    description: "A hole in the water you throw money into.",
    icon: Ship
  },
  { 
    id: '6', title: 'Coding Bootcamp', type: 'asset', 
    cost: 15000, interestRate: 0.05, monthlyRevenue: 500, 
    description: "Education debt that increases your future salary.",
    icon: GraduationCap
  },
  { 
    id: '7', title: 'Timeshare', type: 'liability', 
    cost: 30000, interestRate: 0.15, monthlyRevenue: 0, 
    description: "You pay to maintain it, but it generates zero income.",
    icon: XCircle
  },
  { 
    id: '8', title: 'Commercial Real Estate', type: 'asset', 
    cost: 500000, interestRate: 0.05, monthlyRevenue: 3500, 
    description: "Big debt, big returns. Needs solid cash flow to handle.",
    icon: Landmark
  }
];

export default function DebtTycoon() {
  // --- State ---
  const [netWorth, setNetWorth] = useState(50000); // Starting Equity
  const [cashFlow, setCashFlow] = useState(2000); // Starting Monthly Income surplus
  const [totalDebt, setTotalDebt] = useState(0);
  const [turn, setTurn] = useState(1);
  const [portfolio, setPortfolio] = useState<Deal[]>([]);
  
  const [currentDeal, setCurrentDeal] = useState<Deal | null>(null);
  const [feedback, setFeedback] = useState<{msg: string, type: 'good'|'bad'|'neutral'} | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'bankrupt'>('playing');

  // --- Logic ---

  // Randomly select a deal
  const rollDeal = () => {
    const random = DEALS[Math.floor(Math.random() * DEALS.length)];
    setCurrentDeal(random);
    setFeedback(null);
  };

  // Initial load
  useEffect(() => {
    rollDeal();
  }, []);

  const calculateMonthlyPayment = (principal: number, rate: number) => {
    // Simplified interest-only + small principal paydown for game mechanics
    // Real formula is complex, this approximates the "Hit" to cash flow
    return Math.floor((principal * rate) / 12) + (principal * 0.005); 
  };

  const handleDecision = (accepted: boolean) => {
    if (!currentDeal || gameState !== 'playing') return;

    if (!accepted) {
      setFeedback({ msg: "Pass. You saved your borrowing power for later.", type: 'neutral' });
      setTimeout(nextTurn, 1500);
      return;
    }

    // --- Math: The Core of the Lesson ---
    const monthlyPayment = calculateMonthlyPayment(currentDeal.cost, currentDeal.interestRate);
    const netCashFlowChange = currentDeal.monthlyRevenue - monthlyPayment;
    
    // Simulate Asset Value (Good debt usually buys assets worth the loan amount)
    // Bad debt (Liability) usually buys depreciating things (Value < Cost immediately)
    const assetValue = currentDeal.type === 'asset' ? currentDeal.cost : currentDeal.cost * 0.5;

    // --- Update State ---
    const newCashFlow = cashFlow + netCashFlowChange;
    const newNetWorth = netWorth + (assetValue - currentDeal.cost); // Equity change

    // --- Win/Loss Check ---
    if (newCashFlow < 0) {
      setGameState('bankrupt');
      setFeedback({ msg: "BANKRUPT! Your debt payments exceeded your income.", type: 'bad' });
      return;
    }

    if (newNetWorth >= 1000000) {
      setGameState('won');
      confetti();
      return;
    }

    // Apply Changes
    setCashFlow(newCashFlow);
    setNetWorth(newNetWorth);
    setTotalDebt(prev => prev + currentDeal.cost);
    setPortfolio(prev => [...prev, currentDeal]);

    // Educational Feedback
    if (netCashFlowChange > 0) {
      setFeedback({ 
        msg: `✅ Good Debt! This asset pays for itself (+$${Math.floor(netCashFlowChange)}/mo).`, 
        type: 'good' 
      });
    } else {
      setFeedback({ 
        msg: `⚠️ Bad Debt! This liability drains your income (-$${Math.floor(Math.abs(netCashFlowChange))}/mo).`, 
        type: 'bad' 
      });
    }

    setTimeout(nextTurn, 2000);
  };

  const nextTurn = () => {
    setTurn(prev => prev + 1);
    rollDeal();
  };

  const resetGame = () => {
    setNetWorth(50000);
    setCashFlow(2000);
    setTotalDebt(0);
    setTurn(1);
    setPortfolio([]);
    setGameState('playing');
    rollDeal();
  };

  // --- Helper for formatting ---
  const money = (val: number) => 
    val.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden min-h-[600px] flex flex-col md:flex-row font-sans">
      
      {/* --- LEFT: The Dashboard --- */}
      <div className="w-full md:w-1/3 bg-slate-950 p-6 border-r border-slate-800 flex flex-col gap-6">
        <div>
           <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
             <Landmark className="text-emerald-500"/> Debt Tycoon
           </h2>
           <p className="text-slate-400 text-xs">Leverage debt to build wealth. Avoid the traps.</p>
        </div>

        {/* Goal Progress */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-2">
            <span>Net Worth</span>
            <span>Goal: $1M</span>
          </div>
          <div className="text-3xl font-mono font-bold text-white mb-2">{money(netWorth)}</div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, (netWorth / 1000000) * 100))}%` }}></div>
          </div>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-1 gap-4">
          <StatBox 
             label="Monthly Cash Flow" 
             value={money(cashFlow)} 
             sub="Must stay > $0"
             isDanger={cashFlow < 500}
             icon={<DollarSign size={16} className={cashFlow < 500 ? "text-red-400" : "text-emerald-400"} />}
          />
          <StatBox 
             label="Total Debt" 
             value={money(totalDebt)} 
             sub={`Interest varies`}
             icon={<TrendingDown size={16} className="text-orange-400" />}
          />
        </div>

        {/* Portfolio List */}
        <div className="flex-1 overflow-hidden flex flex-col mt-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Assets & Liabilities Acquired</h4>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
             {portfolio.map((item, i) => (
               <div key={i} className={`flex items-center justify-between p-2 rounded-lg text-xs border ${item.type === 'asset' ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-red-900/10 border-red-500/20'}`}>
                  <span className="text-slate-300">{item.title}</span>
                  <span className={item.type === 'asset' ? 'text-emerald-400' : 'text-red-400'}>
                    {item.type === 'asset' ? 'Good Debt' : 'Bad Debt'}
                  </span>
               </div>
             ))}
             {portfolio.length === 0 && <p className="text-slate-600 text-xs italic">No deals signed yet.</p>}
          </div>
        </div>
      </div>

      {/* --- RIGHT: The Deal Room --- */}
      <div className="w-full md:w-2/3 p-8 flex flex-col relative bg-gradient-to-br from-slate-900 to-slate-800">
        
        {/* Turn Counter */}
        <div className="absolute top-6 right-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
           Turn {turn}
        </div>

        {gameState === 'playing' && currentDeal ? (
          <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
             
             {/* The Card */}
             <div className="bg-white text-slate-900 rounded-3xl p-8 shadow-2xl mb-8 transform transition-all hover:scale-[1.01]">
                <div className="flex items-start justify-between mb-6">
                   <div className="p-3 bg-slate-100 rounded-2xl text-slate-700">
                      <currentDeal.icon size={32} />
                   </div>
                   <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase">Principal Cost</p>
                      <p className="text-3xl font-black text-slate-900">{money(currentDeal.cost)}</p>
                   </div>
                </div>

                <h2 className="text-3xl font-bold mb-2">{currentDeal.title}</h2>
                <p className="text-slate-500 mb-6 font-medium leading-relaxed">{currentDeal.description}</p>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Interest Rate</p>
                        <p className={`text-xl font-mono font-bold ${currentDeal.interestRate > 0.08 ? 'text-red-500' : 'text-emerald-600'}`}>
                          {(currentDeal.interestRate * 100).toFixed(1)}%
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Revenue / Mo</p>
                        <p className="text-xl font-mono font-bold text-slate-700">
                          {money(currentDeal.monthlyRevenue)}
                        </p>
                    </div>
                </div>

                {/* Math Hint (Intermediate Feature) */}
                <div className="text-xs text-slate-400 text-center italic bg-slate-100 py-2 rounded-lg mb-2">
                   Est. Payment: ~{money(calculateMonthlyPayment(currentDeal.cost, currentDeal.interestRate))}/mo
                </div>
             </div>

             {/* Controls */}
             <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleDecision(false)}
                  className="py-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-bold transition-all"
                >
                  Pass
                </button>
                <button 
                  onClick={() => handleDecision(true)}
                  className="py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                   <CheckCircle2 size={18} /> Finance It
                </button>
             </div>

             {/* Feedback Bubble */}
             {feedback && (
                <div className={`mt-6 p-4 rounded-xl text-center font-bold text-sm animate-in fade-in slide-in-from-bottom-4 ${
                  feedback.type === 'good' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 
                  feedback.type === 'bad' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                  'bg-slate-700 text-slate-300'
                }`}>
                   {feedback.msg}
                </div>
             )}
          </div>
        ) : (
          <ResultScreen state={gameState} reset={resetGame} netWorth={netWorth} />
        )}
      </div>
    </div>
  );
}

// --- Subcomponents ---

const StatBox = ({ label, value, sub, icon, isDanger }: any) => (
  <div className={`p-4 rounded-xl border ${isDanger ? 'bg-red-900/10 border-red-500/30' : 'bg-slate-900 border-slate-800'}`}>
     <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold uppercase text-slate-500">{label}</span>
        {icon}
     </div>
     <div className="text-2xl font-mono font-bold text-white">{value}</div>
     {sub && <div className={`text-[10px] ${isDanger ? 'text-red-400' : 'text-slate-500'}`}>{sub}</div>}
  </div>
);

const ResultScreen = ({ state, reset, netWorth }: any) => (
  <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in">
     {state === 'won' ? (
        <>
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
             <Landmark size={40} />
          </div>
          <h2 className="text-4xl font-black text-white mb-2">Tycoon Status!</h2>
          <p className="text-slate-400 max-w-md mb-8">
            You reached {netWorth.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} net worth by leveraging Good Debt (Assets) and avoiding Bad Debt (Liabilities).
          </p>
        </>
     ) : (
        <>
           <div className="w-20 h-20 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-6">
             <AlertTriangle size={40} />
          </div>
          <h2 className="text-4xl font-black text-white mb-2">Insolvency</h2>
          <p className="text-slate-400 max-w-md mb-8">
             Your monthly debt payments became higher than your income. This is the danger of leverage.
          </p>
        </>
     )}
     <button onClick={reset} className="px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-200 transition-all">
        Play Again
     </button>
  </div>
);