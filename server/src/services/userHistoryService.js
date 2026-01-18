const db = require('../database/db');

/**
 * User History Service
 * 
 * SECURITY: All methods receive userId from authenticated session (authMiddleware).
 * Database queries filter by user_id to ensure data isolation between users.
 * Users can ONLY access their own data, enforced at database query level.
 */
class UserHistoryService {
  /**
   * Get user's purchase history (paid posters)
   * @param {number} userId - User ID from authenticated session (NOT from request params)
   * @param {number} limit - Number of records to return
   * @returns {Array} Array of purchased posters
   */
  static getPurchaseHistory(userId, limit = 50) {
    const stmt = db.prepare(`
      SELECT 
        m.id as request_id,
        m.city,
        m.country,
        m.coords,
        m.theme,
        m.distance,
        m.orientation,
        m.title,
        m.title_pos,
        m.full_borders,
        m.preview_filename,
        m.highres_filename,
        m.created_at as generated_at,
        p.id as payment_id,
        p.amount,
        p.currency,
        p.paid_at,
        p.stripe_payment_intent_id
      FROM map_requests m
      INNER JOIN payments p ON m.id = p.map_request_id
      WHERE m.user_id = ? 
        AND p.status = 'completed'
      ORDER BY p.paid_at DESC
      LIMIT ?
    `);
    
    return stmt.all(userId, limit);
  }

  /**
   * Get user's preview history (all generated previews, paid or not)
   * @param {number} userId - User ID
   * @param {number} limit - Number of records to return
   * @returns {Array} Array of all map requests
   */
  static getPreviewHistory(userId, limit = 50) {
    const stmt = db.prepare(`
      SELECT 
        m.id as request_id,
        m.city,
        m.country,
        m.coords,
        m.theme,
        m.distance,
        m.orientation,
        m.title,
        m.title_pos,
        m.full_borders,
        m.preview_filename,
        m.highres_filename,
        m.created_at as generated_at,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM payments 
            WHERE map_request_id = m.id AND status = 'completed'
          ) THEN 1 
          ELSE 0 
        END as is_purchased
      FROM map_requests m
      WHERE m.user_id = ?
      ORDER BY m.created_at DESC
      LIMIT ?
    `);
    
    return stmt.all(userId, limit);
  }

  /**
   * Get user's complete history with payment status
   * @param {number} userId - User ID
   * @param {number} limit - Number of records to return
   * @returns {Array} Array of all map requests with payment info
   */
  static getCompleteHistory(userId, limit = 50) {
    const stmt = db.prepare(`
      SELECT 
        m.id as request_id,
        m.city,
        m.country,
        m.coords,
        m.theme,
        m.distance,
        m.orientation,
        m.title,
        m.title_pos,
        m.full_borders,
        m.preview_filename,
        m.highres_filename,
        m.created_at as generated_at,
        p.id as payment_id,
        p.amount,
        p.currency,
        p.status as payment_status,
        p.paid_at,
        p.stripe_payment_intent_id,
        CASE 
          WHEN p.status = 'completed' THEN 1 
          ELSE 0 
        END as is_purchased
      FROM map_requests m
      LEFT JOIN payments p ON m.id = p.map_request_id AND p.status = 'completed'
      WHERE m.user_id = ?
      ORDER BY m.created_at DESC
      LIMIT ?
    `);
    
    return stmt.all(userId, limit);
  }

  /**
   * Get user statistics
   * @param {number} userId - User ID
   * @returns {Object} User statistics
   */
  static getUserStats(userId) {
    const stmt = db.prepare(`
      SELECT 
        COUNT(DISTINCT m.id) as total_previews,
        COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN m.id END) as total_purchases,
        SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as total_spent,
        MIN(m.created_at) as first_preview_date,
        MAX(p.paid_at) as last_purchase_date
      FROM map_requests m
      LEFT JOIN payments p ON m.id = p.map_request_id
      WHERE m.user_id = ?
    `);
    
    const stats = stmt.get(userId);
    
    return {
      totalPreviews: stats.total_previews || 0,
      totalPurchases: stats.total_purchases || 0,
      totalSpent: stats.total_spent || 0,
      totalSpentFormatted: this.formatCurrency(stats.total_spent || 0, 'usd'),
      firstPreviewDate: stats.first_preview_date,
      lastPurchaseDate: stats.last_purchase_date,
      memberSince: stats.first_preview_date
    };
  }

