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
  HelpCircle,
  GraduationCap,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import Joyride, { ACTIONS, CallBackProps, EVENTS, STATUS, Step } from 'react-joyride';
import confetti from 'canvas-confetti';

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

const LEARNING_MODULES = [
  {
    id: 'fd',
    title: '🛡️ Fixed Deposits (FD)',
    color: 'from-emerald-500 to-teal-600',
    cards: [
      {
        title: "The Safest Bet",
        content: "Imagine giving your money to a Bank to lock it in a vault for 1 year.",
        analogy: "It's like planting a tree. You can't touch it for a while, but it's guaranteed to grow fruit."
      },
      {
        title: "How it works",
        content: "You choose a 'Tenure' (Time). The bank pays you Interest because they use your money to lend to others.",
        analogy: "Low Risk = Low Reward. You won't get rich overnight, but you won't lose money either."
      },
      {
        type: 'quiz',
        question: "If you break an FD before the time ends, what happens?",
        options: ["You get a bonus", "You pay a penalty", "Nothing happens"],
        correct: 1
      }
    ]
  },
  {
    id: 'mf',
    title: '🤝 Mutual Funds',
    color: 'from-blue-500 to-indigo-600',
    cards: [
      {
        title: "The Power of Many",
        content: "You don't have $1M to buy 50 top companies. But 10,000 people together do!",
        analogy: "It's like a Potluck Dinner. Everyone brings a small dish, but everyone gets to eat a giant feast."
      },
      {
        title: "The Manager",
        content: "A professional Fund Manager decides which stocks to buy with the pooled money.",
        analogy: "You are the passenger; the Manager is the driver. You pay a small fee for the ride."
      },
      {
        type: 'quiz',
        question: "Who picks the stocks in a Mutual Fund?",
        options: ["You", "The Government", "A Professional Manager"],
        correct: 2
      }
    ]
  },
  {
    id: 'etf',
    title: '🧺 ETFs (Exchange Traded Funds)',
    color: 'from-purple-500 to-pink-600',
    cards: [
      {
        title: "The Fruit Basket",
        content: "An ETF is a bundle of stocks that tracks an entire sector (like Tech) or country (like India).",
        analogy: "Instead of buying just an Apple (Stock), you buy the whole Fruit Basket (ETF)."
      },
      {
        title: "Trade it like a Stock",
        content: "Unlike Mutual Funds, you can buy and sell ETFs instantly during market hours.",
        analogy: "It's the best of both worlds: Diversification of a Fund + Speed of a Stock."
      },
      {
        type: 'quiz',
        question: "Can you trade ETFs instantly like stocks?",
        options: ["Yes", "No, only end of day", "Only on weekends"],
        correct: 0
      }
    ]
  }
];

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

  const [runTour, setRunTour] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);

  const [isLearningOpen, setIsLearningOpen] = useState(false);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [learningCompleted, setLearningCompleted] = useState<string[]>([]);

  const tourSteps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      title: '🎓 Welcome, Future Tycoon!',
      content: 'Ready to master the markets? This simulator is your sandbox to learn, trade, and get rich (virtually)!',
      disableBeacon: true,
    },
    {
      target: '.tour-academy-btn', 
      content: (
        <div>
          <p className="font-bold text-lg">🧠 Brain Power = Profit</p>
          <p>Don't gamble! Use the <strong>Academy</strong> to learn strategies for FDs, Mutual Funds, and ETFs.</p>
          <p className="mt-2 text-xs text-indigo-600 font-bold">Reward: +100 XP per module!</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.tour-balance-card',
      content: '💰 The War Chest: You start with $100,000. Your mission is to make this number go UP.',
      placement: 'left',
    },
    {
      target: '.tour-tabs',
      content: (
        <div className="text-left space-y-2">
          <p><strong>🧰 Choose Your Weapon:</strong></p>
          <ul className="list-disc pl-4 text-sm">
            <li><strong>Stocks:</strong> High risk, huge rewards. The Ferrari of assets. 🏎️</li>
            <li><strong>FDs:</strong> The Bunker. Guaranteed returns when the market is scary. 🛡️</li>
            <li><strong>Mutual Funds/ETFs:</strong> The smart play. Diversified baskets. 🧺</li>
          </ul>
        </div>
      ),
    },
    {
      target: '.tour-asset-row-0',
      content: '👀 Scout the Target: This is a Stock. Check the Risk Badge before you buy. High Risk means it moves fast!',
    },
    {
      target: '.tour-stock-input-0',
      content: '🎲 Skin in the Game: Type "10" here to order 10 shares.',
      spotlightClicks: true,
      disableOverlayClose: true,
      hideFooter: true,
      placement: 'left',
    },
    {
      target: '.tour-stock-buy-0',
      content: '🔫 Pull the Trigger: Click Buy to execute the trade instantly.',
      spotlightClicks: true,
      disableOverlayClose: true,
      hideFooter: true,
      placement: 'left',
    },
    {
      target: '.tour-quick-trades',
      content: '🎉 You Own It! Your stock is now in "Quick Trades". Watch the P/L move in real-time.',
      placement: 'right',
    },
    {
      target: '.tour-sell-all-btn',
      content: '🏃 Take the Money: Click Sell All to lock in your position and secure the cash.',
      spotlightClicks: true,
      hideFooter: true,
      placement: 'left',
    },
    {
      target: 'body',
      placement: 'center',
      title: '🚀 You are Ready!',
      content: 'You survived your first trade. Now use the Academy button to learn more strategies!',
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      setRunTour(false);
      setTourIndex(0);
    } else if (type === EVENTS.STEP_AFTER || (type === EVENTS.TARGET_NOT_FOUND && action === ACTIONS.NEXT)) {
      setTourIndex(index + 1);
    }
  };

  const tradingPortfolio = portfolio.filter((item) => {
    const asset = marketAssets.find(a => a.ticker === item.ticker);
    return asset && (asset.type === 'Stocks' || asset.type === 'ETFs');
  });

  const holdingPortfolio = portfolio.filter((item) => {
    const asset = marketAssets.find(a => a.ticker === item.ticker);
    return asset && (asset.type === 'Mutual Funds' || asset.type === 'Fixed Deposits');
  });

  const updateUserXP = async (moduleId: string, xpAmount: number) => {
    try {
      const token = await getToken();
      await fetch("http://localhost:8000/learning/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          module_id: moduleId,
          percentage: 100,
          xp_earned: xpAmount
        })
      });
      await fetchUser();
    } catch (error) {
      console.error("Failed to update XP", error);
    }
  };

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
    if (runTour && tourIndex === 4) {
      setTourIndex(5);
    }

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

      if (runTour && tourIndex === 5) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        updateUserXP('tutorial_trade', 50);
        toast.success("First Trade Bonus: +50 XP!");
        setTourIndex(6);
      }

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

      if (runTour && tourIndex === 7) {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        setTourIndex(8);
      }

    } catch (error) {
      toast.error("Sell transaction failed");
    }
  };

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

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: any;
    const connect = () => {
      ws = new WebSocket("ws://localhost:8000/ws/market");
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMarketAssets(data);
      };
      ws.onclose = () => { reconnectTimer = setTimeout(connect, 3000); };
      ws.onerror = () => { ws.close(); };
    };
    connect();
    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  useEffect(() => {
    calculatePortfolioValue(portfolio, marketAssets);
  }, [marketAssets, portfolio]);

  const renderRiskBadge = (level: RiskLevel) => {
    const colors: Record<RiskLevel, string> = {
      Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.2)]',
      Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.2)]',
      High: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]',
    };
    return (
      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border backdrop-blur-sm ${colors[level]}`}>
        {level}
      </span>
    );
  };

  const renderLearningOverlay = () => {
    if (!isLearningOpen) return null;

    const currentModule = LEARNING_MODULES[activeModuleIndex];
    const currentCard = currentModule.cards[activeCardIndex];
    const isQuiz = currentCard.type === 'quiz';

    const handleNext = () => {
      if (activeCardIndex < currentModule.cards.length - 1) {
        setActiveCardIndex(prev => prev + 1);
      } else {
        if (!learningCompleted.includes(currentModule.id)) {
          setLearningCompleted(prev => [...prev, currentModule.id]);
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          updateUserXP(currentModule.id, 100);
          toast.success(`You mastered ${currentModule.title}! +100 XP`);
        }

        if (activeModuleIndex < LEARNING_MODULES.length - 1) {
          setActiveModuleIndex(prev => prev + 1);
          setActiveCardIndex(0);
        } else {
          setIsLearningOpen(false);
        }
      }
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
        <div className="w-full max-w-xl bg-slate-900 text-slate-50 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 ring-1 ring-white/10">
          <div className={`p-8 bg-gradient-to-br ${currentModule.color} text-white flex justify-between items-start relative overflow-hidden`}>
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <p className="text-xs font-bold opacity-90 uppercase tracking-widest mb-2">FinGenius Academy</p>
              <h2 className="text-3xl font-extrabold flex items-center gap-3">
                {currentModule.title}
              </h2>
            </div>
            <button onClick={() => setIsLearningOpen(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition relative z-10">
              <X size={20} />
            </button>
          </div>

          <div className="p-8 min-h-[320px] flex flex-col justify-center bg-slate-900">
            {isQuiz ? (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2"><Zap size={20}/> Quick Quiz</h3>
                <p className="text-xl font-medium text-slate-200">{currentCard.question}</p>
                <div className="space-y-3">
                  {currentCard.options?.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (idx === currentCard.correct) {
                          toast.success("Correct! 🎉");
                          handleNext();
                        } else {
                          toast.error("Oops! Try again.");
                        }
                      }}
                      className="w-full p-4 text-left rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all font-medium text-slate-300 hover:text-cyan-300"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <h3 className="text-2xl font-bold text-white">{currentCard.title}</h3>
                <p className="text-lg text-slate-300 leading-relaxed">{currentCard.content}</p>

                {currentCard.analogy && (
                  <div className="bg-indigo-500/10 p-5 rounded-xl border-l-4 border-indigo-500">
                    <p className="text-sm font-bold text-indigo-400 mb-2 uppercase tracking-wide">💡 Analogy</p>
                    <p className="italic text-indigo-200 text-lg">"{currentCard.analogy}"</p>
                  </div>
                )}

                <div className="pt-6 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="group flex items-center gap-2 px-8 py-3 bg-white text-slate-900 rounded-full font-bold hover:bg-cyan-50 transition-all shadow-lg shadow-cyan-500/20"
                  >
                    Next <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-slate-950/50 flex justify-center gap-3 border-t border-slate-800">
            {currentModule.cards.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-500 ${idx === activeCardIndex ? `w-12 bg-gradient-to-r ${currentModule.color}` : 'w-2 bg-slate-800'}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const filteredAssets = marketAssets.filter(a => a.type === activeTab);

  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-50 overflow-hidden font-sans p-6 gap-6 transition-colors duration-300 relative overflow-x-hidden selection:bg-cyan-500/30">
      
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      
      {renderLearningOverlay()}

      <Joyride
        steps={tourSteps}
        run={runTour}
        stepIndex={tourIndex}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        disableOverlayClose={tourIndex === 4 || tourIndex === 5 || tourIndex === 7}
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: '#06b6d4',
            textColor: '#0f172a',
            backgroundColor: '#ffffff',
            arrowColor: '#ffffff',
          },
          buttonNext: {
            backgroundColor: '#06b6d4',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 'bold',
            outline: 'none',
          }
        }}
        callback={handleJoyrideCallback}
      />

      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 p-1 rounded-3xl shadow-2xl max-w-lg w-full relative overflow-hidden border border-slate-800">
             <div className="bg-slate-900 rounded-[22px] p-8 relative z-10 h-full">
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
                
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20">
                        <Zap size={32} className="text-white fill-white"/>
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-3">
                    Welcome to <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">FinGenius</span>
                    </h2>
                    <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                    Your journey to financial freedom starts here. Learn to trade stocks, build a portfolio, and manage risk with virtual money.
                    </p>

                    <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={() => {
                        setShowWelcome(false);
                        setRunTour(true);
                        setTourIndex(0);
                        }}
                        className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.02] active:scale-95"
                    >
                        🚀 Start Interactive Tutorial
                    </button>
                    <button
                        onClick={() => setShowWelcome(false)}
                        className="w-full py-4 text-slate-500 font-medium hover:text-slate-300 transition-colors"
                    >
                        Skip Intro
                    </button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {isFdModalOpen && selectedFdAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl shadow-2xl w-full max-w-md border border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                <Briefcase className="text-emerald-500" /> Open Fixed Deposit
              </h3>
              <button onClick={() => setIsFdModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition"><X size={20} /></button>
            </div>
            <div className="space-y-5">
              <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                 <div className="flex justify-between mb-1">
                    <span className="text-sm text-emerald-400 font-medium">Interest Rate</span>
                    <span className="text-sm text-emerald-300 font-bold">{selectedFdAsset.price}% p.a.</span>
                 </div>
                 <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2">
                    <div className="bg-emerald-500 h-1.5 rounded-full w-full"></div>
                 </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400 mb-1.5 block">Amount ($)</label>
                <input type="number" value={fdAmount} onChange={e => setFdAmount(Number(e.target.value))} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white font-mono" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400 mb-1.5 block">Tenure (Years)</label>
                <input type="number" value={fdTenure} onChange={e => setFdTenure(Number(e.target.value))} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white font-mono" />
              </div>
              <button onClick={() => executeBuy(selectedFdAsset, fdAmount)} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 mt-2">Confirm Investment</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-6 h-full overflow-hidden relative z-10">
        <div className="flex flex-col gap-5 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
                 <h1 className="text-2xl font-bold text-white tracking-tight">Investment Market</h1>
                 <p className="text-sm text-slate-400">Real-time data for stocks, ETFs and funds</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setIsLearningOpen(true); setActiveModuleIndex(0); setActiveCardIndex(0); }}
                className="tour-academy-btn group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all text-sm font-bold border border-indigo-500/50"
              >
                <GraduationCap size={18} className="group-hover:rotate-12 transition-transform"/>
                <span>Academy</span>
                {learningCompleted.length > 0 && <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-extrabold">{learningCompleted.length}/3</span>}
              </button>
              <button
                onClick={() => { setRunTour(true); setTourIndex(0); }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 rounded-xl transition-all border border-transparent hover:border-cyan-500/30"
              >
                <HelpCircle size={16} /> Tutorial
              </button>
            </div>
          </div>

          <div className="tour-tabs flex gap-1 p-1.5 bg-slate-900 rounded-xl border border-slate-800 w-fit shadow-sm overflow-x-auto">
            {['Stocks', 'Mutual Funds', 'ETFs', 'Fixed Deposits', 'Portfolio'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-300 ${activeTab === tab
                  ? 'bg-slate-800 text-white shadow-md shadow-black/20 ring-1 ring-white/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="tour-quick-trades flex-shrink-0 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-64 transition-all relative group">
          <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-900/80 flex justify-between items-center sticky top-0 backdrop-blur-md z-10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Activity size={16} className="animate-pulse" /> Active Positions
            </h2>
            <span className="text-xs font-mono px-2 py-1 bg-slate-800 rounded text-slate-300 border border-slate-700">
              {tradingPortfolio.length} Open
            </span>
          </div>

          <div className="overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900/90 sticky top-0 z-10 text-xs font-semibold text-slate-500 uppercase tracking-wider backdrop-blur-sm">
                <tr>
                  <th className="p-3 pl-6">Ticker</th>
                  <th className="p-3 text-right">Qty</th>
                  <th className="p-3 text-right">P/L</th>
                  <th className="p-3 text-right pr-6">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm">
                {tradingPortfolio.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-500 italic">
                      <div className="flex flex-col items-center gap-2">
                        <Briefcase size={24} className="opacity-20"/>
                        <span>No active trades. Scout the market to begin.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tradingPortfolio.map((item, index) => {
                    const asset = marketAssets.find(a => a.ticker === item.ticker);
                    if (!asset) return null;
                    const pl = (asset.price - item.buy_price) * item.quantity;
                    const isProfit = pl >= 0;
                    return (
                      <tr key={item.ticker} className="group/row hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 pl-6 font-bold text-white tracking-wide">{item.ticker}</td>
                        <td className="p-3 text-right font-mono text-slate-300">{item.quantity}</td>
                        <td className={`p-3 text-right font-mono font-bold ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                          {isProfit ? '+' : ''}{pl.toFixed(2)}
                        </td>
                        <td className="p-3 text-right pr-6">
                          <div className="flex justify-end items-center gap-2 opacity-60 group-hover/row:opacity-100 transition-opacity">
                            <input
                              type="number"
                              min={1}
                              max={item.quantity}
                              placeholder="Qty"
                              value={sellQtyMap[item.ticker] || ''}
                              onChange={(e) => setSellQtyMap({ ...sellQtyMap, [item.ticker]: Number(e.target.value) })}
                              className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:border-cyan-500 text-white"
                            />
                            <button
                              onClick={() => {
                                const qtyToSell = sellQtyMap[item.ticker];
                                if (!qtyToSell || qtyToSell <= 0) { toast.error("Enter a valid quantity"); return; }
                                if (qtyToSell > item.quantity) { toast.error(`Max limit: ${item.quantity}`); return; }
                                sellAsset(item.ticker, qtyToSell, asset.type);
                                setSellQtyMap((prev) => ({ ...prev, [item.ticker]: 0 }));
                              }}
                              className="px-3 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors border border-slate-600"
                            >
                              Sell
                            </button>
                            <button
                              onClick={() => sellAsset(item.ticker, item.quantity, asset.type)}
                              className={`px-3 py-1.5 text-xs font-bold bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 text-rose-400 hover:text-white rounded-lg transition-all ${index === 0 ? 'tour-sell-all-btn' : ''}`}
                            >
                              Exit
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

        <div className="tour-market-table flex-1 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-0 relative">
          {activeTab === 'Portfolio' ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 animate-in fade-in duration-300">
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 pb-3 border-b border-slate-800 text-white">
                  <Clock className="text-violet-500" size={20} /> Long Term Holdings
                </h3>
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-950 text-xs text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="p-4">Asset Name</th>
                        <th className="p-4">Type</th>
                        <th className="p-4 text-right">Investment</th>
                        <th className="p-4 text-right">Current Value</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-800">
                      {holdingPortfolio.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-600">No long-term investments found.</td></tr>
                      ) : (
                        holdingPortfolio.map(item => {
                          const asset = marketAssets.find(a => a.ticker === item.ticker);
                          if (!asset) return null;
                          const isFD = asset.type === 'Fixed Deposits';
                          const investVal = isFD ? item.quantity : item.buy_price * item.quantity;
                          const curVal = isFD ? item.quantity : asset.price * item.quantity;
                          return (
                            <tr key={item.ticker} className="hover:bg-slate-800/30 transition-colors">
                              <td className="p-4 font-medium text-white">
                                <div>{asset.name}</div>
                                {isFD && <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded mt-1 inline-block border border-emerald-500/30">{asset.price}% Returns</span>}
                              </td>
                              <td className="p-4 text-slate-400">{asset.type}</td>
                              <td className="p-4 text-right font-mono text-slate-400">${(investVal || 0).toLocaleString()}</td>
                              <td className="p-4 text-right font-bold text-white font-mono">${(curVal || 0).toLocaleString()}</td>
                              <td className="p-4 text-right">
                                <button onClick={() => { if (confirm(isFD ? "Break FD?" : "Redeem all?")) sellAsset(item.ticker, item.quantity, asset.type); }} className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-lg transition-all active:scale-95 ${isFD ? 'bg-orange-600 hover:bg-orange-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
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
            </div>
          ) : (
            <div className="overflow-x-auto flex-1 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="p-4 font-semibold pl-6">Asset Name</th>
                    <th className="p-4 font-semibold">{activeTab === 'Fixed Deposits' ? 'Interest Rate' : 'Price'}</th>
                    <th className="p-4 font-semibold">Risk Level</th>
                    <th className="p-4 font-semibold text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredAssets.length === 0 ? (
                    <tr><td colSpan={4} className="p-12 text-center text-slate-500">No assets available in this category.</td></tr>
                  ) : (
                    filteredAssets.map((asset, index) => (
                      <tr key={asset.ticker} className={`group hover:bg-slate-800/40 transition-colors ${index === 0 ? 'tour-asset-row-0' : ''}`}>
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-950/50 group-hover:ring-1 group-hover:ring-cyan-500/50 transition-all">
                              {asset.ticker.slice(0, 4)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-200 group-hover:text-white">{asset.name}</p>
                              {activeTab !== 'Fixed Deposits' && (
                                <div className={`flex items-center gap-1 text-xs mt-0.5 ${asset.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {asset.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                  {Math.abs(asset.change)}%
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-medium text-white">
                          {activeTab === 'Fixed Deposits' ? <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md text-xs font-bold border border-emerald-500/20">{asset.price}% p.a.</span> : `$${asset.price.toFixed(2)}`}
                        </td>
                        <td className="p-4">{renderRiskBadge(asset.risk)}</td>
                        <td className="p-4 text-right pr-6">
                          <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                            {activeTab !== 'Fixed Deposits' && (
                              <input
                                type="number"
                                min={1}
                                placeholder="Qty"
                                value={buyQtyMap[asset.ticker] || 1}
                                onChange={(e) => {
                                  setBuyQtyMap(prev => ({ ...prev, [asset.ticker]: Number(e.target.value) }));
                                  if (runTour && tourIndex === 4 && index === 0) setTourIndex(5);
                                }}
                                className={`w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 text-xs text-center focus:outline-none focus:ring-1 focus:ring-cyan-500 text-white ${index === 0 ? 'tour-stock-input-0' : ''}`}
                              />
                            )}
                            <button
                              onClick={() => handleBuyClick(asset)}
                              className={`px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase rounded-lg shadow-lg shadow-cyan-900/50 hover:shadow-cyan-500/30 transition-all active:scale-95 ${index === 0 ? 'tour-stock-buy-0' : ''}`}
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

      <div className="w-80 flex flex-col gap-6 flex-shrink-0 z-10">
        <div className="tour-balance-card p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-cyan-500/20 transition-all duration-700"></div>
          
          <div className="relative z-10">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                <Wallet size={14} /> Portfolio Value
            </h3>
            <div className="text-4xl font-extrabold text-white mb-6 tracking-tight">
                ${(portfolioValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Available Cash</p>
                <p className="text-lg font-bold text-emerald-400">
                    ${(balance || 0).toLocaleString()}
                </p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Total P/L</p>
                {(() => {
                    const totalProfit = portfolioValue + balance - 100000;
                    const isProfit = totalProfit >= 0;
                    return <p className={`text-lg font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>{isProfit ? '+' : ''}${Math.abs(totalProfit || 0).toLocaleString()}</p>;
                })()}
                </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-transparent border-l-4 border-orange-500">
                <div className="bg-orange-500/20 p-1.5 rounded-lg">
                    <Activity className="text-orange-500" size={16} />
                </div>
                <div>
                <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Risk Profile</p>
                <p className="text-xs text-slate-300 font-medium">Moderate Growth</p>
                </div>
            </div>
          </div>
        </div>

        <div className="tour-insights flex-1 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 flex flex-col gap-5 shadow-xl">
          <h3 className="text-slate-300 font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
            <Zap size={16} className="text-yellow-400" />
            AI Market Insights
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-indigo-500/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <PieChart size={18} />
                </div>
                <span className="text-sm font-medium text-slate-300">Allocation</span>
              </div>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded">Balanced</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-pink-500/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                  <ShieldCheck size={18} />
                </div>
                <span className="text-sm font-medium text-slate-300">Safety Score</span>
              </div>
              <span className="text-xs text-yellow-400 font-bold">85/100</span>
            </div>
          </div>
          
          <div className="mt-auto relative h-40 rounded-2xl bg-gradient-to-b from-slate-800/30 to-slate-900 border border-slate-800 overflow-hidden flex flex-col items-center justify-center">
             <div className="absolute inset-0 opacity-30 flex items-end justify-between px-2 gap-1 pb-2">
                 {[40, 60, 45, 70, 50, 80, 65, 90].map((h, i) => (
                     <div key={i} className="w-full bg-cyan-500 rounded-t-sm" style={{height: `${h}%`, opacity: i/10 + 0.2}}></div>
                 ))}
             </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest relative z-10 bg-slate-900/80 px-3 py-1 rounded-full backdrop-blur-sm border border-slate-800">Market Trend</span>
          </div>
        </div>
      </div>
    </div >
  );
};

export default InvestmentSimulator;