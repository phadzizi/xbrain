export type CardStatus = 'hidden' | 'flipped' | 'matched';

export type Card = {
  id: string;
  pairId: string;
  emoji: string;
  status: CardStatus;
};

export type GameStatus = 'idle' | 'playing' | 'complete';

export type GridSize = {
  cols: number;
  rows: number;
};
