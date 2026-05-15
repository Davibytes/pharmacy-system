const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendPasswordResetLink } = require('../utils/email');

// Generate JWT Token
const generateToken = (id, userType) => {
  return jwt.sign({ id, userType }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const generateResetCode = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashResetCode = (code) => {
  const secret = process.env.PASSWORD_RESET_SECRET || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('PASSWORD_RESET_SECRET or JWT_SECRET must be configured');
  }

  return crypto.createHmac('sha256', secret).update(code).digest('hex');
};

const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const hashResetToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const passwordResetRequestMessage =
  'If a customer account exists for this email, a password reset link has been sent.';

const pharmacyPasswordResetRequestMessage =
  'If a pharmacy account exists for this email, a password reset link has been sent.';

const clearPasswordReset = (user) => {
  user.resetPasswordCodeHash = undefined;
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordCode = undefined;
  user.resetPasswordExpires = undefined;
  user.resetPasswordAttempts = 0;
};

const clearPharmacyPasswordReset = (pharmacy) => {
  pharmacy.resetPasswordTokenHash = undefined;
  pharmacy.resetPasswordExpires = undefined;
};

// CUSTOMER SIGNUP
exports.customerSignup = async (req, res) => {
  try {
    console.log('Backend: Customer signup request received');
    console.log('Request body:', req.body);

    const { fullName, email, password, confirmPassword } = req.body;

    // Validate all fields
    if (!fullName || !email || !password || !confirmPassword) {
      console.log('Missing fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check passwords match
    if (password !== confirmPassword) {
      console.log('Passwords do not match');
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check password length
    if (password.length < 6) {
      console.log('Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check email not already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Email already exists');
      return res.status(400).json({ message: 'Email already registered' });
    }

    // HASH PASSWORD HERE
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    console.log('Creating new user...');
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      userType: 'customer',
    });

    // Save user
    await user.save();
    console.log('User saved successfully');

    // Generate token
    const token = generateToken(user._id, 'customer');
    console.log('Token generated');

    // Send response
    res.status(201).json({
      message: 'Customer registered successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error('Customer signup error:', error);
    res.status(500).json({ message: error.message });
  }
};

// CUSTOMER LOGIN
exports.customerLogin = async (req, res) => {
  try {
    console.log('Backend: Customer login request received');
    console.log('Request body:', req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('Password incorrect');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id, 'customer');

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.requestCustomerPasswordReset = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email }).select(
      '+resetPasswordCodeHash +resetPasswordTokenHash +resetPasswordCode +resetPasswordExpires +resetPasswordAttempts'
    );
    if (!user) {
      return res.json({ message: passwordResetRequestMessage });
    }

    const resetToken = generateResetToken();
    user.resetPasswordCodeHash = undefined;
    user.resetPasswordTokenHash = hashResetToken(resetToken);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    user.resetPasswordAttempts = 0;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl.replace(/\/$/, '')}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetLink({
        to: user.email,
        name: user.fullName,
        resetUrl,
      });
    } catch (emailError) {
      console.error('Send customer password reset email error:', emailError);

      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ message: 'Unable to send password reset code right now' });
      }
    }

    const response = { message: passwordResetRequestMessage };
    if (process.env.NODE_ENV !== 'production') {
      response.resetUrl = resetUrl;
      response.resetToken = resetToken;
    }

    res.json(response);
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({ message: 'Unable to send password reset code right now' });
  }
};

exports.resetCustomerPassword = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const code = String(req.body.code || '').trim();
    const { password, confirmPassword } = req.body;

    if (!email || !code || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Email, code, and new password are required' });
    }

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email }).select(
      '+resetPasswordCodeHash +resetPasswordCode +resetPasswordExpires +resetPasswordAttempts'
    );

    if (
      !user ||
      !user.resetPasswordCodeHash ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires <= new Date()
    ) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    if ((user.resetPasswordAttempts || 0) >= 5) {
      clearPasswordReset(user);
      await user.save();
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    const submittedCodeHash = hashResetCode(code);
    const storedHash = Buffer.from(user.resetPasswordCodeHash, 'hex');
    const submittedHash = Buffer.from(submittedCodeHash, 'hex');
    const isCodeValid =
      storedHash.length === submittedHash.length &&
      crypto.timingSafeEqual(storedHash, submittedHash);

    if (!isCodeValid) {
      user.resetPasswordAttempts = (user.resetPasswordAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    clearPasswordReset(user);
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.resetCustomerPasswordWithToken = async (req, res) => {
  try {
    const resetToken = String(req.params.resetToken || '').trim();
    const { password, confirmPassword } = req.body;

    if (!resetToken || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      resetPasswordTokenHash: hashResetToken(resetToken),
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordTokenHash +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    clearPasswordReset(user);
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password with token error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.requestPharmacyPasswordReset = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const pharmacy = await Pharmacy.findOne({ email });
    if (!pharmacy) {
      return res.json({ message: pharmacyPasswordResetRequestMessage });
    }

    const resetToken = generateResetToken();
    pharmacy.resetPasswordTokenHash = hashResetToken(resetToken);
    pharmacy.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await pharmacy.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl.replace(/\/$/, '')}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetLink({
        to: pharmacy.email,
        name: pharmacy.fullName || pharmacy.pharmacyName,
        resetUrl,
      });
    } catch (emailError) {
      console.error('Send pharmacy password reset email error:', emailError);

      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ message: 'Unable to send password reset link right now' });
      }
    }

    const response = { message: pharmacyPasswordResetRequestMessage };
    if (process.env.NODE_ENV !== 'production') {
      response.resetUrl = resetUrl;
    }

    res.json(response);
  } catch (error) {
    console.error('Request pharmacy password reset error:', error);
    res.status(500).json({ message: 'Unable to send password reset link right now' });
  }
};

