const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
    trim: true
  },
  category: {
    type: String,
    enum: ['IMPORTANT', 'EVENT', 'COURSE', 'SYSTEM'],
    required: true
  },
  type: {
    type: String,
    enum: ['important', 'event', 'course', 'system']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  visibility: {
    type: String,
    enum: ['all', 'students', 'specific_course'],
    default: 'all'
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  },
  content: {
    type: String,
    default: ''
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  imageUrl: {
    type: String,
    default: null
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  expiresAt: {
    type: Date,
    default: null
  },
  readBy: [{
    userId: mongoose.Schema.Types.ObjectId,
    readAt: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Set type from category before saving
announcementSchema.pre('save', function(next) {
  const categoryMap = {
    'IMPORTANT': 'important',
    'EVENT': 'event',
    'COURSE': 'course',
    'SYSTEM': 'system'
  };
  this.type = categoryMap[this.category];
  next();
});

module.exports = mongoose.model('Announcement', announcementSchema);
