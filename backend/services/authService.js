const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, getClient } = require('../config/insforge');
const { logAuditEvent } = require('../middleware/auditLogger');

const generateToken = (userId, email, roles) => {
  return jwt.sign(
    { userId, email, roles },
    process.env.JWT_SECRET || 'nexora_super_secure_jwt_secret_key_2026_production_grade',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const register = async ({ name, email, password, phone, walletAddress }, req) => {
  if (!name || !email || !password) {
    const error = new Error('Name, email, and password are required.');
    error.statusCode = 400;
    error.errorCode = 'VALIDATION_ERROR';
    throw error;
  }

  // Check if email already taken
  const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
  if (existing.rows.length > 0) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    error.errorCode = 'EMAIL_ALREADY_EXISTS';
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const insertUserRes = await client.query(
      `INSERT INTO users (name, email, password_hash, phone, wallet_address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, avatar_url, wallet_address, created_at`,
      [name.trim(), email.toLowerCase().trim(), passwordHash, phone || null, walletAddress || null]
    );

    const newUser = insertUserRes.rows[0];

    // Assign default 'CUSTOMER' role
    const customerRoleRes = await client.query("SELECT id FROM roles WHERE name = 'CUSTOMER'");
    const roleId = customerRoleRes.rows[0]?.id || 1;

    await client.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
      [newUser.id, roleId]
    );

    // Initialize user cart and wishlist
    await client.query('INSERT INTO cart (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [newUser.id]);
    await client.query('INSERT INTO wishlists (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [newUser.id]);

    await client.query('COMMIT');

    const roles = ['CUSTOMER'];
    const token = generateToken(newUser.id, newUser.email, roles);

    logAuditEvent({
      userId: newUser.id,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: newUser.id,
      newData: { email: newUser.email, name: newUser.name },
      req
    });

    return {
      user: { ...newUser, roles },
      token
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const login = async ({ email, password }, req) => {
  if (!email || !password) {
    const error = new Error('Email and password are required.');
    error.statusCode = 400;
    error.errorCode = 'VALIDATION_ERROR';
    throw error;
  }

  const userRes = await query(
    `SELECT u.id, u.name, u.email, u.password_hash, u.phone, u.avatar_url, u.wallet_address, u.is_active,
            COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
     FROM users u
     LEFT JOIN user_roles ur ON u.id = ur.user_id
     LEFT JOIN roles r ON ur.role_id = r.id
     WHERE u.email = $1
     GROUP BY u.id`,
    [email.toLowerCase().trim()]
  );

  if (userRes.rows.length === 0) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.errorCode = 'INVALID_CREDENTIALS';
    throw error;
  }

  const user = userRes.rows[0];

  if (!user.is_active) {
    const error = new Error('This account has been deactivated. Please contact support.');
    error.statusCode = 403;
    error.errorCode = 'ACCOUNT_DEACTIVATED';
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.errorCode = 'INVALID_CREDENTIALS';
    throw error;
  }

  delete user.password_hash;
  const token = generateToken(user.id, user.email, user.roles);

  logAuditEvent({
    userId: user.id,
    action: 'USER_LOGIN',
    entityType: 'USER',
    entityId: user.id,
    req
  });

  return { user, token };
};

const getMe = async (userId) => {
  const userRes = await query(
    `SELECT u.id, u.name, u.email, u.phone, u.avatar_url, u.wallet_address, u.created_at,
            COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
     FROM users u
     LEFT JOIN user_roles ur ON u.id = ur.user_id
     LEFT JOIN roles r ON ur.role_id = r.id
     WHERE u.id = $1
     GROUP BY u.id`,
    [userId]
  );

  if (userRes.rows.length === 0) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    error.errorCode = 'USER_NOT_FOUND';
    throw error;
  }

  return userRes.rows[0];
};

const updateProfile = async (userId, { name, phone, avatarUrl, walletAddress }) => {
  const updateRes = await query(
    `UPDATE users
     SET name = COALESCE($1, name),
         phone = COALESCE($2, phone),
         avatar_url = COALESCE($3, avatar_url),
         wallet_address = COALESCE($4, wallet_address),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $5
     RETURNING id, name, email, phone, avatar_url, wallet_address, updated_at`,
    [name, phone, avatarUrl, walletAddress, userId]
  );

  return updateRes.rows[0];
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
