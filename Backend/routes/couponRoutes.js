const express = require('express');
const { body } = require('express-validator');
const couponController = require('../controllers/couponController');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', couponController.getCoupons);
router.post('/',
  [
    body('code').notEmpty().withMessage('Coupon code is required'),
    body('discountValue').isNumeric().withMessage('Discount value is required'),
    body('expiryDate').isISO8601().withMessage('Valid expiry date is required')
  ],
  validateRequest,
  couponController.createCoupon
);
router.patch('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

module.exports = router;
