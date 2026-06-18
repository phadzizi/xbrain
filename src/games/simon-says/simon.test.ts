import { describe, it, expect } from 'vitest';
import {
  generateSequence,
  extendSequence,
  checkTap,
  getPlaybackInterval,
  calculateScore,
  SIMON_COLORS,
} from './simon.logic';

const fixedRng = () => 0;

describe('generateSequence', () => {
  it('generates a sequence of the requested length', () => {
    expect(generateSequence(3, fixedRng)).toHaveLength(3);
    expect(generateSequence(10, fixedRng)).toHaveLength(10);
  });

  it('only contains valid Simon colors', () => {
    const seq = generateSequence(20, Math.random);
    for (const color of seq) {
      expect(SIMON_COLORS).toContain(color);
    }
  });

  it('uses rng to determine colors', () => {
    const seqA = generateSequence(6, () => 0);
    const seqB = generateSequence(6, () => 0.9);
    expect(seqA).not.toEqual(seqB);
  });
});

describe('extendSequence', () => {
  it('returns a sequence one longer than the input', () => {
    const original = ['red', 'blue', 'green'] as const;
    const extended = extendSequence([...original], fixedRng);
    expect(extended).toHaveLength(4);
  });

  it('preserves the original sequence at the start', () => {
    const original = ['red', 'blue', 'green'] as const;
    const extended = extendSequence([...original], fixedRng);
    expect(extended.slice(0, 3)).toEqual(['red', 'blue', 'green']);
  });

  it('appends a valid color', () => {
    const extended = extendSequence(['red'], fixedRng);
    expect(SIMON_COLORS).toContain(extended[1]);
  });

  it('does not mutate the input array', () => {
    const original = ['red', 'blue'] as const;
    const copy = [...original];
    extendSequence([...original], fixedRng);
    expect(copy).toEqual(['red', 'blue']);
  });
});

describe('checkTap', () => {
  const seq = ['red', 'blue', 'green', 'yellow'] as const;

  it('returns true when tapped color matches sequence at playerIndex', () => {
    expect(checkTap([...seq], 0, 'red')).toBe(true);
    expect(checkTap([...seq], 1, 'blue')).toBe(true);
    expect(checkTap([...seq], 3, 'yellow')).toBe(true);
  });

  it('returns false when tapped color does not match', () => {
    expect(checkTap([...seq], 0, 'blue')).toBe(false);
    expect(checkTap([...seq], 2, 'red')).toBe(false);
  });
});

describe('getPlaybackInterval', () => {
  it('returns 800ms for rounds 1–5', () => {
    expect(getPlaybackInterval(1)).toBe(800);
    expect(getPlaybackInterval(5)).toBe(800);
  });

  it('returns 650ms for rounds 6–10', () => {
    expect(getPlaybackInterval(6)).toBe(650);
    expect(getPlaybackInterval(10)).toBe(650);
  });

  it('returns 500ms for rounds 11–15', () => {
    expect(getPlaybackInterval(11)).toBe(500);
    expect(getPlaybackInterval(15)).toBe(500);
  });

  it('returns 400ms for round 16 and beyond', () => {
    expect(getPlaybackInterval(16)).toBe(400);
    expect(getPlaybackInterval(50)).toBe(400);
  });

  it('decreases monotonically as rounds increase', () => {
    expect(getPlaybackInterval(10)).toBeGreaterThanOrEqual(getPlaybackInterval(11));
    expect(getPlaybackInterval(5)).toBeGreaterThanOrEqual(getPlaybackInterval(6));
  });
});

describe('calculateScore', () => {
  it('returns 0 for 0 rounds completed', () => {
    expect(calculateScore(0)).toBe(0);
  });

  it('returns the round count with no bonus for rounds 1–10', () => {
    expect(calculateScore(1)).toBe(1);
    expect(calculateScore(10)).toBe(10);
  });

  it('adds 5 bonus points per round after round 10', () => {
    expect(calculateScore(11)).toBe(16); // 11 + 5
    expect(calculateScore(12)).toBe(22); // 12 + 10
    expect(calculateScore(15)).toBe(40); // 15 + 25
  });

  it('grows faster beyond round 10', () => {
    expect(calculateScore(11) - calculateScore(10)).toBeGreaterThan(1);
  });
});
