import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot be more than 20 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  role: {
    type: String,
    enum: ['admin', 'volunteer', 'citizen'],
    default: 'citizen',
    required: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerifiedAt: {
    type: Date,
    default: null
  },
  isApproved: {
    type: Boolean,
    default: function() {
      // Citizens are auto-approved, volunteers need admin approval
      return this.role === 'citizen' || this.role === 'admin';
    }
  },
  approvedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  profileImage: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries (only create in Node.js runtime, not Edge)
if (typeof window === 'undefined' && !process.env.NEXT_RUNTIME) {
  UserSchema.index({ email: 1 });
  UserSchema.index({ role: 1 });
  UserSchema.index({ emailVerified: 1 });
  UserSchema.index({ isApproved: 1 });
}

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Check if user can login
UserSchema.methods.canLogin = function() {
  if (!this.isActive) return { canLogin: false, reason: 'Account is deactivated' };
  if (!this.emailVerified) return { canLogin: false, reason: 'Email not verified' };
  if (this.role === 'volunteer' && !this.isApproved) {
    return { canLogin: false, reason: 'Account pending admin approval' };
  }
  return { canLogin: true };
};

// Ensure virtual fields are serialized
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function(_doc, ret) {
    delete ret.password;
    return ret;
  }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