exports.resetPharmacyPassword = async (req, res) => {
  try {
    const resetToken = String(req.params.resetToken || '').trim();
    const { password, confirmPassword } = req.body;

    if (!resetToken || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const pharmacy = await Pharmacy.findOne({
      resetPasswordTokenHash: hashResetToken(resetToken),
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!pharmacy) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    pharmacy.password = password;
    clearPharmacyPasswordReset(pharmacy);
    await pharmacy.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset pharmacy password error:', error);
    res.status(500).json({ message: error.message });
  }
};

// PHARMACY SIGNUP
exports.pharmacySignup = async (req, res) => {
  try {
    const {
      fullName,
      pharmacyName,
      email,
      password,
      confirmPassword,
      address,
      phone,
      latitude,
      longitude,
      openingDays,
      openingHours,
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !pharmacyName ||
      !email ||
      !password ||
      !confirmPassword ||
      !address ||
      !phone ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (
      !Number.isFinite(parsedLatitude) ||
      !Number.isFinite(parsedLongitude) ||
      Math.abs(parsedLatitude) > 90 ||
      Math.abs(parsedLongitude) > 180
    ) {
      return res.status(400).json({ message: 'Valid pharmacy coordinates are required' });
    }

    // Check if pharmacy already exists
    const existingPharmacy = await Pharmacy.findOne({ email });
    if (existingPharmacy) {
      return res.status(400).json({ message: 'Pharmacy already exists with this email' });
    }

    // Create new pharmacy
    const pharmacy = new Pharmacy({
      fullName,
      pharmacyName,
      email,
      password,
      address,
      phone,
      location: {
        type: 'Point',
        coordinates: [parsedLongitude, parsedLatitude],
      },
      openingDays: openingDays || {
        Monday: true,
        Tuesday: true,
        Wednesday: true,
        Thursday: true,
        Friday: true,
        Saturday: true,
        Sunday: false,
      },
      openingHours: openingHours || {
        open: '08:00',
        close: '20:00',
      },
    });

    await pharmacy.save();

    // Generate JWT token
    const token = jwt.sign(
      { pharmacyId: pharmacy._id, userType: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Pharmacy registered successfully',
      token,
      pharmacy: {
        id: pharmacy._id,
        fullName: pharmacy.fullName,
        pharmacyName: pharmacy.pharmacyName,
        email: pharmacy.email,
        address: pharmacy.address,
        phone: pharmacy.phone,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        openingDays: pharmacy.openingDays,
        openingHours: pharmacy.openingHours,
      },
    });
  } catch (error) {
    console.error('Pharmacy signup error:', error);
    res.status(500).json({ message: error.message });
  }
};
// PHARMACY LOGIN
exports.pharmacyLogin = async (req, res) => {
  try {
    console.log('Backend: Pharmacy login request received');
    console.log('Request body:', req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find pharmacy by email
    const pharmacy = await Pharmacy.findOne({ email });
    if (!pharmacy) {
      console.log('Pharmacy not found');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isPasswordValid = await pharmacy.comparePassword(password);
    if (!isPasswordValid) {
      console.log('Password incorrect');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(pharmacy._id, 'admin');

    res.json({
      message: 'Login successful',
      token,
      pharmacy: {
        id: pharmacy._id,
        fullName: pharmacy.fullName,
        pharmacyName: pharmacy.pharmacyName,
        email: pharmacy.email,
        userType: pharmacy.userType,
        address: pharmacy.address,
        phone: pharmacy.phone,
        location: pharmacy.location,
        latitude: pharmacy.location.coordinates[1],
        longitude: pharmacy.location.coordinates[0],
      },
    });
  } catch (error) {
    console.error('Pharmacy login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET CURRENT USER
exports.getCurrentUser = async (req, res) => {
  try {
    const { id, userType } = req.user;

    if (userType === 'customer') {
      const user = await User.findById(id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json(user);
    } else if (userType === 'admin') {
      const pharmacy = await Pharmacy.findById(id).select('-password');
      if (!pharmacy) {
        return res.status(404).json({ message: 'Pharmacy not found' });
      }
      return res.json(pharmacy);
    }

    res.status(400).json({ message: 'Invalid user type' });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: error.message });
  }
};
