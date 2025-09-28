import api from "../../axiosInstance";

// Save a game score to the database
export async function saveGameScore(domainId, gameId, score, maxPossible = 20) {
  try {
    const response = await api.post("/scores", {
      domainId,
      gameId,
      score,
      maxPossible
    });
    return response.data;
  } catch (error) {
    console.error("Error saving game score:", error.response?.data || error.message);
    throw error;
  }
}

// Get scores for a specific game (returns last N scores)
export async function getGameScores(domainId, gameId, limit = 10) {
  try {
    const response = await api.get(`/scores/${domainId}/${gameId}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching game scores:", error.response?.data || error.message);
    throw error;
  }
}

// Get scores for all games in a domain
export async function getDomainScores(domainId, limit = 10) {
  try {
    const response = await api.get(`/scores/${domainId}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching domain scores:", error.response?.data || error.message);
    throw error;
  }
}

// Helper to get scores in the format expected by existing code (just the score values array)
export async function getGameHistory(domainId, gameId, limit = 10) {
  try {
    const result = await getGameScores(domainId, gameId, limit);
    return result.scores || [];
  } catch (error) {
    console.error("Error fetching game history:", error);
    return []; // Return empty array on error to maintain compatibility
  }
}

// Helper to get last N scores for a specific game
export async function getLastNSessions(domainId, gameId, n = 10) {
  return getGameHistory(domainId, gameId, n);
}
