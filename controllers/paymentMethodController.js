const PaymentMethod = require('../models/PaymentMethod');

exports.createPaymentMethod = async (req, res) => {
  try {
    const { method_type, card_number, expiration_date, security_code } = req.body;

    const paymentMethod = new PaymentMethod({
      user: req.user.user_id,
      method_type,
      card_number,
      expiration_date,
      security_code,
    });
    await paymentMethod.save();

    res.status(201).json(paymentMethod);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getUserPaymentMethods = async (req, res) => {
  try {
    const methods = await PaymentMethod.find({ user: req.user.user_id });
    res.status(200).json(methods);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updatePaymentMethod = async (req, res) => {
  try {
    const { method_type, card_number, expiration_date, security_code } = req.body;
    const method = await PaymentMethod.findById(req.params.id);

    if (!method) return res.status(404).json({ message: 'Payment method not found.' });

    // Kiểm tra quyền truy cập
    if (method.user.toString() !== req.user.user_id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    method.method_type = method_type || method.method_type;
    method.card_number = card_number || method.card_number;
    method.expiration_date = expiration_date || method.expiration_date;
    method.security_code = security_code || method.security_code;

    await method.save();
    res.status(200).json(method);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.deletePaymentMethod = async (req, res) => {
  try {
    const method = await PaymentMethod.findById(req.params.id);
    if (!method) return res.status(404).json({ message: 'Payment method not found.' });

    // Kiểm tra quyền truy cập
    if (method.user.toString() !== req.user.user_id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    await method.remove();
    res.status(200).json({ message: 'Payment method deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};
