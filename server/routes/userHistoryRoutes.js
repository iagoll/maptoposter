const express = require('express');
const router = express.Router();
const userHistoryController = require('../controllers/userHistoryController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * SECURITY ARCHITECTURE:
 * 
 * All routes require authentication via authMiddleware.
 * User ID is NEVER passed in URL parameters or request body.
 * User ID is extracted from the verified JWT token in authMiddleware.
 * 
 * This prevents users from accessing other users' data by:
 * 1. Requiring valid authentication token
 * 2. Using authenticated user's ID from token, not from request
 * 3. Validating ownership in service layer (user_id = authenticated_user_id)
 */

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/history/purchases
 * Get user's purchase history (only paid posters)
 * Query params: limit (default: 50)
 */
router.get('/purchases', userHistoryController.getPurchaseHistory);

/**
 * GET /api/history/previews
 * Get user's preview history (all previews)
 * Query params: limit (default: 50)
 */
router.get('/previews', userHistoryController.getPreviewHistory);

/**
 * GET /api/history/complete
 * Get user's complete history (all requests with payment status)
 * Query params: limit (default: 50)
 */
router.get('/complete', userHistoryController.getCompleteHistory);

/**
 * GET /api/history/stats
 * Get user statistics (total previews, purchases, amount spent)
 */
router.get('/stats', userHistoryController.getUserStats);

/**
 * GET /api/history/recent
 * Get recent purchases (for dashboard)
 * Query params: limit (default: 5)
 */
router.get('/recent', userHistoryController.getRecentPurchases);

/**
 * GET /api/history/favorite-themes
 * Get user's most used themes
 */
router.get('/favorite-themes', userHistoryController.getFavoriteThemes);

/**
 * GET /api/history/request/:requestId
 * Get specific request details
 * Params: requestId (number)
 */
router.get('/request/:requestId', userHistoryController.getRequestDetails);

/**
 * GET /api/history/download/:requestId
 * Get download URLs for a request
 * Params: requestId (number)
 */
router.get('/download/:requestId', userHistoryController.getDownloadUrls);

/**
 * GET /api/history/check/:requestId
 * Check if user has purchased a specific request
 * Params: requestId (number)
 */
router.get('/check/:requestId', userHistoryController.checkPurchaseStatus);

module.exports = router;
