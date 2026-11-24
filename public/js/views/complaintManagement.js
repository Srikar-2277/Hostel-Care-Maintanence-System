// Warden Complaint Management View Controller
const ComplaintManagementView = {
  filters: {
    status: 'All',
    category: 'All',
    priority: 'All',
    block: 'All',
    isOverdue: '',
    search: '',
    page: 1,
    limit: 12
  },

  async render() {
    const container = document.getElementById('app-container');
    if (!container) return;

    // Check query params in hash (e.g., #/complaint-management?isOverdue=true)
    const { queryString } = Router.parseHash();
    if (queryString) {
      const q = new URLSearchParams(queryString);
      if (q.get('isOverdue')) this.filters.isOverdue = q.get('isOverdue');
      if (q.get('status')) this.filters.status = q.get('status');
      if (q.get('category')) this.filters.category = q.get('category');
    }

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Complaint Management System</h1>
          <p class="page-subtitle">Search, filter, assign, and audit all hostel maintenance complaints across campus</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary" onclick="ComplaintManagementView.handleExportCSV()">
            <i data-lucide="download"></i> Export Filtered CSV
          </button>
        </div>
      </div>

      <!-- Advanced Filters Toolbar -->
      <div class="card" style="padding: 1.25rem; margin-bottom: 1.5rem;">
        <div style="display: grid; grid-template-columns: 2fr repeat(4, 1fr) auto; gap: 0.75rem; align-items: flex-end;" class="form-grid">
          <div>
            <label class="form-label" style="font-size: 0.75rem;">Search by ID / Student / Room / Keyword</label>
            <input
              type="text"
              id="w-search"
              class="form-control"
              placeholder="e.g. HC-2026-0001, Rahul, A-304..."
              value="${this.filters.search}"
              oninput="ComplaintManagementView.handleSearch(this.value)"
            />
          </div>

          <div>
            <label class="form-label" style="font-size: 0.75rem;">Status</label>
            <select id="w-status" class="form-select" onchange="ComplaintManagementView.applyFilter('status', this.value)">
              <option value="All" ${this.filters.status === 'All' ? 'selected' : ''}>All Statuses</option>
              <option value="Submitted" ${this.filters.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
              <option value="Under Review" ${this.filters.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
              <option value="Approved" ${this.filters.status === 'Approved' ? 'selected' : ''}>Approved</option>
              <option value="Assigned" ${this.filters.status === 'Assigned' ? 'selected' : ''}>Assigned</option>
              <option value="Accepted" ${this.filters.status === 'Accepted' ? 'selected' : ''}>Accepted</option>
              <option value="In Progress" ${this.filters.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Work Completed" ${this.filters.status === 'Work Completed' ? 'selected' : ''}>Work Completed</option>
              <option value="Awaiting Confirmation" ${this.filters.status === 'Awaiting Confirmation' ? 'selected' : ''}>Awaiting Confirmation</option>
              <option value="Resolved" ${this.filters.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
              <option value="Reopened" ${this.filters.status === 'Reopened' ? 'selected' : ''}>Reopened</option>
              <option value="Rejected" ${this.filters.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
            </select>
          </div>

          <div>
            <label class="form-label" style="font-size: 0.75rem;">Category</label>
            <select id="w-category" class="form-select" onchange="ComplaintManagementView.applyFilter('category', this.value)">
              <option value="All">All Categories</option>
              ${CONFIG.CATEGORIES.map((c) => `<option value="${c.id}" ${this.filters.category === c.id ? 'selected' : ''}>${c.label}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="form-label" style="font-size: 0.75rem;">Priority</label>
            <select id="w-priority" class="form-select" onchange="ComplaintManagementView.applyFilter('priority', this.value)">
              <option value="All">All Priorities</option>
              ${CONFIG.PRIORITIES.map((p) => `<option value="${p.id}" ${this.filters.priority === p.id ? 'selected' : ''}>${p.label}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="form-label" style="font-size: 0.75rem;">Hostel Block</label>
            <select id="w-block" class="form-select" onchange="ComplaintManagementView.applyFilter('block', this.value)">
              <option value="All">All Blocks</option>
              ${CONFIG.HOSTEL_BLOCKS.map((b) => `<option value="${b}" ${this.filters.block === b ? 'selected' : ''}>${b}</option>`).join('')}
            </select>
          </div>

          <div>
            <button
              class="btn ${this.filters.isOverdue === 'true' ? 'btn-danger' : 'btn-outline'}"
              style="height: 40px; margin-bottom: 1.25rem;"
              onclick="ComplaintManagementView.toggleOverdue()"
              title="Show only overdue complaints"
            >
              <i data-lucide="clock"></i> Overdue Only
            </button>
          </div>
        </div>
      </div>

      <!-- Table Container -->
      <div id="warden-table-container">
        <div style="text-align: center; padding: 2rem;"><span class="spinner"></span> Loading complaints...</div>
      </div>
    `;

    Components.refreshIcons();
    await this.loadData();
  },

  async loadData() {
    const container = document.getElementById('warden-table-container');
    if (!container) return;

    try {
      const response = await API.complaints.getAll(this.filters);
      const complaints = response.data || [];
      const pagination = response.pagination || { total: 0, page: 1, totalPages: 1 };

      if (complaints.length === 0) {
        container.innerHTML = Components.renderEmptyState(
          'No complaints found',
          'No complaints match your active filter settings. Try clearing search keywords or filters.',
          'search',
          '<button class="btn btn-outline btn-sm" onclick="ComplaintManagementView.resetFilters()">Reset All Filters</button>'
        );
        Components.refreshIcons();
        return;
      }

      container.innerHTML = `
        <div class="card" style="padding: 0; overflow: hidden;">
          <div class="table-container" style="border: none;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Student & Room</th>
                  <th>Category</th>
                  <th>Issue Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned Staff</th>
                  <th>Target Deadline</th>
                  <th>Lodged</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${complaints.map((c) => `
                  <tr class="table-row-clickable" onclick="window.location.hash = '#/complaint/${c._id}'">
                    <td>
                      <strong style="color: var(--color-primary);">${c.complaintId}</strong>
                      ${c.isDuplicateWarning ? '<span title="Potential duplicate detected" style="color: #f59e0b; margin-left: 4px;">⚠️</span>' : ''}
                      ${c.isEscalated ? '<span title="Escalated emergency" style="color: #ef4444; margin-left: 4px;">⚡</span>' : ''}
                    </td>
                    <td>
                      <div style="font-weight: 600; color: var(--text-main);">${c.student ? c.student.name : 'Unknown'}</div>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">${c.room} (${c.block})</div>
                    </td>
                    <td>${c.category}</td>
                    <td style="max-width: 220px;">
                      <div style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.title}</div>
                    </td>
                    <td>${Components.renderPriorityBadge(c.priority)}</td>
                    <td>${Components.renderStatusBadge(c.currentStatus)}</td>
                    <td style="font-size: 0.8125rem;">
                      ${c.assignedStaff ? `<strong>${c.assignedStaff.name}</strong>` : '<span style="color: var(--text-light); font-style: italic;">Unassigned</span>'}
                    </td>
                    <td>${Components.renderDeadlineBadge(c.estimatedDeadline, c.currentStatus)}</td>
                    <td style="font-size: 0.8125rem; color: var(--text-muted);">${Components.formatDate(c.createdAt, false)}</td>
                    <td style="text-align: right;" onclick="event.stopPropagation();">
                      <div style="display: flex; gap: 0.35rem; justify-content: flex-end;">
                        <button class="btn btn-secondary btn-sm" onclick="window.location.hash = '#/complaint/${c._id}'" title="View Details">
                          <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="ComplaintDetailsView.render('${c._id}').then(() => ComplaintDetailsView.openAssignModal())" title="Assign Staff">
                          <i data-lucide="user-plus" style="width: 14px; height: 14px;"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Pagination Bar -->
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-top: 1px solid var(--border-color); flex-wrap: wrap; gap: 0.75rem;">
            <div style="font-size: 0.8125rem; color: var(--text-muted);">
              Showing page <strong>${pagination.page}</strong> of <strong>${pagination.totalPages}</strong> (${pagination.total} complaints matched)
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button
                class="btn btn-outline btn-sm"
                ${pagination.page <= 1 ? 'disabled' : ''}
                onclick="ComplaintManagementView.changePage(${pagination.page - 1})"
              >
                Previous
              </button>
              <button
                class="btn btn-outline btn-sm"
                ${pagination.page >= pagination.totalPages ? 'disabled' : ''}
                onclick="ComplaintManagementView.changePage(${pagination.page + 1})"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      `;

      Components.refreshIcons();
    } catch (e) {
      container.innerHTML = Components.renderEmptyState('Failed to load complaints', e.message, 'alert-triangle');
      Components.refreshIcons();
    }
  },

  applyFilter(key, val) {
    this.filters[key] = val;
    this.filters.page = 1;
    this.loadData();
  },

  searchTimer: null,
  handleSearch(val) {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.filters.search = val.trim();
      this.filters.page = 1;
      this.loadData();
    }, 350);
  },

  toggleOverdue() {
    this.filters.isOverdue = this.filters.isOverdue === 'true' ? '' : 'true';
    this.filters.page = 1;
    this.render();
  },

  changePage(pageNum) {
    this.filters.page = pageNum;
    this.loadData();
  },

  resetFilters() {
    this.filters = {
      status: 'All',
      category: 'All',
      priority: 'All',
      block: 'All',
      isOverdue: '',
      search: '',
      page: 1,
      limit: 12
    };
    this.render();
  },

  handleExportCSV() {
    const url = API.complaints.getExportUrl(this.filters);
    window.location.href = url;
  }
};
