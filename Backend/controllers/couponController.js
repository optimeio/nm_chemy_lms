const Coupon = require('../models/Coupon');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../middleware/asyncHandler');

exports.getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
});

exports.createCoupon = asyncHandler(async (req, res) => {
  const coupon = new Coupon(req.body);
  const saved = await coupon.save();
  await new ActivityLog({ action: 'Created Coupon', details: `Coupon ${saved.code}` }).save();
  res.status(201).json(saved);
});

exports.updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) return res.status(404).json({ message: 'Coupon not found.' });
  await new ActivityLog({ action: 'Updated Coupon', details: `Coupon ${coupon.code}` }).save();
  res.json(coupon);
});

exports.deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return res.status(404).json({ message: 'Coupon not found.' });
  await new ActivityLog({ action: 'Deleted Coupon', details: `Coupon ${coupon.code}` }).save();
  res.json({ message: 'Coupon deleted successfully.' });
});
