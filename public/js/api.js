// HostelCare API Service Layer
const API = {
  async request(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    const headers = options.headers || {};

    if (Store.state.token) {
      headers['Authorization'] = `Bearer ${Store.state.token}`;
    }

    // Do not set Content-Type if body is FormData (browser automatically sets boundary)
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    // Trigger visual progress indicator
    const progressBar = document.getElementById('route-progress');
    if (progressBar) progressBar.className = 'route-progress-bar active';

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (progressBar) {
        progressBar.className = 'route-progress-bar complete';
        setTimeout(() => {
          progressBar.className = 'route-progress-bar';
        }, 300);
      }

      if (response.status === 401) {
        // Token expired or invalid
        if (Store.isAuthenticated()) {
          Components.showToast('Your session has expired. Please log in again.', 'warning', 'Session Timeout');
          Store.logout();
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      if (progressBar) progressBar.className = 'route-progress-bar';
      console.error(`[API Error] ${endpoint}:`, error.message);
      throw error;
    }
  },

  // Authentication Endpoints
  auth: {
    login(identifier, password) {
      return API.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      });
    },

    register(userData) {
      return API.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    },

    getMe() {
      return API.request('/auth/me');
    },

    updateProfile(profileData) {
      return API.request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
    },

    changePassword(passwords) {
      return API.request('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify(passwords)
      });
    }
  },

  // Complaint Management Endpoints
  complaints: {
    create(formData) {
      return API.request('/complaints', {
        method: 'POST',
        body: formData
      });
    },

    getAll(params = {}) {
      const query = new URLSearchParams();
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          query.append(key, params[key]);
        }
      });
      return API.request(`/complaints?${query.toString()}`);
    },

    getById(id) {
      return API.request(`/complaints/${id}`);
    },

    updateWardenStatus(id, { status, note, rejectionReason }) {
      return API.request(`/complaints/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note, rejectionReason })
      });
    },

    assign(id, { staffId, estimatedDeadline, note }) {
      return API.request(`/complaints/${id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ staffId, estimatedDeadline, note })
      });
    },

    updateDeadline(id, { estimatedDeadline, note }) {
      return API.request(`/complaints/${id}/deadline`, {
        method: 'PATCH',
        body: JSON.stringify({ estimatedDeadline, note })
      });
    },

    escalate(id, { reason }) {
      return API.request(`/complaints/${id}/escalate`, {
        method: 'PATCH',
        body: JSON.stringify({ reason })
      });
    },

    updateStaffStatus(id, formData) {
      return API.request(`/complaints/${id}/staff-status`, {
        method: 'PATCH',
        body: formData
      });
    },

    confirmResolution(id, { action, rating, feedback, reopenReason }) {
      return API.request(`/complaints/${id}/confirm`, {
        method: 'POST',
        body: JSON.stringify({ action, rating, feedback, reopenReason })
      });
    },

    addComment(id, message) {
      return API.request(`/complaints/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ message })
      });
    },

    getExportUrl(params = {}) {
      const query = new URLSearchParams();
      if (Store.state.token) query.append('token', Store.state.token);
      Object.keys(params).forEach((k) => {
        if (params[k]) query.append(k, params[k]);
      });
      return `${CONFIG.API_BASE_URL}/complaints/export/csv?${query.toString()}`;
    }
  },

  // Notifications Endpoints
  notifications: {
    getAll(unreadOnly = false) {
      return API.request(`/notifications?unreadOnly=${unreadOnly}`);
    },

    markAsRead(id) {
      return API.request(`/notifications/${id}/read`, {
        method: 'PATCH'
      });
    },

    markAllAsRead() {
      return API.request('/notifications/read-all', {
        method: 'PATCH'
      });
    },

    delete(id) {
      return API.request(`/notifications/${id}`, {
        method: 'DELETE'
      });
    }
  },

  // Analytics Endpoints
  analytics: {
    getDashboard() {
      return API.request('/analytics/dashboard');
    }
  },

  // User Administration Endpoints
  users: {
    getAll(params = {}) {
      const query = new URLSearchParams(params);
      return API.request(`/users?${query.toString()}`);
    },

    createStaff(staffData) {
      return API.request('/users/staff', {
        method: 'POST',
        body: JSON.stringify(staffData)
      });
    },

    getStaffList() {
      return API.request('/users/staff-list');
    },

    updateStatus(id, accountStatus) {
      return API.request(`/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ accountStatus })
      });
    },

    getAuditLogs() {
      return API.request('/users/audit-logs');
    }
  }
};
