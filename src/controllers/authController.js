const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'hostelcare_super_secret_jwt_key_2026_secured',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a student user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      studentOrEmpId,
      password,
      phone,
      hostelName,
      hostelBlock,
      floor,
      roomNumber
    } = req.body;

    if (!name || !email || !studentOrEmpId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, student ID, and password are required.'
      });
    }

    // Check if email already in use
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Check if student ID already in use
    const existingId = await User.findOne({ studentOrEmpId: studentOrEmpId.trim() });
    if (existingId) {
      return res.status(400).json({
        success: false,
        message: 'An account with this Student / Employee ID already exists.'
      });
    }

    // Create user (always default to student for public registration)
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      studentOrEmpId: studentOrEmpId.trim(),
      password,
      role: 'student',
      phone: phone || '',
      hostelName: hostelName || 'Main Campus Hostel',
      hostelBlock: hostelBlock || '',
      floor: floor || '',
      roomNumber: roomNumber || ''
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to HostelCare.',
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user (Student, Warden, or Staff)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or studentOrEmpId

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/ID and password.'
      });
    }

    // Find user by email or studentOrEmpId (including password field for validation)
    const cleanIdentifier = identifier.trim();
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { studentOrEmpId: cleanIdentifier }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.'
      });
    }

    if (user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated or suspended. Please contact the warden.'
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated user info
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'hostelName', 'hostelBlock', 'floor', 'roomNumber'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new passwords.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
};
