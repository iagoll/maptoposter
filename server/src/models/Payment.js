const db = require('../database/db');

class Payment {
  /**
   * Create a new payment record
   */
  static create(data) {
    const { userId, mapRequestId, stripeSessionId, amount, currency } = data;
    const stmt = db.prepare(`
      INSERT INTO payments (user_id, map_request_id, stripe_session_id, amount, currency)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(userId, mapRequestId, stripeSessionId, amount, currency || 'usd');
    return this.findById(result.lastInsertRowid);
  }

  /**
   * Find by ID
   */
  static findById(id) {
    const stmt = db.prepare('SELECT * FROM payments WHERE id = ?');
    return stmt.get(id);
  }

  /**
   * Find by Stripe session ID
   */
  static findBySessionId(sessionId) {
    const stmt = db.prepare('SELECT * FROM payments WHERE stripe_session_id = ?');
    return stmt.get(sessionId);
  }

  /**
   * Update payment status
   */
  static updateStatus(sessionId, status, paymentIntentId = null) {
    const stmt = db.prepare(`
      UPDATE payments 
      SET status = ?, 
          stripe_payment_intent_id = ?,
          paid_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE paid_at END
      WHERE stripe_session_id = ?
    `);
    stmt.run(status, paymentIntentId, status, sessionId);
    return this.findBySessionId(sessionId);
  }

  /**
   * Check if payment is completed
   */
  static isCompleted(userId, mapRequestId) {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM payments
      WHERE user_id = ? AND map_request_id = ? AND status = 'completed'
    `);
    const result = stmt.get(userId, mapRequestId);
    return result.count > 0;
  }

  /**
   * Get user's payments
   */
  static findByUserId(userId, limit = 10) {
    const stmt = db.prepare(`
      SELECT p.*, m.city, m.country, m.theme
      FROM payments p
      JOIN map_requests m ON p.map_request_id = m.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
      LIMIT ?
    `);
    return stmt.all(userId, limit);
  }
}

module.exports = Payment;
