const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const User = require('../models/User');
const HackathonImage = require('../models/HackathonImage');
const Hackathon = require('../models/Hackathon');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads', 'hackathon');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `${Date.now()}-${basename}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get all hackathons (Admin only)
router.get('/all', auth, requireAdmin, async (req, res) => {
  try {
    const hackathons = await Hackathon.find().sort({ createdAt: -1 });
    res.json(hackathons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active assigned hackathon for current student
router.get('/active', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Fetch published hackathons
    const allPublished = await Hackathon.find({ published: true }).sort({ createdAt: -1 });

    // Filter hackathons matching target audience (college, department, studentEmail, trainerEmail)
    const filtered = allPublished.filter((h) => {
      // If no targets are set, make it public by default
      const noCollege = !h.targetCollege || h.targetCollege.trim() === "";
      const noDept = !h.targetDepartment || h.targetDepartment.trim() === "";
      const noStudent = !h.targetStudentEmail || h.targetStudentEmail.trim() === "";
      const noTrainer = !h.targetTrainerEmail || h.targetTrainerEmail.trim() === "";

      if (noCollege && noDept && noStudent && noTrainer) {
        return true;
      }

      // Check college match
      if (h.targetCollege && h.targetCollege.trim() !== "") {
        const userInst = user.institution || "";
        if (userInst.toLowerCase() !== h.targetCollege.toLowerCase()) {
          return false;
        }
      }

      // Check department match
      if (h.targetDepartment && h.targetDepartment.trim() !== "") {
        const userDept = user.department || "";
        if (userDept.toLowerCase() !== h.targetDepartment.toLowerCase()) {
          return false;
        }
      }

      // Check specific student/trainer email matches (comma-separated lists)
      const email = (user.email || "").toLowerCase().trim();
      
      if (h.targetStudentEmail && h.targetStudentEmail.trim() !== "") {
        const studentEmails = h.targetStudentEmail.toLowerCase().split(',').map(e => e.trim());
        if (!studentEmails.includes(email)) {
          return false;
        }
      }

      if (h.targetTrainerEmail && h.targetTrainerEmail.trim() !== "") {
        const trainerEmails = h.targetTrainerEmail.toLowerCase().split(',').map(e => e.trim());
        if (!trainerEmails.includes(email)) {
          return false;
        }
      }

      return true;
    });

    res.json(filtered[0] || null); // Return the latest active hackathon
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create Hackathon (Admin only)
router.post('/create', auth, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const hackathon = await Hackathon.create(data);
    res.status(201).json(hackathon);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Hackathon (Admin only)
router.put('/update/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await Hackathon.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return res.status(404).json({ message: 'Hackathon not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Hackathon (Admin only)
router.delete('/delete/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Hackathon.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Hackathon not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Existing Image Upload Routes
router.get('/images', async (req, res) => {
  try {
    const images = await HackathonImage.find().sort({ uploadedAt: -1 }).limit(10);
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/images', auth, requireAdmin, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const images = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      url: `/uploads/hackathon/${file.filename}`,
    }));

    const docs = await HackathonImage.create(images);
    res.status(201).json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/images/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const image = await HackathonImage.findById(id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Delete file if exists
    const filePath = path.join(__dirname, '..', 'uploads', 'hackathon', image.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    await HackathonImage.findByIdAndDelete(id);
    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
