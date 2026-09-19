const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductByIdOrSlug);

// Protected Admin/Manager routes
router.post('/', requireAuth, requireRole('ADMIN', 'MANAGER'), productController.createProduct);
router.put('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), productController.updateProduct);
router.delete('/:id', requireAuth, requireRole('ADMIN'), productController.deleteProduct);

module.exports = router;
