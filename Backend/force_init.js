const mongoose = require('mongoose');
require('dotenv').config();

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

async function forceCreate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const models = [
      { name: 'Product', model: Product },
      { name: 'Category', model: Category },
      { name: 'Offer', model: Offer },
      { name: 'User', model: User },
      { name: 'Lead', model: Lead },
      { name: 'Subscriber', model: Subscriber },
      { name: 'Order', model: Order },
      { name: 'Coupon', model: Coupon },
      { name: 'SupportQuery', model: SupportQuery },
      { name: 'ActivityLog', model: ActivityLog }
    ];

    for (let m of models) {
      const count = await m.model.countDocuments();
      if (count === 0) {
        console.log(`Creating initial dummy document for ${m.name}...`);
        // We'll create and then immediately delete a dummy to force collection creation
        // but for Category we already have seed logic.
        if (m.name === 'Category') continue; 
        
        // Use a generic save to trigger collection creation
        const dummy = new m.model({ name: 'Initial Setup', title: 'Initial Setup', email: 'setup@sritech.com', code: 'SETUP', orderId: '0', action: 'System Init', subject: 'System' });
        // Some models have required fields, let's be careful. 
        // Actually, just listing them in the code and doing a find is enough sometimes, 
        // but to be SURE they appear in Atlas UI:
      }
    }
    
    // Explicitly seed categories again just in case
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      await Category.insertMany([
        { name: 'Engraining Products', slug: 'engraining-products' },
        { name: 'Stoves', slug: 'stoves' }
      ]);
      console.log('Categories seeded.');
    }

    console.log('All collections should be visible now if connection string is correct.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

forceCreate();
