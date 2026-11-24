// User Profile & Settings View Controller
const ProfileView = {
  async render() {
    const container = document.getElementById('app-container');
    if (!container) return;

    // Refresh current user info from API
    let user = Store.state.user;
    try {
      const res = await API.auth.getMe();
      if (res.user) {
        user = res.user;
        Store.setUser(user);
      }
    } catch (e) {}

    const isStudent = user.role === 'student';

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Account Profile & Settings</h1>
          <p class="page-subtitle">Manage personal contact details, hostel room assignment, and security preferences</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 320px 1fr; gap: 1.5rem;" class="form-grid">
        <!-- Left: User Identity Card -->
        <div>
          <div class="card" style="text-align: center; padding: 2rem 1.5rem;">
            <div class="user-avatar" style="width: 72px; height: 72px; margin: 0 auto 1rem; font-size: 1.75rem;">
              ${user.name.charAt(0).toUpperCase()}
            </div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">${user.name}</h2>
            <div style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 0.5rem;">${user.email}</div>
            
            <span class="badge" style="background: var(--color-primary-light); color: var(--color-primary); font-weight: 700; text-transform: uppercase;">
              ${user.role} Account
            </span>

            <div style="border-top: 1px solid var(--border-color); margin-top: 1.5rem; padding-top: 1.25rem; text-align: left; font-size: 0.875rem;">
              <div style="margin-bottom: 0.5rem;">
                <span style="color: var(--text-muted);">Identifier ID:</span>
                <strong style="float: right;"><code>${user.studentOrEmpId}</code></strong>
              </div>
              <div style="margin-bottom: 0.5rem;">
                <span style="color: var(--text-muted);">Phone:</span>
                <strong style="float: right;">${user.phone || '—'}</strong>
              </div>
              ${isStudent ? `
                <div style="margin-bottom: 0.5rem;">
                  <span style="color: var(--text-muted);">Hostel Block:</span>
                  <strong style="float: right;">${user.hostelBlock || '—'}</strong>
                </div>
                <div>
                  <span style="color: var(--text-muted);">Room Number:</span>
                  <strong style="float: right; color: var(--color-primary);">${user.roomNumber || '—'}</strong>
                </div>
              ` : ''}
              ${user.role === 'staff' ? `
                <div>
                  <span style="color: var(--text-muted);">Specialty:</span>
                  <strong style="float: right; color: var(--color-primary);">${user.specialty}</strong>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Theme Appearance Card -->
          <div class="card">
            <div class="card-header">
              <div class="card-title" style="font-size: 1rem;">
                <i data-lucide="palette"></i> Appearance Theme
              </div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-weight: 600; font-size: 0.875rem; color: var(--text-main);">Dark Mode</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Switch between dark & light UI themes</div>
              </div>
              <button class="btn btn-outline btn-sm" onclick="Store.toggleTheme(); ProfileView.render();">
                <i data-lucide="${Store.state.theme === 'dark' ? 'sun' : 'moon'}"></i>
                ${Store.state.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Edit Forms -->
        <div>
          <!-- Edit Profile Form -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="edit-3"></i> Edit Personal & Location Details
              </div>
            </div>

            <form onsubmit="ProfileView.handleUpdateProfile(event)">
              <div class="form-grid">
                <div class="form-group col-span-2">
                  <label class="form-label" for="prof-name">Full Name <span class="required">*</span></label>
                  <input type="text" id="prof-name" class="form-control" value="${user.name}" required />
                </div>

                <div class="form-group">
                  <label class="form-label" for="prof-phone">Phone Number</label>
                  <input type="tel" id="prof-phone" class="form-control" value="${user.phone || ''}" placeholder="+91 98765 43210" />
                </div>

                <div class="form-group">
                  <label class="form-label" for="prof-hostel">Hostel Complex</label>
                  <input type="text" id="prof-hostel" class="form-control" value="${user.hostelName || 'Mandakini & Cauvery Complex'}" />
                </div>

                ${isStudent ? `
                  <div class="form-group">
                    <label class="form-label" for="prof-block">Hostel Block</label>
                    <select id="prof-block" class="form-select">
                      ${CONFIG.HOSTEL_BLOCKS.map((b) => `<option value="${b}" ${b === user.hostelBlock ? 'selected' : ''}>${b}</option>`).join('')}
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="prof-floor">Floor</label>
                    <select id="prof-floor" class="form-select">
                      ${CONFIG.FLOORS.map((f) => `<option value="${f}" ${f === user.floor ? 'selected' : ''}>${f}</option>`).join('')}
                    </select>
                  </div>

                  <div class="form-group col-span-2">
                    <label class="form-label" for="prof-room">Room Number</label>
                    <input type="text" id="prof-room" class="form-control" value="${user.roomNumber || ''}" placeholder="e.g. A-304" />
                  </div>
                ` : ''}
              </div>

              <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
                <button type="submit" id="prof-update-btn" class="btn btn-primary">
                  <i data-lucide="save"></i> Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          <!-- Change Password Form -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="lock"></i> Change Security Password
              </div>
            </div>

            <form onsubmit="ProfileView.handleChangePassword(event)">
              <div class="form-grid">
                <div class="form-group col-span-2">
                  <label class="form-label" for="pwd-current">Current Password <span class="required">*</span></label>
                  <input type="password" id="pwd-current" class="form-control" placeholder="••••••••" required />
                </div>

                <div class="form-group">
                  <label class="form-label" for="pwd-new">New Password <span class="required">*</span></label>
                  <input type="password" id="pwd-new" class="form-control" placeholder="Min 6 characters" minlength="6" required />
                </div>

                <div class="form-group">
                  <label class="form-label" for="pwd-confirm">Confirm New Password <span class="required">*</span></label>
                  <input type="password" id="pwd-confirm" class="form-control" placeholder="Repeat new password" minlength="6" required />
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
                <button type="submit" id="pwd-update-btn" class="btn btn-secondary">
                  <i data-lucide="key"></i> Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    Components.refreshIcons();
  },

  async handleUpdateProfile(event) {
    event.preventDefault();
    const btn = document.getElementById('prof-update-btn');

    const updateData = {
      name: document.getElementById('prof-name').value.trim(),
      phone: document.getElementById('prof-phone').value.trim(),
      hostelName: document.getElementById('prof-hostel').value.trim()
    };

    const blockInput = document.getElementById('prof-block');
    if (blockInput) updateData.hostelBlock = blockInput.value;

    const floorInput = document.getElementById('prof-floor');
    if (floorInput) updateData.floor = floorInput.value;

    const roomInput = document.getElementById('prof-room');
    if (roomInput) updateData.roomNumber = roomInput.value.trim();

    try {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Saving...';

      const res = await API.auth.updateProfile(updateData);
      Store.setUser(res.user);
      Components.showToast('Profile updated successfully!', 'success');
      this.render();
    } catch (e) {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="save"></i> Save Profile Changes';
      Components.refreshIcons();
      Components.showToast(e.message, 'error');
    }
  },

  async handleChangePassword(event) {
    event.preventDefault();
    const btn = document.getElementById('pwd-update-btn');
    const currentPassword = document.getElementById('pwd-current').value;
    const newPassword = document.getElementById('pwd-new').value;
    const confirmPassword = document.getElementById('pwd-confirm').value;

    if (newPassword !== confirmPassword) {
      Components.showToast('New passwords do not match.', 'error');
      return;
    }

    try {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Changing...';

      await API.auth.changePassword({ currentPassword, newPassword });
      Components.showToast('Password changed successfully!', 'success');
      document.getElementById('pwd-current').value = '';
      document.getElementById('pwd-new').value = '';
      document.getElementById('pwd-confirm').value = '';
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="key"></i> Update Password';
      Components.refreshIcons();
    } catch (e) {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="key"></i> Update Password';
      Components.refreshIcons();
      Components.showToast(e.message, 'error');
    }
  }
};
