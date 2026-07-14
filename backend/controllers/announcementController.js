const Announcement = require('../models/Announcement');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

// Get all announcements (paginated)
exports.getAnnouncements = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, sort = 'newest' } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { visibility: { $in: ['all', 'students'] } };
    if (type) {
      filter.type = type;
    }

    // Sort options
    const sortOptions = {
      'newest': { createdAt: -1 },
      'oldest': { createdAt: 1 },
      'pinned': { isPinned: -1, createdAt: -1 }
    };

    const announcements = await Announcement.find(filter)
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Announcement.countDocuments(filter);

    res.json({
      success: true,
      data: announcements,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching announcements:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch announcements', error: err.message });
  }
};

// Get single announcement
exports.getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id)
      .populate('author', 'fullName email');

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    // Mark as read
    const userId = req.userId;
    const isRead = announcement.readBy.some(r => r.userId.toString() === userId);
    if (!isRead) {
      announcement.readBy.push({ userId });
      await announcement.save();
    }

    res.json({ success: true, data: announcement });
  } catch (err) {
    console.error('Error fetching announcement:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch announcement', error: err.message });
  }
};

// Create announcement (Admin/Trainer only)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, description, category, authorName, visibility, courseId, content, imageUrl, attachments } = req.body;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const announcement = new Announcement({
      title,
      description,
      category,
      author: req.userId,
      authorName: authorName || 'Admin',
      visibility: visibility || 'all',
      courseId: courseId || null,
      content: content || description,
      imageUrl,
      attachments: attachments || []
    });

    await announcement.save();
    res.status(201).json({ success: true, data: announcement, message: 'Announcement created successfully' });
  } catch (err) {
    console.error('Error creating announcement:', err);
    res.status(500).json({ success: false, message: 'Failed to create announcement', error: err.message });
  }
};

// Update announcement (Admin/Trainer only)
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, authorName, visibility, courseId, content, imageUrl, attachments } = req.body;

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      {
        title,
        description,
        category,
        authorName,
        visibility,
        courseId,
        content,
        imageUrl,
        attachments,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.json({ success: true, data: announcement, message: 'Announcement updated successfully' });
  } catch (err) {
    console.error('Error updating announcement:', err);
    res.status(500).json({ success: false, message: 'Failed to update announcement', error: err.message });
  }
};

// Delete announcement (Admin/Trainer only)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (err) {
    console.error('Error deleting announcement:', err);
    res.status(500).json({ success: false, message: 'Failed to delete announcement', error: err.message });
  }
};

// Toggle pin status
exports.togglePin = async (req, res) => {
  try {
    const { id } = req.params;
    const { pinned } = req.body;

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { isPinned: pinned },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.json({ success: true, data: announcement, pinned: announcement.isPinned });
  } catch (err) {
    console.error('Error toggling pin:', err);
    res.status(500).json({ success: false, message: 'Failed to toggle pin', error: err.message });
  }
};

// Get announcement read stats (Admin only)
exports.getAnnouncementStats = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id)
      .populate('readBy.userId', 'fullName email');

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.json({
      success: true,
      data: {
        announcementId: announcement._id,
        title: announcement.title,
        totalViews: announcement.readBy.length,
        readers: announcement.readBy.map(r => ({
          userId: r.userId._id,
          userName: r.userId.fullName,
          readAt: r.readAt
        }))
      }
    });
  } catch (err) {
    console.error('Error fetching announcement stats:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch stats', error: err.message });
  }
};

// FEEDBACK ENDPOINTS

// Get all feedback (Admin only)
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbackList = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbackList);
  } catch (err) {
    console.error('[FEEDBACK] Error fetching feedback:', err);
    res.status(500).json({ message: 'Failed to fetch feedback', error: err.message });
  }
};

// Submit feedback (Student)
exports.submitFeedback = async (req, res) => {
  try {
    const { student, email, rating, text, message } = req.body;
    
    console.log('\n=== FEEDBACK SUBMISSION DEBUG ===');
    console.log('Request Method:', req.method);
    console.log('Request URL:', req.originalUrl);
    console.log('Request Body:', req.body);
    console.log('Request Headers:', req.headers);
    console.log('Request IP:', req.ip);
    
    // Validation
    if (!student || !email || !rating) {
      console.log('❌ Validation failed - Missing required fields');
      console.log('Student:', student, '| Email:', email, '| Rating:', rating);
      return res.status(400).json({ 
        message: 'Missing required fields',
        received: { student, email, rating }
      });
    }

    // Validate rating enum
    const validRatings = ['great', 'okay', 'needs_work'];
    if (!validRatings.includes(rating)) {
      console.log('❌ Invalid rating:', rating);
      return res.status(400).json({ 
        message: 'Invalid rating. Must be: great, okay, or needs_work',
        receivedRating: rating
      });
    }

    console.log('✅ Validation passed');
    console.log('Creating Feedback document with:', { student, email, rating });

    const feedback = new Feedback({
      student,
      email,
      userId: req.userId || null,
      rating,
      text: text || message || '',
      message: message || text || ''
    });

    console.log('Feedback object created:', feedback);

    const savedFeedback = await feedback.save();
    console.log('✅ Feedback saved to MongoDB');
    console.log('Saved Feedback ID:', savedFeedback._id);
    console.log('Saved Feedback:', savedFeedback);

    res.status(201).json({ 
      message: 'Feedback submitted successfully', 
      data: savedFeedback 
    });
  } catch (err) {
    console.error('❌ Error submitting feedback:', err);
    console.error('Error Stack:', err.stack);
    res.status(500).json({ 
      message: 'Failed to submit feedback', 
      error: err.message 
    });
  }
};

// Reply to feedback (Admin only)
exports.replyToFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply } = req.body;

    console.log('[FEEDBACK] Adding reply to feedback:', id);

    if (!adminReply) {
      return res.status(400).json({ message: 'Reply text required' });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      {
        adminReply,
        adminReplyAt: new Date()
      },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    console.log('[FEEDBACK] Reply added successfully:', id);
    res.json(feedback);
  } catch (err) {
    console.error('[FEEDBACK] Error replying to feedback:', err);
    res.status(500).json({ message: 'Failed to reply to feedback', error: err.message });
  }
};

// Delete feedback (Admin only)
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findByIdAndDelete(id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    console.log('[FEEDBACK] Feedback deleted:', id);
    res.json({ message: 'Feedback deleted successfully' });
  } catch (err) {
    console.error('[FEEDBACK] Error deleting feedback:', err);
    res.status(500).json({ message: 'Failed to delete feedback', error: err.message });
  }
};
