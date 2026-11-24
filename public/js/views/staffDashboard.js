// Maintenance Staff Dashboard View Controller
const StaffDashboardView = {
  currentTab: 'active', // 'active' | 'history'

  async render() {
    const container = document.getElementById('app-container');
    if (!container) return;

    const user = Store.state.user || {};

    const [statsRes, complaintsRes] = await Promise.all([
      API.analytics.getDashboard().catch(() => ({ stats: {} })),
      API.complaints.getAll({ limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }).catch(() => ({ data: [] }))
    ]);

    const stats = statsRes.stats || {
      assignedTotal: 0,
      pendingAcceptance: 0,
      inProgress: 0,
      awaitingConfirmation: 0,
      resolved: 0,
      rating: 5,
      ratedCount: 0
    };

    const allComplaints = complaintsRes.data || [];
    const activeTasks = allComplaints.filter((c) =>
      ['Assigned', 'Accepted', 'In Progress', 'Awaiting Confirmation', 'Reopened'].includes(c.currentStatus)
    );
    const completedTasks = allComplaints.filter((c) => c.currentStatus === 'Resolved');

    const displayTasks = this.currentTab === 'active' ? activeTasks : completedTasks;

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Technician Work Orders Queue 🔧</h1>
          <p class="page-subtitle">Logged in as: <strong>${user.name}</strong> • Trade: <strong>${user.specialty || 'General Maintenance'}</strong></p>
        </div>
        <div class="page-actions">
          <button class="btn btn-outline" onclick="StaffDashboardView.render()">
            <i data-lucide="rotate-cw"></i> Refresh Queue
          </button>
        </div>
      </div>

      <!-- KPI Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-title">Assigned Orders</span>
            <div class="stat-icon-wrap" style="background: var(--color-primary-light); color: var(--color-primary);">
              <i data-lucide="clipboard-list" style="width: 20px; height: 20px;"></i>
            </div>
          </div>
          <div class="stat-value">${stats.assignedTotal}</div>
          <div class="stat-subtitle">Total lifetime assignments</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-title">New / Pending Acceptance</span>
            <div class="stat-icon-wrap" style="background: var(--color-warning-bg); color: var(--color-warning-dark);">
              <i data-lucide="alert-circle" style="width: 20px; height: 20px;"></i>
            </div>
          </div>
          <div class="stat-value" style="color: var(--color-warning-dark);">${stats.pendingAcceptance}</div>
          <div class="stat-subtitle">Requires technician acknowledgment</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-title">In Progress</span>
            <div class="stat-icon-wrap" style="background: #e0f2fe; color: #0284c7;">
              <i data-lucide="tool" style="width: 20px; height: 20px;"></i>
            </div>
          </div>
          <div class="stat-value" style="color: #0284c7;">${stats.inProgress}</div>
          <div class="stat-subtitle">Repairs underway on site</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-title">Student Performance Rating</span>
            <div class="stat-icon-wrap" style="background: #fef9c3; color: #ca8a04;">
              <i data-lucide="star" style="width: 20px; height: 20px;"></i>
            </div>
          </div>
          <div class="stat-value" style="color: #ca8a04;">
            ${stats.rating ? `${stats.rating}★` : '5.0★'}
          </div>
          <div class="stat-subtitle">Based on ${stats.ratedCount || 0} student verified review${stats.ratedCount !== 1 ? 's' : ''}</div>
        </div>
      </div>

      <!-- Tab Switcher -->
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
        <button
          class="btn ${this.currentTab === 'active' ? 'btn-primary' : 'btn-outline'} btn-sm"
          onclick="StaffDashboardView.setTab('active')"
        >
          <i data-lucide="activity"></i> Active Assigned Work Orders (${activeTasks.length})
        </button>
        <button
          class="btn ${this.currentTab === 'history' ? 'btn-primary' : 'btn-outline'} btn-sm"
          onclick="StaffDashboardView.setTab('history')"
        >
          <i data-lucide="check-check"></i> Completed History (${completedTasks.length})
        </button>
      </div>

      <!-- Work Orders Table -->
      <div class="card" style="padding: 0; overflow: hidden;">
        ${displayTasks.length === 0 ? Components.renderEmptyState(
          this.currentTab === 'active' ? 'No active work orders' : 'No completed history',
          this.currentTab === 'active' ? 'You are all caught up! New assignments will trigger notifications.' : 'Completed tickets will appear here once verified by students.',
          'check-circle-2'
        ) : `
          <div class="table-container" style="border: none;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Location & Room</th>
                  <th>Category</th>
                  <th>Issue Description</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Target Deadline</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${displayTasks.map((t) => `
                  <tr class="table-row-clickable" onclick="window.location.hash = '#/assigned-task/${t._id}'">
                    <td>
                      <strong style="color: var(--color-primary);">${t.complaintId}</strong>
                      ${t.isEscalated ? '<span title="Urgent escalation" style="color: #dc2626; margin-left: 4px;">⚡</span>' : ''}
                      ${t.currentStatus === 'Reopened' ? '<span title="Student reopened ticket" style="color: #9333ea; margin-left: 4px;">⚠️</span>' : ''}
                    </td>
                    <td>
                      <div style="font-weight: 700; color: var(--color-primary);">${t.room}</div>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">${t.block} • ${t.floor}</div>
                    </td>
                    <td>${t.category}</td>
                    <td style="max-width: 240px;">
                      <div style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.title}</div>
                      <div style="font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.description}</div>
                    </td>
                    <td>${Components.renderPriorityBadge(t.priority)}</td>
                    <td>${Components.renderStatusBadge(t.currentStatus)}</td>
                    <td>${Components.renderDeadlineBadge(t.estimatedDeadline, t.currentStatus)}</td>
                    <td style="text-align: right;" onclick="event.stopPropagation();">
                      <div style="display: flex; gap: 0.35rem; justify-content: flex-end;">
                        <button class="btn btn-secondary btn-sm" onclick="window.location.hash = '#/assigned-task/${t._id}'" title="Open Job Sheet">
                          <i data-lucide="eye" style="width: 14px; height: 14px;"></i> Open
                        </button>
                        ${t.currentStatus === 'Assigned' ? `
                          <button class="btn btn-primary btn-sm" onclick="StaffDashboardView.quickAccept('${t._id}')" title="Accept Assignment">
                            Accept
                          </button>
                        ` : ''}
                        ${t.currentStatus === 'Accepted' ? `
                          <button class="btn btn-warning btn-sm" onclick="StaffDashboardView.quickStart('${t._id}')" title="Start Repair">
                            Start Work
                          </button>
                        ` : ''}
                        ${t.currentStatus === 'In Progress' ? `
                          <button class="btn btn-success btn-sm" onclick="window.location.hash = '#/assigned-task/${t._id}'" title="Complete Work">
                            Complete
                          </button>
                        ` : ''}
                      </div>
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
  },

  setTab(tab) {
    this.currentTab = tab;
    this.render();
  },

  async quickAccept(complaintId) {
    try {
      const formData = new FormData();
      formData.append('status', 'Accepted');
      formData.append('workNotes', 'Technician acknowledged and accepted task assignment.');
      await API.complaints.updateStaffStatus(complaintId, formData);
      Components.showToast('Task accepted!', 'success');
      await this.render();
    } catch (e) {
      Components.showToast(e.message, 'error');
    }
  },

  async quickStart(complaintId) {
    try {
      const formData = new FormData();
      formData.append('status', 'In Progress');
      formData.append('workNotes', 'Technician arrived on site and commenced repairs.');
      await API.complaints.updateStaffStatus(complaintId, formData);
      Components.showToast('Marked as In Progress!', 'success');
      await this.render();
    } catch (e) {
      Components.showToast(e.message, 'error');
    }
  }
};
