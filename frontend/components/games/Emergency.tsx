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
  Lock,
  Info,
  CheckCircle2,
  XCircle
} from "lucide-react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

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

// Joyride steps
const joyrideSteps: Step[] = [
  {
    target: 'body',
    placement: 'center',
    title: 'Welcome to Vault Guardian!',
    content: 'Your mission is to protect your Emergency Fund. Learn when to use it and when to save it!',
    disableBeacon: true,
  },
  {
    target: '.stat-fund',
    title: 'Emergency Fund',
    content: 'This is your safety net. Only use it for unexpected, urgent, and necessary expenses.',
  },
  {
    target: '.stat-wallet',
    title: 'Monthly Wallet',
    content: 'This is your regular cash flow. Use this for planned expenses and daily needs.',
  },
  {
    target: '.stat-integrity',
    title: 'Financial Discipline',
    content: 'Making bad financial decisions hurts your discipline. Keep this high!',
  },
  {
    target: '.game-area',
    title: 'Decision Time',
    content: 'For each scenario, decide: Use the Fund, Pay from Wallet, or Reject the expense.',
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
  
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [runJoyride, setRunJoyride] = useState(false);

  const currentScenario = SCENARIOS[index];

  useEffect(() => {
    const tourShown = localStorage.getItem('vaultGuardianTourShown');
    if (!tourShown) {
      setRunJoyride(true);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    // Fix: Cast status to string to match Joyride's types or use string literals if possible in your setup. 
    // Ideally, `status` is already typed correctly by Joyride, but explicit check helps.
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRunJoyride(false);
      localStorage.setItem('vaultGuardianTourShown', 'true');
    }
  };

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
    <div className="w-full max-w-5xl mx-auto bg-gradient-to-br from-slate-900 to-slate-950 text-slate-100 rounded-[2rem] shadow-2xl border border-slate-800/50 overflow-hidden flex flex-col md:flex-row min-h-[700px] relative">
      
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
            primaryColor: '#10b981',
            textColor: '#fff',
            zIndex: 1000,
          },
          tooltip: {
            fontSize: '14px',
            borderRadius: '1rem',
          },
          buttonNext: {
            backgroundColor: '#10b981',
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

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      {/* --- LEFT PANEL --- */}
      <div className="w-full md:w-1/3 p-8 flex flex-col justify-between border-r border-slate-800/50 z-10 backdrop-blur-sm bg-slate-900/50">
        <div>
          <div className="mb-6">
             <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400 mb-1 flex items-center gap-2">
               <Shield className="text-emerald-500 fill-emerald-500/20" /> Vault Guardian
             </h2>
             <p className="text-slate-400 text-sm font-medium">Protect the fund. Maintain discipline.</p>
          </div>

          <div className="space-y-6">
            <StatBar 
                className="stat-fund"
                label="Emergency Fund" 
                amount={fundBalance} 
                max={10000} 
                color="bg-emerald-500" 
                bgClass="bg-emerald-500/10 border-emerald-500/20"
                icon={<Lock size={16} className="text-emerald-400"/>} 
            />
            <StatBar 
                className="stat-wallet"
                label="Monthly Wallet" 
                amount={walletBalance} 
                max={2000} 
                color="bg-blue-500" 
                bgClass="bg-blue-500/10 border-blue-500/20"
                icon={<Wallet size={16} className="text-blue-400"/>} 
            />
             <div className="stat-integrity p-5 bg-purple-500/10 rounded-2xl border border-purple-500/20 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase text-purple-400 tracking-wider">Discipline</span>
                <HeartPulse size={16} className="text-purple-400"/>
                </div>
                <div className="text-2xl font-mono font-bold text-white mb-2">{integrity}%</div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: `${integrity}%` }}
                    className={`h-full transition-colors duration-500 ${integrity < 40 ? 'bg-red-500' : 'bg-purple-500'}`} 
                />
                </div>
            </div>
          </div>
        </div>
        <div className="mt-6 text-xs text-slate-500 text-center font-mono">Scenario {index + 1} / {SCENARIOS.length}</div>
        
        {/* Description Box */}
        <div className="mt-4 p-4 bg-slate-800/60 rounded-xl border border-slate-700/50 text-sm text-slate-300 leading-relaxed backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-slate-100 font-bold">
            <Info size={16} className="text-blue-400" />
            <span>Mission Brief</span>
          </div>
          <p>
            An emergency fund is your shield against life's surprises. Your goal is to distinguish between true emergencies (needs) and planned expenses or wants. Keep your discipline high!
          </p>
        </div>
      </div>

      {/* --- RIGHT PANEL --- */}
      <div className="w-full md:w-2/3 p-8 flex flex-col justify-center items-center relative z-10">
        
        {/* Feedback Toast */}
        <AnimatePresence mode="wait">
            <motion.div 
                key={feedback.msg}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`absolute top-6 left-6 right-6 p-4 rounded-xl text-sm border shadow-lg backdrop-blur-md z-20 font-medium flex items-start gap-3 ${
                feedback.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-200' :
                feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' :
                'bg-slate-800/80 border-slate-700 text-slate-300'
                }`}
            >
                <div className={`mt-0.5 shrink-0 ${feedback.type === 'error' ? 'text-red-400' : feedback.type === 'success' ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {feedback.type === 'success' ? <CheckCircle2 size={18} /> : feedback.type === 'error' ? <XCircle size={18} /> : <Info size={18} />}
                </div>
                <span>{feedback.msg}</span>
            </motion.div>
        </AnimatePresence>

        {!isGameOver ? (
          <motion.div 
            key={currentScenario.id}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`game-area w-full max-w-md mt-16 transition-opacity duration-300 ${isTransitioning ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
          >
            <div className="bg-white text-slate-900 rounded-3xl p-8 shadow-2xl mb-8 border-4 border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                  <AlertTriangle size={120} />
              </div>
              
              <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">Incoming Expense</span>
                  </div>
                  <h3 className="text-3xl font-black mb-3 leading-tight tracking-tight">{currentScenario?.title}</h3>
                  <p className="text-slate-600 mb-8 text-base font-medium leading-relaxed">{currentScenario?.description}</p>
                  
                  <div className="bg-slate-50 rounded-2xl p-5 flex justify-between items-center border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cost</span>
                    <span className="text-4xl font-black text-slate-900 tracking-tight">-${currentScenario?.cost.toLocaleString()}</span>
                  </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <GameBtn label="Use Fund" sub="Emergency" icon={<Shield size={24}/>} onClick={() => handleDecision('fund')} color="emerald" />
              <GameBtn label="Wallet" sub="Cash Flow" icon={<Wallet size={24}/>} onClick={() => handleDecision('budget')} color="blue" />
              <GameBtn label="Reject" sub="Not Needed" icon={<Ban size={24}/>} onClick={() => handleDecision('reject')} color="slate" />
            </div>
          </motion.div>
        ) : (
          <ResultScreen result={gameResult} onReset={resetGame} balance={fundBalance} />
        )}
      </div>
    </div>
  );
}

