const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', categoryController.getCategories);
router.post('/',
  [
    body('name').notEmpty().withMessage('Category name is required'),
    body('slug').optional().isString()
  ],
  validateRequest,
  categoryController.createCategory
);
router.put('/:id',
  [
    body('name').notEmpty().withMessage('Category name is required'),
    body('slug').optional().isString()
  ],
  validateRequest,
  categoryController.updateCategory
);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
