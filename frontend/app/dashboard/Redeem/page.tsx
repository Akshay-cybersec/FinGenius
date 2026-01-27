'use client'
import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { 
  ShoppingBag, 
  Zap, 
  Check, 
  Lock, 
  Sparkles, 
  Layout, 
  BadgeCheck, 
  ArrowLeft 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import Link from 'next/link';

interface StoreItem {
  item_id: string;
  name: string;
  description: string;
  cost: number;
  type: string;
  image_url: string;
  owned: boolean;
}

const StorePage = () => {
  const { getToken } = useAuth();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [userXP, setUserXP] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const [storeRes, userRes] = await Promise.all([
          fetch('http://localhost:8000/store', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:8000/dashboard', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const storeData = await storeRes.json();
        const userData = await userRes.json();

        setItems(storeData);
        setUserXP(userData.user_data.xp);
      } catch (error) {
        toast.error("Failed to load store data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [getToken]);

  const handleRedeem = async (item: StoreItem) => {
    if (userXP < item.cost) {
      toast.error(`Need ${item.cost - userXP} more XP!`);
      return;
    }

    setRedeeming(item.item_id);

    try {
      const token = await getToken();
      const res = await fetch("http://localhost:8000/store/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ item_id: item.item_id })
      });

      if (!res.ok) throw new Error("Redemption failed");

      const data = await res.json();

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      toast.success(`Redeemed ${item.name}!`);
      
      setUserXP(data.remaining_xp);
      setItems(prev => prev.map(i => i.item_id === item.item_id ? { ...i, owned: true } : i));

    } catch (error) {
      toast.error("Transaction failed. Try again.");
    } finally {
      setRedeeming(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cosmetic': return <Layout size={16} />;
      case 'badge': return <BadgeCheck size={16} />;
      case 'feature': return <Sparkles size={16} />;
      default: return <ShoppingBag size={16} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cosmetic': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'badge': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      case 'feature': return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 font-sans p-6 transition-colors duration-300">
      
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          <div className="space-y-2">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-cyan-600 transition-colors mb-2">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-600 to-indigo-600 dark:from-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">
              XP Redeem Store
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Exchange your knowledge for exclusive rewards and badges.
            </p>
          </div>

          <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-in slide-in-from-right">
            <div className="bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20">
              <Zap className="text-yellow-500 fill-yellow-500" size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Available XP</p>
              <p className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100">
                {userXP.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item, idx) => {
          const canAfford = userXP >= item.cost;
          const isBuying = redeeming === item.item_id;

          return (
            <div 
              key={item.item_id}
              // Added border hover effect
              className={`group relative bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 dark:hover:border-cyan-400/50 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-2 transition-all duration-500 flex flex-col ${item.owned ? 'opacity-80' : ''}`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              
              {/* --- REDESIGNED IMAGE CONTAINER --- */}
              {/* Increased height to h-56 and padding to p-8 for a more premium, spacious feel */}
              <div className="h-56 relative overflow-hidden flex items-center justify-center p-8 z-0">
                
                {/* 1. Premium Spotlight Gradient Background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-200 to-slate-300 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 transition-colors" />
                
                {/* 2. Subtle "Shine" overlay on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full" style={{ transitionProperty: 'transform, opacity' }} />

                {/* 3. The Product Image */}
                <img 
                  src={item.image_url} 
                  alt={item.name} 
                  // - Added z-10 to sit above background
                  // - Used a colored drop-shadow that matches the theme (cyan) to make it "pop"
                  // - More dynamic hover: larger scale and slight rotation
                  className={`w-full h-full object-contain z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_15px_25px_rgba(6,182,212,0.2)] transition-all duration-500 ease-out group-hover:scale-110 group-hover:-rotate-2 ${item.owned ? 'grayscale-[0.5] opacity-90' : ''}`}
                />

                {/* Type Badge (ensured z-index) */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 uppercase tracking-wide z-20 ${getTypeColor(item.type)}`}>
                  {getTypeIcon(item.type)} {item.type}
                </div>
              </div>
              {/* ---------------------------------- */}

              {/* Card Body - Added relative z-10 and background to cover the image container's bottom */}
              <div className="p-6 flex-1 flex flex-col relative z-10 bg-white dark:bg-slate-800">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap size={18} className={`${canAfford || item.owned ? 'text-yellow-500' : 'text-slate-400'}`} />
                    <span className={`text-lg font-bold font-mono ${canAfford || item.owned ? 'text-slate-700 dark:text-slate-200' : 'text-red-400'}`}>
                      {item.cost}
                    </span>
                  </div>

                  {item.owned ? (
                    <button disabled className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-xl font-bold text-sm cursor-default">
                      <Check size={16} /> Owned
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRedeem(item)}
                      disabled={!canAfford || isBuying}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 ${
                        canAfford 
                          ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-500/25' 
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
                      }`}
                    >
                      {isBuying ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : canAfford ? (
                        'Redeem'
                      ) : (
                        <>
                          <Lock size={14} /> Locked
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StorePage;