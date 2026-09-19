const { query, getClient } = require('../config/insforge');
const { logAuditEvent } = require('../middleware/auditLogger');

/**
 * Filter, search, sort, and paginate products using PostgreSQL parameterized queries
 */
const getProducts = async ({
  search,
  category,
  minPrice,
  maxPrice,
  brand,
  rating,
  inStock,
  featured,
  trending,
  sort = 'newest',
  page = 1,
  limit = 12
}) => {
  const conditions = ['p.is_active = TRUE'];
  const params = [];
  let paramIndex = 1;

  if (search && search.trim() !== '') {
    conditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR p.brand ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`);
    params.push(`%${search.trim()}%`);
    paramIndex++;
  }

  if (category && category.trim() !== '') {
    conditions.push(`(c.slug = $${paramIndex} OR c.name ILIKE $${paramIndex})`);
    params.push(category.trim());
    paramIndex++;
  }

  if (brand && brand.trim() !== '') {
    conditions.push(`p.brand ILIKE $${paramIndex}`);
    params.push(brand.trim());
    paramIndex++;
  }

  if (minPrice !== undefined && minPrice !== null && !isNaN(minPrice)) {
    conditions.push(`p.price >= $${paramIndex}`);
    params.push(Number(minPrice));
    paramIndex++;
  }

  if (maxPrice !== undefined && maxPrice !== null && !isNaN(maxPrice)) {
    conditions.push(`p.price <= $${paramIndex}`);
    params.push(Number(maxPrice));
    paramIndex++;
  }

  if (rating !== undefined && rating !== null && !isNaN(rating)) {
    conditions.push(`p.rating >= $${paramIndex}`);
    params.push(Number(rating));
    paramIndex++;
  }

  if (inStock === 'true' || inStock === true) {
    conditions.push(`COALESCE(inv.stock, 0) > 0`);
  }

  if (featured === 'true' || featured === true) {
    conditions.push(`p.is_featured = TRUE`);
  }

  if (trending === 'true' || trending === true) {
    conditions.push(`p.is_trending = TRUE`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Sorting
  let orderBy = 'p.created_at DESC';
  switch (sort) {
    case 'price_asc':
      orderBy = 'p.price ASC';
      break;
    case 'price_desc':
      orderBy = 'p.price DESC';
      break;
    case 'rating':
      orderBy = 'p.rating DESC, p.review_count DESC';
      break;
    case 'popular':
      orderBy = 'p.review_count DESC, p.rating DESC';
      break;
    case 'name_asc':
      orderBy = 'p.name ASC';
      break;
    case 'newest':
    default:
      orderBy = 'p.created_at DESC';
      break;
  }

  // Count total matching
  const countSql = `
    SELECT COUNT(DISTINCT p.id) as total
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN inventory inv ON p.id = inv.product_id
    ${whereClause}
  `;
  const countResult = await query(countSql, params);
  const total = parseInt(countResult.rows[0].total, 10);

  // Pagination calculation
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (parsedPage - 1) * parsedLimit;
  const totalPages = Math.ceil(total / parsedLimit);

  // Fetch paginated products
  const dataSql = `
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.short_description,
      p.description,
      p.brand,
      p.sku,
      p.price,
      p.compare_at_price,
      p.rating,
      p.review_count,
      p.is_featured,
      p.is_trending,
      p.created_at,
      c.id AS category_id,
      c.name AS category_name,
      c.slug AS category_slug,
      COALESCE(pi.image_url, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80') AS primary_image_url,
      COALESCE(inv.stock, 0) AS stock,
      COALESCE(inv.stock - inv.reserved_stock, 0) AS available_stock
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
    LEFT JOIN inventory inv ON p.id = inv.product_id
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const dataParams = [...params, parsedLimit, offset];
  const dataResult = await query(dataSql, dataParams);

  return {
    products: dataResult.rows,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages,
      hasNextPage: parsedPage < totalPages,
      hasPrevPage: parsedPage > 1
    }
  };
};

/**
 * Get product by slug or UUID including all gallery images, reviews, and category info
 */
const getProductBySlugOrId = async (identifier) => {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);

  const productSql = `
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.short_description,
      p.description,
      p.brand,
      p.sku,
      p.price,
      p.compare_at_price,
      p.rating,
      p.review_count,
      p.is_featured,
      p.is_trending,
      p.is_active,
      p.created_at,
      p.updated_at,
      c.id AS category_id,
      c.name AS category_name,
      c.slug AS category_slug,
      COALESCE(inv.stock, 0) AS stock,
      COALESCE(inv.stock - inv.reserved_stock, 0) AS available_stock,
      inv.low_stock_threshold
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN inventory inv ON p.id = inv.product_id
    WHERE ${isUuid ? 'p.id = $1' : 'p.slug = $1'}
  `;

  const productResult = await query(productSql, [identifier]);

  if (productResult.rows.length === 0) {
    const error = new Error('Product not found.');
    error.statusCode = 404;
    error.errorCode = 'PRODUCT_NOT_FOUND';
    throw error;
  }

  const product = productResult.rows[0];

  // Fetch images
  const imagesResult = await query(
    `SELECT id, image_url, alt_text, is_primary, display_order
     FROM product_images
     WHERE product_id = $1
     ORDER BY is_primary DESC, display_order ASC`,
    [product.id]
  );

  product.images = imagesResult.rows;
  product.primary_image_url = imagesResult.rows.find(i => i.is_primary)?.image_url || imagesResult.rows[0]?.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';

  // Fetch recent approved reviews
  const reviewsResult = await query(
    `SELECT r.id, r.rating, r.title, r.comment, r.is_verified_purchase, r.created_at,
            u.name AS user_name, u.avatar_url AS user_avatar
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.product_id = $1 AND r.is_approved = TRUE
     ORDER BY r.created_at DESC
     LIMIT 10`,
    [product.id]
  );

  product.reviews = reviewsResult.rows;

  return product;
};

