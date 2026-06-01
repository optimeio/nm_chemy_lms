const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  category: { type: String, required: true },
  icon: { type: String, default: 'fa-box' },
  isNewArrival: { type: Boolean, default: false },
  images: [{ type: String }], // Array of base64 strings or URLs
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
