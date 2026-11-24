const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    relatedComplaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      default: null
    },
    relatedComplaintId: {
      type: String,
      default: ''
    },
    notificationType: {
      type: String,
      enum: [
        'status_change',
        'assignment',
        'deadline_approaching',
        'overdue',
        'confirmation_required',
        'comment',
        'reopened',
        'escalated',
        'general'
      ],
      default: 'general'
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
