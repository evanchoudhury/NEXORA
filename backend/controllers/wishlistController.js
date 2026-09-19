const wishlistService = require('../services/wishlistService');

const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.getWishlist(req.user.id);
    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    next(error);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'productId is required.' }
      });
    }

    const wishlist = await wishlistService.addToWishlist(req.user.id, productId);
    res.status(200).json({
      success: true,
      message: 'Item added to wishlist.',
      data: wishlist
    });
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const wishlist = await wishlistService.removeFromWishlist(req.user.id, productId);
    res.status(200).json({
      success: true,
      message: 'Item removed from wishlist.',
      data: wishlist
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
