import type { SimonColor } from './simon.types';

export const SIMON_COLORS: SimonColor[] = ['red', 'blue', 'green', 'yellow'];

export function generateSequence(length: number, rng = Math.random): SimonColor[] {
  return Array.from({ length }, () => SIMON_COLORS[Math.floor(rng() * SIMON_COLORS.length)]);
}

export function extendSequence(sequence: SimonColor[], rng = Math.random): SimonColor[] {
  const next = SIMON_COLORS[Math.floor(rng() * SIMON_COLORS.length)];
  return [...sequence, next];
}

export function checkTap(sequence: SimonColor[], playerIndex: number, color: SimonColor): boolean {
  return sequence[playerIndex] === color;
}

export function getPlaybackInterval(round: number): number {
  if (round <= 5) return 800;
  if (round <= 10) return 650;
  if (round <= 15) return 500;
  return 400;
}

export function calculateScore(roundsCompleted: number): number {
  const bonus = Math.max(0, roundsCompleted - 10) * 5;
  return roundsCompleted + bonus;
}
