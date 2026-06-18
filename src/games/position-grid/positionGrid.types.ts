export type { ObjectItem } from '../object-disappears/objectDisappears.types';

import type { ObjectItem } from '../object-disappears/objectDisappears.types';

export type GameStatus = 'idle' | 'countdown' | 'preview' | 'recall' | 'results' | 'complete';

export type Difficulty = {
  gridSize: number;
  objectCount: number;
  previewMs: number;
};

export type PlacedObject = {
  objectId: string;
  cellIndex: number;
};

export type PositionGridRound = {
  gridSize: number;
  objects: ObjectItem[];
  placements: PlacedObject[];
};

export type CellResultStatus = 'correct' | 'wrong' | 'missed' | 'empty';

export type CellResultData = {
  status: CellResultStatus;
  playerObject: ObjectItem | null;
  correctObject: ObjectItem | null;
};

export type CheckResult = {
  cellResults: CellResultData[];
  roundScore: number;
  totalObjects: number;
};
