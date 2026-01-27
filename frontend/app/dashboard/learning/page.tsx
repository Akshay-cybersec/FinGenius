"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation'; // <--- IMPORT ROUTER
import { 
  BookOpen, CheckCircle2, Lock, Play, FileText, 
  ChevronRight, Star, Trophy, ArrowUpCircle, X, 
  HeartPulse, PieChart, ShieldCheck, CreditCard, Scale, TrendingUp, Clock, ArrowRightCircle, Zap, ExternalLink
} from 'lucide-react';

// ================= TYPES =================

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
type Status = 'locked' | 'active' | 'completed';

interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  duration: string;
  xp: number;
  status: Status;
  icon: any; 
}

// ================= DATA =================

const LEARNING_MODULES: Lesson[] = [
  {
    id: 'investing',
    title: 'Money Mindset',
    description: 'Understand needs vs. wants and the psychology of spending.',
    difficulty: 'Beginner',
    duration: '3 min read',
    xp: 100,
    status: 'completed',
    icon:  HeartPulse
  },
  {
    id: 'budgeting',
    title: 'The 50/30/20 Rule',
    description: 'The golden rule of budgeting for beginners.',
    difficulty: 'Beginner',
    duration: '5 min video',
    xp: 150,
    status: 'active', 
    icon: PieChart
  },
  {
    id: '3',
    title: 'Emergency Funds',
    description: 'Why you need a safety net and how to build one.',
    difficulty: 'Beginner',
    duration: '4 min read',
    xp: 150,
    status: 'locked',
    icon: ShieldCheck
  },
  {
    id: '4',
    title: 'Credit Scores',
    description: 'How credit works and how to boost your score.',
    difficulty: 'Intermediate',
    duration: '6 min read',
    xp: 300,
    status: 'locked',
    icon: CreditCard
  },
  {
    id: '5',
    title: 'Good vs. Bad Debt',
    description: 'Leveraging loans vs. drowning in interest.',
    difficulty: 'Intermediate',
    duration: '8 min video',
    xp: 350,
    status: 'locked',
    icon: Scale
  },
  {
    id: '6',
    title: 'Stock Market Basics',
    description: 'Intro to ETFs, Stocks, and Bonds.',
    difficulty: 'Advanced',
    duration: '10 min read',
    xp: 500,
    status: 'locked',
    icon: TrendingUp
  },
  {
    id: '7',
    title: 'Retirement Planning',
    description: 'The power of compound interest over time.',
    difficulty: 'Advanced',
    duration: '12 min video',
    xp: 1000,
    status: 'locked',
    icon: Trophy
  }
];

// ================= COMPONENT: LESSON MODAL =================

