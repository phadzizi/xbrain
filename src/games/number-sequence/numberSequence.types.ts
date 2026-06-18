export type GameStatus =
  | 'idle'
  | 'countdown'
  | 'preview'
  | 'input'
  | 'correct'
  | 'wrong'
  | 'complete';

export type NumberSequenceState = {
  status: GameStatus;
  sequence: number[];
  round: number;
  score: number;
};
