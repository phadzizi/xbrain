import type { CellColor, Difficulty, PatternCopyRound } from './patternCopy.types';

export const ALL_COLORS: CellColor[] = ['red', 'blue', 'green', 'yellow', 'purple'];

const DIFFICULTY_TABLE: readonly Difficulty[] = [
  { gridSize: 3, coloredCells: 4, colorsCount: 2, previewMs: 3000 }, // level 1
  { gridSize: 3, coloredCells: 5, colorsCount: 3, previewMs: 3000 }, // level 2
  { gridSize: 4, coloredCells: 7, colorsCount: 3, previewMs: 3000 }, // level 3
  { gridSize: 4, coloredCells: 9, colorsCount: 4, previewMs: 2500 }, // level 4
  { gridSize: 4, coloredCells: 11, colorsCount: 4, previewMs: 2000 }, // level 5
  { gridSize: 5, coloredCells: 13, colorsCount: 4, previewMs: 2000 }, // level 6
];

export function getDifficulty(level: number): Difficulty {
  if (level >= 1 && level <= 6) return DIFFICULTY_TABLE[level - 1];
  return {
    gridSize: 5,
    coloredCells: Math.min(13 + (level - 6) * 2, 24),
    colorsCount: 5,
    previewMs: 2000,
  };
}

function fisherYates<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generatePattern(level: number, rng = Math.random): PatternCopyRound {
  const diff = getDifficulty(level);
  const totalCells = diff.gridSize * diff.gridSize;
  const colorsUsed = ALL_COLORS.slice(0, diff.colorsCount);

  const allIndices = Array.from({ length: totalCells }, (_, i) => i);
  const coloredIndices = fisherYates(allIndices, rng).slice(0, diff.coloredCells);

  const pattern: (CellColor | null)[] = Array(totalCells).fill(null);

  // Guarantee each palette color appears at least once
  for (let i = 0; i < colorsUsed.length; i++) {
    pattern[coloredIndices[i]] = colorsUsed[i];
  }
  // Fill remaining colored cells randomly
  for (let i = colorsUsed.length; i < coloredIndices.length; i++) {
    pattern[coloredIndices[i]] = colorsUsed[Math.floor(rng() * diff.colorsCount)];
  }

  return { pattern, colorsUsed, gridSize: diff.gridSize };
}

export function checkPattern(
  pattern: (CellColor | null)[],
  playerGrid: (CellColor | null)[]
): boolean {
  if (pattern.length !== playerGrid.length) return false;
  return pattern.every((cell, i) => cell === playerGrid[i]);
}

export function getPointsForRound(level: number): number {
  return level > 5 ? 4 : 1;
}

export function calculateScore(roundsCompleted: number): number {
  if (roundsCompleted <= 5) return roundsCompleted;
  return 5 + (roundsCompleted - 5) * 4;
}
