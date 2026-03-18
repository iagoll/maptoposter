const { pool } = require('../database/db');
const crypto = require('crypto');

class MapRequest {
  static generateHash(config) {
    const { city, country, coords, theme, distance, orientation, title, titlePos, fullBorders } = config;
    const hashString = JSON.stringify({
      city:        city || '',
      country,
      coords:      coords || '',
      theme,
      distance,
      orientation,
      title:       title || '',
      titlePos:    titlePos || 'bottom-center',
      fullBorders: fullBorders || false,
    });
    return crypto.createHash('sha256').update(hashString).digest('hex');
  }

  static async findByHash(hash) {
    const { rows } = await pool.query(
      'SELECT * FROM t_map_request WHERE request_hash = $1',
      [hash]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM t_map_request WHERE map_request_id = $1',
      [id]
    );
    return rows[0] || null;
  }

  static async create(userId, config, previewFilename = null) {
    const hash = this.generateHash(config);
    const { city, country, coords, theme, distance, orientation, title, titlePos, fullBorders } = config;

    const { rows } = await pool.query(
      `INSERT INTO t_map_request
         (user_id, city, country, coords, theme, distance, orientation,
          title, title_pos, full_borders, request_hash, preview_filename)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING map_request_id`,
      [
        userId,
        city        || null,
        country,
        coords      || null,
        theme,
        distance,
        orientation,
        title       || null,
        titlePos    || 'bottom-center',
        fullBorders ? true : false,
        hash,
        previewFilename,
      ]
    );
    return this.findById(rows[0].map_request_id);
  }

  static async updateHighResFilename(id, filename) {
    await pool.query(
      'UPDATE t_map_request SET highres_filename = $1 WHERE map_request_id = $2',
      [filename, id]
    );
  }

  static async findByUserId(userId, limit = 10) {
    const { rows } = await pool.query(
      `SELECT * FROM t_map_request
       WHERE user_id = $1
       ORDER BY ts_created DESC
       LIMIT $2`,
      [userId, limit]
    );
    return rows;
  }

  static async hasPaidFor(userId, requestId) {
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS count
       FROM t_payment
       WHERE user_id = $1 AND map_request_id = $2 AND status = 'completed'`,
      [userId, requestId]
    );
    return parseInt(rows[0].count, 10) > 0;
  }
}

module.exports = MapRequest;
