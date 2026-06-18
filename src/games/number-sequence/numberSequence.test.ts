import { describe, it, expect } from 'vitest';
import {
  generateSequence,
  checkAnswer,
  getPreviewDuration,
  calculateScore,
} from './numberSequence.logic';

describe('generateSequence', () => {
  it('generates a sequence of the requested length', () => {
    expect(generateSequence(3)).toHaveLength(3);
    expect(generateSequence(7)).toHaveLength(7);
  });

  it('only contains digits 1–9', () => {
    const seq = generateSequence(100, Math.random);
    for (const digit of seq) {
      expect(digit).toBeGreaterThanOrEqual(1);
      expect(digit).toBeLessThanOrEqual(9);
    }
  });

  it('uses rng to determine digits', () => {
    const seqA = generateSequence(6, () => 0);
    const seqB = generateSequence(6, () => 0.9);
    expect(seqA).not.toEqual(seqB);
  });

  it('never produces 0', () => {
    const seq = generateSequence(50, () => 0);
    expect(seq.every((d) => d >= 1)).toBe(true);
  });
});

describe('checkAnswer', () => {
  it('returns true for exact match', () => {
    expect(checkAnswer([4, 9, 2], '492')).toBe(true);
  });

  it('strips spaces before comparing', () => {
    expect(checkAnswer([4, 9, 2], '4 9 2')).toBe(true);
    expect(checkAnswer([1, 2, 3], '1  2  3')).toBe(true);
  });

  it('returns false for wrong sequence', () => {
    expect(checkAnswer([4, 9, 2], '429')).toBe(false);
  });

  it('returns false for partial input', () => {
    expect(checkAnswer([4, 9, 2], '49')).toBe(false);
  });

  it('returns false for empty input', () => {
    expect(checkAnswer([4, 9, 2], '')).toBe(false);
  });
});

describe('getPreviewDuration', () => {
  it('returns 2000ms for sequences shorter than 2 digits', () => {
    expect(getPreviewDuration(1)).toBe(2000);
  });

  it('returns length * 1000 for lengths 3–5', () => {
    expect(getPreviewDuration(3)).toBe(3000);
    expect(getPreviewDuration(4)).toBe(4000);
    expect(getPreviewDuration(5)).toBe(5000);
  });

  it('caps at 5000ms for lengths beyond 5', () => {
    expect(getPreviewDuration(6)).toBe(5000);
    expect(getPreviewDuration(10)).toBe(5000);
  });
});

describe('calculateScore', () => {
  it('returns 0 for 0 rounds completed', () => {
    expect(calculateScore(0)).toBe(0);
  });

  it('returns round count with no bonus for rounds 1–8', () => {
    expect(calculateScore(1)).toBe(1);
    expect(calculateScore(8)).toBe(8);
  });

  it('adds 3 bonus points per round after round 8', () => {
    expect(calculateScore(9)).toBe(12); // 9 + 3*1
    expect(calculateScore(10)).toBe(16); // 10 + 3*2
    expect(calculateScore(11)).toBe(20); // 11 + 3*3
  });

  it('grows faster beyond round 8', () => {
    expect(calculateScore(9) - calculateScore(8)).toBeGreaterThan(1);
  });
});
