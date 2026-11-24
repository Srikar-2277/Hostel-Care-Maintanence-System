// Login View Controller
const LoginView = {
  render() {
    const container = document.getElementById('app-container');
    if (!container) return;

    container.innerHTML = `
      <div class="auth-page-wrapper">
        <div class="auth-card-box">
          <div class="card auth-glass-card">
            <div style="text-align: center; margin-bottom: 1.75rem;">
              <div style="display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.3rem 0.8rem; background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 999px; font-size: 0.75rem; font-weight: 700; color: var(--color-primary); margin-bottom: 0.875rem;">
                <i data-lucide="shield-check" style="width: 14px; height: 14px;"></i> Mandakini &amp; Cauvery Complex
              </div>
              <div class="brand-icon-box" style="margin: 0 auto 0.875rem; width: 50px; height: 50px; border-radius: 14px; box-shadow: 0 8px 20px rgba(37, 99, 235, 0.45);">
                <i data-lucide="building-2" style="width: 26px; height: 26px;"></i>
              </div>
              <h1 style="font-size: 1.625rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.35rem; letter-spacing: -0.02em;">Welcome Back</h1>
              <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.4;">Sign in to your HostelCare account</p>
            </div>

            <!-- Alert Container for Errors -->
            <div id="login-error-alert" style="display: none; padding: 0.75rem 1rem; border-radius: var(--radius-md); background: var(--color-danger-bg); color: var(--color-danger-dark); border: 1px solid rgba(239, 68, 68, 0.3); font-size: 0.8125rem; margin-bottom: 1.25rem;"></div>

            <form id="login-form" onsubmit="LoginView.handleSubmit(event)">
              <div class="form-group">
                <label class="form-label" for="login-identifier">Email or Student/Employee ID <span class="required">*</span></label>
                <div style="position: relative;">
                  <i data-lucide="user" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 17px; height: 17px; color: var(--text-light); pointer-events: none;"></i>
                  <input
                    type="text"
                    id="login-identifier"
                    class="form-control"
                    style="padding-left: 2.65rem;"
                    placeholder="e.g. rahul@hostelcare.edu or STU-2024-001"
                    required
                    autocomplete="username"
                    autofocus
                  />
                </div>
              </div>

              <div class="form-group">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.45rem;">
                  <label class="form-label" for="login-password" style="margin-bottom: 0;">Password <span class="required">*</span></label>
                </div>
                <div style="position: relative;">
                  <i data-lucide="lock" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 17px; height: 17px; color: var(--text-light); pointer-events: none;"></i>
                  <input
                    type="password"
                    id="login-password"
                    class="form-control"
                    style="padding-left: 2.65rem; padding-right: 2.75rem;"
                    placeholder="••••••••"
                    required
                    autocomplete="current-password"
                  />
                  <button
                    type="button"
                    id="toggle-pwd-btn"
                    onclick="LoginView.togglePasswordVisibility()"
                    style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px; display: flex; align-items: center;"
                    title="Show or hide password"
                  >
                    <i data-lucide="eye" id="toggle-pwd-icon" style="width: 17px; height: 17px;"></i>
                  </button>
                </div>
              </div>

              <button type="submit" id="login-submit-btn" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 0.5rem; margin-bottom: 1.35rem; font-weight: 700;">
                <i data-lucide="log-in"></i> Sign In
              </button>
            </form>

            <!-- Quick Fill Buttons for Grading / Demo -->
            <div style="border-top: 1px solid var(--border-color); padding-top: 1.25rem; margin-top: 0.5rem;">
              <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-light); margin-bottom: 0.75rem; text-align: center; letter-spacing: 0.05em;">
                ⚡ Quick Demo 1-Click Login
              </div>

              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
                <button type="button" class="btn btn-secondary btn-sm demo-role-btn" onclick="LoginView.quickLogin('rahul@hostelcare.edu', 'student123')" title="Student Account (Rahul)">
                  🎓 Student
                </button>
                <button type="button" class="btn btn-secondary btn-sm demo-role-btn" onclick="LoginView.quickLogin('warden@hostelcare.edu', 'warden123')" title="Warden Account (Dr. Sharma)">
                  🛡️ Warden
                </button>
                <button type="button" class="btn btn-secondary btn-sm demo-role-btn" onclick="LoginView.quickLogin('suresh@hostelcare.edu', 'staff123')" title="Staff Account (Suresh)">
                  🔧 Staff
                </button>
              </div>
            </div>

            <div style="text-align: center; margin-top: 1.35rem; font-size: 0.875rem; color: var(--text-muted);">
              New student? <a href="#/register" style="font-weight: 600;">Create an account</a>
            </div>

            <div style="text-align: center; margin-top: 1rem; font-size: 0.75rem; color: var(--text-light); display: flex; align-items: center; justify-content: center; gap: 0.35rem;">
              <i data-lucide="shield" style="width: 13px; height: 13px;"></i> Encrypted Session · Student Living Ops
            </div>
          </div>

          <div style="text-align: center; margin-top: 1.15rem;">
            <a href="#/" style="font-size: 0.8125rem; color: rgba(255, 255, 255, 0.9); text-shadow: 0 1px 3px rgba(0,0,0,0.6); display: inline-flex; align-items: center; gap: 0.35rem; font-weight: 500;">
              <i data-lucide="arrow-left" style="width: 14px; height: 14px;"></i> Back to Home
            </a>
          </div>
        </div>
      </div>
    `;

    Components.refreshIcons();
  },

  togglePasswordVisibility() {
    const passInput = document.getElementById('login-password');
    const icon = document.getElementById('toggle-pwd-icon');
    if (!passInput) return;
    if (passInput.type === 'password') {
      passInput.type = 'text';
      if (icon) icon.setAttribute('data-lucide', 'eye-off');
    } else {
      passInput.type = 'password';
      if (icon) icon.setAttribute('data-lucide', 'eye');
    }
    Components.refreshIcons();
  },

  async handleSubmit(event) {
    event.preventDefault();
    const identifier = document.getElementById('login-identifier').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-submit-btn');
    const alertBox = document.getElementById('login-error-alert');

    if (alertBox) alertBox.style.display = 'none';

    try {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Authenticating...';

      const response = await API.auth.login(identifier, password);
      Store.setAuth(response.token, response.user);
      Components.showToast(`Welcome back, ${response.user.name}!`, 'success', 'Signed In');

      // Fetch unread notifications count
      try {
        const notifRes = await API.notifications.getAll(true);
        Store.setUnreadCount(notifRes.unreadCount || 0);
      } catch (e) {
        // Soft fail
      }

      window.location.hash = App.getDashboardRoute();
    } catch (error) {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="log-in"></i> Sign In';
      Components.refreshIcons();
      if (alertBox) {
        alertBox.innerText = error.message;
        alertBox.style.display = 'block';
      }
    }
  },

  async quickLogin(identifier, password) {
    const identInput = document.getElementById('login-identifier');
    const passInput = document.getElementById('login-password');
    if (identInput && passInput) {
      identInput.value = identifier;
      passInput.value = password;
      const form = document.getElementById('login-form');
      if (form) form.dispatchEvent(new Event('submit'));
    } else {
      // Direct API call if invoked from Landing page
      try {
        const response = await API.auth.login(identifier, password);
        Store.setAuth(response.token, response.user);
        Components.showToast(`Signed in as ${response.user.name}`, 'success');

        try {
          const notifRes = await API.notifications.getAll(true);
          Store.setUnreadCount(notifRes.unreadCount || 0);
        } catch (e) {}

        window.location.hash = App.getDashboardRoute();
      } catch (error) {
        Components.showToast(error.message, 'error', 'Login Failed');
        window.location.hash = '#/login';
      }
    }
  }
};
