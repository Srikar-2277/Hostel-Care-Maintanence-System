const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true
    },
    note: {
      type: String,
      default: ''
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedByName: {
      type: String,
      default: 'System'
    },
    updatedByRole: {
      type: String,
      default: 'system'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    userRole: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      index: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
      type: String,
      required: [true, 'Detailed description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters']
    },
    category: {
      type: String,
      enum: [
        'Plumbing',
        'Electrical',
        'Furniture',
        'Cleaning and Sanitation',
        'Doors and Windows',
        'Internet and Wi-Fi',
        'Other'
      ],
      required: [true, 'Category is required'],
      index: true
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Emergency'],
      default: 'Medium',
      required: true,
      index: true
    },
    hostel: {
      type: String,
      required: [true, 'Hostel building name is required'],
      trim: true
    },
    block: {
      type: String,
      required: [true, 'Hostel block is required'],
      trim: true
    },
    floor: {
      type: String,
      required: [true, 'Floor number/name is required'],
      trim: true
    },
    room: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true
    },
    locationDetails: {
      type: String,
      trim: true,
      default: ''
    },
    images: {
      type: [String],
      default: []
    },
    afterRepairImages: {
      type: [String],
      default: []
    },
    currentStatus: {
      type: String,
      enum: [
        'Submitted',
        'Under Review',
        'Approved',
        'Rejected',
        'Assigned',
        'Accepted',
        'In Progress',
        'Work Completed',
        'Awaiting Confirmation',
        'Resolved',
        'Reopened'
      ],
      default: 'Submitted',
      index: true
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    estimatedDeadline: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: ''
    },
    workNotes: {
      type: String,
      trim: true,
      default: ''
    },
    repairDescription: {
      type: String,
      trim: true,
      default: ''
    },
    actualCompletionDate: {
      type: Date,
      default: null
    },
    studentConfirmation: {
      confirmed: { type: Boolean, default: null },
      rating: { type: Number, min: 1, max: 5, default: null },
      feedback: { type: String, default: '' },
      confirmedAt: { type: Date, default: null },
      problemPersists: { type: Boolean, default: false },
      reopenReason: { type: String, default: '' }
    },
    isDuplicateWarning: {
      type: Boolean,
      default: false
    },
    linkedComplaintId: {
      type: String,
      default: null
    },
    isEscalated: {
      type: Boolean,
      default: false
    },
    escalatedAt: {
      type: Date,
      default: null
    },
    statusHistory: [statusHistorySchema],
    comments: [commentSchema]
  },
  {
    timestamps: true
  }
);

// Virtual property to calculate whether complaint is overdue
complaintSchema.virtual('isOverdue').get(function () {
  if (['Resolved', 'Rejected'].includes(this.currentStatus)) {
    return false;
  }
  if (!this.estimatedDeadline) {
    return false;
  }
  return new Date() > new Date(this.estimatedDeadline);
});

// Configure toObject and toJSON to include virtuals
complaintSchema.set('toObject', { virtuals: true });
complaintSchema.set('toJSON', { virtuals: true });

// Auto-generate human-readable complaint ID before saving if not present
complaintSchema.pre('save', async function () {
  if (!this.complaintId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Complaint').countDocuments();
    const sequence = String(count + 1).padStart(4, '0');
    this.complaintId = `HC-${year}-${sequence}`;
  }
});

module.exports = mongoose.model('Complaint', complaintSchema);
