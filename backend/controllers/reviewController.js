const reviewService = require('../services/reviewService');

const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await reviewService.getProductReviews(req.params.productId);
    res.status(200).json({
      success: true,
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
};

const addReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;
    const review = await reviewService.addReview({
      productId: req.params.productId,
      userId: req.user.id,
      rating,
      title,
      comment
    });

    res.status(201).json({
      success: true,
      message: 'Review posted successfully.',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  addReview
};
