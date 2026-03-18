const { pool } = require('../database/db');

/**
 * User History Service
 *
 * SECURITY: All methods receive userId from the authenticated session
 * (set by authMiddleware). Database queries always filter by user_id so
 * users can only access their own data.
 */
class UserHistoryService {
  static async getPurchaseHistory(userId, limit = 50) {
    const { rows } = await pool.query(
      `SELECT
         m.map_request_id  AS request_id,
         m.city, m.country, m.coords, m.theme, m.distance, m.orientation,
         m.title, m.title_pos, m.full_borders,
         m.preview_filename, m.highres_filename,
         m.ts_created      AS generated_at,
         p.payment_id,
         p.amount, p.currency, p.ts_paid,
         p.stripe_payment_intent_id
       FROM t_map_request m
       INNER JOIN t_payment p ON m.map_request_id = p.map_request_id
       WHERE m.user_id = $1 AND p.status = 'completed'
       ORDER BY p.ts_paid DESC
       LIMIT $2`,
      [userId, limit]
    );
    return rows;
  }

  static async getPreviewHistory(userId, limit = 50) {
    const { rows } = await pool.query(
      `SELECT
         m.map_request_id  AS request_id,
         m.city, m.country, m.coords, m.theme, m.distance, m.orientation,
         m.title, m.title_pos, m.full_borders,
         m.preview_filename, m.highres_filename,
         m.ts_created      AS generated_at,
         EXISTS (
           SELECT 1 FROM t_payment
           WHERE map_request_id = m.map_request_id AND status = 'completed'
         ) AS is_purchased
       FROM t_map_request m
       WHERE m.user_id = $1
       ORDER BY m.ts_created DESC
       LIMIT $2`,
      [userId, limit]
    );
    return rows;
  }

  static async getCompleteHistory(userId, limit = 50) {
    const { rows } = await pool.query(
      `SELECT
         m.map_request_id  AS request_id,
         m.city, m.country, m.coords, m.theme, m.distance, m.orientation,
         m.title, m.title_pos, m.full_borders,
         m.preview_filename, m.highres_filename,
         m.ts_created      AS generated_at,
         p.payment_id,
         p.amount, p.currency,
         p.status          AS payment_status,
         p.ts_paid,
         p.stripe_payment_intent_id,
         (p.status = 'completed') AS is_purchased
       FROM t_map_request m
       LEFT JOIN t_payment p
         ON m.map_request_id = p.map_request_id AND p.status = 'completed'
       WHERE m.user_id = $1
       ORDER BY m.ts_created DESC
       LIMIT $2`,
      [userId, limit]
    );
    return rows;
  }

  static async getUserStats(userId) {
    const { rows } = await pool.query(
      `SELECT
         COUNT(DISTINCT m.map_request_id)                                          AS total_previews,
         COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN m.map_request_id END) AS total_purchases,
         COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount END), 0)      AS total_spent,
         MIN(m.ts_created)                                                          AS first_preview_date,
         MAX(p.ts_paid)                                                             AS last_purchase_date
       FROM t_map_request m
       LEFT JOIN t_payment p ON m.map_request_id = p.map_request_id
       WHERE m.user_id = $1`,
      [userId]
    );
    const s = rows[0];
    return {
      totalPreviews:       parseInt(s.total_previews,  10) || 0,
      totalPurchases:      parseInt(s.total_purchases, 10) || 0,
      totalSpent:          parseInt(s.total_spent,     10) || 0,
      totalSpentFormatted: this.formatCurrency(parseInt(s.total_spent, 10) || 0, 'usd'),
      firstPreviewDate:    s.first_preview_date,
      lastPurchaseDate:    s.last_purchase_date,
      memberSince:         s.first_preview_date,
    };
  }

  static async getRequestDetails(userId, requestId) {
    const { rows } = await pool.query(
      `SELECT
         m.map_request_id  AS request_id,
         m.city, m.country, m.coords, m.theme, m.distance, m.orientation,
         m.title, m.title_pos, m.full_borders,
         m.preview_filename, m.highres_filename,
         m.ts_created      AS generated_at,
         m.request_hash,
         p.payment_id,
         p.amount, p.currency,
         p.status          AS payment_status,
         p.ts_paid,
         p.stripe_payment_intent_id,
         p.stripe_session_id,
         e.email           AS delivery_email,
         e.status          AS email_status,
         e.ts_sent         AS email_sent_at
       FROM t_map_request m
       LEFT JOIN t_payment        p ON m.map_request_id = p.map_request_id
       LEFT JOIN t_email_delivery e ON m.map_request_id = e.map_request_id
       WHERE m.user_id = $1 AND m.map_request_id = $2`,
      [userId, requestId]
    );
    return rows[0] || null;
  }

  static async getRecentPurchases(userId, limit = 5) {
    const { rows } = await pool.query(
      `SELECT
         m.map_request_id AS request_id,
         m.city, m.country, m.theme, m.highres_filename,
         p.ts_paid
       FROM t_map_request m
       INNER JOIN t_payment p ON m.map_request_id = p.map_request_id
       WHERE m.user_id = $1 AND p.status = 'completed'
       ORDER BY p.ts_paid DESC
       LIMIT $2`,
      [userId, limit]
    );
    return rows;
  }

  static async hasPurchased(userId, requestId) {
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS count
       FROM t_payment p
       JOIN t_map_request m ON p.map_request_id = m.map_request_id
       WHERE m.user_id = $1 AND m.map_request_id = $2 AND p.status = 'completed'`,
      [userId, requestId]
    );
    return parseInt(rows[0].count, 10) > 0;
  }

  static async getFavoriteThemes(userId) {
    const { rows } = await pool.query(
      `SELECT
         m.theme,
         COUNT(*)                                             AS usage_count,
         COUNT(CASE WHEN p.status = 'completed' THEN 1 END)  AS purchase_count
       FROM t_map_request m
       LEFT JOIN t_payment p ON m.map_request_id = p.map_request_id
       WHERE m.user_id = $1
       GROUP BY m.theme
       ORDER BY usage_count DESC
       LIMIT 5`,
      [userId]
    );
    return rows;
  }

  static async getDownloadUrls(userId, requestId) {
    const request = await this.getRequestDetails(userId, requestId);
    if (!request) return null;
    return {
      requestId:          request.request_id,
      preview:            request.preview_filename ? `/cache/${request.preview_filename}`   : null,
      highres:            request.highres_filename  ? `/posters/${request.highres_filename}` : null,
      isPurchased:        request.payment_status === 'completed',
      canDownloadHighRes: request.payment_status === 'completed' && !!request.highres_filename,
    };
  }

  static formatCurrency(cents, currency = 'usd') {
    return new Intl.NumberFormat('en-US', {
      style:    'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  }
}

module.exports = UserHistoryService;
