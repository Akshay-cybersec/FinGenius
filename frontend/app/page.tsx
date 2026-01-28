"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronRight, Play, Star, BookOpen, Users, Clock, ArrowRight, 
  Rocket, Book, GraduationCap, Plus, Laptop, BrainCircuit, 
  Gamepad2, Wallet, LineChart, Sparkles, CheckCircle2, Zap, Check 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image'; 
import { useTheme } from 'next-themes'; 
import heroImg from "@/assets/image.png"; 

const FloatingShape = ({ icon: Icon, delay, x, y, size = 40, color = "text-blue-200" }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ 
      opacity: [0.3, 0.6, 0.3], 
      y: [0, -40, 0],
      rotate: [0, 15, 0],
    }}
    transition={{ duration: 10, repeat: Infinity, delay, ease: "easeInOut" }}
    style={{ position: 'absolute', left: x, top: y }}
    className={`${color} pointer-events-none hidden lg:block z-0 blur-[0.5px]`}
  >
    <Icon size={size} />
  </motion.div>
);

const StatCard = ({ icon: Icon, title, subtitle, isDark }: any) => (
  <div 
    className="flex items-center gap-4 p-6 backdrop-blur-xl rounded-3xl shadow-xl border relative z-10 transition-all duration-500"
    style={{
      backgroundColor: isDark ? 'rgba(30, 58, 138, 0.4)' : 'rgba(255, 255, 255, 0.6)',
      borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.4)',
      boxShadow: isDark ? '0 20px 25px -5px rgba(0, 0, 0, 0.3)' : '0 20px 25px -5px rgba(59, 130, 246, 0.05)'
    }}
  >
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2D5BFF] to-[#6336FA] flex items-center justify-center text-white shadow-lg">
      <Icon size={28} />
    </div>
    <div>
      <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
      <p className={`text-sm font-medium ${isDark ? 'text-blue-200/60' : 'text-slate-500'}`}>{subtitle}</p>
    </div>
  </div>
);

