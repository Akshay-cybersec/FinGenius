"use client";
import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Wallet, 
  Ban, 
  AlertTriangle, 
  HeartPulse, 
  Trophy, 
  RefreshCcw,
  TrendingDown,
  Lock
} from "lucide-react";
import confetti from "canvas-confetti";

// --- Types ---
type EventType = 'emergency' | 'budget' | 'luxury';

interface Scenario {
  id: string;
  title: string;
  cost: number;
  type: EventType;
  description: string;
  reason: string;
}

const SCENARIOS: Scenario[] = [
  { 
    id: '1', 
    title: 'Transmission Failure', 
    cost: 2200, 
    type: 'emergency', 
    description: "Your car won't reverse. The mechanic says the transmission is toast.",
    reason: "Correct! This is Unexpected, Urgent, and Necessary. This is exactly what the fund is for."
  },
  { 
    id: '2', 
    title: 'Best Friend\'s Wedding', 
    cost: 800, 
    type: 'budget', 
    description: "It's a destination wedding in Cabo. You need flights and a hotel.",
    reason: "Careful! A wedding is a planned event, not a surprise emergency. This should come from a 'Sinking Fund' or monthly savings."
  },
  { 
    id: '3', 
    title: 'Flash Sale: 4K TV', 
    cost: 600, 
    type: 'luxury', 
    description: "60% off for the next 2 hours only! It's an incredible deal.",
    reason: "Correct! A sale is never an emergency. Protecting your future involves saying 'No' to impulse buys."
  },
  { 
    id: '4', 
    title: 'Annual Car Insurance', 
    cost: 1200, 
    type: 'budget', 
    description: "The 6-month premium just hit your inbox. It's due tomorrow.",
    reason: "This is a predictable bill! In the future, save $200/month so this isn't a shock. Do not raid the Emergency Fund for bills you knew were coming."
  },
  { 
    id: '5', 
    title: 'ER Visit: Broken Arm', 
    cost: 1500, 
    type: 'emergency', 
    description: "You slipped on ice. The copay and deductible are high.",
    reason: "Spot on. Health is wealth. Medical emergencies are the #1 reason to have this fund."
  },
  { 
    id: '6', 
    title: 'Layoff / Job Loss', 
    cost: 2000, 
    type: 'emergency', 
    description: "Company downsizing. You need to pay rent while looking for work.",
    reason: "This is the ultimate purpose of the fund: Income replacement during a crisis."
  },
  { 
    id: '7', 
    title: 'Concert Tickets', 
    cost: 300, 
    type: 'luxury', 
    description: "Your favorite band is touring one last time.",
    reason: "Good pass. 'FOMO' (Fear Of Missing Out) is not a financial emergency."
  },
  { 
    id: '8', 
    title: 'Leaking Roof', 
    cost: 1800, 
    type: 'emergency', 
    description: "Water is dripping onto your bed during a storm.",
    reason: "Home integrity is a need. If you don't fix this, the damage gets worse. Use the fund."
  },
  { 
    id: '9', 
    title: 'New iPhone Launch', 
    cost: 1100, 
    type: 'luxury', 
    description: "Your current phone works, but the new one has Titanium edges.",
    reason: "Exactly. Wanting an upgrade is a luxury, not a survival need."
  },
  { 
    id: '10', 
    title: 'Last Minute Flight Home', 
    cost: 900, 
    type: 'emergency', 
    description: "A family member is critically ill. You need to be there tonight.",
    reason: "Family emergencies are valid. You can't plan for this, so use the shield."
  }
];

