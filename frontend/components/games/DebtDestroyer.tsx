"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Newspaper, 
  Briefcase, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertOctagon,
  RefreshCcw,
  Maximize2
} from "lucide-react";
import confetti from "canvas-confetti";

// --- Configuration ---
const INITIAL_CASH = 25000;
const WIN_GOAL = 100000;
const TICK_SPEED = 1500; // ms per market update

// --- Types ---
type Sector = 'TECH' | 'ENERGY' | 'PHARMA' | 'FINANCE';

interface Stock {
  symbol: string;
  name: string;
  sector: Sector;
  price: number;
  prevPrice: number;
  history: number[]; // For sparkline chart
  volatility: number; // How much it moves
  momentum: number; // Upward/Downward trend strength
}

interface PortfolioItem {
  shares: number; // Positive = Long, Negative = Short
  avgPrice: number;
}

interface NewsFlash {
  id: number;
  headline: string;
  sector: Sector | 'MARKET';
  impact: 'bull' | 'bear' | 'crash' | 'boom';
}

// --- Initial Market Data ---
const INITIAL_STOCKS: Stock[] = [
  { symbol: 'NEXUS', name: 'Nexus AI', sector: 'TECH', price: 150, prevPrice: 150, history: Array(20).fill(150), volatility: 2.5, momentum: 0 },
  { symbol: 'VOLT', name: 'Volt Energy', sector: 'ENERGY', price: 80, prevPrice: 80, history: Array(20).fill(80), volatility: 1.5, momentum: 0 },
  { symbol: 'CURE', name: 'OmniCure', sector: 'PHARMA', price: 210, prevPrice: 210, history: Array(20).fill(210), volatility: 3.0, momentum: 0 },
  { symbol: 'BANK', name: 'Iron Bank', sector: 'FINANCE', price: 45, prevPrice: 45, history: Array(20).fill(45), volatility: 0.8, momentum: 0 },
  { symbol: 'CYBR', name: 'CyberShield', sector: 'TECH', price: 120, prevPrice: 120, history: Array(20).fill(120), volatility: 2.0, momentum: 0 },
];

