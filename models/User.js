const { getPool } = require('../config/db');

const User = {
  async upsert(userData) {
    const pool = getPool();
    if (!pool) throw new Error('Database not connected');

    const existing = await User.findByDataDIDUid(userData.datadidUid);

    if (existing) {
      const sql = `
        UPDATE users SET
          datadid_did = ?, email = ?, username = ?,
          avatar = ?, login_method = ?, last_access_token = ?,
          updated_at = NOW()
        WHERE datadid_uid = ?
      `;
      const params = [
        userData.datadidDid || existing.datadid_did,
        userData.email || existing.email,
        userData.username || existing.username,
        userData.avatar || existing.avatar,
        userData.loginMethod || existing.login_method,
        userData.accessToken || '',
        userData.datadidUid
      ];
      await pool.execute(sql, params);
      return User.findByDataDIDUid(userData.datadidUid);
    }

    const sql = `
      INSERT INTO users (datadid_uid, datadid_did, email, username, avatar, login_method, last_access_token)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      userData.datadidUid,
      userData.datadidDid || '',
      userData.email || '',
      userData.username || '',
      userData.avatar || '',
      userData.loginMethod || '',
      userData.accessToken || ''
    ];
    const [result] = await pool.execute(sql, params);
    return { id: result.insertId, ...userData };
  },

  async findByDataDIDUid(uid) {
    const pool = getPool();
    if (!pool) throw new Error('Database not connected');

    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE datadid_uid = ?',
      [uid]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const pool = getPool();
    if (!pool) throw new Error('Database not connected');

    const [rows] = await pool.execute(
      'SELECT id, datadid_uid, datadid_did, email, username, avatar, login_method, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async findByEmail(email) {
    const pool = getPool();
    if (!pool) throw new Error('Database not connected');

    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }
};

module.exports = User;
