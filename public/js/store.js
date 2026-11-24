// HostelCare Client-Side Reactive State Store
const Store = {
  state: {
    token: localStorage.getItem('hc_token') || null,
    user: JSON.parse(localStorage.getItem('hc_user') || 'null'),
    theme: localStorage.getItem('hc_theme') || 'light',
    unreadCount: 0,
    activeRoute: window.location.hash || '#/'
  },

  listeners: [],

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  },

  notify() {
    this.listeners.forEach((listener) => listener(this.state));
  },

  setAuth(token, user) {
    this.state.token = token;
    this.state.user = user;
    if (token) {
      localStorage.setItem('hc_token', token);
      localStorage.setItem('hc_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hc_token');
      localStorage.removeItem('hc_user');
    }
    this.notify();
  },

  setUser(user) {
    this.state.user = user;
    localStorage.setItem('hc_user', JSON.stringify(user));
    this.notify();
  },

  setTheme(theme) {
    this.state.theme = theme;
    localStorage.setItem('hc_theme', theme);
    document.body.className = `theme-${theme}`;
    this.notify();
  },

  toggleTheme() {
    const nextTheme = this.state.theme === 'light' ? 'dark' : 'light';
    this.setTheme(nextTheme);
  },

  setUnreadCount(count) {
    this.state.unreadCount = count;
    this.notify();
  },

  isAuthenticated() {
    return !!this.state.token && !!this.state.user;
  },

  getUserRole() {
    return this.state.user ? this.state.user.role : null;
  },

  isStudent() {
    return this.getUserRole() === 'student';
  },

  isWarden() {
    return this.getUserRole() === 'warden';
  },

  isStaff() {
    return this.getUserRole() === 'staff';
  },

  logout() {
    this.setAuth(null, null);
    this.state.unreadCount = 0;
    window.location.hash = '#/login';
  }
};

// Initialize theme on script run
(function initTheme() {
  const saved = localStorage.getItem('hc_theme') || 'light';
  document.body.className = `theme-${saved}`;
})();
