"use client";
import React, { useState, useEffect } from "react";
import { 
  Rocket, 
  Users, 
  PieChart, 
  TrendingUp, 
  Zap, 
  AlertTriangle, 
  Briefcase,
  DollarSign,
  Building2,
  CheckCircle2,
  XCircle,
  RefreshCcw
} from "lucide-react";
import confetti from "canvas-confetti";

// --- Game Constants ---
const TARGET_VALUATION = 1000000000; // $1 Billion (Unicorn)
const STARTING_CASH = 500000; // Seed money
const MONTHLY_BURN = 50000; // Starting expenses

// --- Types ---
interface InvestorOffer {
  id: string;
  name: string;
  valuation: number; // Offered Valuation
  investment: number; // Cash offered
  equityAsk: number; // % they want
  reputation: 'Shark' | 'Angel' | 'VC Firm';
}

export default function IPOArchitect() {
  // --- State ---
  const [valuation, setValuation] = useState(2000000); // Start at $2M
  const [cash, setCash] = useState(STARTING_CASH);
  const [equity, setEquity] = useState(100); // You own 100% initially
  const [users, setUsers] = useState(100);
  const [month, setMonth] = useState(1);
  const [burnRate, setBurnRate] = useState(MONTHLY_BURN);
  
  const [offer, setOffer] = useState<InvestorOffer | null>(null);
  const [eventMsg, setEventMsg] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'unicorn' | 'bankrupt' | 'fired'>('playing');

  // Animation triggers
  const [pulse, setPulse] = useState(false);

  // --- Logic ---

  // Game Tick (Every "Month")
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const timer = setInterval(() => {
      processMonth();
    }, 2000);

    return () => clearInterval(timer);
  }, [cash, users, gameStatus, burnRate]);

  const processMonth = () => {
    // 1. Burn Cash
    const newCash = cash - burnRate;
    
    // 2. Grow Users (based on valuation/hype)
    // Growth slows down if cash is low (cutting marketing)
    const growthFactor = 1.1 + (Math.random() * 0.1); 
    const newUsers = Math.floor(users * growthFactor);

    // 3. Update Valuation (Simulated: $100 per user + Hype multiplier)
    const hypeMultiplier = Math.random() * 2 + 1; // 1x to 3x
    const newValuation = Math.floor(newUsers * 100 * hypeMultiplier);

    // 4. Random Events (Investor Offers or Crises)
    if (Math.random() < 0.3 && !offer) {
       generateOffer(newValuation);
    } else if (Math.random() < 0.1) {
       triggerCrisis();
    }

    setCash(newCash);
    setUsers(newUsers);
    setValuation(newValuation);
    setMonth(m => m + 1);

    // Win/Loss Checks
    if (newCash <= 0) setGameStatus('bankrupt');
    if (newValuation >= TARGET_VALUATION) {
       setGameStatus('unicorn');
       confetti();
    }
  };

  const generateOffer = (currentVal: number) => {
    const types: ('Shark'|'Angel'|'VC Firm')[] = ['Shark', 'Angel', 'VC Firm'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Lowball or Fair offer logic
    const offerVal = type === 'Shark' ? currentVal * 0.6 : currentVal * 1.2;
    const investment = Math.floor(offerVal * 0.15); // They usually want 10-20%
    const equityAsk = 15;

    setOffer({
      id: Date.now().toString(),
      name: type === 'Shark' ? "Predatory Capital" : type === 'Angel' ? "Friendly Angel" : "Sequoia-ish Capital",
      valuation: Math.floor(offerVal),
      investment: investment,
      equityAsk: equityAsk,
      reputation: type
    });
  };

  const triggerCrisis = () => {
    const crises = [
      { msg: "Server Crash! Users angry.", cost: 20000 },
      { msg: "Key Engineer Quit. Hiring costs up.", cost: 15000 },
      { msg: "Competitor Launched. Marketing spend up.", cost: 30000 }
    ];
    const crisis = crises[Math.floor(Math.random() * crises.length)];
    setCash(prev => prev - crisis.cost);
    setEventMsg(`⚠️ ${crisis.msg} (-$${crisis.cost})`);
    setTimeout(() => setEventMsg(null), 3000);
  };

  const handleOffer = (accept: boolean) => {
    if (!offer) return;

    if (accept) {
      // Dilution Logic: You get cash, but lose equity
      // Advanced: Ensure you don't drop below 51% too early or you get fired!
      const newEquity = equity - offer.equityAsk;
      
      if (newEquity < 50) {
        setGameStatus('fired'); // Board of Directors kicks you out
        return;
      }

      setCash(prev => prev + offer.investment);
      setEquity(newEquity);
      // Investment boosts burn rate (hiring more people)
      setBurnRate(prev => prev * 1.5); 
      setEventMsg(`💰 Funding Secured! +$${offer.investment.toLocaleString()} (Equity: -${offer.equityAsk}%)`);
      triggerPulse();
    } else {
      setEventMsg("Offer Rejected. Bootstrapping continues...");
    }
    setOffer(null);
    setTimeout(() => setEventMsg(null), 3000);
  };

  const triggerPulse = () => {
    setPulse(true);
    setTimeout(() => setPulse(false), 500);
  };

  // --- Formatter ---
  const formatMoney = (n: number) => {
    if (n >= 1000000000) return `$${(n / 1000000000).toFixed(1)}B`;
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    return `$${(n / 1000).toFixed(0)}k`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-900 text-slate-100 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 min-h-[600px] flex flex-col md:flex-row font-sans">
      
      {/* --- LEFT: Founder's Dashboard --- */}
      <div className="w-full md:w-1/3 bg-slate-950 p-8 border-r border-slate-800 flex flex-col gap-6 relative">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
         
         <div>
            <h2 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
               <Rocket className="text-blue-500" /> IPO Architect
            </h2>
            <p className="text-slate-400 text-xs">Build a Unicorn ($1B). Don't run out of cash.</p>
         </div>

         {/* Stats Grid */}
         <div className="grid grid-cols-1 gap-4">
            <div className={`p-4 bg-slate-900 rounded-xl border border-slate-800 transition-all duration-300 ${pulse ? 'scale-105 border-blue-500' : ''}`}>
               <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Valuation</span>
                  <TrendingUp size={14} className="text-blue-400"/>
               </div>
               <div className="text-3xl font-black text-white">{formatMoney(valuation)}</div>
               <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000" style={{width: `${(valuation / TARGET_VALUATION) * 100}%`}}></div>
               </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
               <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Runway (Cash)</span>
                  <DollarSign size={14} className={cash < MONTHLY_BURN * 3 ? "text-red-500 animate-pulse" : "text-emerald-400"}/>
               </div>
               <div className={`text-2xl font-mono font-bold ${cash < MONTHLY_BURN * 3 ? "text-red-400" : "text-emerald-400"}`}>
                  {formatMoney(cash)}
               </div>
               <div className="text-[10px] text-slate-500 mt-1">
                  Burn: <span className="text-red-400">-{formatMoney(burnRate)}/mo</span>
               </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
               <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Your Equity</span>
                  <PieChart size={14} className="text-purple-400"/>
               </div>
               <div className="text-2xl font-bold text-white">{equity}%</div>
               <div className="text-[10px] text-slate-500 mt-1">Don't drop below 50%</div>
            </div>
         </div>
         
         <div className="mt-auto pt-6 border-t border-slate-900">
            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
               <span>Users: {users.toLocaleString()}</span>
               <span>Month {month}</span>
            </div>
         </div>
      </div>

      {/* --- RIGHT: The Boardroom --- */}
      <div className="w-full md:w-2/3 p-8 bg-slate-900 relative flex flex-col">
         
         {/* Background Decoration */}
         <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>

         {/* Dynamic Event Area */}
         <div className="flex-1 flex flex-col items-center justify-center z-10">
            
            {/* Notifications */}
            {eventMsg && (
               <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-top-4">
                  <Zap size={16} className="text-yellow-400" />
                  {eventMsg}
               </div>
            )}

            {gameStatus === 'playing' ? (
               offer ? (
                  /* --- INVESTOR OFFER CARD --- */
                  <div className="max-w-md w-full bg-white text-slate-900 rounded-2xl p-8 shadow-2xl animate-in zoom-in duration-300 border-4 border-slate-200">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                           <Briefcase size={24} />
                        </div>
                        <div>
                           <h3 className="text-xl font-black uppercase tracking-tight">Term Sheet</h3>
                           <p className="text-xs font-bold text-slate-400 uppercase">{offer.reputation}</p>
                        </div>
                     </div>

                     <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                           <span className="text-sm font-bold text-slate-500">Investing</span>
                           <span className="text-xl font-mono font-bold text-emerald-600">+{formatMoney(offer.investment)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                           <span className="text-sm font-bold text-slate-500">For Equity</span>
                           <span className="text-xl font-mono font-bold text-purple-600">{offer.equityAsk}%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                           <span className="text-sm font-bold text-slate-500">Valuation</span>
                           <span className="text-lg font-bold text-slate-900">{formatMoney(offer.valuation)}</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <button 
                           onClick={() => handleOffer(false)}
                           className="py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                           Reject
                        </button>
                        <button 
                           onClick={() => handleOffer(true)}
                           className="py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all"
                        >
                           Sign Deal
                        </button>
                     </div>
                  </div>
               ) : (
                  /* --- IDLE STATE (Building...) --- */
                  <div className="text-center opacity-50">
                     <Building2 size={64} className="mx-auto mb-4 text-slate-700 animate-pulse" />
                     <h3 className="text-2xl font-black text-slate-600">Building Product...</h3>
                     <p className="text-slate-500">Growing users & burning cash.</p>
                  </div>
               )
            ) : (
               /* --- GAME OVER SCREENS --- */
               <div className="text-center animate-in zoom-in duration-500">
                  {gameStatus === 'unicorn' && (
                     <>
                        <Rocket className="w-24 h-24 text-purple-500 mx-auto mb-6 animate-bounce" />
                        <h2 className="text-5xl font-black text-white mb-2">UNICORN! 🦄</h2>
                        <p className="text-xl text-slate-400 mb-8">You IPO'd at {formatMoney(valuation)}. You are a legend.</p>
                     </>
                  )}
                  {gameStatus === 'bankrupt' && (
                     <>
                        <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6 opacity-80" />
                        <h2 className="text-4xl font-black text-white mb-2">Bankrupt</h2>
                        <p className="text-slate-400 mb-8">You ran out of runway. Game Over.</p>
                     </>
                  )}
                  {gameStatus === 'fired' && (
                     <>
                        <Users className="w-24 h-24 text-orange-500 mx-auto mb-6" />
                        <h2 className="text-4xl font-black text-white mb-2">You Were Fired</h2>
                        <p className="text-slate-400 mb-8">You gave up too much equity ({equity}% left). The Board voted you out.</p>
                     </>
                  )}
                  <button 
                     onClick={() => window.location.reload()}
                     className="px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:scale-105 transition-all flex items-center gap-2 mx-auto"
                  >
                     <RefreshCcw size={18}/> Start New Company
                  </button>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}