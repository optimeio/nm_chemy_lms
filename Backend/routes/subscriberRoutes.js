const express = require('express');
const { body } = require('express-validator');
const subscriberController = require('../controllers/subscriberController');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.post('/',
  [
    body('email').isEmail().withMessage('Valid email is required')
  ],
  validateRequest,
  subscriberController.createSubscriber
);
router.get('/', subscriberController.getSubscribers);
router.delete('/:id', subscriberController.deleteSubscriber);

module.exports = router;
