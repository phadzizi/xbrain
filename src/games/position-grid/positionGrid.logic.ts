import type { ObjectItem } from '../object-disappears/objectDisappears.types';
import { OBJECT_POOL } from '../object-disappears/objectDisappears.logic';
import type {
  CheckResult,
  CellResultData,
  Difficulty,
  PlacedObject,
  PositionGridRound,
} from './positionGrid.types';

const DIFFICULTY_TABLE: readonly Difficulty[] = [
  { gridSize: 3, objectCount: 3, previewMs: 4000 }, // level 1
  { gridSize: 3, objectCount: 4, previewMs: 4000 }, // level 2
  { gridSize: 3, objectCount: 5, previewMs: 4000 }, // level 3
  { gridSize: 4, objectCount: 5, previewMs: 4000 }, // level 4
  { gridSize: 4, objectCount: 7, previewMs: 4000 }, // level 5
  { gridSize: 4, objectCount: 9, previewMs: 3500 }, // level 6
  { gridSize: 5, objectCount: 10, previewMs: 3500 }, // level 7
];

export function getDifficulty(level: number): Difficulty {
  if (level >= 1 && level <= 7) return DIFFICULTY_TABLE[level - 1];
  return { gridSize: 5, objectCount: Math.min(3 + level, 14), previewMs: 3000 };
}

function fisherYates<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generatePlacement(level: number, rng = Math.random): PositionGridRound {
  const diff = getDifficulty(level);
  const totalCells = diff.gridSize * diff.gridSize;

  const objects = fisherYates([...OBJECT_POOL], rng).slice(0, diff.objectCount);

  const allIndices = Array.from({ length: totalCells }, (_, i) => i);
  const cellIndices = fisherYates(allIndices, rng).slice(0, diff.objectCount);

  const placements: PlacedObject[] = objects.map((obj, i) => ({
    objectId: obj.id,
    cellIndex: cellIndices[i],
  }));

  return { gridSize: diff.gridSize, objects, placements };
}

export function buildCorrectGrid(round: PositionGridRound): (ObjectItem | null)[] {
  const totalCells = round.gridSize * round.gridSize;
  const grid: (ObjectItem | null)[] = Array(totalCells).fill(null);
  for (const placement of round.placements) {
    const obj = round.objects.find((o) => o.id === placement.objectId);
    if (obj) grid[placement.cellIndex] = obj;
  }
  return grid;
}

export function checkPlacements(
  round: PositionGridRound,
  playerGrid: (ObjectItem | null)[]
): CheckResult {
  const totalCells = round.gridSize * round.gridSize;
  const correctGrid = buildCorrectGrid(round);
  const cellResults: CellResultData[] = [];
  let roundScore = 0;

  for (let i = 0; i < totalCells; i++) {
    const playerObj = playerGrid[i] ?? null;
    const correctObj = correctGrid[i];

    if (playerObj === null && correctObj === null) {
      cellResults.push({ status: 'empty', playerObject: null, correctObject: null });
    } else if (playerObj !== null && correctObj !== null && playerObj.id === correctObj.id) {
      cellResults.push({ status: 'correct', playerObject: playerObj, correctObject: correctObj });
      roundScore++;
    } else if (playerObj !== null) {
      cellResults.push({ status: 'wrong', playerObject: playerObj, correctObject: correctObj });
    } else {
      cellResults.push({ status: 'missed', playerObject: null, correctObject: correctObj });
    }
  }

  return { cellResults, roundScore, totalObjects: round.objects.length };
}

export function isGameOver(roundScore: number, totalObjects: number): boolean {
  return roundScore < Math.ceil(totalObjects / 2);
}

export function calculateScore(totalCorrect: number): number {
  return totalCorrect;
}
