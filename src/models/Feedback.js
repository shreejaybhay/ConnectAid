import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: [true, 'Request ID is required']
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'From user is required']
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'To user is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v);
      },
      message: 'Rating must be a whole number'
    }
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  reportedAt: {
    type: Date,
    default: null
  },
  reportReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
if (typeof window === 'undefined' && !process.env.NEXT_RUNTIME) {
  FeedbackSchema.index({ requestId: 1 });
  FeedbackSchema.index({ fromUser: 1 });
  FeedbackSchema.index({ toUser: 1 });
  FeedbackSchema.index({ rating: 1 });
  FeedbackSchema.index({ createdAt: -1 });
  FeedbackSchema.index({ isActive: 1, isPublic: 1 });
}

// Compound index for unique feedback per request
FeedbackSchema.index({ requestId: 1, fromUser: 1 }, { unique: true });

// Virtual for feedback age
FeedbackSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt;
});

// Method to check if user can edit this feedback
FeedbackSchema.methods.canEdit = function(userId) {
  return this.fromUser.toString() === userId.toString();
};

// Method to check if user can delete this feedback
FeedbackSchema.methods.canDelete = function(userId, userRole) {
  if (userRole === 'admin') return true;
  return this.fromUser.toString() === userId.toString();
};

// Static method to get feedback for a user
FeedbackSchema.statics.getUserFeedback = function(userId, options = {}) {
  const query = { 
    toUser: userId, 
    isActive: true, 
    isPublic: true 
  };
  
  return this.find(query)
    .populate('fromUser', 'firstName lastName')
    .populate('requestId', 'title type')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 20);
};

// Static method to get average rating for a user
FeedbackSchema.statics.getUserAverageRating = async function(userId) {
  const result = await this.aggregate([
    {
      $match: {
        toUser: new mongoose.Types.ObjectId(userId),
        isActive: true,
        isPublic: true
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalFeedbacks: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length === 0) {
    return {
      averageRating: 0,
      totalFeedbacks: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const data = result[0];
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  data.ratingDistribution.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });

  return {
    averageRating: Math.round(data.averageRating * 10) / 10, // Round to 1 decimal
    totalFeedbacks: data.totalFeedbacks,
    ratingDistribution: distribution
  };
};

// Static method to get feedback for a request
FeedbackSchema.statics.getRequestFeedback = function(requestId) {
  return this.findOne({ 
    requestId, 
    isActive: true 
  })
  .populate('fromUser', 'firstName lastName')
  .populate('toUser', 'firstName lastName');
};

// Static method to check if feedback exists for a request
FeedbackSchema.statics.feedbackExists = function(requestId, fromUserId) {
  return this.findOne({ 
    requestId, 
    fromUser: fromUserId,
    isActive: true 
  });
};

// Pre-save validation
FeedbackSchema.pre('save', async function(next) {
  // Ensure fromUser and toUser are different
  if (this.fromUser.toString() === this.toUser.toString()) {
    const error = new Error('Cannot leave feedback for yourself');
    return next(error);
  }

  // Check if feedback already exists for this request from this user
  if (this.isNew) {
    const existingFeedback = await this.constructor.findOne({
      requestId: this.requestId,
      fromUser: this.fromUser,
      isActive: true
    });

    if (existingFeedback) {
      const error = new Error('Feedback already exists for this request');
      return next(error);
    }
  }

  next();
});

// Ensure virtual fields are serialized
FeedbackSchema.set('toJSON', {
  virtuals: true,
  transform: function(_doc, ret) {
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
