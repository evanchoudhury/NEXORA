const { query } = require('../config/insforge');

/**
 * Get comprehensive store analytics for the Admin/Manager dashboard
 */
const getDashboardMetrics = async () => {
  // 1. Overall stats
  const statsRes = await query(`
    SELECT
      (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'PAID') AS total_revenue,
      (SELECT COUNT(*) FROM orders) AS total_orders,
      (SELECT COUNT(*) FROM users) AS total_customers,
      (SELECT COUNT(*) FROM products WHERE is_active = TRUE) AS total_products,
      (SELECT COUNT(*) FROM inventory WHERE stock <= low_stock_threshold) AS low_stock_count
  `);

  // 2. Sales trend (Last 30 days daily)
  const salesTrendRes = await query(`
    SELECT 
      TO_CHAR(DATE_TRUNC('day', created_at), 'YYYY-MM-DD') AS date,
      COUNT(id) AS orders_count,
      COALESCE(SUM(total_amount), 0) AS total_sales,
      COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN total_amount ELSE 0 END), 0) AS paid_sales
    FROM orders
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE_TRUNC('day', created_at)
    ORDER BY date ASC
  `);

  // 3. Category revenue breakdown
  const categorySalesRes = await query(`
    SELECT 
      c.name AS category_name,
      c.slug AS category_slug,
      COUNT(DISTINCT oi.id) AS items_sold,
      COALESCE(SUM(oi.total), 0) AS total_revenue
    FROM categories c
    JOIN products p ON c.id = p.category_id
    JOIN order_items oi ON p.id = oi.product_id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.payment_status = 'PAID'
    GROUP BY c.id, c.name, c.slug
    ORDER BY total_revenue DESC
  `);

  // 4. Best-selling products
  const topProductsRes = await query(`
    SELECT 
      p.id,
      p.name,
      p.sku,
      p.price,
      c.name AS category_name,
      COALESCE(pi.image_url, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80') AS image_url,
      SUM(oi.quantity) AS units_sold,
      SUM(oi.total) AS total_revenue
    FROM products p
    JOIN order_items oi ON p.id = oi.product_id
    JOIN orders o ON oi.order_id = o.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
    WHERE o.payment_status = 'PAID'
    GROUP BY p.id, p.name, p.sku, p.price, c.name, pi.image_url
    ORDER BY units_sold DESC
    LIMIT 5
  `);

  // 5. Low stock alerts
  const lowStockRes = await query(`
    SELECT 
      p.id,
      p.name,
      p.sku,
      p.price,
      c.name AS category_name,
      inv.stock,
      inv.reserved_stock,
      inv.low_stock_threshold
    FROM products p
    JOIN inventory inv ON p.id = inv.product_id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE inv.stock <= inv.low_stock_threshold
    ORDER BY inv.stock ASC
    LIMIT 10
  `);

  // 6. Recent orders
  const recentOrdersRes = await query(`
    SELECT 
      o.id,
      o.order_number,
      o.total_amount,
      o.payment_method,
      o.payment_status,
      o.order_status,
      o.created_at,
      u.name AS customer_name,
      u.email AS customer_email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
    LIMIT 8
  `);

  return {
    overview: {
      totalRevenue: Number(statsRes.rows[0].total_revenue),
      totalOrders: parseInt(statsRes.rows[0].total_orders, 10),
      totalCustomers: parseInt(statsRes.rows[0].total_customers, 10),
      totalProducts: parseInt(statsRes.rows[0].total_products, 10),
      lowStockCount: parseInt(statsRes.rows[0].low_stock_count, 10)
    },
    salesTrend: salesTrendRes.rows,
    categorySales: categorySalesRes.rows,
    topProducts: topProductsRes.rows,
    lowStockAlerts: lowStockRes.rows,
    recentOrders: recentOrdersRes.rows
  };
};

module.exports = {
  getDashboardMetrics
};
