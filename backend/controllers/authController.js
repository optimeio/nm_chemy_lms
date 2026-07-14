const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    console.log('[AUTH] Register attempt with:', { fullName, email: email?.toLowerCase(), passwordLength: password?.length || 0 });
    
    if (!fullName || !email || !password) {
      console.log('[AUTH] Missing required fields');
      return res.status(400).json({ message: 'Missing fields' });
    }
    
    const lookup = email.toLowerCase();
    const existing = await User.findOne({ email: lookup });
    if (existing) {
      console.log('[AUTH] Email already exists:', lookup);
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email: lookup, password: hashed });
    console.log('[AUTH] New user created:', { id: user._id, email: user.email, role: user.role });
    
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    console.log('[AUTH] Register token generated for:', user.email);
    res.json({ token });
  } catch (err) {
    console.error('[AUTH] Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('\n[AUTH] Login attempt with:', { email: email?.toLowerCase(), passwordLength: password?.length || 0 });
    
    if (!email || !password) {
      console.log('[AUTH] Missing email or password');
      return res.status(400).json({ message: 'Missing credentials' });
    }

    const lookup = email.trim().toLowerCase();
    console.log('[AUTH] Looking up user with email:', lookup);
    
    // allow login via email, registerNo, or phone to support student workflows
    const user = await User.findOne({
      $or: [
        { email: lookup },
        { registerNo: lookup },
        { phone: lookup },
      ],
    });
    
    console.log('[AUTH] User found:', !!user ? { email: user.email, role: user.role, id: user._id } : 'NOT FOUND');
    if (!user) {
      console.log('[AUTH] No user found for:', lookup);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // First try bcrypt compare (normal case)
    let match = false;
    try {
      console.log('[AUTH] Comparing password with bcrypt...');
      console.log('[AUTH] Stored password hash length:', user.password?.length || 0);
      match = await bcrypt.compare(password, user.password);
      console.log('[AUTH] bcrypt.compare result:', match);
    } catch (e) {
      console.log('[AUTH] bcrypt.compare error:', e.message);
      match = false;
    }

    // If bcrypt comparison failed but stored password looks unhashed, allow migration
    if (!match) {
      const stored = user.password || '';
      console.log('[AUTH] Password mismatch. Trying plain text migration...');
      if (stored === password) {
        console.log('[AUTH] Plain text password matches! Migrating to bcrypt...');
        // migrate to hashed password
        const hashed = await bcrypt.hash(password, 10);
        user.password = hashed;
        await user.save();
        match = true;
      } else {
        console.log('[AUTH] Plain text password also does not match');
      }
    }

    if (!match) {
      console.log('[AUTH] Password comparison failed. Returning Invalid credentials');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('[AUTH] Password verified! Generating JWT token...');
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    console.log('[AUTH] Token generated:', { tokenLength: token.length, userId: user._id, role: user.role });
    console.log('[AUTH] Login successful for:', { email: user.email, role: user.role });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error('[AUTH] Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.me = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('-password -__v');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const updates = req.body;
    // Prevent role/password changes here for simplicity
    delete updates.role;
    delete updates.password;
    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password -__v');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
