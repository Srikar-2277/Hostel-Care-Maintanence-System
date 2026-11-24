// Maintenance Staff Assigned Task Details View Controller
const AssignedTaskDetailsView = {
  complaint: null,

  async render(taskId) {
    const container = document.getElementById('app-container');
    if (!container) return;

    try {
      const response = await API.complaints.getById(taskId);
      this.complaint = response.complaint;
      this.renderView();
    } catch (err) {
      container.innerHTML = Components.renderEmptyState(
        'Work Order Not Found',
        err.message || 'You may not be assigned to this ticket or it may not exist.',
        'alert-triangle',
        '<button class="btn btn-primary" onclick="window.location.hash = \'#/staff-dashboard\'">Back to Queue</button>'
      );
      Components.refreshIcons();
    }
  },

  renderView() {
    const container = document.getElementById('app-container');
    if (!container || !this.complaint) return;

    const t = this.complaint;
    const isCompleted = ['Work Completed', 'Awaiting Confirmation', 'Resolved'].includes(t.currentStatus);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.35rem; flex-wrap: wrap;">
            <button class="btn btn-icon btn-sm" onclick="window.location.hash = '#/staff-dashboard'" title="Back to Task Queue">
              <i data-lucide="arrow-left"></i>
            </button>
            <h1 class="page-title" style="margin-bottom: 0;">Job Sheet: ${t.complaintId}</h1>
            ${Components.renderStatusBadge(t.currentStatus)}
            ${Components.renderPriorityBadge(t.priority)}
          </div>
          <p class="page-subtitle">Category: <strong>${t.category}</strong> • Room: <strong>${t.room} (${t.block})</strong></p>
        </div>

        <div class="page-actions">
          <button class="btn btn-outline" onclick="window.location.hash = '#/complaint/${t._id}'">
            <i data-lucide="eye"></i> Full Public Audit View
          </button>
        </div>
      </div>

      <!-- Horizontal Lifecycle Stepper -->
      ${Components.renderHorizontalStepper(t)}

      <!-- Two Column Layout -->
      <div style="display: grid; grid-template-columns: 1fr 340px; gap: 1.5rem;" class="form-grid">
        <!-- Left: Work Instructions & Progress Logger -->
        <div>
          <!-- Problem Scope Card -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="clipboard"></i> Reported Issue Details
              </div>
            </div>

            <div style="font-size: 1.125rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.75rem;">
              ${t.title}
            </div>

            <div style="font-size: 0.9375rem; color: var(--text-main); line-height: 1.6; white-space: pre-wrap; margin-bottom: 1.5rem;">
              ${t.description}
            </div>

            ${t.images && t.images.length > 0 ? `
              <div>
                <div style="font-size: 0.8125rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase;">
                  Photos Uploaded by Student (${t.images.length})
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                  ${t.images.map((img) => `
                    <div style="width: 120px; height: 120px; border-radius: var(--radius-md); overflow: hidden; cursor: pointer; border: 1px solid var(--border-color);" onclick="Components.openLightbox('${img}')">
                      <img src="${img}" alt="Student photo" style="width: 100%; height: 100%; object-fit: cover;" />
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Action Progress Workflow Card -->
          <div class="card" style="border: 2px solid var(--color-primary);">
            <div class="card-header">
              <div class="card-title" style="color: var(--color-primary);">
                <i data-lucide="check-circle-2"></i> Update Job Progress & Log Repair
              </div>
            </div>

            ${t.currentStatus === 'Assigned' ? `
              <div style="padding: 1rem 0;">
                <p style="font-size: 0.9375rem; color: var(--text-muted); margin-bottom: 1.25rem;">
                  This maintenance ticket was delegated to you by the warden. Please acknowledge and accept the assignment to begin scheduling.
                </p>
                <button class="btn btn-primary btn-lg" onclick="AssignedTaskDetailsView.updateStatus('Accepted')">
                  <i data-lucide="check"></i> Acknowledge & Accept Assignment
                </button>
              </div>
            ` : ''}

            ${t.currentStatus === 'Accepted' ? `
              <div style="padding: 1rem 0;">
                <p style="font-size: 0.9375rem; color: var(--text-muted); margin-bottom: 1.25rem;">
                  You have accepted this task. When you arrive at the room or begin work, mark it as <strong>In Progress</strong>.
                </p>
                <button class="btn btn-warning btn-lg" onclick="AssignedTaskDetailsView.updateStatus('In Progress')">
                  <i data-lucide="tool"></i> Start Work (In Progress)
                </button>
              </div>
            ` : ''}

            ${t.currentStatus === 'In Progress' || t.currentStatus === 'Reopened' ? `
              <form id="complete-work-form" onsubmit="AssignedTaskDetailsView.handleCompleteWork(event)">
                <div class="form-group">
                  <label class="form-label" for="task-repair-desc">Repair Description / Work Action Performed <span class="required">*</span></label>
                  <textarea
                    id="task-repair-desc"
                    class="form-textarea"
                    placeholder="Describe exactly what parts were replaced, plumbing sealed, or wiring fixed..."
                    required
                  ></textarea>
                </div>

                <div class="form-group">
                  <label class="form-label" for="task-work-notes">Technician Notes / Usage Advice for Student</label>
                  <input
                    type="text"
                    id="task-work-notes"
                    class="form-control"
                    placeholder="e.g. Tightened terminal screws; kept switch off for 30 mins"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Upload After-Repair Proof Photos (Optional)</label>
                  <input type="file" id="task-after-photos" class="form-control" multiple accept="image/*" />
                </div>

                <div style="margin-top: 1.5rem;">
                  <button type="submit" id="task-complete-btn" class="btn btn-success btn-lg" style="width: 100%;">
                    <i data-lucide="check-square"></i> Submit Work as Completed
                  </button>
                </div>
              </form>
            ` : ''}

            ${isCompleted ? `
              <div style="background: var(--bg-subtle); padding: 1.25rem; border-radius: var(--radius-md);">
                <div style="font-weight: 700; color: var(--color-success-dark); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                  <i data-lucide="check-circle-2"></i> Work Recorded as Completed
                </div>
                <div style="font-size: 0.875rem; color: var(--text-main); margin-bottom: 0.5rem;">
                  <strong>Action:</strong> ${t.repairDescription || 'Repaired by staff.'}
                </div>
                ${t.workNotes ? `<div style="font-size: 0.8125rem; color: var(--text-muted);"><strong>Notes:</strong> ${t.workNotes}</div>` : ''}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Right Column: Student Room Contact & Timeline -->
        <div>
          <!-- Student Room Card -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="map-pin"></i> Target Room & Contact
              </div>
            </div>

            <div style="margin-bottom: 1rem;">
              <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Hostel Room</span>
              <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-primary);">${t.room}</div>
              <div style="font-size: 0.875rem; color: var(--text-muted);">${t.block} • ${t.floor}</div>
              <div style="font-size: 0.8125rem; color: var(--text-light);">${t.hostel}</div>
            </div>

            <div style="border-top: 1px solid var(--border-subtle); padding-top: 0.875rem;">
              <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Student Resident</span>
              <div style="font-weight: 700; color: var(--text-main); font-size: 0.9375rem; margin-top: 2px;">
                ${t.student ? t.student.name : 'Unknown'}
              </div>
              ${t.student && t.student.phone ? `
                <a href="tel:${t.student.phone}" class="btn btn-outline btn-sm" style="margin-top: 0.625rem; width: 100%;">
                  <i data-lucide="phone"></i> Call Student (${t.student.phone})
                </a>
              ` : ''}
            </div>
          </div>

          <!-- Target Deadline Card -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="clock"></i> Target Schedule
              </div>
            </div>

            <div style="font-size: 0.875rem;">
              <div style="color: var(--text-muted); margin-bottom: 0.25rem;">Expected Completion:</div>
              <div style="font-weight: 700; color: var(--text-main); font-size: 1rem;">
                ${Components.formatDate(t.estimatedDeadline)}
              </div>
              <div style="margin-top: 0.5rem;">
                ${Components.renderDeadlineBadge(t.estimatedDeadline, t.currentStatus)}
              </div>
            </div>
          </div>

          <!-- History Trail -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="git-branch"></i> Status Updates
              </div>
            </div>
            ${Components.renderTimeline(t)}
          </div>
        </div>
      </div>
    `;

    Components.refreshIcons();
  },

  async updateStatus(status) {
    try {
      const formData = new FormData();
      formData.append('status', status);
      formData.append('workNotes', `Technician updated work status to ${status}.`);
      await API.complaints.updateStaffStatus(this.complaint._id, formData);
      Components.showToast(`Work order marked as "${status}"`, 'success');
      await this.render(this.complaint._id);
    } catch (e) {
      Components.showToast(e.message, 'error');
    }
  },

  async handleCompleteWork(event) {
    event.preventDefault();
    const btn = document.getElementById('task-complete-btn');
    const desc = document.getElementById('task-repair-desc').value.trim();
    const notes = document.getElementById('task-work-notes').value.trim();
    const photoInput = document.getElementById('task-after-photos');

    if (!desc) {
      Components.showToast('Please describe the repair action performed.', 'error');
      return;
    }

    try {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Recording completion...';

      const formData = new FormData();
      formData.append('status', 'Work Completed');
      formData.append('repairDescription', desc);
      formData.append('workNotes', notes);

      if (photoInput && photoInput.files) {
        for (let i = 0; i < photoInput.files.length; i++) {
          formData.append('afterRepairImages', photoInput.files[i]);
        }
      }

      await API.complaints.updateStaffStatus(this.complaint._id, formData);
      Components.showToast('Work order completed! Student has been notified to verify.', 'success');
      await this.render(this.complaint._id);
    } catch (e) {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="check-square"></i> Submit Work as Completed';
      Components.refreshIcons();
      Components.showToast(e.message, 'error');
    }
  }
};
