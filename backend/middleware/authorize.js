/**
 * Role-Based Access Control (RBAC) Middleware
 * @param  {...string} allowedRoles - E.g. 'ADMIN', 'MANAGER', 'CUSTOMER'
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication is required.'
        }
      });
    }

    const userRoles = req.user.roles || [];
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Forbidden: requires one of [${allowedRoles.join(', ')}] privileges.`
        }
      });
    }

    next();
  };
};

module.exports = {
  requireRole
};
