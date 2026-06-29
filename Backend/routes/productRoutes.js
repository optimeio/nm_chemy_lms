const express = require('express');
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/',
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('price').notEmpty().withMessage('Price is required'),
    body('category').notEmpty().withMessage('Category is required')
  ],
  validateRequest,
  productController.createProduct
);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
