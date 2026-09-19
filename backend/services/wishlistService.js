const { query } = require('../config/insforge');

/**
 * Get user's wishlist
 */
const getWishlist = async (userId) => {
  let listRes = await query('SELECT id FROM wishlists WHERE user_id = $1', [userId]);
  let wishlistId;

  if (listRes.rows.length === 0) {
    const createRes = await query('INSERT INTO wishlists (user_id) VALUES ($1) RETURNING id', [userId]);
    wishlistId = createRes.rows[0].id;
  } else {
    wishlistId = listRes.rows[0].id;
  }

  const sql = `
    SELECT 
      wi.id AS item_id,
      wi.created_at,
      p.id AS product_id,
      p.name,
      p.slug,
      p.price,
      p.compare_at_price,
      p.rating,
      p.review_count,
      p.is_active,
      COALESCE(pi.image_url, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80') AS image_url,
      COALESCE(inv.stock, 0) AS stock
    FROM wishlist_items wi
    JOIN products p ON wi.product_id = p.id
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
    LEFT JOIN inventory inv ON p.id = inv.product_id
    WHERE wi.wishlist_id = $1
    ORDER BY wi.created_at DESC
  `;

  const itemsRes = await query(sql, [wishlistId]);
  return {
    wishlistId,
    items: itemsRes.rows,
    totalItems: itemsRes.rows.length
  };
};

/**
 * Add product to wishlist
 */
const addToWishlist = async (userId, productId) => {
  let listRes = await query('SELECT id FROM wishlists WHERE user_id = $1', [userId]);
  let wishlistId;

  if (listRes.rows.length === 0) {
    const createRes = await query('INSERT INTO wishlists (user_id) VALUES ($1) RETURNING id', [userId]);
    wishlistId = createRes.rows[0].id;
  } else {
    wishlistId = listRes.rows[0].id;
  }

  await query(
    `INSERT INTO wishlist_items (wishlist_id, product_id)
     VALUES ($1, $2)
     ON CONFLICT (wishlist_id, product_id) DO NOTHING`,
    [wishlistId, productId]
  );

  return await getWishlist(userId);
};

/**
 * Remove product from wishlist
 */
const removeFromWishlist = async (userId, productId) => {
  await query(
    `DELETE FROM wishlist_items
     WHERE product_id = $1 AND wishlist_id IN (SELECT id FROM wishlists WHERE user_id = $2)`,
    [productId, userId]
  );

  return await getWishlist(userId);
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
