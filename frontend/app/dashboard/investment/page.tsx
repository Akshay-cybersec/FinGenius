'use client'
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, PieChart, Activity, ShieldCheck, Zap } from 'lucide-react';

const InvestmentSimulator = () => {
  const [activeTab, setActiveTab] = useState('Stocks');
  type RiskLevel = 'Low' | 'Medium' | 'High';

  interface Asset {
    id: number;
    name: string;
    ticker: string;
    price: number;
    change: number;
    risk: RiskLevel;
    type: string;
  }
  const assets: Asset[] = [
    { id: 1, name: 'TechNova Corp', ticker: 'TNV', price: 145.20, change: 2.4, risk: 'High', type: 'Stocks' },
    { id: 2, name: 'GreenEnergy Ltd', ticker: 'GEL', price: 89.50, change: -1.2, risk: 'Medium', type: 'Stocks' },
    { id: 3, name: 'SafeHaven Gold', ticker: 'SHG', price: 540.00, change: 0.5, risk: 'Low', type: 'ETFs' },
    { id: 4, name: 'Quantum AI', ticker: 'QAI', price: 210.75, change: 5.8, risk: 'High', type: 'Stocks' },
    { id: 5, name: 'Global Bond Fund', ticker: 'GBF', price: 102.30, change: 0.1, risk: 'Low', type: 'Mutual Funds' },
  ];

  const filteredAssets = activeTab === 'All' ? assets : assets.filter(a => a.type === activeTab || activeTab === 'Stocks');

  const renderRiskBadge = (level: RiskLevel) => {
  const colors: Record<RiskLevel, string> = {
    Low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    Medium: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    High: 'bg-red-500/20 text-red-400 border-red-500/50',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[level]}`}>
      {level}
    </span>
  );
};

  return (
    <div className="flex h-full w-full bg-[#0f172a] text-slate-100 overflow-hidden font-sans p-6 gap-6">

      <div className="flex-1 flex flex-col gap-6">

        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Investment Market
          </h1>

          <div className="flex gap-2 p-1 bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50 w-fit">
            {['Stocks', 'Mutual Funds', 'ETFs', 'Fixed Deposits'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab
                    ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-sm border-b border-slate-700/50">
                  <th className="p-4 font-medium">Asset Name</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">24h Change</th>
                  <th className="p-4 font-medium">Risk Level</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="group hover:bg-slate-700/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 group-hover:text-cyan-300 group-hover:shadow-[0_0_10px_rgba(34,211,238,0.2)] transition-all">
                          {asset.ticker}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-100">{asset.name}</p>
                          <p className="text-xs text-slate-500">Vol: 1.2M</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-200">${asset.price.toFixed(2)}</td>
                    <td className="p-4">
                      <div className={`flex items-center gap-1 text-sm ${asset.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {asset.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {Math.abs(asset.change)}%
                      </div>
                    </td>
                    <td className="p-4">{renderRiskBadge(asset.risk)}</td>
                    <td className="p-4 text-right">
                      <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-lg shadow-[0_0_15px_rgba(8,145,178,0.4)] transition-all active:scale-95">
                        Buy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="w-80 flex flex-col gap-6">

        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl"></div>

          <h3 className="text-slate-400 text-sm font-medium mb-1">Total Portfolio Value</h3>
          <div className="text-3xl font-bold text-white mb-4">$12,450.00</div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-700/30">
              <p className="text-xs text-slate-500 mb-1">Available Cash</p>
              <p className="text-lg font-semibold text-emerald-400">$2,450</p>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-700/30">
              <p className="text-xs text-slate-500 mb-1">Total Profit</p>
              <p className="text-lg font-semibold text-cyan-400">+$1,205</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <Activity className="text-orange-400" size={20} />
            <div>
              <p className="text-xs text-orange-400 font-bold uppercase tracking-wider">Risk Level</p>
              <p className="text-sm text-slate-300">Moderate Portfolio</p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-slate-800/20 rounded-2xl border border-slate-700/30 p-5 flex flex-col gap-4">
          <h3 className="text-slate-300 font-semibold flex items-center gap-2">
            <Zap size={18} className="text-yellow-400" />
            Your Insights
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-700/20 hover:bg-slate-700/40 transition cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:text-indigo-300">
                  <PieChart size={18} />
                </div>
                <span className="text-sm text-slate-300">Diversification</span>
              </div>
              <span className="text-xs text-emerald-400 font-medium">Great</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-700/20 hover:bg-slate-700/40 transition cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400 group-hover:text-pink-300">
                  <ShieldCheck size={18} />
                </div>
                <span className="text-sm text-slate-300">Safety Score</span>
              </div>
              <span className="text-xs text-yellow-400 font-medium">85/100</span>
            </div>
          </div>

          <div className="mt-auto h-32 rounded-xl bg-gradient-to-t from-cyan-500/10 to-transparent border-b border-cyan-500/20 flex items-end justify-center pb-2">
            <span className="text-xs text-cyan-600/50">Market Trend Visualization</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InvestmentSimulator;