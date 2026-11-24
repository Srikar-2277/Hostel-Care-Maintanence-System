// Warden / Administrator Command Center Dashboard View Controller
const WardenDashboardView = {
  charts: {},

  async render() {
    const container = document.getElementById('app-container');
    if (!container) return;

    // Fetch dashboard stats & urgent complaints in parallel
    const [analyticsRes, urgentComplaintsRes, recentComplaintsRes] = await Promise.all([
      API.analytics.getDashboard().catch(() => ({ stats: {}, charts: {} })),
      API.complaints.getAll({ isOverdue: 'true', limit: 5 }).catch(() => ({ data: [] })),
      API.complaints.getAll({ limit: 8, sortBy: 'createdAt', sortOrder: 'desc' }).catch(() => ({ data: [] }))
    ]);

    const stats = analyticsRes.stats || {
      total: 0,
      pending: 0,
      inProgress: 0,
      awaitingConfirmation: 0,
      resolved: 0,
      emergency: 0,
      overdue: 0,
      resolutionRate: 0,
      avgResolutionHours: 0
    };

    const chartsData = analyticsRes.charts || {};
    const urgentItems = urgentComplaintsRes.data || [];
    const recentItems = recentComplaintsRes.data || [];

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Warden Operations Command Center 🛡️</h1>
          <p class="page-subtitle">Real-time hostel facility supervision, work order delegation, and compliance monitoring</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary" onclick="window.location.href = API.complaints.getExportUrl()">
            <i data-lucide="download"></i> Export CSV Report
          </button>
          <button class="btn btn-primary" onclick="window.location.hash = '#/complaint-management'">
            <i data-lucide="layers"></i> Manage All Complaints (${stats.total})
          </button>
        </div>
      </div>

      <!-- Urgent Attention Alert Box (Overdue or Emergency Issues) -->
      ${stats.overdue > 0 || stats.emergency > 0 ? `
        <div class="card" style="background: #fef2f2; border: 2px solid #ef4444; margin-bottom: 2rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.875rem;">
              <div style="width: 44px; height: 44px; border-radius: 50%; background: #dc2626; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i data-lucide="alert-triangle" style="width: 24px; height: 24px;"></i>
              </div>
              <div>
                <div style="font-size: 1.05rem; font-weight: 800; color: #991b1b;">
                  Urgent Attention Required: ${stats.overdue} Overdue Task${stats.overdue !== 1 ? 's' : ''} & ${stats.emergency} Emergency Ticket${stats.emergency !== 1 ? 's' : ''}
                </div>
                <div style="font-size: 0.8125rem; color: #7f1d1d;">
                  Target resolution times have passed or hazard levels require prompt intervention.
                </div>
              </div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="window.location.hash = '#/complaint-management?isOverdue=true'">
              Review Overdue Tasks <i data-lucide="arrow-right" style="width: 14px; height: 14px;"></i>
            </button>
          </div>
        </div>
      ` : ''}

      <!-- 6-Metric KPI Statistics Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-title">Total Complaints</span>
            <div class="stat-icon-wrap" style="background: var(--color-primary-light); color: var(--color-primary);">
              <i data-lucide="layers" style="width: 20px; height: 20px;"></i>
            </div>
          </div>
          <div class="stat-value">${stats.total}</div>
          <div class="stat-subtitle">Resolution rate: <strong>${stats.resolutionRate}%</strong></div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-title">Pending Review</span>
            <div class="stat-icon-wrap" style="background: var(--color-warning-bg); color: var(--color-warning-dark);">
              <i data-lucide="inbox" style="width: 20px; height: 20px;"></i>
            </div>
          </div>
          <div class="stat-value" style="color: var(--color-warning-dark);">${stats.pending}</div>
          <div class="stat-subtitle">Awaiting approval or assignment</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-title">In Progress</span>
            <div class="stat-icon-wrap" style="background: #e0f2fe; color: #0284c7;">
              <i data-lucide="tool" style="width: 20px; height: 20px;"></i>
            </div>
          </div>
          <div class="stat-value" style="color: #0284c7;">${stats.inProgress}</div>
          <div class="stat-subtitle">Currently assigned & ongoing</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-title">Awaiting Student Confirm</span>
            <div class="stat-icon-wrap" style="background: #ffedd5; color: #ea580c;">
              <i data-lucide="user-check" style="width: 20px; height: 20px;"></i>
            </div>
          </div>
          <div class="stat-value" style="color: #ea580c;">${stats.awaitingConfirmation}</div>
          <div class="stat-subtitle">Work done, awaiting student rating</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-title">Overdue Issues</span>
            <div class="stat-icon-wrap" style="background: #fee2e2; color: #dc2626;">
              <i data-lucide="clock" style="width: 20px; height: 20px;"></i>
            </div>
          </div>
          <div class="stat-value" style="color: #dc2626;">${stats.overdue}</div>
          <div class="stat-subtitle">Missed resolution deadlines</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-title">Resolved & Closed</span>
            <div class="stat-icon-wrap" style="background: var(--color-success-bg); color: var(--color-success-dark);">
              <i data-lucide="check-circle-2" style="width: 20px; height: 20px;"></i>
            </div>
          </div>
          <div class="stat-value" style="color: var(--color-success-dark);">${stats.resolved}</div>
          <div class="stat-subtitle">Avg turnaround: <strong>${stats.avgResolutionHours} hrs</strong></div>
        </div>
      </div>

      <!-- Live Interactive Charts (Chart.js) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;" class="form-grid">
        <!-- Chart 1: Categories Breakdown -->
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <div class="card-title">
              <i data-lucide="pie-chart"></i> Complaints by Facility Category
            </div>
          </div>
          <div style="position: relative; height: 260px;">
            <canvas id="category-doughnut-chart"></canvas>
          </div>
        </div>

        <!-- Chart 2: 6-Month Volume Trends -->
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <div class="card-title">
              <i data-lucide="trending-up"></i> Monthly Lodged vs Resolved Trends
            </div>
          </div>
          <div style="position: relative; height: 260px;">
            <canvas id="monthly-trend-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Recent Complaints Operations Table -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <i data-lucide="list"></i> Recent Facility Complaints Log
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-outline btn-sm" onclick="window.location.hash = '#/complaint-management'">
              View Full Table <i data-lucide="arrow-right" style="width: 14px; height: 14px;"></i>
            </button>
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Student & Room</th>
                <th>Category</th>
                <th>Issue Summary</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned Staff</th>
                <th>Target Deadline</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${recentItems.map((c) => `
                <tr class="table-row-clickable" onclick="window.location.hash = '#/complaint/${c._id}'">
                  <td>
                    <strong style="color: var(--color-primary);">${c.complaintId}</strong>
                    ${c.isDuplicateWarning ? '<span title="Potential duplicate detected" style="color: #f59e0b; margin-left: 4px;">⚠️</span>' : ''}
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main);">${c.student ? c.student.name : 'Unknown'}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${c.room} (${c.block})</div>
                  </td>
                  <td>${c.category}</td>
                  <td style="max-width: 240px;">
                    <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500;">${c.title}</div>
                  </td>
                  <td>${Components.renderPriorityBadge(c.priority)}</td>
                  <td>${Components.renderStatusBadge(c.currentStatus)}</td>
                  <td style="font-size: 0.8125rem;">
                    ${c.assignedStaff ? `<strong>${c.assignedStaff.name}</strong>` : '<span style="color: var(--text-light); font-style: italic;">Unassigned</span>'}
                  </td>
                  <td>${Components.renderDeadlineBadge(c.estimatedDeadline, c.currentStatus)}</td>
                  <td style="text-align: right;" onclick="event.stopPropagation();">
                    <div style="display: flex; gap: 0.35rem; justify-content: flex-end;">
                      <button class="btn btn-secondary btn-sm" onclick="window.location.hash = '#/complaint/${c._id}'" title="Inspect">
                        <i data-lucide="eye" style="width: 13px; height: 13px;"></i>
                      </button>
                      <button class="btn btn-primary btn-sm" onclick="ComplaintDetailsView.render('${c._id}').then(() => ComplaintDetailsView.openAssignModal())" title="Assign Staff">
                        <i data-lucide="user-plus" style="width: 13px; height: 13px;"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    Components.refreshIcons();

    // Initialize Chart.js charts
    this.renderCharts(chartsData);
  },

  renderCharts(chartsData) {
    if (!window.Chart) return;

    // Destroy existing chart instances if any
    if (this.charts.catChart) this.charts.catChart.destroy();
    if (this.charts.trendChart) this.charts.trendChart.destroy();

    // 1. Doughnut Chart: Categories
    const catCanvas = document.getElementById('category-doughnut-chart');
    if (catCanvas && chartsData.categories) {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];
      this.charts.catChart = new Chart(catCanvas, {
        type: 'doughnut',
        data: {
          labels: chartsData.categories.labels || [],
          datasets: [
            {
              data: chartsData.categories.counts || [],
              backgroundColor: colors.slice(0, (chartsData.categories.labels || []).length),
              borderWidth: 2,
              borderColor: Store.state.theme === 'dark' ? '#111827' : '#ffffff'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 12,
                font: { size: 11 },
                color: Store.state.theme === 'dark' ? '#94a3b8' : '#475569'
              }
            }
          }
        }
      });
    }

    // 2. Line Chart: 6-Month Trend
    const trendCanvas = document.getElementById('monthly-trend-chart');
    if (trendCanvas && chartsData.monthlyTrend) {
      this.charts.trendChart = new Chart(trendCanvas, {
        type: 'line',
        data: {
          labels: chartsData.monthlyTrend.labels || [],
          datasets: [
            {
              label: 'Complaints Lodged',
              data: chartsData.monthlyTrend.total || [],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.35,
              borderWidth: 2.5
            },
            {
              label: 'Resolved',
              data: chartsData.monthlyTrend.resolved || [],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.35,
              borderWidth: 2.5
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                color: Store.state.theme === 'dark' ? '#94a3b8' : '#475569'
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1, color: Store.state.theme === 'dark' ? '#64748b' : '#94a3b8' },
              grid: { color: Store.state.theme === 'dark' ? '#1e293b' : '#f1f5f9' }
            },
            x: {
              ticks: { color: Store.state.theme === 'dark' ? '#64748b' : '#94a3b8' },
              grid: { display: false }
            }
          }
        }
      });
    }
  }
};
