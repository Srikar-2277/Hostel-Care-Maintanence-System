const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getUsers,
  createStaffUser,
  updateUserStatus,
  getMaintenanceStaff,
  getAuditLogs
} = require('../controllers/userController');

// All user routes protected and restricted to Warden
router.use(protect, authorize('warden'));

router.get('/', getUsers);
router.post('/staff', createStaffUser);
router.get('/staff-list', getMaintenanceStaff);
router.patch('/:id/status', updateUserStatus);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
