import mongoose from 'mongoose';
import crypto from 'crypto';

const VerificationTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['email_verification', 'password_reset'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      // Email verification tokens expire in 24 hours
      // Password reset tokens expire in 1 hour
      const hours = this.type === 'email_verification' ? 24 : 1;
      return new Date(Date.now() + hours * 60 * 60 * 1000);
    }
  },
  used: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries and automatic cleanup (only create in Node.js runtime, not Edge)
if (typeof window === 'undefined' && !process.env.NEXT_RUNTIME) {
  VerificationTokenSchema.index({ token: 1 });
  VerificationTokenSchema.index({ userId: 1, type: 1 });
  VerificationTokenSchema.index({ email: 1, type: 1 });
  VerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
}

// Generate secure token
VerificationTokenSchema.statics.generateToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

// Create verification token
VerificationTokenSchema.statics.createToken = async function(userId, email, type) {
  // Remove any existing tokens of the same type for this user
  await this.deleteMany({ userId, type });
  
  const token = this.generateToken();
  
  return this.create({
    userId,
    email,
    token,
    type
  });
};

// Verify and use token
VerificationTokenSchema.statics.verifyToken = async function(token, type) {
  const tokenDoc = await this.findOne({
    token,
    type,
    used: false,
    expiresAt: { $gt: new Date() }
  }).populate('userId');
  
  if (!tokenDoc) {
    return { valid: false, reason: 'Invalid or expired token' };
  }
  
  // Mark token as used
  tokenDoc.used = true;
  tokenDoc.usedAt = new Date();
  await tokenDoc.save();
  
  return { valid: true, user: tokenDoc.userId, tokenDoc };
};

// Check if token is valid (without marking as used)
VerificationTokenSchema.statics.isValidToken = async function(token, type) {
  const tokenDoc = await this.findOne({
    token,
    type,
    used: false,
    expiresAt: { $gt: new Date() }
  });
  
  return !!tokenDoc;
};

// Clean up expired tokens (can be called periodically)
VerificationTokenSchema.statics.cleanupExpired = async function() {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { used: true, usedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // Remove used tokens older than 7 days
    ]
  });
};

export default mongoose.models.VerificationToken || mongoose.model('VerificationToken', VerificationTokenSchema);
