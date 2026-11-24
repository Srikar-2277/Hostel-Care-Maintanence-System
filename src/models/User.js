const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    studentOrEmpId: {
      type: String,
      required: [true, 'Student / Employee ID is required'],
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['student', 'warden', 'staff'],
      default: 'student',
      required: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    hostelName: {
      type: String,
      trim: true,
      default: 'Main Campus Hostel'
    },
    hostelBlock: {
      type: String,
      trim: true,
      default: ''
    },
    floor: {
      type: String,
      trim: true,
      default: ''
    },
    roomNumber: {
      type: String,
      trim: true,
      default: ''
    },
    // For maintenance staff
    specialty: {
      type: String,
      enum: ['Plumbing', 'Electrical', 'Furniture', 'Cleaning and Sanitation', 'Doors and Windows', 'Internet and Wi-Fi', 'General Maintenance', 'All'],
      default: 'General Maintenance'
    },
    accountStatus: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    },
    profileImage: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password helper method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Safe JSON serialization (strip password)
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
