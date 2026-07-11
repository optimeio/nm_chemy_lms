const mongoose = require('mongoose');

const liveSessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  trainer: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  link: { type: String },
  topic: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('LiveSession', liveSessionSchema);
