import type { Card, GridSize } from './cardFlip.types';

const EMOJIS = [
  '🐶',
  '🐱',
  '🐭',
  '🐹',
  '🐰',
  '🦊',
  '🐻',
  '🐼',
  '🐨',
  '🐯',
  '🦁',
  '🐮',
  '🐷',
  '🐸',
  '🐵',
];

const GRID_SIZES: Record<number, GridSize> = {
  1: { cols: 3, rows: 2 },
  2: { cols: 4, rows: 3 },
  3: { cols: 4, rows: 4 },
  4: { cols: 5, rows: 4 },
  5: { cols: 6, rows: 5 },
};

export function getGridSize(level: number): GridSize {
  return GRID_SIZES[level] ?? GRID_SIZES[5];
}

export function createDeck(level: number, rng = Math.random): Card[] {
  const { cols, rows } = getGridSize(level);
  const pairCount = (cols * rows) / 2;

  // Shuffle emojis and pick pairCount of them
  const pool = [...EMOJIS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const selected = pool.slice(0, pairCount);

  // Build pairs
  const cards: Card[] = [];
  for (const emoji of selected) {
    cards.push({ id: `${emoji}-0`, pairId: emoji, emoji, status: 'hidden' });
    cards.push({ id: `${emoji}-1`, pairId: emoji, emoji, status: 'hidden' });
  }

  // Fisher-Yates shuffle the deck
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}

export function checkMatch(card1: Card, card2: Card): boolean {
  return card1.pairId === card2.pairId && card1.id !== card2.id;
}

export function calculateScore(moves: number, seconds: number): number {
  return Math.max(100, 1000 - moves * 10 - seconds * 2);
}
