const { z } = require('zod');
const { query } = require('../config/db');

const getOrderStatusSchema = z.object({
  orderNumber: z.string().min(5).describe('Order tracking code, e.g. NEX-2026-XXXXX')
});

const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid().describe('Order UUID'),
  orderStatus: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  trackingNumber: z.string().optional()
});

const getOrderStatus = async (args) => {
  const { orderNumber } = getOrderStatusSchema.parse(args);
  const sql = `
    SELECT o.id, o.order_number, o.order_status, o.payment_status, o.tracking_number,
           o.total_amount, o.created_at, u.name AS customer_name
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.order_number = $1
  `;
  const res = await query(sql, [orderNumber.trim()]);
  if (res.rows.length === 0) throw new Error(`Order #${orderNumber} not found.`);
  return res.rows[0];
};

const updateOrderStatus = async (args, context) => {
  if (context?.role !== 'ADMIN' && context?.role !== 'MANAGER') {
    throw new Error('UNAUTHORIZED: Only ADMIN or MANAGER roles can update order status.');
  }

  const { orderId, orderStatus, trackingNumber } = updateOrderStatusSchema.parse(args);

  const res = await query(
    `UPDATE orders
     SET order_status = $1,
         tracking_number = COALESCE($2, tracking_number),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING id, order_number, order_status, payment_status, tracking_number`,
    [orderStatus, trackingNumber || null, orderId]
  );

  if (res.rows.length === 0) throw new Error('Order not found.');
  return { success: true, order: res.rows[0] };
};

module.exports = {
  getOrderStatusSchema,
  updateOrderStatusSchema,
  getOrderStatus,
  updateOrderStatus
};
