"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  History, 
  FastForward, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle,
  BrainCircuit,
  Plane,
  Home,
  Utensils,
  Skull,
  RotateCcw
} from "lucide-react";
import confetti from "canvas-confetti";

// --- Constants ---
const INFLATION_RATE = 0.03; // 3% Avg Inflation
const RETIREMENT_AGE = 65;

// --- Types ---
type RiskProfile = 'AGGRESSIVE' | 'BALANCED' | 'CONSERVATIVE';
type EconomicEra = 'BOOM' | 'STAGFLATION' | 'RECESSION' | 'GOLDILOCKS';

interface GameState {
  age: number;
  nominalBalance: number; // The number on the screen
  realPurchasingPower: number; // What it actually buys (adjusted for inflation)
  contributionRate: number; // Monthly savings
  riskProfile: RiskProfile;
  history: string[];
}

export default function ChronoVestor() {
  // --- State ---
  const [gameState, setGameState] = useState<GameState>({
    age: 25,
    nominalBalance: 10000,
    realPurchasingPower: 10000,
    contributionRate: 500,
    riskProfile: 'AGGRESSIVE',
    history: []
  });
  
  const [isWarping, setIsWarping] = useState(false);
  const [era, setEra] = useState<EconomicEra | null>(null);
  const [gameResult, setGameResult] = useState<'WIN' | 'MEDIOCRE' | 'POOR' | null>(null);

  // --- Logic ---

  const calculateReturns = (risk: RiskProfile, era: EconomicEra): number => {
    // Advanced Matrix: Risk vs Economic Conditions
    const matrix = {
      AGGRESSIVE: { BOOM: 0.12, GOLDILOCKS: 0.08, STAGFLATION: -0.05, RECESSION: -0.25 },
      BALANCED:   { BOOM: 0.07, GOLDILOCKS: 0.05, STAGFLATION: 0.02,  RECESSION: -0.10 },
      CONSERVATIVE:{ BOOM: 0.04, GOLDILOCKS: 0.03, STAGFLATION: 0.04,  RECESSION: 0.00 }
    };
    // Add some random noise +/- 1%
    const noise = (Math.random() * 0.02) - 0.01;
    return matrix[risk][era] + noise;
  };

  const getRandomEra = (): EconomicEra => {
    const r = Math.random();
    if (r < 0.3) return 'BOOM';
    if (r < 0.6) return 'GOLDILOCKS';
    if (r < 0.8) return 'STAGFLATION';
    return 'RECESSION';
  };

  const warpTime = (years: number) => {
    setIsWarping(true);
    
    // Determine the "Era" for this time jump
    const currentEra = getRandomEra();
    setEra(currentEra);

    setTimeout(() => {
      let balance = gameState.nominalBalance;
      let power = gameState.realPurchasingPower;
      const annualContrib = gameState.contributionRate * 12;
      
      // Calculate Compound Interest over the years
      // We simulate year-by-year to compound volatility
      for (let i = 0; i < years; i++) {
        const rate = calculateReturns(gameState.riskProfile, currentEra);
        
        // Investment Growth
        balance = balance * (1 + rate);
        
        // Add Contributions (Assuming contributions increase with inflation aka Raises)
        const adjustedContrib = annualContrib * Math.pow(1 + INFLATION_RATE, i);
        balance += adjustedContrib;
      }

      // Calculate Real Purchasing Power (Discounting future money back to today's dollars)
      // Formula: Nominal / (1 + Inflation)^TotalYearsPassed
      const totalYearsPassed = (gameState.age + years) - 25;
      const discountFactor = Math.pow(1 + INFLATION_RATE, totalYearsPassed);
      power = balance / discountFactor;

      const newAge = gameState.age + years;
      
      // Log History
      const log = `Age ${gameState.age}-${newAge}: Lived through ${currentEra}. Risk: ${gameState.riskProfile}. Balance: $${Math.floor(balance).toLocaleString()}`;

      setGameState(prev => ({
        ...prev,
        age: newAge,
        nominalBalance: balance,
        realPurchasingPower: power,
        history: [...prev.history, log]
      }));

      setIsWarping(false);

      if (newAge >= RETIREMENT_AGE) {
        finishGame(power);
      }
    }, 2000); // 2 second warp animation
  };

  const finishGame = (finalPower: number) => {
    // Benchmarks in "Today's Dollars"
    if (finalPower > 1500000) {
      setGameResult('WIN');
      confetti({ particleCount: 200, spread: 100 });
    } else if (finalPower > 750000) {
      setGameResult('MEDIOCRE');
    } else {
      setGameResult('POOR');
    }
  };

  const reset = () => {
    setGameState({
      age: 25,
      nominalBalance: 10000,
      realPurchasingPower: 10000,
      contributionRate: 500,
      riskProfile: 'AGGRESSIVE',
      history: []
    });
    setGameResult(null);
    setEra(null);
  };

  // --- Visual Helpers ---
  const getLifestyleIcon = (power: number) => {
    if (power > 1500000) return <Plane className="w-16 h-16 text-emerald-400" />;
    if (power > 750000) return <Home className="w-16 h-16 text-yellow-400" />;
    return <Utensils className="w-16 h-16 text-red-400" />; // Eating meagerly
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-black text-slate-100 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 min-h-[600px] flex flex-col relative font-sans">
      
      {/* --- HUD --- */}
      <div className="bg-slate-900/80 p-6 border-b border-slate-800 flex justify-between items-center z-20 backdrop-blur-md">
        <div className="flex items-center gap-4">
           <div className={`p-3 rounded-full border-2 ${isWarping ? 'animate-spin border-purple-500' : 'border-slate-600'}`}>
              <History size={24} className="text-purple-400" />
           </div>
           <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Current Timeline</p>
              <p className="text-3xl font-black text-white">AGE: {gameState.age}</p>
           </div>
        </div>

        <div className="text-right">
           <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Account Balance (Nominal)</p>
           <p className="text-3xl font-mono font-bold text-emerald-400">${Math.floor(gameState.nominalBalance).toLocaleString()}</p>
           <p className="text-xs text-slate-500">
             Real Value (Today's Dollars): <span className="text-white font-bold">${Math.floor(gameState.realPurchasingPower).toLocaleString()}</span>
           </p>
        </div>
      </div>

      {/* --- MAIN INTERFACE --- */}
      <div className="flex-1 flex relative">
        
        {/* Warp Effect Overlay */}
        {isWarping && (
           <div className="absolute inset-0 z-30 bg-black flex flex-col items-center justify-center">
              <div className="w-full h-full absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 animate-pulse"></div>
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-600 animate-pulse mb-8">
                 WARPING TIME...
              </div>
              <div className="text-2xl font-mono text-purple-300">
                 Simulating {era} Market Cycle
              </div>
           </div>
        )}

        {/* LEFT: Dashboard Controls */}
        <div className="w-full md:w-1/3 bg-slate-950 p-6 border-r border-slate-800 flex flex-col gap-6">
           
           {!gameResult ? (
             <>
               <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                    <BrainCircuit size={16}/> Strategy Configuration
                  </h3>
                  
                  {/* Contribution Slider */}
                  <div className="mb-6">
                     <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold text-white">Monthly Savings</span>
                        <span className="text-sm font-mono text-blue-400">${gameState.contributionRate}</span>
                     </div>
                     <input 
                       type="range" 
                       min="100" 
                       max="5000" 
                       step="100" 
                       value={gameState.contributionRate}
                       onChange={(e) => setGameState(prev => ({...prev, contributionRate: parseInt(e.target.value)}))}
                       className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                     />
                  </div>

                  {/* Risk Profile Selector */}
                  <div className="space-y-3">
                     <span className="text-sm font-bold text-white">Portfolio Allocation</span>
                     
                     <button 
                       onClick={() => setGameState(prev => ({...prev, riskProfile: 'AGGRESSIVE'}))}
                       className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${gameState.riskProfile === 'AGGRESSIVE' ? 'bg-purple-900/30 border-purple-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
                     >
                        <div className="flex items-center gap-2">
                           <TrendingUp size={18} /> <span>Aggressive</span>
                        </div>
                        <span className="text-[10px] bg-slate-950 px-2 py-1 rounded">100% Stocks</span>
                     </button>

                     <button 
                       onClick={() => setGameState(prev => ({...prev, riskProfile: 'BALANCED'}))}
                       className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${gameState.riskProfile === 'BALANCED' ? 'bg-blue-900/30 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
                     >
                        <div className="flex items-center gap-2">
                           <DollarSign size={18} /> <span>Balanced</span>
                        </div>
                        <span className="text-[10px] bg-slate-950 px-2 py-1 rounded">60/40 Split</span>
                     </button>

                     <button 
                       onClick={() => setGameState(prev => ({...prev, riskProfile: 'CONSERVATIVE'}))}
                       className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${gameState.riskProfile === 'CONSERVATIVE' ? 'bg-emerald-900/30 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
                     >
                        <div className="flex items-center gap-2">
                           <AlertTriangle size={18} /> <span>Conservative</span>
                        </div>
                        <span className="text-[10px] bg-slate-950 px-2 py-1 rounded">100% Bonds</span>
                     </button>
                  </div>
               </div>

               <div className="mt-auto">
                  <button 
                    onClick={() => warpTime(20)}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-lg rounded-2xl shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95"
                  >
                     <FastForward size={24} fill="currentColor" /> WARP 20 YEARS
                  </button>
                  <p className="text-[10px] text-center text-slate-500 mt-2">
                     Warning: Economic conditions are randomized.
                  </p>
               </div>
             </>
           ) : (
             <div className="h-full flex flex-col justify-center">
                <button onClick={reset} className="w-full py-4 bg-white text-slate-900 font-bold rounded-2xl flex items-center justify-center gap-2">
                   <RotateCcw size={20} /> Reset Timeline
                </button>
             </div>
           )}
        </div>

        {/* RIGHT: The Future Portal */}
        <div className="w-full md:w-2/3 bg-slate-900 relative overflow-hidden flex flex-col p-8">
           
           {/* Background Grid */}
           <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>

           {!gameResult ? (
             <div className="relative z-10 flex-1 flex flex-col">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Timeline Log</h3>
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
                   {gameState.history.length === 0 && (
                      <div className="text-center text-slate-600 mt-20">
                         <History size={48} className="mx-auto mb-4 opacity-50" />
                         <p>Time machine ready.</p>
                         <p className="text-sm">Configure strategy and Warp.</p>
                      </div>
                   )}
                   {gameState.history.map((log, i) => (
                      <div key={i} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-slate-300 animate-in slide-in-from-right-4 fade-in duration-500">
                         {log}
                      </div>
                   ))}
                </div>
             </div>
           ) : (
             <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center mb-6 shadow-2xl border-4 border-slate-700">
                   {getLifestyleIcon(gameState.realPurchasingPower)}
                </div>
                
                <h2 className={`text-5xl font-black mb-4 ${
                  gameResult === 'WIN' ? 'text-emerald-400' : 
                  gameResult === 'MEDIOCRE' ? 'text-yellow-400' : 'text-red-500'
                }`}>
                   {gameResult === 'WIN' ? 'WEALTHY RETIREMENT' : 
                    gameResult === 'MEDIOCRE' ? 'AVERAGE LIFESTYLE' : 'BROKE ELDERLY'}
                </h2>

                <p className="text-slate-400 max-w-lg text-lg mb-8 leading-relaxed">
                   {gameResult === 'WIN' 
                     ? "You mastered the timeline! Your aggressive investments paid off, and you weathered the inflation storm. Enjoy your private island."
                     : gameResult === 'MEDIOCRE'
                     ? "You survived. You can afford a modest home and occasional travel, but inflation ate a big chunk of your savings."
                     : "Disaster. Bad market timing or too much caution left you with very little purchasing power. You are greeting people at Walmart."}
                </p>

                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 w-full max-w-md">
                   <div className="flex justify-between mb-2">
                      <span className="text-slate-500 uppercase text-xs font-bold">Final Nominal Balance</span>
                      <span className="text-white font-mono">${Math.floor(gameState.nominalBalance).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-slate-500 uppercase text-xs font-bold">Real Purchasing Power</span>
                      <span className="text-emerald-400 font-mono font-bold">${Math.floor(gameState.realPurchasingPower).toLocaleString()}</span>
                   </div>
                </div>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}