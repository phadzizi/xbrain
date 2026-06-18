export type GameStatus = 'idle' | 'countdown' | 'preview' | 'recall' | 'results' | 'complete';

export type RecallResult = {
  word: string;
  recalled: boolean;
};

export type WordRecallState = {
  status: GameStatus;
  level: number;
  totalScore: number;
  words: string[];
  recalled: string[];
  results: RecallResult[];
};
