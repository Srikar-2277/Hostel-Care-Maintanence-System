// Student Dashboard View Controller
const StudentDashboardView = {
  async render() {
    const container = document.getElementById('app-container');
    if (!container) return;

    const user = Store.state.user;

    // Fetch dashboard statistics and recent complaints in parallel
    const [statsRes, complaintsRes] = await Promise.all([
      API.analytics.getDashboard().catch(() => ({ stats: {} })),
      API.complaints.getAll({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' }).catch(() => ({ data: [] }))
    ]);

    const stats = statsRes.stats || {
      total: 0,
      pending: 0,
      inProgress: 0,
      awaitingConfirmation: 0,
      resolved: 0,
      rejected: 0,
      reopened: 0
    };

    const recentComplaints = complaintsRes.data || [];

    // Check if any complaints are awaiting confirmation
    const awaitingItems = recentComplaints.filter((c) => c.currentStatus === 'Awaiting Confirmation');

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Welcome back, ${user.name.split(' ')[0]} 👋</h1>
          <p class="page-subtitle">Hostel Room: <strong>${user.roomNumber || 'Not configured'} (${user.hostelBlock || 'Block'})</strong> • Track and manage your maintenance requests</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="window.location.hash = '#/submit-complaint'">
            <i data-lucide="plus-circle"></i> Submit Maintenance Request
          </button>
        </div>
      </div>

      <!-- Action Required Banner for Awaiting Student Confirmation -->
      ${awaitingItems.length > 0 ? `
        <div class="card" style="background: linear-gradient(135deg, #fff7ed, #ffedd5); border: 2px solid #f97316; margin-bottom: 2rem;">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
            <div style="display: flex; gap: 1rem; align-items: flex-start;">
              <div style="width: 44px; height: 44px; border-radius: 50%; background: #ea580c; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i data-lucide="help-circle" style="width: 24px; height: 24px;"></i>
              </div>
              <div>
                <h3 style="font-size: 1.125rem; font-weight: 800; color: #9a3412; margin-bottom: 0.25rem;">
                  Action Required: Confirm ${awaitingItems.length} Completed Repair${awaitingItems.length > 1 ? 's' : ''}
                </h3>
                <p style="font-size: 0.875rem; color: #7c2d12; max-width: 600px;">
                  The maintenance technician has finished repair work for complaint <strong>${awaitingItems[0].complaintId}</strong> ("${awaitingItems[0].title}"). Please inspect the room and confirm if the issue is solved or if the problem persists.
                </p>
              </div>
            </div>
            <button class="btn btn-warning" onclick="window.location.hash = '#/complaint/${awaitingItems[0]._id}'">
              <i data-lucide="check-square"></i> Inspect & Confirm Resolution
            </button>
          </div>
        </div>
      ` : ''}

      <!-- KPI Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-title">Total Lodged</span>
            <div class="stat-icon-wrap" style="background: var(--color-primary-light); color: var(--color-primary);">
              <i data-lucide="folder" style="width: 20px; height: 20px;"></i>
            </div>
          </div>
          <div class="stat-value">${stats.total}</div>
          <div class="stat-subtitle">Lifetime maintenance tickets</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-title">Pending / In Review</span>
            <div class="stat-icon-wrap" style="background: var(--color-warning-bg); color: var(--color-warning-dark);">
              <i data-lucide="clock" style="width: 20px; height: 20px;"></i>
            </div>
          </div>
          <div class="stat-value" style="color: var(--color-warning-dark);">${stats.pending}</div>
          <div class="stat-subtitle">Queued for warden assignment</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-title">In Progress</span>
            <div class="stat-icon-wrap" style="background: #e0f2fe; color: #0284c7;">
              <i data-lucide="wrench" style="width: 20px; height: 20px;"></i>
            </div>
          </div>
          <div class="stat-value" style="color: #0284c7;">${stats.inProgress}</div>
          <div class="stat-subtitle">Technicians actively repairing</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-title">Resolved & Closed</span>
            <div class="stat-icon-wrap" style="background: var(--color-success-bg); color: var(--color-success-dark);">
              <i data-lucide="check-circle-2" style="width: 20px; height: 20px;"></i>
            </div>
          </div>
          <div class="stat-value" style="color: var(--color-success-dark);">${stats.resolved}</div>
          <div class="stat-subtitle">Verified resolved by you</div>
        </div>
      </div>

      <!-- Recent Complaints Section -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <i data-lucide="list-filter"></i> My Recent Complaints
          </div>
          <div>
            <button class="btn btn-outline btn-sm" onclick="window.location.hash = '#/student-history'">
              View Full History (${stats.total}) <i data-lucide="arrow-right" style="width: 14px; height: 14px;"></i>
            </button>
          </div>
        </div>

        ${recentComplaints.length === 0 ? Components.renderEmptyState(
          'No complaints lodged yet',
          'Have a leaky tap, broken fan, or damaged furniture? Submit a request to get it resolved quickly.',
          'file-plus',
          '<button class="btn btn-primary" onclick="window.location.hash = \'#/submit-complaint\'"><i data-lucide="plus"></i> Submit First Complaint</button>'
        ) : `
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Category</th>
                  <th>Title & Description</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Target Deadline</th>
                  <th>Submitted</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${recentComplaints.map((c) => `
                  <tr class="table-row-clickable" onclick="window.location.hash = '#/complaint/${c._id}'">
                    <td>
                      <strong style="color: var(--color-primary);">${c.complaintId}</strong>
                      ${c.isDuplicateWarning ? '<span title="Potential duplicate detected" style="color: #f59e0b; margin-left: 4px;">⚠️</span>' : ''}
                    </td>
                    <td>
                      <span style="font-weight: 500;">${c.category}</span>
                    </td>
                    <td style="max-width: 280px;">
                      <div style="font-weight: 600; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.title}</div>
                      <div style="font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.locationDetails || `${c.room} (${c.block})`}</div>
                    </td>
                    <td>${Components.renderPriorityBadge(c.priority)}</td>
                    <td>${Components.renderStatusBadge(c.currentStatus)}</td>
                    <td>${Components.renderDeadlineBadge(c.estimatedDeadline, c.currentStatus)}</td>
                    <td style="font-size: 0.8125rem; color: var(--text-muted);">${Components.formatDate(c.createdAt, false)}</td>
                    <td style="text-align: right;">
                      <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); window.location.hash = '#/complaint/${c._id}'">
                        <i data-lucide="eye" style="width: 14px; height: 14px;"></i> Track
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;

    Components.refreshIcons();
  }
};
