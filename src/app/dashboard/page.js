"use client";

import React from "react";
import { useSession } from "next-auth/react";
import {
  Heart,
  MessageSquare,
  Calendar,
  Mail,
  Shield,
  CheckCircle,
  HandHeart,
  Search,
  Activity,
  User,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const DashboardPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                  Welcome back, {user?.firstName}!
                </h1>
                <p className="text-gray-600">
                  {user?.role === 'volunteer'
                    ? 'Ready to help your community members?'
                    : 'Ready to make a difference in your community?'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {user?.role === 'volunteer' ? 'Volunteer' : 'Community Member'}
                </Badge>
                {user?.emailVerified && (
                  <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{user?.fullName}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium capitalize">{user?.role}</span>
                </div>

                {user?.role === 'volunteer' && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">
                      {user?.isApproved ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <Link href="/dashboard/settings">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {user?.role === 'citizen' ? (
              <>
                {/* Citizen Actions */}
                <div className="bg-white rounded-lg border p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-gray-900">My Requests</h3>
                      <p className="text-xs text-gray-600">View and manage your service requests</p>
                    </div>
                  </div>
                  <Link href="/dashboard/requests">
                    <Button variant="outline" size="sm" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      View My Requests
                    </Button>
                  </Link>
                </div>

                <div className="bg-white rounded-lg border p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <Heart className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-gray-900">Post a Request</h3>
                      <p className="text-xs text-gray-600">Ask for help from your community</p>
                    </div>
                  </div>
                  <Link href="/dashboard/requests/create">
                    <Button variant="outline" size="sm" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      Create Request
                    </Button>
                  </Link>
                </div>

                <div className="bg-white rounded-lg border p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-gray-900">My Activities</h3>
                      <p className="text-xs text-gray-600">Track your community involvement</p>
                    </div>
                  </div>
                  <Link href="/dashboard/activities">
                    <Button variant="outline" size="sm" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      View Activities
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Volunteer Actions */}
                <div className="bg-white rounded-lg border p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <Search className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-gray-900">Browse Requests</h3>
                      <p className="text-xs text-gray-600">Find requests you can help with</p>
                    </div>
                  </div>
                  <Link href="/dashboard/volunteer/requests">
                    <Button variant="outline" size="sm" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      Browse Requests
                    </Button>
                  </Link>
                </div>

                <div className="bg-white rounded-lg border p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <HandHeart className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-gray-900">My Assignments</h3>
                      <p className="text-xs text-gray-600">Requests you&apos;re helping with</p>
                    </div>
                  </div>
                  <Link href="/dashboard/volunteer/assignments">
                    <Button variant="outline" size="sm" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      View Assignments
                    </Button>
                  </Link>
                </div>

                <div className="bg-white rounded-lg border p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <Activity className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-gray-900">My Impact</h3>
                      <p className="text-xs text-gray-600">Track your volunteer activities</p>
                    </div>
                  </div>
                  <Link href="/dashboard/volunteer/impact">
                    <Button variant="outline" size="sm" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      View Impact
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Volunteer Pending Approval Message */}
          {user?.role === 'volunteer' && !user?.isApproved && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800 mb-1">Volunteer Application Pending</h3>
                  <p className="text-yellow-700 text-sm">
                    Your volunteer application is under review. You&apos;ll receive an email notification once approved.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default DashboardPage;
