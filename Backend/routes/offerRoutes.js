const express = require('express');
const { body } = require('express-validator');
const offerController = require('../controllers/offerController');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', offerController.getOffer);
router.post('/',
  [
    body('title').notEmpty().withMessage('Offer title is required'),
    body('description').notEmpty().withMessage('Offer description is required'),
    body('code').notEmpty().withMessage('Offer code is required')
  ],
  validateRequest,
  offerController.upsertOffer
);

module.exports = router;
