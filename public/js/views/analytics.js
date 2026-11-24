// Analytics & Executive Reports View Controller
const AnalyticsView = {
  charts: {},

  async render() {
    const container = document.getElementById('app-container');
    if (!container) return;

    try {
      const response = await API.analytics.getDashboard();
      const stats = response.stats || {};
      const chartsData = response.charts || {};

      container.innerHTML = `
        <div class="page-header">
          <div>
            <h1 class="page-title">Campus Maintenance Analytics & Reports 📊</h1>
            <p class="page-subtitle">Real-time database aggregated metrics, SLA compliance, and technician workload telemetry</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" onclick="AnalyticsView.exportCSV()">
              <i data-lucide="download"></i> Download Audit Report (CSV)
            </button>
          </div>
        </div>

        <!-- KPI Performance Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card-header">
              <span class="stat-title">Resolution Rate</span>
              <div class="stat-icon-wrap" style="background: var(--color-success-bg); color: var(--color-success-dark);">
                <i data-lucide="percent" style="width: 20px; height: 20px;"></i>
              </div>
            </div>
            <div class="stat-value" style="color: var(--color-success-dark);">${stats.resolutionRate || 0}%</div>
            <div class="stat-subtitle">${stats.resolved || 0} of ${stats.total || 0} tickets completed</div>
          </div>

          <div class="stat-card">
            <div class="stat-card-header">
              <span class="stat-title">Avg Turnaround Time</span>
              <div class="stat-icon-wrap" style="background: var(--color-primary-light); color: var(--color-primary);">
                <i data-lucide="timer" style="width: 20px; height: 20px;"></i>
              </div>
            </div>
            <div class="stat-value">${stats.avgResolutionHours || 0} <span style="font-size: 1rem; font-weight: 500;">hours</span></div>
            <div class="stat-subtitle">From submission to student verified</div>
          </div>

          <div class="stat-card">
            <div class="stat-card-header">
              <span class="stat-title">Overdue Rate</span>
              <div class="stat-icon-wrap" style="background: #fee2e2; color: #dc2626;">
                <i data-lucide="clock" style="width: 20px; height: 20px;"></i>
              </div>
            </div>
            <div class="stat-value" style="color: #dc2626;">
              ${stats.total > 0 ? Number(((stats.overdue / stats.total) * 100).toFixed(1)) : 0}%
            </div>
            <div class="stat-subtitle">${stats.overdue || 0} tickets missed SLA target</div>
          </div>

          <div class="stat-card">
            <div class="stat-card-header">
              <span class="stat-title">Active Workload</span>
              <div class="stat-icon-wrap" style="background: #e0f2fe; color: #0284c7;">
                <i data-lucide="tool" style="width: 20px; height: 20px;"></i>
              </div>
            </div>
            <div class="stat-value" style="color: #0284c7;">${(stats.pending || 0) + (stats.inProgress || 0)}</div>
            <div class="stat-subtitle">Pending assignment or in repair</div>
          </div>
        </div>

        <!-- 4 Chart.js Interactive Dashboards -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;" class="form-grid">
          <!-- Chart 1: Category Distribution -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="pie-chart"></i> Complaints by Category
              </div>
            </div>
            <div style="position: relative; height: 280px;">
              <canvas id="analytics-category-chart"></canvas>
            </div>
          </div>

          <!-- Chart 2: Monthly Trends -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="trending-up"></i> 6-Month Volume Trends
              </div>
            </div>
            <div style="position: relative; height: 280px;">
              <canvas id="analytics-monthly-chart"></canvas>
            </div>
          </div>

          <!-- Chart 3: Status Distribution -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="bar-chart-2"></i> Current Status Distribution
              </div>
            </div>
            <div style="position: relative; height: 280px;">
              <canvas id="analytics-status-chart"></canvas>
            </div>
          </div>

          <!-- Chart 4: Staff Workload & Performance -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="users"></i> Technician Workload & Completion
              </div>
            </div>
            <div style="position: relative; height: 280px;">
              <canvas id="analytics-staff-chart"></canvas>
            </div>
          </div>
        </div>

        <!-- Staff Performance Table -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <i data-lucide="award"></i> Maintenance Staff Performance Breakdown
            </div>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Technician</th>
                  <th>Trade Specialty</th>
                  <th>Total Assigned</th>
                  <th>In Progress</th>
                  <th>Completed & Verified</th>
                  <th>Student Rating</th>
                </tr>
              </thead>
              <tbody>
                ${(chartsData.staffPerformance || []).map((sp) => `
                  <tr>
                    <td><strong>${sp.name}</strong></td>
                    <td><span class="badge" style="background: var(--color-primary-light); color: var(--color-primary);">${sp.specialty || 'General'}</span></td>
                    <td>${sp.assigned}</td>
                    <td>${sp.inProgress}</td>
                    <td><span style="color: var(--color-success-dark); font-weight: 700;">${sp.completed}</span></td>
                    <td>
                      <span style="color: #f59e0b; font-weight: 700;">★ ${sp.rating || 5.0}</span>
                      <span style="font-size: 0.75rem; color: var(--text-light);">(${sp.ratedCount || 0} reviews)</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      Components.refreshIcons();
      this.initCharts(chartsData);
    } catch (e) {
      container.innerHTML = Components.renderEmptyState('Failed to load analytics', e.message, 'alert-triangle');
      Components.refreshIcons();
    }
  },

  initCharts(chartsData) {
    if (!window.Chart) return;

    // Destroy prior charts
    Object.keys(this.charts).forEach((k) => {
      if (this.charts[k]) this.charts[k].destroy();
    });

    const isDark = Store.state.theme === 'dark';
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? '#1e293b' : '#f1f5f9';

    // 1. Category Chart
    const catCanvas = document.getElementById('analytics-category-chart');
    if (catCanvas && chartsData.categories) {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];
      this.charts.cat = new Chart(catCanvas, {
        type: 'doughnut',
        data: {
          labels: chartsData.categories.labels || [],
          datasets: [
            {
              data: chartsData.categories.counts || [],
              backgroundColor: colors.slice(0, (chartsData.categories.labels || []).length),
              borderWidth: 2,
              borderColor: isDark ? '#111827' : '#ffffff'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { boxWidth: 12, color: textColor }
            }
          }
        }
      });
    }

    // 2. Monthly Trend Chart
    const monthCanvas = document.getElementById('analytics-monthly-chart');
    if (monthCanvas && chartsData.monthlyTrend) {
      this.charts.month = new Chart(monthCanvas, {
        type: 'line',
        data: {
          labels: chartsData.monthlyTrend.labels || [],
          datasets: [
            {
              label: 'Lodged',
              data: chartsData.monthlyTrend.total || [],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              fill: true,
              tension: 0.35,
              borderWidth: 2.5
            },
            {
              label: 'Resolved',
              data: chartsData.monthlyTrend.resolved || [],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              fill: true,
              tension: 0.35,
              borderWidth: 2.5
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top', labels: { color: textColor } } },
          scales: {
            y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } },
            x: { grid: { display: false }, ticks: { color: textColor } }
          }
        }
      });
    }

    // 3. Status Distribution Chart
    const statusCanvas = document.getElementById('analytics-status-chart');
    if (statusCanvas && chartsData.statusDistribution) {
      const dist = chartsData.statusDistribution;
      const labels = Object.keys(dist);
      const data = Object.values(dist);

      this.charts.status = new Chart(statusCanvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Tickets',
              data,
              backgroundColor: '#4f46e5',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1 } },
            x: { grid: { display: false }, ticks: { color: textColor, font: { size: 10 } } }
          }
        }
      });
    }

    // 4. Staff Workload Chart
    const staffCanvas = document.getElementById('analytics-staff-chart');
    if (staffCanvas && chartsData.staffPerformance) {
      const sp = chartsData.staffPerformance;
      const names = sp.map((s) => s.name.split(' ')[0]);
      const assigned = sp.map((s) => s.assigned);
      const completed = sp.map((s) => s.completed);

      this.charts.staff = new Chart(staffCanvas, {
        type: 'bar',
        data: {
          labels: names,
          datasets: [
            {
              label: 'Assigned',
              data: assigned,
              backgroundColor: '#0284c7',
              borderRadius: 6
            },
            {
              label: 'Completed',
              data: completed,
              backgroundColor: '#10b981',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top', labels: { color: textColor } } },
          scales: {
            y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1 } },
            x: { grid: { display: false }, ticks: { color: textColor } }
          }
        }
      });
    }
  },

  exportCSV() {
    window.location.href = API.complaints.getExportUrl();
  }
};
