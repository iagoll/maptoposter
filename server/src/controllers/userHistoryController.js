const UserHistoryService = require('../services/userHistoryService');

const getPurchaseHistory = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const limit  = parseInt(req.query.limit) || 50;
    const history = await UserHistoryService.getPurchaseHistory(userId, limit);
    res.json({ success: true, count: history.length, data: history });
  } catch (error) {
    console.error('Error getting purchase history:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

const getPreviewHistory = async (req, res) => {
  try {
    const userId  = req.user.user_id;
    const limit   = parseInt(req.query.limit) || 50;
    const history = await UserHistoryService.getPreviewHistory(userId, limit);
    res.json({ success: true, count: history.length, data: history });
  } catch (error) {
    console.error('Error getting preview history:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

const getCompleteHistory = async (req, res) => {
  try {
    const userId  = req.user.user_id;
    const limit   = parseInt(req.query.limit) || 50;
    const history = await UserHistoryService.getCompleteHistory(userId, limit);
    res.json({ success: true, count: history.length, data: history });
  } catch (error) {
    console.error('Error getting complete history:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

const getUserStats = async (req, res) => {
  try {
    const stats = await UserHistoryService.getUserStats(req.user.user_id);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

const getRequestDetails = async (req, res) => {
  try {
    const userId    = req.user.user_id;
    const requestId = parseInt(req.params.requestId);
    const details   = await UserHistoryService.getRequestDetails(userId, requestId);
    if (!details) {
      return res.status(404).json({ error: 'Not found', message: 'Request not found or does not belong to you' });
    }
    res.json({ success: true, data: details });
  } catch (error) {
    console.error('Error getting request details:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

const getRecentPurchases = async (req, res) => {
  try {
    const userId    = req.user.user_id;
    const limit     = parseInt(req.query.limit) || 5;
    const purchases = await UserHistoryService.getRecentPurchases(userId, limit);
    res.json({ success: true, count: purchases.length, data: purchases });
  } catch (error) {
    console.error('Error getting recent purchases:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

const getFavoriteThemes = async (req, res) => {
  try {
    const themes = await UserHistoryService.getFavoriteThemes(req.user.user_id);
    res.json({ success: true, count: themes.length, data: themes });
  } catch (error) {
    console.error('Error getting favorite themes:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

const getDownloadUrls = async (req, res) => {
  try {
    const userId    = req.user.user_id;
    const requestId = parseInt(req.params.requestId);
    const urls      = await UserHistoryService.getDownloadUrls(userId, requestId);
    if (!urls) {
      return res.status(404).json({ error: 'Not found', message: 'Request not found or does not belong to you' });
    }
    res.json({ success: true, data: urls });
  } catch (error) {
    console.error('Error getting download URLs:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

const checkPurchaseStatus = async (req, res) => {
  try {
    const userId      = req.user.user_id;
    const requestId   = parseInt(req.params.requestId);
    const hasPurchased = await UserHistoryService.hasPurchased(userId, requestId);
    res.json({ success: true, data: { requestId, isPurchased: hasPurchased } });
  } catch (error) {
    console.error('Error checking purchase status:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
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
  checkPurchaseStatus,
};
