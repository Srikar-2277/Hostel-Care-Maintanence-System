// HostelCare Main Application Bootstrap Controller
const App = {
  async init() {
    console.log('[HostelCare] Initializing application...');

    // Validate active session if token exists
    if (Store.isAuthenticated()) {
      try {
        const res = await API.auth.getMe();
        Store.setUser(res.user);

        // Fetch unread notifications
        try {
          const notifRes = await API.notifications.getAll(true);
          Store.setUnreadCount(notifRes.unreadCount || 0);
        } catch (e) {}
      } catch (err) {
        console.warn('[HostelCare] Stored token invalid or expired. Clearing session.');
        Store.setAuth(null, null);
      }
    }

    // Subscribe store updates to update navbar and sidebar
    Store.subscribe(() => {
      Components.renderNavbar();
      Components.renderSidebar();
    });

    // Initialize Router
    Router.init();

    // Global Keyboard Handlers (Escape key closes modals and lightbox)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        Components.closeModal();
        Components.closeLightbox();
        App.toggleSidebar(false);
      }
    });

    console.log('[HostelCare] Ready.');
  },

  getDashboardRoute() {
    const role = Store.getUserRole();
    switch (role) {
      case 'student': return '#/student-dashboard';
      case 'warden': return '#/warden-dashboard';
      case 'staff': return '#/staff-dashboard';
      default: return '#/login';
    }
  },

  toggleSidebar(forceState) {
    const sidebar = document.getElementById('main-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (!sidebar || !backdrop) return;

    if (forceState !== undefined) {
      if (forceState) {
        sidebar.classList.add('mobile-open');
        backdrop.classList.add('active');
      } else {
        sidebar.classList.remove('mobile-open');
        backdrop.classList.remove('active');
      }
    } else {
      const isOpen = sidebar.classList.toggle('mobile-open');
      backdrop.classList.toggle('active', isOpen);
    }
  },

  confirmLogout() {
    Components.showModal({
      title: 'Confirm Sign Out',
      body: '<p style="font-size:0.9375rem; color:var(--text-muted);">Are you sure you want to end your current session and sign out of HostelCare?</p>',
      confirmText: 'Sign Out',
      confirmClass: 'btn-danger',
      onConfirm: async () => {
        Store.logout();
        Components.showToast('You have been signed out.', 'info', 'Goodbye');
      }
    });
  }
};

// Auto-run bootstrap on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  App.init();
});
