const { z } = require('zod');
const { query } = require('../config/db');

// Schema definitions
const searchProductsSchema = z.object({
  query: z.string().optional().describe('Keyword to search name, description, brand, or SKU'),
  category: z.string().optional().describe('Category slug (e.g. electronics, gaming, fashion)'),
  minPrice: z.number().min(0).optional().describe('Minimum price in INR'),
  maxPrice: z.number().min(0).optional().describe('Maximum price in INR'),
  limit: z.number().int().min(1).max(50).default(10).describe('Number of products to return')
});

const getProductSchema = z.object({
  identifier: z.string().min(1).describe('Product UUID or URL slug')
});

const createProductSchema = z.object({
  name: z.string().min(2).max(255).describe('Product title'),
  description: z.string().min(10).describe('Full product description'),
  shortDescription: z.string().max(500).optional(),
  brand: z.string().max(100).optional(),
  sku: z.string().min(3).max(100).describe('Unique stock keeping unit'),
  price: z.number().positive().describe('Price in INR'),
  compareAtPrice: z.number().positive().optional(),
  categorySlug: z.string().describe('Target category slug'),
  stock: z.number().int().min(0).default(10).describe('Initial available stock')
});

// Handlers
const searchProducts = async (args) => {
  const parsed = searchProductsSchema.parse(args);
  const conditions = ['p.is_active = TRUE'];
  const params = [];
  let paramIdx = 1;

  if (parsed.query) {
    conditions.push(`(p.name ILIKE $${paramIdx} OR p.description ILIKE $${paramIdx} OR p.brand ILIKE $${paramIdx} OR p.sku ILIKE $${paramIdx})`);
    params.push(`%${parsed.query}%`);
    paramIdx++;
  }

  if (parsed.category) {
    conditions.push(`c.slug = $${paramIdx}`);
    params.push(parsed.category);
    paramIdx++;
  }

  if (parsed.minPrice !== undefined) {
    conditions.push(`p.price >= $${paramIdx}`);
    params.push(parsed.minPrice);
    paramIdx++;
  }

  if (parsed.maxPrice !== undefined) {
    conditions.push(`p.price <= $${paramIdx}`);
    params.push(parsed.maxPrice);
    paramIdx++;
  }

  const sql = `
    SELECT p.id, p.name, p.slug, p.brand, p.sku, p.price, p.rating, p.review_count,
           c.name AS category_name, COALESCE(inv.stock, 0) AS stock
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN inventory inv ON p.id = inv.product_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY p.rating DESC, p.created_at DESC
    LIMIT $${paramIdx}
  `;
  params.push(parsed.limit);

  const res = await query(sql, params);
  return { count: res.rows.length, products: res.rows };
};

const getProduct = async (args) => {
  const { identifier } = getProductSchema.parse(args);
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);

  const sql = `
    SELECT p.*, c.name AS category_name, c.slug AS category_slug,
           COALESCE(inv.stock, 0) AS stock, inv.low_stock_threshold
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN inventory inv ON p.id = inv.product_id
    WHERE ${isUuid ? 'p.id = $1' : 'p.slug = $1'}
  `;

  const res = await query(sql, [identifier]);
  if (res.rows.length === 0) throw new Error(`Product not found for: ${identifier}`);
  return res.rows[0];
};

const createProduct = async (args, context) => {
  // Enforce ADMIN role check
  if (context?.role !== 'ADMIN') {
    throw new Error('UNAUTHORIZED: Only ADMIN users can execute create_product.');
  }

  const parsed = createProductSchema.parse(args);
  const slug = parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const catRes = await query('SELECT id FROM categories WHERE slug = $1', [parsed.categorySlug]);
  const categoryId = catRes.rows[0]?.id || null;

  const insertSql = `
    INSERT INTO products (name, slug, description, short_description, brand, sku, price, compare_at_price, category_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, name, slug, sku, price
  `;

  const prodRes = await query(insertSql, [
    parsed.name,
    slug,
    parsed.description,
    parsed.shortDescription || null,
    parsed.brand || null,
    parsed.sku,
    parsed.price,
    parsed.compareAtPrice || null,
    categoryId
  ]);

  const product = prodRes.rows[0];
  await query('INSERT INTO inventory (product_id, stock) VALUES ($1, $2)', [product.id, parsed.stock]);

  return { success: true, product };
};

module.exports = {
  searchProductsSchema,
  getProductSchema,
  createProductSchema,
  searchProducts,
  getProduct,
  createProduct
};
