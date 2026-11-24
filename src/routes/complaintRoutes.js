const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');
const {
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
} = require('../controllers/complaintController');

// Export CSV report (Must be before :id route)
router.get('/export/csv', protect, authorize('warden'), exportComplaintsCSV);

// Create and list complaints
router
  .route('/')
  .post(protect, authorize('student'), upload.array('images', 5), createComplaint)
  .get(protect, getComplaints);

// Single complaint by ID or HC-code
router.get('/:id', protect, getComplaintById);

// Warden status update
router.patch('/:id/status', protect, authorize('warden'), updateStatusByWarden);

// Warden assignment
router.patch('/:id/assign', protect, authorize('warden'), assignComplaint);

// Warden deadline update
router.patch('/:id/deadline', protect, authorize('warden'), updateDeadline);

// Warden escalate
router.patch('/:id/escalate', protect, authorize('warden'), escalateComplaint);

// Staff status update
router.patch(
  '/:id/staff-status',
  protect,
  authorize('staff'),
  upload.array('afterRepairImages', 5),
  updateStatusByStaff
);

// Student confirm resolution or report problem persists (reopen)
router.post('/:id/confirm', protect, authorize('student'), confirmResolutionByStudent);

// Add comment to discussion
router.post('/:id/comments', protect, addComment);

module.exports = router;