// --- New Pricing Card Component ---
const PricingCard = ({ title, price, features, recommended, isDark }: any) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className={`relative p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col h-full ${recommended ? 'shadow-2xl shadow-blue-500/20 ring-2 ring-blue-500' : 'shadow-xl'}`}
    style={{
      backgroundColor: isDark ? 'rgba(30, 58, 138, 0.2)' : '#ffffff',
      borderColor: isDark 
        ? (recommended ? '#3b82f6' : 'rgba(59, 130, 246, 0.2)') 
        : (recommended ? '#2563eb' : '#f1f5f9')
    }}
  >
    {recommended && (
      <div className="absolute -top-5 left-0 right-0 flex justify-center">
        <span className="bg-[#2D5BFF] text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
          Most Popular
        </span>
      </div>
    )}
    
    <div className="mb-8">
      <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-blue-200' : 'text-slate-500'}`}>{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className={`text-5xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{price}</span>
        <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>/month</span>
      </div>
    </div>

    <ul className="space-y-4 mb-8 flex-1">
      {features.map((feature: string, idx: number) => (
        <li key={idx} className="flex items-start gap-3">
          <div className="mt-1 min-w-[20px]">
            <CheckCircle2 size={20} className="text-[#2D5BFF]" />
          </div>
          <span className={`text-sm font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {feature}
          </span>
        </li>
      ))}
    </ul>

    <button 
      className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
        recommended 
          ? 'bg-gradient-to-r from-[#2D5BFF] to-[#6336FA] text-white shadow-lg hover:shadow-blue-500/40' 
          : `border-2 hover:bg-blue-50 ${isDark ? 'border-blue-500/30 text-blue-200 hover:bg-blue-900/20' : 'border-slate-200 text-slate-600'}`
      }`}
    >
      Choose {title}
    </button>
  </motion.div>
);

const features = [
  {
    title: "Adaptive Quizzes",
    description: "Assess your baseline skills with AI-driven tests.",
    icon: <BrainCircuit className="w-7 h-7" />,
    color: "from-blue-400 to-indigo-600",
    shadow: "shadow-blue-500/10"
  },
  {
    title: "Gamified Mastery",
    description: "Learn theory through interactive challenges.",
    icon: <Gamepad2 className="w-7 h-7" />,
    color: "from-purple-500 to-pink-500",
    shadow: "shadow-purple-500/10"
  },
  {
    title: "FinQuest Budgeting",
    description: "Simulate real-world financial planning.",
    icon: <Wallet className="w-7 h-7" />,
    color: "from-emerald-400 to-teal-600",
    shadow: "shadow-emerald-500/10"
  },
  {
    title: "Market Simulation",
    description: "Practice trading with live market data.",
    icon: <LineChart className="w-7 h-7" />,
    color: "from-orange-400 to-red-500",
    shadow: "shadow-orange-500/10"
  }
];

export default function LMSLanding() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <div 
      className="relative min-h-screen transition-colors duration-500 font-sans overflow-x-hidden"
      style={{ 
        backgroundColor: isDark ? '#1A2B56' : '#F0F4FF',
        color: isDark ? '#ffffff' : '#0f172a'
      }}
    >
      <Navbar />

      {/* --- Advanced Gradient Background Layer --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[120px] animate-pulse transition-colors duration-700"
          style={{
            background: isDark 
              ? 'linear-gradient(to bottom right, rgba(37, 99, 235, 0.2), rgba(147, 51, 234, 0.1))'
              : 'linear-gradient(to bottom right, rgba(191, 219, 254, 0.5), rgba(233, 213, 255, 0.3))'
          }}
        />
        <div 
          className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] transition-colors duration-700"
          style={{
            background: isDark
              ? 'linear-gradient(to top right, rgba(49, 46, 129, 0.2), rgba(30, 58, 138, 0.2))'
              : 'linear-gradient(to top right, rgba(224, 231, 255, 0.5), rgba(239, 246, 255, 0.5))'
          }}
        />
        
        <FloatingShape icon={Rocket} delay={0} x="85%" y="15%" size={60} color={isDark ? "text-blue-400/20" : "text-blue-400/40"} />
        <FloatingShape icon={Play} delay={2} x="55%" y="10%" size={45} color={isDark ? "text-indigo-400/20" : "text-indigo-400/40"} />
        <FloatingShape icon={Plus} delay={3} x="70%" y="35%" size={30} color={isDark ? "text-blue-500/10" : "text-blue-500/30"} />
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 max-w-[1440px] mx-auto z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h1 
              className="text-6xl md:text-[84px] font-black leading-[1.05] mb-8 tracking-tight transition-colors duration-500"
              style={{ color: isDark ? '#ffffff' : '#1A2B56' }}
            >
              Turn Curiosity <br />
              <span className="bg-gradient-to-r from-[#2D5BFF] via-[#6336FA] to-[#2D5BFF] bg-clip-text text-transparent">Into Mastery.</span>
            </h1>
            <p 
              className="text-xl mb-12 max-w-lg font-medium leading-relaxed transition-colors duration-500"
              style={{ color: isDark ? 'rgba(219, 234, 254, 0.7)' : 'rgba(71, 85, 105, 1)' }}
            >
              Escape the theory loop. Dive into a hands-on learning ecosystem where every lesson is a step toward your next big breakthrough.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <button className="bg-gradient-to-r from-[#2D5BFF] to-[#1e45cc] hover:shadow-2xl hover:shadow-blue-500/40 text-white px-10 py-5 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1">
                Explore Courses <ChevronRight size={22} />
              </button>
              <button 
                className="backdrop-blur-md px-10 py-5 rounded-full font-bold text-lg border shadow-lg transition-all"
                style={{
                  backgroundColor: isDark ? 'rgba(30, 58, 138, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                  color: isDark ? '#ffffff' : '#334155',
                  borderColor: isDark ? 'rgba(30, 64, 175, 1)' : 'rgba(255, 255, 255, 1)'
                }}
              >
                Get Started
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative">
            <div className="relative z-10 w-full group">
               <div className={`absolute inset-0 rounded-full blur-[100px] transition-all duration-700 ${isDark ? 'bg-blue-500/10' : 'bg-blue-400/20 group-hover:bg-blue-400/30'}`} />
               <Image 
                 src={heroImg} 
                 alt="LMS Hero Illustration" 
                 priority 
                 className="w-full h-auto relative z-10 drop-shadow-2xl transition-transform duration-700 group-hover:scale-105 object-contain" 
               />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          <StatCard icon={BookOpen} title="1500+ Courses" subtitle="Find your perfect path." isDark={isDark} />
          <StatCard icon={Users} title="Expert Mentors" subtitle="Industry leading pros." isDark={isDark} />
          <StatCard icon={Clock} title="Flexible Life" subtitle="Learn at your pace." isDark={isDark} />
        </div>
      </section>

      {/* --- Horizontal Feature Timeline Section --- */}
      <section 
        className="py-24 px-6 max-w-[1440px] mx-auto backdrop-blur-3xl rounded-[4rem] shadow-2xl border relative z-10 overflow-hidden transition-all duration-500"
        style={{
          background: isDark 
            ? 'linear-gradient(to bottom, rgba(30, 58, 138, 0.2), rgba(15, 23, 42, 0.4))'
            : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.8))',
          borderColor: isDark ? 'rgba(30, 64, 175, 0.3)' : 'rgba(255, 255, 255, 1)'
        }}
      >
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-4 border transition-colors duration-500"
            style={{
              backgroundColor: isDark ? 'rgba(30, 58, 138, 0.5)' : '#eff6ff',
              color: isDark ? '#93c5fd' : '#2563eb',
              borderColor: isDark ? 'rgba(29, 78, 216, 1)' : '#dbeafe'
            }}
          >
            <Sparkles size={16} /> Roadmap to Success
          </motion.div>
          <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight transition-colors duration-500" style={{ color: isDark ? '#ffffff' : '#1A2B56' }}>
            Our Immersive <span className="text-[#2D5BFF]">Learning Flow</span>
          </h2>
        </div>

        <div className="relative px-4">
          <div 
            className="absolute top-[4.5rem] left-0 w-full h-1 hidden lg:block transition-colors duration-500" 
            style={{ backgroundColor: isDark ? 'rgba(30, 64, 175, 0.5)' : '#f1f5f9' }}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="group relative"
              >
                <div className="flex flex-col items-center lg:items-start mb-8 relative">
                   <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-xl z-20 group-hover:scale-110 transition-transform duration-500`}>
                      {feature.icon}
                   </div>
                </div>

                <div 
                  className="p-8 rounded-[2.5rem] border transition-all duration-500 group-hover:-translate-y-2 shadow-xl shadow-blue-900/5 group-hover:shadow-2xl"
                  style={{
                    backgroundColor: isDark ? 'rgba(30, 58, 138, 0.4)' : '#ffffff',
                    borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#f8fafc'
                  }}
                >
                   <h3 
                    className="text-2xl font-bold mb-4 tracking-tight transition-colors duration-500 group-hover:text-[#2D5BFF]"
                    style={{ color: isDark ? '#ffffff' : '#1A2B56' }}
                   >
                      {feature.title}
                   </h3>
                   <p className={`font-medium leading-relaxed mb-6 transition-colors duration-500 ${isDark ? 'text-blue-100/60' : 'text-slate-500'}`}>
                      {feature.description}
                   </p>
                   <div className="flex items-center gap-2 text-sm font-bold text-[#2D5BFF] opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn More <ArrowRight size={16} />
                   </div>
                </div>
                <div 
                  className="absolute top-[4.25rem] -right-6 w-3 h-3 rounded-full hidden lg:block transition-colors duration-500" 
                  style={{ backgroundColor: isDark ? '#1e3a8a' : '#dbeafe' }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- NEW PRICING & PLANNING SECTION --- */}
      <section className="py-24 px-6 max-w-[1440px] mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-4 border transition-colors duration-500"
            style={{
              backgroundColor: isDark ? 'rgba(30, 58, 138, 0.5)' : '#eff6ff',
              color: isDark ? '#93c5fd' : '#2563eb',
              borderColor: isDark ? 'rgba(29, 78, 216, 1)' : '#dbeafe'
            }}
          >
            <Zap size={16} /> Flexible Plans
          </motion.div>
          <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight transition-colors duration-500" style={{ color: isDark ? '#ffffff' : '#1A2B56' }}>
            Choose Your <span className="text-[#2D5BFF]">Growth Plan</span>
          </h2>
          <p className={`text-xl max-w-2xl mx-auto font-medium transition-colors duration-500 ${isDark ? 'text-blue-100/60' : 'text-slate-500'}`}>
             Start free and scale as you learn. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 px-4">
           {/* Free Plan */}
           <PricingCard 
             title="Starter" 
             price="₹0" 
             isDark={isDark}
             features={[
               "Access to 5 free courses",
               "Basic market simulator access",
               "Community forum support",
               "Mobile app access"
             ]} 
           />

           {/* Pro Plan */}
           <PricingCard 
             title="Pro Scholar" 
             price="₹500" 
             recommended={true}
             isDark={isDark}
             features={[
               "Unlimited course access",
               "Real-time market data feed",
               "1-on-1 Mentor sessions",
               "Certification upon completion",
               "Offline downloads"
             ]} 
           />

           {/* Team Plan */}
           <PricingCard 
             title="Enterprise" 
             price="₹1000" 
             isDark={isDark}
             features={[
               "All Pro features included",
               "Team management dashboard",
               "Custom learning paths",
               "Dedicated success manager",
               "API Access for simulations"
             ]} 
           />
        </div>
      </section>

      {/* Join Community Section */}
      <section className="py-24 px-6 max-w-[1440px] mx-auto">
        <div className="relative overflow-hidden rounded-[3.5rem] bg-gradient-to-br from-[#1A2B56] via-[#2D5BFF] to-[#6336FA] p-16 text-center text-white shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative z-10">
            <h2 className="text-5xl md:text-6xl font-black mb-8 text-white">Join Our Learning Community</h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              Connect with thousands of learners and expert instructors. Share your progress and get hired by top companies.
            </p>
            <button className="bg-white text-[#2D5BFF] hover:bg-blue-50 px-12 py-5 rounded-full font-black text-xl shadow-2xl transition-transform hover:scale-105">
              Get Started for Free
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="pt-24 pb-12 px-10 text-white relative z-10 transition-colors duration-500"
        style={{ backgroundColor: isDark ? '#0F1A36' : '#1A2B56' }}
      >
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 border-b border-white/10 pb-16">
          <div className="space-y-6">
            <div className="text-3xl font-black italic tracking-tighter uppercase">Fin <span className="text-blue-400">Genius</span></div>
            <p className="text-blue-100/60 leading-relaxed font-medium">World-class education, accessible to everyone, everywhere.</p>
          </div>
          </div>
          
        
        <div className="mt-12 text-center text-blue-100/30 font-bold tracking-widest uppercase text-xs">
          © 2026 Fin Genius Academy • All Rights Reserved
        </div>
      </footer>
    </div>
  );
}