const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  edition: { type: String, default: 'Naan Mudhalvan · 2026 Edition' },
  description: { type: String },
  eventDate: { type: Date, default: Date.now },
  stats: [
    {
      label: { type: String },
      value: { type: String },
    }
  ],
  timeline: [
    {
      day: { type: String },
      time: { type: String },
      title: { type: String },
      desc: { type: String },
    }
  ],
  venue: { type: String },
  targetCollege: { type: String },
  targetDepartment: { type: String },
  targetStudentEmail: { type: String },
  targetTrainerEmail: { type: String },
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Hackathon', hackathonSchema);
