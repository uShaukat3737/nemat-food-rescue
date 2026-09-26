const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/nemat',
  // Serverless-safe: each Vercel function invocation gets its own process,
  // so a small per-instance pool avoids exhausting the DB's connection
  // limit under concurrent traffic. Harmless for local single-process dev.
  max: 1,
});

function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query };
