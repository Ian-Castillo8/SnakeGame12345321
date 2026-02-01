
export type Point = {
  x: number;
  y: number;
};

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export type GameStatus = 'IDLE' | 'PLAYING' | 'GAMEOVER' | 'PAUSED';

export interface AICommentary {
  message: string;
  tone: 'encouraging' | 'mocking' | 'impressed' | 'mysterious';
}
