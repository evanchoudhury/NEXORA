const { query, getClient } = require('../config/insforge');

/**
 * Get reviews for a product
 */
const getProductReviews = async (productId) => {
  const sql = `
    SELECT 
      r.id,
      r.rating,
      r.title,
      r.comment,
      r.is_verified_purchase,
      r.created_at,
      u.id AS user_id,
      u.name AS user_name,
      u.avatar_url AS user_avatar
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = $1 AND r.is_approved = TRUE
    ORDER BY r.created_at DESC
  `;

  const result = await query(sql, [productId]);
  return result.rows;
};

/**
 * Add or update review for product and update product average rating
 */
const addReview = async ({ productId, userId, rating, title, comment }) => {
  const parsedRating = parseInt(rating, 10);
  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    const error = new Error('Rating must be an integer between 1 and 5.');
    error.statusCode = 400;
    error.errorCode = 'INVALID_RATING';
    throw error;
  }

  if (!comment || comment.trim() === '') {
    const error = new Error('Review comment is required.');
    error.statusCode = 400;
    error.errorCode = 'VALIDATION_ERROR';
    throw error;
  }

  // Check if user has purchased this product
  const purchaseRes = await query(
    `SELECT oi.id
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     WHERE o.user_id = $1 AND oi.product_id = $2 AND o.payment_status = 'PAID'
     LIMIT 1`,
    [userId, productId]
  );
  const isVerified = purchaseRes.rows.length > 0;

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Insert or update review
    const reviewSql = `
      INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (product_id, user_id)
      DO UPDATE SET
        rating = EXCLUDED.rating,
        title = EXCLUDED.title,
        comment = EXCLUDED.comment,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const reviewRes = await client.query(reviewSql, [
      productId,
      userId,
      parsedRating,
      title || null,
      comment.trim(),
      isVerified
    ]);

    // Recalculate product rating and count
    const statsRes = await client.query(
      `SELECT AVG(rating)::numeric(3,2) as avg_rating, COUNT(*) as total_count
       FROM reviews
       WHERE product_id = $1 AND is_approved = TRUE`,
      [productId]
    );

    const avgRating = statsRes.rows[0].avg_rating || parsedRating;
    const reviewCount = statsRes.rows[0].total_count || 1;

    await client.query(
      `UPDATE products
       SET rating = $1, review_count = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [avgRating, reviewCount, productId]
    );

    await client.query('COMMIT');
    return reviewRes.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  getProductReviews,
  addReview
};