export default function VaultGuardian() {
  const [index, setIndex] = useState(0);
  const [fundBalance, setFundBalance] = useState(10000); 
  const [walletBalance, setWalletBalance] = useState(1500);
  const [integrity, setIntegrity] = useState(100);
  const [feedback, setFeedback] = useState<{msg: string, type: 'neutral'|'success'|'error'}>({
    msg: "Defend the Vault! Only touch the Emergency Fund for TRUE emergencies.",
    type: 'neutral'
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose_debt' | 'lose_integrity' | null>(null);
  
  // New state to prevent race conditions during transitions
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentScenario = SCENARIOS[index];

  // Safety check
  if (!currentScenario && !isGameOver) {
      return <div className="p-10 text-center text-white">Loading next scenario...</div>;
  }

  const handleDecision = (decision: 'fund' | 'budget' | 'reject') => {
    if(isGameOver || isTransitioning) return;

    const { type, cost, reason } = currentScenario;
    let nextIntegrity = integrity;
    let nextFund = fundBalance;
    let nextWallet = walletBalance;
    let gameOverType: 'lose_debt' | 'lose_integrity' | null = null;
    let msgType: 'success' | 'error' = 'success';
    let msgText = reason;

    // 1. EVALUATE DECISION
    if (decision === 'fund') {
      if (type === 'emergency') {
        nextFund -= cost;
        msgText = `✅ Approved. ${reason}`;
      } else {
        nextIntegrity -= 30;
        nextFund -= cost;
        msgType = 'error';
        msgText = `⚠️ Violation! ${reason}`;
      }
    } 
    else if (decision === 'budget') {
      if (type === 'budget') {
        if (walletBalance >= cost) {
          nextWallet -= cost;
          msgText = `✅ Good Budgeting. ${reason}`;
        } else {
          gameOverType = 'lose_debt';
          msgType = 'error';
          msgText = `💀 Bankruptcy! You tried to pay $${cost} with only $${walletBalance}.`;
        }
      } else if (type === 'emergency') {
         if (walletBalance >= cost) {
           nextWallet -= cost;
           msgText = `✅ Wow! Cash flowed an emergency. Impressive.`;
         } else {
           gameOverType = 'lose_debt';
           msgType = 'error';
           msgText = `💀 Ruin! You didn't use your Shield and went broke.`;
         }
      } else {
        if (walletBalance >= cost) {
           nextWallet -= cost;
           msgText = `⚠️ Okay... you paid for it, but was it wise?`;
        } else {
          gameOverType = 'lose_debt';
        }
      }
    } 
    else if (decision === 'reject') {
      if (type === 'luxury') {
        msgText = `✅ Smart. ${reason}`;
      } else {
        msgType = 'error';
        nextIntegrity -= 40;
        msgText = `❌ Negligence! You ignored a critical need.`;
      }
    }

    if (nextIntegrity <= 0) gameOverType = 'lose_integrity';
    
    setFundBalance(nextFund);
    setWalletBalance(nextWallet);
    setIntegrity(nextIntegrity);
    setFeedback({ msg: msgText, type: msgType });

    if (gameOverType) {
      setGameResult(gameOverType);
      setIsGameOver(true);
    } else {
      if (index < SCENARIOS.length - 1) {
        setIsTransitioning(true);
        // Small refill
        setWalletBalance(prev => Math.min(prev + 500, 2000)); 
        setTimeout(() => {
            setIndex(prev => prev + 1);
            setIsTransitioning(false);
            setFeedback({ msg: "Next event incoming...", type: 'neutral' });
        }, 2000);
      } else {
        finishGame();
      }
    }
  };

  const finishGame = () => {
    setIsGameOver(true);
    setGameResult('win');
    confetti({ particleCount: 200, spread: 120, colors: ['#10B981', '#F59E0B'] });
  };

  const resetGame = () => {
    setIndex(0);
    setFundBalance(10000);
    setWalletBalance(1500);
    setIntegrity(100);
    setIsGameOver(false);
    setGameResult(null);
    setIsTransitioning(false);
    setFeedback({ msg: "Defend the Vault!", type: 'neutral' });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900 text-slate-100 rounded-3xl shadow-2xl overflow-hidden border border-slate-700 min-h-[600px] flex flex-col md:flex-row font-sans">
      
      {/* --- LEFT PANEL --- */}
      <div className="w-full md:w-1/3 bg-slate-800 p-6 flex flex-col justify-between border-r border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
            <Shield className="text-emerald-500" /> Vault Guardian
          </h2>

          <div className="space-y-6">
            <StatBar 
                label="Emergency Fund" 
                amount={fundBalance} 
                max={10000} 
                color="bg-emerald-500" 
                icon={<Lock size={14} className="text-emerald-400"/>} 
            />
            <StatBar 
                label="Monthly Wallet" 
                amount={walletBalance} 
                max={2000} 
                color="bg-blue-500" 
                icon={<Wallet size={14} className="text-blue-400"/>} 
            />
             <div className="p-4 bg-slate-700/50 rounded-2xl border border-slate-600">
                <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase text-purple-400 tracking-wider">Discipline</span>
                <HeartPulse size={14} className="text-purple-400"/>
                </div>
                <div className="text-xl font-bold text-white mb-2">{integrity}%</div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-500 ${integrity < 40 ? 'bg-red-500' : 'bg-purple-500'}`} style={{ width: `${integrity}%` }}></div>
                </div>
            </div>
          </div>
        </div>
        <div className="mt-6 text-xs text-slate-500 text-center">Scenario {index + 1} of {SCENARIOS.length}</div>
      </div>

      {/* --- RIGHT PANEL --- */}
      <div className="w-full md:w-2/3 p-8 flex flex-col justify-center items-center relative bg-gradient-to-br from-slate-900 to-slate-800">
        <div className={`absolute top-6 left-6 right-6 p-4 rounded-xl text-sm border shadow-lg transition-all duration-300 z-20 ${
          feedback.type === 'error' ? 'bg-red-900/40 border-red-500/50 text-red-100' :
          feedback.type === 'success' ? 'bg-emerald-900/40 border-emerald-500/50 text-emerald-100' :
          'bg-slate-800 border-slate-600 text-slate-300'
        }`}>
           {feedback.msg}
        </div>

        {!isGameOver ? (
          <div className={`w-full max-w-md mt-12 transition-opacity duration-300 ${isTransitioning ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <div className="bg-white text-slate-900 rounded-3xl p-8 shadow-2xl mb-8 border-4 border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Incoming Expense</span>
                <AlertTriangle className="text-orange-500" />
              </div>
              <h3 className="text-2xl font-black mb-2 leading-tight">{currentScenario?.title}</h3>
              <p className="text-slate-500 mb-6 text-sm font-medium">{currentScenario?.description}</p>
              <div className="bg-slate-100 rounded-xl p-4 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Cost</span>
                <span className="text-3xl font-mono font-bold text-slate-900">-${currentScenario?.cost.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <GameBtn label="Use Fund" sub="Emergency" icon={<Shield size={20}/>} onClick={() => handleDecision('fund')} color="emerald" />
              <GameBtn label="Wallet" sub="Cash Flow" icon={<Wallet size={20}/>} onClick={() => handleDecision('budget')} color="blue" />
              <GameBtn label="Reject" sub="Not Needed" icon={<Ban size={20}/>} onClick={() => handleDecision('reject')} color="slate" />
            </div>
          </div>
        ) : (
          <ResultScreen result={gameResult} onReset={resetGame} balance={fundBalance} />
        )}
      </div>
    </div>
  );
}

// --- Subcomponents for cleaner code ---
const StatBar = ({ label, amount, max, color, icon }: any) => (
    <div className="p-4 bg-slate-700/50 rounded-2xl border border-slate-600">
        <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">{label}</span>
            {icon}
        </div>
        <div className="text-2xl font-mono font-bold text-white mb-2">${amount.toLocaleString()}</div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-500 ${color}`} style={{ width: `${Math.min((amount / max) * 100, 100)}%` }}></div>
        </div>
    </div>
);

const GameBtn = ({ label, sub, icon, onClick, color }: any) => {
    const colors: any = {
        emerald: "bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border-emerald-500/50",
        blue: "bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white border-blue-500/50",
        slate: "bg-slate-700 hover:bg-red-500 text-slate-300 hover:text-white border-slate-600"
    };
    return (
        <button onClick={onClick} className={`group relative px-2 py-4 border-2 rounded-xl font-bold transition-all flex flex-col items-center gap-1 ${colors[color]}`}>
            {icon}
            <span className="text-sm">{label}</span>
            <span className="text-[10px] opacity-70 font-normal">{sub}</span>
        </button>
    );
};

const ResultScreen = ({ result, onReset, balance }: any) => (
    <div className="text-center max-w-md animate-in fade-in zoom-in duration-500">
        {result === 'win' ? (
             <>
             <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6 drop-shadow-lg" />
             <h2 className="text-3xl font-black text-white mb-4">Guardian Status: ELITE</h2>
             <p className="text-slate-300 mb-8">You successfully protected the vault! Final Balance: <span className="text-emerald-400 font-mono">${balance.toLocaleString()}</span></p>
           </>
        ) : (
            <>
            <TrendingDown className="w-24 h-24 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-white mb-4">Game Over</h2>
            <p className="text-slate-300 mb-8">Your financial defenses collapsed.</p>
            </>
        )}
        <button onClick={onReset} className="px-8 py-4 bg-white hover:bg-slate-200 text-slate-900 rounded-full font-bold flex items-center gap-2 mx-auto transition-all">
            <RefreshCcw size={20} /> Try Again
        </button>
    </div>
);