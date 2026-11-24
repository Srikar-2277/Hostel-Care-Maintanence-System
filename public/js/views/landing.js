// Landing Page View Controller
const LandingView = {
  render() {
    const container = document.getElementById('app-container');
    if (!container) return;

    container.innerHTML = `
      <div style="max-width: 1180px; margin: 0 auto; padding: 2rem 0 4rem;">
        <!-- Hero Section -->
        <div style="text-align: center; padding: 3rem 1rem 3.5rem; background: linear-gradient(180deg, var(--color-primary-light) 0%, transparent 100%); border-radius: var(--radius-lg); margin-bottom: 3.5rem;">
          <div class="badge" style="background: var(--bg-surface); color: var(--color-primary); font-weight: 700; border: 1px solid var(--border-color); padding: 0.4rem 1rem; margin-bottom: 1.25rem;">
            <i data-lucide="shield-check" style="width: 16px; height: 16px;"></i> Next-Gen Campus Maintenance System
          </div>
          
          <h1 style="font-size: clamp(2rem, 5vw, 3.25rem); font-weight: 800; letter-spacing: -0.03em; max-width: 820px; margin: 0 auto 1.25rem; line-height: 1.15;">
            Resolve Hostel Complaints with <span style="background: linear-gradient(135deg, #2563eb, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Complete Transparency</span>
          </h1>

          <p style="font-size: 1.125rem; color: var(--text-muted); max-width: 660px; margin: 0 auto 2.25rem; line-height: 1.6;">
            A centralized digital lifecycle tracking system for university hostels. Real-time status updates, intelligent duplicate detection, warden delegation, and mandatory student resolution verification.
          </p>

          <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-primary btn-lg" onclick="window.location.hash = '#/login'">
              <i data-lucide="log-in"></i> Sign In to Portal
            </button>
            <button class="btn btn-outline btn-lg" onclick="window.location.hash = '#/register'">
              <i data-lucide="user-plus"></i> Student Registration
            </button>
          </div>
        </div>

        <!-- 1-Click Interactive Demo Login Accounts Drawer -->
        <div class="card" style="border: 2px solid var(--color-primary); background: var(--bg-surface); box-shadow: var(--shadow-lg); margin-bottom: 3.5rem;">
          <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
            <div>
              <div class="card-title" style="color: var(--color-primary);">
                <i data-lucide="sparkles"></i> 1-Click Demo Evaluation Accounts
              </div>
              <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px;">
                Instant login to evaluate all 3 dashboards without typing credentials.
              </div>
            </div>
            <span class="badge" style="background: var(--color-primary-light); color: var(--color-primary); font-weight: 700;">Pre-Configured</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; padding-top: 0.5rem;">
            <!-- Student Demo -->
            <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; background: var(--bg-subtle);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                <span class="badge" style="background: #eff6ff; color: #1d4ed8; font-weight: 700;">🎓 Student</span>
                <span style="font-size: 0.75rem; color: var(--text-light);">Room A-304</span>
              </div>
              <div style="font-weight: 700; font-size: 1rem; color: var(--text-main); margin-bottom: 0.25rem;">Rahul Sharma</div>
              <div style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1rem;">rahul@hostelcare.edu</div>
              <p style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1rem;">Submit issues, track live timeline, verify completed repairs, or reopen lingering problems.</p>
              <button class="btn btn-primary btn-sm" style="width: 100%;" onclick="LoginView.quickLogin('rahul@hostelcare.edu', 'student123')">
                <i data-lucide="arrow-right"></i> Launch Student View
              </button>
            </div>

            <!-- Warden Demo -->
            <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; background: var(--bg-subtle);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                <span class="badge" style="background: #fef3c7; color: #b45309; font-weight: 700;">🛡️ Warden / Admin</span>
                <span style="font-size: 0.75rem; color: var(--text-light);">Chief Office</span>
              </div>
              <div style="font-weight: 700; font-size: 1rem; color: var(--text-main); margin-bottom: 0.25rem;">Dr. Ramesh Verma</div>
              <div style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1rem;">warden@hostelcare.edu</div>
              <p style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1rem;">Review complaints, assign workers, set SLA deadlines, escalate emergencies, export CSV reports.</p>
              <button class="btn btn-primary btn-sm" style="width: 100%;" onclick="LoginView.quickLogin('warden@hostelcare.edu', 'warden123')">
                <i data-lucide="arrow-right"></i> Launch Warden View
              </button>
            </div>

            <!-- Staff Demo -->
            <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; background: var(--bg-subtle);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                <span class="badge" style="background: #ecfeff; color: #0e7490; font-weight: 700;">🔧 Electrician</span>
                <span style="font-size: 0.75rem; color: var(--text-light);">Maintenance Crew</span>
              </div>
              <div style="font-weight: 700; font-size: 1rem; color: var(--text-main); margin-bottom: 0.25rem;">Mr. Suresh Kumar</div>
              <div style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1rem;">suresh@hostelcare.edu</div>
              <p style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1rem;">View assigned work orders, accept jobs, update progress, log repair notes, upload completion photos.</p>
              <button class="btn btn-primary btn-sm" style="width: 100%;" onclick="LoginView.quickLogin('suresh@hostelcare.edu', 'staff123')">
                <i data-lucide="arrow-right"></i> Launch Staff View
              </button>
            </div>
          </div>
        </div>

        <!-- 9-Stage Lifecycle Architecture Showcase -->
        <div style="margin-bottom: 3.5rem;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <h2 style="font-size: 1.75rem; font-weight: 800; margin-bottom: 0.5rem;">Complete 9-Stage Lifecycle Workflow</h2>
            <p style="color: var(--text-muted); max-width: 600px; margin: 0 auto;">No lost complaints. Every status change is auditable with strict role permissions.</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1rem;">
            <div class="card" style="padding: 1.25rem; border-top: 4px solid #64748b;">
              <div style="font-weight: 700; font-size: 0.9375rem; color: var(--text-main); margin-bottom: 0.35rem;">1. Submission</div>
              <p style="font-size: 0.8125rem; color: var(--text-muted);">Student submits with category, priority, room, and photo. Duplicate issues automatically linked.</p>
            </div>

            <div class="card" style="padding: 1.25rem; border-top: 4px solid #f59e0b;">
              <div style="font-weight: 700; font-size: 0.9375rem; color: var(--text-main); margin-bottom: 0.35rem;">2. Warden Review</div>
              <p style="font-size: 0.8125rem; color: var(--text-muted);">Warden evaluates legitimacy, requests info, approves or rejects with mandatory reason.</p>
            </div>

            <div class="card" style="padding: 1.25rem; border-top: 4px solid #3b82f6;">
              <div style="font-weight: 700; font-size: 0.9375rem; color: var(--text-main); margin-bottom: 0.35rem;">3. Assignment & SLA</div>
              <p style="font-size: 0.8125rem; color: var(--text-muted);">Assigned to specialized technician with an estimated resolution deadline countdown.</p>
            </div>

            <div class="card" style="padding: 1.25rem; border-top: 4px solid #06b6d4;">
              <div style="font-weight: 700; font-size: 0.9375rem; color: var(--text-main); margin-bottom: 0.35rem;">4. Execution</div>
              <p style="font-size: 0.8125rem; color: var(--text-muted);">Staff marks Accepted, In Progress, and logs repair notes plus after-repair proof photos.</p>
            </div>

            <div class="card" style="padding: 1.25rem; border-top: 4px solid #10b981;">
              <div style="font-weight: 700; font-size: 0.9375rem; color: var(--text-main); margin-bottom: 0.35rem;">5. Student Verification</div>
              <p style="font-size: 0.8125rem; color: var(--text-muted);">Student inspects the fix. Confirms resolution with star rating OR reports issue persists to reopen!</p>
            </div>
          </div>
        </div>

        <!-- Footer / Credits -->
        <div style="text-align: center; border-top: 1px solid var(--border-color); padding-top: 2rem; color: var(--text-light); font-size: 0.8125rem;">
          HostelCare – Smart Hostel Maintenance & Complaint Management System • Built with Node.js, Express, MongoDB & Modern Vanilla JS
        </div>
      </div>
    `;

    Components.refreshIcons();
  }
};
