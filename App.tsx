
import React, { useState, useEffect } from 'react';
import SnakeGame from './components/SnakeGame';
import { GameStatus, AICommentary } from './types';
import { getAICommentary, getDailyChallengeName } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>('IDLE');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [arenaName, setArenaName] = useState('The Cyber Grid');
  const [commentary, setCommentary] = useState<AICommentary | null>(null);
  const [isAIThinking, setIsAIThinking] = useState(false);

  useEffect(() => {
    const fetchArena = async () => {
      const name = await getDailyChallengeName();
      setArenaName(name);
    };
    fetchArena();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('snake-high-score');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const handleGameOver = async (finalScore: number) => {
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('snake-high-score', finalScore.toString());
    }
    
    setIsAIThinking(true);
    const aiFeedback = await getAICommentary(finalScore, 'LOSS');
    setCommentary(aiFeedback);
    setIsAIThinking(false);
  };

  const handleScoreUpdate = (newScore: number) => {
    setScore(newScore);
    // Occasionally trigger AI commentary during milestones
    if (newScore > 0 && newScore % 50 === 0) {
      (async () => {
        const aiFeedback = await getAICommentary(newScore, 'MILESTONE');
        setCommentary(aiFeedback);
      })();
    }
  };

  const getToneColor = (tone: AICommentary['tone']) => {
    switch (tone) {
      case 'encouraging': return 'text-emerald-400';
      case 'mocking': return 'text-rose-400';
      case 'impressed': return 'text-amber-400';
      case 'mysterious': return 'text-purple-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row items-center justify-center p-4 gap-8">
      {/* Sidebar - Stats */}
      <div className="w-full md:w-64 space-y-4 order-2 md:order-1">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl">
          <h1 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Current Sector</h1>
          <p className="text-white font-orbitron text-lg leading-tight">{arenaName}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
            <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Score</h2>
            <p className="text-3xl font-orbitron font-bold text-emerald-500">{score}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
            <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-widest">High Score</h2>
            <p className="text-3xl font-orbitron font-bold text-amber-500">{highScore}</p>
          </div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl hidden md:block">
          <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">Instructions</h3>
          <ul className="text-zinc-400 text-sm space-y-1">
            <li>• Use Arrow Keys or WASD</li>
            <li>• Eat Red Cores to grow</li>
            <li>• Avoid the edges and yourself</li>
          </ul>
        </div>

        {/* GitHub/Deploy Hint */}
        <div className="p-4 border border-zinc-800 rounded-2xl bg-zinc-900/50">
          <p className="text-[10px] text-zinc-500 leading-relaxed uppercase font-bold tracking-widest">
            Ready to share? Connect this repo to <span className="text-emerald-400">Vercel</span> for a public URL.
          </p>
        </div>
      </div>

      {/* Main Game Container */}
      <div className="flex-1 max-w-xl w-full flex flex-col items-center order-1 md:order-2">
        <div className="w-full mb-4 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
              NEON SNAKE AI
            </h1>
            <p className="text-zinc-500 text-sm">Enhanced by Gemini-3 Flash</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setStatus(status === 'PLAYING' ? 'PAUSED' : 'PLAYING')}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              disabled={status === 'IDLE' || status === 'GAMEOVER'}
            >
              {status === 'PLAYING' ? '⏸️ Pause' : '▶️ Resume'}
            </button>
          </div>
        </div>

        <SnakeGame 
          onGameOver={handleGameOver} 
          onScoreUpdate={handleScoreUpdate}
          status={status}
          setStatus={setStatus}
        />
      </div>

      {/* AI Commentary Panel */}
      <div className="w-full md:w-80 order-3 h-full">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl h-full flex flex-col shadow-2xl overflow-hidden min-h-[160px] md:min-h-[400px]">
          <div className="bg-zinc-800/50 p-3 border-b border-zinc-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">Gemini Monitor</span>
            </div>
          </div>
          
          <div className="flex-1 p-6 flex flex-col justify-center items-center text-center">
            {isAIThinking ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-zinc-500 text-sm italic">Analyzing performance...</p>
              </div>
            ) : commentary ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className={`text-xl font-medium leading-relaxed mb-4 ${getToneColor(commentary.tone)}`}>
                  "{commentary.message}"
                </p>
                <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest border border-zinc-800 px-2 py-1 rounded">
                  System Tone: {commentary.tone}
                </span>
              </div>
            ) : (
              <p className="text-zinc-600 italic">
                Awaiting input signals... Slither to activate the AI consciousness.
              </p>
            )}
          </div>

          <div className="p-4 bg-zinc-800/20 text-[10px] text-zinc-500 border-t border-zinc-800 font-mono">
            V-0.9 // CONNECTION: STABLE // MODEL: GEMINI-3-FLASH
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
