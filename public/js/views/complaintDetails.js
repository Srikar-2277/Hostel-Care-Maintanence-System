// Complaint Details & Real-Time Lifecycle Tracking View
const ComplaintDetailsView = {
  complaint: null,

  async render(complaintIdOrCode) {
    const container = document.getElementById('app-container');
    if (!container) return;

    try {
      const response = await API.complaints.getById(complaintIdOrCode);
      this.complaint = response.complaint;
      this.renderView();
    } catch (err) {
      container.innerHTML = Components.renderEmptyState(
        'Complaint Not Found',
        err.message || 'Could not retrieve ticket details. It may have been removed or you may lack authorization.',
        'alert-octagon',
        `<button class="btn btn-primary" onclick="window.history.back()">Go Back</button>`
      );
      Components.refreshIcons();
    }
  },

  renderView() {
    const container = document.getElementById('app-container');
    if (!container || !this.complaint) return;

    const c = this.complaint;
    const user = Store.state.user || {};
    const role = user.role;

    const isStudentOwner = role === 'student' && c.student && (c.student._id === user._id || c.student === user._id);
    const isWarden = role === 'warden';
    const isAssignedStaff = role === 'staff' && c.assignedStaff && (c.assignedStaff._id === user._id || c.assignedStaff === user._id);

    // Overdue calculation
    const isOverdue =
      !['Resolved', 'Rejected'].includes(c.currentStatus) &&
      c.estimatedDeadline &&
      new Date() > new Date(c.estimatedDeadline);

    // Format deadline countdown
    let deadlineCountdownText = '';
    if (c.estimatedDeadline && !['Resolved', 'Rejected'].includes(c.currentStatus)) {
      const diffMs = new Date(c.estimatedDeadline) - new Date();
      const diffHours = Math.round(diffMs / (1000 * 60 * 60));
      if (diffHours < 0) {
        deadlineCountdownText = `🚨 OVERDUE by ${Math.abs(diffHours)} hour${Math.abs(diffHours) !== 1 ? 's' : ''}`;
      } else {
        deadlineCountdownText = `⏱️ ${diffHours > 24 ? Math.round(diffHours / 24) + ' days' : diffHours + ' hours'} remaining`;
      }
    }

    container.innerHTML = `
      <div class="page-header">
        <div>
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.35rem; flex-wrap: wrap;">
            <button class="btn btn-icon btn-sm" onclick="window.history.back()" title="Back">
              <i data-lucide="arrow-left"></i>
            </button>
            <h1 class="page-title" style="margin-bottom: 0;">Ticket: ${c.complaintId}</h1>
            ${Components.renderStatusBadge(c.currentStatus)}
            ${Components.renderPriorityBadge(c.priority)}
            ${c.isEscalated ? '<span class="badge" style="background: #fef2f2; color: #dc2626; border: 1px solid #ef4444; font-weight:800;">⚡ ESCALATED</span>' : ''}
            ${c.isDuplicateWarning ? `<span class="badge badge-warning" title="Linked to previous complaint: ${c.linkedComplaintId}">⚠️ Duplicate Alert</span>` : ''}
          </div>
          <p class="page-subtitle">Submitted on ${Components.formatDate(c.createdAt)} • Category: <strong>${c.category}</strong></p>
        </div>

        <!-- Role Action Buttons in Header -->
        <div class="page-actions">
          ${this.renderHeaderActions(c, isStudentOwner, isWarden, isAssignedStaff)}
        </div>
      </div>

      <!-- Horizontal 9-Stage Lifecycle Stepper -->
      ${Components.renderHorizontalStepper(c)}

      <!-- Deadline Banner if Assigned -->
      ${c.estimatedDeadline && !['Resolved', 'Rejected'].includes(c.currentStatus) ? `
        <div class="deadline-banner ${isOverdue ? 'overdue' : 'normal'}">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <i data-lucide="${isOverdue ? 'alert-triangle' : 'clock'}" style="width: 24px; height: 24px;"></i>
            <div>
              <div style="font-weight: 700; font-size: 0.9375rem;">
                ${isOverdue ? 'Resolution Deadline Exceeded (Overdue)' : 'Expected Resolution Schedule'}
              </div>
              <div style="font-size: 0.8125rem;">
                Target completion date: <strong>${Components.formatDate(c.estimatedDeadline)}</strong>
              </div>
            </div>
          </div>
          <div class="deadline-countdown-num">
            ${deadlineCountdownText}
          </div>
        </div>
      ` : ''}

      <!-- Rejection Alert Box if Rejected -->
      ${c.currentStatus === 'Rejected' ? `
        <div class="card" style="background: #fef2f2; border: 1px solid #fecaca; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
            <i data-lucide="x-circle" style="color: #dc2626; width: 22px; height: 22px; flex-shrink: 0; margin-top: 2px;"></i>
            <div>
              <div style="font-weight: 800; color: #991b1b; font-size: 1rem; margin-bottom: 0.25rem;">Complaint Rejected by Warden</div>
              <p style="font-size: 0.875rem; color: #7f1d1d; line-height: 1.45;">${c.rejectionReason || 'No detailed reason specified.'}</p>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Reopened Alert Box if Reopened -->
      ${c.currentStatus === 'Reopened' ? `
        <div class="card" style="background: #faf5ff; border: 1px solid #e9d5ff; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
            <i data-lucide="refresh-cw" style="color: #9333ea; width: 22px; height: 22px; flex-shrink: 0; margin-top: 2px;"></i>
            <div>
              <div style="font-weight: 800; color: #6b21a8; font-size: 1rem; margin-bottom: 0.25rem;">Complaint Reopened by Student</div>
              <p style="font-size: 0.875rem; color: #581c87; line-height: 1.45;">
                Student Feedback: "${c.studentConfirmation?.reopenReason || 'Issue persists after initial repair.'}"
              </p>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Resolution Confirmation Card if Resolved -->
      ${c.currentStatus === 'Resolved' && c.studentConfirmation?.confirmed ? `
        <div class="card" style="background: #f0fdf4; border: 1px solid #bbf7d0; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
            <i data-lucide="check-circle-2" style="color: #16a34a; width: 24px; height: 24px; flex-shrink: 0; margin-top: 2px;"></i>
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
                <div style="font-weight: 800; color: #166534; font-size: 1rem;">Verified & Resolved by Student</div>
                <div style="display: flex; gap: 2px; color: #f59e0b;">
                  ${Array.from({ length: 5 }).map((_, i) => `<i data-lucide="star" style="width: 16px; height: 16px; ${i < (c.studentConfirmation.rating || 5) ? 'fill: currentColor;' : ''}"></i>`).join('')}
                </div>
              </div>
              <p style="font-size: 0.875rem; color: #14532d; margin-top: 0.25rem;">
                Confirmed on ${Components.formatDate(c.studentConfirmation.confirmedAt)}. ${c.studentConfirmation.feedback ? `Feedback: "${c.studentConfirmation.feedback}"` : ''}
              </p>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Main Two-Column Layout -->
      <div style="display: grid; grid-template-columns: 1fr 340px; gap: 1.5rem;" class="form-grid">
        <!-- Left Column: Details, Photos, Comments -->
        <div>
          <!-- Problem Description Card -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="file-text"></i> ${c.title}
              </div>
            </div>
            
            <div style="font-size: 0.9375rem; color: var(--text-main); line-height: 1.6; white-space: pre-wrap; margin-bottom: 1.5rem;">
              ${c.description}
            </div>

            <!-- Uploaded Initial Photos -->
            ${c.images && c.images.length > 0 ? `
              <div>
                <div style="font-size: 0.8125rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.75rem; text-transform: uppercase;">
                  Attached Photos of Problem (${c.images.length})
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                  ${c.images.map((img) => `
                    <div style="width: 110px; height: 110px; border-radius: var(--radius-md); overflow: hidden; cursor: pointer; border: 1px solid var(--border-color); box-shadow: var(--shadow-xs);" onclick="Components.openLightbox('${img}')">
                      <img src="${img}" alt="Problem photo" style="width: 100%; height: 100%; object-fit: cover;" />
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : '<div style="font-size: 0.8125rem; color: var(--text-light); font-style: italic;">No initial photos attached.</div>'}
          </div>

          <!-- Repair Work Summary (if staff worked on it) -->
          ${c.workNotes || (c.afterRepairImages && c.afterRepairImages.length > 0) ? `
            <div class="card" style="border-left: 4px solid var(--color-success);">
              <div class="card-header">
                <div class="card-title" style="color: var(--color-success-dark);">
                  <i data-lucide="wrench"></i> Repair Report from Technician
                </div>
                ${c.actualCompletionDate ? `<span style="font-size: 0.75rem; color: var(--text-muted);">Completed: ${Components.formatDate(c.actualCompletionDate)}</span>` : ''}
              </div>

              ${c.repairDescription ? `
                <div style="margin-bottom: 0.75rem;">
                  <strong style="font-size: 0.8125rem; color: var(--text-muted); display: block;">Repair Action Performed:</strong>
                  <div style="font-size: 0.9375rem; color: var(--text-main); margin-top: 2px;">${c.repairDescription}</div>
                </div>
              ` : ''}

              ${c.workNotes ? `
                <div style="margin-bottom: 1rem;">
                  <strong style="font-size: 0.8125rem; color: var(--text-muted); display: block;">Technician Notes:</strong>
                  <div style="font-size: 0.875rem; color: var(--text-main); margin-top: 2px;">${c.workNotes}</div>
                </div>
              ` : ''}

              ${c.afterRepairImages && c.afterRepairImages.length > 0 ? `
                <div>
                  <div style="font-size: 0.8125rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase;">
                    After-Repair Proof Photos (${c.afterRepairImages.length})
                  </div>
                  <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                    ${c.afterRepairImages.map((img) => `
                      <div style="width: 110px; height: 110px; border-radius: var(--radius-md); overflow: hidden; cursor: pointer; border: 1px solid var(--border-color); box-shadow: var(--shadow-xs);" onclick="Components.openLightbox('${img}')">
                        <img src="${img}" alt="After repair photo" style="width: 100%; height: 100%; object-fit: cover;" />
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- Discussion & Comments Thread -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="message-square"></i> Discussion Thread (${c.comments ? c.comments.length : 0})
              </div>
            </div>

            <!-- Existing Comments -->
            <div id="comments-list" style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
              ${c.comments && c.comments.length > 0 ? c.comments.map((cm) => `
                <div style="background: var(--bg-subtle); border-radius: var(--radius-md); padding: 0.875rem 1rem;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span style="font-weight: 700; font-size: 0.875rem; color: var(--text-main);">${cm.userName}</span>
                      <span class="badge" style="background: var(--bg-surface); color: var(--text-muted); font-size: 0.6875rem; border: 1px solid var(--border-color);">${cm.userRole}</span>
                    </div>
                    <span style="font-size: 0.75rem; color: var(--text-light);">${Components.getTimeAgo(cm.createdAt)}</span>
                  </div>
                  <div style="font-size: 0.875rem; color: var(--text-main); line-height: 1.45;">${cm.message}</div>
                </div>
              `).join('') : '<div style="font-size: 0.875rem; color: var(--text-light); font-style: italic;">No comments posted yet. Use the box below to ask questions or provide additional information.</div>'}
            </div>

            <!-- Post New Comment Input Form -->
            <form onsubmit="ComplaintDetailsView.handlePostComment(event)">
              <div style="display: flex; gap: 0.75rem;">
                <input
                  type="text"
                  id="new-comment-input"
                  class="form-control"
                  placeholder="Type an update, question, or note..."
                  required
                />
                <button type="submit" id="post-comment-btn" class="btn btn-primary" style="flex-shrink: 0;">
                  <i data-lucide="send"></i> Post
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Right Column: Location, Assigned Worker, Audit History -->
        <div>
          <!-- Location Details Card -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="map-pin"></i> Location Info
              </div>
            </div>

            <div style="font-size: 0.875rem; display: flex; flex-direction: column; gap: 0.625rem;">
              <div>
                <span style="color: var(--text-muted);">Hostel:</span>
                <strong style="float: right; color: var(--text-main);">${c.hostel}</strong>
              </div>
              <div>
                <span style="color: var(--text-muted);">Block & Floor:</span>
                <strong style="float: right; color: var(--text-main);">${c.block}, ${c.floor}</strong>
              </div>
              <div>
                <span style="color: var(--text-muted);">Room Number:</span>
                <strong style="float: right; color: var(--color-primary); font-size: 1rem;">${c.room}</strong>
              </div>
              ${c.locationDetails ? `
                <div style="border-top: 1px solid var(--border-subtle); padding-top: 0.5rem; margin-top: 0.25rem;">
                  <span style="color: var(--text-muted); font-size: 0.75rem; display: block; margin-bottom: 2px;">Specific Area:</span>
                  <div style="color: var(--text-main);">${c.locationDetails}</div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Student Profile Card -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="user"></i> Lodged By
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
              <div class="user-avatar" style="width: 42px; height: 42px;">
                ${c.student && c.student.name ? c.student.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <div style="font-weight: 700; color: var(--text-main);">${c.student ? c.student.name : 'Unknown Student'}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${c.student ? c.student.studentOrEmpId : ''}</div>
              </div>
            </div>

            <div style="font-size: 0.8125rem; color: var(--text-muted);">
              <div><i data-lucide="mail" style="width: 12px; height: 12px; display: inline;"></i> ${c.student ? c.student.email : '—'}</div>
              ${c.student && c.student.phone ? `<div style="margin-top: 3px;"><i data-lucide="phone" style="width: 12px; height: 12px; display: inline;"></i> ${c.student.phone}</div>` : ''}
            </div>
          </div>

          <!-- Assigned Maintenance Staff Card -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="user-check"></i> Assigned Technician
              </div>
            </div>

            ${c.assignedStaff ? `
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <div class="user-avatar" style="width: 42px; height: 42px; background: linear-gradient(135deg, #06b6d4, #0284c7);">
                  ${c.assignedStaff.name ? c.assignedStaff.name.charAt(0).toUpperCase() : 'T'}
                </div>
                <div>
                  <div style="font-weight: 700; color: var(--text-main);">${c.assignedStaff.name}</div>
                  <div style="font-size: 0.75rem; color: var(--color-primary); font-weight: 600;">${c.assignedStaff.specialty || 'General Maintenance'}</div>
                </div>
              </div>

              <div style="font-size: 0.8125rem; color: var(--text-muted);">
                ${c.assignedStaff.phone ? `<div><i data-lucide="phone" style="width: 12px; height: 12px; display: inline;"></i> ${c.assignedStaff.phone}</div>` : ''}
                <div style="margin-top: 3px;"><i data-lucide="mail" style="width: 12px; height: 12px; display: inline;"></i> ${c.assignedStaff.email}</div>
              </div>
            ` : `
              <div style="text-align: center; padding: 1rem 0; color: var(--text-muted); font-size: 0.875rem;">
                <i data-lucide="user-x" style="width: 24px; height: 24px; margin-bottom: 0.35rem; color: var(--text-light);"></i>
                <div>No technician assigned yet</div>
                ${isWarden ? `
                  <button class="btn btn-primary btn-sm" style="margin-top: 0.75rem;" onclick="ComplaintDetailsView.openAssignModal()">
                    <i data-lucide="user-plus"></i> Assign Staff
                  </button>
                ` : ''}
              </div>
            `}
          </div>

          <!-- Detailed Vertical Status History Audit Trail -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <i data-lucide="git-branch"></i> Status History Trail
              </div>
            </div>
            ${Components.renderTimeline(c)}
          </div>
        </div>
      </div>
    `;

    Components.refreshIcons();
  },

  renderHeaderActions(c, isStudentOwner, isWarden, isAssignedStaff) {
    let actionsHtml = '';

    // Student Confirmation actions
    if (isStudentOwner) {
      if (c.currentStatus === 'Awaiting Confirmation') {
        actionsHtml += `
          <button class="btn btn-success" onclick="ComplaintDetailsView.openConfirmModal()">
            <i data-lucide="check-circle"></i> Confirm Resolved
          </button>
          <button class="btn btn-danger" onclick="ComplaintDetailsView.openReopenModal()">
            <i data-lucide="alert-circle"></i> Problem Persists (Reopen)
          </button>
        `;
      } else if (c.currentStatus === 'Resolved') {
        actionsHtml += `
          <button class="btn btn-outline btn-sm" onclick="ComplaintDetailsView.openReopenModal()">
            <i data-lucide="refresh-cw"></i> Reopen Ticket
          </button>
        `;
      }
    }

    // Warden Management Actions
    if (isWarden) {
      actionsHtml += `
        <button class="btn btn-primary" onclick="ComplaintDetailsView.openAssignModal()">
          <i data-lucide="user-plus"></i> ${c.assignedStaff ? 'Reassign Staff' : 'Assign Staff'}
        </button>
        <button class="btn btn-secondary" onclick="ComplaintDetailsView.openStatusModal()">
          <i data-lucide="edit"></i> Update Status
        </button>
        ${!c.isEscalated && !['Resolved', 'Rejected'].includes(c.currentStatus) ? `
          <button class="btn btn-danger" onclick="ComplaintDetailsView.openEscalateModal()">
            <i data-lucide="zap"></i> Escalate
          </button>
        ` : ''}
      `;
    }

    // Staff Task Execution Actions
    if (isAssignedStaff) {
      if (c.currentStatus === 'Assigned') {
        actionsHtml += `
          <button class="btn btn-primary" onclick="ComplaintDetailsView.staffAcceptTask()">
            <i data-lucide="check"></i> Accept Assignment
          </button>
        `;
      } else if (c.currentStatus === 'Accepted') {
        actionsHtml += `
          <button class="btn btn-warning" onclick="ComplaintDetailsView.staffStartWork()">
            <i data-lucide="tool"></i> Start Work (In Progress)
          </button>
        `;
      } else if (c.currentStatus === 'In Progress') {
        actionsHtml += `
          <button class="btn btn-success" onclick="ComplaintDetailsView.openCompleteWorkModal()">
            <i data-lucide="check-square"></i> Mark Work Completed
          </button>
        `;
      }
    }

    return actionsHtml;
  },

  // Student Confirm Modal
  openConfirmModal() {
    this.selectedRating = 5;

    const modalBody = `
      <div style="text-align: center; margin-bottom: 1.25rem;">
        <p style="font-size: 0.9375rem; color: var(--text-main); margin-bottom: 1rem;">
          Please rate the quality and timeliness of the maintenance repair work performed in your room:
        </p>
        <div id="star-rating-widget" class="star-rating-box" style="justify-content: center; font-size: 2rem;">
          ${[1, 2, 3, 4, 5].map((num) => `<span class="star-icon filled" data-rating="${num}" onclick="ComplaintDetailsView.setRating(${num})">★</span>`).join('')}
        </div>
        <div id="rating-text" style="font-size: 0.8125rem; font-weight: 700; color: #f59e0b; margin-top: 0.35rem;">Excellent (5/5)</div>
      </div>

      <div class="form-group">
        <label class="form-label" for="confirm-feedback">Feedback & Comments (Optional)</label>
        <textarea id="confirm-feedback" class="form-textarea" placeholder="Was the issue completely fixed? Was the staff courteous?"></textarea>
      </div>
    `;

    Components.showModal({
      title: 'Confirm Resolution',
      body: modalBody,
      confirmText: 'Confirm & Close Ticket',
      confirmClass: 'btn-success',
      onConfirm: async () => {
        const feedback = document.getElementById('confirm-feedback').value;
        await API.complaints.confirmResolution(this.complaint._id, {
          action: 'confirm',
          rating: this.selectedRating || 5,
          feedback
        });
        Components.showToast('Thank you! Complaint marked as resolved.', 'success', 'Verified');
        await this.render(this.complaint._id);
      }
    });
  },

  setRating(rating) {
    this.selectedRating = rating;
    const stars = document.querySelectorAll('#star-rating-widget .star-icon');
    stars.forEach((star) => {
      const starRating = parseInt(star.getAttribute('data-rating'), 10);
      if (starRating <= rating) {
        star.classList.add('filled');
      } else {
        star.classList.remove('filled');
      }
    });

    const labels = {
      1: 'Poor (1/5)',
      2: 'Fair (2/5)',
      3: 'Good (3/5)',
      4: 'Very Good (4/5)',
      5: 'Excellent (5/5)'
    };

    const text = document.getElementById('rating-text');
    if (text) text.innerText = labels[rating] || '';
  },

  // Student Reopen Modal
  openReopenModal() {
    const modalBody = `
      <div style="margin-bottom: 1rem; color: #991b1b; background: #fee2e2; padding: 0.75rem; border-radius: var(--radius-md); font-size: 0.8125rem;">
        <strong>Notice:</strong> Reopening returns this ticket to the warden and technician for re-inspection and re-repair.
      </div>
      <div class="form-group">
        <label class="form-label" for="reopen-reason">Explain Why Problem Persists <span class="required">*</span></label>
        <textarea id="reopen-reason" class="form-textarea" placeholder="e.g. The leak resumed after 2 hours, or the light is flickering again..." required></textarea>
      </div>
    `;

    Components.showModal({
      title: 'Report Problem Persists',
      body: modalBody,
      confirmText: 'Reopen Complaint',
      confirmClass: 'btn-danger',
      onConfirm: async () => {
        const reason = document.getElementById('reopen-reason').value.trim();
        if (!reason) throw new Error('Please describe why the problem is not fixed.');
        await API.complaints.confirmResolution(this.complaint._id, {
          action: 'reopen',
          reopenReason: reason
        });
        Components.showToast('Complaint reopened and warden alerted.', 'warning', 'Ticket Reopened');
        await this.render(this.complaint._id);
      }
    });
  },

  // Warden Assign Staff Modal
  async openAssignModal() {
    try {
      const staffListRes = await API.users.getStaffList();
      const staffList = staffListRes.data || [];

      const options = staffList.map((s) => `
        <option value="${s._id}" ${this.complaint.assignedStaff && (this.complaint.assignedStaff._id === s._id || this.complaint.assignedStaff === s._id) ? 'selected' : ''}>
          ${s.name} (${s.specialty || 'General'}) • ${s.activeTasks || 0} active tasks
        </option>
      `).join('');

      // Default deadline to 24 hours from now
      const defaultDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

      const modalBody = `
        <div class="form-group">
          <label class="form-label" for="assign-staff-select">Select Maintenance Staff <span class="required">*</span></label>
          <select id="assign-staff-select" class="form-select" required>
            <option value="">Choose Staff Member</option>
            ${options}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="assign-deadline">Target Resolution Deadline <span class="required">*</span></label>
          <input type="datetime-local" id="assign-deadline" class="form-control" value="${this.complaint.estimatedDeadline ? new Date(this.complaint.estimatedDeadline).toISOString().slice(0, 16) : defaultDate}" required />
          <div class="form-help">Countdown timer and overdue alerts are calculated from this timestamp.</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="assign-note">Assignment Instruction / Note</label>
          <input type="text" id="assign-note" class="form-control" placeholder="e.g. Inspect washbasin and carry 1-inch pipe sealant" />
        </div>
      `;

      Components.showModal({
        title: 'Assign Complaint to Staff',
        body: modalBody,
        confirmText: 'Assign Staff',
        confirmClass: 'btn-primary',
        onConfirm: async () => {
          const staffId = document.getElementById('assign-staff-select').value;
          const estimatedDeadline = document.getElementById('assign-deadline').value;
          const note = document.getElementById('assign-note').value;

          if (!staffId) throw new Error('Please select a technician.');
          if (!estimatedDeadline) throw new Error('Please set an estimated resolution deadline.');

          await API.complaints.assign(this.complaint._id, { staffId, estimatedDeadline, note });
          Components.showToast('Technician assigned successfully!', 'success', 'Assigned');
          await this.render(this.complaint._id);
        }
      });
    } catch (e) {
      Components.showToast(e.message, 'error');
    }
  },

  // Warden Status Modal
  openStatusModal() {
    const statuses = ['Under Review', 'Approved', 'Rejected'];

    const modalBody = `
      <div class="form-group">
        <label class="form-label" for="warden-status-select">Select New Status <span class="required">*</span></label>
        <select id="warden-status-select" class="form-select" onchange="ComplaintDetailsView.handleStatusSelectChange(this.value)" required>
          ${statuses.map((s) => `<option value="${s}" ${s === this.complaint.currentStatus ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>

      <div id="rejection-reason-group" class="form-group" style="display: ${this.complaint.currentStatus === 'Rejected' ? 'block' : 'none'};">
        <label class="form-label" for="warden-rejection-reason">Rejection Reason <span class="required">*</span></label>
        <textarea id="warden-rejection-reason" class="form-textarea" placeholder="State hostel regulation or reason for rejection..."></textarea>
      </div>

      <div class="form-group">
        <label class="form-label" for="warden-status-note">Status Note (Mandatory) <span class="required">*</span></label>
        <textarea id="warden-status-note" class="form-textarea" placeholder="Explain the rationale for this status update..." required></textarea>
      </div>
    `;

    Components.showModal({
      title: 'Update Complaint Status',
      body: modalBody,
      confirmText: 'Update Status',
      confirmClass: 'btn-primary',
      onConfirm: async () => {
        const status = document.getElementById('warden-status-select').value;
        const note = document.getElementById('warden-status-note').value.trim();
        const rejectionReason = document.getElementById('warden-rejection-reason').value.trim();

        if (!note) throw new Error('A status note is mandatory.');
        if (status === 'Rejected' && !rejectionReason) throw new Error('Rejection reason is required.');

        await API.complaints.updateWardenStatus(this.complaint._id, { status, note, rejectionReason });
        Components.showToast(`Status updated to "${status}"`, 'success');
        await this.render(this.complaint._id);
      }
    });
  },

  handleStatusSelectChange(val) {
    const rejGroup = document.getElementById('rejection-reason-group');
    if (rejGroup) {
      rejGroup.style.display = val === 'Rejected' ? 'block' : 'none';
    }
  },

  // Warden Escalate Modal
  openEscalateModal() {
    const modalBody = `
      <div style="color: #991b1b; background: #fee2e2; padding: 0.75rem; border-radius: var(--radius-md); font-size: 0.8125rem; margin-bottom: 1rem;">
        <strong>Escalation Warning:</strong> This will elevate the complaint priority to <strong>Emergency</strong> and notify the technician and student immediately.
      </div>
      <div class="form-group">
        <label class="form-label" for="escalate-reason">Reason for Escalation</label>
        <textarea id="escalate-reason" class="form-textarea" placeholder="e.g. Overdue deadline passed, water leaking to floor below..."></textarea>
      </div>
    `;

    Components.showModal({
      title: 'Escalate to Emergency Priority',
      body: modalBody,
      confirmText: 'Escalate Complaint',
      confirmClass: 'btn-danger',
      onConfirm: async () => {
        const reason = document.getElementById('escalate-reason').value;
        await API.complaints.escalate(this.complaint._id, { reason });
        Components.showToast('Complaint escalated to Emergency priority!', 'warning', 'Escalated');
        await this.render(this.complaint._id);
      }
    });
  },

  // Staff Quick Actions
  async staffAcceptTask() {
    try {
      const formData = new FormData();
      formData.append('status', 'Accepted');
      formData.append('workNotes', 'Technician acknowledged and accepted task assignment.');
      await API.complaints.updateStaffStatus(this.complaint._id, formData);
      Components.showToast('Task accepted!', 'success');
      await this.render(this.complaint._id);
    } catch (e) {
      Components.showToast(e.message, 'error');
    }
  },

  async staffStartWork() {
    try {
      const formData = new FormData();
      formData.append('status', 'In Progress');
      formData.append('workNotes', 'Technician arrived on site and commenced repairs.');
      await API.complaints.updateStaffStatus(this.complaint._id, formData);
      Components.showToast('Marked as In Progress!', 'success');
      await this.render(this.complaint._id);
    } catch (e) {
      Components.showToast(e.message, 'error');
    }
  },

  // Staff Complete Work Modal
  openCompleteWorkModal() {
    const modalBody = `
      <div class="form-group">
        <label class="form-label" for="staff-repair-desc">Repair Description / Action Performed <span class="required">*</span></label>
        <textarea id="staff-repair-desc" class="form-textarea" placeholder="Describe the parts replaced, adjustments made, or solution applied..." required></textarea>
      </div>

      <div class="form-group">
        <label class="form-label" for="staff-work-notes">Work Notes / Advice for Student</label>
        <input type="text" id="staff-work-notes" class="form-control" placeholder="e.g. Kept tap off for 1 hour to let sealant dry" />
      </div>

      <div class="form-group">
        <label class="form-label">Upload After-Repair Proof Photos (Optional)</label>
        <input type="file" id="staff-after-photos" class="form-control" multiple accept="image/*" />
      </div>

      <div style="font-size: 0.8125rem; color: var(--text-muted); background: var(--bg-subtle); padding: 0.75rem; border-radius: var(--radius-sm);">
        ℹ️ Once submitted, the complaint transitions to <strong>Awaiting Student Confirmation</strong> so the student can verify the repair.
      </div>
    `;

    Components.showModal({
      title: 'Complete Maintenance Work',
      body: modalBody,
      confirmText: 'Mark Work Completed',
      confirmClass: 'btn-success',
      onConfirm: async () => {
        const repairDesc = document.getElementById('staff-repair-desc').value.trim();
        const workNotes = document.getElementById('staff-work-notes').value.trim();
        const photoInput = document.getElementById('staff-after-photos');

        if (!repairDesc) throw new Error('Please describe the repair performed.');

        const formData = new FormData();
        formData.append('status', 'Work Completed');
        formData.append('repairDescription', repairDesc);
        formData.append('workNotes', workNotes);

        if (photoInput && photoInput.files) {
          for (let i = 0; i < photoInput.files.length; i++) {
            formData.append('afterRepairImages', photoInput.files[i]);
          }
        }

        await API.complaints.updateStaffStatus(this.complaint._id, formData);
        Components.showToast('Work completed! Ticket queued for student confirmation.', 'success');
        await this.render(this.complaint._id);
      }
    });
  },

  // Post Comment
  async handlePostComment(event) {
    event.preventDefault();
    const input = document.getElementById('new-comment-input');
    const btn = document.getElementById('post-comment-btn');
    const msg = input.value.trim();
    if (!msg) return;

    try {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>';
      await API.complaints.addComment(this.complaint._id, msg);
      input.value = '';
      Components.showToast('Comment posted', 'success');
      await this.render(this.complaint._id);
    } catch (e) {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="send"></i> Post';
      Components.refreshIcons();
      Components.showToast(e.message, 'error');
    }
  }
};
