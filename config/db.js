const mysql = require('mysql2/promise');

let pool = null;

const connectDB = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'helloworld#',
      database: process.env.DB_NAME || 'web3_personality_test',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    await pool.getConnection();
    console.log(`MySQL Connected: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || 'web3_personality_test'}`);

    await initTable();
  } catch (error) {
    console.error(`MySQL connection error: ${error.message}`);
    console.warn('Server will continue without database. API endpoints will return errors.');
    pool = null;
  }
};

async function initTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS test_results (
      id INT AUTO_INCREMENT PRIMARY KEY,
      personality_name VARCHAR(100) NOT NULL,
      type_code VARCHAR(10) NOT NULL,
      risk VARCHAR(20) NOT NULL,
      motivation VARCHAR(20) NOT NULL,
      time_dim VARCHAR(20) NOT NULL,
      social VARCHAR(20) NOT NULL,
      score_degen INT NOT NULL DEFAULT 0,
      score_safe INT NOT NULL DEFAULT 0,
      score_utility INT NOT NULL DEFAULT 0,
      score_lore INT NOT NULL DEFAULT 0,
      score_sniper INT NOT NULL DEFAULT 0,
      score_hodler INT NOT NULL DEFAULT 0,
      score_anon INT NOT NULL DEFAULT 0,
      score_public INT NOT NULL DEFAULT 0,
      description TEXT NOT NULL,
      user_agent VARCHAR(500) DEFAULT '',
      ip_address VARCHAR(50) DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_personality (personality_name),
      INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await pool.execute(createTableSQL);
    console.log('Table `test_results` ready');
  } catch (error) {
    console.error('Table init error:', error.message);
  }
}

function getPool() {
  return pool;
}

module.exports = { connectDB, getPool };
