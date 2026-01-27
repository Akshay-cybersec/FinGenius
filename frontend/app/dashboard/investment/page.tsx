'use client'
import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, PieChart, Activity, ShieldCheck, Zap, Briefcase } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

type RiskLevel = 'Low' | 'Medium' | 'High';

interface Asset {
  id?: number;
  name: string;
  ticker: string;
  price: number;
  change: number;
  risk: RiskLevel;
  type: string;
}

const InvestmentSimulator = () => {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState('Stocks');
  const [marketAssets, setMarketAssets] = useState<Asset[]>([]);
  const [balance, setBalance] = useState(0);
  const [portfolioValue, setPortfolioValue] = useState(0);

  const fetchMarket = async () => {
    const res = await fetch('http://localhost:8000/market');
    const data = await res.json();
    setMarketAssets(data);
  };

  const fetchUser = async () => {
    const token = await getToken();
    const res = await fetch('http://localhost:8000/user', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setBalance(data.balance);
  };

  const fetchPortfolio = async () => {
    const token = await getToken();
    const res = await fetch('http://localhost:8000/portfolio', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    calculatePortfolioValue(data);
    setPortfolio(data);
    let total = 0;
    data.forEach((item: any) => {
      const asset = marketAssets.find(a => a.ticker === item.ticker);
      if (asset) total += asset.price * item.quantity;
    });
    setPortfolioValue(total);
  };

  const calculatePortfolioValue = (portfolioData: any) => {
    let total = 0;
    portfolioData.forEach((item: any) => {
      const asset = marketAssets.find(a => a.ticker === item.ticker);
      if (asset) total += asset.price * item.quantity;
    });
    setPortfolioValue(total);
  };


  const buyAsset = async (asset: Asset) => {
    const token = await getToken();
    await fetch('http://localhost:8000/trade/buy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ticker: asset.ticker, qty: 1 })
    });
    fetchUser();
    fetchPortfolio();
  };

  const sellAsset = async (ticker: string) => {
    const token = await getToken();
    await fetch("http://localhost:8000/trade/sell", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ticker, qty: 1 })
    });
    fetchUser();
    fetchPortfolio();
  };



  const investedAmount = portfolio.reduce((sum, item) => {
    return sum + item.buy_price * item.quantity;
  }, 0);

  const profitLoss = portfolioValue - investedAmount;


  useEffect(() => {
    fetchMarket();
    fetchUser();
    fetchPortfolio();
  }, []);

  useEffect(() => {
    fetch('http://localhost:8000/market')
      .then(res => res.json())
      .then(setMarketAssets);

    const ws = new WebSocket('ws://localhost:8000/ws/market');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMarketAssets(data);
      calculatePortfolioValue(portfolio);
    };


    return () => ws.close();
  }, []);


  const filteredAssets = marketAssets.filter(a => a.type === activeTab);

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
    // ROOT: Added light mode background (slate-50) and text color switching
    <div className="flex h-full w-full bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 overflow-hidden font-sans p-6 gap-6 transition-colors duration-300">

      {/* LEFT COLUMN */}
      <div className="flex-1 flex flex-col gap-6 h-full overflow-hidden">

        {/* Header & Tabs */}
        <div className="flex flex-col gap-4 flex-shrink-0">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-400 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Investment Market
          </h1>

          {/* Tabs Container */}
          <div className="flex gap-2 p-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-700/50 w-fit shadow-sm">
            {['Stocks', 'Mutual Funds', 'ETFs', 'Fixed Deposits'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab
                  ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)] border border-cyan-500/30'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* --- IMPROVED PORTFOLIO SECTION --- */}
        {/* Only show if portfolio has items to save space, or keep empty state styling */}
        <div className="flex-shrink-0 bg-white/60 dark:bg-slate-800/30 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-md flex flex-col max-h-64">
          <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/20 flex justify-between items-center sticky top-0 backdrop-blur-md z-10">
             <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Briefcase size={16} /> Your Portfolio
             </h2>
             <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                {portfolio.length} Assets
             </span>
          </div>
          
          <div className="overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100/80 dark:bg-slate-900/50 sticky top-0 z-10 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider backdrop-blur-sm">
                <tr>
                  <th className="p-4">Asset</th>
                  <th className="p-4 text-right">Qty</th>
                  <th className="p-4 text-right">Avg. Price</th>
                  <th className="p-4 text-right">Current</th>
                  <th className="p-4 text-right">P/L</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/30 text-sm">
                {portfolio.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-slate-500 italic">
                            Your portfolio is empty. Start trading below!
                        </td>
                    </tr>
                ) : (
                    portfolio.map((item) => {
                    const asset = marketAssets.find(a => a.ticker === item.ticker);
                    if (!asset) return null;
                    const pl = (asset.price - item.buy_price) * item.quantity;
                    const isProfit = pl >= 0;

                    return (
                        <tr key={item.ticker} className="group hover:bg-slate-100 dark:hover:bg-slate-700/20 transition-colors">
                        <td className="p-4 font-medium text-slate-700 dark:text-slate-200">
                            <span className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-xs mr-2 text-slate-600 dark:text-slate-300 font-bold">
                                {item.ticker}
                            </span>
                            {asset.name}
                        </td>
                        <td className="p-4 text-right font-mono text-slate-600 dark:text-slate-300">{item.quantity}</td>
                        <td className="p-4 text-right font-mono text-slate-500 dark:text-slate-400">${item.buy_price.toFixed(2)}</td>
                        <td className="p-4 text-right font-mono font-medium text-slate-800 dark:text-slate-100">${asset.price.toFixed(2)}</td>
                        <td className={`p-4 text-right font-mono font-bold ${isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                            {isProfit ? '+' : ''}${pl.toFixed(2)}
                        </td>
                        <td className="p-4 text-center">
                            <button
                            onClick={() => sellAsset(item.ticker)}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                            >
                            Sell Position
                            </button>
                        </td>
                        </tr>
                    );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- MARKET TABLE (Existing but with Light Mode) --- */}
        <div className="flex-1 bg-white/60 dark:bg-slate-800/30 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-xl flex flex-col min-h-0">
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-100/90 dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700/50 backdrop-blur-md">
                  <th className="p-4 font-medium">Asset Name</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">24h Change</th>
                  <th className="p-4 font-medium">Risk Level</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/30">
                {filteredAssets.map((asset) => (
                  <tr key={asset.ticker} className="group hover:bg-slate-100 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 group-hover:shadow-[0_0_10px_rgba(34,211,238,0.2)] transition-all">
                          {asset.ticker}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100">{asset.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">Vol: 1.2M</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-700 dark:text-slate-200 font-medium">${asset.price.toFixed(2)}</td>
                    <td className="p-4">
                      <div className={`flex items-center gap-1 text-sm ${asset.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {asset.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {Math.abs(asset.change)}%
                      </div>
                    </td>
                    <td className="p-4">{renderRiskBadge(asset.risk)}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => buyAsset(asset)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-lg shadow-md shadow-cyan-500/20 transition-all active:scale-95">
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

      {/* RIGHT COLUMN */}
      <div className="w-80 flex flex-col gap-6 flex-shrink-0">

        {/* Portfolio Stats Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-800/80 dark:to-slate-900/80 border border-slate-200 dark:border-slate-700/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-3xl"></div>

          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Portfolio Value</h3>
          <div className="text-3xl font-bold text-slate-800 dark:text-white mb-4">${portfolioValue.toFixed(2)}</div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/30">
              <p className="text-xs text-slate-500 mb-1">Available Cash</p>
              <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">${balance.toFixed(2)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/30">
              <p className="text-xs text-slate-500 mb-1">Total Profit</p>
              <p className="text-lg font-semibold text-cyan-600 dark:text-cyan-400">${(portfolioValue - (100000 - balance)).toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
            <Activity className="text-orange-500 dark:text-orange-400" size={20} />
            <div>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider">Risk Level</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Moderate Portfolio</p>
            </div>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="flex-1 bg-white/60 dark:bg-slate-800/20 rounded-2xl border border-slate-200 dark:border-slate-700/30 p-5 flex flex-col gap-4 shadow-lg dark:shadow-none">
          <h3 className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
            <Zap size={18} className="text-yellow-500 dark:text-yellow-400" />
            Your Insights
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-100 dark:bg-slate-700/20 hover:bg-slate-200 dark:hover:bg-slate-700/40 transition cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                  <PieChart size={18} />
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-300">Diversification</span>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Great</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-100 dark:bg-slate-700/20 hover:bg-slate-200 dark:hover:bg-slate-700/40 transition cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300">
                  <ShieldCheck size={18} />
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-300">Safety Score</span>
              </div>
              <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">85/100</span>
            </div>
          </div>

          <div className="mt-auto h-32 rounded-xl bg-gradient-to-t from-cyan-500/10 to-transparent border-b border-cyan-500/20 flex items-end justify-center pb-2">
            <span className="text-xs text-cyan-700 dark:text-cyan-600/50">Market Trend Visualization</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InvestmentSimulator;