export default function TitanTrader() {
  // --- State ---
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS);
  const [portfolio, setPortfolio] = useState<Record<string, PortfolioItem>>({});
  const [cash, setCash] = useState(INITIAL_CASH);
  const [day, setDay] = useState(1);
  const [selectedStock, setSelectedStock] = useState<string>('NEXUS');
  const [news, setNews] = useState<NewsFlash | null>(null);
  const [marketSentiment, setMarketSentiment] = useState(0); // -10 (Bear) to 10 (Bull)
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'bankrupt' | null>(null);

  // Animation Refs
  const [flash, setFlash] = useState<string | null>(null); // For price flash effects

  // --- Derived State ---
  const currentStock = stocks.find(s => s.symbol === selectedStock) || stocks[0];
  const portfolioValue = Object.entries(portfolio).reduce((total, [symbol, item]) => {
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return total;
    // Calculate value: 
    // Long: (Price * Shares)
    // Short: (Entry Price * Shares) + ((Entry Price - Current Price) * Shares) -> Simplified logic needed for net worth
    // Net Worth Logic: Cash + (Shares * CurrentPrice) - (ShortDebt)
    // Simplified: Cash + Unrealized P&L + Cost Basis
    return total + (item.shares * stock.price); 
  }, 0);
  
  const netWorth = cash + portfolioValue;

  // --- Engine: The Market Beat ---
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      marketTick();
    }, TICK_SPEED);

    return () => clearInterval(interval);
  }, [stocks, marketSentiment, day, gameOver]);

  const marketTick = () => {
    setDay(d => d + 1);

    // 1. Random News Event (15% chance)
    if (Math.random() < 0.15) generateNews();

    // 2. Update Prices
    setStocks(prevStocks => prevStocks.map(stock => {
      let move = (Math.random() - 0.5) * stock.volatility;
      
      // Apply Momentum & Sentiment
      move += (stock.momentum * 0.5); 
      move += (marketSentiment * 0.1);

      // News Impact Check
      if (news && (news.sector === stock.sector || news.sector === 'MARKET')) {
         if (news.impact === 'boom') move += 5;
         if (news.impact === 'crash') move -= 5;
         if (news.impact === 'bull') move += 2;
         if (news.impact === 'bear') move -= 2;
      }

      // Calculate new price
      let newPrice = stock.price + move;
      newPrice = Math.max(1, newPrice); // Prevent 0 or negative
      
      // Update Momentum (Mean Reversion vs Trend Following)
      const newMomentum = stock.momentum * 0.9 + (move * 0.1); 

      // Update History
      const newHistory = [...stock.history.slice(1), newPrice];

      return {
        ...stock,
        prevPrice: stock.price,
        price: newPrice,
        history: newHistory,
        momentum: newMomentum
      };
    }));

    // Win/Loss Check
    if (netWorth >= WIN_GOAL) {
      setGameOver(true);
      setGameResult('win');
      confetti();
    } else if (netWorth <= 0) {
      setGameOver(true);
      setGameResult('bankrupt');
    }
  };

  const generateNews = () => {
    const sectors: Sector[] = ['TECH', 'ENERGY', 'PHARMA', 'FINANCE'];
    const targetSector = sectors[Math.floor(Math.random() * sectors.length)];
    const types: ('bull'|'bear'|'crash'|'boom')[] = ['bull', 'bear', 'crash', 'boom'];
    const type = types[Math.floor(Math.random() * types.length)];

    const headlines = {
      TECH: { boom: "AI Breakthrough!", crash: "Data Leak Scandal!", bull: "Tech Earnings Up", bear: "Chip Shortage" },
      ENERGY: { boom: "Oil Field Discovered!", crash: "Pipeline Burst!", bull: "Cold Winter Expected", bear: "Solar Costs Drop" },
      PHARMA: { boom: "FDA Approval!", crash: "Clinical Trial Failed", bull: "Flu Season Spike", bear: "Patent Expiring" },
      FINANCE: { boom: "Rates Lowered!", crash: "Housing Bubble Pops", bull: "Spending Up", bear: "Inflation Fears" }
    };

    setNews({
      id: Date.now(),
      headline: headlines[targetSector][type],
      sector: targetSector,
      impact: type
    });

    // Clear news after 2 ticks
    setTimeout(() => setNews(null), TICK_SPEED * 2.5);
  };

  // --- Trading Logic ---
  const handleTrade = (action: 'buy' | 'sell') => {
    if (gameOver) return;

    const sharesAmount = 10; // Fixed block trading for speed
    const cost = currentStock.price * sharesAmount;

    setPortfolio(prev => {
      const currentPos = prev[currentStock.symbol] || { shares: 0, avgPrice: 0 };
      let newShares = currentPos.shares;
      let newCash = cash;

      if (action === 'buy') {
        // Buying (Long) or Covering (Closing Short)
        if (newCash < cost) {
          triggerFlash('red'); // Insufficient Funds visual
          return prev; 
        }
        newCash -= cost;
        newShares += sharesAmount;
      } else {
        // Selling (Closing Long) or Shorting (Opening Short)
        // Shorting adds cash now, but creates a liability
        newCash += cost; 
        newShares -= sharesAmount;
      }

      setCash(newCash);
      triggerFlash(action === 'buy' ? 'green' : 'orange');
      
      // Remove from portfolio if 0 shares
      if (newShares === 0) {
        const { [currentStock.symbol]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [currentStock.symbol]: { shares: newShares, avgPrice: currentStock.price } // Simplified avg price for game speed
      };
    });
  };

  const triggerFlash = (color: string) => {
    setFlash(color);
    setTimeout(() => setFlash(null), 300);
  };

  // --- Helper Components ---
  const StockCard = ({ stock, isSelected }: { stock: Stock, isSelected: boolean }) => {
    const change = stock.price - stock.prevPrice;
    const pct = ((change / stock.prevPrice) * 100).toFixed(2);
    const isUp = change >= 0;

    return (
      <button 
        onClick={() => setSelectedStock(stock.symbol)}
        className={`w-full p-3 mb-2 rounded-xl flex justify-between items-center transition-all ${
          isSelected 
            ? 'bg-slate-700 border-l-4 border-blue-500 shadow-lg' 
            : 'bg-slate-800 border-l-4 border-transparent hover:bg-slate-750'
        }`}
      >
        <div className="text-left">
          <div className="font-bold text-white text-sm">{stock.symbol}</div>
          <div className="text-[10px] text-slate-400">{stock.name}</div>
        </div>
        
        {/* Mini Sparkline SVG */}
        <div className="w-16 h-8">
           <Sparkline data={stock.history} color={isUp ? '#10b981' : '#ef4444'} />
        </div>

        <div className="text-right">
          <div className="text-white font-mono font-bold">${stock.price.toFixed(2)}</div>
          <div className={`text-xs flex items-center justify-end ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
             {isUp ? <TrendingUp size={10} className="mr-1"/> : <TrendingDown size={10} className="mr-1"/>}
             {pct}%
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-slate-950 text-slate-100 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 min-h-[600px] flex flex-col font-sans">
      
      {/* --- HEADER: HUD --- */}
      <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center relative overflow-hidden">
         {/* Background Pulse Effect on Trade */}
         {flash && (
           <div className={`absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-300 ${
             flash === 'green' ? 'bg-emerald-500' : flash === 'red' ? 'bg-red-500' : 'bg-orange-500'
           }`}></div>
         )}

         <div className="flex gap-6 z-10">
            <div>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Net Worth</p>
               <p className="text-2xl font-black text-white flex items-center gap-1">
                 {netWorth >= INITIAL_CASH ? <TrendingUp className="text-emerald-500" size={20}/> : <TrendingDown className="text-red-500" size={20}/>}
                 ${Math.floor(netWorth).toLocaleString()}
               </p>
               <p className="text-[10px] text-slate-400">Goal: ${WIN_GOAL.toLocaleString()}</p>
            </div>
            <div>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Liquid Cash</p>
               <p className="text-2xl font-mono text-blue-300">${Math.floor(cash).toLocaleString()}</p>
            </div>
         </div>

         {/* News Ticker */}
         <div className="flex-1 mx-8 h-10 bg-slate-950 rounded-lg border border-slate-800 flex items-center px-4 relative overflow-hidden">
            {news ? (
              <div className="flex items-center gap-2 animate-in slide-in-from-right duration-500 text-sm font-bold text-white">
                 <Newspaper size={16} className="text-yellow-400 animate-pulse" />
                 <span className="text-yellow-400">BREAKING:</span> {news.headline}
              </div>
            ) : (
              <div className="text-xs text-slate-600 flex items-center gap-2">
                 <Activity size={12} /> Market Stable... waiting for updates.
              </div>
            )}
         </div>

         <div className="z-10 text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Trading Day</p>
            <p className="text-xl font-bold text-white">Day {day}</p>
         </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex flex-1 md:flex-row flex-col">
        
        {/* LEFT: Market Watch */}
        <div className="w-full md:w-1/4 bg-slate-900 border-r border-slate-800 p-4 overflow-y-auto">
           <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
             <Activity size={14}/> Market Watch
           </h3>
           {stocks.map(s => (
             <StockCard key={s.symbol} stock={s} isSelected={selectedStock === s.symbol} />
           ))}
        </div>

        {/* CENTER: Trading Terminal */}
        <div className="flex-1 bg-slate-950 p-6 flex flex-col relative">
           
           {!gameOver ? (
             <>
               {/* Stock Header */}
               <div className="flex justify-between items-start mb-6">
                 <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">{currentStock.symbol}</h1>
                    <p className="text-slate-400">{currentStock.name} <span className="text-slate-600">|</span> <span className="text-blue-400 text-xs font-bold bg-blue-400/10 px-2 py-0.5 rounded">{currentStock.sector}</span></p>
                 </div>
                 <div className="text-right">
                    <p className="text-5xl font-mono font-medium text-white">${currentStock.price.toFixed(2)}</p>
                    <p className={`text-sm font-bold ${currentStock.price >= currentStock.prevPrice ? 'text-emerald-500' : 'text-red-500'}`}>
                       {(currentStock.price - currentStock.prevPrice).toFixed(2)} ({(((currentStock.price - currentStock.prevPrice)/currentStock.prevPrice)*100).toFixed(2)}%)
                    </p>
                 </div>
               </div>

               {/* Main Chart */}
               <div className="flex-1 bg-slate-900/50 rounded-2xl border border-slate-800 p-4 mb-6 relative group">
                  <div className="absolute top-4 left-4 text-xs text-slate-500 font-bold">LIVE PRICE ACTION</div>
                  <div className="w-full h-full flex items-end px-2 pb-2">
                      <Sparkline 
                        data={currentStock.history} 
                        color={currentStock.price >= currentStock.history[0] ? '#10b981' : '#ef4444'} 
                        strokeWidth={3}
                        fill={true}
                      />
                  </div>
               </div>

               {/* Control Panel */}
               <div className="grid grid-cols-2 gap-6 h-32">
                  
                  {/* Position Info */}
                  <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
                     <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-500 uppercase">Your Position</span>
                        <Briefcase size={16} className="text-slate-600" />
                     </div>
                     <div>
                        <div className="text-2xl font-bold text-white">
                           {portfolio[currentStock.symbol]?.shares || 0} Shares
                        </div>
                        {portfolio[currentStock.symbol] && (
                           <div className="text-xs text-slate-400">
                             Avg Cost: ${portfolio[currentStock.symbol].avgPrice.toFixed(2)}
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Buy/Sell Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                     <button 
                       onClick={() => handleTrade('buy')}
                       className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex flex-col items-center justify-center transition-all hover:scale-[1.02] active:scale-95 group"
                     >
                        <span className="text-xs font-bold uppercase opacity-80 mb-1">Buy / Cover</span>
                        <div className="flex items-center gap-1 font-black text-xl">
                           <ArrowUpRight size={20} className="group-hover:-translate-y-1 transition-transform"/> BUY
                        </div>
                        <span className="text-[10px] opacity-60">10 Shares</span>
                     </button>

                     <button 
                       onClick={() => handleTrade('sell')}
                       className="bg-red-600 hover:bg-red-500 text-white rounded-xl flex flex-col items-center justify-center transition-all hover:scale-[1.02] active:scale-95 group"
                     >
                        <span className="text-xs font-bold uppercase opacity-80 mb-1">Sell / Short</span>
                        <div className="flex items-center gap-1 font-black text-xl">
                           <ArrowDownRight size={20} className="group-hover:translate-y-1 transition-transform"/> SELL
                        </div>
                        <span className="text-[10px] opacity-60">10 Shares</span>
                     </button>
                  </div>
               </div>
             </>
           ) : (
             <ResultScreen result={gameResult} reset={() => window.location.reload()} />
           )}
        </div>
      </div>
    </div>
  );
}

// --- Custom Sparkline Component (No Charts.js needed!) ---
const Sparkline = ({ data, color, strokeWidth = 2, fill = false }: { data: number[], color: string, strokeWidth?: number, fill?: boolean }) => {
   const max = Math.max(...data) * 1.05;
   const min = Math.min(...data) * 0.95;
   const range = max - min;
   
   // Create SVG path points
   const points = data.map((val, i) => {
     const x = (i / (data.length - 1)) * 100;
     const y = 100 - ((val - min) / range) * 100;
     return `${x},${y}`;
   }).join(" ");

   return (
     <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
        {fill && (
           <path 
             d={`M 0,100 ${points.split(" ").map(p => "L " + p).join(" ")} L 100,100 Z`} 
             fill={color} 
             fillOpacity="0.1" 
             stroke="none"
           />
        )}
        <polyline 
           fill="none" 
           stroke={color} 
           strokeWidth={strokeWidth} 
           points={points} 
           vectorEffect="non-scaling-stroke"
           strokeLinecap="round"
           strokeLinejoin="round"
        />
     </svg>
   );
};

const ResultScreen = ({ result, reset }: any) => (
  <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
     {result === 'win' ? (
        <>
          <Maximize2 className="w-24 h-24 text-emerald-400 mb-6 animate-bounce" />
          <h2 className="text-5xl font-black text-white mb-2">Market Titan!</h2>
          <p className="text-xl text-slate-400 mb-8">You reached $100,000 net worth. Wall Street bows to you.</p>
        </>
     ) : (
        <>
          <AlertOctagon className="w-24 h-24 text-red-500 mb-6 animate-pulse" />
          <h2 className="text-5xl font-black text-white mb-2">Insolvent</h2>
          <p className="text-xl text-slate-400 mb-8">You lost it all. The market is unforgiving.</p>
        </>
     )}
     <button onClick={reset} className="px-8 py-4 bg-white text-slate-900 font-bold rounded-full hover:scale-105 transition-all flex items-center gap-2">
        <RefreshCcw size={20}/> Play Again
     </button>
  </div>
);
