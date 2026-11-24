// HostelCare Client-Side Hash Router
const Router = {
  routes: [
    { path: '#/', view: () => LandingView.render(), public: true },
    { path: '#/login', view: () => LoginView.render(), public: true },
    { path: '#/register', view: () => RegisterView.render(), public: true },

    // Student Routes
    { path: '#/student-dashboard', view: () => StudentDashboardView.render(), roles: ['student'] },
    { path: '#/submit-complaint', view: () => SubmitComplaintView.render(), roles: ['student'] },
    { path: '#/student-history', view: () => StudentHistoryView.render(), roles: ['student'] },

    // Shared Complaint Details & Tracking Route
    { path: '#/complaint/:id', view: (params) => ComplaintDetailsView.render(params.id), roles: ['student', 'warden', 'staff'] },

    // Warden Routes
    { path: '#/warden-dashboard', view: () => WardenDashboardView.render(), roles: ['warden'] },
    { path: '#/complaint-management', view: () => ComplaintManagementView.render(), roles: ['warden'] },
    { path: '#/staff-management', view: () => StaffManagementView.render(), roles: ['warden'] },
    { path: '#/analytics', view: () => AnalyticsView.render(), roles: ['warden'] },

    // Staff Routes
    { path: '#/staff-dashboard', view: () => StaffDashboardView.render(), roles: ['staff'] },
    { path: '#/assigned-task/:id', view: (params) => AssignedTaskDetailsView.render(params.id), roles: ['staff'] },

    // Shared Authenticated Routes
    { path: '#/notifications', view: () => NotificationsView.render(), roles: ['student', 'warden', 'staff'] },
    { path: '#/profile', view: () => ProfileView.render(), roles: ['student', 'warden', 'staff'] }
  ],

  parseHash() {
    const hash = window.location.hash || '#/';
    const [pathPart, queryPart] = hash.split('?');
    return { path: pathPart, queryString: queryPart || '' };
  },

  matchRoute(currentPath) {
    for (const route of this.routes) {
      // Dynamic param match like #/complaint/:id
      if (route.path.includes(':')) {
        const routeParts = route.path.split('/');
        const currentParts = currentPath.split('/');

        if (routeParts.length === currentParts.length) {
          const params = {};
          let match = true;

          for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
              const paramName = routeParts[i].slice(1);
              params[paramName] = currentParts[i];
            } else if (routeParts[i] !== currentParts[i]) {
              match = false;
              break;
            }
          }

          if (match) {
            return { route, params };
          }
        }
      } else if (route.path === currentPath) {
        return { route, params: {} };
      }
    }
    return null;
  },

  async handleRouteChange() {
    const { path } = this.parseHash();
    const matched = this.matchRoute(path);

    if (!matched) {
      console.warn(`[Router] No route match for ${path}. Redirecting to default.`);
      window.location.hash = Store.isAuthenticated() ? App.getDashboardRoute() : '#/';
      return;
    }

    const { route, params } = matched;

    // Role Guard & Authentication Check
    if (!route.public) {
      if (!Store.isAuthenticated()) {
        Components.showToast('Please sign in to access this page.', 'warning', 'Authentication Required');
        window.location.hash = '#/login';
        return;
      }

      const userRole = Store.getUserRole();
      if (route.roles && !route.roles.includes(userRole)) {
        Components.showToast(`Access restricted for role (${userRole}).`, 'error', 'Permission Denied');
        window.location.hash = App.getDashboardRoute();
        return;
      }
    } else {
      // If user is already authenticated and visits login/register/landing, offer seamless redirect or stay
      if (Store.isAuthenticated() && (path === '#/login' || path === '#/register')) {
        window.location.hash = App.getDashboardRoute();
        return;
      }
    }

    // Update Shell components
    Store.state.activeRoute = path;
    if (path === '#/login' || path === '#/register') {
      document.body.classList.add('auth-view-active');
    } else {
      document.body.classList.remove('auth-view-active');
    }
    Components.renderNavbar();
    Components.renderSidebar();

    // Scroll to top
    const container = document.getElementById('app-container');
    if (container) {
      container.scrollTop = 0;
      container.innerHTML = '<div style="display:flex; justify-content:center; align-items:center; min-height:400px;"><span class="spinner"></span></div>';
    }

    try {
      await route.view(params);
      Components.refreshIcons();
    } catch (err) {
      console.error('[Router View Render Error]', err);
      if (container) {
        container.innerHTML = Components.renderEmptyState(
          'Failed to load view',
          err.message || 'An unexpected error occurred while loading this page.',
          'alert-triangle',
          `<button class="btn btn-primary" onclick="Router.handleRouteChange()">Retry</button>`
        );
        Components.refreshIcons();
      }
    }
  },

  init() {
    window.addEventListener('hashchange', () => this.handleRouteChange());
    this.handleRouteChange();
  }
};
