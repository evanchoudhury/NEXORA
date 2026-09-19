const { Pool } = require('pg');
require('dotenv').config();

let insforgeClient = null;

/**
 * Lazily load and return the official @insforge/sdk client
 */
const getInsforgeClient = async () => {
  if (!insforgeClient) {
    const { createClient } = await import('@insforge/sdk');
    insforgeClient = createClient({
      baseUrl: process.env.INSFORGE_URL || 'https://hmk4mg6q.us-east.insforge.app',
      anonKey: process.env.INSFORGE_ANON_KEY || 'anon_260bdbe9ce12b3ee77a33fd461d67770ac5a9f5e0473fedc2d8d3f08e548f73b'
    });
  }
  return insforgeClient;
};

const DEFAULT_DATABASE_URL = 'postgresql://postgres:1e76d1d5187dad60ae2a14d5d428378d@hmk4mg6q.us-east.database.insforge.app:5432/insforge?sslmode=require';

// High-performance PostgreSQL connection pool for ACID transactions & complex joins
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]: Unexpected client error', err);
});

/**
 * Execute a parameterized query against PostgreSQL
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development' && duration > 200) {
    console.warn(`[Slow Query Alert] (${duration}ms): ${text}`);
  }
  return res;
};

/**
 * Acquire a client from the pool for atomic multi-statement transactions (BEGIN / COMMIT / ROLLBACK)
 */
const getClient = async () => {
  return await pool.connect();
};

module.exports = {
  getInsforgeClient,
  pool,
  query,
  getClient
};