  /**
   * Get a specific request details
   * @param {number} userId - User ID
   * @param {number} requestId - Map request ID
   * @returns {Object|null} Request details or null
   */
  static getRequestDetails(userId, requestId) {
    const stmt = db.prepare(`
      SELECT 
        m.id as request_id,
        m.city,
        m.country,
        m.coords,
        m.theme,
        m.distance,
        m.orientation,
        m.title,
        m.title_pos,
        m.full_borders,
        m.preview_filename,
        m.highres_filename,
        m.created_at as generated_at,
        m.request_hash,
        p.id as payment_id,
        p.amount,
        p.currency,
        p.status as payment_status,
        p.paid_at,
        p.stripe_payment_intent_id,
        p.stripe_session_id,
        e.email as delivery_email,
        e.status as email_status,
        e.sent_at as email_sent_at
      FROM map_requests m
      LEFT JOIN payments p ON m.id = p.map_request_id
      LEFT JOIN email_deliveries e ON m.id = e.map_request_id
      WHERE m.user_id = ? AND m.id = ?
    `);
    
    return stmt.get(userId, requestId);
  }

  /**
   * Get recently purchased posters (for homepage/dashboard)
   * @param {number} userId - User ID
   * @param {number} limit - Number of records
   * @returns {Array} Recent purchases
   */
  static getRecentPurchases(userId, limit = 5) {
    const stmt = db.prepare(`
      SELECT 
        m.id as request_id,
        m.city,
        m.country,
        m.theme,
        m.highres_filename,
        p.paid_at
      FROM map_requests m
      INNER JOIN payments p ON m.id = p.map_request_id
      WHERE m.user_id = ? AND p.status = 'completed'
      ORDER BY p.paid_at DESC
      LIMIT ?
    `);
    
    return stmt.all(userId, limit);
  }

  /**
   * Check if user has purchased a specific request
   * @param {number} userId - User ID
   * @param {number} requestId - Map request ID
   * @returns {boolean} True if purchased
   */
  static hasPurchased(userId, requestId) {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM payments p
      JOIN map_requests m ON p.map_request_id = m.id
      WHERE m.user_id = ? 
        AND m.id = ? 
        AND p.status = 'completed'
    `);
    
    const result = stmt.get(userId, requestId);
    return result.count > 0;
  }

  /**
   * Get themes used by user
   * @param {number} userId - User ID
   * @returns {Array} Array of themes with usage count
   */
  static getFavoriteThemes(userId) {
    const stmt = db.prepare(`
      SELECT 
        m.theme,
        COUNT(*) as usage_count,
        SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) as purchase_count
      FROM map_requests m
      LEFT JOIN payments p ON m.id = p.map_request_id
      WHERE m.user_id = ?
      GROUP BY m.theme
      ORDER BY usage_count DESC
      LIMIT 5
    `);
    
    return stmt.all(userId);
  }

  /**
   * Format currency
   * @param {number} cents - Amount in cents
   * @param {string} currency - Currency code
   * @returns {string} Formatted currency
   */
  static formatCurrency(cents, currency = 'usd') {
    const amount = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  }

  /**
   * Get download URLs for purchased posters
   * @param {number} userId - User ID
   * @param {number} requestId - Map request ID
   * @returns {Object|null} URLs for preview and high-res
   */
  static getDownloadUrls(userId, requestId) {
    const request = this.getRequestDetails(userId, requestId);
    
    if (!request) return null;

    return {
      requestId: request.request_id,
      preview: request.preview_filename ? `/cache/${request.preview_filename}` : null,
      highres: request.highres_filename ? `/posters/${request.highres_filename}` : null,
      isPurchased: request.payment_status === 'completed',
      canDownloadHighRes: request.payment_status === 'completed' && request.highres_filename
    };
  }
}

module.exports = UserHistoryService;
