const db = require('../database/db');

class User {
  /**
   * Find user by Firebase UID
   */
  static findByFirebaseUid(firebaseUid) {
    const stmt = db.prepare('SELECT * FROM users WHERE firebase_uid = ?');
    return stmt.get(firebaseUid);
  }

  /**
   * Create a new user
   */
  static create(data) {
    const { firebaseUid, email, displayName, photoUrl } = data;
    const stmt = db.prepare(`
      INSERT INTO users (firebase_uid, email, display_name, photo_url)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(firebaseUid, email, displayName, photoUrl);
    return this.findById(result.lastInsertRowid);
  }

  /**
   * Find user by ID
   */
  static findById(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  }

  /**
   * Update last login
   */
  static updateLastLogin(firebaseUid) {
    const stmt = db.prepare(`
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP 
      WHERE firebase_uid = ?
    `);
    stmt.run(firebaseUid);
  }

  /**
   * Find or create user
   */
  static findOrCreate(data) {
    let user = this.findByFirebaseUid(data.firebaseUid);
    if (!user) {
      user = this.create(data);
    } else {
      this.updateLastLogin(data.firebaseUid);
    }
    return user;
  }
}

module.exports = User;
