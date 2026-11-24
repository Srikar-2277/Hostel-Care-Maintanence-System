// Submit Complaint View Controller
const SubmitComplaintView = {
  selectedCategory: 'Plumbing',
  selectedPriority: 'Medium',
  uploadedFiles: [],

  render() {
    const container = document.getElementById('app-container');
    if (!container) return;

    const user = Store.state.user || {};
    this.selectedCategory = 'Plumbing';
    this.selectedPriority = 'Medium';
    this.uploadedFiles = [];

    const categoriesHtml = CONFIG.CATEGORIES.map((cat) => `
      <div
        class="category-option-card ${cat.id === this.selectedCategory ? 'selected' : ''}"
        onclick="SubmitComplaintView.selectCategory('${cat.id}', this)"
        data-category="${cat.id}"
      >
        <div class="category-icon-box">
          <i data-lucide="${cat.icon}"></i>
        </div>
        <span style="font-size: 0.8125rem;">${cat.label}</span>
      </div>
    `).join('');

    const prioritiesHtml = CONFIG.PRIORITIES.map((pri) => `
      <div
        class="priority-pill-option ${pri.id === this.selectedPriority ? 'selected' : ''}"
        data-val="${pri.id}"
        onclick="SubmitComplaintView.selectPriority('${pri.id}', this)"
      >
        ${pri.label}
      </div>
    `).join('');

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Submit Maintenance Complaint</h1>
          <p class="page-subtitle">Report a facility or maintenance issue for prompt repair and tracking</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-outline" onclick="window.location.hash = '#/student-dashboard'">
            <i data-lucide="arrow-left"></i> Back to Dashboard
          </button>
        </div>
      </div>

      <div class="card" style="max-width: 900px; margin: 0 auto; box-shadow: var(--shadow-md);">
        <div id="submit-error-alert" style="display: none; padding: 0.875rem 1rem; border-radius: var(--radius-md); background: var(--color-danger-bg); color: var(--color-danger-dark); border: 1px solid rgba(239, 68, 68, 0.3); font-size: 0.875rem; margin-bottom: 1.5rem;"></div>

        <form id="complaint-form" onsubmit="SubmitComplaintView.handleSubmit(event)">
          <!-- 1. Category Selection -->
          <div class="form-group">
            <label class="form-label">1. Select Complaint Category <span class="required">*</span></label>
            <div class="category-picker">
              ${categoriesHtml}
            </div>
          </div>

          <!-- 2. Priority Selection -->
          <div class="form-group">
            <label class="form-label">2. Select Priority Level <span class="required">*</span></label>
            <div class="priority-selector">
              ${prioritiesHtml}
            </div>
            <div id="priority-desc-text" class="form-help" style="margin-top: 0.5rem; color: var(--color-primary);">
              Standard maintenance task (Target SLA: 24-48 hours)
            </div>
          </div>

          <!-- 3. Title & Description -->
          <div class="form-group">
            <label class="form-label" for="complaint-title">3. Complaint Summary / Title <span class="required">*</span></label>
            <input
              type="text"
              id="complaint-title"
              class="form-control"
              placeholder="e.g. Washbasin faucet leaking heavily onto floor"
              maxlength="120"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="complaint-description">4. Detailed Description of the Issue <span class="required">*</span></label>
            <textarea
              id="complaint-description"
              class="form-textarea"
              placeholder="Please describe exactly what is malfunctioning, when it started, and any symptoms (smell, noise, water leak)..."
              required
            ></textarea>
          </div>

          <!-- 4. Location Details (Pre-filled from Profile) -->
          <div class="form-group" style="border-top: 1px solid var(--border-subtle); padding-top: 1.25rem;">
            <label class="form-label">5. Hostel Location & Room Breakdown <span class="required">*</span></label>
            
            <div class="form-grid">
              <div>
                <label class="form-label" for="loc-hostel" style="font-size: 0.75rem;">Hostel Building</label>
                <input type="text" id="loc-hostel" class="form-control" value="${user.hostelName || 'Mandakini & Cauvery Complex'}" required />
              </div>

              <div>
                <label class="form-label" for="loc-block" style="font-size: 0.75rem;">Block</label>
                <select id="loc-block" class="form-select" required>
                  ${CONFIG.HOSTEL_BLOCKS.map((b) => `<option value="${b}" ${b === user.hostelBlock ? 'selected' : ''}>${b}</option>`).join('')}
                </select>
              </div>

              <div>
                <label class="form-label" for="loc-floor" style="font-size: 0.75rem;">Floor</label>
                <select id="loc-floor" class="form-select" required>
                  ${CONFIG.FLOORS.map((f) => `<option value="${f}" ${f === user.floor ? 'selected' : ''}>${f}</option>`).join('')}
                </select>
              </div>

              <div>
                <label class="form-label" for="loc-room" style="font-size: 0.75rem;">Room Number</label>
                <input type="text" id="loc-room" class="form-control" value="${user.roomNumber || ''}" placeholder="e.g. A-304" required />
              </div>
            </div>

            <div style="margin-top: 0.75rem;">
              <label class="form-label" for="loc-specific" style="font-size: 0.75rem;">Specific Location / Landmark in Room</label>
              <input type="text" id="loc-specific" class="form-control" placeholder="e.g. Attached washroom ceiling / Near balcony window / Study table lamp socket" />
            </div>
          </div>

          <!-- 5. Photo Upload with Drag & Drop -->
          <div class="form-group" style="border-top: 1px solid var(--border-subtle); padding-top: 1.25rem;">
            <label class="form-label">6. Upload Photo of the Problem (Optional, Max 5MB)</label>
            <div
              class="file-dropzone"
              id="dropzone"
              onclick="document.getElementById('complaint-images-input').click()"
            >
              <i data-lucide="camera" class="file-dropzone-icon" style="width: 32px; height: 32px;"></i>
              <div style="font-weight: 600; color: var(--text-main); font-size: 0.9375rem;">
                Click to browse or drag and drop photos here
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">
                Supports JPG, PNG, WEBP (helps technicians prepare proper tools before visit)
              </div>
              <input
                type="file"
                id="complaint-images-input"
                multiple
                accept="image/png, image/jpeg, image/jpg, image/webp"
                style="display: none;"
                onchange="SubmitComplaintView.handleFileSelect(event)"
              />
            </div>

            <div id="file-previews" class="preview-thumbnails"></div>
          </div>

          <div style="margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem;">
            <button type="button" class="btn btn-outline" onclick="window.location.hash = '#/student-dashboard'">
              Cancel
            </button>
            <button type="submit" id="submit-complaint-btn" class="btn btn-primary btn-lg">
              <i data-lucide="send"></i> Register Maintenance Complaint
            </button>
          </div>
        </form>
      </div>
    `;

    this.setupDragAndDrop();
    Components.refreshIcons();
  },

  selectCategory(catId, element) {
    this.selectedCategory = catId;
    document.querySelectorAll('.category-option-card').forEach((el) => el.classList.remove('selected'));
    element.classList.add('selected');
  },

  selectPriority(priId, element) {
    this.selectedPriority = priId;
    document.querySelectorAll('.priority-pill-option').forEach((el) => el.classList.remove('selected'));
    element.classList.add('selected');

    const descMap = {
      Low: 'Minor cosmetic or non-urgent repair (Target SLA: 3-5 days)',
      Medium: 'Standard maintenance task (Target SLA: 24-48 hours)',
      High: 'Affects daily routine significantly (Target SLA: 12-24 hours)',
      Emergency: 'Immediate safety or water/power hazard (Urgent SLA: 1-4 hours)'
    };

    const text = document.getElementById('priority-desc-text');
    if (text) text.innerText = descMap[priId] || '';
  },

  setupDragAndDrop() {
    const dropzone = document.getElementById('dropzone');
    if (!dropzone) return;

    ['dragenter', 'dragover'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        this.addFiles(files);
      }
    });
  },

  handleFileSelect(event) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.addFiles(files);
    }
  },

  addFiles(fileList) {
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.type.startsWith('image/')) {
        this.uploadedFiles.push(file);
      }
    }
    this.renderPreviews();
  },

  renderPreviews() {
    const container = document.getElementById('file-previews');
    if (!container) return;

    container.innerHTML = '';
    this.uploadedFiles.forEach((file, idx) => {
      const thumb = document.createElement('div');
      thumb.className = 'preview-thumb-item';

      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);

      const delBtn = document.createElement('button');
      delBtn.innerHTML = '&times;';
      delBtn.style.cssText =
        'position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.6); color: #fff; border: none; border-radius: 50%; width: 18px; height: 18px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center;';
      delBtn.onclick = (e) => {
        e.stopPropagation();
        SubmitComplaintView.uploadedFiles.splice(idx, 1);
        SubmitComplaintView.renderPreviews();
      };

      thumb.appendChild(img);
      thumb.appendChild(delBtn);
      container.appendChild(thumb);
    });
  },

  async handleSubmit(event) {
    event.preventDefault();
    const alertBox = document.getElementById('submit-error-alert');
    if (alertBox) alertBox.style.display = 'none';

    const btn = document.getElementById('submit-complaint-btn');

    const formData = new FormData();
    formData.append('title', document.getElementById('complaint-title').value.trim());
    formData.append('description', document.getElementById('complaint-description').value.trim());
    formData.append('category', this.selectedCategory);
    formData.append('priority', this.selectedPriority);
    formData.append('hostel', document.getElementById('loc-hostel').value.trim());
    formData.append('block', document.getElementById('loc-block').value);
    formData.append('floor', document.getElementById('loc-floor').value);
    formData.append('room', document.getElementById('loc-room').value.trim());
    formData.append('locationDetails', document.getElementById('loc-specific').value.trim());

    this.uploadedFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Registering Complaint...';

      const response = await API.complaints.create(formData);
      const complaint = response.complaint;

      Components.showToast(`Complaint registered! Ticket ID: ${complaint.complaintId}`, 'success', 'Submitted');

      // If duplicate detected, warn student
      if (complaint.isDuplicateWarning) {
        Components.showToast(
          `Note: A similar active issue (${complaint.linkedComplaintId}) was previously registered for your room.`,
          'warning',
          'Potential Duplicate'
        );
      }

      // Navigate to tracking details view
      window.location.hash = `#/complaint/${complaint._id}`;
    } catch (error) {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="send"></i> Register Maintenance Complaint';
      Components.refreshIcons();
      if (alertBox) {
        alertBox.innerText = error.message;
        alertBox.style.display = 'block';
      }
    }
  }
};
