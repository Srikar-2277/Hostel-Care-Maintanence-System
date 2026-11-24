const User = require('../models/User');
const Complaint = require('../models/Complaint');
const AuditLog = require('../models/AuditLog');
const { logAudit } = require('../utils/notify');

// @desc    Get all users (with filtering and pagination)
// @route   GET /api/users
// @access  Private (Warden)
const getUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role && role !== 'All') query.role = role;
    if (status && status !== 'All') query.accountStatus = status;

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { studentOrEmpId: searchRegex },
        { roomNumber: searchRegex }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: users.map((u) => u.toSafeObject()),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create maintenance staff account
// @route   POST /api/users/staff
// @access  Private (Warden)
const createStaffUser = async (req, res, next) => {
  try {
    const { name, email, studentOrEmpId, password, phone, specialty } = req.body;

    if (!name || !email || !studentOrEmpId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, employee ID, and password are required.'
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { studentOrEmpId: studentOrEmpId.trim() }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email or Employee ID already exists.'
      });
    }

    const staff = await User.create({
      name,
      email: email.toLowerCase().trim(),
      studentOrEmpId: studentOrEmpId.trim(),
      password,
      role: 'staff',
      phone: phone || '',
      specialty: specialty || 'General Maintenance',
      accountStatus: 'active'
    });

    await logAudit({
      action: 'STAFF_ACCOUNT_CREATED',
      performedBy: req.user._id,
      performerName: req.user.name,
      performerRole: req.user.role,
      details: { staffId: staff._id, staffName: staff.name, specialty }
    });

    res.status(201).json({
      success: true,
      message: `Maintenance staff account for ${staff.name} created successfully.`,
      user: staff.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user account status (active/suspended)
// @route   PATCH /api/users/:id/status
// @access  Private (Warden)
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { accountStatus } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(accountStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, inactive, or suspended.'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent self-suspension
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own account status.'
      });
    }

    user.accountStatus = accountStatus;
    await user.save();

    await logAudit({
      action: 'USER_STATUS_UPDATED',
      performedBy: req.user._id,
      performerName: req.user.name,
      performerRole: req.user.role,
      details: { targetUserId: user._id, targetUserName: user.name, newStatus: accountStatus }
    });

    res.status(200).json({
      success: true,
      message: `User status changed to ${accountStatus}.`,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active maintenance staff with active task counts for assignment
// @route   GET /api/users/staff-list
// @access  Private (Warden)
const getMaintenanceStaff = async (req, res, next) => {
  try {
    const staffMembers = await User.find({ role: 'staff', accountStatus: 'active' }).select(
      'name email phone studentOrEmpId specialty'
    );

    const staffWithWorkload = await Promise.all(
      staffMembers.map(async (staff) => {
        const activeTasks = await Complaint.countDocuments({
          assignedStaff: staff._id,
          currentStatus: { $in: ['Assigned', 'Accepted', 'In Progress'] }
        });
        return {
          ...staff.toSafeObject(),
          activeTasks
        };
      })
    );

    res.status(200).json({
      success: true,
      data: staffWithWorkload
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system audit log trail
// @route   GET /api/users/audit-logs
// @access  Private (Warden)
const getAuditLogs = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createStaffUser,
  updateUserStatus,
  getMaintenanceStaff,
  getAuditLogs
};
