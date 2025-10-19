const express = require('express');
const router = express.Router();
const User = require('../Schema/User');

// Simple auth guard leveraging passport session
function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ message: 'Not authenticated' });
}

// Helper: determine if user owns Domain 1 bundle
function hasDomain1Bundle(user) {
  return Array.isArray(user.paidItems) && user.paidItems.some(item => item.id === 'domain1-bundle-levels-3-10');
}

// Helper: determine if user owns a specific game individually
function hasIndividualGame(user, gameId) {
  const gameItemId = `domain1-game-${gameId}`;
  return Array.isArray(user.paidItems) && user.paidItems.some(item => item.id === gameItemId);
}

// Helper: check if user has access to a specific game (either through bundle or individual purchase)
function hasGameAccess(user, gameId) {
  return hasDomain1Bundle(user) || hasIndividualGame(user, gameId);
}

// GET /games/access/:domainId/:gameId  -> { allowed: boolean }
router.get('/access/:domainId/:gameId', ensureAuth, async (req, res) => {
  const domainId = Number(req.params.domainId);
  const gameId = Number(req.params.gameId);
  if (domainId !== 1) {
    // Future domains: default deny until implemented
    return res.json({ allowed: false });
  }
  if (gameId <= 2) return res.json({ allowed: true });
  
  // Fetch fresh user data from database to avoid session cache issues
  try {
    const freshUser = await User.findById(req.user._id);
    const hasAccess = hasGameAccess(freshUser, gameId);
    return res.json({ allowed: hasAccess });
  } catch (error) {
    console.error('Error fetching fresh user data:', error);
    // Fallback to session data
    return res.json({ allowed: hasGameAccess(req.user, gameId) });
  }
});

// Bulk access map for a domain
router.get('/access-map/:domainId', ensureAuth, async (req, res) => {
  const domainId = Number(req.params.domainId);
  if (domainId !== 1) return res.json({ domainId, allowed: [] });
  
  try {
    // Fetch fresh user data from database to avoid session cache issues
    const freshUser = await User.findById(req.user._id);
    const allowed = [];
    for (let i = 1; i <= 10; i++) {
      if (i <= 2 || hasGameAccess(freshUser, i)) allowed.push(i);
    }
    res.json({ domainId, allowed });
  } catch (error) {
    console.error('Error fetching fresh user data for access map:', error);
    // Fallback to session data
    const allowed = [];
    for (let i = 1; i <= 10; i++) {
      if (i <= 2 || hasGameAccess(req.user, i)) allowed.push(i);
    }
    res.json({ domainId, allowed });
  }
});

// Helper function to add domain1 bundle to a user by email
async function addDomain1BundleToUser(email) {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }
    
    const bundleItem = 'domain1-bundle-levels-3-10';
    
    // Check if already has the bundle
    if (user.paidItems.some(item => item.id === bundleItem)) {
      return {
        success: true,
        message: 'User already owns the Domain 1 bundle',
        paidItems: user.paidItems
      };
    }
    
    // Add the bundle
    user.paidItems.push({ id: bundleItem, purchasedAt: new Date() });
    await user.save();
    
    return {
      success: true,
      message: 'Domain 1 bundle added successfully!',
      paidItems: user.paidItems
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// Helper function to add individual game to a user by email
async function addIndividualGameToUser(email, gameId) {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }
    
    if (gameId < 3 || gameId > 10) {
      throw new Error('Game ID must be between 3 and 10');
    }
    
    const gameItem = `domain1-game-${gameId}`;
    
    // Check if already has this game
    if (user.paidItems.some(item => item.id === gameItem)) {
      return {
        success: true,
        message: `User already owns Game ${gameId}`,
        paidItems: user.paidItems
      };
    }
    
    // Add the game
    user.paidItems.push({ id: gameItem, purchasedAt: new Date() });
    await user.save();
    
    return {
      success: true,
      message: `Game ${gameId} added successfully!`,
      paidItems: user.paidItems
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// ADMIN ROUTE: Add domain1 bundle to user by email (requires admin secret key)
router.post('/admin/add-bundle', async (req, res) => {
  try {
    const { email, adminKey } = req.body;
    
    // Security checks
    if (!email || !adminKey) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and adminKey are required' 
      });
    }
    
    // Verify admin key matches environment variable
    const correctAdminKey = process.env.ADMIN_SECRET_KEY;
    if (!correctAdminKey) {
      return res.status(500).json({ 
        success: false, 
        message: 'Admin functionality not configured' 
      });
    }
    
    if (adminKey !== correctAdminKey) {
      // Log suspicious activity
      console.warn(`[SECURITY] Invalid admin key attempt from IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid admin key' 
      });
    }
    
    // Rate limiting check (simple in-memory approach)
    const clientIp = req.ip;
    const now = Date.now();
    if (!router.adminAttempts) router.adminAttempts = new Map();
    
    const attempts = router.adminAttempts.get(clientIp) || [];
    const recentAttempts = attempts.filter(time => now - time < 3600000); // 1 hour
    
    if (recentAttempts.length >= 5) {
      console.warn(`[SECURITY] Rate limit exceeded for admin endpoint from IP: ${clientIp}`);
      return res.status(429).json({ 
        success: false, 
        message: 'Too many requests, try again later' 
      });
    }
    
    // Record this attempt
    recentAttempts.push(now);
    router.adminAttempts.set(clientIp, recentAttempts);
    
    // Execute the bundle addition
    const result = await addDomain1BundleToUser(email);
    
    // Log successful admin action
    if (result.success) {
      console.log(`[ADMIN] Domain 1 bundle added to user: ${email} from IP: ${clientIp}`);
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Error in admin add-bundle:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ADMIN ROUTE: Add individual game to user by email (requires admin secret key)
router.post('/admin/add-game', async (req, res) => {
  try {
    const { email, gameId, adminKey } = req.body;
    
    // Security checks
    if (!email || !gameId || !adminKey) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, gameId, and adminKey are required' 
      });
    }
    
    // Verify admin key matches environment variable
    const correctAdminKey = process.env.ADMIN_SECRET_KEY;
    if (!correctAdminKey) {
      return res.status(500).json({ 
        success: false, 
        message: 'Admin functionality not configured' 
      });
    }
    
    if (adminKey !== correctAdminKey) {
      // Log suspicious activity
      console.warn(`[SECURITY] Invalid admin key attempt from IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid admin key' 
      });
    }
    
    // Rate limiting check (simple in-memory approach)
    const clientIp = req.ip;
    const now = Date.now();
    if (!router.adminAttempts) router.adminAttempts = new Map();
    
    const attempts = router.adminAttempts.get(clientIp) || [];
    const recentAttempts = attempts.filter(time => now - time < 3600000); // 1 hour
    
    if (recentAttempts.length >= 5) {
      console.warn(`[SECURITY] Rate limit exceeded for admin endpoint from IP: ${clientIp}`);
      return res.status(429).json({ 
        success: false, 
        message: 'Too many requests, try again later' 
      });
    }
    
    // Record this attempt
    recentAttempts.push(now);
    router.adminAttempts.set(clientIp, recentAttempts);
    
    // Execute the game addition
    const result = await addIndividualGameToUser(email, Number(gameId));
    
    // Log successful admin action
    if (result.success) {
      console.log(`[ADMIN] Game ${gameId} added to user: ${email} from IP: ${clientIp}`);
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Error in admin add-game:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

module.exports = router;
module.exports.addDomain1BundleToUser = addDomain1BundleToUser;
module.exports.addIndividualGameToUser = addIndividualGameToUser;
