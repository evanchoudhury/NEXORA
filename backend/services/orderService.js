const { query, getClient } = require('../config/insforge');
const { logAuditEvent } = require('../middleware/auditLogger');

/**
 * Generate a unique order tracking reference
 */
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `NEX-2026-${timestamp}${random}`;
};

/**
 * Validate and calculate coupon discount
 */
const validateCoupon = async (code, subtotal, client = null) => {
  if (!code) return { discountAmount: 0, coupon: null };

  const dbClient = client || { query };
  const couponRes = await dbClient.query(
    `SELECT * FROM coupons WHERE code = $1 AND is_active = TRUE`,
    [code.toUpperCase().trim()]
  );

  if (couponRes.rows.length === 0) {
    const error = new Error('Invalid or expired coupon code.');
    error.statusCode = 400;
    error.errorCode = 'INVALID_COUPON';
    throw error;
  }

  const coupon = couponRes.rows[0];

  if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
    const error = new Error('This coupon has expired.');
    error.statusCode = 400;
    error.errorCode = 'COUPON_EXPIRED';
    throw error;
  }

  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    const error = new Error('This coupon has reached its usage limit.');
    error.statusCode = 400;
    error.errorCode = 'COUPON_LIMIT_REACHED';
    throw error;
  }

  if (subtotal < Number(coupon.min_purchase_amount)) {
    const error = new Error(`Coupon requires a minimum order subtotal of ₹${coupon.min_purchase_amount}.`);
    error.statusCode = 400;
    error.errorCode = 'MINIMUM_PURCHASE_REQUIRED';
    throw error;
  }

  let discount = 0;
  if (coupon.discount_type === 'PERCENTAGE') {
    discount = (subtotal * Number(coupon.discount_value)) / 100;
    if (coupon.max_discount_amount && discount > Number(coupon.max_discount_amount)) {
      discount = Number(coupon.max_discount_amount);
    }
  } else {
    discount = Number(coupon.discount_value);
  }

  discount = Math.min(discount, subtotal);
  return {
    discountAmount: Number(discount.toFixed(2)),
    coupon
  };
};

/**
 * Create Order with atomic PostgreSQL Transaction
 */
const createOrder = async ({
  userId,
  shippingAddress,
  billingAddress,
  paymentMethod = 'CREDIT_CARD', // 'CREDIT_CARD', 'UPI', 'WEB3_CRYPTO', 'CASH_ON_DELIVERY'
  couponCode,
  notes
}) => {
  if (!shippingAddress || !shippingAddress.address_line1 || !shippingAddress.city || !shippingAddress.postal_code) {
    const error = new Error('Complete shipping address is required.');
    error.statusCode = 400;
    error.errorCode = 'INVALID_ADDRESS';
    throw error;
  }

  const client = await getClient();
  try {
    // 1. BEGIN TRANSACTION
    await client.query('BEGIN');

    // 2. Fetch cart items
    const cartRes = await client.query('SELECT id FROM cart WHERE user_id = $1', [userId]);
    if (cartRes.rows.length === 0) {
      const error = new Error('Cart is empty.');
      error.statusCode = 400;
      error.errorCode = 'EMPTY_CART';
      throw error;
    }

    const cartId = cartRes.rows[0].id;
    const itemsRes = await client.query(
      `SELECT ci.product_id, ci.quantity, p.name, p.sku, p.price, p.is_active,
              COALESCE(pi.image_url, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80') AS image_url
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
       WHERE ci.cart_id = $1`,
      [cartId]
    );

    if (itemsRes.rows.length === 0) {
      const error = new Error('Your cart is empty. Please add items before checking out.');
      error.statusCode = 400;
      error.errorCode = 'EMPTY_CART';
      throw error;
    }

    const cartItems = itemsRes.rows;

    // 3. Lock inventory rows with FOR UPDATE to prevent race conditions / overselling
    const productIds = cartItems.map(item => item.product_id);
    const inventoryRes = await client.query(
      `SELECT product_id, stock, reserved_stock
       FROM inventory
       WHERE product_id = ANY($1::uuid[])
       FOR UPDATE`,
      [productIds]
    );

    const inventoryMap = new Map();
    inventoryRes.rows.forEach(inv => {
      inventoryMap.set(inv.product_id, inv);
    });

    // 4. Validate stock availability for each item
    for (const item of cartItems) {
      const inv = inventoryMap.get(item.product_id);
      if (!inv || inv.stock < item.quantity) {
        const available = inv ? inv.stock : 0;
        const error = new Error(`Insufficient stock for "${item.name}". Only ${available} available.`);
        error.statusCode = 400;
        error.errorCode = 'OUT_OF_STOCK';
        throw error;
      }
    }

    // 5. Server-side totals calculation
    const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const { discountAmount, coupon } = await validateCoupon(couponCode, subtotal, client);
    const discountedSubtotal = subtotal - discountAmount;
    const taxAmount = Number((discountedSubtotal * 0.18).toFixed(2));
    const shippingAmount = discountedSubtotal > 5000 ? 0.00 : 250.00;
    const totalAmount = Number((discountedSubtotal + taxAmount + shippingAmount).toFixed(2));

    const orderNumber = generateOrderNumber();
    const initialPaymentStatus = paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PENDING';
    const initialOrderStatus = 'PENDING';

    // 6. Insert Order
    const insertOrderSql = `
      INSERT INTO orders (
        order_number, user_id, shipping_address, billing_address,
        subtotal, discount_amount, tax_amount, shipping_amount, total_amount,
        coupon_code, payment_method, payment_status, order_status, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const orderResult = await client.query(insertOrderSql, [
      orderNumber,
      userId,
      JSON.stringify(shippingAddress),
      billingAddress ? JSON.stringify(billingAddress) : JSON.stringify(shippingAddress),
      subtotal,
      discountAmount,
      taxAmount,
      shippingAmount,
      totalAmount,
      coupon ? coupon.code : null,
      paymentMethod,
      initialPaymentStatus,
      initialOrderStatus,
      notes || null
    ]);

    const order = orderResult.rows[0];

    // 7. Insert Order Items & Deduct Inventory Stock
    for (const item of cartItems) {
      const itemTotal = Number((Number(item.price) * item.quantity).toFixed(2));

      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_sku, price, quantity, total, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [order.id, item.product_id, item.name, item.sku, item.price, item.quantity, itemTotal, item.image_url]
      );

      // Decrement inventory stock atomically
      await client.query(
        `UPDATE inventory
         SET stock = stock - $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE product_id = $2`,
        [item.quantity, item.product_id]
      );
    }

    // 8. Record coupon usage if applied
    if (coupon) {
      await client.query(
        `INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_applied)
         VALUES ($1, $2, $3, $4)`,
        [coupon.id, userId, order.id, discountAmount]
      );

      await client.query(
        `UPDATE coupons SET used_count = used_count + 1 WHERE id = $1`,
        [coupon.id]
      );
    }

    // 9. Create payment record
    await client.query(
      `INSERT INTO payments (order_id, payment_method, amount, currency, status)
       VALUES ($1, $2, $3, 'INR', $4)`,
      [order.id, paymentMethod, totalAmount, initialPaymentStatus]
    );

    // 10. Clear user's cart
    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    // 11. COMMIT TRANSACTION
    await client.query('COMMIT');

    logAuditEvent({
      userId,
      action: 'CREATE_ORDER',
      entityType: 'ORDER',
      entityId: order.id,
      newData: { orderNumber: order.order_number, totalAmount: order.total_amount }
    });

    return order;
  } catch (error) {
    // ROLLBACK on any failure to guarantee data integrity
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get user orders
 */
const getUserOrders = async (userId) => {
  const sql = `
    SELECT 
      o.id,
      o.order_number,
      o.subtotal,
      o.discount_amount,
      o.tax_amount,
      o.shipping_amount,
      o.total_amount,
      o.payment_method,
      o.payment_status,
      o.order_status,
      o.tracking_number,
      o.created_at,
      COUNT(oi.id) as total_items,
      json_agg(
        json_build_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'product_name', oi.product_name,
          'product_sku', oi.product_sku,
          'price', oi.price,
          'quantity', oi.quantity,
          'total', oi.total,
          'image_url', oi.image_url
        )
      ) AS items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = $1
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;

  const result = await query(sql, [userId]);
  return result.rows;
};

