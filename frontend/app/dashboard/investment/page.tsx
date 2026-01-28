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
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in">
        <div className="w-full max-w-lg bg-card text-card-foreground rounded-3xl shadow-2xl overflow-hidden border border-border">
          <div className={`p-6 bg-gradient-to-r ${currentModule.color} text-white flex justify-between items-center`}>
            <div>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest">FinGenius Academy</p>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {currentModule.title}
              </h2>
            </div>
            <button onClick={() => setIsLearningOpen(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
              <X size={20} />
            </button>
          </div>

          <div className="p-8 min-h-[300px] flex flex-col justify-center">
            {isQuiz ? (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <h3 className="text-xl font-bold">🧠 Quick Quiz</h3>
                <p className="text-lg opacity-90">{currentCard.question}</p>
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
                      className="w-full p-4 text-left rounded-xl border border-border hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-500 transition-all font-medium"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <h3 className="text-2xl font-extrabold">{currentCard.title}</h3>
                <p className="text-lg opacity-80 leading-relaxed">{currentCard.content}</p>

                {currentCard.analogy && (
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border-l-4 border-indigo-500">
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-1">💡 Think of it like this:</p>
                    <p className="italic opacity-90">"{currentCard.analogy}"</p>
                  </div>
                )}

                <div className="pt-6 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-bold hover:scale-105 transition-transform"
                  >
                    Next <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-muted flex justify-center gap-2">
            {currentModule.cards.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${idx === activeCardIndex ? `w-8 bg-gradient-to-r ${currentModule.color}` : 'w-2 bg-slate-300 dark:bg-slate-700'}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const filteredAssets = marketAssets.filter(a => a.type === activeTab);

  return (
    <div className="flex h-full w-full bg-background text-foreground overflow-hidden font-sans p-6 gap-6 transition-colors duration-300 relative overflow-x-hidden">

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
            textColor: '#334155',
            backgroundColor: '#ffffff',
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-card text-card-foreground p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center border border-border relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 to-indigo-500"></div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-600 to-indigo-600 dark:from-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
              Welcome to FinGenius!
            </h2>
            <p className="opacity-80 mb-8 text-lg leading-relaxed">
              Your journey to financial freedom starts here. Learn how to trade stocks, build a portfolio, and manage risk—all with virtual money.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowWelcome(false);
                  setRunTour(true);
                  setTourIndex(0);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.02]"
              >
                🚀 Start Interactive Tutorial
              </button>
              <button
                onClick={() => setShowWelcome(false)}
                className="w-full py-3 text-muted-foreground font-medium hover:bg-muted rounded-xl transition-colors"
              >
                Skip Intro
              </button>
            </div>
          </div>
        </div>
      )}

      {isFdModalOpen && selectedFdAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card text-card-foreground p-6 rounded-2xl shadow-2xl w-full max-w-md border border-border animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Briefcase className="text-cyan-500" /> Open Fixed Deposit
              </h3>
              <button onClick={() => setIsFdModalOpen(false)} className="p-1 hover:bg-muted rounded-full"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm opacity-70">Amount ($)</label>
                <input type="number" value={fdAmount} onChange={e => setFdAmount(Number(e.target.value))} className="w-full p-2 border border-border rounded-lg bg-muted" />
              </div>
              <div>
                <label className="text-sm opacity-70">Tenure (Years)</label>
                <input type="number" value={fdTenure} onChange={e => setFdTenure(Number(e.target.value))} className="w-full p-2 border border-border rounded-lg bg-muted" />
              </div>
              <button onClick={() => executeBuy(selectedFdAsset, fdAmount)} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all shadow-md">Confirm FD</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-6 h-full overflow-hidden">
        <div className="flex flex-col gap-4 flex-shrink-0">
          <div className="flex justify-between items-center">
           <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
  Investment Market
</h1>
            <div className="flex gap-3">
              <button
                onClick={() => { setIsLearningOpen(true); setActiveModuleIndex(0); setActiveCardIndex(0); }}
                className="tour-academy-btn flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg shadow-lg hover:shadow-indigo-500/25 transition-all text-sm font-bold"
              >
                <GraduationCap size={18} />
                Academy
                {learningCompleted.length > 0 && <span className="bg-white/20 px-1.5 rounded text-xs">{learningCompleted.length}/3</span>}
              </button>
              <button
                onClick={() => { setRunTour(true); setTourIndex(0); }}
                className="flex items-center gap-2 text-xs font-medium text-cyan-500 hover:underline"
              >
                <HelpCircle size={14} /> Tutorial
              </button>
            </div>
          </div>

          <div className="tour-tabs flex gap-2 p-1 bg-card/50 backdrop-blur-md rounded-xl border border-border w-fit shadow-sm overflow-x-auto">
            {['Stocks', 'Mutual Funds', 'ETFs', 'Fixed Deposits', 'Portfolio'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${activeTab === tab
                  ? 'bg-cyan-500/10 text-cyan-600 shadow-[0_0_10px_rgba(6,182,212,0.2)] border border-cyan-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="tour-quick-trades flex-shrink-0 bg-card/60 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-md flex flex-col max-h-60 transition-all">
          <div className="px-6 py-3 border-b border-border bg-muted/20 flex justify-between items-center sticky top-0 backdrop-blur-md z-10">
            <h2 className="text-sm font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
              <Activity size={16} /> Quick Trades (Stocks & ETFs)
            </h2>
            <span className="text-xs font-mono opacity-50">
              {tradingPortfolio.length} Positions
            </span>
          </div>

          <div className="overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted sticky top-0 z-10 text-xs font-semibold opacity-60 uppercase tracking-wider backdrop-blur-sm">
                <tr>
                  <th className="p-3 pl-6">Ticker</th>
                  <th className="p-3 text-right">Qty</th>
                  <th className="p-3 text-right">P/L</th>
                  <th className="p-3 text-right pr-6">Fast Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {tradingPortfolio.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center opacity-50 italic">
                      No active stock positions. Go to the Market tab to trade.
                    </td>
                  </tr>
                ) : (
                  tradingPortfolio.map((item, index) => {
                    const asset = marketAssets.find(a => a.ticker === item.ticker);
                    if (!asset) return null;
                    const pl = (asset.price - item.buy_price) * item.quantity;
                    const isProfit = pl >= 0;
                    return (
                      <tr key={item.ticker} className="group hover:bg-muted/50">
                        <td className="p-3 pl-6 font-medium">{item.ticker}</td>
                        <td className="p-3 text-right font-mono opacity-80">{item.quantity}</td>
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
                              className="w-14 bg-muted border border-border rounded-md px-2 py-1 text-xs text-center focus:outline-none focus:border-cyan-500"
                            />
                            <button
                              onClick={() => {
                                const qtyToSell = sellQtyMap[item.ticker];
                                if (!qtyToSell || qtyToSell <= 0) { toast.error("Enter a valid quantity"); return; }
                                if (qtyToSell > item.quantity) { toast.error(`Max limit: ${item.quantity}`); return; }
                                sellAsset(item.ticker, qtyToSell, asset.type);
                                setSellQtyMap((prev) => ({ ...prev, [item.ticker]: 0 }));
                              }}
                              className="px-3 py-1 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded transition-colors"
                            >
                              Sell
                            </button>
                            <button
                              onClick={() => sellAsset(item.ticker, item.quantity, asset.type)}
                              className={`px-3 py-1 text-xs font-bold bg-red-100 dark:bg-red-900/30 hover:bg-red-500 text-red-600 hover:text-white rounded transition-all shadow-sm ${index === 0 ? 'tour-sell-all-btn' : ''}`}
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

        <div className="tour-market-table flex-1 bg-card/60 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-xl flex flex-col min-h-0 relative">
          {activeTab === 'Portfolio' ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 animate-in fade-in duration-300">
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 pb-2 border-b border-border">
                  <Clock className="text-purple-500" size={20} /> Long Term Holdings
                </h3>
                <div className="bg-card/50 rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-muted text-xs opacity-60 uppercase font-semibold">
                      <tr>
                        <th className="p-4">Asset Name</th>
                        <th className="p-4">Type</th>
                        <th className="p-4 text-right">Investment</th>
                        <th className="p-4 text-right">Current Value</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-border">
                      {holdingPortfolio.length === 0 ? (
                        <tr><td colSpan={5} className="p-6 text-center opacity-40">No long-term investments found.</td></tr>
                      ) : (
                        holdingPortfolio.map(item => {
                          const asset = marketAssets.find(a => a.ticker === item.ticker);
                          if (!asset) return null;
                          const isFD = asset.type === 'Fixed Deposits';
                          const investVal = isFD ? item.quantity : item.buy_price * item.quantity;
                          const curVal = isFD ? item.quantity : asset.price * item.quantity;
                          return (
                            <tr key={item.ticker} className="hover:bg-muted/30">
                              <td className="p-4 font-medium">
                                <div>{asset.name}</div>
                                {isFD && <span className="text-[10px] text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded mt-1 inline-block">{asset.price}% Returns</span>}
                              </td>
                              <td className="p-4 opacity-70">{asset.type}</td>
                              <td className="p-4 text-right font-mono opacity-70">${(investVal || 0).toLocaleString()}</td>
                              <td className="p-4 text-right font-bold">${(curVal || 0).toLocaleString()}</td>
                              <td className="p-4 text-right">
                                <button onClick={() => { if (confirm(isFD ? "Break FD?" : "Redeem all?")) sellAsset(item.ticker, item.quantity, asset.type); }} className={`px-3 py-1.5 text-xs font-semibold text-white rounded-lg shadow-sm transition-all active:scale-95 ${isFD ? 'bg-orange-500 hover:bg-orange-600' : 'bg-indigo-500 hover:bg-indigo-600'}`}>
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
                <thead className="sticky top-0 z-10 bg-muted border-b border-border">
                  <tr>
                    <th className="p-4 font-medium">Asset Name</th>
                    <th className="p-4 font-medium">{activeTab === 'Fixed Deposits' ? 'Interest Rate' : 'Price'}</th>
                    <th className="p-4 font-medium">Risk Level</th>
                    <th className="p-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {filteredAssets.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center opacity-40">No assets available in this category.</td></tr>
                  ) : (
                    filteredAssets.map((asset, index) => (
                      <tr key={asset.ticker} className={`group hover:bg-muted/20 transition-colors ${index === 0 ? 'tour-asset-row-0' : ''}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold group-hover:text-cyan-500 transition-colors">
                              {asset.ticker.slice(0, 4)}
                            </div>
                            <div>
                              <p className="font-semibold">{asset.name}</p>
                              {activeTab !== 'Fixed Deposits' && (
                                <div className={`flex items-center gap-1 text-xs ${asset.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {asset.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                  {Math.abs(asset.change)}%
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-medium">
                          {activeTab === 'Fixed Deposits' ? <span className="text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20 px-2 py-1 rounded text-xs font-bold">{asset.price}% p.a.</span> : `$${asset.price.toFixed(2)}`}
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
                                onChange={(e) => {
                                  setBuyQtyMap(prev => ({ ...prev, [asset.ticker]: Number(e.target.value) }));
                                  if (runTour && tourIndex === 4 && index === 0) setTourIndex(5);
                                }}
                                className={`w-16 bg-muted border border-border rounded-lg px-2 text-xs text-center focus:outline-none focus:ring-1 focus:ring-cyan-500 ${index === 0 ? 'tour-stock-input-0' : ''}`}
                              />
                            )}
                            <button
                              onClick={() => handleBuyClick(asset)}
                              className={`px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase rounded-lg shadow-md shadow-cyan-500/20 transition-all active:scale-95 ${index === 0 ? 'tour-stock-buy-0' : ''}`}
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

      <div className="w-80 flex flex-col gap-6 flex-shrink-0">
        <div className="tour-balance-card p-6 rounded-2xl bg-card border border-border backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <h3 className="opacity-60 text-sm font-medium mb-1">Total Portfolio Value</h3>
          <div className="text-3xl font-bold mb-4">
            ${(portfolioValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-muted p-3 rounded-xl border border-border/30">
              <p className="text-xs opacity-50 mb-1">Cash Balance</p>
              <p className="text-lg font-semibold text-emerald-500">
                ${(balance || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-muted p-3 rounded-xl border border-border/30">
              <p className="text-xs opacity-50 mb-1">Total P/L</p>
              {(() => {
                const totalProfit = portfolioValue + balance - 100000;
                const isProfit = totalProfit >= 0;
                return <p className={`text-lg font-semibold ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>{isProfit ? '+' : ''}${Math.abs(totalProfit || 0).toLocaleString()}</p>;
              })()}
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <Activity className="text-orange-500" size={20} />
            <div>
              <p className="text-xs text-orange-500 font-bold uppercase tracking-wider">Risk Profile</p>
              <p className="text-sm opacity-80">Moderate Growth</p>
            </div>
          </div>
        </div>

        <div className="tour-insights flex-1 bg-card rounded-2xl border border-border p-5 flex flex-col gap-4 shadow-lg">
          <h3 className="opacity-80 font-semibold flex items-center gap-2">
            <Zap size={18} className="text-yellow-500" />
            AI Insights
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted hover:opacity-80 transition cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-500">
                  <PieChart size={18} />
                </div>
                <span className="text-sm opacity-80">Asset Allocation</span>
              </div>
              <span className="text-xs text-emerald-500 font-medium">Balanced</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted hover:opacity-80 transition cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/20 text-pink-500">
                  <ShieldCheck size={18} />
                </div>
                <span className="text-sm opacity-80">Safety Score</span>
              </div>
              <span className="text-xs text-yellow-500 font-medium">85/100</span>
            </div>
          </div>
          <div className="mt-auto h-32 rounded-xl bg-gradient-to-t from-cyan-500/10 to-transparent border-b border-cyan-500/20 flex items-end justify-center pb-2">
            <span className="text-xs opacity-30">Market Trend Visualization</span>
          </div>
        </div>
      </div>
    </div >
  );
};

export default InvestmentSimulator;