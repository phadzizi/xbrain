export function generateSequence(length: number, rng = Math.random): number[] {
  return Array.from({ length }, () => Math.floor(rng() * 9) + 1);
}

export function checkAnswer(sequence: number[], input: string): boolean {
  return input.replace(/\s/g, '') === sequence.join('');
}

export function getPreviewDuration(length: number): number {
  return Math.min(5000, Math.max(2000, length * 1000));
}

export function calculateScore(roundsCompleted: number): number {
  return roundsCompleted + Math.max(0, roundsCompleted - 8) * 3;
}
