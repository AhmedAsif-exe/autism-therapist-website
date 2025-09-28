// MongoDB-based progress tracking utilities
// Stores and reads session scores from the database for each game id (1..10)
import { saveGameScore, getGameHistory, getDomainScores } from './Queries/Scores';

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

// Legacy localStorage functions for backward compatibility during migration
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

// Main API functions - these now use MongoDB
export async function getLastNSessions(gameId, n = 10) {
  try {
    const scores = await getGameHistory(1, gameId, n); // Domain 1 for now
    return scores.length > 0 ? scores : [];
  } catch (error) {
    console.error('Error fetching sessions from database, falling back to localStorage:', error);
    // Fallback to localStorage if API fails
    const arr = readHistory(gameId);
    return arr.length > 0 ? arr.slice(-n) : [];
  }
}

export async function recordSession(gameId, score) {
  try {
    await saveGameScore(1, gameId, score); // Domain 1 for now
    console.log(`Score recorded for Game ${gameId}: ${score}`);
  } catch (error) {
    console.error('Error saving score to database, falling back to localStorage:', error);
    // Fallback to localStorage if API fails
    if (!isBrowser) return;
    const key = storageKeyForGame(gameId);
    const arr = readHistory(gameId);
    arr.push(typeof score === 'number' ? score : Number(score) || 0);
    try {
      window.localStorage.setItem(key, JSON.stringify(arr.slice(-20)));
    } catch {}
  }
}

export async function getMetrics(gameId, n = 10) {
  const last = await getLastNSessions(gameId, n);
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

export async function getAllGamesSummary(gameIds = Array.from({ length: 10 }, (_, i) => i + 1), n = 10) {
  try {
    // Try to get all scores for domain 1 in a single API call
    const domainScores = await getDomainScores(1, n);
    
    return gameIds.map((id) => {
      const gameData = domainScores.games[id] || { scores: [], count: 0 };
      const history = gameData.scores || [];
      return { 
        id, 
        history, 
        metrics: calculateMetricsSync(history, id)
      };
    });
  } catch (error) {
    console.error('Error fetching all games summary, using individual calls:', error);
    // Fallback to individual calls
    const promises = gameIds.map(async (id) => ({
      id,
      history: await getLastNSessions(id, n),
      metrics: await getMetrics(id, n)
    }));
    return Promise.all(promises);
  }
}

// Synchronous helper for calculating metrics from existing data
function calculateMetricsSync(history, gameId) {
  const maxPossible = DEFAULT_MAX_BY_GAME[gameId] ?? 20;
  if (!history.length) {
    return {
      best: 0,
      average: 0,
      completionRate: 0,
      count: 0,
      maxPossible,
    };
  }
  const best = Math.max(...history);
  const average = history.reduce((a, b) => a + b, 0) / history.length;
  const completionRate = Math.round(((average / maxPossible) * 100));
  return {
    best,
    average,
    completionRate,
    count: history.length,
    maxPossible,
  };
}
