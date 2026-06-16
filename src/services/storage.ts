const PREFIX = 'xbrain:';

export type BestScore = {
  gameId: string;
  score: number;
  achievedAt: string;
};

export function getBestScore(gameId: string): number | null {
  try {
    const raw = localStorage.getItem(`${PREFIX}best:${gameId}`);
    if (!raw) return null;
    const parsed: BestScore = JSON.parse(raw);
    return parsed.score;
  } catch {
    return null;
  }
}

export function setBestScore(gameId: string, score: number): void {
  const current = getBestScore(gameId);
  if (current !== null && score <= current) return;
  const entry: BestScore = { gameId, score, achievedAt: new Date().toISOString() };
  try {
    localStorage.setItem(`${PREFIX}best:${gameId}`, JSON.stringify(entry));
  } catch {
    // localStorage may be unavailable (private browsing quota, etc.)
  }
}

export function clearBestScore(gameId: string): void {
  try {
    localStorage.removeItem(`${PREFIX}best:${gameId}`);
  } catch {
    // ignore
  }
}
