const { Pool } = require('pg');
require('dotenv').config();

const DEFAULT_DATABASE_URL = 'postgresql://postgres:1e76d1d5187dad60ae2a14d5d428378d@hmk4mg6q.us-east.database.insforge.app:5432/insforge?sslmode=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const query = (text, params) => pool.query(text, params);

/**
 * Log tool execution into mcp_audit_logs in PostgreSQL
 */
const logMcpToolCall = async ({ userId, role, toolName, parameters, success, errorMessage, executionTimeMs }) => {
  try {
    await query(
      `INSERT INTO mcp_audit_logs (user_id, role, tool_name, parameters, success, error_message, execution_time_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId || null,
        role || 'ANONYMOUS',
        toolName,
        parameters ? JSON.stringify(parameters) : null,
        success !== false,
        errorMessage || null,
        executionTimeMs || 0
      ]
    );
  } catch (err) {
    console.error('[MCP Audit Log Error]:', err.message);
  }
};

module.exports = {
  pool,
  query,
  logMcpToolCall
};
