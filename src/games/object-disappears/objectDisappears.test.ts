import { describe, it, expect } from 'vitest';
import {
  generateRound,
  checkAnswer,
  calculateScore,
  getObjectCount,
  getPreviewDuration,
  OBJECT_POOL,
} from './objectDisappears.logic';

const fixedRng = () => 0;

describe('OBJECT_POOL', () => {
  it('has at least 30 distinct items', () => {
    expect(OBJECT_POOL.length).toBeGreaterThanOrEqual(30);
  });

  it('all ids are unique', () => {
    const ids = OBJECT_POOL.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('getObjectCount', () => {
  it('returns 5 for level 1', () => {
    expect(getObjectCount(1)).toBe(5);
  });

  it('increases by 1 per level up to level 8', () => {
    for (let l = 1; l <= 8; l++) {
      expect(getObjectCount(l)).toBe(Math.min(4 + l, 12));
    }
  });

  it('caps at 12', () => {
    expect(getObjectCount(8)).toBe(12);
    expect(getObjectCount(20)).toBe(12);
  });
});

describe('getPreviewDuration', () => {
  it('returns 3000ms for level 1', () => {
    expect(getPreviewDuration(1)).toBe(3000);
  });

  it('returns 2800ms for level 2', () => {
    expect(getPreviewDuration(2)).toBe(2800);
  });

  it('returns 1800ms for level 6', () => {
    expect(getPreviewDuration(6)).toBe(1800);
  });

  it('returns at least 1500ms for high levels', () => {
    expect(getPreviewDuration(7)).toBeGreaterThanOrEqual(1500);
    expect(getPreviewDuration(20)).toBe(1500);
  });

  it('decreases monotonically as level increases', () => {
    for (let l = 1; l < 10; l++) {
      expect(getPreviewDuration(l)).toBeGreaterThanOrEqual(getPreviewDuration(l + 1));
    }
  });
});

describe('generateRound', () => {
  it('returns the correct number of items for the level', () => {
    const round = generateRound(1, fixedRng);
    expect(round.allItems).toHaveLength(5);
    expect(round.visibleItems).toHaveLength(4);
    expect(round.options).toHaveLength(5);
  });

  it('missing item is not in visibleItems', () => {
    const round = generateRound(1, Math.random);
    const visibleIds = round.visibleItems.map((i) => i.id);
    expect(visibleIds).not.toContain(round.missingItem.id);
  });

  it('options include the missing item', () => {
    const round = generateRound(1, fixedRng);
    const optionIds = round.options.map((o) => o.id);
    expect(optionIds).toContain(round.missingItem.id);
  });

  it('allItems = visibleItems + missingItem', () => {
    const round = generateRound(3, Math.random);
    const allIds = new Set(round.allItems.map((i) => i.id));
    const visibleIds = new Set(round.visibleItems.map((i) => i.id));
    expect(allIds.has(round.missingItem.id)).toBe(true);
    visibleIds.forEach((id) => expect(allIds.has(id)).toBe(true));
    expect(round.allItems).toHaveLength(round.visibleItems.length + 1);
  });

  it('uses rng to vary results', () => {
    const r1 = generateRound(1, () => 0);
    const r2 = generateRound(1, () => 0.99);
    expect(r1.missingItem.id).not.toBe(r2.missingItem.id);
  });

  it('all option items are unique', () => {
    const round = generateRound(2, fixedRng);
    const ids = round.options.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('checkAnswer', () => {
  it('returns true for correct answer', () => {
    const round = generateRound(1, fixedRng);
    expect(checkAnswer(round, round.missingItem.id)).toBe(true);
  });

  it('returns false for wrong answer', () => {
    const round = generateRound(1, fixedRng);
    const wrongId = round.visibleItems[0].id;
    expect(checkAnswer(round, wrongId)).toBe(false);
  });
});

describe('calculateScore', () => {
  it('returns 0 for 0 rounds completed', () => {
    expect(calculateScore(0)).toBe(0);
  });

  it('returns round count with no bonus for rounds 1–5', () => {
    expect(calculateScore(1)).toBe(1);
    expect(calculateScore(5)).toBe(5);
  });

  it('adds 5 bonus points per round after round 5', () => {
    expect(calculateScore(6)).toBe(11); // 6 + 5
    expect(calculateScore(7)).toBe(17); // 7 + 10
    expect(calculateScore(8)).toBe(23); // 8 + 15
  });

  it('grows faster beyond round 5', () => {
    expect(calculateScore(6) - calculateScore(5)).toBeGreaterThan(1);
  });
});
