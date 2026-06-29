const SupportQuery = require('../models/SupportQuery');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../middleware/asyncHandler');
const { sendEmail, templates } = require('../utils/emailService');

exports.getSupportQueries = asyncHandler(async (req, res) => {
  const queries = await SupportQuery.find().sort({ createdAt: -1 });
  res.json(queries);
});

exports.createSupportQuery = asyncHandler(async (req, res) => {
  const query = new SupportQuery(req.body);
  const saved = await query.save();
  await new ActivityLog({ action: 'Support Ticket Raised', details: `Ticket regarding "${saved.subject}" by ${saved.customerName}` }).save();
  res.status(201).json(saved);
});

exports.respondToSupportQuery = asyncHandler(async (req, res) => {
  const { response } = req.body;

  if (!response || !response.trim()) {
    return res.status(400).json({ message: 'Response text is required.' });
  }

  const query = await SupportQuery.findById(req.params.id);
  if (!query) return res.status(404).json({ message: 'Support ticket not found.' });

  query.adminResponse = response;
  query.status = 'Responded';
  query.respondedAt = Date.now();
  query.isRead = true;
  const saved = await query.save();

  await new ActivityLog({ action: 'Responded to Ticket', details: `Replied to support ticket "${saved.subject}" from ${saved.email}` }).save();

  sendEmail(
    saved.email,
    `Response to your support request: ${saved.subject}`,
    templates.supportResponse(saved.customerName, saved.subject, response)
  ).catch(err => console.error('Support response email failed:', err.message));

  res.json(saved);
});
