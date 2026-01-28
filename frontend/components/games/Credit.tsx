"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Joyride, { Step } from 'react-joyride';
import { 
  CreditCard, 
  TrendingUp, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight, 
  BookOpen, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Static Educational Data ---
const CREDIT_INFO = [
  {
    title: "What is a Credit Score?",
    content: "A 3-digit number (300-850) that acts as your 'financial report card'. It tells lenders how likely you are to pay back money.",
    icon: <ShieldCheck className="text-blue-400" size={24} />
  },
  {
    title: "The Golden Rule: 30%",
    content: "Keep your 'Credit Utilization' below 30%. If your limit is $1,000, don't spend more than $300 to keep your score high.",
    icon: <Zap className="text-yellow-400" size={24} />
  },
  {
    title: "Benefits of 750+",
    content: "Lower interest rates on loans, higher credit limits, and faster approval for premium credit cards.",
    icon: <TrendingUp className="text-emerald-400" size={24} />
  }
];

const SCENARIOS = [
  {
    id: 1,
    question: "Your $1,000 credit card bill is due. You have $1,200 in the bank. What do you do?",
    options: [
      { text: "Pay the Minimum ($50)", impact: -15, explanation: "Paying only the minimum increases interest debt and hurts your score." },
      { text: "Pay in Full ($1,000)", impact: 45, explanation: "Perfect! Payment History is 35% of your score." }
    ]
  },
  {
    id: 2,
    question: "You want a new phone. Your credit limit is $2,000. The phone costs $1,800.",
    options: [
      { text: "Max out the card", impact: -35, explanation: "High utilization signals financial danger to banks." },
      { text: "Save and pay cash", impact: 25, explanation: "Keeping usage under 30% is the secret to a 750+ score." }
    ]
  },
  {
    id: 3,
    question: "A store offers you a 10% discount if you open a new store credit card today.",
    options: [
      { text: "Open the account", impact: -10, explanation: "Frequent hard inquiries can temporarily dip your score." },
      { text: "Decline the offer", impact: 10, explanation: "Protecting your credit age and avoiding inquiries is wise." }
    ]
  }
];

const CreditGame = () => {
  const [score, setScore] = useState(300);
  const [currentStep, setCurrentStep] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [logs, setLogs] = useState<string[]>(["Welcome! Aim for 850."]);

  const steps: Step[] = [
    { target: '.score-meter', content: 'Your financial reputation starts here!', disableBeacon: true, placement: 'bottom' },
    { target: '.game-card', content: 'Read and choose wisely.', placement: 'right' },
    { target: '.info-log-btn', content: 'Your real-time history appears here.', placement: 'left' },
    { target: '.wisdom-row', content: 'Core financial rules stay here for reference.', placement: 'top' },
  ];

  const handleChoice = (impact: number, explanation: string) => {
    const newScore = Math.min(850, Math.max(300, score + impact));
    setScore(newScore);
    setLogs(prev => [`Score ${impact > 0 ? '+' : ''}${impact}: ${explanation}`, ...prev]);
    if (impact > 0) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    if (currentStep < SCENARIOS.length - 1) setCurrentStep(prev => prev + 1);
    else setIsGameOver(true);
  };

  const restartGame = () => {
    setScore(300); setCurrentStep(0); setIsGameOver(false);
    setLogs(["Game Restarted!"]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans">
      <Joyride steps={steps} continuous showProgress showSkipButton styles={{ options: { primaryColor: '#10b981', backgroundColor: '#1e293b', textColor: '#fff' }}} />

      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-blue-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-6 uppercase tracking-tighter">
          Credit Climb
        </h1>
        <div className="score-meter relative inline-flex flex-col items-center p-6 rounded-3xl border border-slate-800 bg-slate-900/20 backdrop-blur-md">
          <motion.span key={score} animate={{ scale: [1, 1.1, 1] }} className={`text-6xl font-black ${score > 650 ? 'text-emerald-400' : 'text-red-400'}`}>{score}</motion.span>
          <div className="w-64 h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
            <motion.div className="h-full bg-emerald-500" animate={{ width: `${((score - 300) / 550) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Row: Game and Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {!isGameOver ? (
                <motion.div key="game" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="game-card bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl h-full flex flex-col justify-center min-h-[400px]">
                  <span className="text-xs font-bold text-blue-400 mb-4 uppercase tracking-widest">Scenario {currentStep + 1}</span>
                  <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-tight">{SCENARIOS[currentStep].question}</h2>
                  <div className="space-y-4">
                    {SCENARIOS[currentStep].options.map((opt, idx) => (
                      <button key={idx} onClick={() => handleChoice(opt.impact, opt.explanation)} className="w-full group p-5 text-left rounded-2xl border border-slate-800 hover:border-emerald-500 bg-slate-800/30 hover:bg-emerald-500/5 transition-all flex justify-between items-center">
                        <span className="text-lg font-medium group-hover:text-emerald-400">{opt.text}</span>
                        <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform text-slate-600" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-emerald-500/10 border border-emerald-500/30 p-12 rounded-[2rem] text-center h-full flex flex-col justify-center">
                  <h2 className="text-4xl font-black mb-4 text-emerald-400">Mission Accomplished</h2>
                  <p className="text-slate-400 text-xl mb-8 font-medium">Final Rating: <span className="text-white">{score}</span></p>
                  <div className="flex gap-4 justify-center">
                    <button onClick={restartGame} className="p-4 px-8 bg-slate-800 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-700 transition-colors"><RotateCcw size={18}/> Restart</button>
                    <button className="p-4 px-8 bg-emerald-500 text-slate-950 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-400 transition-colors">Next Challenge <ArrowRight size={18}/></button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Insights Log Box (Now Beside Scenario) */}
          <div className="info-log-btn bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 shadow-xl flex flex-col h-[400px] lg:h-full">
            <div className="flex items-center gap-2 mb-4 text-emerald-400">
              <CheckCircle2 size={18} />
              <h3 className="font-bold text-sm uppercase tracking-widest">Insights Log</h3>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar text-[11px]">
              <AnimatePresence initial={false}>
                {logs.map((log, i) => (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} key={i} className={`p-3 rounded-xl border ${log.includes('-') ? 'bg-red-500/5 border-red-500/20 text-red-200' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-100'}`}>
                    {log}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bottom Row: Credit Wisdom (Aligned Horizontally) */}
        <div className="wisdom-row grid grid-cols-1 md:grid-cols-3 gap-6">
          {CREDIT_INFO.map((info, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-[1.5rem] hover:border-blue-500/50 transition-colors shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-800 rounded-lg">{info.icon}</div>
                <h3 className="font-bold text-sm text-white leading-tight">{info.title}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed italic">{info.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreditGame;