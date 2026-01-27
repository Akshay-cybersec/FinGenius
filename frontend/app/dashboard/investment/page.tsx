'use client'
import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  Activity,
  ShieldCheck,
  Zap,
  Briefcase,
  Wallet,
  Clock,
  X,
} from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

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

interface PortfolioItem {
  ticker: string;
  quantity: number;
  buy_price: number;
}

const InvestmentSimulator = () => {
  const [buyQtyMap, setBuyQtyMap] = useState<{ [key: string]: number }>({});
  const [sellQtyMap, setSellQtyMap] = useState<Record<string, number>>({});
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const { getToken } = useAuth();

  const [activeTab, setActiveTab] = useState('Stocks');
  const [marketAssets, setMarketAssets] = useState<Asset[]>([]);
  const [balance, setBalance] = useState(0);
  const [portfolioValue, setPortfolioValue] = useState(0);

  const [isFdModalOpen, setIsFdModalOpen] = useState(false);
  const [selectedFdAsset, setSelectedFdAsset] = useState<Asset | null>(null);
  const [fdAmount, setFdAmount] = useState<number>(10000);
  const [fdTenure, setFdTenure] = useState<number>(1);

  const tradingPortfolio = portfolio.filter((item) => {
    const asset = marketAssets.find(a => a.ticker === item.ticker);
    return asset && (asset.type === 'Stocks' || asset.type === 'ETFs');
  });

  const holdingPortfolio = portfolio.filter((item) => {
    const asset = marketAssets.find(a => a.ticker === item.ticker);
    return asset && (asset.type === 'Mutual Funds' || asset.type === 'Fixed Deposits');
  });

  const fetchMarket = async () => {
    try {
      const res = await fetch('http://localhost:8000/market');
      const data = await res.json();
      setMarketAssets(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch market data");
      return [];
    }
  };

  const fetchUser = async () => {
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:8000/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setBalance(data.balance);
    } catch (error) {
      console.error("Failed to fetch user data");
    }
  };

  const fetchPortfolio = async () => {
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:8000/portfolio', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPortfolio(data);

      calculatePortfolioValue(data, marketAssets);
    } catch (error) {
      console.error("Failed to fetch portfolio");
    }
  };

  const calculatePortfolioValue = (portfolioData: PortfolioItem[], currentAssets: Asset[]) => {
    if (currentAssets.length === 0) return;

    let total = 0;
    portfolioData.forEach((item) => {
      const asset = currentAssets.find(a => a.ticker === item.ticker);
      if (asset) {
        if (asset.type === 'Fixed Deposits') {
          total += item.quantity;
        } else {
          total += asset.price * item.quantity;
        }
      }
    });
    setPortfolioValue(total);
  };


  const handleBuyClick = (asset: Asset) => {
    if (asset.type === 'Fixed Deposits') {
      setSelectedFdAsset(asset);
      setFdAmount(10000);
      setFdTenure(1);
      setIsFdModalOpen(true);
    } else {
      const qty = buyQtyMap[asset.ticker] || 1;
      executeBuy(asset, qty);
    }
  };

  const executeBuy = async (asset: Asset, qty: number) => {
    const isFD = asset.type === 'Fixed Deposits';
    const totalCost = isFD ? qty : asset.price * qty;

    if (totalCost > balance) {
      toast.error(`Insufficient funds. Required: $${totalCost.toLocaleString()}`);
      return;
    }

    try {
      const token = await getToken();
      await fetch("http://localhost:8000/trade/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ticker: asset.ticker, qty })
      });

      toast.success(isFD ? `FD Opened for $${qty.toLocaleString()}` : `Bought ${qty} ${asset.ticker}`);
      setIsFdModalOpen(false);

      await fetchUser();
      await fetchPortfolio();
    } catch (error) {
      toast.error("Transaction failed");
    }
  };

  const sellAsset = async (ticker: string, qty: number, type: string) => {
    try {
      const token = await getToken();
      await fetch("http://localhost:8000/trade/sell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ticker, qty })
      });

      const message = type === 'Fixed Deposits' ? "FD Broken Prematurely" :
        type === 'Mutual Funds' ? "Units Redeemed" :
          `Sold ${qty} shares of ${ticker}`;

      toast.success(message);
      await fetchUser();
      await fetchPortfolio();
    } catch (error) {
      toast.error("Sell transaction failed");
    }
  };

  // 1. Initial Data Load
  useEffect(() => {
    const init = async () => {
      const mData = await fetchMarket();
      await fetchUser();

      const token = await getToken();
      if (token) {
        const pRes = await fetch('http://localhost:8000/portfolio', { headers: { Authorization: `Bearer ${token}` } });
        const pData = await pRes.json();
        setPortfolio(pData);
        calculatePortfolioValue(pData, mData);
      }
    };
    init();
  }, [getToken]);

  // 2. THIS IS THE MISSING PART: WebSocket Connection for Real-Time Updates
  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: any;

    const connect = () => {
      // Connects to your backend WebSocket
      ws = new WebSocket("ws://localhost:8000/ws/market");

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // This updates the state, causing a re-render with new prices/arrows
        setMarketAssets(data); 
      };

      ws.onclose = () => {
        // Simple reconnect logic if server restarts
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  // 3. Auto-recalculate portfolio value when market prices change
  useEffect(() => {
    calculatePortfolioValue(portfolio, marketAssets);
  }, [marketAssets, portfolio]);


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

  const filteredAssets = marketAssets.filter(a => a.type === activeTab);

  return (
    <div className="flex h-full w-full bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 overflow-hidden font-sans p-6 gap-6 transition-colors duration-300">

      {isFdModalOpen && selectedFdAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Briefcase className="text-cyan-500" /> Open Fixed Deposit
              </h3>
              <button
                onClick={() => setIsFdModalOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl mb-6 flex justify-between items-center border border-slate-100 dark:border-slate-700/50">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Asset</p>
                <p className="font-semibold text-lg">{selectedFdAsset.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Rate</p>
                <p className="text-emerald-500 font-mono text-lg font-bold">{selectedFdAsset.price}% p.a.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                  Investment Amount (Min 10,000)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    value={fdAmount}
                    onChange={(e) => setFdAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                  Tenure (Years)
                </label>
                <input
                  type="number"
                  min="1" max="10"
                  value={fdTenure}
                  onChange={(e) => setFdTenure(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border border-cyan-100 dark:border-cyan-800/50">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Projected Maturity:</span>
                  <span className="font-bold text-slate-800 dark:text-white text-lg">
                    ${(fdAmount + (fdAmount * selectedFdAsset.price * fdTenure) / 100).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Interest Earned:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    +${((fdAmount * selectedFdAsset.price * fdTenure) / 100).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (fdAmount < 10000) {
                    toast.error("Minimum FD amount is $10,000");
                    return;
                  }
                  executeBuy(selectedFdAsset, fdAmount);
                }}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all hover:scale-[1.02] active:scale-95"
              >
                Confirm & Create FD
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-6 h-full overflow-hidden">

        <div className="flex flex-col gap-4 flex-shrink-0">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-400 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Investment Market
          </h1>

          <div className="flex gap-2 p-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-700/50 w-fit shadow-sm overflow-x-auto">
            {['Stocks', 'Mutual Funds', 'ETFs', 'Fixed Deposits', 'Portfolio'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${activeTab === tab
                  ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)] border border-cyan-500/30'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0 bg-white/60 dark:bg-slate-800/30 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-md flex flex-col max-h-60 transition-all">
          <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/20 flex justify-between items-center sticky top-0 backdrop-blur-md z-10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Activity size={16} /> Quick Trades (Stocks & ETFs)
            </h2>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
              {tradingPortfolio.length} Positions
            </span>
          </div>

          <div className="overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100/80 dark:bg-slate-900/50 sticky top-0 z-10 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider backdrop-blur-sm">
                <tr>
                  <th className="p-3 pl-6">Ticker</th>
                  <th className="p-3 text-right">Qty</th>
                  <th className="p-3 text-right">P/L</th>
                  <th className="p-3 text-right pr-6">Fast Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/30 text-sm">
                {tradingPortfolio.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 dark:text-slate-500 italic">
                      No active stock positions. Go to the Market tab to trade.
                    </td>
                  </tr>
                ) : (
                  tradingPortfolio.map((item) => {
                    const asset = marketAssets.find(a => a.ticker === item.ticker);
                    if (!asset) return null;
                    const pl = (asset.price - item.buy_price) * item.quantity;
                    const isProfit = pl >= 0;
                    return (
                      <tr key={item.ticker} className="group hover:bg-slate-100 dark:hover:bg-slate-700/20">
                        <td className="p-3 pl-6 font-medium text-slate-700 dark:text-slate-200">
                          {item.ticker}
                        </td>

                        <td className="p-3 text-right font-mono text-slate-600 dark:text-slate-300">
                          {item.quantity}
                        </td>

                        <td className={`p-3 text-right font-mono font-bold ${isProfit ? "text-emerald-500" : "text-red-500"}`}>
                          {isProfit ? '+' : ''}{pl.toFixed(2)}
                        </td>

                        <td className="p-3 text-right pr-6">
                          <div className="flex justify-end items-center gap-2">

                            <input
                              type="number"
                              min={1}
                              max={item.quantity}
                              placeholder="Qty"
                              value={sellQtyMap[item.ticker] || ''}
                              onChange={(e) => setSellQtyMap({ ...sellQtyMap, [item.ticker]: Number(e.target.value) })}
                              className="w-14 bg-slate-200 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1 text-xs text-center focus:outline-none focus:border-cyan-500"
                            />

                            <button
                              onClick={() => {
                                const qtyToSell = sellQtyMap[item.ticker];
                                if (!qtyToSell || qtyToSell <= 0) {
                                  toast.error("Enter a valid quantity");
                                  return;
                                }
                                if (qtyToSell > item.quantity) {
                                  toast.error(`Max limit: ${item.quantity}`);
                                  return;
                                }
                                sellAsset(item.ticker, qtyToSell, asset.type);
                                setSellQtyMap((prev) => ({ ...prev, [item.ticker]: 0 })); // Reset input
                              }}
                              className="px-3 py-1 text-xs font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded transition-colors"
                            >
                              Sell
                            </button>

                            <button
                              onClick={() => {
                                sellAsset(item.ticker, item.quantity, asset.type);
                              }}
                              className="px-3 py-1 text-xs font-bold bg-red-100 hover:bg-red-500 text-red-600 hover:text-white rounded transition-all shadow-sm"
                              title="Sell entire position"
                            >
                              Sell All
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- MAIN CONTENT AREA (Market or Portfolio) --- */}
        <div className="flex-1 bg-white/60 dark:bg-slate-800/30 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-xl flex flex-col min-h-0 relative">

          {activeTab === 'Portfolio' ? (
            // === PORTFOLIO VIEW ===
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 animate-in fade-in duration-300">

              {/* 1. Long Term Holdings Section */}
              <div>
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <Clock className="text-purple-500" size={20} /> Long Term Holdings
                </h3>
                <div className="bg-white/50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100/50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="p-4">Asset Name</th>
                        <th className="p-4">Type</th>
                        <th className="p-4 text-right">Investment</th>
                        <th className="p-4 text-right">Current Value</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800/50">
                      {holdingPortfolio.length === 0 ? (
                        <tr><td colSpan={5} className="p-6 text-center text-slate-400">No long-term investments found.</td></tr>
                      ) : (
                        holdingPortfolio.map(item => {
                          const asset = marketAssets.find(a => a.ticker === item.ticker);
                          if (!asset) return null;
                          const isFD = asset.type === 'Fixed Deposits';

                          // For FDs, quantity is the Principal.
                          // For MFs, quantity is units.
                          const investVal = isFD ? item.quantity : item.buy_price * item.quantity;
                          const curVal = isFD ? item.quantity : asset.price * item.quantity;

                          return (
                            <tr key={item.ticker} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="p-4 font-medium text-slate-700 dark:text-slate-200">
                                <div>{asset.name}</div>
                                {isFD && <span className="text-[10px] text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded mt-1 inline-block">{asset.price}% Returns</span>}
                              </td>
                              <td className="p-4 text-slate-500">{asset.type}</td>
                              <td className="p-4 text-right font-mono text-slate-600 dark:text-slate-400">
                                ${investVal.toLocaleString()}
                              </td>
                              <td className="p-4 text-right font-bold text-slate-800 dark:text-slate-100">
                                ${curVal.toLocaleString()}
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => {
                                    const warning = isFD
                                      ? "Breaking an FD prematurely may incur a penalty. Continue?"
                                      : "Are you sure you want to redeem all units?";
                                    if (confirm(warning)) {
                                      sellAsset(item.ticker, item.quantity, asset.type);
                                    }
                                  }}
                                  className={`px-3 py-1.5 text-xs font-semibold text-white rounded-lg shadow-sm transition-all active:scale-95 ${isFD
                                    ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
                                    : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20'
                                    }`}
                                >
                                  {isFD ? 'Break FD' : 'Redeem'}
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

              {/* 2. Equity Holdings Section */}
              <div>
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <Wallet className="text-cyan-500" size={20} /> Equity Holdings
                </h3>
                <div className="bg-white/50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100/50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="p-4">Ticker / Name</th>
                        <th className="p-4 text-right">Qty</th>
                        <th className="p-4 text-right">Avg Cost</th>
                        <th className="p-4 text-right">Market Price</th>
                        <th className="p-4 text-right">Total P/L</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800/50">
                      {tradingPortfolio.length === 0 ? (
                        <tr><td colSpan={5} className="p-6 text-center text-slate-400">No equity investments found.</td></tr>
                      ) : (
                        tradingPortfolio.map(item => {
                          const asset = marketAssets.find(a => a.ticker === item.ticker);
                          if (!asset) return null;
                          const pl = (asset.price - item.buy_price) * item.quantity;
                          const isProfit = pl >= 0;

                          return (
                            <tr key={item.ticker} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="p-4">
                                <div className="font-bold text-slate-700 dark:text-slate-200">{item.ticker}</div>
                                <div className="text-xs text-slate-500">{asset.name}</div>
                              </td>
                              <td className="p-4 text-right font-mono text-slate-600 dark:text-slate-400">
                                {item.quantity}
                              </td>
                              <td className="p-4 text-right font-mono text-slate-500">
                                ${item.buy_price.toFixed(2)}
                              </td>
                              <td className="p-4 text-right font-mono text-slate-700 dark:text-slate-200">
                                ${asset.price.toFixed(2)}
                              </td>
                              <td className={`p-4 text-right font-bold font-mono ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
                                {isProfit ? '+' : ''}{pl.toFixed(2)}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            // === MARKET TABLE VIEW ===
            <div className="overflow-x-auto flex-1 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-100/90 dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700/50 backdrop-blur-md">
                    <th className="p-4 font-medium">Asset Name</th>
                    <th className="p-4 font-medium">
                      {activeTab === 'Fixed Deposits' ? 'Interest Rate' : 'Price'}
                    </th>
                    <th className="p-4 font-medium">Risk Level</th>
                    <th className="p-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700/30 text-sm">
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 dark:text-slate-500">
                        No assets available in this category.
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map((asset) => (
                      <tr key={asset.ticker} className="group hover:bg-slate-100 dark:hover:bg-slate-700/20 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                              {asset.ticker.slice(0, 4)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-100">{asset.name}</p>
                              {activeTab !== 'Fixed Deposits' && (
                                <div className={`flex items-center gap-1 text-xs ${asset.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {asset.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                  {Math.abs(asset.change)}%
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-mono text-slate-700 dark:text-slate-200 font-medium">
                          {activeTab === 'Fixed Deposits' ? (
                            <span className="text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20 px-2 py-1 rounded text-xs font-bold">
                              {asset.price}% p.a.
                            </span>
                          ) : (
                            `$${asset.price.toFixed(2)}`
                          )}
                        </td>

                        <td className="p-4">{renderRiskBadge(asset.risk)}</td>

                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            {activeTab !== 'Fixed Deposits' && (
                              <input
                                type="number"
                                min={1}
                                placeholder="Qty"
                                value={buyQtyMap[asset.ticker] || 1}
                                onChange={(e) => setBuyQtyMap(prev => ({ ...prev, [asset.ticker]: Number(e.target.value) }))}
                                className="w-16 bg-slate-200 dark:bg-slate-700 rounded-lg px-2 text-xs text-center focus:outline-none focus:ring-1 focus:ring-cyan-500"
                              />
                            )}
                            <button
                              onClick={() => handleBuyClick(asset)}
                              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase rounded-lg shadow-md shadow-cyan-500/20 transition-all active:scale-95"
                            >
                              {activeTab === 'Fixed Deposits' ? 'Create FD' : 'Buy'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- RIGHT COLUMN (Stats) --- */}
      <div className="w-80 flex flex-col gap-6 flex-shrink-0">

        {/* Portfolio Stats Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-800/80 dark:to-slate-900/80 border border-slate-200 dark:border-slate-700/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-3xl"></div>

          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Portfolio Value</h3>
          <div className="text-3xl font-bold text-slate-800 dark:text-white mb-4">${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/30">
              <p className="text-xs text-slate-500 mb-1">Cash Balance</p>
              <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">${balance.toLocaleString()}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/30">
              <p className="text-xs text-slate-500 mb-1">Total P/L</p>
              {(() => {
                // Assuming start balance was 100k, simple P/L calc
                const totalProfit = portfolioValue + balance - 100000;
                const isProfit = totalProfit >= 0;
                return (
                  <p className={`text-lg font-semibold ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                    {isProfit ? '+' : ''}${Math.abs(totalProfit).toLocaleString()}
                  </p>
                );
              })()}
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
            <Activity className="text-orange-500 dark:text-orange-400" size={20} />
            <div>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider">Risk Profile</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Moderate Growth</p>
            </div>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="flex-1 bg-white/60 dark:bg-slate-800/20 rounded-2xl border border-slate-200 dark:border-slate-700/30 p-5 flex flex-col gap-4 shadow-lg dark:shadow-none">
          <h3 className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
            <Zap size={18} className="text-yellow-500 dark:text-yellow-400" />
            AI Insights
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-100 dark:bg-slate-700/20 hover:bg-slate-200 dark:hover:bg-slate-700/40 transition cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                  <PieChart size={18} />
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-300">Asset Allocation</span>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Balanced</span>
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
    </div >
  );
};

export default InvestmentSimulator;