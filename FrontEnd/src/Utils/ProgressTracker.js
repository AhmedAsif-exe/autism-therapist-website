// Lightweight progress tracking utilities
// Stores and reads session scores from localStorage for each game id (1..10)
// Keys follow the existing convention: `game{ID}_history` and contain an array of numbers.

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const DEFAULT_MAX_BY_GAME = {
  1: 20,
  2: 20,
  3: 20,
  4: 20,
  5: 20,
  6: 20,
  7: 20,
  8: 20,
  9: 20,
  10: 20,
};

export function storageKeyForGame(gameId) {
  return `game${gameId}_history`;
}

export function readHistory(gameId) {
  if (!isBrowser) return [];
  try {
    const raw = window.localStorage.getItem(storageKeyForGame(gameId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

export function getLastNSessions(gameId, n = 10) {
  const arr = readHistory(gameId);
  if (!arr.length) return [];
  return arr.slice(-n);
}

export function recordSession(gameId, score) {
  if (!isBrowser) return;
  const key = storageKeyForGame(gameId);
  const arr = readHistory(gameId);
  arr.push(typeof score === 'number' ? score : Number(score) || 0);
  try {
    window.localStorage.setItem(key, JSON.stringify(arr.slice(-20)));
  } catch {}
}

export function getMetrics(gameId, n = 10) {
  const last = getLastNSessions(gameId, n);
  const maxPossible = DEFAULT_MAX_BY_GAME[gameId] ?? 20;
  if (!last.length) {
    return {
      best: 0,
      average: 0,
      completionRate: 0,
      count: 0,
      maxPossible,
    };
  }
  const best = Math.max(...last);
  const average = last.reduce((a, b) => a + b, 0) / last.length;
  const completionRate = Math.round(((average / maxPossible) * 100));
  return {
    best,
    average,
    completionRate,
    count: last.length,
    maxPossible,
  };
}

export function getAllGamesSummary(gameIds = Array.from({ length: 10 }, (_, i) => i + 1), n = 10) {
  return gameIds.map((id) => ({ id, history: getLastNSessions(id, n), metrics: getMetrics(id, n) }));
}
