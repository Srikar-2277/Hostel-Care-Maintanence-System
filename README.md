# HostelCare – Smart Hostel Maintenance & Complaint Life Cycle Management System

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209.x-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-purple.svg)](LICENSE)

**HostelCare** is an end-to-end digital lifecycle maintenance and complaint management web application engineered for university and collegiate residential complexes. It streamlines the entire pipeline—from student fault registration to warden review, technician delegation, live progress tracking, student inspection/verification, and executive telemetry analytics.

---

## 🌟 Key Highlights & Innovations

1. **Strict 9-Stage Audited Complaint Life Cycle**:
   - `Submitted` ➔ `Under Review` ➔ `Approved` ➔ `Assigned` ➔ `Accepted` ➔ `In Progress` ➔ `Work Completed` ➔ `Awaiting Confirmation` ➔ `Resolved` (or `Rejected` / `Reopened`).
2. **Mandatory Student Resolution Verification**:
   - Technicians cannot unilaterally close tickets. Once repair work is submitted with proof notes and photos, the ticket transitions to *Awaiting Student Confirmation*. The resident must inspect the fix and provide a 1–5 star rating and feedback or reopen if the problem persists.
3. **Smart Duplicate Detection**:
   - Algorithms detect active complaints reported within the same room and facility category, alerting residents and wardens to prevent redundant dispatch.
4. **Dynamic SLA Target Countdown & Overdue Tracking**:
   - Each delegated task has a resolution deadline based on priority (`Emergency`: 1–4h, `High`: 12–24h, `Medium`: 24–48h, `Low`: 3–5d). Automated alerts highlight overdue items on dashboards.
5. **Role-Based Portals**:
   - **Student Dashboard**: Quick lodging with category picker, priority selector, drag-and-drop photos, real-time ticket progress stepper, and interactive discussion threads.
   - **Warden Command Center**: Full complaints filter grid, worker delegation modal, status overrides with mandatory notes, priority escalation, staff performance metrics, and CSV reporting.
   - **Technician Job Sheet**: Dedicated trade-specific work orders queue, one-click acknowledgment, in-progress logging, and completion report forms.
6. **Executive Analytics Dashboard**:
   - Powered by Chart.js: facility category distribution doughnut, 6-month lodging vs. resolution trend lines, current status bars, and technician completion rate comparison.
7. **1-Click Demo Accounts**:
   - Instant pre-configured evaluation accounts on landing and login pages for instant demonstration without typing credentials.

---

## 🛠️ Technology Stack

- **Backend**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with Bcrypt password hashing
- **File Uploads**: Multer (multi-file support with size & MIME validation)
- **Frontend**: Responsive Vanilla JavaScript SPA with custom Hash Router & Reactive State Store
- **Styling**: Modern Vanilla CSS Design System with light/dark theme support, smooth glassmorphism, micro-animations, and CSS grid layouts
- **Charts & Icons**: Chart.js 4.4 & Lucide Icons

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** running locally on port `27017` (or remote MongoDB connection URI)

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory (or use `.env.example`):
```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/hostelcare
JWT_SECRET=hostelcare_super_secret_jwt_key_2026_secured
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=5242880
```

### 4. Database Seeding
Populate the database with demo users, past complaints, notifications, and audit logs:
```bash
npm run seed
```

### 5. Launch Application
Start the development server:
```bash
npm start
```
The server will boot up at:
👉 **`http://localhost:3000`**

---

## 🔑 Pre-Configured Demo Credentials

| Role | Name | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **🛡️ Warden / Admin** | Dr. Ramesh Verma | `warden@hostelcare.edu` | `warden123` | Chief Warden, Mandakini & Cauvery Complex |
| **🔧 Technician (Electrician)** | Mr. Suresh Kumar | `suresh@hostelcare.edu` | `staff123` | Electrical Maintenance Crew |
| **🔧 Technician (Plumber)** | Mr. Rajesh Sharma | `rajesh@hostelcare.edu` | `staff123` | Plumbing & Sanitation Crew |
| **🎓 Student 1** | Rahul Sharma | `rahul@hostelcare.edu` | `student123` | Room A-304, Block A |
| **🎓 Student 2** | Priya Patel | `priya@hostelcare.edu` | `student123` | Room B-210, Block B |
| **🎓 Student 3** | Amitabh Roy | `amitabh@hostelcare.edu` | `student123` | Room C-105, Block C |

> **Tip**: You can use the **1-Click Demo Evaluation Buttons** on the home page or login screen to authenticate instantly into any role.

---

## 📐 Architecture & Folder Structure

