const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { createNotification, logAudit } = require('../utils/notify');

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Private (Student)
const createComplaint = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      hostel,
      block,
      floor,
      room,
      locationDetails
    } = req.body;

    if (!title || !description || !category || !hostel || !block || !floor || !room) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, category, hostel, block, floor, and room.'
      });
    }

    // Process uploaded images
    let images = [];
    if (req.files && Array.isArray(req.files)) {
      images = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (req.file) {
      images = [`/uploads/${req.file.filename}`];
    }

    // Check for potential duplicate open complaints
    const existingActiveComplaint = await Complaint.findOne({
      hostel: hostel.trim(),
      block: block.trim(),
      room: room.trim(),
      category: category.trim(),
      currentStatus: { $nin: ['Resolved', 'Rejected'] }
    }).sort({ createdAt: -1 });

    const isDuplicateWarning = !!existingActiveComplaint;
    const linkedComplaintId = existingActiveComplaint ? existingActiveComplaint.complaintId : null;

    // Create complaint
    const complaint = new Complaint({
      student: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category,
      priority: priority || 'Medium',
      hostel: hostel.trim(),
      block: block.trim(),
      floor: floor.trim(),
      room: room.trim(),
      locationDetails: locationDetails ? locationDetails.trim() : '',
      images,
      currentStatus: 'Submitted',
      isDuplicateWarning,
      linkedComplaintId,
      statusHistory: [
        {
          status: 'Submitted',
          note: isDuplicateWarning
            ? `Complaint submitted. System alert: A similar active issue (${linkedComplaintId}) already exists for this room.`
            : 'Complaint registered by student.',
          updatedBy: req.user._id,
          updatedByName: req.user.name,
          updatedByRole: req.user.role,
          timestamp: new Date()
        }
      ]
    });

    await complaint.save();

    // Notify all active wardens
    const wardens = await User.find({ role: 'warden', accountStatus: 'active' });
    for (const warden of wardens) {
      await createNotification({
        recipient: warden._id,
        title: `New Complaint: ${complaint.complaintId}`,
        message: `${req.user.name} reported a ${complaint.priority} priority ${complaint.category} issue in Room ${complaint.room} (${complaint.block}).`,
        relatedComplaint: complaint._id,
        relatedComplaintId: complaint.complaintId,
        notificationType: complaint.priority === 'Emergency' ? 'overdue' : 'status_change'
      });
    }

    // Confirmation notification to student
    await createNotification({
      recipient: req.user._id,
      title: 'Complaint Registered',
      message: `Your complaint (${complaint.complaintId}) has been received and is queued for warden review.`,
      relatedComplaint: complaint._id,
      relatedComplaintId: complaint.complaintId,
      notificationType: 'status_change'
    });

    // Log Audit Trail
    await logAudit({
      action: 'COMPLAINT_CREATED',
      performedBy: req.user._id,
      performerName: req.user.name,
      performerRole: req.user.role,
      complaint: complaint._id,
      complaintId: complaint.complaintId,
      details: {
        category,
        priority: complaint.priority,
        room: complaint.room,
        isDuplicateWarning
      }
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaints with filtering, search, and pagination
// @route   GET /api/complaints
// @access  Private (Role-based scope)
const getComplaints = async (req, res, next) => {
  try {
    const {
      status,
      category,
      priority,
      block,
      search,
      isOverdue,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Role-based restrictions
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'staff') {
      query.assignedStaff = req.user._id;
    }

    // Filter by status
    if (status && status !== 'All') {
      if (status.includes(',')) {
        query.currentStatus = { $in: status.split(',').map((s) => s.trim()) };
      } else {
        query.currentStatus = status;
      }
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by priority
    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    // Filter by block
    if (block && block !== 'All') {
      query.block = block;
    }

    // Filter overdue
    if (isOverdue === 'true') {
      query.currentStatus = { $nin: ['Resolved', 'Rejected'] };
      query.estimatedDeadline = { $ne: null, $lt: new Date() };
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    // Search keyword
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { complaintId: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
        { room: searchRegex },
        { block: searchRegex },
        { hostel: searchRegex }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 10, 100);
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [complaints, totalCount] = await Promise.all([
      Complaint.find(query)
        .populate('student', 'name email phone studentOrEmpId roomNumber hostelBlock')
        .populate('assignedStaff', 'name email phone studentOrEmpId specialty')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Complaint.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: complaints,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint by ID
// @route   GET /api/complaints/:id
// @access  Private (Role-checked)
const getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let complaint;
    if (mongoose.Types.ObjectId.isValid(id)) {
      complaint = await Complaint.findById(id)
        .populate('student', 'name email phone studentOrEmpId hostelBlock roomNumber')
        .populate('assignedStaff', 'name email phone studentOrEmpId specialty')
        .populate('comments.user', 'name role profileImage');
    } else {
      complaint = await Complaint.findOne({ complaintId: id })
        .populate('student', 'name email phone studentOrEmpId hostelBlock roomNumber')
        .populate('assignedStaff', 'name email phone studentOrEmpId specialty')
        .populate('comments.user', 'name role profileImage');
    }

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    // Role-based security check
    if (req.user.role === 'student' && complaint.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this complaint.'
      });
    }

    if (
      req.user.role === 'staff' &&
      (!complaint.assignedStaff || complaint.assignedStaff._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this complaint.'
      });
    }

    res.status(200).json({
      success: true,
      complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Warden status update (Under Review, Approved, Rejected)
// @route   PATCH /api/complaints/:id/status
// @access  Private (Warden)
const updateStatusByWarden = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note, rejectionReason } = req.body;

    if (!status || !note) {
      return res.status(400).json({
        success: false,
        message: 'Both status and a status note are mandatory.'
      });
    }

    if (status === 'Rejected' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is required when rejecting a complaint.'
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    complaint.currentStatus = status;
    if (status === 'Rejected') {
      complaint.rejectionReason = rejectionReason;
    }

    complaint.statusHistory.push({
      status,
      note: note.trim() + (rejectionReason ? ` Reason: ${rejectionReason}` : ''),
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      updatedByRole: req.user.role,
      timestamp: new Date()
    });

    await complaint.save();

    // Notify student
    await createNotification({
      recipient: complaint.student,
      title: `Complaint ${status}: ${complaint.complaintId}`,
      message: `Your complaint has been marked as "${status}". Note: ${note}`,
      relatedComplaint: complaint._id,
      relatedComplaintId: complaint.complaintId,
      notificationType: 'status_change'
    });

    // Audit log
    await logAudit({
      action: `STATUS_CHANGE_${status.toUpperCase().replace(/\s+/g, '_')}`,
      performedBy: req.user._id,
      performerName: req.user.name,
      performerRole: req.user.role,
      complaint: complaint._id,
      complaintId: complaint.complaintId,
      details: { newStatus: status, note, rejectionReason }
    });

    res.status(200).json({
      success: true,
      message: `Complaint status updated to ${status}.`,
      complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Warden assign complaint to staff with deadline
// @route   PATCH /api/complaints/:id/assign
// @access  Private (Warden)
const assignComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { staffId, estimatedDeadline, note } = req.body;

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: 'Please select a maintenance staff member.'
      });
    }

    const staff = await User.findOne({ _id: staffId, role: 'staff', accountStatus: 'active' });
    if (!staff) {
      return res.status(400).json({
        success: false,
        message: 'Selected maintenance staff member is invalid or inactive.'
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    complaint.assignedStaff = staff._id;
    complaint.currentStatus = 'Assigned';

    if (estimatedDeadline) {
      complaint.estimatedDeadline = new Date(estimatedDeadline);
    }

    const assignNote = note
      ? note.trim()
      : `Assigned to ${staff.name} (${staff.specialty || 'Maintenance Staff'}) by Warden.`;

    complaint.statusHistory.push({
      status: 'Assigned',
      note: assignNote + (complaint.estimatedDeadline ? ` Expected by: ${new Date(complaint.estimatedDeadline).toLocaleString()}` : ''),
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      updatedByRole: req.user.role,
      timestamp: new Date()
    });

    await complaint.save();

    // Notify staff
    await createNotification({
      recipient: staff._id,
      title: `New Task Assigned: ${complaint.complaintId}`,
      message: `You have been assigned a ${complaint.priority} priority ${complaint.category} task in Room ${complaint.room} (${complaint.block}).`,
      relatedComplaint: complaint._id,
      relatedComplaintId: complaint.complaintId,
      notificationType: 'assignment'
    });

    // Notify student
    await createNotification({
      recipient: complaint.student,
      title: `Staff Assigned: ${complaint.complaintId}`,
      message: `Your complaint has been assigned to ${staff.name}. Estimated completion: ${complaint.estimatedDeadline ? new Date(complaint.estimatedDeadline).toLocaleDateString() : 'Pending schedule'}.`,
      relatedComplaint: complaint._id,
      relatedComplaintId: complaint.complaintId,
      notificationType: 'assignment'
    });

    // Audit log
    await logAudit({
      action: 'COMPLAINT_ASSIGNED',
      performedBy: req.user._id,
      performerName: req.user.name,
      performerRole: req.user.role,
      complaint: complaint._id,
      complaintId: complaint.complaintId,
      details: {
        assignedToStaffId: staff._id,
        assignedToStaffName: staff.name,
        estimatedDeadline: complaint.estimatedDeadline
      }
    });

    res.status(200).json({
      success: true,
      message: `Complaint assigned to ${staff.name}.`,
      complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Warden update estimated resolution deadline
// @route   PATCH /api/complaints/:id/deadline
// @access  Private (Warden)
const updateDeadline = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estimatedDeadline, note } = req.body;

    if (!estimatedDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid deadline date/time.'
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const newDeadline = new Date(estimatedDeadline);
    complaint.estimatedDeadline = newDeadline;

    complaint.statusHistory.push({
      status: complaint.currentStatus,
      note: `Resolution deadline updated to ${newDeadline.toLocaleString()}. ${note ? `Reason: ${note.trim()}` : ''}`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      updatedByRole: req.user.role,
      timestamp: new Date()
    });

    await complaint.save();

    // Notify student
    await createNotification({
      recipient: complaint.student,
      title: `Deadline Updated: ${complaint.complaintId}`,
      message: `Expected resolution time has been updated to ${newDeadline.toLocaleString()}.`,
      relatedComplaint: complaint._id,
      relatedComplaintId: complaint.complaintId,
      notificationType: 'deadline_approaching'
    });

    // Notify staff if assigned
    if (complaint.assignedStaff) {
      await createNotification({
        recipient: complaint.assignedStaff,
        title: `Target Deadline Updated: ${complaint.complaintId}`,
        message: `Warden updated the expected completion deadline to ${newDeadline.toLocaleString()}.`,
        relatedComplaint: complaint._id,
        relatedComplaintId: complaint.complaintId,
        notificationType: 'deadline_approaching'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Resolution deadline updated successfully.',
      complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Warden escalate overdue or critical complaint
// @route   PATCH /api/complaints/:id/escalate
// @access  Private (Warden)
const escalateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    complaint.isEscalated = true;
    complaint.escalatedAt = new Date();
    complaint.priority = 'Emergency';

    complaint.statusHistory.push({
      status: complaint.currentStatus,
      note: `⚠️ COMPLAINT ESCALATED: Priority escalated to Emergency. ${reason ? `Reason: ${reason.trim()}` : 'Marked urgent by warden.'}`,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      updatedByRole: req.user.role,
      timestamp: new Date()
    });

    await complaint.save();

    // Notify staff if assigned
    if (complaint.assignedStaff) {
      await createNotification({
        recipient: complaint.assignedStaff,
        title: `URGENT ESCALATION: ${complaint.complaintId}`,
        message: `Complaint in Room ${complaint.room} has been escalated to Emergency priority. Immediate attention required.`,
        relatedComplaint: complaint._id,
        relatedComplaintId: complaint.complaintId,
        notificationType: 'escalated'
      });
    }

    // Notify student
    await createNotification({
      recipient: complaint.student,
      title: `Complaint Escalated: ${complaint.complaintId}`,
      message: `Your complaint has been escalated to Emergency priority for expedited resolution.`,
      relatedComplaint: complaint._id,
      relatedComplaintId: complaint.complaintId,
      notificationType: 'escalated'
    });

    res.status(200).json({
      success: true,
      message: 'Complaint escalated to Emergency priority.',
      complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Staff update status (Accepted, In Progress, Work Completed)
// @route   PATCH /api/complaints/:id/staff-status
// @access  Private (Staff)
const updateStatusByStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, workNotes, repairDescription } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // Must be assigned to this staff member
    if (!complaint.assignedStaff || complaint.assignedStaff.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are only permitted to update complaints assigned to your account.'
      });
    }

    const validStaffStatuses = ['Accepted', 'In Progress', 'Work Completed'];
    if (!validStaffStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition. Allowed values: ${validStaffStatuses.join(', ')}`
      });
    }

    let afterRepairImages = [];
    if (req.files && Array.isArray(req.files)) {
      afterRepairImages = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (req.file) {
      afterRepairImages = [`/uploads/${req.file.filename}`];
    }

    if (afterRepairImages.length > 0) {
      complaint.afterRepairImages.push(...afterRepairImages);
    }

    if (workNotes) complaint.workNotes = workNotes.trim();
    if (repairDescription) complaint.repairDescription = repairDescription.trim();

    if (status === 'Work Completed') {
      // RULE: Work Completed must not automatically mean Resolved.
      // Move to Awaiting Confirmation so student can confirm.
      complaint.currentStatus = 'Awaiting Confirmation';
      complaint.actualCompletionDate = new Date();

      complaint.statusHistory.push({
        status: 'Work Completed',
        note: `Work completed by ${req.user.name}. ${repairDescription ? `Details: ${repairDescription}` : ''} ${workNotes ? `Notes: ${workNotes}` : ''}. Now awaiting student confirmation.`,
        updatedBy: req.user._id,
        updatedByName: req.user.name,
        updatedByRole: req.user.role,
        timestamp: new Date()
      });

      // Notify student
      await createNotification({
        recipient: complaint.student,
        title: `Work Completed: ${complaint.complaintId}`,
        message: `Maintenance staff finished repair work in Room ${complaint.room}. Please inspect and confirm whether the issue is resolved.`,
        relatedComplaint: complaint._id,
        relatedComplaintId: complaint.complaintId,
        notificationType: 'confirmation_required'
      });

      // Notify warden
      const wardens = await User.find({ role: 'warden', accountStatus: 'active' });
      for (const warden of wardens) {
        await createNotification({
          recipient: warden._id,
          title: `Task Completed: ${complaint.complaintId}`,
          message: `${req.user.name} completed work on ${complaint.complaintId}. Awaiting student confirmation.`,
          relatedComplaint: complaint._id,
          relatedComplaintId: complaint.complaintId,
          notificationType: 'status_change'
        });
      }
    } else {
      complaint.currentStatus = status;
      complaint.statusHistory.push({
        status,
        note: workNotes ? workNotes.trim() : `Status updated to ${status} by technician ${req.user.name}.`,
        updatedBy: req.user._id,
        updatedByName: req.user.name,
        updatedByRole: req.user.role,
        timestamp: new Date()
      });

      // Notify student
      await createNotification({
        recipient: complaint.student,
        title: `Update on ${complaint.complaintId}: ${status}`,
        message: `Technician ${req.user.name} has marked your complaint as "${status}".`,
        relatedComplaint: complaint._id,
        relatedComplaintId: complaint.complaintId,
        notificationType: 'status_change'
      });
    }

    await complaint.save();

    // Audit log
    await logAudit({
      action: `STAFF_UPDATE_${status.toUpperCase().replace(/\s+/g, '_')}`,
      performedBy: req.user._id,
      performerName: req.user.name,
      performerRole: req.user.role,
      complaint: complaint._id,
      complaintId: complaint.complaintId,
      details: { status, workNotes, repairDescription }
    });

    res.status(200).json({
      success: true,
      message: `Status updated to ${status === 'Work Completed' ? 'Awaiting Confirmation' : status}.`,
      complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Student confirms resolution OR reports problem persists (reopen)
// @route   POST /api/complaints/:id/confirm
// @access  Private (Student)
const confirmResolutionByStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, rating, feedback, reopenReason } = req.body; // action: 'confirm' | 'reopen'

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // Must be the student who filed it
    if (complaint.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the student who submitted this complaint can confirm or reopen it.'
      });
    }

    if (action === 'confirm') {
      complaint.currentStatus = 'Resolved';
      complaint.studentConfirmation = {
        confirmed: true,
        rating: rating ? Math.min(Math.max(parseInt(rating, 10), 1), 5) : 5,
        feedback: feedback ? feedback.trim() : '',
        confirmedAt: new Date(),
        problemPersists: false
      };

      complaint.statusHistory.push({
        status: 'Resolved',
        note: `Student confirmed resolution. Rating: ${complaint.studentConfirmation.rating}/5. ${complaint.studentConfirmation.feedback ? `Feedback: "${complaint.studentConfirmation.feedback}"` : ''}`,
        updatedBy: req.user._id,
        updatedByName: req.user.name,
        updatedByRole: req.user.role,
        timestamp: new Date()
      });

      await complaint.save();

      // Notify assigned staff
      if (complaint.assignedStaff) {
        await createNotification({
          recipient: complaint.assignedStaff,
          title: `Task Resolved & Confirmed: ${complaint.complaintId}`,
          message: `Student verified resolution for Room ${complaint.room} (Rating: ${complaint.studentConfirmation.rating}/5). Great job!`,
          relatedComplaint: complaint._id,
          relatedComplaintId: complaint.complaintId,
          notificationType: 'status_change'
        });
      }

      // Notify warden
      const wardens = await User.find({ role: 'warden', accountStatus: 'active' });
      for (const warden of wardens) {
        await createNotification({
          recipient: warden._id,
          title: `Complaint Resolved: ${complaint.complaintId}`,
          message: `${complaint.complaintId} in Room ${complaint.room} is fully resolved and confirmed by student.`,
          relatedComplaint: complaint._id,
          relatedComplaintId: complaint.complaintId,
          notificationType: 'status_change'
        });
      }

      await logAudit({
        action: 'COMPLAINT_RESOLVED_CONFIRMED',
        performedBy: req.user._id,
        performerName: req.user.name,
        performerRole: req.user.role,
        complaint: complaint._id,
        complaintId: complaint.complaintId,
        details: complaint.studentConfirmation
      });

      return res.status(200).json({
        success: true,
        message: 'Thank you! Complaint marked as resolved.',
        complaint
      });
    } else if (action === 'reopen') {
      if (!reopenReason || reopenReason.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Please provide a detailed explanation of why the problem persists.'
        });
      }

      // Set to Reopened
      complaint.currentStatus = 'Reopened';
      complaint.studentConfirmation = {
        confirmed: false,
        problemPersists: true,
        reopenReason: reopenReason.trim(),
        confirmedAt: new Date()
      };

      complaint.statusHistory.push({
        status: 'Reopened',
        note: `⚠️ Student reported problem persists: "${reopenReason.trim()}". Returned for review/re-repair.`,
        updatedBy: req.user._id,
        updatedByName: req.user.name,
        updatedByRole: req.user.role,
        timestamp: new Date()
      });

      await complaint.save();

      // Notify wardens
      const wardens = await User.find({ role: 'warden', accountStatus: 'active' });
      for (const warden of wardens) {
        await createNotification({
          recipient: warden._id,
          title: `⚠️ Complaint Reopened: ${complaint.complaintId}`,
          message: `Student reported issue still persists in Room ${complaint.room}: "${reopenReason.trim()}"`,
          relatedComplaint: complaint._id,
          relatedComplaintId: complaint.complaintId,
          notificationType: 'reopened'
        });
      }

      // Notify assigned staff
      if (complaint.assignedStaff) {
        await createNotification({
          recipient: complaint.assignedStaff,
          title: `⚠️ Task Reopened: ${complaint.complaintId}`,
          message: `Student stated issue was not resolved in Room ${complaint.room}: "${reopenReason.trim()}"`,
          relatedComplaint: complaint._id,
          relatedComplaintId: complaint.complaintId,
          notificationType: 'reopened'
        });
      }

      await logAudit({
        action: 'COMPLAINT_REOPENED',
        performedBy: req.user._id,
        performerName: req.user.name,
        performerRole: req.user.role,
        complaint: complaint._id,
        complaintId: complaint.complaintId,
        details: { reopenReason }
      });

      return res.status(200).json({
        success: true,
        message: 'Complaint has been reopened and warden notified.',
        complaint
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "confirm" or "reopen".'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to complaint thread
// @route   POST /api/complaints/:id/comments
// @access  Private (Student owner, assigned staff, warden)
const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment message cannot be empty.'
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // Check authorization
    const isStudentOwner = complaint.student.toString() === req.user._id.toString();
    const isAssignedStaff =
      complaint.assignedStaff && complaint.assignedStaff.toString() === req.user._id.toString();
    const isWarden = req.user.role === 'warden';

    if (!isStudentOwner && !isAssignedStaff && !isWarden) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to post comments on this complaint.'
      });
    }

    const comment = {
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      message: message.trim(),
      createdAt: new Date()
    };

    complaint.comments.push(comment);
    await complaint.save();

    // Notify other parties
    const notifyRecipients = new Set();
    if (!isStudentOwner) notifyRecipients.add(complaint.student.toString());
    if (complaint.assignedStaff && !isAssignedStaff) {
      notifyRecipients.add(complaint.assignedStaff.toString());
    }
    if (req.user.role !== 'warden') {
      const wardens = await User.find({ role: 'warden', accountStatus: 'active' });
      for (const w of wardens) {
        notifyRecipients.add(w._id.toString());
      }
    }

    for (const recipientId of notifyRecipients) {
      await createNotification({
        recipient: recipientId,
        title: `New Comment on ${complaint.complaintId}`,
        message: `${req.user.name} (${req.user.role}): "${message.trim().substring(0, 80)}${message.length > 80 ? '...' : ''}"`,
        relatedComplaint: complaint._id,
        relatedComplaintId: complaint.complaintId,
        notificationType: 'comment'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      comment,
      comments: complaint.comments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export complaints report as CSV
// @route   GET /api/complaints/export/csv
// @access  Private (Warden)
const exportComplaintsCSV = async (req, res, next) => {
  try {
    const { status, category, priority, block, dateFrom, dateTo } = req.query;

    const query = {};
    if (status && status !== 'All') query.currentStatus = status;
    if (category && category !== 'All') query.category = category;
    if (priority && priority !== 'All') query.priority = priority;
    if (block && block !== 'All') query.block = block;

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    const complaints = await Complaint.find(query)
      .populate('student', 'name email phone studentOrEmpId')
      .populate('assignedStaff', 'name specialty phone')
      .sort({ createdAt: -1 });

    const headers = [
      'Complaint ID',
      'Title',
      'Category',
      'Priority',
      'Current Status',
      'Hostel',
      'Block',
      'Floor',
      'Room',
      'Location Details',
      'Student Name',
      'Student Email',
      'Student Phone',
      'Assigned Staff',
      'Estimated Deadline',
      'Actual Completion',
      'Created Date',
      'Is Overdue'
    ];

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = complaints.map((c) => {
      const isOverdue =
        !['Resolved', 'Rejected'].includes(c.currentStatus) &&
        c.estimatedDeadline &&
        new Date() > new Date(c.estimatedDeadline);

      return [
        escapeCSV(c.complaintId),
        escapeCSV(c.title),
        escapeCSV(c.category),
        escapeCSV(c.priority),
        escapeCSV(c.currentStatus),
        escapeCSV(c.hostel),
        escapeCSV(c.block),
        escapeCSV(c.floor),
        escapeCSV(c.room),
        escapeCSV(c.locationDetails),
        escapeCSV(c.student ? c.student.name : 'Unknown'),
        escapeCSV(c.student ? c.student.email : ''),
        escapeCSV(c.student ? c.student.phone : ''),
        escapeCSV(c.assignedStaff ? c.assignedStaff.name : 'Unassigned'),
        escapeCSV(c.estimatedDeadline ? new Date(c.estimatedDeadline).toISOString() : ''),
        escapeCSV(c.actualCompletionDate ? new Date(c.actualCompletionDate).toISOString() : ''),
        escapeCSV(c.createdAt ? new Date(c.createdAt).toISOString() : ''),
        escapeCSV(isOverdue ? 'YES' : 'NO')
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    const filename = `HostelCare_Complaints_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatusByWarden,
  assignComplaint,
  updateDeadline,
  escalateComplaint,
  updateStatusByStaff,
  confirmResolutionByStudent,
  addComment,
  exportComplaintsCSV
};
