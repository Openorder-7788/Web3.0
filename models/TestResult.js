const { getPool } = require('../config/db');

const TestResult = {
  async create(data) {
    const pool = getPool();
    if (!pool) throw new Error('Database not connected');

    const sql = `
      INSERT INTO test_results (
        personality_name, type_code, risk, motivation, time_dim, social,
        score_degen, score_safe, score_utility, score_lore,
        score_sniper, score_hodler, score_anon, score_public,
        description, user_agent, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.personalityName,
      data.typeCode,
      data.dimensions.risk,
      data.dimensions.motivation,
      data.dimensions.time,
      data.dimensions.social,
      data.scores.degen,
      data.scores.safe,
      data.scores.utility,
      data.scores.lore,
      data.scores.sniper,
      data.scores.hodler,
      data.scores.anon,
      data.scores.public,
      data.description,
      data.userAgent || '',
      data.ipAddress || ''
    ];

    const [result] = await pool.execute(sql, params);
    return { id: result.insertId, ...data };
  },

  async count() {
    const pool = getPool();
    if (!pool) throw new Error('Database not connected');

    const [rows] = await pool.execute('SELECT COUNT(*) as total FROM test_results');
    return rows[0].total;
  },

  async countByPersonality() {
    const pool = getPool();
    if (!pool) throw new Error('Database not connected');

    const [rows] = await pool.execute(
      'SELECT personality_name as _id, COUNT(*) as count FROM test_results GROUP BY personality_name ORDER BY count DESC'
    );
    return rows;
  },

  async countByDimension(dimensionCol) {
    const pool = getPool();
    if (!pool) throw new Error('Database not connected');

    const allowedCols = ['risk', 'motivation', 'time_dim', 'social'];
    if (!allowedCols.includes(dimensionCol)) {
      throw new Error(`Invalid dimension column: ${dimensionCol}`);
    }

    const [rows] = await pool.execute(
      `SELECT ${dimensionCol} as _id, COUNT(*) as count FROM test_results GROUP BY ${dimensionCol} ORDER BY count DESC`
    );
    return rows;
  },

  async getRecent(limit = 10) {
    const pool = getPool();
    if (!pool) throw new Error('Database not connected');

    const [rows] = await pool.execute(
      'SELECT id, personality_name as personalityName, type_code as typeCode, created_at as createdAt FROM test_results ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    return rows;
  }
};

module.exports = TestResult;
