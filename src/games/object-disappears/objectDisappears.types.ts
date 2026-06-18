export type GameStatus = 'idle' | 'preview' | 'guessing' | 'correct' | 'wrong' | 'complete';

export type ObjectItem = {
  id: string;
  label: string;
};

export type ObjectDisappearsRound = {
  allItems: ObjectItem[];
  visibleItems: ObjectItem[];
  missingItem: ObjectItem;
  options: ObjectItem[];
};

export type ObjectDisappearsState = {
  status: GameStatus;
  level: number;
  score: number;
  currentRound: ObjectDisappearsRound | null;
};
