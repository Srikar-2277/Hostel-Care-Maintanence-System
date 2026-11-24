const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hostelcare';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB at:', mongoUri);

    // Clear existing collections
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('[Seed] Cleared existing users, complaints, notifications, and audit logs.');

    // Create Warden
    const warden = await User.create({
      name: 'Dr. Ramesh Verma (Chief Warden)',
      email: 'warden@hostelcare.edu',
      studentOrEmpId: 'EMP-WRD-001',
      password: 'warden123',
      role: 'warden',
      phone: '+91 98765 43210',
      hostelName: 'Mandakini & Cauvery Hostel Complex',
      accountStatus: 'active'
    });

    // Create Maintenance Staff
    const staffElectrician = await User.create({
      name: 'Mr. Suresh Kumar',
      email: 'suresh@hostelcare.edu',
      studentOrEmpId: 'EMP-MNT-101',
      password: 'staff123',
      role: 'staff',
      phone: '+91 98111 22233',
      specialty: 'Electrical',
      accountStatus: 'active'
    });

    const staffPlumber = await User.create({
      name: 'Mr. Rajesh Sharma',
      email: 'rajesh@hostelcare.edu',
      studentOrEmpId: 'EMP-MNT-102',
      password: 'staff123',
      role: 'staff',
      phone: '+91 98222 33344',
      specialty: 'Plumbing',
      accountStatus: 'active'
    });

    const staffCarpenter = await User.create({
      name: 'Mr. Anil Verma',
      email: 'anil@hostelcare.edu',
      studentOrEmpId: 'EMP-MNT-103',
      password: 'staff123',
      role: 'staff',
      phone: '+91 98333 44455',
      specialty: 'Doors and Windows',
      accountStatus: 'active'
    });

    // Create Students
    const studentRahul = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@hostelcare.edu',
      studentOrEmpId: 'STU-2024-001',
      password: 'student123',
      role: 'student',
      phone: '+91 97111 88899',
      hostelName: 'Mandakini Block A',
      hostelBlock: 'Block A',
      floor: '3rd Floor',
      roomNumber: 'A-304',
      accountStatus: 'active'
    });

    const studentPriya = await User.create({
      name: 'Priya Patel',
      email: 'priya@hostelcare.edu',
      studentOrEmpId: 'STU-2024-002',
      password: 'student123',
      role: 'student',
      phone: '+91 97222 77788',
      hostelName: 'Cauvery Block B',
      hostelBlock: 'Block B',
      floor: '2nd Floor',
      roomNumber: 'B-210',
      accountStatus: 'active'
    });

    const studentAmitabh = await User.create({
      name: 'Amitabh Roy',
      email: 'amitabh@hostelcare.edu',
      studentOrEmpId: 'STU-2024-003',
      password: 'student123',
      role: 'student',
      phone: '+91 97333 66677',
      hostelName: 'Mandakini Block C',
      hostelBlock: 'Block C',
      floor: '1st Floor',
      roomNumber: 'C-105',
      accountStatus: 'active'
    });

    console.log('[Seed] Created Warden, 3 Staff Members, and 3 Students.');

    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const pastDeadline = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12 hours ago (Overdue!)
    const futureDeadline1 = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    const futureDeadline2 = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 2 days later

    // Seed Complaints
    const complaints = [
      // 1. Emergency in progress (Electrical)
      {
        complaintId: 'HC-2026-0001',
        student: studentRahul._id,
        title: 'Sparks and burning odor from main switchboard',
        description: 'Heavy sparks occurred when turning on the main room light switchboard. There is a burnt plastic smell. Highly hazardous.',
        category: 'Electrical',
        priority: 'Emergency',
        hostel: 'Mandakini Block A',
        block: 'Block A',
        floor: '3rd Floor',
        room: 'A-304',
        locationDetails: 'Next to study desk on west wall',
        currentStatus: 'In Progress',
        assignedStaff: staffElectrician._id,
        estimatedDeadline: futureDeadline1,
        isEscalated: true,
        escalatedAt: twoDaysAgo,
        createdAt: twoDaysAgo,
        statusHistory: [
          {
            status: 'Submitted',
            note: 'Complaint registered by student.',
            updatedBy: studentRahul._id,
            updatedByName: studentRahul.name,
            updatedByRole: 'student',
            timestamp: twoDaysAgo
          },
          {
            status: 'Approved',
            note: 'Emergency issue approved immediately by warden.',
            updatedBy: warden._id,
            updatedByName: warden.name,
            updatedByRole: 'warden',
            timestamp: new Date(twoDaysAgo.getTime() + 30 * 60 * 1000)
          },
          {
            status: 'Assigned',
            note: `Assigned to ${staffElectrician.name} for urgent rewiring.`,
            updatedBy: warden._id,
            updatedByName: warden.name,
            updatedByRole: 'warden',
            timestamp: new Date(twoDaysAgo.getTime() + 45 * 60 * 1000)
          },
          {
            status: 'In Progress',
            note: 'Technician on site inspecting MCB and switch terminals.',
            updatedBy: staffElectrician._id,
            updatedByName: staffElectrician.name,
            updatedByRole: 'staff',
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000)
          }
        ],
        comments: [
          {
            user: warden._id,
            userName: warden.name,
            userRole: 'warden',
            message: 'Please keep the room main breaker off until technician completes inspection.',
            createdAt: twoDaysAgo
          },
          {
            user: studentRahul._id,
            userName: studentRahul.name,
            userRole: 'student',
            message: 'Understood, main switch turned off. Waiting for technician.',
            createdAt: new Date(twoDaysAgo.getTime() + 15 * 60 * 1000)
          }
        ]
      },

      // 2. Awaiting Confirmation (Plumbing - Work completed by staff)
      {
        complaintId: 'HC-2026-0002',
        student: studentPriya._id,
        title: 'Bathroom overhead pipe joint leaking continuously',
        description: 'Persistent water dripping from the ceiling PVC pipe junction above washroom shower.',
        category: 'Plumbing',
        priority: 'High',
        hostel: 'Cauvery Block B',
        block: 'Block B',
        floor: '2nd Floor',
        room: 'B-210',
        locationDetails: 'Attached Washroom 210',
        currentStatus: 'Awaiting Confirmation',
        assignedStaff: staffPlumber._id,
        estimatedDeadline: futureDeadline1,
        actualCompletionDate: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        workNotes: 'Replaced damaged Teflon seal and tightened 1.5-inch PVC elbow joint. No active drip detected upon testing valve.',
        repairDescription: 'PVC pipe elbow joint resealed with industrial sealant and waterproof tape.',
        createdAt: threeDaysAgo,
        statusHistory: [
          {
            status: 'Submitted',
            note: 'Complaint registered by student.',
            updatedBy: studentPriya._id,
            updatedByName: studentPriya.name,
            updatedByRole: 'student',
            timestamp: threeDaysAgo
          },
          {
            status: 'Assigned',
            note: `Assigned to ${staffPlumber.name}`,
            updatedBy: warden._id,
            updatedByName: warden.name,
            updatedByRole: 'warden',
            timestamp: new Date(threeDaysAgo.getTime() + 2 * 60 * 60 * 1000)
          },
          {
            status: 'Work Completed',
            note: 'Plumber completed repair and pressure checked. Now awaiting student confirmation.',
            updatedBy: staffPlumber._id,
            updatedByName: staffPlumber.name,
            updatedByRole: 'staff',
            timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000)
          }
        ]
      },

      // 3. Overdue Complaint (Doors & Windows)
      {
        complaintId: 'HC-2026-0003',
        student: studentAmitabh._id,
        title: 'Broken window latch allowing rain and insects into room',
        description: 'The aluminum window latch broke off. Window cannot be fastened securely and bangs in wind.',
        category: 'Doors and Windows',
        priority: 'Medium',
        hostel: 'Mandakini Block C',
        block: 'Block C',
        floor: '1st Floor',
        room: 'C-105',
        locationDetails: 'South-facing sliding window',
        currentStatus: 'Assigned',
        assignedStaff: staffCarpenter._id,
        estimatedDeadline: pastDeadline, // OVERDUE!
        createdAt: fiveDaysAgo,
        statusHistory: [
          {
            status: 'Submitted',
            note: 'Complaint registered by student.',
            updatedBy: studentAmitabh._id,
            updatedByName: studentAmitabh.name,
            updatedByRole: 'student',
            timestamp: fiveDaysAgo
          },
          {
            status: 'Assigned',
            note: `Assigned to ${staffCarpenter.name}. Target completion overdue.`,
            updatedBy: warden._id,
            updatedByName: warden.name,
            updatedByRole: 'warden',
            timestamp: new Date(fiveDaysAgo.getTime() + 4 * 60 * 60 * 1000)
          }
        ]
      },

      // 4. Resolved Complaint (Furniture with 5-star rating)
      {
        complaintId: 'HC-2026-0004',
        student: studentRahul._id,
        title: 'Study chair leg cracked and wobbling',
        description: 'Rear wooden leg of the hostel study chair is split along the grain and unstable.',
        category: 'Furniture',
        priority: 'Low',
        hostel: 'Mandakini Block A',
        block: 'Block A',
        floor: '3rd Floor',
        room: 'A-304',
        locationDetails: 'Room study table',
        currentStatus: 'Resolved',
        assignedStaff: staffCarpenter._id,
        estimatedDeadline: new Date(sevenDaysAgo.getTime() + 48 * 60 * 60 * 1000),
        actualCompletionDate: new Date(sevenDaysAgo.getTime() + 36 * 60 * 60 * 1000),
        workNotes: 'Replaced wooden chair with serviced ergonomic study chair from store.',
        repairDescription: 'Defective chair swapped with inspected unit #CH-882.',
        studentConfirmation: {
          confirmed: true,
          rating: 5,
          feedback: 'Replaced promptly with a sturdy chair. Very smooth service!',
          confirmedAt: new Date(sevenDaysAgo.getTime() + 38 * 60 * 60 * 1000),
          problemPersists: false
        },
        createdAt: sevenDaysAgo,
        statusHistory: [
          {
            status: 'Submitted',
            note: 'Complaint registered by student.',
            updatedBy: studentRahul._id,
            updatedByName: studentRahul.name,
            updatedByRole: 'student',
            timestamp: sevenDaysAgo
          },
          {
            status: 'Assigned',
            note: `Assigned to ${staffCarpenter.name}`,
            updatedBy: warden._id,
            updatedByName: warden.name,
            updatedByRole: 'warden',
            timestamp: new Date(sevenDaysAgo.getTime() + 2 * 60 * 60 * 1000)
          },
          {
            status: 'Work Completed',
            note: 'Replacement chair delivered to Room 304.',
            updatedBy: staffCarpenter._id,
            updatedByName: staffCarpenter.name,
            updatedByRole: 'staff',
            timestamp: new Date(sevenDaysAgo.getTime() + 36 * 60 * 60 * 1000)
          },
          {
            status: 'Resolved',
            note: 'Student verified and confirmed resolution with 5/5 stars rating.',
            updatedBy: studentRahul._id,
            updatedByName: studentRahul.name,
            updatedByRole: 'student',
            timestamp: new Date(sevenDaysAgo.getTime() + 38 * 60 * 60 * 1000)
          }
        ]
      },

      // 5. Freshly Submitted (Plumbing)
      {
        complaintId: 'HC-2026-0005',
        student: studentPriya._id,
        title: 'Washbasin drain choked with slow drainage',
        description: 'Washbasin water takes over 10 minutes to drain out completely. Stagnant water pooling.',
        category: 'Plumbing',
        priority: 'Medium',
        hostel: 'Cauvery Block B',
        block: 'Block B',
        floor: '2nd Floor',
        room: 'B-210',
        locationDetails: 'Room washbasin area',
        currentStatus: 'Submitted',
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        statusHistory: [
          {
            status: 'Submitted',
            note: 'Complaint registered by student.',
            updatedBy: studentPriya._id,
            updatedByName: studentPriya.name,
            updatedByRole: 'student',
            timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000)
          }
        ]
      },

      // 6. Under Review (Internet and Wi-Fi)
      {
        complaintId: 'HC-2026-0006',
        student: studentRahul._id,
        title: 'Floor Wi-Fi access point dropping signal every 15 minutes',
        description: 'Corridor access point AP-3A continuously reboots and has high packet loss (>40%). Makes attending online lectures impossible.',
        category: 'Internet and Wi-Fi',
        priority: 'High',
        hostel: 'Mandakini Block A',
        block: 'Block A',
        floor: '3rd Floor',
        room: 'A-304',
        locationDetails: 'Corridor outside Room 304',
        currentStatus: 'Under Review',
        createdAt: new Date(now.getTime() - 10 * 60 * 60 * 1000),
        statusHistory: [
          {
            status: 'Submitted',
            note: 'Complaint registered by student.',
            updatedBy: studentRahul._id,
            updatedByName: studentRahul.name,
            updatedByRole: 'student',
            timestamp: new Date(now.getTime() - 10 * 60 * 60 * 1000)
          },
          {
            status: 'Under Review',
            note: 'Warden reviewed. Escalating to campus IT network support center.',
            updatedBy: warden._id,
            updatedByName: warden.name,
            updatedByRole: 'warden',
            timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000)
          }
        ]
      },

      // 7. Accepted by Staff (Electrical)
      {
        complaintId: 'HC-2026-0007',
        student: studentAmitabh._id,
        title: 'Ceiling fan regulator stuck at top speed only',
        description: 'Rotary fan regulator is broken and stuck at maximum speed. Cannot be turned off without tripping sub-switch.',
        category: 'Electrical',
        priority: 'Medium',
        hostel: 'Mandakini Block C',
        block: 'Block C',
        floor: '1st Floor',
        room: 'C-105',
        locationDetails: 'Room main switch plate',
        currentStatus: 'Accepted',
        assignedStaff: staffElectrician._id,
        estimatedDeadline: futureDeadline2,
        createdAt: new Date(now.getTime() - 18 * 60 * 60 * 1000),
        statusHistory: [
          {
            status: 'Submitted',
            note: 'Complaint registered by student.',
            updatedBy: studentAmitabh._id,
            updatedByName: studentAmitabh.name,
            updatedByRole: 'student',
            timestamp: new Date(now.getTime() - 18 * 60 * 60 * 1000)
          },
          {
            status: 'Assigned',
            note: `Assigned to ${staffElectrician.name}`,
            updatedBy: warden._id,
            updatedByName: warden.name,
            updatedByRole: 'warden',
            timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000)
          },
          {
            status: 'Accepted',
            note: 'Task accepted by electrician. Procurement of modular step regulator in progress.',
            updatedBy: staffElectrician._id,
            updatedByName: staffElectrician.name,
            updatedByRole: 'staff',
            timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000)
          }
        ]
      },

      // 8. Reopened Complaint (Doors & Windows)
      {
        complaintId: 'HC-2026-0008',
        student: studentRahul._id,
        title: 'Room entrance door lock cylinder jammed',
        description: 'Key gets stuck inside cylinder when attempting to turn. Door gets jammed from the outside.',
        category: 'Doors and Windows',
        priority: 'High',
        hostel: 'Mandakini Block A',
        block: 'Block A',
        floor: '3rd Floor',
        room: 'A-304',
        locationDetails: 'Main entrance door',
        currentStatus: 'Reopened',
        assignedStaff: staffCarpenter._id,
        estimatedDeadline: futureDeadline1,
        studentConfirmation: {
          confirmed: false,
          problemPersists: true,
          reopenReason: 'The technician only sprayed lubricant, but the cylinder tumblers are physically deformed and stuck again.',
          confirmedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000)
        },
        createdAt: fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        statusHistory: [
          {
            status: 'Submitted',
            note: 'Complaint registered by student.',
            updatedBy: studentRahul._id,
            updatedByName: studentRahul.name,
            updatedByRole: 'student',
            timestamp: fourDaysAgo
          },
          {
            status: 'Assigned',
            note: `Assigned to ${staffCarpenter.name}`,
            updatedBy: warden._id,
            updatedByName: warden.name,
            updatedByRole: 'warden',
            timestamp: new Date(fourDaysAgo.getTime() + 2 * 60 * 60 * 1000)
          },
          {
            status: 'Work Completed',
            note: 'Applied lubricant to mortise lock.',
            updatedBy: staffCarpenter._id,
            updatedByName: staffCarpenter.name,
            updatedByRole: 'staff',
            timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000)
          },
          {
            status: 'Reopened',
            note: '⚠️ Student reported problem persists: "The technician only sprayed lubricant, but the cylinder tumblers are physically deformed and stuck again."',
            updatedBy: studentRahul._id,
            updatedByName: studentRahul.name,
            updatedByRole: 'student',
            timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000)
          }
        ]
      },

      // 9. Approved (Cleaning and Sanitation)
      {
        complaintId: 'HC-2026-0009',
        student: studentPriya._id,
        title: 'Corridor dustbin overflowing and corridor wet',
        description: 'Common dustbin at the end of corridor has not been emptied for 2 days. Spillage on floor.',
        category: 'Cleaning and Sanitation',
        priority: 'Medium',
        hostel: 'Cauvery Block B',
        block: 'Block B',
        floor: '2nd Floor',
        room: 'B-210',
        locationDetails: 'East corridor near water cooler',
        currentStatus: 'Approved',
        createdAt: new Date(now.getTime() - 7 * 60 * 60 * 1000),
        statusHistory: [
          {
            status: 'Submitted',
            note: 'Complaint registered by student.',
            updatedBy: studentPriya._id,
            updatedByName: studentPriya.name,
            updatedByRole: 'student',
            timestamp: new Date(now.getTime() - 7 * 60 * 60 * 1000)
          },
          {
            status: 'Approved',
            note: 'Approved by warden. Housekeeping team dispatched for deep cleaning.',
            updatedBy: warden._id,
            updatedByName: warden.name,
            updatedByRole: 'warden',
            timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000)
          }
        ]
      },

      // 10. Rejected Complaint (Other / Policy Violation)
      {
        complaintId: 'HC-2026-0010',
        student: studentAmitabh._id,
        title: 'Balcony glass shattered by cricket ball',
        description: 'Outer glass pane of room balcony shattered into pieces.',
        category: 'Doors and Windows',
        priority: 'Low',
        hostel: 'Mandakini Block C',
        block: 'Block C',
        floor: '1st Floor',
        room: 'C-105',
        locationDetails: 'Rear balcony',
        currentStatus: 'Rejected',
        rejectionReason: 'Hostel Code of Conduct Violation: Playing sports in hostel corridors is prohibited. Replacement cost to be billed to occupants per disciplinary rule 4.2.',
        createdAt: new Date(now.getTime() - 36 * 60 * 60 * 1000),
        statusHistory: [
          {
            status: 'Submitted',
            note: 'Complaint registered by student.',
            updatedBy: studentAmitabh._id,
            updatedByName: studentAmitabh.name,
            updatedByRole: 'student',
            timestamp: new Date(now.getTime() - 36 * 60 * 60 * 1000)
          },
          {
            status: 'Rejected',
            note: 'Rejected by warden. Hosteller disciplinary rule applied.',
            updatedBy: warden._id,
            updatedByName: warden.name,
            updatedByRole: 'warden',
            timestamp: new Date(now.getTime() - 20 * 60 * 60 * 1000)
          }
        ]
      },

      // 11. Work Completed / Awaiting Confirmation (Furniture)
      {
        complaintId: 'HC-2026-0011',
        student: studentRahul._id,
        title: 'Wardrobe hinge detached from frame',
        description: 'Upper right hinge of wooden almirah pulled out of particle board.',
        category: 'Furniture',
        priority: 'Medium',
        hostel: 'Mandakini Block A',
        block: 'Block A',
        floor: '3rd Floor',
        room: 'A-304',
        locationDetails: 'In-built wardrobe',
        currentStatus: 'Awaiting Confirmation',
        assignedStaff: staffCarpenter._id,
        estimatedDeadline: futureDeadline2,
        actualCompletionDate: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        workNotes: 'Filled enlarged screw holes with hardwood dowels and reset heavy-duty hinge.',
        repairDescription: 'Wardrobe door aligned and lubricated. Latches smoothly.',
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        statusHistory: [
          {
            status: 'Submitted',
            note: 'Complaint registered by student.',
            updatedBy: studentRahul._id,
            updatedByName: studentRahul.name,
            updatedByRole: 'student',
            timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000)
          },
          {
            status: 'Assigned',
            note: `Assigned to ${staffCarpenter.name}`,
            updatedBy: warden._id,
            updatedByName: warden.name,
            updatedByRole: 'warden',
            timestamp: new Date(now.getTime() - 20 * 60 * 60 * 1000)
          },
          {
            status: 'Work Completed',
            note: 'Hinge reinforced. Awaiting student verification.',
            updatedBy: staffCarpenter._id,
            updatedByName: staffCarpenter.name,
            updatedByRole: 'staff',
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000)
          }
        ]
      }
    ];

    for (const item of complaints) {
      await Complaint.create(item);
    }
    console.log(`[Seed] Seeded ${complaints.length} sample complaints successfully.`);

    // Seed Initial Notifications
    await Notification.create([
      {
        recipient: studentPriya._id,
        title: 'Work Completed: HC-2026-0002',
        message: 'Technician Rajesh Sharma has completed the plumbing repair. Please verify and confirm resolution.',
        relatedComplaintId: 'HC-2026-0002',
        notificationType: 'confirmation_required',
        isRead: false
      },
      {
        recipient: studentRahul._id,
        title: 'Task In Progress: HC-2026-0001',
        message: 'Technician Suresh Kumar is currently inspecting the electrical switchboard in Room A-304.',
        relatedComplaintId: 'HC-2026-0001',
        notificationType: 'status_change',
        isRead: false
      },
      {
        recipient: warden._id,
        title: '⚠️ Overdue Alert: HC-2026-0003',
        message: 'Window latch repair in Room C-105 exceeded estimated resolution deadline.',
        relatedComplaintId: 'HC-2026-0003',
        notificationType: 'overdue',
        isRead: false
      },
      {
        recipient: staffElectrician._id,
        title: 'Emergency Assignment: HC-2026-0001',
        message: 'Immediate response required for switchboard spark in Room A-304.',
        relatedComplaintId: 'HC-2026-0001',
        notificationType: 'assignment',
        isRead: false
      }
    ]);
    console.log('[Seed] Seeded initial notifications.');

    // Seed Audit Log entries
    await AuditLog.create([
      {
        action: 'SYSTEM_SEED',
        performedBy: warden._id,
        performerName: 'Dr. Ramesh Verma',
        performerRole: 'warden',
        details: { note: 'Initial system seed data loaded.' }
      }
    ]);

    console.log('\n======================================================');
    console.log('  🎉 DEMO DATA SEEDED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('  Demo Credentials:');
    console.log('  🛡️ Warden:      warden@hostelcare.edu     / warden123');
    console.log('  🔧 Electrician: suresh@hostelcare.edu     / staff123');
    console.log('  🔧 Plumber:     rajesh@hostelcare.edu     / staff123');
    console.log('  🎓 Student 1:   rahul@hostelcare.edu      / student123');
    console.log('  🎓 Student 2:   priya@hostelcare.edu      / student123');
    console.log('  🎓 Student 3:   amitabh@hostelcare.edu    / student123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDB();
