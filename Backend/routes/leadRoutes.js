const express = require('express');
const { body } = require('express-validator');
const leadController = require('../controllers/leadController');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', leadController.getLeads);
router.post('/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('whatsapp').notEmpty().withMessage('WhatsApp number is required'),
    body('location').notEmpty().withMessage('Location is required')
  ],
  validateRequest,
  leadController.createLead
);

module.exports = router;