/**
 * Get all active categories with product counts
 */
const getCategories = async () => {
  const sql = `
    SELECT 
      c.id,
      c.name,
      c.slug,
      c.description,
      c.image_url,
      c.icon,
      COUNT(p.id) AS product_count
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id AND p.is_active = TRUE
    GROUP BY c.id
    ORDER BY c.name ASC
  `;

  const result = await query(sql);
  return result.rows;
};

/**
 * Create a new product (Admin function with inventory initialization)
 */
const createProduct = async (data, adminUserId) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const slug = (data.slug || data.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const insertProductSql = `
      INSERT INTO products (
        category_id, name, slug, description, short_description, brand, sku, price, compare_at_price, is_featured, is_trending
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const productRes = await client.query(insertProductSql, [
      data.categoryId || null,
      data.name,
      slug,
      data.description,
      data.shortDescription || null,
      data.brand || null,
      data.sku,
      data.price,
      data.compareAtPrice || null,
      data.isFeatured || false,
      data.isTrending || false
    ]);

    const product = productRes.rows[0];

    // Initialize inventory
    await client.query(
      `INSERT INTO inventory (product_id, stock, low_stock_threshold)
       VALUES ($1, $2, $3)`,
      [product.id, data.stock || 0, data.lowStockThreshold || 5]
    );

    // Insert image if provided
    if (data.imageUrl) {
      await client.query(
        `INSERT INTO product_images (product_id, image_url, alt_text, is_primary)
         VALUES ($1, $2, $3, TRUE)`,
        [product.id, data.imageUrl, data.name]
      );
    }

    await client.query('COMMIT');

    logAuditEvent({
      userId: adminUserId,
      action: 'CREATE_PRODUCT',
      entityType: 'PRODUCT',
      entityId: product.id,
      newData: product
    });

    return product;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update an existing product
 */
const updateProduct = async (id, data, adminUserId) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const updateProductSql = `
      UPDATE products
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          short_description = COALESCE($3, short_description),
          brand = COALESCE($4, brand),
          price = COALESCE($5, price),
          compare_at_price = COALESCE($6, compare_at_price),
          category_id = COALESCE($7, category_id),
          is_featured = COALESCE($8, is_featured),
          is_trending = COALESCE($9, is_trending),
          is_active = COALESCE($10, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `;

    const updateRes = await client.query(updateProductSql, [
      data.name,
      data.description,
      data.shortDescription,
      data.brand,
      data.price,
      data.compareAtPrice,
      data.categoryId,
      data.isFeatured,
      data.isTrending,
      data.isActive,
      id
    ]);

    if (updateRes.rows.length === 0) {
      const error = new Error('Product not found.');
      error.statusCode = 404;
      error.errorCode = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    // Update inventory if stock provided
    if (data.stock !== undefined) {
      await client.query(
        `UPDATE inventory
         SET stock = $1,
             low_stock_threshold = COALESCE($2, low_stock_threshold),
             updated_at = CURRENT_TIMESTAMP
         WHERE product_id = $3`,
        [data.stock, data.lowStockThreshold, id]
      );
    }

    await client.query('COMMIT');

    logAuditEvent({
      userId: adminUserId,
      action: 'UPDATE_PRODUCT',
      entityType: 'PRODUCT',
      entityId: id,
      newData: updateRes.rows[0]
    });

    return updateRes.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Soft delete or remove product
 */
const deleteProduct = async (id, adminUserId) => {
  const result = await query(
    `UPDATE products SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name`,
    [id]
  );

  if (result.rows.length === 0) {
    const error = new Error('Product not found.');
    error.statusCode = 404;
    error.errorCode = 'PRODUCT_NOT_FOUND';
    throw error;
  }

  logAuditEvent({
    userId: adminUserId,
    action: 'DELETE_PRODUCT',
    entityType: 'PRODUCT',
    entityId: id
  });

  return { success: true, message: 'Product successfully deactivated.' };
};

module.exports = {
  getProducts,
  getProductBySlugOrId,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct
};