// --- Subcomponents ---
const StatBar = ({ label, amount, max, color, bgClass, icon, className }: any) => (
    <div className={`p-5 rounded-2xl border shadow-sm ${bgClass} ${className}`}>
        <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">{label}</span>
            {icon}
        </div>
        <div className="text-2xl font-mono font-bold text-white mb-2">${amount.toLocaleString()}</div>
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((amount / max) * 100, 100)}%` }}
                className={`h-full ${color}`} 
            />
        </div>
    </div>
);

const GameBtn = ({ label, sub, icon, onClick, color }: any) => {
    const colors: any = {
        emerald: "bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border-emerald-500/50 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20",
        blue: "bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white border-blue-500/50 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20",
        slate: "bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white border-slate-700 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20"
    };
    return (
        <button onClick={onClick} className={`group relative px-2 py-5 border rounded-2xl font-bold transition-all duration-300 flex flex-col items-center gap-2 active:scale-95 ${colors[color]}`}>
            <div className="mb-1 transform transition-transform group-hover:scale-110 duration-300">{icon}</div>
            <span className="text-sm leading-none">{label}</span>
            <span className="text-[10px] opacity-60 font-medium">{sub}</span>
        </button>
    );
};

const ResultScreen = ({ result, onReset, balance }: any) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md bg-slate-800/50 p-10 rounded-3xl border border-slate-700/50 backdrop-blur-md shadow-2xl"
    >
        {result === 'win' ? (
             <>
             <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                <Trophy className="w-12 h-12 text-yellow-400 drop-shadow-lg" />
             </div>
             <h2 className="text-4xl font-black text-white mb-4">Guardian Status: <span className="text-yellow-400">ELITE</span></h2>
             <p className="text-slate-300 mb-8 text-lg">You successfully protected the vault! <br/>Final Balance: <span className="text-emerald-400 font-mono font-bold">${balance.toLocaleString()}</span></p>
            </>
        ) : (
            <>
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <TrendingDown className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-4xl font-black text-white mb-4">Game Over</h2>
            <p className="text-slate-300 mb-8 text-lg">Your financial defenses collapsed. Discipline or funds ran out.</p>
            </>
        )}
        <button onClick={onReset} className="px-10 py-4 bg-white hover:bg-slate-200 text-slate-900 rounded-xl font-bold flex items-center gap-2 mx-auto transition-all hover:scale-105 shadow-xl">
            <RefreshCcw size={20} /> Try Again
        </button>
    </motion.div>
);