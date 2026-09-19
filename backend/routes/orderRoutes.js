const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');

router.post('/validate-coupon', optionalAuth, orderController.validateCoupon);

router.use(requireAuth);

router.post('/', orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', requireRole('ADMIN', 'MANAGER'), orderController.updateOrderStatus);

module.exports = router;
