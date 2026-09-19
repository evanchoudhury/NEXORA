const { z } = require('zod');
const { query } = require('../config/db');

const getSalesAnalyticsSchema = z.object({
  days: z.number().int().min(1).max(90).default(30).describe('Number of past days to analyze')
});

const getSalesAnalytics = async (args, context) => {
  if (context?.role !== 'ADMIN' && context?.role !== 'MANAGER') {
    throw new Error('UNAUTHORIZED: Only ADMIN or MANAGER roles can view sales analytics.');
  }

  const { days } = getSalesAnalyticsSchema.parse(args || {});

  const summaryRes = await query(`
    SELECT 
      COALESCE(SUM(total_amount), 0) AS total_revenue,
      COUNT(id) AS total_orders,
      AVG(total_amount) AS aov
    FROM orders
    WHERE payment_status = 'PAID' AND created_at >= CURRENT_DATE - (interval '1 day' * $1)
  `, [days]);

  const topCategoriesRes = await query(`
    SELECT c.name AS category, SUM(oi.total) AS revenue, SUM(oi.quantity) AS volume
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN categories c ON p.category_id = c.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.payment_status = 'PAID' AND o.created_at >= CURRENT_DATE - (interval '1 day' * $1)
    GROUP BY c.name
    ORDER BY revenue DESC
  `, [days]);

  return {
    periodDays: days,
    overview: summaryRes.rows[0],
    categoryBreakdown: topCategoriesRes.rows
  };
};

module.exports = {
  getSalesAnalyticsSchema,
  getSalesAnalytics
};
