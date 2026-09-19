const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');

router.get('/', categoryController.getCategories);
router.post('/', requireAuth, requireRole('ADMIN'), categoryController.createCategory);

module.exports = router;
