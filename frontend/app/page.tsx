"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { 
  Award, ChevronRight, Zap, Laptop, Cpu, 
  LineChart, Wallet, GraduationCap, Plus, Book
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import FeatureTimeline from '@/components/FeatureTimeline';

// --- Background Animation Components ---
const FloatingElement = ({ icon: Icon, delay, x, y }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0.1, 0.3, 0.1], 
      y: [0, -20, 0],
      x: [0, 10, 0],
      scale: 1 
    }}
    transition={{ 
      duration: 5, 
      repeat: Infinity, 
      delay, 
      ease: "easeInOut" 
    }}
    style={{ position: 'absolute', left: x, top: y }}
    className="text-primary/30 pointer-events-none hidden lg:block z-0"
  >
    <Icon size={40} />
  </motion.div>
);

const CategoryCard = ({ cat, index }: { cat: any, index: number }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="relative group h-[220px] w-full cursor-pointer"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative h-full p-6 rounded-3xl border border-input bg-card/80 backdrop-blur-md overflow-hidden flex flex-col justify-between transition-all duration-500 hover:border-primary/50 shadow-sm">
        <div style={{ transform: "translateZ(30px)" }} className="space-y-3">
          <div className="p-2.5 bg-primary/10 rounded-xl w-fit text-primary">{cat.icon}</div>
          <h3 className="text-lg font-bold tracking-tight">{cat.title}</h3>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">
            <span className="text-foreground font-bold">{cat.courses}</span> Modules
          </p>
          <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Plus size={14} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function LMSLanding() {
  const [mounted, setMounted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden font-sans">
      <Navbar />

      {/* --- Fintech Background Animation Layer --- */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,54,250,0.03),transparent_70%)]" />
        <FloatingElement icon={Laptop} delay={0} x="5%" y="15%" />
        <FloatingElement icon={LineChart} delay={1} x="90%" y="10%" />
        <FloatingElement icon={Book} delay={2} x="80%" y="80%" />
        <FloatingElement icon={Wallet} delay={3} x="10%" y="75%" />
        <FloatingElement icon={Cpu} delay={1.5} x="50%" y="5%" />
        
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" 
             style={{ backgroundImage: `linear-gradient(to right, #6336FA 1px, transparent 1px), linear-gradient(to bottom, #6336FA 1px, transparent 1px)`, backgroundSize: '50px 50px' }} 
        />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-24 md:pt-36 pb-12 px-6 max-w-7xl mx-auto z-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
              <Zap size={12} className="fill-primary" /> Fintech Learning 2.0
            </div>
            
           <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tighter text-foreground">
  Master the <br />
  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-primary to-purple-600 dark:from-blue-400 dark:via-primary dark:to-purple-400 drop-shadow-sm transition-all duration-300">
    Future of Finance.
  </span>
</h1>

            <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-md leading-relaxed">
              Analyze markets, simulate budgets, and build intellectual capital with our high-growth Fintech workspace.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-primary text-white px-8 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
                >
                  Get Started <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="relative z-10 bg-card/50 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-[2rem] shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Live Market Simulation</p>
                  <h4 className="text-xl font-bold tracking-tight">FinGenius Terminal</h4>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="h-28 w-full bg-muted/30 rounded-xl border border-input overflow-hidden relative">
                  <motion.svg viewBox="0 0 400 100" className="absolute inset-0 w-full h-full stroke-primary fill-none stroke-2">
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1, d: ["M0,50 Q50,20 100,50 T200,50 T300,50 T400,50", "M0,50 Q50,80 100,50 T200,50 T300,50 T400,50", "M0,50 Q50,20 100,50 T200,50 T300,50 T400,50"] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.svg>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-background/50 rounded-xl border border-input text-center">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Accuracy</p>
                    <p className="text-lg font-black text-emerald-500">98.4%</p>
                  </div>
                  <div className="p-3 bg-background/50 rounded-xl border border-input text-center">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Students</p>
                    <p className="text-lg font-black text-primary">12.4k</p>
                  </div>
                </div>
              </div>
            </div>
            
            <motion.div 
              animate={{ y: [0, -8, 0] }} 
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute -bottom-4 -left-4 z-20 bg-yellow-400 p-3 rounded-xl shadow-xl flex items-center gap-2 text-black font-bold scale-90 md:scale-100"
            >
              <Award size={18} />
              <div className="text-[10px] uppercase tracking-tighter leading-none">Top Performer <br/><span className="text-[8px] opacity-70">Verified Skill</span></div>
            </motion.div>
          </motion.div>
        </div>
      </section>
<section className="py-16 md:py-20 bg-muted/10 relative z-10 border-y border-input/50">
      {/* --- Horizontal Feature Timeline --- */}
      <FeatureTimeline />
</section>
      {/* Pathways Section */}
      <section className="py-16 md:py-20 bg-muted/10 relative z-10 border-y border-input/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Learning Pathways</h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">The tools you need to dominate the modern financial landscape.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: "Quant Trading", courses: 12, icon: <LineChart size={20}/>, color: "from-blue-500/20 to-indigo-500/20" },
              { title: "AI in Finance", courses: 8, icon: <Cpu size={20}/>, color: "from-purple-500/20 to-pink-500/20" },
              { title: "Budget Mastery", courses: 15, icon: <Wallet size={20}/>, color: "from-emerald-500/20 to-teal-500/20" },
              { title: "Core Economics", courses: 20, icon: <GraduationCap size={20}/>, color: "from-orange-500/20 to-red-500/20" }
            ].map((cat, i) => (
              <CategoryCard key={i} cat={cat} index={i} />
            ))}
          </div>
        </div>
      </section>

      <footer className="py-10 text-center text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] relative z-10">
        © 2026 FinGenius Academy. Empowering high-growth individuals.
      </footer>
    </div>
  );
}