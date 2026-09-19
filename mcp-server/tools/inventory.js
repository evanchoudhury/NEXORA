const { z } = require('zod');
const { query } = require('../config/db');

const getLowStockSchema = z.object({
  threshold: z.number().int().min(0).default(5).describe('Stock threshold to flag items')
});

const updateInventorySchema = z.object({
  productId: z.string().uuid().describe('Product UUID'),
  newStock: z.number().int().min(0).describe('New stock count to set')
});

const getLowStockProducts = async (args) => {
  const { threshold } = getLowStockSchema.parse(args || {});
  const sql = `
    SELECT p.id, p.name, p.sku, p.price, inv.stock, inv.low_stock_threshold, c.name AS category_name
    FROM products p
    JOIN inventory inv ON p.id = inv.product_id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE inv.stock <= $1
    ORDER BY inv.stock ASC
  `;
  const res = await query(sql, [threshold]);
  return { count: res.rows.length, lowStockItems: res.rows };
};

const updateInventory = async (args, context) => {
  if (context?.role !== 'ADMIN' && context?.role !== 'MANAGER') {
    throw new Error('UNAUTHORIZED: Only ADMIN or MANAGER roles can update inventory stock.');
  }

  const { productId, newStock } = updateInventorySchema.parse(args);
  const res = await query(
    `UPDATE inventory
     SET stock = $1, updated_at = CURRENT_TIMESTAMP
     WHERE product_id = $2
     RETURNING product_id, stock`,
    [newStock, productId]
  );

  if (res.rows.length === 0) throw new Error('Inventory record not found for this product.');
  return { success: true, inventory: res.rows[0] };
};

module.exports = {
  getLowStockSchema,
  updateInventorySchema,
  getLowStockProducts,
  updateInventory
};
