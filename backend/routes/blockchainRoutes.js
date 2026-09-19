const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

router.get('/quote', blockchainController.getCryptoQuote);
router.post('/verify', optionalAuth, blockchainController.verifyPayment);
router.get('/tx/:hash', blockchainController.getTransaction);

module.exports = router;
