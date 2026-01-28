"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Joyride, { STATUS, Step } from 'react-joyride';
import { TrendingUp, TrendingDown, Info, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';

// --- Game Constants & Scenarios ---
const SCENARIOS = [
  {
    id: 1,
    question: "Your $500 Credit Card bill is due today. You have $600 in your bank.",
    options: [
      { text: "Pay the Minimum ($25)", impact: -10, feedback: "Interest will accumulate! High balances hurt your score." },
      { text: "Pay in Full ($500)", impact: +45, feedback: "Perfect! 35% of your score comes from on-time payments." }
    ],
    blog: "Payment History is the biggest factor in your score. Always aim for the full amount!"
  },
  {
    id: 2,
    question: "You want a new laptop. Your credit limit is $1,000.",
    options: [
      { text: "Spend $900 on credit", impact: -30, feedback: "Using over 90% of your limit looks risky to banks." },
      { text: "Spend $250 on credit", impact: +20, feedback: "Smart! Keeping utilization under 30% is the 'Sweet Spot'." }
    ],
    blog: "Credit Utilization: (Balance / Limit). Lower is always better for your score."
  },
  {
    id: 3,
    question: "A department store offers you a card for a 10% discount today.",
    options: [
      { text: "Apply for it", impact: -5, feedback: "Hard inquiries dip your score slightly. Too many are bad!" },
      { text: "Decline the offer", impact: +5, feedback: "Protecting your 'New Credit' factor keeps your score stable." }
    ],
    blog: "Each application triggers a 'Hard Inquiry' which stays on your report for 2 years."
  }
];

export default function CreditQuest() {
  const [score, setScore] = useState(300);
  const [step, setStep] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showBlog, setShowBlog] = useState(false);
  const [runTutorial, setRunTutorial] = useState(true);

  // Joyride Steps for Onboarding
  const tourSteps: Step[] = [
    {
      target: '.score-meter',
      content: 'This is your Credit Score. It ranges from 300 to 850. Your goal is to reach the top!',
      placement: 'bottom',
    },
    {
      target: '.action-card',
      content: 'Read the financial scenario and make a choice. Every click changes your score.',
      placement: 'top',
    },
    {
      target: '.info-btn',
      content: 'Stuck? Click here to learn the logic behind credit scores.',
      placement: 'left',
    }
  ];

  const handleChoice = (impact: number) => {
    setScore(prev => Math.min(Math.max(prev + impact, 300), 850));
    if (step < SCENARIOS.length - 1) {
      setStep(prev => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  const resetGame = () => {
    setScore(300);
    setStep(0);
    setIsGameOver(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 flex flex-col items-center font-sans">
      <Joyride 
        steps={tourSteps} 
        run={runTutorial} 
        continuous 
        showSkipButton 
        styles={{ options: { primaryColor: '#3b82f6' } }}
      />

      {/* Header Section */}
      <header className="w-full max-w-2xl py-8 text-center">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          CREDIT QUEST
        </h1>
        <p className="text-slate-400 mt-2">Level Up Your Financial Future</p>
      </header>

      {/* Score Meter Section */}
      <div className="score-meter w-full max-w-md bg-slate-800 rounded-3xl p-8 mb-8 border border-slate-700 shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-bold text-slate-500">POOR</span>
          <span className="text-sm font-bold text-emerald-500">EXCELLENT</span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-4 w-full bg-slate-700 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500"
            initial={{ width: "0%" }}
            animate={{ width: `${((score - 300) / 550) * 100}%` }}
            transition={{ type: "spring", stiffness: 50 }}
          />
        </div>

        <div className="mt-6 text-center">
          <motion.h2 
            key={score}
            initial={{ scale: 1.5, color: "#10b981" }}
            animate={{ scale: 1, color: "#fff" }}
            className="text-6xl font-black"
          >
            {score}
          </motion.h2>
          <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest">Current Credit Score</p>
        </div>
      </div>

      {/* Main Game Interface */}
      <main className="w-full max-w-md relative">
        <AnimatePresence mode="wait">
          {!isGameOver ? (
            <motion.div 
              key={step}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="action-card bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
                  SCENARIO {step + 1}/{SCENARIOS.length}
                </span>
                <button 
                  onClick={() => setShowBlog(!showBlog)}
                  className="info-btn p-2 hover:bg-slate-700 rounded-full transition-colors"
                >
                  <Info size={20} className="text-slate-400" />
                </button>
              </div>

              <p className="text-lg font-medium leading-relaxed mb-8">
                {SCENARIOS[step].question}
              </p>

              <div className="space-y-4">
                {SCENARIOS[step].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleChoice(opt.impact)}
                    className="w-full p-4 rounded-xl border border-slate-600 hover:border-blue-500 hover:bg-blue-500/10 transition-all text-left group flex justify-between items-center"
                  >
                    <span>{opt.text}</span>
                    <TrendingUp size={18} className="opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity" />
                  </button>
                ))}
              </div>

              {/* Information Blog Drawer */}
              {showBlog && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-blue-500/30 text-sm text-blue-100"
                >
                  <strong>Pro Tip:</strong> {SCENARIOS[step].blog}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center bg-slate-800 p-8 rounded-3xl border border-emerald-500/30"
            >
              <CheckCircle2 size={64} className="mx-auto text-emerald-500 mb-4" />
              <h2 className="text-3xl font-bold mb-2">Game Complete!</h2>
              <p className="text-slate-400 mb-6">Your final financial standing is {score}.</p>
              <button 
                onClick={resetGame}
                className="flex items-center justify-center gap-2 mx-auto bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-full font-bold transition-all"
              >
                <RotateCcw size={18} /> Play Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}