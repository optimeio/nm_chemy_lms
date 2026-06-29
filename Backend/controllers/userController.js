const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../middleware/asyncHandler');

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password -resetPasswordToken -resetPasswordExpires').sort({ createdAt: -1 });
  res.json(users);
});

exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  user.status = user.status === 'blocked' ? 'active' : 'blocked';
  await user.save();

  await new ActivityLog({ action: 'User Status Changed', details: `User ${user.email} status set to ${user.status}` }).save();
  res.json(user);
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  await new ActivityLog({ action: 'User Deleted', details: `User ${user.email} deleted permanently` }).save();
  res.json({ message: 'User deleted successfully.' });
});

exports.addToCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  if (!user.cart.includes(productId)) {
    user.cart.push(productId);
    await user.save();
  }

  res.json(user.cart);
});

exports.removeFromCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  user.cart = user.cart.filter(id => id.toString() !== req.params.productId);
  await user.save();
  res.json(user.cart);
});

exports.clearCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  user.cart = [];
  await user.save();
  res.json(user.cart);
});

exports.toggleWaitlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  const existing = user.waitlist.find(id => id.toString() === productId);
  if (existing) {
    user.waitlist = user.waitlist.filter(id => id.toString() !== productId);
  } else {
    user.waitlist.push(productId);
  }

  await user.save();
  res.json(user.waitlist);
});
