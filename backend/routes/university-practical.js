const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const controller = require('../controllers/universityPracticalController');

// Configure multer for in-memory storage (PDF data stored in DB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Only PDF files are allowed'));
    } else {
      cb(null, true);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Get all examination records (public - students can view)
router.get('/', controller.getAllRecords);

// Get PDF for a specific record (public - students can download)
router.get('/:recordId/pdf', controller.getRecordWithPdf);

// Upload/Update PDF for a record (Admin only)
router.post('/:recordId/pdf', auth, upload.single('pdf'), controller.uploadPdf);

// Delete PDF for a record (Admin only)
router.delete('/:recordId/pdf', auth, controller.deletePdf);

module.exports = router;
