const UserHistoryService = require('../services/userHistoryService');

/**
 * Get user's purchase history (only paid posters)
 * 
 * SECURITY: User ID is extracted from req.user (set by authMiddleware)
 * NOT from URL params or request body to prevent unauthorized access
 */
const getPurchaseHistory = (req, res) => {
  try {
    // SECURITY: Always use authenticated user's ID from middleware
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;

    const history = UserHistoryService.getPurchaseHistory(userId, limit);

    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Error getting purchase history:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Get user's preview history (all previews, paid or not)
 * 
 * SECURITY: User ID from authenticated session only
 */
const getPreviewHistory = (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const limit = parseInt(req.query.limit) || 50;

    const history = UserHistoryService.getPreviewHistory(userId, limit);

    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Error getting preview history:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Get user's complete history with payment status
 * 
 * SECURITY: User ID from authenticated session only
 */
const getCompleteHistory = (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const limit = parseInt(req.query.limit) || 50;

    const history = UserHistoryService.getCompleteHistory(userId, limit);

    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Error getting complete history:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Get user statistics
 */
const getUserStats = (req, res) => {
  try {
    const userId = req.user.id;

    const stats = UserHistoryService.getUserStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Get specific request details
 * 
 * SECURITY: Verifies request belongs to authenticated user
 * User cannot access other users' requests by changing requestId
 */
const getRequestDetails = (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const requestId = parseInt(req.params.requestId); // Only request ID in URL

    const details = UserHistoryService.getRequestDetails(userId, requestId);

    if (!details) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Request not found or does not belong to you'
      });
    }

    res.json({
      success: true,
      data: details
    });
  } catch (error) {
    console.error('Error getting request details:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Get recent purchases (for dashboard)
 */
const getRecentPurchases = (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 5;

    const purchases = UserHistoryService.getRecentPurchases(userId, limit);

    res.json({
      success: true,
      count: purchases.length,
      data: purchases
    });
  } catch (error) {
    console.error('Error getting recent purchases:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Get favorite themes
 */
const getFavoriteThemes = (req, res) => {
  try {
    const userId = req.user.id;

    const themes = UserHistoryService.getFavoriteThemes(userId);

    res.json({
      success: true,
      count: themes.length,
      data: themes
    });
  } catch (error) {
    console.error('Error getting favorite themes:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Get download URLs for a request
 */
const getDownloadUrls = (req, res) => {
  try {
    const userId = req.user.id;
    const requestId = parseInt(req.params.requestId);

    const urls = UserHistoryService.getDownloadUrls(userId, requestId);

    if (!urls) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Request not found or does not belong to you'
      });
    }

    res.json({
      success: true,
      data: urls
    });
  } catch (error) {
    console.error('Error getting download URLs:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Check if user has purchased a specific request
 */
const checkPurchaseStatus = (req, res) => {
  try {
    const userId = req.user.id;
    const requestId = parseInt(req.params.requestId);

    const hasPurchased = UserHistoryService.hasPurchased(userId, requestId);

    res.json({
      success: true,
      data: {
        requestId,
        isPurchased: hasPurchased
      }
    });
  } catch (error) {
    console.error('Error checking purchase status:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

module.exports = {
  getPurchaseHistory,
  getPreviewHistory,
  getCompleteHistory,
  getUserStats,
  getRequestDetails,
  getRecentPurchases,
  getFavoriteThemes,
  getDownloadUrls,
  checkPurchaseStatus
};
