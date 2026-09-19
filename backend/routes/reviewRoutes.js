const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
const { requireAuth } = require('../middleware/auth');

router.get('/', reviewController.getProductReviews);
router.post('/', requireAuth, reviewController.addReview);

module.exports = router;
