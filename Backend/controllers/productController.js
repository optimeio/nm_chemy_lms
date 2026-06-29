const Product = require('../models/Product');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../middleware/asyncHandler');
const fs = require('fs');
const path = require('path');

const normalizeProductPayload = (payload = {}) => {
  const normalized = { ...payload };
  if (Array.isArray(payload.images)) {
    normalized.images = payload.images.filter(Boolean).map((image) => String(image));
  } else if (payload.images) {
    normalized.images = [String(payload.images)];
  } else {
    normalized.images = [];
  }
  return normalized;
};

const serializeProduct = (product) => {
  if (!product) return product;
  const plainProduct = product.toJSON ? product.toJSON() : { ...product };
  return {
    ...plainProduct,
    images: Array.isArray(plainProduct.images)
      ? plainProduct.images.filter(Boolean).map((image) => String(image))
      : []
  };
};

const fallbackProducts = [
  {
    _id: 'fallback-rocket-stove',
    name: 'Rocket Stove',
    price: '₹3,999',
    category: 'Stoves',
    icon: 'fa-fire',
    isNewArrival: true,
    images: ['/rocket-stove.png'],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'fallback-10-stove',
    name: '10" Stove',
    price: '₹4,499',
    category: 'Stoves',
    icon: 'fa-burn',
    images: ['/hero-image.png'],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'fallback-rocket-stove-pro',
    name: 'Rocket Stove Pro',
    price: '₹5,499',
    category: 'Stoves',
    icon: 'fa-fire-flame-simple',
    images: ['/rocket-stove.png'],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'fallback-stove-plate-kit',
    name: 'Stove Cooking Plate Kit',
    price: '₹1,299',
    category: 'Stoves',
    icon: 'fa-hot-tub-person',
    images: ['/hero-image.png'],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'fallback-home-kit',
    name: 'Home Appliance Starter Kit',
    price: '₹1,999',
    category: 'Home Appliances',
    icon: 'fa-house',
    images: ['/hero-banner.png'],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'fallback-engraining',
    name: 'Engraining Premium Pack',
    price: '₹2,999',
    category: 'Engraining Products',
    icon: 'fa-screwdriver-wrench',
    images: ['/rocket-stove.png'],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'fallback-welding',
    name: 'SriTech Welding Torch',
    price: '₹2,499',
    category: 'Welding Products',
    icon: 'fa-fire-flame-curved',
    isNewArrival: true,
    images: ['/hero-image.png'],
    createdAt: new Date().toISOString()
  }
];

const getProductsFromStore = async () => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    if (Array.isArray(products) && products.length > 0) {
      return products.map((product) => serializeProduct(product));
    }
  } catch (err) {
    console.warn('Product store unavailable, using fallback catalog:', err.message);
  }

  return fallbackProducts;
};

exports.getProducts = asyncHandler(async (req, res) => {
  const products = await getProductsFromStore();
  res.json(products);
});

exports.getProductById = asyncHandler(async (req, res) => {
  let product = null;
  try {
    product = await Product.findById(req.params.id);
  } catch (err) {
    console.warn('Product lookup failed, using fallback product data:', err.message);
  }

  if (!product) {
    product = fallbackProducts.find(item => item._id === req.params.id);
  }

  if (!product) return res.status(404).json({ message: 'Product not found.' });
  res.json(serializeProduct(product));
});

exports.createProduct = asyncHandler(async (req, res) => {
  const payload = normalizeProductPayload(req.body);
  const product = new Product(payload);
  const saved = await product.save();
  await new ActivityLog({ action: 'Added Product', details: `Product: ${saved.name}` }).save();
  res.status(201).json(serializeProduct(saved));
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const payload = normalizeProductPayload(req.body);
  const product = await Product.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  await new ActivityLog({ action: 'Updated Product', details: `Product ${product.name} updated` }).save();
  res.json(serializeProduct(product));
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  await new ActivityLog({ action: 'Deleted Product', details: `Product ${product.name} deleted permanently` }).save();
  res.json({ message: 'Product deleted successfully.' });
});
