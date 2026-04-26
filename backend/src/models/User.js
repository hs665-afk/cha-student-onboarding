const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'administrator', 'donor', 'volunteer'],
    required: true
  },
  provider: {
    type: String,
    enum: ['google', 'azure', 'local'],
    default: 'local'
  },
  providerId: {
    type: String
  },
  avatar: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  mfaSecret: {
    type: String,
    select: false
  },
  mfaBackupCodes: {
    type: [String],
    select: false
  },
  mfaEnrollmentDate: {
    type: Date
  },
  lastLogin: {
    type: Date
  },
  refreshToken: {
    type: String,
    select: false
  },
  // Student specific
  inviteCode: {
    type: String
  },
  coursesEnrolled: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  // Volunteer specific
  assignedClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  // Donor specific
  totalDonated: {
    type: Number,
    default: 0
  },
  donations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check MFA grace period
userSchema.methods.isWithinMfaGracePeriod = function() {
  if (this.mfaEnabled) return false;
  
  const gracePeriods = {
    student: parseInt(process.env.MFA_GRACE_STUDENT) || 14,
    donor: parseInt(process.env.MFA_GRACE_DONOR) || 30,
    administrator: 0,
    volunteer: 0
  };
  
  const graceDays = gracePeriods[this.role];
  if (graceDays === 0) return false;
  
  const enrollmentDate = this.mfaEnrollmentDate || this.createdAt;
  const daysSinceEnrollment = (Date.now() - enrollmentDate) / (1000 * 60 * 60 * 24);
  
  return daysSinceEnrollment <= graceDays;
};

module.exports = mongoose.model('User', userSchema);
