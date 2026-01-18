const db = require('../database/db');
const crypto = require('crypto');

class MapRequest {
  /**
   * Generate hash for map request configuration
   */
  static generateHash(config) {
    const { city, country, coords, theme, distance, orientation, title, titlePos, fullBorders } = config;
    const hashString = JSON.stringify({
      city: city || '',
      country,
      coords: coords || '',
      theme,
      distance,
      orientation,
      title: title || '',
      titlePos: titlePos || 'bottom-center',
      fullBorders: fullBorders || false
    });
    return crypto.createHash('sha256').update(hashString).digest('hex');
  }

  /**
   * Find by hash
   */
  static findByHash(hash) {
    const stmt = db.prepare('SELECT * FROM map_requests WHERE request_hash = ?');
    return stmt.get(hash);
  }

  /**
   * Create a new map request
   */
  static create(userId, config, previewFilename = null) {
    const hash = this.generateHash(config);
    const { city, country, coords, theme, distance, orientation, title, titlePos, fullBorders } = config;
    
    const stmt = db.prepare(`
      INSERT INTO map_requests (
        user_id, city, country, coords, theme, distance, orientation,
        title, title_pos, full_borders, request_hash, preview_filename
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      userId,
      city || null,
      country,
      coords || null,
      theme,
      distance,
      orientation,
      title || null,
      titlePos || 'bottom-center',
      fullBorders ? 1 : 0,
      hash,
      previewFilename
    );
    
    return this.findById(result.lastInsertRowid);
  }

  /**
   * Find by ID
   */
  static findById(id) {
    const stmt = db.prepare('SELECT * FROM map_requests WHERE id = ?');
    return stmt.get(id);
  }

  /**
   * Update high-res filename
   */
  static updateHighResFilename(id, filename) {
    const stmt = db.prepare(`
      UPDATE map_requests 
      SET highres_filename = ? 
      WHERE id = ?
    `);
    stmt.run(filename, id);
  }

  /**
   * Get user's map requests
   */
  static findByUserId(userId, limit = 10) {
    const stmt = db.prepare(`
      SELECT * FROM map_requests 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    return stmt.all(userId, limit);
  }

  /**
   * Check if user has paid for this request
   */
  static hasPaidFor(userId, requestId) {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM payments
      WHERE user_id = ? AND map_request_id = ? AND status = 'completed'
    `);
    const result = stmt.get(userId, requestId);
    return result.count > 0;
  }
}

module.exports = MapRequest;
