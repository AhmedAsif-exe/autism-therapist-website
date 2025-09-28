const express = require('express');
const router = express.Router();
const GameScore = require('../Schema/GameScore');

// Simple auth guard leveraging passport session
function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ message: 'Not authenticated' });
}

// POST /scores - Save a new game score
router.post('/', ensureAuth, async (req, res) => {
  try {
    const { domainId, gameId, score, maxPossible } = req.body;
    
    // Validation
    if (!domainId || !gameId || score === undefined || score === null) {
      return res.status(400).json({ 
        success: false, 
        message: 'domainId, gameId, and score are required' 
      });
    }
    
    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Score must be a non-negative number' 
      });
    }

    // Create new score record
    const gameScore = new GameScore({
      userId: req.user._id,
      domainId: Number(domainId),
      gameId: Number(gameId),
      score: Number(score),
      maxPossible: maxPossible ? Number(maxPossible) : 20
    });

    await gameScore.save();
    
    console.log(`[SCORE] Saved score for user ${req.user.email}: Domain ${domainId}, Game ${gameId}, Score ${score}`);
    
    res.status(201).json({
      success: true,
      message: 'Score saved successfully',
      scoreId: gameScore._id
    });

  } catch (error) {
    console.error('Error saving game score:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /scores/:domainId/:gameId - Get scores for a specific game
router.get('/:domainId/:gameId', ensureAuth, async (req, res) => {
  try {
    const { domainId, gameId } = req.params;
    const { limit = 10 } = req.query;
    
    // Validation
    if (!domainId || !gameId) {
      return res.status(400).json({ 
        success: false, 
        message: 'domainId and gameId are required' 
      });
    }

    const scores = await GameScore.find({
      userId: req.user._id,
      domainId: Number(domainId),
      gameId: Number(gameId)
    })
    .sort({ playedAt: -1 })
    .limit(Number(limit))
    .select('score maxPossible playedAt')
    .lean();

    // Transform to match the frontend expected format (just scores array)
    const scoreValues = scores.reverse().map(s => s.score); // Reverse to get chronological order
    
    res.json({
      success: true,
      scores: scoreValues,
      history: scores.reverse(), // Full history with metadata (most recent first)
      count: scoreValues.length
    });

  } catch (error) {
    console.error('Error fetching game scores:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /scores/:domainId - Get scores for all games in a domain
router.get('/:domainId', ensureAuth, async (req, res) => {
  try {
    const { domainId } = req.params;
    const { limit = 10 } = req.query;
    
    if (!domainId) {
      return res.status(400).json({ 
        success: false, 
        message: 'domainId is required' 
      });
    }

    // Get scores for all games in the domain (games 1-10)
    const allScores = await GameScore.find({
      userId: req.user._id,
      domainId: Number(domainId)
    })
    .sort({ playedAt: -1 })
    .select('gameId score maxPossible playedAt')
    .lean();

    // Group by gameId and limit each game's scores
    const scoresByGame = {};
    for (let gameId = 1; gameId <= 10; gameId++) {
      scoresByGame[gameId] = [];
    }

    // Organize scores by game
    allScores.forEach(score => {
      if (scoresByGame[score.gameId] && scoresByGame[score.gameId].length < Number(limit)) {
        scoresByGame[score.gameId].unshift(score); // Add to beginning to maintain chronological order
      }
    });

    // Transform to match frontend format
    const summary = {};
    Object.keys(scoresByGame).forEach(gameId => {
      const scores = scoresByGame[gameId];
      const scoreValues = scores.map(s => s.score);
      summary[gameId] = {
        scores: scoreValues,
        history: scores.reverse(), // Most recent first for metadata
        count: scoreValues.length
      };
    });

    res.json({
      success: true,
      domainId: Number(domainId),
      games: summary
    });

  } catch (error) {
    console.error('Error fetching domain scores:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
