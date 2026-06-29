const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../middleware/asyncHandler');

exports.getLogs = asyncHandler(async (req, res) => {
  const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(100);
  res.json(logs);
});
