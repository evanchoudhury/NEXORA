const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');

// SSR views (invoice can be viewed by admin or token in query)
router.get('/invoices/:id', adminController.renderInvoice);
router.get('/reports/sales', adminController.renderAdminReport);

// REST Admin APIs
router.use(requireAuth);
router.use(requireRole('ADMIN', 'MANAGER'));

router.get('/stats', adminController.getDashboardStats);
router.get('/users', requireRole('ADMIN'), adminController.getAllUsers);
router.put('/users/:userId/role', requireRole('ADMIN'), adminController.updateUserRole);
router.get('/orders', adminController.getAllOrders);

module.exports = router;
