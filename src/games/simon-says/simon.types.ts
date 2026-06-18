export type SimonColor = 'red' | 'blue' | 'green' | 'yellow';

export type GameStatus = 'idle' | 'preview' | 'input' | 'complete';

export type SimonState = {
  status: GameStatus;
  sequence: SimonColor[];
  round: number;
  score: number;
  playerIndex: number;
};
