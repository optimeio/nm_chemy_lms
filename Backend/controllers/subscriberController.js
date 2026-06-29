const Subscriber = require('../models/Subscriber');
const asyncHandler = require('../middleware/asyncHandler');

exports.createSubscriber = asyncHandler(async (req, res) => {
  const subscriber = new Subscriber(req.body);
  const saved = await subscriber.save();
  res.status(201).json(saved);
});

exports.getSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Subscriber.find().sort({ createdAt: -1 });
  res.json(subscribers);
});

exports.deleteSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
  if (!subscriber) return res.status(404).json({ message: 'Subscriber not found.' });
  res.json({ message: 'Subscriber deleted successfully.' });
});
