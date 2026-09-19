const blockchainService = require('../services/blockchainService');

const getCryptoQuote = async (req, res, next) => {
  try {
    const { fiatAmount } = req.query;
    if (!fiatAmount || isNaN(fiatAmount)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Valid fiatAmount in INR is required.' }
      });
    }

    const quote = blockchainService.calculateCryptoAmount(Number(fiatAmount));
    res.status(200).json({
      success: true,
      data: quote
    });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, transactionHash, walletAddress } = req.body;
    const result = await blockchainService.verifyBlockchainPayment({
      orderId,
      transactionHash,
      walletAddress,
      userId: req.user?.id
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getTransaction = async (req, res, next) => {
  try {
    const tx = await blockchainService.getTransactionByHash(req.params.hash);
    res.status(200).json({
      success: true,
      data: { transaction: tx }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCryptoQuote,
  verifyPayment,
  getTransaction
};
