const cartService = require('../services/cartService');

const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'productId is required.' }
      });
    }

    const cart = await cartService.addToCart(req.user.id, productId, parseInt(quantity, 10) || 1);
    res.status(200).json({
      success: true,
      message: 'Item added to cart.',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await cartService.updateCartItem(req.user.id, itemId, parseInt(quantity, 10));
    res.status(200).json({
      success: true,
      message: 'Cart updated.',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const cart = await cartService.removeFromCart(req.user.id, itemId);
    res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const result = await cartService.clearCart(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
