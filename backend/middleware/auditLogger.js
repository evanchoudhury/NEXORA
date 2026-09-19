const { query } = require('../config/insforge');

/**
 * Log audit events to PostgreSQL audit_logs table
 */
const logAuditEvent = async ({ userId, action, entityType, entityId, oldData, newData, req }) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : null;
    const userAgent = req ? req.headers['user-agent'] : null;

    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_data, new_data, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId || null,
        action,
        entityType,
        entityId ? String(entityId) : null,
        oldData ? JSON.stringify(oldData) : null,
        newData ? JSON.stringify(newData) : null,
        ipAddress,
        userAgent
      ]
    );
  } catch (error) {
    console.error('[Audit Logger Error]: Failed to write audit log:', error.message);
  }
};

module.exports = {
  logAuditEvent
};
