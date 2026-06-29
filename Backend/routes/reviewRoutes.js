const express = require('express');
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router({ mergeParams: true });

router.get('/', reviewController.getReviewsForProduct);
router.post('/',
  [
    body('customerName').notEmpty().withMessage('Customer name is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').notEmpty().withMessage('Comment is required')
  ],
  validateRequest,
  reviewController.createReview
);
router.delete('/:reviewId', reviewController.deleteReview);

module.exports = router;
