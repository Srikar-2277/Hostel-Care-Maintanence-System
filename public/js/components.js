// HostelCare Reusable UI Component Renderer & Modals
const Components = {
  refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  },

  formatDate(dateStr, withTime = true) {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    const options = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };
    if (withTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    return date.toLocaleDateString('en-US', options);
  },

  getTimeAgo(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  },

  renderNavbar() {
    const header = document.getElementById('main-header');
    if (!header) return;

    const user = Store.state.user;
    const isAuth = Store.isAuthenticated();
    const unread = Store.state.unreadCount || 0;
    const isDark = Store.state.theme === 'dark';

    header.innerHTML = `
      <div class="header-left">
        ${isAuth ? `
          <button class="mobile-menu-btn" onclick="App.toggleSidebar()" aria-label="Toggle Navigation">
            <i data-lucide="menu"></i>
          </button>
        ` : ''}
        <div class="brand-logo" onclick="window.location.hash = '${isAuth ? App.getDashboardRoute() : '#/'}'">
          <div class="brand-icon-box">
            <i data-lucide="building-2"></i>
          </div>
          <span class="brand-text">HostelCare</span>
          <span class="brand-tag">Smart Ops</span>
        </div>
      </div>

      <div class="header-right">
        <!-- Live System Status Indicator -->
        <div class="badge" style="background-color: var(--color-success-bg); color: var(--color-success-dark); font-size: 0.75rem; border: 1px solid rgba(16, 185, 129, 0.2);">
          <span style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--color-success); display: inline-block;"></span>
          <span style="display: none; @media(min-width: 640px){ display: inline; }">System Active</span>
        </div>

        <!-- Dark / Light Mode Toggle -->
        <button class="btn btn-icon" onclick="Store.toggleTheme()" title="Toggle Theme (Current: ${Store.state.theme})">
          <i data-lucide="${isDark ? 'sun' : 'moon'}"></i>
        </button>

        ${isAuth ? `
          <!-- Notifications Bell -->
          <button class="btn btn-icon" style="position: relative;" onclick="window.location.hash = '#/notifications'" title="Notifications">
            <i data-lucide="bell"></i>
            ${unread > 0 ? `<span style="position: absolute; top: -4px; right: -4px; background: var(--color-danger); color: #fff; font-size: 0.65rem; font-weight: 800; border-radius: 999px; padding: 2px 5px; min-width: 18px; text-align: center; border: 2px solid var(--bg-surface);">${unread > 99 ? '99+' : unread}</span>` : ''}
          </button>

          <!-- User Role Pill -->
          <span class="badge" style="background: var(--color-primary-light); color: var(--color-primary); font-weight: 700; text-transform: uppercase;">
            ${user.role}
          </span>

          <!-- Logout Button -->
          <button class="btn btn-outline btn-sm" onclick="App.confirmLogout()" title="Sign Out">
            <i data-lucide="log-out"></i>
            <span style="display: none; @media(min-width: 640px){ display: inline; }">Logout</span>
          </button>
        ` : `
          <button class="btn btn-outline btn-sm" onclick="window.location.hash = '#/login'">Sign In</button>
          <button class="btn btn-primary btn-sm" onclick="window.location.hash = '#/register'">Register</button>
        `}
      </div>
    `;

    this.refreshIcons();
  },

  renderSidebar() {
    const sidebar = document.getElementById('main-sidebar');
    if (!sidebar) return;

    const isAuth = Store.isAuthenticated();
    const role = Store.getUserRole();
    const activeRoute = window.location.hash || '#/';
    const user = Store.state.user;

    if (!isAuth) {
      sidebar.style.display = 'none';
      return;
    }

    sidebar.style.display = 'flex';

    let navItems = [];

    if (role === 'student') {
      navItems = [
        { route: '#/student-dashboard', label: 'My Dashboard', icon: 'layout-dashboard' },
        { route: '#/submit-complaint', label: 'Report New Issue', icon: 'plus-circle' },
        { route: '#/student-history', label: 'My Complaints', icon: 'clock' },
        { route: '#/notifications', label: 'Alerts & Updates', icon: 'bell', badge: Store.state.unreadCount },
        { route: '#/profile', label: 'Account & Settings', icon: 'user' }
      ];
    } else if (role === 'warden') {
      navItems = [
        { route: '#/warden-dashboard', label: 'Warden Overview', icon: 'shield-check' },
        { route: '#/complaint-management', label: 'Complaint Manager', icon: 'file-text' },
        { route: '#/staff-management', label: 'Staff Management', icon: 'users' },
        { route: '#/analytics', label: 'Analytics & Reports', icon: 'bar-chart-2' },
        { route: '#/notifications', label: 'System Alerts', icon: 'bell', badge: Store.state.unreadCount },
        { route: '#/profile', label: 'Warden Profile', icon: 'settings' }
      ];
    } else if (role === 'staff') {
      navItems = [
        { route: '#/staff-dashboard', label: 'Assigned Work Queue', icon: 'wrench' },
        { route: '#/notifications', label: 'Task Notifications', icon: 'bell', badge: Store.state.unreadCount },
        { route: '#/profile', label: 'Staff Profile', icon: 'user-check' }
      ];
    }

    const navHtml = navItems
      .map((item) => {
        const isActive = activeRoute.startsWith(item.route);
        return `
          <button class="nav-link-btn ${isActive ? 'active' : ''}" onclick="window.location.hash = '${item.route}'">
            <i data-lucide="${item.icon}"></i>
            <span>${item.label}</span>
            ${item.badge && item.badge > 0 ? `<span class="nav-badge">${item.badge}</span>` : ''}
          </button>
        `;
      })
      .join('');

    sidebar.innerHTML = `
      <div>
        <div class="sidebar-heading">Navigation Menu</div>
        <div class="sidebar-nav-group">
          ${navHtml}
        </div>
      </div>

      <div>
        <!-- Quick Submit button for students inside sidebar -->
        ${role === 'student' ? `
          <button class="btn btn-primary" style="width: 100%; margin-bottom: 0.75rem;" onclick="window.location.hash = '#/submit-complaint'">
            <i data-lucide="plus"></i> New Complaint
          </button>
        ` : ''}

        <div class="sidebar-user-card" onclick="window.location.hash = '#/profile'" style="cursor: pointer;" title="View Profile">
          <div class="user-avatar">
            ${user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div class="user-info-text">
            <div class="user-name-title">${user.name}</div>
            <div class="user-role-subtitle">${user.role} ${user.roomNumber ? `• ${user.roomNumber}` : ''}</div>
          </div>
        </div>
      </div>
    `;

    this.refreshIcons();
  },

  renderPriorityBadge(priority) {
    const p = priority || 'Medium';
    let icon = 'flag';
    if (p === 'Emergency') icon = 'alert-triangle';
    if (p === 'High') icon = 'alert-circle';
    return `
      <span class="badge badge-priority-${p.toLowerCase()}">
        <i data-lucide="${icon}" style="width: 13px; height: 13px;"></i>
        ${p}
      </span>
    `;
  },

  renderStatusBadge(status) {
    const s = status || 'Submitted';
    const key = s.toLowerCase().replace(/\s+/g, '-');
    return `
      <span class="badge badge-status-${key}">
        <span style="width: 6px; height: 6px; border-radius: 50%; background: currentColor; display: inline-block;"></span>
        ${s}
      </span>
    `;
  },

  renderDeadlineBadge(deadline, status) {
    if (['Resolved', 'Rejected'].includes(status)) {
      return '';
    }
    if (!deadline) {
      return '<span class="badge" style="background: var(--bg-subtle); color: var(--text-light);">No deadline set</span>';
    }

    const now = new Date();
    const dDate = new Date(deadline);
    const isOverdue = now > dDate;

    if (isOverdue) {
      const diffHours = Math.round((now - dDate) / (1000 * 60 * 60));
      return `
        <span class="badge badge-overdue" title="Resolution deadline passed ${this.formatDate(deadline)}">
          <i data-lucide="clock" style="width: 13px; height: 13px;"></i>
          OVERDUE (${diffHours}h ago)
        </span>
      `;
    } else {
      const diffHours = Math.round((dDate - now) / (1000 * 60 * 60));
      return `
        <span class="badge" style="background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;" title="Due: ${this.formatDate(deadline)}">
          <i data-lucide="hourglass" style="width: 13px; height: 13px;"></i>
          Due in ${diffHours > 24 ? Math.round(diffHours / 24) + 'd' : diffHours + 'h'}
        </span>
      `;
    }
  },

  renderHorizontalStepper(complaint) {
    const status = complaint.currentStatus;
    const stages = [
      { key: 'Submitted', label: 'Submitted', icon: 'file-text' },
      { key: 'Under Review', label: 'Review', icon: 'search' },
      { key: 'Assigned', label: 'Assigned', icon: 'user-check' },
      { key: 'In Progress', label: 'In Repair', icon: 'wrench' },
      { key: 'Work Completed', label: 'Completed', icon: 'check-circle' },
      { key: 'Awaiting Confirmation', label: 'Confirm', icon: 'help-circle' },
      { key: 'Resolved', label: 'Resolved', icon: 'shield-check' }
    ];

    // Calculate current step index
    const statusWeights = {
      'Submitted': 0,
      'Under Review': 1,
      'Approved': 1,
      'Assigned': 2,
      'Accepted': 2,
      'In Progress': 3,
      'Work Completed': 4,
      'Awaiting Confirmation': 5,
      'Resolved': 6,
      'Rejected': -1,
      'Reopened': 3
    };

    const currentWeight = statusWeights[status] !== undefined ? statusWeights[status] : 0;
    const isRejected = status === 'Rejected';
    const isReopened = status === 'Reopened';

    const percent = isRejected ? 100 : Math.min(Math.round((currentWeight / (stages.length - 1)) * 100), 100);

    const stepsHtml = stages
      .map((st, idx) => {
        let stepClass = '';
        if (isRejected) {
          stepClass = idx === 1 ? 'rejected' : idx < 1 ? 'completed' : '';
        } else if (idx < currentWeight) {
          stepClass = 'completed';
        } else if (idx === currentWeight) {
          stepClass = 'active';
        }

        return `
          <div class="stepper-step ${stepClass}">
            <div class="step-node">
              <i data-lucide="${st.icon}" style="width: 18px; height: 18px;"></i>
            </div>
            <span class="step-label">${st.label}</span>
          </div>
        `;
      })
      .join('');

    return `
      <div class="lifecycle-stepper-wrap">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <div style="font-weight: 700; font-size: 0.9375rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="git-commit"></i> Current Lifecycle Progress
          </div>
          <div>
            ${this.renderStatusBadge(status)}
            ${isReopened ? '<span class="badge badge-priority-emergency">Reopened State</span>' : ''}
          </div>
        </div>

        <div class="lifecycle-stepper">
          <div class="stepper-progress-line">
            <div class="stepper-progress-fill" style="width: ${percent}%; ${isRejected ? 'background: var(--color-danger);' : ''}"></div>
          </div>
          ${stepsHtml}
        </div>
      </div>
    `;
  },

  renderTimeline(complaint) {
    if (!complaint.statusHistory || complaint.statusHistory.length === 0) {
      return '<div class="timeline-empty">No status history recorded yet.</div>';
    }

    const items = [...complaint.statusHistory].reverse().map((hist) => {
      const statusKey = hist.status.toLowerCase().replace(/\s+/g, '-');
      let icon = 'circle';
      if (hist.status === 'Submitted') icon = 'send';
      if (hist.status === 'Approved') icon = 'check';
      if (hist.status === 'Assigned') icon = 'user-plus';
      if (hist.status === 'In Progress') icon = 'tool';
      if (hist.status === 'Work Completed') icon = 'check-square';
      if (hist.status === 'Awaiting Confirmation') icon = 'help-circle';
      if (hist.status === 'Resolved') icon = 'award';
      if (hist.status === 'Rejected') icon = 'x-circle';
      if (hist.status === 'Reopened') icon = 'refresh-cw';

      return `
        <div class="timeline-item status-${statusKey}">
          <div class="timeline-dot">
            <i data-lucide="${icon}" style="width: 14px; height: 14px;"></i>
          </div>
          <div class="timeline-card">
            <div class="timeline-header">
              <div class="timeline-title">
                ${this.renderStatusBadge(hist.status)}
              </div>
              <div class="timeline-time" title="${new Date(hist.timestamp).toLocaleString()}">
                ${this.getTimeAgo(hist.timestamp)} (${this.formatDate(hist.timestamp)})
              </div>
            </div>
            <div class="timeline-meta">
              <i data-lucide="user" style="width: 13px; height: 13px;"></i>
              <strong>${hist.updatedByName || 'System'}</strong>
              <span class="badge" style="background: var(--bg-subtle); color: var(--text-muted); font-size: 0.6875rem;">${hist.updatedByRole || 'system'}</span>
            </div>
            ${hist.note ? `<div class="timeline-note">${hist.note}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    return `<div class="timeline-vertical">${items}</div>`;
  },

  showToast(message, type = 'info', title = '') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: 'check-circle-2',
      error: 'alert-triangle',
      warning: 'alert-circle',
      info: 'info'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">
        <i data-lucide="${icons[type] || 'info'}" style="width: 20px; height: 20px;"></i>
      </div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()" aria-label="Close">
        <i data-lucide="x" style="width: 16px; height: 16px;"></i>
      </button>
    `;

    container.appendChild(toast);
    this.refreshIcons();

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
      }
    }, 4500);
  },

  showModal({ title, body, confirmText = 'Confirm', cancelText = 'Cancel', confirmClass = 'btn-primary', onConfirm }) {
    const container = document.getElementById('modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="modal-backdrop" onclick="Components.closeModal()"></div>
      <div class="modal-box">
        <div class="modal-header">
          <div class="modal-title">${title}</div>
          <button class="modal-close-btn" onclick="Components.closeModal()" aria-label="Close modal">
            <i data-lucide="x" style="width: 20px; height: 20px;"></i>
          </button>
        </div>
        <div class="modal-body">${body}</div>
        <div class="modal-footer">
          <button class="btn btn-outline btn-sm" onclick="Components.closeModal()">${cancelText}</button>
          <button id="modal-confirm-btn" class="btn ${confirmClass} btn-sm">${confirmText}</button>
        </div>
      </div>
    `;

    container.className = 'modal-container active';
    this.refreshIcons();

    const confirmBtn = document.getElementById('modal-confirm-btn');
    if (confirmBtn && onConfirm) {
      confirmBtn.addEventListener('click', async () => {
        try {
          confirmBtn.disabled = true;
          confirmBtn.innerHTML = '<span class="spinner"></span> Processing...';
          await onConfirm();
          Components.closeModal();
        } catch (err) {
          confirmBtn.disabled = false;
          confirmBtn.innerText = confirmText;
          Components.showToast(err.message, 'error', 'Action Failed');
        }
      });
    }
  },

  closeModal() {
    const container = document.getElementById('modal-container');
    if (container) {
      container.className = 'modal-container';
      container.innerHTML = '';
    }
  },

  openLightbox(src) {
    const box = document.getElementById('image-lightbox');
    const img = document.getElementById('lightbox-img');
    if (box && img) {
      img.src = src;
      box.className = 'image-lightbox active';
    }
  },

  closeLightbox() {
    const box = document.getElementById('image-lightbox');
    if (box) {
      box.className = 'image-lightbox';
    }
  },

  renderEmptyState(title, description, icon = 'inbox', actionBtn = '') {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i data-lucide="${icon}" style="width: 32px; height: 32px;"></i>
        </div>
        <div class="empty-state-title">${title}</div>
        <div class="empty-state-desc">${description}</div>
        ${actionBtn}
      </div>
    `;
  }
};
