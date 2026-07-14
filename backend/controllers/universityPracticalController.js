const UniversityPractical = require('../models/UniversityPractical');

// Initialize records with default data (12 days)
const initializeRecords = async (userId) => {
  const existingCount = await UniversityPractical.countDocuments();
  if (existingCount === 0) {
    const records = Array.from({ length: 12 }, (_, i) => {
      const day = i + 1;
      const date = new Date(2026, 7, 3 + i); // Aug 3, 2026 onward
      return {
        day,
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: day % 2 === 0 ? "2:00 PM – 5:00 PM" : "9:00 AM – 12:00 PM",
        venue: ["Chemistry Lab A", "Chemistry Lab B", "Main Auditorium", "Research Block, Room 214"][day % 4],
        lastModifiedBy: null // System initialization - no user
      };
    });
    await UniversityPractical.insertMany(records);
  }
};

// Get all examination records
exports.getAllRecords = async (req, res) => {
  try {
    const records = await UniversityPractical.find().sort({ day: 1 });
    
    // Map records to exclude binary PDF data, return URL references instead
    const mappedRecords = records.map(record => ({
      id: record._id,
      day: record.day,
      date: record.date,
      time: record.time,
      venue: record.venue,
      hasPdf: !!record.pdfFile?.data,
      pdfName: record.pdfFile?.originalName || null,
      pdfSize: record.pdfFile?.size || null,
      publishedAt: record.publishedAt
    }));
    
    res.json(mappedRecords);
  } catch (err) {
    console.error('Error fetching records:', err);
    res.status(500).json({ message: 'Error fetching records' });
  }
};

// Get single record with PDF data
exports.getRecordWithPdf = async (req, res) => {
  try {
    const { recordId } = req.params;
    const record = await UniversityPractical.findById(recordId);
    
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    
    if (!record.pdfFile?.data) {
      return res.status(404).json({ message: 'No PDF available for this record' });
    }
    
    // Send PDF with proper headers
    res.setHeader('Content-Type', record.pdfFile.mimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${record.pdfFile.originalName}"`);
    res.setHeader('Content-Length', record.pdfFile.data.length);
    res.send(record.pdfFile.data);
  } catch (err) {
    console.error('Error fetching PDF:', err);
    res.status(500).json({ message: 'Error fetching PDF' });
  }
};

// Upload or update PDF for a record (Admin only)
exports.uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'Only PDF files are allowed' });
    }
    
    const { recordId } = req.params;
    const record = await UniversityPractical.findById(recordId);
    
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    
    // Update the record with new PDF
    record.pdfFile = {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer,
      uploadedAt: new Date()
    };
    record.lastModifiedBy = req.userId;
    record.updatedAt = new Date();
    
    await record.save();
    
    res.json({
      message: 'PDF uploaded successfully',
      record: {
        id: record._id,
        day: record.day,
        pdfName: record.pdfFile.originalName,
        pdfSize: record.pdfFile.size
      }
    });
  } catch (err) {
    console.error('Error uploading PDF:', err);
    res.status(500).json({ message: 'Error uploading PDF' });
  }
};

// Delete PDF for a record (Admin only)
exports.deletePdf = async (req, res) => {
  try {
    const { recordId } = req.params;
    const record = await UniversityPractical.findById(recordId);
    
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    
    record.pdfFile = null;
    record.lastModifiedBy = req.userId;
    record.updatedAt = new Date();
    
    await record.save();
    
    res.json({ message: 'PDF deleted successfully' });
  } catch (err) {
    console.error('Error deleting PDF:', err);
    res.status(500).json({ message: 'Error deleting PDF' });
  }
};

module.exports.initializeRecords = initializeRecords;
