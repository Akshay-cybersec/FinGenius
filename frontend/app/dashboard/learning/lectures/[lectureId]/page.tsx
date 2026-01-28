"use client";

import React, { use } from 'react'; // 1. Import 'use' to unwrap params
import { ArrowLeft, Construction, Gamepad2, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// --- Import Your Game Components ---
// Ensure this path matches where you saved the BudgetArchitect file
import BudgetArchitect from '@/components/games/BudgetArchitect';
import Emergency from '@/components/games/Emergency';
import DebtDestroyer from '@/components/games/DebtDestroyer'; 
import Credit from '@/components/games/Credit';
import GoodBad from '@/components/games/GoodBad'; 
import StockSimulator from '@/components/games/StockSimulator';
import Retirement from '@/components/games/Retirement';
// Future imports (Commented out until you create them)
// import StockSimulator from '@/components/games/StockSimulator'; 
// import DebtDestroyer from '@/components/games/DebtDestroyer'; 

// 2. Type definition: params is a Promise in Next.js 15
interface PageProps {
  params: Promise<{ lectureId: string }>;
}

export default function LecturePage({ params }: PageProps) {
  // 3. Unwrap the params using the React.use() hook
  const { lectureId } = use(params);

  // --- The Game Registry ---
  // This function decides which component to render based on the URL
  const renderGame = () => {
    switch (lectureId) {
      case 'budgeting': 
        return <BudgetArchitect />;
      
      case 'investing':
        return (
          <PlaceholderGame 
            title="Stock Market Simulator" 
            icon={<TrendingUp size={48} />}
            description="Learn how to trade ETFs and Stocks without losing real money."
          />
        );

      case 'debt':
        return <DebtDestroyer />;

        
        case '3':
        return <Emergency />;

         case '4':
        return <Credit />;

        case '5':
        return <GoodBad />;

        case '6':
        return <StockSimulator />;

        case '7':
        return <Retirement />;

      default:
        // If the ID doesn't match any known game, show 404
        return notFound();
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 p-6 font-sans">
      
      {/* --- Top Navigation Bar --- */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center gap-4">
        <Link 
          href="/dashboard/learning" 
          className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 hover:text-white transition-all border border-slate-700 shadow-lg group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </Link>
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <p className="text-[10px] font-bold uppercase text-blue-400 tracking-widest">
              Interactive Simulation
            </p>
          </div>
          <h1 className="text-2xl md:text-3xl font-black capitalize text-white">
            {lectureId.replace(/-/g, ' ')}
          </h1>
        </div>
      </div>

      {/* --- Main Game Container --- */}
      <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        {renderGame()}
      </div>

    </div>
  );
}

// --- Helper Component for Coming Soon Pages ---
const PlaceholderGame = ({ title, icon, description }: { title: string, icon: any, description: string }) => (
  <div className="min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-slate-900/50 border border-slate-800 rounded-3xl border-dashed">
    <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 mb-6 shadow-xl">
      {icon}
    </div>
    <h2 className="text-3xl font-bold text-white mb-3">{title}</h2>
    <p className="text-slate-400 max-w-md mb-8 text-lg">{description}</p>
    
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-full text-xs font-bold uppercase tracking-wider">
      <Construction size={14} /> Under Construction
    </div>
  </div>
);