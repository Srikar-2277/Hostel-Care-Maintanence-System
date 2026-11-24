const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

const createNotification = async ({
  recipient,
  title,
  message,
  relatedComplaint = null,
  relatedComplaintId = '',
  notificationType = 'general'
}) => {
  try {
    if (!recipient) return null;
    return await Notification.create({
      recipient,
      title,
      message,
      relatedComplaint,
      relatedComplaintId,
      notificationType
    });
  } catch (err) {
    console.error('[Notification Helper Error]', err.message);
    return null;
  }
};

const logAudit = async ({
  action,
  performedBy = null,
  performerName = 'System',
  performerRole = 'system',
  complaint = null,
  complaintId = '',
  details = {}
}) => {
  try {
    return await AuditLog.create({
      action,
      performedBy,
      performerName,
      performerRole,
      complaint,
      complaintId,
      details,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('[AuditLog Helper Error]', err.message);
    return null;
  }
};

module.exports = { createNotification, logAudit };
