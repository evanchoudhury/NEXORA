const orderService = require('../services/orderService');

const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder({
      userId: req.user.id,
      shippingAddress: req.body.shippingAddress,
      billingAddress: req.body.billingAddress,
      paymentMethod: req.body.paymentMethod,
      couponCode: req.body.couponCode,
      notes: req.body.notes
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getUserOrders(req.user.id);
    res.status(200).json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(
      req.params.id,
      req.user?.id,
      req.user?.roles || []
    );

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const updated = await orderService.updateOrderStatus(
      req.params.id,
      req.body,
      req.user?.id
    );

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully.',
      data: { order: updated }
    });
  } catch (error) {
    next(error);
  }
};

const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    const result = await orderService.validateCoupon(code, Number(subtotal) || 0);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  validateCoupon
};
