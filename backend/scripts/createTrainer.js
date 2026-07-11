const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

async function main() {
  const email = 'chemytrainer@gmail.com';
  const password = 'Trainer2026';
  const mongo = process.env.MONGO_URI;
  if (!mongo) {
    console.error('MONGO_URI not found in environment or backend/.env');
    process.exit(1);
  }

  await mongoose.connect(mongo, { serverSelectionTimeoutMS: 10000 });

  const lookup = email.toLowerCase();
  let user = await User.findOne({ email: lookup });
  const hashed = await bcrypt.hash(password, 10);

  if (user) {
    user.role = 'trainer';
    user.password = hashed;
    await user.save();
    console.log(`Updated existing user ${lookup} to trainer.`);
  } else {
    user = await User.create({ fullName: 'Chemy Trainer', email: lookup, password: hashed, role: 'trainer' });
    console.log(`Created trainer user ${lookup}.`);
  }

  console.log('Trainer credentials:');
  console.log(`  email: ${lookup}`);
  console.log(`  password: ${password}`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error creating trainer:', err.message || err);
  process.exit(1);
});
