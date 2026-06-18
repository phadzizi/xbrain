import type { ObjectDisappearsRound, ObjectItem } from './objectDisappears.types';

export const OBJECT_POOL: ObjectItem[] = [
  { id: 'apple', label: '🍎' },
  { id: 'orange', label: '🍊' },
  { id: 'lemon', label: '🍋' },
  { id: 'grapes', label: '🍇' },
  { id: 'strawberry', label: '🍓' },
  { id: 'watermelon', label: '🍉' },
  { id: 'kiwi', label: '🥝' },
  { id: 'corn', label: '🌽' },
  { id: 'carrot', label: '🥕' },
  { id: 'onion', label: '🧅' },
  { id: 'car', label: '🚗' },
  { id: 'taxi', label: '🚕' },
  { id: 'suv', label: '🚙' },
  { id: 'bus', label: '🚌' },
  { id: 'trolley', label: '🚎' },
  { id: 'police', label: '🚓' },
  { id: 'ambulance', label: '🚑' },
  { id: 'firetruck', label: '🚒' },
  { id: 'pickup', label: '🛻' },
  { id: 'minibus', label: '🚐' },
  { id: 'dog', label: '🐶' },
  { id: 'cat', label: '🐱' },
  { id: 'mouse', label: '🐭' },
  { id: 'hamster', label: '🐹' },
  { id: 'rabbit', label: '🐰' },
  { id: 'fox', label: '🦊' },
  { id: 'bear', label: '🐻' },
  { id: 'panda', label: '🐼' },
  { id: 'koala', label: '🐨' },
  { id: 'tiger', label: '🐯' },
  { id: 'guitar', label: '🎸' },
  { id: 'piano', label: '🎹' },
  { id: 'trumpet', label: '🎺' },
  { id: 'violin', label: '🎻' },
  { id: 'drums', label: '🥁' },
  { id: 'accordion', label: '🪗' },
  { id: 'saxophone', label: '🎷' },
  { id: 'bongo', label: '🪘' },
  { id: 'note', label: '🎵' },
  { id: 'notes', label: '🎶' },
];

export function getObjectCount(level: number): number {
  return Math.min(4 + level, 12);
}

const PREVIEW_DURATIONS_MS = [0, 3000, 2800, 2500, 2200, 2000, 1800];

export function getPreviewDuration(level: number): number {
  if (level <= 6) return PREVIEW_DURATIONS_MS[level];
  return Math.max(3000 - level * 200, 1500);
}

function fisherYates<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateRound(level: number, rng = Math.random): ObjectDisappearsRound {
  const count = getObjectCount(level);
  const shuffled = fisherYates(OBJECT_POOL, rng).slice(0, count);
  const missingIndex = Math.floor(rng() * shuffled.length);
  const missingItem = shuffled[missingIndex];
  const visibleItems = shuffled.filter((_, i) => i !== missingIndex);
  const options = fisherYates(shuffled, rng);
  return {
    allItems: shuffled,
    visibleItems,
    missingItem,
    options,
  };
}

export function checkAnswer(round: ObjectDisappearsRound, answerId: string): boolean {
  return round.missingItem.id === answerId;
}

export function calculateScore(roundsCompleted: number): number {
  return roundsCompleted + Math.max(0, roundsCompleted - 5) * 5;
}
