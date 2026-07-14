const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const announcementController = require('../controllers/announcementController');

// DEBUG: Log route registration
console.log('\n✅ Announcements routes being registered');

// FEEDBACK ROUTES (must be before /:id catch-all routes)
// Get all feedback (Admin only)
router.get('/feedback', auth, announcementController.getAllFeedback);

// Submit feedback (anyone can submit)
router.post('/feedback/submit', (req, res, next) => {
  console.log('\n🔵 [ROUTE] POST /api/announcements/feedback/submit received');
  console.log('   Body:', JSON.stringify(req.body).substring(0, 100) + '...');
  console.log('   Content-Type:', req.get('Content-Type'));
  next();
}, announcementController.submitFeedback);

// Reply to feedback (Admin only)
router.post('/feedback/:id/reply', auth, announcementController.replyToFeedback);

// Delete feedback (Admin only)
router.delete('/feedback/:id', auth, announcementController.deleteFeedback);

// Get all announcements (public for browsing, authenticated users can be marked as read)
router.get('/', optionalAuth, announcementController.getAnnouncements);

// Create announcement (admin only - requires additional role check in controller)
router.post('/', auth, announcementController.createAnnouncement);

// Get single announcement (authenticated if token present, otherwise still returns content)
router.get('/:id', optionalAuth, announcementController.getAnnouncementById);

// Update announcement (admin only)
router.put('/:id', auth, announcementController.updateAnnouncement);

// Delete announcement (admin only)
router.delete('/:id', auth, announcementController.deleteAnnouncement);

// Toggle pin status (authenticated)
router.patch('/:id/pin', auth, announcementController.togglePin);

// Get announcement stats (admin only)
router.get('/:id/stats', auth, announcementController.getAnnouncementStats);

module.exports = router;
