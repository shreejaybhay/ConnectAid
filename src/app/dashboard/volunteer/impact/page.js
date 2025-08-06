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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Impact</h1>
            </div>
          </div>
          <p className="text-gray-600">Track your volunteer journey and community contributions</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{impactData.stats.completedRequests}</p>
                  <p className="text-sm text-gray-600">Requests Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{impactData.stats.totalHours}</p>
                  <p className="text-sm text-gray-600">Hours Volunteered</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {impactData.stats.averageRating.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Heart className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{impactData.stats.totalFeedback}</p>
                  <p className="text-sm text-gray-600">Feedback Received</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-primary" />
                <span>Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {impactData.achievements.map((achievement) => {
                  const IconComponent = getAchievementIcon(achievement.icon);
                  return (
                    <div
                      key={achievement.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg ${
                        achievement.earned ? achievement.bgColor : 'bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        achievement.earned ? achievement.bgColor : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`h-4 w-4 ${
                          achievement.earned ? achievement.color : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          achievement.earned ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {achievement.title}
                        </h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        {achievement.progress !== undefined && (
                          <div className="mt-2">
                            <Progress value={achievement.progress} className="h-2" />
                          </div>
                        )}
                      </div>
                      {achievement.earned && (
                        <Badge variant="secondary" className="text-xs">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {impactData.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {impactData.recentActivity.map((activity) => (
                    <div key={activity.id} className="p-4 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="font-medium text-gray-900 text-sm leading-5 flex-1 min-w-0">
                              {activity.title}
                            </h4>
                            <Badge variant="outline" className="text-xs px-2 py-0.5 flex-shrink-0">
                              {activity.type}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center text-xs text-gray-500">
                              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{activity.location}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span>Completed {new Date(activity.completedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No completed requests yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Start helping your community to see your impact here
                  </p>
                  <Link href="/dashboard/volunteer/requests">
                    <Button className="mt-4" size="sm">
                      Browse Requests
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
