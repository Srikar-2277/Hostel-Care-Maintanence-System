// Warden Staff & User Management View Controller
const StaffManagementView = {
  activeTab: 'staff', // 'staff' | 'audit'

  async render() {
    const container = document.getElementById('app-container');
    if (!container) return;

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Maintenance Staff & Resource Management</h1>
          <p class="page-subtitle">Oversee technician personnel, monitor active workload distribution, and review audit trail</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="StaffManagementView.openAddStaffModal()">
            <i data-lucide="user-plus"></i> Add New Technician
          </button>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
        <button
          class="btn ${this.activeTab === 'staff' ? 'btn-primary' : 'btn-outline'} btn-sm"
          onclick="StaffManagementView.switchTab('staff')"
        >
          <i data-lucide="users"></i> Active Maintenance Staff
        </button>
        <button
          class="btn ${this.activeTab === 'audit' ? 'btn-primary' : 'btn-outline'} btn-sm"
          onclick="StaffManagementView.switchTab('audit')"
        >
          <i data-lucide="shield"></i> Administrative Audit Trail
        </button>
      </div>

      <!-- Content Container -->
      <div id="staff-view-content">
        <div style="text-align: center; padding: 2rem;"><span class="spinner"></span> Loading...</div>
      </div>
    `;

    Components.refreshIcons();
    await this.loadTabContent();
  },

  switchTab(tab) {
    this.activeTab = tab;
    this.render();
  },

  async loadTabContent() {
    const content = document.getElementById('staff-view-content');
    if (!content) return;

    if (this.activeTab === 'staff') {
      try {
        const response = await API.users.getStaffList();
        const staffList = response.data || [];

        content.innerHTML = `
          <div class="card" style="padding: 0; overflow: hidden;">
            <div class="table-container" style="border: none;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Technician Name</th>
                    <th>Trade Specialty</th>
                    <th>Employee ID</th>
                    <th>Active Tasks Workload</th>
                    <th>Contact Phone</th>
                    <th>Account Status</th>
                    <th style="text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${staffList.map((s) => `
                    <tr>
                      <td>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                          <div class="user-avatar" style="width: 36px; height: 36px; font-size: 0.8125rem;">
                            ${s.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style="font-weight: 700; color: var(--text-main);">${s.name}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="badge" style="background: var(--color-primary-light); color: var(--color-primary); font-weight: 600;">
                          ${s.specialty || 'General Maintenance'}
                        </span>
                      </td>
                      <td><code>${s.studentOrEmpId}</code></td>
                      <td>
                        <span class="badge" style="background: ${s.activeTasks > 3 ? '#fee2e2' : '#eff6ff'}; color: ${s.activeTasks > 3 ? '#dc2626' : '#1d4ed8'}; font-weight: 700;">
                          ${s.activeTasks || 0} active ticket${s.activeTasks !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td style="font-size: 0.8125rem; color: var(--text-muted);">${s.phone || '—'}</td>
                      <td>
                        <span class="badge" style="background: ${s.accountStatus === 'active' ? '#dcfce7' : '#fee2e2'}; color: ${s.accountStatus === 'active' ? '#15803d' : '#991b1b'}; font-weight: 700;">
                          ${s.accountStatus.toUpperCase()}
                        </span>
                      </td>
                      <td style="text-align: right;">
                        <button
                          class="btn btn-outline btn-sm"
                          onclick="StaffManagementView.toggleStatus('${s._id}', '${s.accountStatus === 'active' ? 'suspended' : 'active'}')"
                        >
                          ${s.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
        Components.refreshIcons();
      } catch (err) {
        content.innerHTML = Components.renderEmptyState('Failed to load staff list', err.message, 'alert-triangle');
        Components.refreshIcons();
      }
    } else {
      // Audit Trail Tab
      try {
        const response = await API.users.getAuditLogs();
        const logs = response.data || [];

        content.innerHTML = `
          <div class="card" style="padding: 0; overflow: hidden;">
            <div class="table-container" style="border: none;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Performed By</th>
                    <th>Target Ticket</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  ${logs.map((log) => `
                    <tr>
                      <td style="font-size: 0.8125rem; color: var(--text-muted); white-space: nowrap;">
                        ${Components.formatDate(log.timestamp)}
                      </td>
                      <td>
                        <span class="badge" style="background: var(--bg-subtle); color: var(--text-main); font-weight: 600;">
                          ${log.action}
                        </span>
                      </td>
                      <td>
                        <strong>${log.performerName || 'System'}</strong>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">(${log.performerRole || 'system'})</span>
                      </td>
                      <td>
                        ${log.complaintId ? `<a href="#/complaint/${log.complaintId}" style="font-weight: 700;">${log.complaintId}</a>` : '—'}
                      </td>
                      <td style="font-size: 0.8125rem; color: var(--text-muted); max-width: 320px;">
                        ${log.details ? JSON.stringify(log.details) : '—'}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
        Components.refreshIcons();
      } catch (err) {
        content.innerHTML = Components.renderEmptyState('Failed to load audit logs', err.message, 'alert-triangle');
        Components.refreshIcons();
      }
    }
  },

  async toggleStatus(id, newStatus) {
    try {
      await API.users.updateStatus(id, newStatus);
      Components.showToast(`User status changed to ${newStatus}`, 'success');
      await this.loadTabContent();
    } catch (e) {
      Components.showToast(e.message, 'error');
    }
  },

  openAddStaffModal() {
    const specialties = [
      'Plumbing',
      'Electrical',
      'Furniture',
      'Cleaning and Sanitation',
      'Doors and Windows',
      'Internet and Wi-Fi',
      'General Maintenance'
    ];

    const modalBody = `
      <div class="form-group">
        <label class="form-label" for="add-staff-name">Technician Full Name <span class="required">*</span></label>
        <input type="text" id="add-staff-name" class="form-control" placeholder="e.g. Vikram Singh" required />
      </div>

      <div class="form-group">
        <label class="form-label" for="add-staff-specialty">Trade Specialty <span class="required">*</span></label>
        <select id="add-staff-specialty" class="form-select" required>
          ${specialties.map((sp) => `<option value="${sp}">${sp}</option>`).join('')}
        </select>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label class="form-label" for="add-staff-email">Work Email <span class="required">*</span></label>
          <input type="email" id="add-staff-email" class="form-control" placeholder="vikram@hostelcare.edu" required />
        </div>

        <div class="form-group">
          <label class="form-label" for="add-staff-empid">Employee ID <span class="required">*</span></label>
          <input type="text" id="add-staff-empid" class="form-control" placeholder="EMP-MNT-104" required />
        </div>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label class="form-label" for="add-staff-phone">Contact Phone</label>
          <input type="tel" id="add-staff-phone" class="form-control" placeholder="+91 98000 11122" />
        </div>

        <div class="form-group">
          <label class="form-label" for="add-staff-password">Initial Password <span class="required">*</span></label>
          <input type="password" id="add-staff-password" class="form-control" value="staff123" required />
        </div>
      </div>
    `;

    Components.showModal({
      title: 'Add Maintenance Technician',
      body: modalBody,
      confirmText: 'Create Account',
      confirmClass: 'btn-primary',
      onConfirm: async () => {
        const name = document.getElementById('add-staff-name').value.trim();
        const specialty = document.getElementById('add-staff-specialty').value;
        const email = document.getElementById('add-staff-email').value.trim();
        const studentOrEmpId = document.getElementById('add-staff-empid').value.trim();
        const phone = document.getElementById('add-staff-phone').value.trim();
        const password = document.getElementById('add-staff-password').value;

        if (!name || !email || !studentOrEmpId || !password) {
          throw new Error('Please fill all required fields.');
        }

        await API.users.createStaff({ name, specialty, email, studentOrEmpId, phone, password });
        Components.showToast(`Technician ${name} added successfully!`, 'success');
        await this.loadTabContent();
      }
    });
  }
};
