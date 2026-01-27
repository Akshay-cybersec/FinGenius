"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  PieChart, 
  TrendingUp, 
  BookOpen, 
  Gamepad2, 
  ChevronRight 
} from 'lucide-react';

const features = [
  {
    title: "Quizzes",
    description: "Test your financial IQ with real-time feedback.",
    icon: <HelpCircle size={18} />,
    color: "from-blue-500 to-cyan-400",
    glow: "rgba(59, 130, 246, 0.6)"
  },
  {
    title: "Budgeting",
    description: "Master cash flow in a risk-free digital sandbox.",
    icon: <PieChart size={18} />,
    color: "from-emerald-500 to-teal-400",
    glow: "rgba(16, 185, 129, 0.6)"
  },
  {
    title: "Investing",
    description: "Trade virtual assets with live market data.",
    icon: <TrendingUp size={18} />,
    color: "from-orange-500 to-amber-400",
    glow: "rgba(245, 158, 11, 0.6)"
  },
  {
    title: "Learning",
    description: "Curriculums that evolve with your goals.",
    icon: <BookOpen size={18} />,
    color: "from-purple-500 to-indigo-400",
    glow: "rgba(139, 92, 246, 0.6)"
  },
  {
    title: "Gaming",
    description: "Gamified challenges for the leaderboard.",
    icon: <Gamepad2 size={18} />,
    color: "from-pink-500 to-rose-400",
    glow: "rgba(236, 72, 153, 0.6)"
  }
];

export default function FeatureTimeline() {
  return (
    <section className="py-20 bg-background overflow-hidden relative">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Added mb-20 for a clear gap between text and boxes */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-2"
          >
            <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
              Features we provide
            </h2>
            <p className="text-muted-foreground text-base max-w-md">
              A streamlined journey through our fintech ecosystem.
            </p>
          </motion.div>
        </div>

        <div className="relative">
          {/* Background Connecting Line - Slightly more visible */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2 hidden md:block" />

          <div className="flex flex-row gap-6 overflow-x-auto pb-10 no-scrollbar items-stretch">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100 
                }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="relative min-w-[220px] md:min-w-[0] flex-1 group"
              >
                {/* Timeline Dot with Intense Glow */}
                <motion.div 
                  className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary z-20 hidden md:block shadow-[0_0_15px_rgba(99,54,250,1)]" 
                />

                {/* Main Card Container */}
                <div className="relative h-full p-6 rounded-[2rem] border border-input bg-card/40 backdrop-blur-xl group-hover:border-primary/50 group-hover:bg-card/60 transition-all duration-500 flex flex-col items-start gap-4 overflow-hidden shadow-2xl shadow-black/20">
                  
                  {/* Glowing Icon Wrapper with Breathing Animation */}
                  <motion.div 
                    animate={{ 
                      boxShadow: [
                        `0 0 10px ${feature.glow}`,
                        `0 0 25px ${feature.glow}`,
                        `0 0 10px ${feature.glow}`
                      ],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className={`p-3 rounded-2xl bg-gradient-to-br ${feature.color} text-white relative z-10 shadow-lg`}
                  >
                    {feature.icon}
                  </motion.div>

                  <div className="space-y-2 relative z-10">
                    <h3 className="text-lg font-bold tracking-tight leading-tight group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  

                  {/* Radial Gradient Hover Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />
                  
                  {/* Intense corner glow */}
                  <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-700`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}