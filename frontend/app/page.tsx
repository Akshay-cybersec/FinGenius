"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Zap, Shield, Sparkles, Globe } from 'lucide-react';
import Navbar from '@/components/Navbar';

const features = [
  {
    title: "Instant Scalability",
    desc: "Deploy in seconds, scale in milliseconds. Our infra grows with you.",
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    color: "bg-yellow-50"
  },
  {
    title: "Secure by Design",
    desc: "Military-grade encryption for every byte of data you process.",
    icon: <Shield className="w-6 h-6 text-blue-500" />,
    color: "bg-blue-50"
  },
  {
    title: "AI Automation",
    desc: "Let our neural engine handle the boring repetitive workflows.",
    icon: <Sparkles className="w-6 h-6 text-purple-500" />,
    color: "bg-purple-50"
  }
];

const plans = [
  { name: "Starter", price: "$0", features: ["3 Projects", "Basic Analytics", "Community Support"], color: "border-gray-200" },
  { name: "Pro", price: "$49", features: ["Unlimited Projects", "Advanced AI", "24/7 Priority"], color: "border-[#6336FA] ring-2 ring-[#6336FA]/20", popular: true },
  { name: "Enterprise", price: "Custom", features: ["SLA Guarantee", "Dedicated Manager", "On-premise"], color: "border-black" },
];

export default function StartupLanding() {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1a1a1a] selection:bg-[#6336FA] selection:text-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[#6336FA] text-xs font-bold uppercase tracking-wider mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
              </span>
              v2.0 is now live
            </div>
            <h1 className="text-[clamp(3rem,8vw,5.5rem)] leading-[0.95] font-serif font-medium mb-8 tracking-tighter">
              Build fast. <br />
              <span className="text-[#6336FA] italic">Ship faster.</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-10 max-w-md">
              A workspace designed for the next generation of creators. Clean, fast, and uncompromising.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-[#6336FA] hover:bg-[#5229d1] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-purple-200 flex items-center gap-2 group">
                Start Creating
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white border-2 border-black text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                Live Demo
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            {/* The "Unique" Visual: Floating Dashboard Cards */}
            <div className="relative z-10 bg-white border-2 border-black p-4 rounded-2xl shadow-[20px_20px_0px_0px_#6336FA]">
              <img src="/api/placeholder/600/400" alt="Dashboard" className="rounded-lg border border-gray-100" />
            </div>
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute -top-10 -right-10 z-20 bg-yellow-300 border-2 border-black p-4 rounded-xl shadow-lg hidden md:block"
            >
              <Globe className="w-8 h-8 text-black" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Bento Grid Style */}
      <section className="bg-black py-32 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 text-center">
            <h2 className="text-4xl md:text-6xl font-serif mb-6">Engineered for Excellence</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">We stripped away the clutter to focus on what matters: your productivity.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div 
                whileHover={{ y: -10 }}
                key={i} 
                className="bg-[#1a1a1a] p-10 rounded-3xl border border-white/10 hover:border-purple-500 transition-colors"
              >
                <div className={`${f.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-8`}>
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - The "Glassy" Cards */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-serif mb-16 italic">Simple Pricing. No Secrets.</h2>
          <div className="grid md:grid-cols-3 gap-8 items-end">
            {plans.map((plan, i) => (
              <div key={i} className={`p-8 rounded-3xl border-2 ${plan.color} bg-white transition-all hover:shadow-2xl`}>
                {plan.popular && <span className="text-[#6336FA] font-bold text-xs tracking-widest uppercase mb-4 block">Most Popular</span>}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-5xl font-serif font-medium mb-8">{plan.price}<span className="text-sm font-sans text-gray-400">/mo</span></div>
                <ul className="space-y-4 mb-10 text-left">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-3 text-gray-600">
                      <Check className="w-5 h-5 text-green-500" /> {feat}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-4 rounded-xl font-bold transition-all ${plan.popular ? 'bg-[#6336FA] text-white shadow-lg' : 'bg-gray-100 hover:bg-black hover:text-white'}`}>
                  Choose {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rotate-45" />
              </div>
              <span className="text-2xl font-bold tracking-tighter">startup.</span>
            </div>
            <p className="text-gray-500 max-w-sm mb-8">
              Redefining how teams build and ship software. Made with love for creators worldwide.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-gray-500">
              <li><a href="#" className="hover:text-black">Features</a></li>
              <li><a href="#" className="hover:text-black">Roadmap</a></li>
              <li><a href="#" className="hover:text-black">API Docs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-gray-500">
              <li><a href="#" className="hover:text-black">About</a></li>
              <li><a href="#" className="hover:text-black">Twitter</a></li>
              <li><a href="#" className="hover:text-black">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-20 flex justify-between items-center text-sm text-gray-400">
          <p>© 2026 Startup Inc.</p>
          <div className="flex gap-8">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}