// Student Registration View Controller
const RegisterView = {
  render() {
    const container = document.getElementById('app-container');
    if (!container) return;

    container.innerHTML = `
      <div class="auth-page-wrapper">
        <div class="auth-card-box auth-card-box-wide">
          <div class="card auth-glass-card">
            <div style="text-align: center; margin-bottom: 2rem;">
              <div style="display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.3rem 0.8rem; background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 999px; font-size: 0.75rem; font-weight: 700; color: var(--color-primary); margin-bottom: 1rem;">
                <i data-lucide="shield-check" style="width: 14px; height: 14px;"></i> New Resident Enrollment
              </div>
              <div class="brand-icon-box" style="margin: 0 auto 0.875rem; width: 48px; height: 48px; border-radius: 14px; box-shadow: 0 8px 20px rgba(37, 99, 235, 0.45);">
                <i data-lucide="user-plus" style="width: 24px; height: 24px;"></i>
              </div>
              <h1 style="font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.35rem; letter-spacing: -0.02em;">Student Registration</h1>
              <p style="font-size: 0.875rem; color: var(--text-muted);">Register your room profile to lodge and track hostel maintenance complaints</p>
            </div>

          <div id="register-error-alert" style="display: none; padding: 0.75rem 1rem; border-radius: var(--radius-md); background: var(--color-danger-bg); color: var(--color-danger-dark); border: 1px solid rgba(239, 68, 68, 0.3); font-size: 0.8125rem; margin-bottom: 1.25rem;"></div>

          <form id="register-form" onsubmit="RegisterView.handleSubmit(event)">
            <div class="form-grid">
              <div class="form-group col-span-2">
                <label class="form-label" for="reg-name">Full Name <span class="required">*</span></label>
                <input type="text" id="reg-name" class="form-control" placeholder="e.g. Ananya Sharma" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="reg-email">University Email <span class="required">*</span></label>
                <input type="email" id="reg-email" class="form-control" placeholder="ananya@hostelcare.edu" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="reg-id">Student ID / Roll No. <span class="required">*</span></label>
                <input type="text" id="reg-id" class="form-control" placeholder="e.g. STU-2026-104" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="reg-phone">Contact Phone Number</label>
                <input type="tel" id="reg-phone" class="form-control" placeholder="+91 98765 00000" />
              </div>

              <div class="form-group">
                <label class="form-label" for="reg-hostel">Hostel Complex</label>
                <input type="text" id="reg-hostel" class="form-control" value="Mandakini & Cauvery Complex" />
              </div>

              <div class="form-group">
                <label class="form-label" for="reg-block">Hostel Block <span class="required">*</span></label>
                <select id="reg-block" class="form-select" required>
                  <option value="">Select Block</option>
                  <option value="Block A">Block A</option>
                  <option value="Block B">Block B</option>
                  <option value="Block C">Block C</option>
                  <option value="Block D">Block D</option>
                  <option value="Girl's Wing 1">Girl's Wing 1</option>
                  <option value="Girl's Wing 2">Girl's Wing 2</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="reg-floor">Floor <span class="required">*</span></label>
                <select id="reg-floor" class="form-select" required>
                  <option value="">Select Floor</option>
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="1st Floor">1st Floor</option>
                  <option value="2nd Floor">2nd Floor</option>
                  <option value="3rd Floor">3rd Floor</option>
                  <option value="4th Floor">4th Floor</option>
                </select>
              </div>

              <div class="form-group col-span-2">
                <label class="form-label" for="reg-room">Room Number <span class="required">*</span></label>
                <input type="text" id="reg-room" class="form-control" placeholder="e.g. A-304" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="reg-password">Password <span class="required">*</span></label>
                <input type="password" id="reg-password" class="form-control" placeholder="Minimum 6 characters" minlength="6" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="reg-confirm-password">Confirm Password <span class="required">*</span></label>
                <input type="password" id="reg-confirm-password" class="form-control" placeholder="Repeat password" minlength="6" required />
              </div>
            </div>

            <button type="submit" id="reg-submit-btn" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 1rem; margin-bottom: 1rem;">
              <i data-lucide="check"></i> Complete Student Registration
            </button>
          </form>

          <div style="text-align: center; font-size: 0.875rem; color: var(--text-muted);">
            Already have an account? <a href="#/login" style="font-weight: 600;">Sign in here</a>
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

  async handleSubmit(event) {
    event.preventDefault();
    const alertBox = document.getElementById('register-error-alert');
    if (alertBox) alertBox.style.display = 'none';

    const password = document.getElementById('reg-password').value;
    const confirmPass = document.getElementById('reg-confirm-password').value;

    if (password !== confirmPass) {
      if (alertBox) {
        alertBox.innerText = 'Passwords do not match. Please verify.';
        alertBox.style.display = 'block';
      }
      return;
    }

    const userData = {
      name: document.getElementById('reg-name').value.trim(),
      email: document.getElementById('reg-email').value.trim(),
      studentOrEmpId: document.getElementById('reg-id').value.trim(),
      phone: document.getElementById('reg-phone').value.trim(),
      hostelName: document.getElementById('reg-hostel').value.trim(),
      hostelBlock: document.getElementById('reg-block').value,
      floor: document.getElementById('reg-floor').value,
      roomNumber: document.getElementById('reg-room').value.trim(),
      password
    };

    const btn = document.getElementById('reg-submit-btn');

    try {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Creating Account...';

      const response = await API.auth.register(userData);
      Store.setAuth(response.token, response.user);
      Components.showToast('Registration complete! Welcome to HostelCare.', 'success', 'Account Created');
      window.location.hash = '#/student-dashboard';
    } catch (error) {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="check"></i> Complete Student Registration';
      Components.refreshIcons();
      if (alertBox) {
        alertBox.innerText = error.message;
        alertBox.style.display = 'block';
      }
    }
  }
};
