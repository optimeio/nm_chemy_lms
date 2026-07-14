const mongoose = require('mongoose');

const universityPracticalSchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  pdfFile: {
    originalName: String,
    mimeType: String,
    size: Number,
    data: Buffer, // Store PDF as binary data
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UniversityPractical', universityPracticalSchema);
