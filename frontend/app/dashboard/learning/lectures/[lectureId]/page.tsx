"use client";

import React, { use } from 'react';
import { ArrowLeft, Construction, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import BudgetArchitect from '@/components/games/BudgetArchitect';
import Emergency from '@/components/games/Emergency';
import DebtDestroyer from '@/components/games/DebtDestroyer'; 
import Credit from '@/components/games/Credit';
import GoodBad from '@/components/games/GoodBad'; 
import StockSimulator from '@/components/games/StockSimulator';
import Retirement from '@/components/games/Retirement';

interface PageProps {
  params: Promise<{ lectureId: string }>;
}

export default function LecturePage({ params }: PageProps) {
  const { lectureId } = use(params);

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
        return notFound();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans relative overflow-hidden selection:bg-cyan-500/30">
      
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none fixed" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto mb-10 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-6">
            <Link 
            href="/dashboard/learning" 
            className="group flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800 hover:border-cyan-500/30 transition-all shadow-lg backdrop-blur-md"
            >
            <ArrowLeft size={20} className="text-slate-400 group-hover:text-cyan-400 group-hover:-translate-x-1 transition-transform" />
            </Link>
            
            <div>
            <div className="flex items-center gap-2 mb-1.5">
                <div className="px-2 py-0.5 rounded-full bg-cyan-950/50 border border-cyan-500/20 flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    <span className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider">Simulation Active</span>
                </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black capitalize text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight">
                {lectureId.replace(/-/g, ' ')}
            </h1>
            </div>
        </div>

        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 backdrop-blur-md">
            <Zap size={16} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Earn XP by playing</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
        <div className="rounded-[2.5rem] overflow-hidden border border-slate-800 bg-slate-900/30 backdrop-blur-sm shadow-2xl shadow-black/50">
            {renderGame()}
        </div>
      </div>

    </div>
  );
}

const PlaceholderGame = ({ title, icon, description }: { title: string, icon: any, description: string }) => (
  <div className="min-h-[600px] flex flex-col items-center justify-center text-center p-12 bg-slate-900/50 relative overflow-hidden group">
    
    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_10s_infinite_linear] pointer-events-none" />
    
    <div className="relative z-10">
        <div className="w-32 h-32 mx-auto bg-slate-800/50 rounded-3xl flex items-center justify-center text-slate-600 mb-8 border border-slate-700 shadow-xl group-hover:scale-110 group-hover:text-cyan-500 group-hover:border-cyan-500/30 transition-all duration-500">
        {icon}
        </div>
        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">{title}</h2>
        <p className="text-slate-400 max-w-lg mx-auto mb-10 text-lg font-medium leading-relaxed">{description}</p>
        
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl text-sm font-bold uppercase tracking-wider shadow-lg shadow-yellow-900/20">
        <Construction size={18} className="animate-pulse" /> 
        <span>Module Under Construction</span>
        </div>
    </div>
  </div>
);