const LessonModal = ({ lesson, onClose, onComplete }: { lesson: Lesson, onClose: () => void, onComplete: () => void }) => {
  const router = useRouter(); // <--- INITIALIZE ROUTER

  const handleVideoClick = () => {
    // Redirect to the videos page
   //  router.push('/dashboard/learning/lectures');
    router.push(`/dashboard/learning/lectures/${lesson.id}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
    >
      <motion.div 
        initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }}
        className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[85vh] relative"
      >
        {/* Glow Effect */}
        <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${getGradient(lesson.difficulty)}`} />

        <div className={`h-40 bg-gradient-to-br ${getGradient(lesson.difficulty)} relative p-8 flex items-end opacity-90 shrink-0`}>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
           <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors backdrop-blur-sm">
              <X size={20} />
           </button>
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-black/40 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
                    {lesson.difficulty}
                </span>
                <span className="flex items-center gap-1 text-white/80 text-xs font-bold">
                    <Clock size={12} /> {lesson.duration}
                </span>
              </div>
              <h2 className="text-4xl font-black text-white drop-shadow-md">{lesson.title}</h2>
           </div>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-900">
           <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-2 text-yellow-400 font-bold bg-yellow-400/10 px-4 py-2 rounded-xl border border-yellow-400/20">
                  <Trophy size={18} /> 
                  <span>Reward: {lesson.xp} XP</span>
              </div>
              <div className="text-slate-500 text-sm font-medium">Lesson ID: #{lesson.id}</div>
           </div>

           <div className="prose prose-invert max-w-none">
              <p className="text-lg text-slate-300 leading-relaxed mb-8">{lesson.description}</p>
              
              {/* === CLICKABLE VIDEO CARD === */}
              <div 
                onClick={handleVideoClick} 
                className="group relative aspect-video bg-slate-950 rounded-2xl flex flex-col items-center justify-center border border-slate-800 overflow-hidden mb-8 cursor-pointer hover:border-emerald-500/50 transition-all shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10"
              >
                 {/* Background Animation */}
                 <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                 
                 {/* Play Button */}
                 <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-slate-900 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform z-10">
                    <Play size={32} fill="currentColor" className="ml-1" />
                 </div>

                 {/* Text Hint */}
                 <div className="absolute bottom-4 flex items-center gap-2 text-emerald-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    <span>Watch Lesson</span> <ExternalLink size={14} />
                 </div>
              </div>
              {/* ============================ */}

              <h3 className="text-white font-bold text-xl mb-4">Key Takeaways</h3>
              <ul className="space-y-3 text-slate-400">
                 <li className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-emerald-500 mt-1 shrink-0" />
                    <span>Understanding the core principles of the topic.</span>
                 </li>
                 <li className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-emerald-500 mt-1 shrink-0" />
                    <span>Real-world applications and examples.</span>
                 </li>
              </ul>
           </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-950 shrink-0">
           <button 
             onClick={onComplete}
             className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transform active:scale-95"
           >
             Mark as Complete <ArrowRightCircle size={20} />
           </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const getGradient = (difficulty: Difficulty) => {
  switch (difficulty) {
    case 'Beginner': return 'from-blue-600 to-cyan-500';
    case 'Intermediate': return 'from-violet-600 to-purple-500';
    case 'Advanced': return 'from-orange-500 to-red-500';
    default: return 'from-slate-700 to-slate-500';
  }
};

// ================= MAIN COMPONENT =================

export default function LearningPathSystem() {
  const [modules, setModules] = useState(LEARNING_MODULES);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active lesson
  useEffect(() => {
    const activeIndex = modules.findIndex(m => m.status === 'active');
    if (scrollRef.current && activeIndex !== -1) {
        scrollRef.current.scrollTo({ left: activeIndex * 320 - 100, behavior: 'smooth' });
    }
  }, [modules]);

  const handleLessonComplete = () => {
    if (!selectedLesson) return;
    const currentIndex = modules.findIndex(m => m.id === selectedLesson.id);
    const newModules = [...modules];
    
    // Complete current
    newModules[currentIndex].status = 'completed';
    
    // Unlock next
    if (currentIndex + 1 < newModules.length) {
       newModules[currentIndex + 1].status = 'active';
    }

    setModules(newModules);
    setSelectedLesson(null);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans py-12 px-6">
      
      {/* HEADER */}
      <div className="max-w-4xl mx-auto mb-16 text-center">
         <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
            <Zap size={14} className="fill-blue-400" /> Knowledge Base
         </div>
         <h1 className="text-5xl font-black text-white mb-6 tracking-tight drop-shadow-lg">
            Financial <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Mastery Path</span>
         </h1>
         <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Level up your real-world money skills. Complete modules to earn XP and unlock advanced investment strategies.
         </p>
      </div>

      {/* HORIZONTAL ROADMAP */}
      <div className="relative w-full overflow-hidden">
         
         {/* Background Ambient Glow */}
         <div className="absolute top-1/2 left-0 w-full h-64 -translate-y-1/2 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

         <div 
            ref={scrollRef}
            className="flex items-start gap-0 overflow-x-auto pb-24 pt-12 px-10 scrollbar-hide snap-x no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
         >
            {modules.map((lesson, index) => {
               const isLocked = lesson.status === 'locked';
               const isCompleted = lesson.status === 'completed';
               const isActive = lesson.status === 'active';
               const isLast = index === modules.length - 1;
               
               return (
                 <div key={lesson.id} className="flex flex-col items-center relative flex-shrink-0 snap-center group" style={{ width: '320px' }}>
                    
                    {/* --- CONNECTING LINE (Behind) --- */}
                    {!isLast && (
                       <div className="absolute top-[40px] left-[50%] w-full h-1 z-0">
                          {/* Base Track */}
                          <div className="absolute inset-0 bg-slate-800 rounded-full" />
                          
                          {/* Animated Progress Beam */}
                          {(isCompleted) && (
                             <motion.div 
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] rounded-full origin-left"
                             />
                          )}
                       </div>
                    )}

                    {/* --- NODE ICON --- */}
                    <motion.div 
                        whileHover={!isLocked ? { scale: 1.1, rotate: 5 } : {}}
                        whileTap={!isLocked ? { scale: 0.9 } : {}}
                        onClick={() => !isLocked && setSelectedLesson(lesson)}
                        className={`
                           relative w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500 cursor-pointer z-10 border-4
                           ${isCompleted 
                              ? 'bg-slate-900 border-emerald-500 text-emerald-400 shadow-emerald-500/30' 
                              : isActive 
                                 ? 'bg-gradient-to-br from-blue-600 to-indigo-600 border-white text-white shadow-blue-600/50'
                                 : 'bg-slate-900 border-slate-800 text-slate-600 grayscale opacity-80'
                           }
                        `}
                    >
                        {isLocked ? <Lock size={28} /> : <lesson.icon size={36} />}
                        
                        {/* Active Pulse Ring */}
                        {isActive && (
                           <>
                             <span className="absolute -inset-3 rounded-3xl border-2 border-dashed border-blue-400/40 animate-[spin_10s_linear_infinite]" />
                             <span className="absolute -inset-3 rounded-3xl border-2 border-blue-400/20 animate-ping" />
                           </>
                        )}

                        {/* Completed Checkmark Badge */}
                        {isCompleted && (
                           <div className="absolute -top-2 -right-2 bg-emerald-500 text-slate-900 rounded-full p-1 border-2 border-slate-900">
                              <CheckCircle2 size={14} strokeWidth={4} />
                           </div>
                        )}
                    </motion.div>

                    {/* --- LESSON CARD (Below) --- */}
                    <motion.div 
                       initial={{ opacity: 0, y: 20 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true }}
                       onClick={() => !isLocked && setSelectedLesson(lesson)}
                       className={`
                          mt-8 w-64 p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative group-hover:-translate-y-2
                          ${isActive 
                             ? 'bg-slate-800/80 border-blue-500/50 shadow-lg shadow-blue-500/10 backdrop-blur-sm' 
                             : isCompleted 
                                ? 'bg-slate-900/50 border-emerald-500/30' 
                                : 'bg-slate-900/30 border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'
                          }
                       `}
                    >
                       {/* Difficulty Badge */}
                       <div className="flex justify-between items-center mb-3">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider
                             ${isCompleted 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : isActive
                                   ? 'bg-blue-500/20 text-blue-400'
                                   : 'bg-slate-700 text-slate-400'
                             }
                          `}>
                             {lesson.difficulty}
                          </span>
                          {!isLocked && (
                             <ChevronRight size={14} className={`transition-transform group-hover:translate-x-1 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                          )}
                       </div>
                       
                       <h3 className={`text-lg font-bold mb-2 leading-tight ${isLocked ? 'text-slate-500' : 'text-white group-hover:text-blue-200'}`}>
                          {lesson.title}
                       </h3>
                       <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                          {lesson.description}
                       </p>
                    </motion.div>

                 </div>
               );
            })}
            
            {/* End Spacer */}
            <div className="w-10 shrink-0" />
         </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedLesson && (
           <LessonModal 
              lesson={selectedLesson} 
              onClose={() => setSelectedLesson(null)} 
              onComplete={handleLessonComplete}
           />
        )}
      </AnimatePresence>

    </div>
  );
}