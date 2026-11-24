// Student Complaint History View Controller
const StudentHistoryView = {
  filters: {
    status: 'All',
    category: 'All',
    priority: 'All',
    search: '',
    page: 1,
    limit: 10
  },

  async render() {
    const container = document.getElementById('app-container');
    if (!container) return;

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">My Complaint History</h1>
          <p class="page-subtitle">Complete log of all maintenance requests lodged from your student account</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="window.location.hash = '#/submit-complaint'">
            <i data-lucide="plus-circle"></i> New Complaint
          </button>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="card" style="padding: 1.25rem; margin-bottom: 1.5rem;">
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 0.875rem;" class="form-grid">
          <div>
            <label class="form-label" style="font-size: 0.75rem;">Search by ID / Keyword</label>
            <div style="position: relative;">
              <input
                type="text"
                id="filter-search"
                class="form-control"
                placeholder="Search complaint ID, title, room..."
                value="${this.filters.search}"
                oninput="StudentHistoryView.handleSearch(this.value)"
              />
            </div>
          </div>

          <div>
            <label class="form-label" style="font-size: 0.75rem;">Status</label>
            <select id="filter-status" class="form-select" onchange="StudentHistoryView.applyFilter('status', this.value)">
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Awaiting Confirmation">Awaiting Confirmation</option>
              <option value="Resolved">Resolved</option>
              <option value="Reopened">Reopened</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label class="form-label" style="font-size: 0.75rem;">Category</label>
            <select id="filter-category" class="form-select" onchange="StudentHistoryView.applyFilter('category', this.value)">
              <option value="All">All Categories</option>
              ${CONFIG.CATEGORIES.map((c) => `<option value="${c.id}">${c.label}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="form-label" style="font-size: 0.75rem;">Priority</label>
            <select id="filter-priority" class="form-select" onchange="StudentHistoryView.applyFilter('priority', this.value)">
              <option value="All">All Priorities</option>
              ${CONFIG.PRIORITIES.map((p) => `<option value="${p.id}">${p.label}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>

      <!-- Complaints Data Container -->
      <div id="history-table-container">
        <div style="text-align: center; padding: 2rem;"><span class="spinner"></span> Loading complaints...</div>
      </div>
    `;

    Components.refreshIcons();
    await this.loadData();
  },

  async loadData() {
    const tableContainer = document.getElementById('history-table-container');
    if (!tableContainer) return;

    try {
      const response = await API.complaints.getAll(this.filters);
      const complaints = response.data || [];
      const pagination = response.pagination || { total: 0, page: 1, totalPages: 1 };

      if (complaints.length === 0) {
        tableContainer.innerHTML = Components.renderEmptyState(
          'No complaints match your filters',
          'Try clearing search keywords or choosing different status filters.',
          'search',
          '<button class="btn btn-outline btn-sm" onclick="StudentHistoryView.resetFilters()">Clear Filters</button>'
        );
        Components.refreshIcons();
        return;
      }

      tableContainer.innerHTML = `
        <div class="card" style="padding: 0; overflow: hidden;">
          <div class="table-container" style="border: none;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Category</th>
                  <th>Title & Location</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Technician</th>
                  <th>Submitted</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${complaints.map((c) => `
                  <tr class="table-row-clickable" onclick="window.location.hash = '#/complaint/${c._id}'">
                    <td>
                      <strong style="color: var(--color-primary);">${c.complaintId}</strong>
                      ${c.isDuplicateWarning ? '<span title="Potential duplicate detected" style="color: #f59e0b; margin-left: 4px;">⚠️</span>' : ''}
                    </td>
                    <td>${c.category}</td>
                    <td style="max-width: 280px;">
                      <div style="font-weight: 600; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.title}</div>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">${c.room} • ${c.block}</div>
                    </td>
                    <td>${Components.renderPriorityBadge(c.priority)}</td>
                    <td>${Components.renderStatusBadge(c.currentStatus)}</td>
                    <td style="font-size: 0.8125rem;">
                      ${c.assignedStaff ? `<strong>${c.assignedStaff.name}</strong>` : '<span style="color: var(--text-light);">Unassigned</span>'}
                    </td>
                    <td style="font-size: 0.8125rem; color: var(--text-muted);">${Components.formatDate(c.createdAt, false)}</td>
                    <td style="text-align: right;">
                      <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); window.location.hash = '#/complaint/${c._id}'">
                        <i data-lucide="eye" style="width: 14px; height: 14px;"></i> View
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Pagination Bar -->
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-top: 1px solid var(--border-color); flex-wrap: wrap; gap: 0.75rem;">
            <div style="font-size: 0.8125rem; color: var(--text-muted);">
              Showing page <strong>${pagination.page}</strong> of <strong>${pagination.totalPages}</strong> (${pagination.total} total complaints)
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button
                class="btn btn-outline btn-sm"
                ${pagination.page <= 1 ? 'disabled' : ''}
                onclick="StudentHistoryView.changePage(${pagination.page - 1})"
              >
                Previous
              </button>
              <button
                class="btn btn-outline btn-sm"
                ${pagination.page >= pagination.totalPages ? 'disabled' : ''}
                onclick="StudentHistoryView.changePage(${pagination.page + 1})"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      `;

      Components.refreshIcons();
    } catch (e) {
      tableContainer.innerHTML = Components.renderEmptyState('Failed to load history', e.message, 'alert-triangle');
      Components.refreshIcons();
    }
  },

  applyFilter(key, value) {
    this.filters[key] = value;
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

  changePage(pageNum) {
    this.filters.page = pageNum;
    this.loadData();
  },

  resetFilters() {
    this.filters = {
      status: 'All',
      category: 'All',
      priority: 'All',
      search: '',
      page: 1,
      limit: 10
    };
    this.render();
  }
};
