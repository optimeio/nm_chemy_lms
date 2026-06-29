const express = require('express');
const { body } = require('express-validator');
const heroBannerController = require('../controllers/heroBannerController');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', heroBannerController.getHeroBanners);
router.post('/',
  [
    body('image').notEmpty().withMessage('Image URL is required')
  ],
  validateRequest,
  heroBannerController.createHeroBanner
);
router.delete('/:id', heroBannerController.deleteHeroBanner);

module.exports = router;
