const Lead = require('../models/Lead');
const asyncHandler = require('../middleware/asyncHandler');
const ActivityLog = require('../models/ActivityLog');

exports.getLeads = asyncHandler(async (req, res) => {
  const leads = await Lead.find().sort({ createdAt: -1 });
  res.json(leads);
});

exports.createLead = asyncHandler(async (req, res) => {
  const lead = new Lead(req.body);
  const saved = await lead.save();
  await new ActivityLog({ action: 'Lead Captured', details: `Lead ${saved.name} from ${saved.location}` }).save();
  res.status(201).json(saved);
});
