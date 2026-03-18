const { pool } = require('../database/db');

class User {
  static async findByFirebaseUid(firebaseUid) {
    const { rows } = await pool.query(
      'SELECT * FROM t_user WHERE firebase_uid = $1',
      [firebaseUid]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM t_user WHERE user_id = $1',
      [id]
    );
    return rows[0] || null;
  }

  static async create(data) {
    const { firebaseUid, email, displayName, photoUrl } = data;
    const { rows } = await pool.query(
      `INSERT INTO t_user (firebase_uid, email, display_name, photo_url)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id`,
      [firebaseUid, email, displayName || null, photoUrl || null]
    );
    return this.findById(rows[0].user_id);
  }

  static async updateLastLogin(firebaseUid) {
    await pool.query(
      `UPDATE t_user SET ts_last_login = (NOW() AT TIME ZONE 'UTC') WHERE firebase_uid = $1`,
      [firebaseUid]
    );
  }

  static async findOrCreate(data) {
    let user = await this.findByFirebaseUid(data.firebaseUid);
    if (!user) {
      user = await this.create(data);
    } else {
      await this.updateLastLogin(data.firebaseUid);
    }
    return user;
  }
}

module.exports = User;
