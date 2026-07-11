const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email: email.toLowerCase(), password: hashed });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });

    const lookup = email.trim().toLowerCase();
    // allow login via email, registerNo, or phone to support student workflows
    const user = await User.findOne({
      $or: [
        { email: lookup },
        { registerNo: lookup },
        { phone: lookup },
      ],
    });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // First try bcrypt compare (normal case)
    let match = false;
    try {
      match = await bcrypt.compare(password, user.password);
    } catch (e) {
      match = false;
    }

    // If bcrypt comparison failed but stored password looks unhashed, allow migration
    if (!match) {
      const stored = user.password || '';
      if (stored === password) {
        // migrate to hashed password
        const hashed = await bcrypt.hash(password, 10);
        user.password = hashed;
        await user.save();
        match = true;
      }
    }

    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
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
