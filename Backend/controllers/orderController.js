const Order = require('../models/Order');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../middleware/asyncHandler');
const { sendEmail, templates } = require('../utils/emailService');

exports.getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

exports.createOrder = asyncHandler(async (req, res) => {
  const orderData = { ...req.body };

  if (orderData.email) {
    const user = await User.findOne({ email: orderData.email });
    if (user && user.status === 'blocked') {
      return res.status(403).json({ message: 'Your account has been blocked. You cannot place orders.' });
    }
  }

  if (!orderData.orderId) {
    orderData.orderId = 'SRI-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  }

  const order = new Order(orderData);
  const savedOrder = await order.save();
  await new ActivityLog({ action: 'Order Placed', details: `Order #${savedOrder.orderId} by ${savedOrder.customerName}` }).save();

  if (orderData.email) {
    sendEmail(orderData.email, `Order Confirmation - #${savedOrder.orderId}`, templates.orderConfirmation(savedOrder))
      .catch(err => console.error('Order confirmation email failed:', err.message));
  }

  if (process.env.OWNER_EMAIL) {
    sendEmail(process.env.OWNER_EMAIL, `NEW ORDER RECEIVED - #${savedOrder.orderId}`, templates.adminOrderNotification(savedOrder))
      .catch(err => console.error('Owner notification email failed:', err.message));
  }

  res.status(201).json(savedOrder);
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  res.json(order);
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  await new ActivityLog({ action: 'Order Status Updated', details: `Order #${order.orderId} status set to ${order.status}` }).save();
  res.json(order);
});
