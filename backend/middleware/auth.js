const jwt = require('jsonwebtoken');
const { query } = require('../config/insforge');

/**
 * Middleware to enforce authentication
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token is required to access this resource.'
        }
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'nexora_super_secure_jwt_secret_key_2026_production_grade');
    } catch (err) {
      // Support InsForge Auth JWT tokens
      const decodedPayload = jwt.decode(token);
      if (decodedPayload && (decodedPayload.sub || decodedPayload.userId || decodedPayload.id)) {
        decoded = {
          userId: decodedPayload.sub || decodedPayload.userId || decodedPayload.id,
          email: decodedPayload.email
        };
      } else {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired authentication token.'
          }
        });
      }
    }

    // Fetch user and roles from PostgreSQL database
    let userRes = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.avatar_url, u.wallet_address, u.is_active,
              COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id::text = $1 OR (u.email = $2 AND $2 != '')
       GROUP BY u.id`,
      [decoded.userId, decoded.email || '']
    );

    // Auto-provision user record if authenticated through InsForge Auth
    if (userRes.rows.length === 0) {
      try {
        await query(
          `INSERT INTO users (id, email, name, avatar_url)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
           RETURNING id`,
          [decoded.userId, decoded.email || 'user@nexora.com', decoded.email ? decoded.email.split('@')[0] : 'Member', null]
        );
        await query(`INSERT INTO user_roles (user_id, role_id) SELECT $1, id FROM roles WHERE name = 'CUSTOMER' ON CONFLICT DO NOTHING`, [decoded.userId]);
        await query(`INSERT INTO cart (user_id) VALUES ($1) ON CONFLICT DO NOTHING`, [decoded.userId]);
        await query(`INSERT INTO wishlists (user_id) VALUES ($1) ON CONFLICT DO NOTHING`, [decoded.userId]);

        userRes = await query(
          `SELECT u.id, u.name, u.email, u.phone, u.avatar_url, u.wallet_address, u.is_active,
                  COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
           FROM users u
           LEFT JOIN user_roles ur ON u.id = ur.user_id
           LEFT JOIN roles r ON ur.role_id = r.id
           WHERE u.id::text = $1
           GROUP BY u.id`,
          [decoded.userId]
        );
      } catch (provisionErr) {
        console.warn('Auto-provisioning warning:', provisionErr.message);
      }
    }

    if (userRes.rows.length === 0 || !userRes.rows[0].is_active) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User account not found or deactivated.'
        }
      });
    }

    req.user = userRes.rows[0];
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Authentication check failed.'
      }
    });
  }
};

/**
 * Optional authentication: populates req.user if token is provided, otherwise lets request continue
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'nexora_super_secure_jwt_secret_key_2026_production_grade');
    } catch {
      const decodedPayload = jwt.decode(token);
      if (decodedPayload && (decodedPayload.sub || decodedPayload.userId || decodedPayload.id)) {
        decoded = {
          userId: decodedPayload.sub || decodedPayload.userId || decodedPayload.id,
          email: decodedPayload.email
        };
      }
    }

    if (!decoded) {
      req.user = null;
      return next();
    }

    const userRes = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.avatar_url, u.wallet_address, u.is_active,
              COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id::text = $1 OR (u.email = $2 AND $2 != '')
       GROUP BY u.id`,
      [decoded.userId, decoded.email || '']
    );

    if (userRes.rows.length > 0 && userRes.rows[0].is_active) {
      req.user = userRes.rows[0];
    } else {
      req.user = null;
    }
  } catch (err) {
    req.user = null;
  }
  next();
};

module.exports = {
  requireAuth,
  optionalAuth
};
