import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Request from '@/models/Request';
import Feedback from '@/models/Feedback';

// GET - Get volunteer impact data
export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'volunteer') {
      return NextResponse.json(
        { error: 'Only volunteers can access impact data' },
        { status: 403 }
      );
    }

    await connectDB();

    const volunteerId = session.user.id;

    // Get all completed requests assigned to this volunteer
    const completedRequests = await Request.find({
      assignedTo: volunteerId,
      status: 'completed',
      isActive: true
    })
    .populate('createdBy', 'firstName lastName')
    .sort({ completedAt: -1 });

    // Get feedback for this volunteer
    const feedback = await Feedback.find({
      toUser: volunteerId,
      isActive: true
    })
    .populate('fromUser', 'firstName lastName')
    .populate('requestId', 'title type')
    .sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      completedRequests: completedRequests.length,
      totalHours: completedRequests.length * 2, // Estimate 2 hours per request
      averageRating: 0,
      totalFeedback: feedback.length,
      thisMonthRequests: 0,
      thisWeekRequests: 0
    };

    // Calculate average rating
    if (feedback.length > 0) {
      const totalRating = feedback.reduce((sum, fb) => sum + fb.rating, 0);
      stats.averageRating = totalRating / feedback.length;
    }

    // Calculate this month and week stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    stats.thisMonthRequests = completedRequests.filter(req => 
      new Date(req.completedAt) >= startOfMonth
    ).length;

    stats.thisWeekRequests = completedRequests.filter(req => 
      new Date(req.completedAt) >= startOfWeek
    ).length;

    // Get recent activity (last 10 completed requests)
    const recentActivity = completedRequests.slice(0, 10).map(req => ({
      id: req._id,
      title: req.title,
      type: req.type,
      location: req.location,
      completedAt: req.completedAt,
      citizen: {
        name: `${req.createdBy.firstName} ${req.createdBy.lastName}`
      }
    }));

    // Generate monthly progress for the last 6 months
    const monthlyProgress = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthRequests = completedRequests.filter(req => {
        const completedDate = new Date(req.completedAt);
        return completedDate >= monthStart && completedDate <= monthEnd;
      }).length;

      monthlyProgress.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        requests: monthRequests,
        year: date.getFullYear()
      });
    }

    // Generate achievements based on stats
    const achievements = generateAchievements(stats, completedRequests);

    // Get request type breakdown
    const typeBreakdown = {};
    completedRequests.forEach(req => {
      typeBreakdown[req.type] = (typeBreakdown[req.type] || 0) + 1;
    });

    return NextResponse.json({
      stats,
      recentActivity,
      achievements,
      monthlyProgress,
      typeBreakdown,
      recentFeedback: feedback.slice(0, 5).map(fb => ({
        id: fb._id,
        rating: fb.rating,
        comment: fb.comment,
        fromUser: fb.fromUser ? `${fb.fromUser.firstName} ${fb.fromUser.lastName}` : 'Anonymous',
        requestTitle: fb.requestId?.title,
        createdAt: fb.createdAt
      }))
    });

  } catch (error) {
    console.error('Get volunteer impact error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate achievements
function generateAchievements(stats, completedRequests) {
  const achievements = [];
  
  // First Helper
  if (stats.completedRequests >= 1) {
    achievements.push({
      id: 'first-help',
      title: 'First Helper',
      description: 'Completed your first request',
      icon: 'Heart',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      earned: true,
      earnedAt: completedRequests[completedRequests.length - 1]?.completedAt
    });
  }
  
  // Helping Hand
  if (stats.completedRequests >= 5) {
    achievements.push({
      id: 'helping-hand',
      title: 'Helping Hand',
      description: 'Completed 5 requests',
      icon: 'Users',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      earned: true,
      earnedAt: completedRequests[completedRequests.length - 5]?.completedAt
    });
  }
  
  // Community Champion
  if (stats.completedRequests >= 10) {
    achievements.push({
      id: 'community-champion',
      title: 'Community Champion',
      description: 'Completed 10 requests',
      icon: 'Trophy',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      earned: true,
      earnedAt: completedRequests[completedRequests.length - 10]?.completedAt
    });
  }
  
  // Super Volunteer
  if (stats.completedRequests >= 25) {
    achievements.push({
      id: 'super-volunteer',
      title: 'Super Volunteer',
      description: 'Completed 25 requests',
      icon: 'Award',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      earned: true,
      earnedAt: completedRequests[completedRequests.length - 25]?.completedAt
    });
  }
  
  // Five Star Helper
  if (stats.averageRating >= 4.5 && stats.totalFeedback >= 3) {
    achievements.push({
      id: 'five-star-helper',
      title: 'Five Star Helper',
      description: 'Maintained 4.5+ star rating',
      icon: 'Star',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      earned: true
    });
  }

  // Weekly Hero
  if (stats.thisWeekRequests >= 3) {
    achievements.push({
      id: 'weekly-hero',
      title: 'Weekly Hero',
      description: 'Completed 3+ requests this week',
      icon: 'Zap',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      earned: true
    });
  }

  // Add next milestone
  const nextMilestone = stats.completedRequests < 5 ? 5 : 
                       stats.completedRequests < 10 ? 10 : 
                       stats.completedRequests < 25 ? 25 : 
                       stats.completedRequests < 50 ? 50 : 100;
  
  if (stats.completedRequests < nextMilestone) {
    achievements.push({
      id: 'next-milestone',
      title: `${nextMilestone} Requests`,
      description: `Complete ${nextMilestone - stats.completedRequests} more requests`,
      icon: 'Target',
      color: 'text-gray-400',
      bgColor: 'bg-gray-50',
      earned: false,
      progress: (stats.completedRequests / nextMilestone) * 100
    });
  }

  return achievements;
}
