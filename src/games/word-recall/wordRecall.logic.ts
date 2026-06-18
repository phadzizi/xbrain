import type { RecallResult } from './wordRecall.types';

export const WORD_POOL: string[] = [
  // Animals
  'cat',
  'dog',
  'fish',
  'bird',
  'fox',
  'lion',
  'bear',
  'wolf',
  'duck',
  'frog',
  // Food
  'rice',
  'bread',
  'milk',
  'cake',
  'soup',
  'corn',
  'pear',
  'plum',
  'lime',
  'fig',
  // Colors
  'red',
  'blue',
  'green',
  'pink',
  'gold',
  'grey',
  'teal',
  'rust',
  'cyan',
  'jade',
  // Objects
  'book',
  'lamp',
  'door',
  'chair',
  'clock',
  'phone',
  'glass',
  'brush',
  'knife',
  'spoon',
  // Nature
  'tree',
  'rain',
  'snow',
  'wind',
  'fire',
  'rock',
  'sand',
  'leaf',
  'wave',
  'moon',
  // Actions
  'run',
  'jump',
  'read',
  'swim',
  'sing',
  'draw',
  'cook',
  'fly',
  'walk',
  'dance',
  // Places
  'barn',
  'road',
  'park',
  'lake',
  'hill',
  'cave',
  'farm',
  'yard',
  'port',
  'dune',
  // Body
  'hand',
  'foot',
  'head',
  'face',
  'neck',
  'back',
  'knee',
  'nose',
  'chin',
  'arm',
  // Sizes
  'big',
  'tall',
  'wide',
  'slim',
  'long',
  'high',
  'deep',
  'thin',
  'flat',
  'round',
  // Feelings
  'glad',
  'calm',
  'bold',
  'kind',
  'wild',
  'free',
  'wise',
  'warm',
  'cool',
  'dark',
];

function fisherYates<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function getWordCount(level: number): number {
  return Math.min(3 + level, 12);
}

export function getPreviewDuration(level: number): number {
  return Math.min(Math.max(getWordCount(level) * 1500, 3000), 10000);
}

export function drawWords(level: number, usedWords: string[] = [], rng = Math.random): string[] {
  const count = getWordCount(level);
  const usedSet = new Set(usedWords);
  const available = WORD_POOL.filter((w) => !usedSet.has(w));
  const pool = available.length >= count ? available : WORD_POOL;
  return fisherYates(pool, rng).slice(0, count);
}

export function normalizeWord(input: string): string {
  return input.trim().toLowerCase();
}

export function checkRecall(words: string[], input: string): boolean {
  const norm = normalizeWord(input);
  return norm.length > 0 && words.some((w) => w.toLowerCase() === norm);
}

export function getResults(words: string[], recalled: string[]): RecallResult[] {
  const recalledSet = new Set(recalled.map((r) => r.toLowerCase()));
  return words.map((word) => ({
    word,
    recalled: recalledSet.has(word.toLowerCase()),
  }));
}

export function calculateRoundScore(words: string[], recalled: string[]): number {
  const recalledSet = new Set(recalled.map((r) => r.toLowerCase()));
  return words.filter((w) => recalledSet.has(w.toLowerCase())).length;
}

export function isGameOver(roundScore: number): boolean {
  return roundScore === 0;
}
