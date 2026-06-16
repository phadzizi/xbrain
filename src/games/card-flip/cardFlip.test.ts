import { describe, it, expect } from 'vitest';
import { createDeck, checkMatch, calculateScore, getGridSize } from './cardFlip.logic';

const fixedRng = () => 0;

describe('getGridSize', () => {
  it('returns correct grid dimensions for each level', () => {
    expect(getGridSize(1)).toEqual({ cols: 3, rows: 2 });
    expect(getGridSize(2)).toEqual({ cols: 4, rows: 3 });
    expect(getGridSize(3)).toEqual({ cols: 4, rows: 4 });
    expect(getGridSize(4)).toEqual({ cols: 5, rows: 4 });
    expect(getGridSize(5)).toEqual({ cols: 6, rows: 5 });
  });

  it('falls back to level 5 for out-of-range levels', () => {
    expect(getGridSize(99)).toEqual({ cols: 6, rows: 5 });
  });
});

describe('createDeck', () => {
  it('generates 6 cards for level 1', () => {
    expect(createDeck(1, fixedRng)).toHaveLength(6);
  });

  it('generates 12 cards for level 2', () => {
    expect(createDeck(2, fixedRng)).toHaveLength(12);
  });

  it('generates 30 cards for level 5', () => {
    expect(createDeck(5, fixedRng)).toHaveLength(30);
  });

  it('has exactly two cards per pairId', () => {
    const deck = createDeck(3, fixedRng);
    const counts: Record<string, number> = {};
    for (const card of deck) {
      counts[card.pairId] = (counts[card.pairId] ?? 0) + 1;
    }
    for (const count of Object.values(counts)) {
      expect(count).toBe(2);
    }
  });

  it('has no duplicate card ids', () => {
    const deck = createDeck(5, fixedRng);
    const ids = deck.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('starts all cards with hidden status', () => {
    const deck = createDeck(1, fixedRng);
    for (const card of deck) {
      expect(card.status).toBe('hidden');
    }
  });

  it('produces different orderings with different rng values', () => {
    // 0.01 causes Fisher-Yates to always swap toward position 0 (rotation)
    // 0.99 causes Fisher-Yates to never swap (stays in place)
    const deckA = createDeck(2, () => 0.01).map((c) => c.id);
    const deckB = createDeck(2, () => 0.99).map((c) => c.id);
    expect(deckA).not.toEqual(deckB);
  });
});

describe('checkMatch', () => {
  it('returns true for two cards with the same pairId', () => {
    const c1 = { id: '🐶-0', pairId: '🐶', emoji: '🐶', status: 'hidden' as const };
    const c2 = { id: '🐶-1', pairId: '🐶', emoji: '🐶', status: 'hidden' as const };
    expect(checkMatch(c1, c2)).toBe(true);
  });

  it('returns false for two cards with different pairIds', () => {
    const c1 = { id: '🐶-0', pairId: '🐶', emoji: '🐶', status: 'hidden' as const };
    const c2 = { id: '🐱-0', pairId: '🐱', emoji: '🐱', status: 'hidden' as const };
    expect(checkMatch(c1, c2)).toBe(false);
  });

  it('returns false when both references are the same card', () => {
    const c1 = { id: '🐶-0', pairId: '🐶', emoji: '🐶', status: 'hidden' as const };
    expect(checkMatch(c1, c1)).toBe(false);
  });
});

describe('calculateScore', () => {
  it('returns 1000 for perfect play (0 moves, 0 seconds)', () => {
    expect(calculateScore(0, 0)).toBe(1000);
  });

  it('deducts 10 points per move and 2 points per second', () => {
    expect(calculateScore(10, 50)).toBe(800);
  });

  it('never returns below 100', () => {
    expect(calculateScore(1000, 1000)).toBe(100);
  });

  it('awards fewer points for more moves', () => {
    expect(calculateScore(5, 30)).toBeGreaterThan(calculateScore(20, 30));
  });

  it('awards fewer points for more elapsed time', () => {
    expect(calculateScore(5, 10)).toBeGreaterThan(calculateScore(5, 100));
  });
});
