// Notifications Inbox View Controller
const NotificationsView = {
  unreadOnly: false,

  async render() {
    const container = document.getElementById('app-container');
    if (!container) return;

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Notifications & In-App Alerts 🔔</h1>
          <p class="page-subtitle">Real-time updates regarding complaint assignments, work updates, and deadline notices</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-outline" onclick="NotificationsView.markAllRead()">
            <i data-lucide="check-check"></i> Mark All as Read
          </button>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
        <button
          class="btn ${!this.unreadOnly ? 'btn-primary' : 'btn-outline'} btn-sm"
          onclick="NotificationsView.toggleFilter(false)"
        >
          All Notifications
        </button>
        <button
          class="btn ${this.unreadOnly ? 'btn-primary' : 'btn-outline'} btn-sm"
          onclick="NotificationsView.toggleFilter(true)"
        >
          Unread Only
        </button>
      </div>

      <!-- Notifications List Container -->
      <div id="notifications-list-container">
        <div style="text-align: center; padding: 2rem;"><span class="spinner"></span> Loading alerts...</div>
      </div>
    `;

    Components.refreshIcons();
    await this.loadNotifications();
  },

  async loadNotifications() {
    const container = document.getElementById('notifications-list-container');
    if (!container) return;

    try {
      const response = await API.notifications.getAll(this.unreadOnly);
      const notifications = response.data || [];
      Store.setUnreadCount(response.unreadCount || 0);

      if (notifications.length === 0) {
        container.innerHTML = Components.renderEmptyState(
          'No notifications',
          this.unreadOnly ? 'You have no unread notifications right now.' : 'You have not received any alerts yet.',
          'bell-off'
        );
        Components.refreshIcons();
        return;
      }

      container.innerHTML = `
        <div class="card" style="padding: 0; overflow: hidden;">
          <div style="display: flex; flex-direction: column;">
            ${notifications.map((n) => `
              <div
                style="padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-color); display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; background: ${n.isRead ? 'var(--bg-surface)' : 'var(--color-primary-light)'}; transition: background 0.15s ease; cursor: ${n.relatedComplaint || n.relatedComplaintId ? 'pointer' : 'default'};"
                onclick="NotificationsView.handleClick('${n._id}', '${n.relatedComplaint || n.relatedComplaintId}')"
              >
                <div style="display: flex; align-items: flex-start; gap: 0.875rem;">
                  <div style="width: 38px; height: 38px; border-radius: 50%; background: ${this.getTypeColor(n.notificationType)}; color: #ffffff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">
                    <i data-lucide="${this.getTypeIcon(n.notificationType)}" style="width: 18px; height: 18px;"></i>
                  </div>
                  <div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                      <strong style="font-size: 0.9375rem; color: var(--text-main);">${n.title}</strong>
                      ${!n.isRead ? '<span style="width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary); display: inline-block;"></span>' : ''}
                      ${n.relatedComplaintId ? `<span class="badge" style="background: var(--bg-surface); color: var(--color-primary); border: 1px solid var(--border-color); font-size: 0.75rem;">${n.relatedComplaintId}</span>` : ''}
                    </div>
                    <div style="font-size: 0.875rem; color: var(--text-muted); margin-top: 0.25rem; line-height: 1.45;">
                      ${n.message}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-light); margin-top: 0.35rem;">
                      ${Components.formatDate(n.createdAt)} • ${Components.getTimeAgo(n.createdAt)}
                    </div>
                  </div>
                </div>

                <div style="display: flex; gap: 0.35rem;" onclick="event.stopPropagation();">
                  ${!n.isRead ? `
                    <button class="btn btn-outline btn-sm" onclick="NotificationsView.markSingleRead('${n._id}')" title="Mark as read">
                      <i data-lucide="check" style="width: 14px; height: 14px;"></i>
                    </button>
                  ` : ''}
                  <button class="btn btn-outline btn-sm" onclick="NotificationsView.deleteSingle('${n._id}')" title="Delete">
                    <i data-lucide="trash-2" style="width: 14px; height: 14px; color: var(--color-danger);"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      Components.refreshIcons();
    } catch (e) {
      container.innerHTML = Components.renderEmptyState('Failed to load notifications', e.message, 'alert-triangle');
      Components.refreshIcons();
    }
  },

  getTypeIcon(type) {
    switch (type) {
      case 'assignment': return 'user-plus';
      case 'confirmation_required': return 'help-circle';
      case 'overdue': return 'alert-triangle';
      case 'escalated': return 'zap';
      case 'reopened': return 'refresh-cw';
      case 'comment': return 'message-square';
      default: return 'bell';
    }
  },

  getTypeColor(type) {
    switch (type) {
      case 'assignment': return '#0284c7';
      case 'confirmation_required': return '#f97316';
      case 'overdue': return '#dc2626';
      case 'escalated': return '#b91c1c';
      case 'reopened': return '#9333ea';
      case 'comment': return '#4f46e5';
      default: return '#3b82f6';
    }
  },

  toggleFilter(unreadOnly) {
    this.unreadOnly = unreadOnly;
    this.render();
  },

  async handleClick(notifId, complaintRef) {
    try {
      await API.notifications.markAsRead(notifId);
      if (complaintRef) {
        window.location.hash = `#/complaint/${complaintRef}`;
      } else {
        await this.loadNotifications();
      }
    } catch (e) {
      if (complaintRef) window.location.hash = `#/complaint/${complaintRef}`;
    }
  },

  async markSingleRead(id) {
    try {
      await API.notifications.markAsRead(id);
      await this.loadNotifications();
    } catch (e) {
      Components.showToast(e.message, 'error');
    }
  },

  async markAllRead() {
    try {
      await API.notifications.markAllAsRead();
      Components.showToast('All notifications marked as read', 'success');
      await this.loadNotifications();
    } catch (e) {
      Components.showToast(e.message, 'error');
    }
  },

  async deleteSingle(id) {
    try {
      await API.notifications.delete(id);
      Components.showToast('Notification deleted', 'info');
      await this.loadNotifications();
    } catch (e) {
      Components.showToast(e.message, 'error');
    }
  }
};
