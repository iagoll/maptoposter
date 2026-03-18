const { pool } = require('../database/db');

class Payment {
  static async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM t_payment WHERE payment_id = $1',
      [id]
    );
    return rows[0] || null;
  }

  static async findBySessionId(sessionId) {
    const { rows } = await pool.query(
      'SELECT * FROM t_payment WHERE stripe_session_id = $1',
      [sessionId]
    );
    return rows[0] || null;
  }

  static async create(data) {
    const { userId, mapRequestId, stripeSessionId, amount, currency } = data;
    const { rows } = await pool.query(
      `INSERT INTO t_payment (user_id, map_request_id, stripe_session_id, amount, currency)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING payment_id`,
      [userId, mapRequestId, stripeSessionId, amount, currency || 'usd']
    );
    return this.findById(rows[0].payment_id);
  }

  static async updateStatus(sessionId, status, paymentIntentId = null) {
    await pool.query(
      `UPDATE t_payment
       SET status                   = $1,
           stripe_payment_intent_id = $2,
           ts_paid = CASE WHEN $1 = 'completed' THEN (NOW() AT TIME ZONE 'UTC') ELSE ts_paid END
       WHERE stripe_session_id = $3`,
      [status, paymentIntentId, sessionId]
    );
    return this.findBySessionId(sessionId);
  }

  static async isCompleted(userId, mapRequestId) {
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS count
       FROM t_payment
       WHERE user_id = $1 AND map_request_id = $2 AND status = 'completed'`,
      [userId, mapRequestId]
    );
    return parseInt(rows[0].count, 10) > 0;
  }

  static async findByUserId(userId, limit = 10) {
    const { rows } = await pool.query(
      `SELECT p.*, m.city, m.country, m.theme
       FROM t_payment p
       JOIN t_map_request m ON p.map_request_id = m.map_request_id
       WHERE p.user_id = $1
       ORDER BY p.ts_created DESC
       LIMIT $2`,
      [userId, limit]
    );
    return rows;
  }
}

module.exports = Payment;
