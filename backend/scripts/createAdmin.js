const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      out[key] = val;
      if (val !== true) i++;
    }
  }
  return out;
}

async function main() {
  const { email = 'theoptime.io@gmail.com', password = 'TSMGPVT@2026' } = parseArgs();
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
    user.role = 'admin';
    user.password = hashed;
    await user.save();
    console.log(`Updated existing user ${lookup} to admin.`);
  } else {
    user = await User.create({ fullName: 'Administrator', email: lookup, password: hashed, role: 'admin' });
    console.log(`Created admin user ${lookup}.`);
  }

  console.log('Admin credentials:');
  console.log(`  email: ${lookup}`);
  console.log(`  password: ${password}`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error creating admin:', err.message || err);
  process.exit(1);
});
