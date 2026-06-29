const HeroBanner = require('../models/HeroBanner');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../middleware/asyncHandler');

exports.getHeroBanners = asyncHandler(async (req, res) => {
  const banners = await HeroBanner.find().sort({ order: 1, createdAt: 1 });
  res.json(banners);
});

exports.createHeroBanner = asyncHandler(async (req, res) => {
  const { image, caption } = req.body;
  const count = await HeroBanner.countDocuments();
  const banner = new HeroBanner({ image, caption, order: count });
  const saved = await banner.save();
  await new ActivityLog({ action: 'Added Hero Banner', details: `Banner #${saved._id} uploaded` }).save();
  res.status(201).json(saved);
});

exports.deleteHeroBanner = asyncHandler(async (req, res) => {
  const banner = await HeroBanner.findByIdAndDelete(req.params.id);
  if (!banner) return res.status(404).json({ message: 'Banner not found.' });
  await new ActivityLog({ action: 'Deleted Hero Banner', details: `Banner #${req.params.id} removed` }).save();
  res.json({ message: 'Banner deleted successfully.' });
});
