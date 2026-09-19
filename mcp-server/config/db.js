const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
