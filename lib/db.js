const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/nemat',
  max: 5,
});

function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query };
