const { query, getClient } = require('../config/insforge');

/**
 * Get or create cart for user and calculate totals
 */
const getCart = async (userId) => {
  // Ensure cart exists
  let cartRes = await query('SELECT id FROM cart WHERE user_id = $1', [userId]);
  let cartId;

  if (cartRes.rows.length === 0) {
    const createRes = await query('INSERT INTO cart (user_id) VALUES ($1) RETURNING id', [userId]);
    cartId = createRes.rows[0].id;
  } else {
    cartId = cartRes.rows[0].id;
  }

  // Fetch cart items with live product prices and stock
  const itemsSql = `
    SELECT 
      ci.id AS item_id,
      ci.quantity,
      ci.created_at,
      p.id AS product_id,
      p.name,
      p.slug,
      p.sku,
      p.price,
      p.compare_at_price,
      p.is_active,
      COALESCE(pi.image_url, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80') AS image_url,
      COALESCE(inv.stock, 0) AS stock,
      (ci.quantity * p.price) AS item_total
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
    LEFT JOIN inventory inv ON p.id = inv.product_id
    WHERE ci.cart_id = $1
    ORDER BY ci.created_at DESC
  `;

  const itemsRes = await query(itemsSql, [cartId]);
  const items = itemsRes.rows;

  const subtotal = items.reduce((sum, item) => sum + Number(item.item_total), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Default tax (18% GST standard e-commerce rate) and shipping
  const estimatedTax = subtotal > 0 ? Number((subtotal * 0.18).toFixed(2)) : 0;
  const estimatedShipping = subtotal > 5000 || subtotal === 0 ? 0 : 250;
  const grandTotal = Number((subtotal + estimatedTax + estimatedShipping).toFixed(2));

  return {
    cartId,
    items,
    itemCount,
    subtotal: Number(subtotal.toFixed(2)),
    estimatedTax,
    estimatedShipping,
    grandTotal
  };
};

/**
 * Add product to user cart
 */
const addToCart = async (userId, productId, quantity = 1) => {
  if (quantity < 1) {
    const error = new Error('Quantity must be at least 1.');
    error.statusCode = 400;
    error.errorCode = 'INVALID_QUANTITY';
    throw error;
  }

  // Verify product exists and has stock
  const prodRes = await query(
    `SELECT p.id, p.name, p.price, p.is_active, COALESCE(inv.stock, 0) AS stock
     FROM products p
     LEFT JOIN inventory inv ON p.id = inv.product_id
     WHERE p.id = $1`,
    [productId]
  );

  if (prodRes.rows.length === 0 || !prodRes.rows[0].is_active) {
    const error = new Error('Product not found or unavailable.');
    error.statusCode = 404;
    error.errorCode = 'PRODUCT_NOT_FOUND';
    throw error;
  }

  const product = prodRes.rows[0];

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Get or create cart
    let cartRes = await client.query('SELECT id FROM cart WHERE user_id = $1', [userId]);
    let cartId;
    if (cartRes.rows.length === 0) {
      const createRes = await client.query('INSERT INTO cart (user_id) VALUES ($1) RETURNING id', [userId]);
      cartId = createRes.rows[0].id;
    } else {
      cartId = cartRes.rows[0].id;
    }

    // Check existing cart item
    const existingItemRes = await client.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, productId]
    );

    const currentQty = existingItemRes.rows.length > 0 ? existingItemRes.rows[0].quantity : 0;
    const requestedQty = currentQty + quantity;

    if (requestedQty > product.stock) {
      const error = new Error(`Only ${product.stock} units available in stock.`);
      error.statusCode = 400;
      error.errorCode = 'INSUFFICIENT_STOCK';
      throw error;
    }

    if (existingItemRes.rows.length > 0) {
      await client.query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [requestedQty, existingItemRes.rows[0].id]
      );
    } else {
      await client.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
        [cartId, productId, quantity]
      );
    }

    await client.query('COMMIT');
    return await getCart(userId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update item quantity in cart
 */
const updateCartItem = async (userId, itemId, quantity) => {
  if (quantity <= 0) {
    return await removeFromCart(userId, itemId);
  }

  const itemRes = await query(
    `SELECT ci.id, ci.product_id, COALESCE(inv.stock, 0) AS stock
     FROM cart_items ci
     JOIN cart c ON ci.cart_id = c.id
     JOIN products p ON ci.product_id = p.id
     LEFT JOIN inventory inv ON p.id = inv.product_id
     WHERE ci.id = $1 AND c.user_id = $2`,
    [itemId, userId]
  );

  if (itemRes.rows.length === 0) {
    const error = new Error('Cart item not found.');
    error.statusCode = 404;
    error.errorCode = 'ITEM_NOT_FOUND';
    throw error;
  }

  const { stock } = itemRes.rows[0];
  if (quantity > stock) {
    const error = new Error(`Cannot update quantity. Only ${stock} units available.`);
    error.statusCode = 400;
    error.errorCode = 'INSUFFICIENT_STOCK';
    throw error;
  }

  await query(
    'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [quantity, itemId]
  );

  return await getCart(userId);
};

/**
 * Remove an item from cart
 */
const removeFromCart = async (userId, itemId) => {
  await query(
    `DELETE FROM cart_items
     WHERE id = $1 AND cart_id IN (SELECT id FROM cart WHERE user_id = $2)`,
    [itemId, userId]
  );

  return await getCart(userId);
};

/**
 * Clear all items from user cart
 */
const clearCart = async (userId) => {
  await query(
    `DELETE FROM cart_items
     WHERE cart_id IN (SELECT id FROM cart WHERE user_id = $1)`,
    [userId]
  );

  return { success: true, message: 'Cart cleared successfully.' };
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
