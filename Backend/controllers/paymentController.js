const razorpay = require('../services/razorpayService');
const asyncHandler = require('../middleware/asyncHandler');

exports.getKey = asyncHandler(async (req, res) => {
  const key = process.env.RAZORPAY_KEY_ID;
  if (!key) {
    return res.status(503).json({ message: 'Razorpay key is not configured.' });
  }
  res.json({ key });
});

exports.createPaymentOrder = asyncHandler(async (req, res) => {
  if (!razorpay) {
    return res.status(503).json({ message: 'Payment service is not available. Razorpay credentials are not configured.' });
  }

  const { amount, currency = 'INR', receipt } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'A valid amount is required to create a payment order.' });
  }

  const options = {
    amount: Math.round(amount * 100),
    currency,
    receipt: receipt || `order_rcptid_${Date.now()}`
  };

  const order = await razorpay.orders.create(options);
  res.status(201).json(order);
});

exports.verifyPayment = asyncHandler(async (req, res) => {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ message: 'Payment service is not available. Razorpay credentials are not configured.' });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: 'Missing Razorpay payment response fields.' });
  }

  const generatedSignature = require('crypto')
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const isValid = generatedSignature === razorpay_signature;

  if (!isValid) {
    return res.status(400).json({
      message: 'Payment verification failed.',
      verified: false,
      razorpay_order_id,
      razorpay_payment_id
    });
  }

  res.json({
    message: 'Payment verified successfully.',
    verified: true,
    razorpay_order_id,
    razorpay_payment_id
  });
});
