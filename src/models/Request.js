import mongoose from 'mongoose';

const RequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  type: {
    type: String,
    enum: ['blood', 'garbage', 'other'],
    required: [true, 'Request type is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [200, 'Location cannot be more than 200 characters']
  },
  status: {
    type: String,
    enum: ['open', 'accepted', 'in_progress', 'completed'],
    default: 'open',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  acceptedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  contactInfo: {
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    preferredContact: {
      type: String,
      enum: ['phone', 'email', 'both'],
      default: 'both'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
if (typeof window === 'undefined' && !process.env.NEXT_RUNTIME) {
  RequestSchema.index({ createdBy: 1 });
  RequestSchema.index({ assignedTo: 1 });
  RequestSchema.index({ status: 1 });
  RequestSchema.index({ type: 1 });
  RequestSchema.index({ location: 1 });
  RequestSchema.index({ createdAt: -1 });
  RequestSchema.index({ isActive: 1 });
}

// Virtual for request age
RequestSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt;
});

// Virtual for days since created
RequestSchema.virtual('daysSinceCreated').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to check if user can edit this request
RequestSchema.methods.canEdit = function(userId) {
  return this.createdBy.toString() === userId.toString();
};

// Method to check if user can accept this request
RequestSchema.methods.canAccept = function(userId, userRole) {
  return userRole === 'volunteer' && 
         this.status === 'open' && 
         this.createdBy.toString() !== userId.toString();
};

// Method to check if user can update status
RequestSchema.methods.canUpdateStatus = function(userId, userRole) {
  if (userRole === 'admin') return true;
  if (userRole === 'volunteer' && this.assignedTo && this.assignedTo.toString() === userId.toString()) {
    return true;
  }
  return false;
};

// Static method to get requests by status
RequestSchema.statics.getByStatus = function(status, options = {}) {
  const query = { status, isActive: true };
  return this.find(query)
    .populate('createdBy', 'firstName lastName email phone')
    .populate('assignedTo', 'firstName lastName email phone')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 50);
};

// Static method to get user's requests
RequestSchema.statics.getUserRequests = function(userId, options = {}) {
  const query = { createdBy: userId, isActive: true };
  return this.find(query)
    .populate('assignedTo', 'firstName lastName email phone')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 50);
};

// Static method to get volunteer's assigned requests
RequestSchema.statics.getVolunteerRequests = function(volunteerId, options = {}) {
  const query = { assignedTo: volunteerId, isActive: true };
  return this.find(query)
    .populate('createdBy', 'firstName lastName email phone')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 50);
};

// Pre-save middleware to update timestamps
RequestSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'accepted' && !this.acceptedAt) {
      this.acceptedAt = new Date();
    }
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    }
  }
  next();
});

// Ensure virtual fields are serialized
RequestSchema.set('toJSON', {
  virtuals: true,
  transform: function(_doc, ret) {
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Request || mongoose.model('Request', RequestSchema);