/**
 * Get order by ID or order_number with full details
 */
const getOrderById = async (identifier, userId = null, userRoles = []) => {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);

  let orderSql = `
    SELECT o.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE ${isUuid ? 'o.id = $1' : 'o.order_number = $1'}
  `;

  const orderRes = await query(orderSql, [identifier]);

  if (orderRes.rows.length === 0) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    error.errorCode = 'ORDER_NOT_FOUND';
    throw error;
  }

  const order = orderRes.rows[0];

  // Authorization check: only owner or ADMIN/MANAGER can view
  const isAdminOrManager = userRoles.includes('ADMIN') || userRoles.includes('MANAGER');
  if (userId && order.user_id !== userId && !isAdminOrManager) {
    const error = new Error('You are not authorized to view this order.');
    error.statusCode = 403;
    error.errorCode = 'FORBIDDEN';
    throw error;
  }

  // Fetch items
  const itemsRes = await query(
    `SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC`,
    [order.id]
  );
  order.items = itemsRes.rows;

  // Fetch payment records
  const paymentRes = await query(
    `SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC`,
    [order.id]
  );
  order.payments = paymentRes.rows;

  // Fetch blockchain tx if any
  const bcRes = await query(
    `SELECT * FROM blockchain_transactions WHERE order_id = $1`,
    [order.id]
  );
  order.blockchain_transaction = bcRes.rows[0] || null;

  return order;
};

/**
 * Update order status (Admin/Manager)
 */
const updateOrderStatus = async (orderId, { orderStatus, paymentStatus, trackingNumber }, adminUserId) => {
  const allowedStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
  if (orderStatus && !allowedStatuses.includes(orderStatus)) {
    const error = new Error(`Invalid order status. Must be one of: ${allowedStatuses.join(', ')}`);
    error.statusCode = 400;
    error.errorCode = 'INVALID_STATUS';
    throw error;
  }

  const updateRes = await query(
    `UPDATE orders
     SET order_status = COALESCE($1, order_status),
         payment_status = COALESCE($2, payment_status),
         tracking_number = COALESCE($3, tracking_number),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $4
     RETURNING *`,
    [orderStatus, paymentStatus, trackingNumber, orderId]
  );

  if (updateRes.rows.length === 0) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    error.errorCode = 'ORDER_NOT_FOUND';
    throw error;
  }

  const updatedOrder = updateRes.rows[0];

  logAuditEvent({
    userId: adminUserId,
    action: 'UPDATE_ORDER_STATUS',
    entityType: 'ORDER',
    entityId: orderId,
    newData: { orderStatus, paymentStatus, trackingNumber }
  });

  return updatedOrder;
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  validateCoupon
};
