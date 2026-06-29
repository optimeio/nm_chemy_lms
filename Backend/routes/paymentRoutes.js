const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get('/get-key', paymentController.getKey);

router.post('/create-order',
  [
    body('amount').isNumeric().withMessage('Amount is required'),
    body('currency').optional().isString(),
    body('receipt').optional().isString()
  ],
  validateRequest,
  paymentController.createPaymentOrder
);

router.post('/verify',
  [
    body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
    body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
    body('razorpay_signature').notEmpty().withMessage('Signature is required')
  ],
  validateRequest,
  paymentController.verifyPayment
);

module.exports = router;
