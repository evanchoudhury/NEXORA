const analyticsService = require('../services/analyticsService');
const orderService = require('../services/orderService');
const { query } = require('../config/insforge');

const getDashboardStats = async (req, res, next) => {
  try {
    const metrics = await analyticsService.getDashboardMetrics();
    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.wallet_address, u.is_active, u.created_at,
        COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles,
        COUNT(DISTINCT o.id) AS total_orders,
        COALESCE(SUM(o.total_amount), 0) AS total_spent
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      LEFT JOIN orders o ON u.id = o.user_id AND o.payment_status = 'PAID'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.status(200).json({
      success: true,
      data: { users: result.rows }
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const roleRes = await query('SELECT id FROM roles WHERE name = $1', [role.toUpperCase()]);
    if (roleRes.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ROLE', message: 'Role does not exist.' }
      });
    }

    const roleId = roleRes.rows[0].id;
    await query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
    await query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [userId, roleId]);

    res.status(200).json({
      success: true,
      message: `Role ${role} assigned successfully.`
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const params = [];
    let where = '';

    if (status) {
      where = 'WHERE o.order_status = $1';
      params.push(status);
    }

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    params.push(parseInt(limit, 10), offset);

    const ordersRes = await query(`
      SELECT 
        o.id, o.order_number, o.total_amount, o.payment_method, o.payment_status,
        o.order_status, o.tracking_number, o.created_at,
        u.name AS customer_name, u.email AS customer_email,
        COUNT(oi.id) AS item_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${where}
      GROUP BY o.id, u.name, u.email
      ORDER BY o.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    res.status(200).json({
      success: true,
      data: { orders: ordersRes.rows }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Render printable EJS invoice for an order
 */
const renderInvoice = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, null, ['ADMIN']);
    res.render('invoices/invoice', {
      order,
      title: `Invoice #${order.order_number} - NEXORA`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Render SSR Admin Sales Report
 */
const renderAdminReport = async (req, res, next) => {
  try {
    const metrics = await analyticsService.getDashboardMetrics();
    res.render('admin/report', {
      metrics,
      title: 'Executive Sales & Analytics Report - NEXORA'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  getAllOrders,
  renderInvoice,
  renderAdminReport
};
