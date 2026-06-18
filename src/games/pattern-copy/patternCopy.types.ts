export type CellColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

export type GameStatus =
  | 'idle'
  | 'countdown'
  | 'preview'
  | 'copy'
  | 'correct'
  | 'wrong'
  | 'complete';

export type Difficulty = {
  gridSize: number;
  coloredCells: number;
  colorsCount: number;
  previewMs: number;
};

export type PatternCopyRound = {
  pattern: (CellColor | null)[];
  colorsUsed: CellColor[];
  gridSize: number;
};
