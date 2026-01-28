"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  CreditCard, 
  Coins, 
  ShieldCheck, 
  Ban, 
  RefreshCcw,
  Trophy,TrendingUp 
} from "lucide-react";
import confetti from "canvas-confetti";

// --- Configuration ---
const GRID_SIZE = 5; // 5x5 Grid
const START_SCORE = 650;
const GOAL_SCORE = 800;
const START_CASH = 1500;

// --- Level Design (0: Empty, 1: Wall, 2: Start, 3: Goal, 4: Debt Trap, 5: Credit Boost) ---
const LEVEL_MAP = [
  [2, 0, 4, 0, 5],
  [1, 0, 1, 1, 0],
  [0, 0, 4, 0, 0],
  [0, 1, 1, 1, 4],
  [5, 0, 0, 0, 3]
];

export default function CreditMazeRunner() {
  // --- State ---
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(START_SCORE);
  const [cash, setCash] = useState(START_CASH);
  const [moves, setMoves] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [feedback, setFeedback] = useState("Navigate the maze to reach 800 Credit Score!");
  
  // Animation States
  const [floatingText, setFloatingText] = useState<{id: number, text: string, type: 'good'|'bad', x: number, y: number}[]>([]);
  
  // Refs for debouncing movement
  const isMoving = useRef(false);

  // --- Helpers ---
  const addFloatingText = (text: string, type: 'good' | 'bad') => {
    const id = Date.now();
    // Random offset for visual variety
    const x = Math.random() * 20 - 10; 
    const y = Math.random() * 20 - 10;
    
    setFloatingText(prev => [...prev, { id, text, type, x, y }]);
    setTimeout(() => {
      setFloatingText(prev => prev.filter(ft => ft.id !== id));
    }, 1000);
  };

  const checkTile = (x: number, y: number) => {
    const tileType = LEVEL_MAP[y][x];
    
    // 3: Goal
    if (tileType === 3) {
      if (score >= 720) {
        setGameStatus('won');
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
        setFeedback("🎉 You reached the Prime Rate Castle!");
      } else {
        setFeedback("🔒 Locked! You need 720+ Score to enter.");
        // Bounce back logic could go here, but for now we just warn
      }
      return;
    }

    // 4: Debt Trap (High Interest)
    if (tileType === 4) {
      // Logic: You hit a trap. Pay cash to fix, or take credit hit.
      // Auto-choice for simplicity: Pay if you have cash.
      if (cash >= 300) {
        setCash(prev => prev - 300);
        addFloatingText("-$300", 'bad');
        setFeedback("⚠️ Debt Trap! You paid $300 to escape interest.");
      } else {
        setScore(prev => prev - 50);
        addFloatingText("-50 Score", 'bad');
        setFeedback("📉 Debt Trap! You couldn't pay. Late fee hit your score.");
      }
    }

    // 5: Credit Boost (Utilization Hack)
    if (tileType === 5) {
      setScore(prev => prev + 30);
      addFloatingText("+30 Score", 'good');
      setFeedback("📈 Smart Move! You lowered utilization. Score boosted.");
    }
  };

  const movePlayer = (dx: number, dy: number) => {
    if (gameStatus !== 'playing' || isMoving.current) return;
    
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    // Bounds Check
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) return;

    // Wall Check
    if (LEVEL_MAP[newY][newX] === 1) {
      setFeedback("🚫 Blocked! That's a maxed-out credit line.");
      // Shake animation trigger could go here
      return;
    }

    // Move is valid
    isMoving.current = true;
    setPlayerPos({ x: newX, y: newY });
    setMoves(prev => prev + 1);
    
    // Cost of Living (Movement costs cash)
    setCash(prev => prev - 50);
    
    // Check Tile Event
    checkTile(newX, newY);

    // Score drift (Time decay simulation)
    // Every 5 moves, score drops slightly due to "inquiries" or time if inactive
    if ((moves + 1) % 5 === 0) {
       setScore(prev => prev - 5);
       addFloatingText("-5 Decay", 'bad');
    }

    // Reset move lock
    setTimeout(() => { isMoving.current = false; }, 200);

    // Loss Conditions
    if (cash <= 0) {
      setGameStatus('lost');
      setFeedback("💸 Bankrupt! You ran out of cash.");
    }
  };

  const resetGame = () => {
    setPlayerPos({ x: 0, y: 0 }); // Assuming start is always 0,0 based on map
    setScore(START_SCORE);
    setCash(START_CASH);
    setMoves(0);
    setGameStatus('playing');
    setFeedback("Navigate the maze to reach 800 Credit Score!");
  };

  // --- Keyboard Support ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") movePlayer(0, -1);
      if (e.key === "ArrowDown") movePlayer(0, 1);
      if (e.key === "ArrowLeft") movePlayer(-1, 0);
      if (e.key === "ArrowRight") movePlayer(1, 0);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playerPos, gameStatus]); // Dependencies for closure freshness

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-700 p-8 flex flex-col md:flex-row gap-8 min-h-[600px] font-sans">
      
      {/* --- LEFT: Stats & Info --- */}
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
            <CreditCard className="text-emerald-400" /> Maze Runner
          </h2>
          <p className="text-slate-400 text-sm">Navigate financial obstacles. Reach the goal with 720+ Score.</p>
        </div>

        <div className="space-y-4">
          {/* Score Card */}
          <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Credit Score</span>
              <ShieldCheck size={18} className={score >= 720 ? "text-emerald-400" : "text-yellow-400"} />
            </div>
            <div className="text-4xl font-black text-white">{score}</div>
            
            {/* Floating Text Animation Container */}
            {floatingText.filter(t => t.text.includes("Score")).map(ft => (
              <div 
                key={ft.id}
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-bold animate-out fade-out slide-out-to-top-8 duration-1000 ${ft.type === 'good' ? 'text-emerald-400' : 'text-red-400'}`}
              >
                {ft.text}
              </div>
            ))}
          </div>

          {/* Cash Card */}
          <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 relative overflow-hidden">
             <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Cash on Hand</span>
              <Coins size={18} className="text-yellow-400" />
            </div>
            <div className="text-3xl font-mono font-bold text-white">${cash}</div>
             {floatingText.filter(t => t.text.includes("$")).map(ft => (
              <div 
                key={ft.id}
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-bold animate-out fade-out slide-out-to-top-8 duration-1000 ${ft.type === 'good' ? 'text-emerald-400' : 'text-red-400'}`}
              >
                {ft.text}
              </div>
            ))}
          </div>

           {/* Feedback Box */}
          <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl min-h-[80px] flex items-center justify-center text-center">
            <p className="text-sm text-blue-200 animate-in fade-in zoom-in duration-300" key={feedback}>
              {feedback}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-auto grid grid-cols-2 gap-2 text-xs text-slate-500">
           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-700 rounded-sm"></div> Empty</div>
           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-900/50 border border-red-500 rounded-sm"></div> Debt Trap</div>
           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-600 rounded-sm"></div> Wall</div>
           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-900/50 border border-emerald-500 rounded-sm"></div> Boost</div>
        </div>
      </div>

      {/* --- RIGHT: The Maze Grid --- */}
      <div className="w-full md:w-2/3 bg-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center relative border border-slate-700">
        
        {gameStatus === 'playing' ? (
          <>
            <div 
              className="grid gap-2 mb-6"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
            >
              {LEVEL_MAP.map((row, y) => (
                row.map((cell, x) => {
                  const isPlayer = playerPos.x === x && playerPos.y === y;
                  let cellContent = null;
                  let cellStyle = "bg-slate-700/50 border-slate-600"; // Default

                  if (cell === 1) cellStyle = "bg-slate-600 border-slate-500 shadow-inner"; // Wall
                  if (cell === 2) cellContent = <div className="text-[10px] text-slate-400 uppercase font-bold">Start</div>;
                  if (cell === 3) {
                     cellStyle = "bg-yellow-500/20 border-yellow-500/50";
                     cellContent = <Trophy size={20} className="text-yellow-400" />;
                  }
                  if (cell === 4) {
                     cellStyle = "bg-red-500/10 border-red-500/30";
                     cellContent = <Ban size={20} className="text-red-400 opacity-70" />;
                  }
                  if (cell === 5) {
                     cellStyle = "bg-emerald-500/10 border-emerald-500/30";
                     cellContent = <TrendingUp size={20} className="text-emerald-400 opacity-70" />;
                  }

                  return (
                    <div 
                      key={`${x}-${y}`}
                      className={`w-14 h-14 md:w-20 md:h-20 rounded-xl border-2 flex items-center justify-center relative transition-all duration-300 ${cellStyle}`}
                    >
                      {cellContent}
                      {/* Player Avatar */}
                      {isPlayer && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 animate-in zoom-in duration-300">
                           <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center">
                              <span className="text-xl">🏃</span>
                           </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ))}
            </div>

            {/* Controls (Mobile Friendly) */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-[200px]">
               <div></div>
               <button onClick={() => movePlayer(0, -1)} className="p-4 bg-slate-700 rounded-xl hover:bg-slate-600 active:scale-95 transition-all"><ArrowUp/></button>
               <div></div>
               <button onClick={() => movePlayer(-1, 0)} className="p-4 bg-slate-700 rounded-xl hover:bg-slate-600 active:scale-95 transition-all"><ArrowLeft/></button>
               <button onClick={() => movePlayer(0, 1)} className="p-4 bg-slate-700 rounded-xl hover:bg-slate-600 active:scale-95 transition-all"><ArrowDown/></button>
               <button onClick={() => movePlayer(1, 0)} className="p-4 bg-slate-700 rounded-xl hover:bg-slate-600 active:scale-95 transition-all"><ArrowRight/></button>
            </div>
            <p className="text-xs text-slate-500 mt-4">Use Arrow Keys or Buttons to Move</p>
          </>
        ) : (
          /* Game Over Screen */
          <div className="text-center animate-in zoom-in duration-500">
            {gameStatus === 'won' ? (
              <>
                 <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                 <h2 className="text-3xl font-black text-white mb-4">Credit Master!</h2>
                 <p className="text-slate-300 mb-8">You navigated the maze and kept your score high.</p>
              </>
            ) : (
               <>
                 <Ban className="w-24 h-24 text-red-400 mx-auto mb-6 opacity-80" />
                 <h2 className="text-3xl font-black text-white mb-4">Financial Ruin</h2>
                 <p className="text-slate-300 mb-8">You ran out of cash or your score dropped too low.</p>
              </>
            )}
            <button 
                onClick={resetGame}
                className="px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-200 transition-all flex items-center gap-2 mx-auto"
            >
                <RefreshCcw size={18} /> Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}