const Complaint = require('../models/Complaint');
const User = require('../models/User');

// @desc    Get dashboard metrics and charts data
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user.role;
    const now = new Date();

    if (role === 'student') {
      // Student-specific metrics
      const studentId = req.user._id;

      const [total, submitted, inProgress, awaitingConfirmation, resolved, rejected, reopened] =
        await Promise.all([
          Complaint.countDocuments({ student: studentId }),
          Complaint.countDocuments({
            student: studentId,
            currentStatus: { $in: ['Submitted', 'Under Review', 'Approved'] }
          }),
          Complaint.countDocuments({
            student: studentId,
            currentStatus: { $in: ['Assigned', 'Accepted', 'In Progress'] }
          }),
          Complaint.countDocuments({
            student: studentId,
            currentStatus: 'Awaiting Confirmation'
          }),
          Complaint.countDocuments({ student: studentId, currentStatus: 'Resolved' }),
          Complaint.countDocuments({ student: studentId, currentStatus: 'Rejected' }),
          Complaint.countDocuments({ student: studentId, currentStatus: 'Reopened' })
        ]);

      return res.status(200).json({
        success: true,
        stats: {
          total,
          pending: submitted,
          inProgress,
          awaitingConfirmation,
          resolved,
          rejected,
          reopened
        }
      });
    }

    if (role === 'staff') {
      // Staff-specific metrics
      const staffId = req.user._id;

      const [assignedTotal, pendingAcceptance, inProgress, awaitingConfirmation, resolved] =
        await Promise.all([
          Complaint.countDocuments({ assignedStaff: staffId }),
          Complaint.countDocuments({ assignedStaff: staffId, currentStatus: 'Assigned' }),
          Complaint.countDocuments({
            assignedStaff: staffId,
            currentStatus: { $in: ['Accepted', 'In Progress'] }
          }),
          Complaint.countDocuments({
            assignedStaff: staffId,
            currentStatus: 'Awaiting Confirmation'
          }),
          Complaint.countDocuments({ assignedStaff: staffId, currentStatus: 'Resolved' })
        ]);

      // Calculate staff rating
      const ratedComplaints = await Complaint.find({
        assignedStaff: staffId,
        'studentConfirmation.rating': { $ne: null }
      });

      let avgRating = 0;
      if (ratedComplaints.length > 0) {
        const sum = ratedComplaints.reduce((acc, c) => acc + (c.studentConfirmation.rating || 0), 0);
        avgRating = Number((sum / ratedComplaints.length).toFixed(1));
      }

      return res.status(200).json({
        success: true,
        stats: {
          assignedTotal,
          pendingAcceptance,
          inProgress,
          awaitingConfirmation,
          resolved,
          rating: avgRating,
          ratedCount: ratedComplaints.length
        }
      });
    }

    // Warden / Administrator Overall Metrics
    const [
      total,
      pending,
      inProgress,
      awaitingConfirmation,
      resolved,
      rejected,
      reopened,
      emergency,
      overdueCount
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ currentStatus: { $in: ['Submitted', 'Under Review', 'Approved'] } }),
      Complaint.countDocuments({ currentStatus: { $in: ['Assigned', 'Accepted', 'In Progress'] } }),
      Complaint.countDocuments({ currentStatus: 'Awaiting Confirmation' }),
      Complaint.countDocuments({ currentStatus: 'Resolved' }),
      Complaint.countDocuments({ currentStatus: 'Rejected' }),
      Complaint.countDocuments({ currentStatus: 'Reopened' }),
      Complaint.countDocuments({ priority: 'Emergency', currentStatus: { $nin: ['Resolved', 'Rejected'] } }),
      Complaint.countDocuments({
        currentStatus: { $nin: ['Resolved', 'Rejected'] },
        estimatedDeadline: { $ne: null, $lt: now }
      })
    ]);

    const resolutionRate = total > 0 ? Number(((resolved / total) * 100).toFixed(1)) : 0;

    // Calculate Average Resolution Time for resolved complaints (in hours)
    const resolvedComplaints = await Complaint.find({
      currentStatus: 'Resolved',
      actualCompletionDate: { $ne: null }
    }).select('createdAt actualCompletionDate');

    let avgResolutionHours = 0;
    if (resolvedComplaints.length > 0) {
      const totalHours = resolvedComplaints.reduce((acc, c) => {
        const diffMs = new Date(c.actualCompletionDate) - new Date(c.createdAt);
        return acc + diffMs / (1000 * 60 * 60);
      }, 0);
      avgResolutionHours = Number((totalHours / resolvedComplaints.length).toFixed(1));
    }

    // Category Breakdown (for Doughnut chart)
    const categoryAgg = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const categoriesData = {
      labels: categoryAgg.map((item) => item._id),
      counts: categoryAgg.map((item) => item.count)
    };

    // Status Distribution (for Bar chart)
    const statusAgg = await Complaint.aggregate([
      { $group: { _id: '$currentStatus', count: { $sum: 1 } } }
    ]);
    const statusMap = {};
    statusAgg.forEach((s) => {
      statusMap[s._id] = s.count;
    });

    // Monthly Complaints Trend (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAgg = await Complaint.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$currentStatus', 'Resolved'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyLabels = [];
    const monthlyTotal = [];
    const monthlyResolved = [];

    // Fill last 6 months properly
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const label = `${monthNames[m - 1]} ${y}`;
      monthlyLabels.push(label);

      const found = monthlyAgg.find((item) => item._id.year === y && item._id.month === m);
      monthlyTotal.push(found ? found.total : 0);
      monthlyResolved.push(found ? found.resolved : 0);
    }

    // Staff Workload and Performance
    const staffMembers = await User.find({ role: 'staff', accountStatus: 'active' }).select(
      'name specialty'
    );

    const staffPerformance = [];
    for (const staff of staffMembers) {
      const [assigned, inProgress, completed] = await Promise.all([
        Complaint.countDocuments({ assignedStaff: staff._id }),
        Complaint.countDocuments({
          assignedStaff: staff._id,
          currentStatus: { $in: ['Accepted', 'In Progress'] }
        }),
        Complaint.countDocuments({
          assignedStaff: staff._id,
          currentStatus: { $in: ['Work Completed', 'Awaiting Confirmation', 'Resolved'] }
        })
      ]);

      const ratings = await Complaint.find({
        assignedStaff: staff._id,
        'studentConfirmation.rating': { $ne: null }
      }).select('studentConfirmation.rating');

      let avgRating = 0;
      if (ratings.length > 0) {
        const sum = ratings.reduce((acc, c) => acc + c.studentConfirmation.rating, 0);
        avgRating = Number((sum / ratings.length).toFixed(1));
      }

      staffPerformance.push({
        id: staff._id,
        name: staff.name,
        specialty: staff.specialty,
        assigned,
        inProgress,
        completed,
        rating: avgRating,
        ratedCount: ratings.length
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        inProgress,
        awaitingConfirmation,
        resolved,
        rejected,
        reopened,
        emergency,
        overdue: overdueCount,
        resolutionRate,
        avgResolutionHours
      },
      charts: {
        categories: categoriesData,
        statusDistribution: statusMap,
        monthlyTrend: {
          labels: monthlyLabels,
          total: monthlyTotal,
          resolved: monthlyResolved
        },
        staffPerformance
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
