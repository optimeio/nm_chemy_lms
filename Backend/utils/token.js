const jwt = require('jsonwebtoken');

const generateToken = (payload, expiresIn = '7d') => {
  const secret = process.env.JWT_SECRET || 'sritech_default_secret_2026';
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️ JWT_SECRET is not set. Using default fallback secret. Set JWT_SECRET for production.');
  }
  return jwt.sign(payload, secret, { expiresIn });
};

module.exports = generateToken;
