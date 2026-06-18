import { describe, it, expect } from 'vitest';
import {
  getDifficulty,
  generatePattern,
  checkPattern,
  getPointsForRound,
  calculateScore,
  ALL_COLORS,
} from './patternCopy.logic';

describe('getDifficulty', () => {
  it('returns correct values for level 1', () => {
    expect(getDifficulty(1)).toEqual({
      gridSize: 3,
      coloredCells: 4,
      colorsCount: 2,
      previewMs: 3000,
    });
  });

  it('returns correct values for level 3', () => {
    expect(getDifficulty(3)).toEqual({
      gridSize: 4,
      coloredCells: 7,
      colorsCount: 3,
      previewMs: 3000,
    });
  });

  it('returns correct values for level 6', () => {
    expect(getDifficulty(6)).toEqual({
      gridSize: 5,
      coloredCells: 13,
      colorsCount: 4,
      previewMs: 2000,
    });
  });

  it('returns 5×5 grid and 5 colors for level 7', () => {
    const d = getDifficulty(7);
    expect(d.gridSize).toBe(5);
    expect(d.colorsCount).toBe(5);
    expect(d.coloredCells).toBe(15);
    expect(d.previewMs).toBe(2000);
  });

  it('caps coloredCells at 24 for very high levels', () => {
    const d = getDifficulty(100);
    expect(d.coloredCells).toBeLessThanOrEqual(24);
  });
});

describe('generatePattern', () => {
  const fixedRng = () => 0.1;

  it('returns the correct gridSize and pattern length', () => {
    const round = generatePattern(1, fixedRng);
    expect(round.gridSize).toBe(3);
    expect(round.pattern.length).toBe(9);
  });

  it('has exactly coloredCells non-null cells', () => {
    const round = generatePattern(1, fixedRng);
    const coloredCount = round.pattern.filter((c) => c !== null).length;
    expect(coloredCount).toBe(getDifficulty(1).coloredCells);
  });

  it('all colored cells use only colors from colorsUsed', () => {
    const round = generatePattern(1, fixedRng);
    const colored = round.pattern.filter((c) => c !== null);
    expect(colored.every((c) => round.colorsUsed.includes(c!))).toBe(true);
  });

  it('all colorsUsed appear in the pattern at least once', () => {
    const round = generatePattern(1, fixedRng);
    expect(round.colorsUsed.every((c) => round.pattern.includes(c))).toBe(true);
  });

  it('colorsUsed length matches getDifficulty colorsCount', () => {
    const round = generatePattern(4, fixedRng);
    expect(round.colorsUsed.length).toBe(getDifficulty(4).colorsCount);
  });

  it('colorsUsed are a subset of ALL_COLORS', () => {
    const round = generatePattern(1, fixedRng);
    expect(round.colorsUsed.every((c) => ALL_COLORS.includes(c))).toBe(true);
  });

  it('level 6 pattern fills a 5×5 grid', () => {
    const round = generatePattern(6, fixedRng);
    expect(round.gridSize).toBe(5);
    expect(round.pattern.length).toBe(25);
    expect(round.pattern.filter((c) => c !== null).length).toBe(13);
  });

  it('is deterministic with the same rng sequence', () => {
    const rng = () => 0.42;
    const r1 = generatePattern(2, rng);
    const r2 = generatePattern(2, rng);
    expect(r1.pattern).toEqual(r2.pattern);
  });
});

describe('checkPattern', () => {
  it('returns true for exact match', () => {
    const p: (string | null)[] = ['red', null, 'blue', null];
    expect(checkPattern(p as never, p as never)).toBe(true);
  });

  it('returns false when player has extra colored cells', () => {
    const pattern = ['red', null];
    const player = ['red', 'blue'];
    expect(checkPattern(pattern as never, player as never)).toBe(false);
  });

  it('returns false when player is missing colored cells', () => {
    const pattern = ['red', null, 'blue', null];
    const player = ['red', null, null, null];
    expect(checkPattern(pattern as never, player as never)).toBe(false);
  });

  it('returns false for wrong colors', () => {
    const pattern = ['red', null];
    const player = ['blue', null];
    expect(checkPattern(pattern as never, player as never)).toBe(false);
  });

  it('returns false for length mismatch', () => {
    expect(checkPattern(['red'] as never, ['red', null] as never)).toBe(false);
  });

  it('returns true for all-null pattern matched by all-null player', () => {
    expect(checkPattern([null, null], [null, null])).toBe(true);
  });
});

describe('getPointsForRound', () => {
  it('returns 1 for levels 1 through 5', () => {
    for (let level = 1; level <= 5; level++) {
      expect(getPointsForRound(level)).toBe(1);
    }
  });

  it('returns 4 for level 6 and above', () => {
    expect(getPointsForRound(6)).toBe(4);
    expect(getPointsForRound(10)).toBe(4);
  });
});

describe('calculateScore', () => {
  it('equals roundsCompleted for rounds 1 through 5', () => {
    expect(calculateScore(1)).toBe(1);
    expect(calculateScore(3)).toBe(3);
    expect(calculateScore(5)).toBe(5);
  });

  it('adds bonus of +3 per round after round 5', () => {
    expect(calculateScore(6)).toBe(9); // 5 + 4
    expect(calculateScore(7)).toBe(13); // 5 + 4 + 4
    expect(calculateScore(10)).toBe(25); // 5 + 5*4
  });
});
