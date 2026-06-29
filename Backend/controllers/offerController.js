const Offer = require('../models/Offer');
const asyncHandler = require('../middleware/asyncHandler');

exports.getOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findOne();
  res.json(offer || {
    title: 'Special Offer! 🎉',
    description: 'Get 20% off your first purchase.',
    code: 'SRITECH20',
    poster: null
  });
});

exports.upsertOffer = asyncHandler(async (req, res) => {
  let offer = await Offer.findOne();
  if (offer) {
    Object.assign(offer, req.body);
    await offer.save();
  } else {
    offer = new Offer(req.body);
    await offer.save();
  }
  res.json(offer);
});
