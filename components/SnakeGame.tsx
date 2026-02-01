
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Point, Direction, GameStatus } from '../types';
import { GRID_SIZE, INITIAL_SPEED, DIRECTIONS, MIN_SPEED, SPEED_INCREMENT } from '../constants';

interface SnakeGameProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
  status: GameStatus;
  setStatus: (status: GameStatus) => void;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ onGameOver, onScoreUpdate, status, setStatus }) => {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>(Direction.UP);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  
  const lastDirection = useRef<Direction>(Direction.UP);
  const gameLoopRef = useRef<number | null>(null);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Don't spawn food on snake
      if (!currentSnake.some(part => part.x === newFood.x && part.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection(Direction.UP);
    lastDirection.current = Direction.UP;
    setScore(0);
    setSpeed(INITIAL_SPEED);
    onScoreUpdate(0);
  }, [generateFood, onScoreUpdate]);

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (direction) {
        case Direction.UP: newHead.y -= 1; break;
        case Direction.DOWN: newHead.y += 1; break;
        case Direction.LEFT: newHead.x -= 1; break;
        case Direction.RIGHT: newHead.x += 1; break;
      }

      // Check collisions with walls
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setStatus('GAMEOVER');
        onGameOver(score);
        return prevSnake;
      }

      // Check collisions with self
      if (prevSnake.some(part => part.x === newHead.x && part.y === newHead.y)) {
        setStatus('GAMEOVER');
        onGameOver(score);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food
      if (newHead.x === food.x && newHead.y === food.y) {
        const newScore = score + 10;
        setScore(newScore);
        onScoreUpdate(newScore);
        setFood(generateFood(newSnake));
        setSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_INCREMENT));
      } else {
        newSnake.pop();
      }

      lastDirection.current = direction;
      return newSnake;
    });
  }, [direction, food, score, setStatus, onGameOver, onScoreUpdate, generateFood]);

  useEffect(() => {
    if (status === 'PLAYING') {
      gameLoopRef.current = window.setInterval(moveSnake, speed);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [status, moveSnake, speed]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const newDir = DIRECTIONS[e.key as keyof typeof DIRECTIONS] as Direction;
      if (!newDir) return;

      // Prevent 180 degree turns
      const isOpposite = 
        (newDir === Direction.UP && lastDirection.current === Direction.DOWN) ||
        (newDir === Direction.DOWN && lastDirection.current === Direction.UP) ||
        (newDir === Direction.LEFT && lastDirection.current === Direction.RIGHT) ||
        (newDir === Direction.RIGHT && lastDirection.current === Direction.LEFT);

      if (!isOpposite) {
        setDirection(newDir);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (status === 'IDLE') {
      resetGame();
    }
  }, [status, resetGame]);

  return (
    <div className="relative w-full max-w-md aspect-square bg-zinc-900 rounded-xl overflow-hidden border border-zinc-700 shadow-2xl">
      {/* Grid Rendering */}
      <div 
        className="grid w-full h-full"
        style={{ 
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)` 
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isSnakeHead = snake[0].x === x && snake[0].y === y;
          const isSnakeBody = snake.slice(1).some(part => part.x === x && part.y === y);
          const isFood = food.x === x && food.y === y;

          return (
            <div key={i} className="relative flex items-center justify-center border-[0.5px] border-zinc-800/20">
              {isSnakeHead && (
                <div className="w-full h-full bg-emerald-400 rounded-sm shadow-[0_0_10px_#34d399]" />
              )}
              {isSnakeBody && (
                <div className="w-[80%] h-[80%] bg-emerald-600 rounded-sm" />
              )}
              {isFood && (
                <div className="w-[60%] h-[60%] bg-rose-500 rounded-full animate-pulse shadow-[0_0_15px_#f43f5e]" />
              )}
            </div>
          );
        })}
      </div>

      {/* Overlays */}
      {status === 'IDLE' && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-3xl font-orbitron font-bold text-emerald-400 mb-4">READY TO SLITHER?</h2>
          <p className="text-zinc-400 mb-8">Use WASD or Arrow Keys to navigate the grid.</p>
          <button 
            onClick={() => setStatus('PLAYING')}
            className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full transition-all hover:scale-105 active:scale-95"
          >
            START GAME
          </button>
        </div>
      )}

      {status === 'GAMEOVER' && (
        <div className="absolute inset-0 bg-rose-900/40 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-4xl font-orbitron font-bold text-white mb-2">SYSTEM CRASHED</h2>
          <p className="text-rose-200 text-xl mb-6">Final Score: {score}</p>
          <button 
            onClick={() => setStatus('IDLE')}
            className="px-8 py-3 bg-white text-rose-900 font-bold rounded-full transition-all hover:scale-105 active:scale-95"
          >
            REBOOT SYSTEM
          </button>
        </div>
      )}

      {status === 'PAUSED' && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <button 
            onClick={() => setStatus('PLAYING')}
            className="text-white text-5xl hover:scale-110 transition-transform"
          >
            ▶️
          </button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
