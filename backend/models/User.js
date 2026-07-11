const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String },
  institution: { type: String },
  department: { type: String },
  registerNo: { type: String },
  role: { type: String, enum: ['student', 'admin', 'trainer'], default: 'student' },
  bio: { type: String },
  profileImage: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