```
├── package.json
├── server.js                     # Express server & static asset routes
├── .env                          # Configuration variables
├── uploads/                      # Uploaded problem & repair photos
├── public/                       # Frontend Single Page Application
│   ├── index.html                # Main application entry shell
│   ├── css/
│   │   ├── style.css             # Design tokens, typography, layouts
│   │   ├── components.css        # Cards, badges, buttons, modals, toasts
│   │   ├── timeline.css          # Horizontal lifecycle stepper & history trail
│   │   └── responsive.css        # Mobile & tablet breakpoints
│   └── js/
│       ├── config.js             # Client configuration & constants
│       ├── store.js              # Reactive state management & authentication
│       ├── api.js                # Fetch API service layer
│       ├── router.js             # Client-side hash routing & role guards
│       ├── components.js         # Reusable UI component renderers
│       ├── app.js                # Global lifecycle bootstrap & navigation
│       └── views/
│           ├── landing.js        # Showcase page & 1-click evaluation drawer
│           ├── login.js          # Authentication form
│           ├── register.js       # Student registration
│           ├── studentDashboard.js # Resident overview & action alerts
│           ├── submitComplaint.js  # Complaint submission form
│           ├── complaintDetails.js # Full tracking stepper & discussion thread
│           ├── studentHistory.js # Resident complaint history & filters
│           ├── wardenDashboard.js # Chief command center & urgent alert feeds
│           ├── complaintManagement.js # Filterable management table
│           ├── staffManagement.js # Staff personnel & audit trail
│           ├── staffDashboard.js  # Work order queue for technicians
│           ├── assignedTaskDetails.js # Technician job sheet & repair logs
│           ├── notifications.js   # In-app alerts inbox
│           ├── profile.js         # Settings & dark/light theme switch
│           └── analytics.js       # Chart.js telemetry reports
└── src/                          # Backend Architecture
    ├── config/
    │   └── db.js                 # Mongoose database connection
    ├── controllers/
    │   ├── authController.js     # User registration, login, profile
    │   ├── complaintController.js# Complete complaint lifecycle operations
    │   ├── analyticsController.js# Aggregated KPIs & Chart.js data
    │   ├── notificationController.js # In-app notification management
    │   └── userController.js     # Staff roster & audit log endpoints
    ├── middleware/
    │   ├── auth.js               # JWT bearer validation & role authorization
    │   ├── errorHandler.js       # Centralized error handler
    │   └── upload.js             # Multer storage & file filtering
    ├── models/
    │   ├── User.js               # User schema with bcrypt hashing
    │   ├── Complaint.js          # Complaint schema with lifecycle history
    │   ├── Notification.js       # Notification schema
    │   └── AuditLog.js           # Immutable administrative action log
    ├── routes/
    │   ├── authRoutes.js
    │   ├── complaintRoutes.js
    │   ├── analyticsRoutes.js
    │   ├── notificationRoutes.js
    │   └── userRoutes.js
    ├── seed/
    │   └── seedData.js           # Demo database seed generator
    └── utils/
        └── notify.js             # Notification & audit dispatch helper
```

---

## 📡 Core API Reference

### Authentication
- `POST /api/auth/register` - Create student account
- `POST /api/auth/login` - Authenticate user & return JWT
- `GET  /api/auth/me` - Get authenticated profile
- `PUT  /api/auth/profile` - Update room and contact details
- `PUT  /api/auth/change-password` - Update password

### Complaints
- `POST  /api/complaints` - Student submits a complaint (supports up to 5 photos)
- `GET   /api/complaints` - Filter complaints (status, category, priority, overdue, date, pagination)
- `GET   /api/complaints/:id` - Detailed ticket data, audit timeline, and comments
- `PATCH /api/complaints/:id/status` - Warden status update (`Under Review`, `Approved`, `Rejected`)
- `PATCH /api/complaints/:id/assign` - Warden delegates technician with deadline
- `PATCH /api/complaints/:id/deadline` - Warden updates expected completion schedule
- `PATCH /api/complaints/:id/escalate` - Warden escalates issue to Emergency priority
- `PATCH /api/complaints/:id/staff-status` - Technician updates (`Accepted`, `In Progress`, `Work Completed`)
- `POST  /api/complaints/:id/confirm` - Student confirms resolution (`1-5★` rating) OR reopens ticket
- `POST  /api/complaints/:id/comments` - Post message to discussion thread
- `GET   /api/complaints/export/csv` - Warden exports filtered complaints report

### Analytics & Telemetry
- `GET   /api/analytics/dashboard` - Role-aware KPIs, category aggregation, 6-month trends, and staff performance

---

## 🔒 Security & Data Integrity

- Passwords hashed with salt rounds via `bcryptjs`.
- JWT tokens with configurable expiration.
- Strict role authorization guards (`student`, `warden`, `staff`) on both backend routes and frontend SPA navigation.
- Audit trail recording timestamps, actions, performer IDs, and contextual metadata.
