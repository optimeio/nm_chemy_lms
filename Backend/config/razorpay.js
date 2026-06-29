const path = require('path');
const Razorpay = require('razorpay');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

let razorpayInstance = null;

if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
  });
  console.log('✅ Razorpay initialized successfully');
} else {
  console.warn('⚠️ Razorpay credentials not found in environment variables. Payment features will be disabled.');
}

module.exports = razorpayInstance;
