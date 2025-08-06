"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Award,
  Heart,
  Users,
  Calendar,
  MapPin,
  Trophy,
  Target,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function VolunteerImpactPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [impactData, setImpactData] = useState({
    stats: {
      completedRequests: 0,
      totalHours: 0,
      averageRating: 0,
      totalFeedback: 0
    },
    recentActivity: [],
    achievements: [],
    monthlyProgress: []
  });

  // Redirect if not authenticated or not a volunteer
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }
    
    if (session.user.role !== "volunteer") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  // Fetch impact data
  useEffect(() => {
    const fetchImpactData = async () => {
      if (status !== "authenticated") return;

      try {
        const response = await fetch('/api/volunteer/impact');
        const data = await response.json();

        if (response.ok) {
          setImpactData({
            stats: data.stats,
            recentActivity: data.recentActivity,
            achievements: data.achievements,
            monthlyProgress: data.monthlyProgress,
            typeBreakdown: data.typeBreakdown,
            recentFeedback: data.recentFeedback
          });
        } else {
          console.error('Failed to fetch impact data:', data.error);
        }
      } catch (error) {
        console.error('Fetch impact data error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImpactData();
  }, [status, session]);

  // Icon mapping for achievements
  const getAchievementIcon = (iconName) => {
    const iconMap = {
      Heart,
      Users,
      Trophy,
      Star,
      Target,
      Award,
      Activity
    };
    return iconMap[iconName] || Activity;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your impact...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">My Impact</h1>
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Track your volunteer journey and community contributions
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="hover:shadow-sm transition-shadow duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {impactData.stats.completedRequests}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Requests Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-sm transition-shadow duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {impactData.stats.totalHours}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Hours Volunteered</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-sm transition-shadow duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {impactData.stats.averageRating.toFixed(1)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Average Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-sm transition-shadow duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {impactData.stats.totalFeedback}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Feedback Received</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Achievements */}
          <Card className="hover:shadow-sm transition-shadow duration-200">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span>Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 sm:space-y-4">
                {impactData.achievements.map((achievement) => {
                  const IconComponent = getAchievementIcon(achievement.icon);
                  return (
                    <div
                      key={achievement.id}
                      className={`flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg transition-colors duration-200 ${
                        achievement.earned ? achievement.bgColor : 'bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        achievement.earned ? achievement.bgColor : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 ${
                          achievement.earned ? achievement.color : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium text-sm sm:text-base ${
                          achievement.earned ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {achievement.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                          {achievement.description}
                        </p>
                        {achievement.progress !== undefined && (
                          <div className="mt-2 sm:mt-3">
                            <Progress value={achievement.progress} className="h-2" />
                          </div>
                        )}
                      </div>
                      {achievement.earned && (
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          Earned
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="hover:shadow-sm transition-shadow duration-200">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {impactData.recentActivity.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {impactData.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-3 sm:p-4 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-all duration-200 hover:border-primary/20"
                    >
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base leading-5 flex-1 min-w-0">
                              {activity.title}
                            </h4>
                            <Badge variant="outline" className="text-xs px-2 py-1 flex-shrink-0 self-start">
                              {activity.type}
                            </Badge>
                          </div>
                          <div className="space-y-1 sm:space-y-2">
                            <div className="flex items-center text-xs sm:text-sm text-gray-500">
                              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                              <span className="truncate">{activity.location}</span>
                            </div>
                            <div className="flex items-center text-xs sm:text-sm text-gray-500">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                              <span>Completed {new Date(activity.completedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-500 mb-1 sm:mb-2">No completed requests yet</p>
                  <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 leading-relaxed">
                    Start helping your community to see your impact here
                  </p>
                  <Link href="/dashboard/volunteer/requests">
                    <Button size="sm" className="w-full sm:w-auto">
                      Browse Requests
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
