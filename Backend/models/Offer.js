const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  code: { type: String, required: true },
  poster: { type: String } // Base64 string or URL
});

module.exports = mongoose.model('Offer', offerSchema);
