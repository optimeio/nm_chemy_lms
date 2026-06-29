const mongoose = require('../mongoose');

const DEFAULT_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sri_tech_db';
const CONNECT_TIMEOUT_MS = Number(process.env.DB_CONNECT_TIMEOUT || 4000);
const SERVER_SELECTION_TIMEOUT_MS = Number(process.env.DB_SERVER_SELECTION_TIMEOUT || 3000);
const SOCKET_TIMEOUT_MS = Number(process.env.DB_SOCKET_TIMEOUT_MS || 5000);
const MONITOR_INTERVAL_MS = Number(process.env.DB_MONITOR_INTERVAL_MS || 300000);
const MONITOR_MAX_ATTEMPTS = Number(process.env.DB_MONITOR_MAX_ATTEMPTS || 12);
const FALLBACK_TO_MOCK = process.env.DB_FALLBACK_TO_MOCK !== 'false';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const connectDatabase = async () => {
  const uri = DEFAULT_URI;

  if (mongoose.isMock && mongoose.isMock()) {
    mongoose.useReal && mongoose.useReal();
  }

  try {
    console.log(`🔌 Attempting to connect to MongoDB at ${uri}...`);
    
    mongoose.set && mongoose.set('strictQuery', true);

    const connectPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
      socketTimeoutMS: SOCKET_TIMEOUT_MS,
      connectTimeoutMS: CONNECT_TIMEOUT_MS,
      family: 4,
      autoIndex: process.env.NODE_ENV !== 'production'
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('MongoDB connect timeout')), CONNECT_TIMEOUT_MS + 500)
    );

    await Promise.race([connectPromise, timeoutPromise]);

    if (mongoose.connection && typeof mongoose.connection.db?.command === 'function') {
      await mongoose.connection.db.command({ ping: 1 });
    }

    console.log(`✅ MongoDB connected successfully to ${uri}`);
    return { mode: 'MongoDB', connected: true };
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);

    if (!FALLBACK_TO_MOCK) {
      throw err;
    }

    console.warn('⚠️ Falling back to mock database mode using Backend/db.json');
    mongoose.useMock();

    return { mode: 'Mock', connected: false };
  }
};

const verifyMongoOperations = async () => {
  const result = {
    passed: false,
    connection: false,
    import: false,
    crud: false,
    duplicateDetection: false,
    updateMode: false,
    forceMode: false,
    errors: []
  };

  try {
    const Product = require('../models/Product');
    const baseId = `verify-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const testSku = `${baseId}-sku`;
    const testName = `Verify Product ${baseId}`;
    const payload = {
      name: testName,
      price: '₹1',
      category: 'Verification',
      icon: 'fa-check',
      images: ['/verify.png'],
      sku: testSku,
      slug: `${baseId}-slug`,
      createdAt: new Date()
    };

    const created = await new Product(payload).save();
    result.connection = true;
    result.import = !!created;

    const found = await Product.findOne({ $or: [{ sku: testSku }, { name: testName }] });
    if (!found) {
      throw new Error('Verification read failed');
    }
    result.crud = true;

    const priceUpdate = '₹2';
    const updated = await Product.findByIdAndUpdate(found._id, { price: priceUpdate });
    if (!updated || updated.price !== priceUpdate) {
      throw new Error('Verification update failed');
    }
    result.updateMode = true;

    const duplicateSku = `${testSku}-dup`;
    await new Product({ ...payload, sku: duplicateSku, slug: `${baseId}-slug-dup` }).save();
    const duplicateFound = await Product.findOne({ $or: [{ sku: duplicateSku }, { name: testName }] });
    result.duplicateDetection = !!duplicateFound;

    const inserted = await Product.insertMany([
      payload,
      { ...payload, sku: `${testSku}-force`, slug: `${baseId}-slug-force`, name: `${testName}-force` }
    ]);
    result.forceMode = Array.isArray(inserted) && inserted.length === 2;

    await Product.deleteMany({ sku: testSku });
    await Product.deleteMany({ sku: duplicateSku });
    await Product.deleteMany({ sku: `${testSku}-force` });

    result.passed = result.connection && result.import && result.crud && result.duplicateDetection && result.updateMode && result.forceMode;
  } catch (err) {
    result.errors.push(err.message || String(err));
  }

  return result;
};

const monitorMongoAvailability = async () => {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  console.log(`🧪 MongoDB monitor enabled: checking every ${MONITOR_INTERVAL_MS / 1000}s for up to ${MONITOR_MAX_ATTEMPTS} attempts`);

  let attempts = 0;
  while (attempts < MONITOR_MAX_ATTEMPTS && mongoose.isMock && mongoose.isMock()) {
    attempts += 1;
    console.log(`🧪 MongoDB monitor attempt ${attempts}/${MONITOR_MAX_ATTEMPTS}`);

    try {
      const result = await connectDatabase();
      if (result.mode === 'MongoDB') {
        const verification = await verifyMongoOperations();
        console.log('🧪 MongoDB verification result:', verification);
        if (verification.passed) {
          console.log('✅ MongoDB became available and passed verification. Switching to real MongoDB.');
          break;
        }
        console.warn('⚠️ MongoDB connection is available but verification failed. Retrying later.');
      }
    } catch (err) {
      console.warn(`⚠️ MongoDB monitor error: ${err.message}`);
    }

    await sleep(MONITOR_INTERVAL_MS);
  }

  if (mongoose.isMock && mongoose.isMock()) {
    console.warn('⚠️ MongoDB monitor completed without successful verification. Continuing with mock mode.');
  }
};

module.exports = connectDatabase;
module.exports.verifyMongoOperations = verifyMongoOperations;
module.exports.monitorMongoAvailability = monitorMongoAvailability;
