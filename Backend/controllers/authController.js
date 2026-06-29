const crypto = require('crypto');
const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const asyncHandler = require('../middleware/asyncHandler');
const generateToken = require('../utils/token');
const { sendEmail, templates } = require('../utils/emailService');

const createOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const normalizeEmail = (email = '') => String(email).trim().toLowerCase();
const normalizeOtp = (otp = '') => String(otp).trim();

exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  const normalizedEmail = normalizeEmail(email);

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser && existingUser.isVerified) {
    return res.status(400).json({ message: 'Email is already registered. Please login.' });
  }

  const pendingUser = await PendingUser.findOne({ email: normalizedEmail });
  if (pendingUser) {
    pendingUser.name = name;
    pendingUser.phone = phone;
    pendingUser.address = address;
    pendingUser.password = password;
  } else {
    await PendingUser.create({
      name,
      email: normalizedEmail,
      phone,
      address,
      password,
      otp: createOtp(),
      otpExpires: Date.now() + 10 * 60 * 1000
    });
  }

  const otpUser = pendingUser || await PendingUser.findOne({ email: normalizedEmail });
  otpUser.otp = createOtp();
  otpUser.otpExpires = Date.now() + 10 * 60 * 1000;
  await otpUser.save();

  try {
    await sendEmail(normalizedEmail, 'Verify Your Email - The Sri Tech', templates.otpVerification(name, otpUser.otp));
  } catch (err) {
    console.error('OTP Email delivery failed:', err.message);
  }

  res.status(201).json({
    message: 'OTP sent to email. Please verify to complete signup.',
    email: otpUser.email
  });
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = normalizeEmail(email);
  const normalizedOtp = normalizeOtp(otp);
  const pendingUser = await PendingUser.findOne({ email: normalizedEmail });

  if (!pendingUser) {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'User is already verified. Please login.' });
    }
    return res.status(404).json({ message: 'Verification request not found. Please signup again.' });
  }

  if (!normalizedOtp || pendingUser.otp !== normalizedOtp || Date.now() > pendingUser.otpExpires) {
    return res.status(400).json({ message: 'Invalid or expired OTP.' });
  }

  const user = await User.create({
    name: pendingUser.name,
    email: pendingUser.email,
    phone: pendingUser.phone,
    address: pendingUser.address,
    password: pendingUser.password,
    isVerified: true
  });

  await PendingUser.deleteOne({ _id: pendingUser._id });

  const token = generateToken({ id: user._id, role: user.role });

  try {
    await sendEmail(normalizedEmail, 'Welcome to The Sri Tech!', templates.registration(user.name));
  } catch (err) {
    console.error('Welcome email failed:', err.message);
  }

  res.json({
    message: 'Email verified successfully.',
    token,
    user
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  if (user.status === 'blocked') {
    return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
  }

  if (!user.isVerified) {
    return res.status(403).json({ message: 'Please verify your email address before logging in.' });
  }

  const token = generateToken({ id: user._id, role: user.role });

  res.json({
    token,
    user
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

exports.requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;

  try {
    await sendEmail(normalizedEmail, 'Password Reset Request - The Sri Tech', `Please reset your password by clicking this link: <a href="${resetUrl}">Reset Password</a>`);
  } catch (err) {
    console.error('Password reset email failed:', err.message);
  }

  res.json({ message: 'Password reset link has been sent to your email.' });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ message: 'Token is invalid or has expired.' });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Password has been reset successfully.' });
});
