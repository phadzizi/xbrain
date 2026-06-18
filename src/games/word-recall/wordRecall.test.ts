import { describe, it, expect } from 'vitest';
import {
  WORD_POOL,
  getWordCount,
  getPreviewDuration,
  drawWords,
  checkRecall,
  getResults,
  calculateRoundScore,
  isGameOver,
  normalizeWord,
} from './wordRecall.logic';

const fixedRng = () => 0;

describe('WORD_POOL', () => {
  it('has at least 100 words', () => {
    expect(WORD_POOL.length).toBeGreaterThanOrEqual(100);
  });

  it('all words are unique', () => {
    expect(new Set(WORD_POOL).size).toBe(WORD_POOL.length);
  });

  it('all words are lowercase with no spaces', () => {
    WORD_POOL.forEach((w) => {
      expect(w).toBe(w.toLowerCase().trim());
    });
  });
});

describe('getWordCount', () => {
  it('returns 4 for level 1', () => {
    expect(getWordCount(1)).toBe(4);
  });

  it('increases by 1 per level', () => {
    expect(getWordCount(2)).toBe(5);
    expect(getWordCount(3)).toBe(6);
  });

  it('caps at 12', () => {
    expect(getWordCount(9)).toBe(12);
    expect(getWordCount(20)).toBe(12);
  });
});

describe('getPreviewDuration', () => {
  it('returns 6000ms for level 1 (4 words × 1.5s)', () => {
    expect(getPreviewDuration(1)).toBe(6000);
  });

  it('returns 7500ms for level 2 (5 words × 1.5s)', () => {
    expect(getPreviewDuration(2)).toBe(7500);
  });

  it('caps at 10000ms', () => {
    expect(getPreviewDuration(4)).toBe(10000); // 7 × 1500 = 10500, capped
    expect(getPreviewDuration(10)).toBe(10000);
  });

  it('never returns less than 3000ms', () => {
    expect(getPreviewDuration(1)).toBeGreaterThanOrEqual(3000);
  });
});

describe('drawWords', () => {
  it('returns the correct count for the level', () => {
    const words = drawWords(1, [], fixedRng);
    expect(words).toHaveLength(4);
  });

  it('returns unique words within a round', () => {
    const words = drawWords(3, [], fixedRng);
    expect(new Set(words).size).toBe(words.length);
  });

  it('excludes already-used words', () => {
    const first = drawWords(1, [], fixedRng);
    const second = drawWords(2, first);
    first.forEach((w) => {
      expect(second).not.toContain(w);
    });
  });

  it('falls back to full pool if not enough unused words remain', () => {
    // Use almost all pool words — should not throw
    const used = WORD_POOL.slice(0, WORD_POOL.length - 2);
    const words = drawWords(1, used);
    expect(words).toHaveLength(4);
  });

  it('produces different results with different rng', () => {
    const r1 = drawWords(1, [], () => 0);
    const r2 = drawWords(1, [], () => 0.99);
    expect(r1.join()).not.toBe(r2.join());
  });
});

describe('normalizeWord', () => {
  it('lowercases and trims', () => {
    expect(normalizeWord('  Cat  ')).toBe('cat');
    expect(normalizeWord('FISH')).toBe('fish');
  });
});

describe('checkRecall', () => {
  const words = ['cat', 'dog', 'fish'];

  it('returns true for exact match', () => {
    expect(checkRecall(words, 'cat')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(checkRecall(words, 'CAT')).toBe(true);
    expect(checkRecall(words, 'Dog')).toBe(true);
  });

  it('trims whitespace', () => {
    expect(checkRecall(words, '  fish  ')).toBe(true);
  });

  it('returns false for a word not in the list', () => {
    expect(checkRecall(words, 'lion')).toBe(false);
  });

  it('returns false for empty input', () => {
    expect(checkRecall(words, '')).toBe(false);
    expect(checkRecall(words, '   ')).toBe(false);
  });
});

describe('calculateRoundScore', () => {
  const words = ['cat', 'dog', 'fish', 'bird'];

  it('returns 0 when nothing was recalled', () => {
    expect(calculateRoundScore(words, [])).toBe(0);
  });

  it('returns full count when all words recalled', () => {
    expect(calculateRoundScore(words, ['cat', 'dog', 'fish', 'bird'])).toBe(4);
  });

  it('counts partial recall', () => {
    expect(calculateRoundScore(words, ['cat', 'dog'])).toBe(2);
  });

  it('is case-insensitive', () => {
    expect(calculateRoundScore(words, ['CAT', 'FISH'])).toBe(2);
  });

  it('ignores words not in the list', () => {
    expect(calculateRoundScore(words, ['lion', 'wolf'])).toBe(0);
  });
});

describe('getResults', () => {
  const words = ['cat', 'dog', 'fish'];

  it('marks recalled words as recalled', () => {
    const results = getResults(words, ['cat']);
    expect(results.find((r) => r.word === 'cat')?.recalled).toBe(true);
    expect(results.find((r) => r.word === 'dog')?.recalled).toBe(false);
  });

  it('is case-insensitive', () => {
    const results = getResults(words, ['CAT', 'DOG']);
    expect(results.find((r) => r.word === 'cat')?.recalled).toBe(true);
    expect(results.find((r) => r.word === 'dog')?.recalled).toBe(true);
  });

  it('returns all words in the result', () => {
    const results = getResults(words, []);
    expect(results).toHaveLength(words.length);
  });
});

describe('isGameOver', () => {
  it('returns true when round score is 0', () => {
    expect(isGameOver(0)).toBe(true);
  });

  it('returns false when round score is positive', () => {
    expect(isGameOver(1)).toBe(false);
    expect(isGameOver(4)).toBe(false);
  });
});
