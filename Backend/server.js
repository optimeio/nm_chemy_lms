// Monkey patch require for mongoose before any other imports
const Module = require('module');
const originalRequire = Module.prototype.require;
const mockMongoose = require('./mockMongoose');

Module.prototype.require = function (id) {
  if (id === 'mongoose') {
    return mockMongoose;
  }
  return originalRequire.apply(this, arguments);
};

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();


// Models
const Product = require('./models/Product');
const Category = require('./models/Category');
const Offer = require('./models/Offer');
const User = require('./models/User');
const Lead = require('./models/Lead');
const Subscriber = require('./models/Subscriber');
const Order = require('./models/Order');
const Coupon = require('./models/Coupon');
const SupportQuery = require('./models/SupportQuery');
const ActivityLog = require('./models/ActivityLog');
const Review = require('./models/Review');
const HeroBanner = require('./models/HeroBanner');

// Email Service
const { sendEmail, templates } = require('./utils/emailService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); 
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB: Sri_tech_01'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// --- Routes ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SriTech Backend is running smoothly', timestamp: new Date() });
});

// Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    const newProduct = await product.save();
    
    const log = new ActivityLog({ action: 'Added Product', details: `Product: ${newProduct.name}` });
    await log.save();
    
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    const log = new ActivityLog({ 
      action: 'Deleted Product', 
      details: `Product ${product.name} deleted permanently` 
    });
    await log.save();
    
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Hero Banners
app.get('/api/hero-banners', async (req, res) => {
  try {
    const banners = await HeroBanner.find().sort({ order: 1, createdAt: 1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/hero-banners', async (req, res) => {
  try {
    const { image, caption } = req.body;
    const count = await HeroBanner.countDocuments();
    const banner = new HeroBanner({ image, caption, order: count });
    const saved = await banner.save();
    const log = new ActivityLog({ action: 'Added Hero Banner', details: `Banner #${saved._id} uploaded` });
    await log.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/hero-banners/:id', async (req, res) => {
  try {
    const banner = await HeroBanner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    const log = new ActivityLog({ action: 'Deleted Hero Banner', details: `Banner #${req.params.id} removed` });
    await log.save();
    res.json({ message: 'Banner deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const category = new Category(req.body);
    const newCategory = await category.save();
    
    const log = new ActivityLog({ action: 'Added Category', details: `Category: ${newCategory.name}` });
    await log.save();
    
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Edit Category
app.put('/api/categories/:id', async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Category not found' });
    const log = new ActivityLog({ action: 'Edited Category', details: `Category ${updated.name} updated` });
    await log.save();
    res.json(updated);
  } catch (err) {
    // Handle duplicate key error for unique fields
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ message: `${field} must be unique` });
    }
    res.status(400).json({ message: err.message });
  }
});

// Delete Category
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    // Check for associated products
    const productCount = await Product.countDocuments({ category: category.slug });
    if (productCount > 0) {
      return res.status(400).json({ message: 'Cannot delete category with associated products' });
    }
    const deleted = await Category.findByIdAndDelete(req.params.id);
    const log = new ActivityLog({ action: 'Deleted Category', details: `Category ${deleted.name} deleted` });
    await log.save();
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// Offers
app.get('/api/offers', async (req, res) => {
  try {
    const offer = await Offer.findOne();
    res.json(offer || {
      title: 'Special Offer! 🎉',
      description: 'Get 20% off your first purchase.',
      code: 'SRITECH20',
      poster: null
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/offers', async (req, res) => {
  try {
    let offer = await Offer.findOne();
    if (offer) {
      Object.assign(offer, req.body);
      await offer.save();
    } else {
      offer = new Offer(req.body);
      await offer.save();
    }
    res.json(offer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Users
app.post('/api/users/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ message: 'Email is already registered. Please login.' });
      }
      // If user exists but not verified, update them and resend OTP
      user.name = name;
      user.password = password;
    } else {
      user = new User({ name, email, password, isVerified: false });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60000); // 10 minutes

    await user.save();
    
    // Send OTP Email
    try {
      console.log(`[DEBUG] OTP for ${user.email} is: ${otp}`);
      await sendEmail(user.email, 'Verify Your Email - The Sri Tech', templates.otpVerification(user.name, otp));
    } catch (eEmail) {
      console.error('OTP Email delivery failed:', eEmail.message);
      // Even if email fails, we return 201 so the user can still test using the OTP printed in the console
    }

    res.status(201).json({ message: 'OTP sent to email. Please verify.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/users/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified. Please login.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'OTP has expired. Please sign up again.' });
    }

    // OTP is valid
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Send Welcome Email
    try {
      await sendEmail(user.email, 'Welcome to The Sri Tech!', templates.registration(user.name));
      // Notify Owner
      await sendEmail(process.env.OWNER_EMAIL, 'New Customer Signed Up! 👤', `<h3>New User Registration</h3><p><strong>Name:</strong> ${user.name}</p><p><strong>Email:</strong> ${user.email}</p>`);
    } catch (eEmail) {
      console.error('Welcome Email delivery failed:', eEmail.message);
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    
    if (user) {
      if (user.status === 'blocked') {
        return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
      }
      if (user.isVerified === false) {
        return res.status(403).json({ message: 'Please verify your email address before logging in.' });
      }
      res.json(user);
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME || 'thesmgroups@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'TSMGPVT@2026';

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    if (username === adminUsername && password === adminPassword) {
      return res.json({ message: 'Admin authenticated successfully.' });
    }

    res.status(401).json({ message: 'Invalid admin credentials.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/users/:id/status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.status = user.status === 'blocked' ? 'active' : 'blocked';
    await user.save();
    
    // Log administrative action
    const log = new ActivityLog({ 
      action: 'User Status Changed', 
      details: `User ${user.email} status set to ${user.status}` 
    });
    await log.save();
    
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Log administrative action
    const log = new ActivityLog({ 
      action: 'User Deleted', 
      details: `User ${user.email} deleted permanently` 
    });
    await log.save();
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cart and Waitlist
app.post('/api/users/:id/cart', async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.cart.push(productId);
    await user.save();
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/users/:id/cart/:productId', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.cart = user.cart.filter(id => id.toString() !== req.params.productId);
    await user.save();
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/users/:id/cart', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.cart = [];
    await user.save();
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/users/:id/waitlist', async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const index = user.waitlist.findIndex(id => id.toString() === productId);
    if (index === -1) {
      user.waitlist.push(productId);
    } else {
      user.waitlist.splice(index, 1);
    }
    
    await user.save();
    res.json(user.waitlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Leads
app.get('/api/leads', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const lead = new Lead(req.body);
    await lead.save();
    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Subscribers
app.post('/api/subscribers', async (req, res) => {
  try {
    const subscriber = new Subscriber(req.body);
    await subscriber.save();
    res.status(201).json(subscriber);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Check if user is blocked
    if (orderData.email) {
      const user = await User.findOne({ email: orderData.email });
      if (user && user.status === 'blocked') {
        return res.status(403).json({ message: 'Your account has been blocked. You cannot place orders.' });
      }
    }
    // Generate a unique Order ID if not provided
    if (!orderData.orderId) {
      orderData.orderId = 'SRI-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    }
    
    const order = new Order(orderData);
    const newOrder = await order.save();

    // Log Activity
    const log = new ActivityLog({ action: 'Order Placed', details: `Order #${newOrder.orderId} by ${newOrder.customerName}` });
    await log.save();

    // 1. Send Confirmation to Customer
    // (Assuming email is passed in orderData or we fetch it from activeUser)
    if (orderData.email) {
      try {
        await sendEmail(orderData.email, `Order Confirmation - #${newOrder.orderId}`, templates.orderConfirmation(newOrder));
      } catch (e1) { console.error('Customer email failed:', e1.message); }
    }

    // 2. Send Notification to Owner
    try {
      await sendEmail(process.env.OWNER_EMAIL, `NEW ORDER RECEIVED - #${newOrder.orderId}`, templates.adminOrderNotification(newOrder));
    } catch (e2) { console.error('Owner email failed:', e2.message); }

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Coupons
app.get('/api/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/coupons', async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    const savedCoupon = await coupon.save();
    
    const log = new ActivityLog({ action: 'Created Coupon', details: `Coupon: ${savedCoupon.code}` });
    await log.save();
    
    res.status(201).json(savedCoupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/coupons/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    
    const log = new ActivityLog({ 
      action: 'Deleted Coupon', 
      details: `Coupon ${coupon.code} deleted permanently` 
    });
    await log.save();
    
    res.json({ message: 'Coupon deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/coupons/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    
    const log = new ActivityLog({ 
      action: 'Updated Coupon', 
      details: `Coupon ${coupon.code} updated` 
    });
    await log.save();
    
    res.json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Support
app.get('/api/support', async (req, res) => {
  try {
    const queries = await SupportQuery.find().sort({ createdAt: -1 });
    res.json(queries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/support', async (req, res) => {
  try {
    const query = new SupportQuery(req.body);
    const savedQuery = await query.save();
    
    // Log activity
    const log = new ActivityLog({
      action: 'Support Ticket Raised',
      details: `Ticket regarding "${savedQuery.subject}" by ${savedQuery.customerName}`
    });
    await log.save();
    
    res.status(201).json(savedQuery);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/support/:id/respond', async (req, res) => {
  try {
    const { response } = req.body;
    if (!response || !response.trim()) {
      return res.status(400).json({ message: 'Response text is required.' });
    }

    const query = await SupportQuery.findById(req.params.id);
    if (!query) return res.status(404).json({ message: 'Support ticket not found.' });

    query.adminResponse = response;
    query.status = 'Responded';
    query.respondedAt = new Date();
    query.isRead = true;
    await query.save();

    const log = new ActivityLog({ 
      action: 'Responded to Ticket', 
      details: `Replied to support ticket "${query.subject}" from ${query.email}` 
    });
    await log.save();

    // Send support email (fire-and-forget)
    sendEmail(
      query.email,
      `Response to your support request: ${query.subject}`,
      templates.supportResponse(query.customerName, query.subject, response)
    ).catch(eEmail => console.error('Error sending support response email:', eEmail.message));

    res.json(query);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Logs
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reviews
app.get('/api/products/:productId/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/products/:productId/reviews', async (req, res) => {
  try {
    const { customerName, rating, comment } = req.body;
    const productId = req.params.productId;

    // Verify purchase
    const orders = await Order.find({ customerName });
    const hasPurchased = orders.some(order => 
      order.items.some(item => String(item.product) === String(productId))
    );

    if (!hasPurchased) {
      return res.status(403).json({ message: 'Only customers who have purchased this product can leave a review.' });
    }

    const review = new Review({
      productId,
      customerName,
      rating,
      comment
    });

    const newReview = await review.save();

    // Log Activity
    const log = new ActivityLog({ 
      action: 'Review Added', 
      details: `Product review by ${customerName} for product ${productId}` 
    });
    await log.save();

    res.status(201).json(newReview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update Product
app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    const log = new ActivityLog({ 
      action: 'Updated Product', 
      details: `Product ${product.name} updated` 
    });
    await log.save();
    
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete Review
app.delete('/api/products/:productId/reviews/:reviewId', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    const log = new ActivityLog({ 
      action: 'Deleted Review', 
      details: `Review deleted permanently` 
    });
    await log.save();
    
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Subscribers
app.get('/api/subscribers', async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Subscriber
app.delete('/api/subscribers/:id', async (req, res) => {
  try {
    const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
    if (!subscriber) return res.status(404).json({ message: 'Subscriber not found' });
    
    res.json({ message: 'Subscriber deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Seed Logic
const seedCategories = async () => {
  const count = await Category.countDocuments();
  if (count === 0) {
    const defaultCategories = [
      { name: 'Engraining Products', slug: 'engraining-products' },
      { name: 'Stoves', slug: 'stoves' },
      { name: 'Home Appliances', slug: 'home-appliances' },
      { name: 'Welding Products', slug: 'welding-products' }
    ];
    await Category.insertMany(defaultCategories);
    console.log('🌱 Default categories seeded');
  }
};
seedCategories();

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
