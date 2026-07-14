const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  student: { type: String, required: true },
  email: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: String, enum: ['great', 'okay', 'needs_work'], required: true },
  text: { type: String, default: '' },
  message: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  adminReply: { type: String, default: null },
  adminReplyAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
