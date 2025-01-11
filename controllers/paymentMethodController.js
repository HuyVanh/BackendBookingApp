// controllers/paymentMethodController.js
const PaymentMethod = require('../models/PaymentMethod');

// Get all payment methods
exports.getAllPaymentMethods = async (req, res) => {
  try {
    const methods = await PaymentMethod.find({ is_active: true });
    console.log('Found payment methods:', methods);
    res.json(methods);
  } catch (error) {
    console.error('Error getting payment methods:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Create new payment method
exports.createPaymentMethod = async (req, res) => {
  try {
    const paymentMethod = new PaymentMethod(req.body);
    const newPaymentMethod = await paymentMethod.save();
    res.status(201).json(newPaymentMethod);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get payment method by ID
exports.getPaymentMethodById = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findById(req.params.id);
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }
    res.json(paymentMethod);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update payment method
exports.updatePaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findById(req.params.id);
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }
    Object.assign(paymentMethod, req.body);
    const updatedPaymentMethod = await paymentMethod.save();
    res.json(updatedPaymentMethod);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete payment method
exports.deletePaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findById(req.params.id);
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }
    await paymentMethod.remove();
    res.json({ message: 'Payment method deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;