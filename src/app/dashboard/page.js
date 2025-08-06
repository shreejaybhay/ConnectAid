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
    <div className="bg-gray-50 content-fit no-overscroll">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg border p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-1 sm:mb-2">
                  Welcome back, {user?.firstName}!
                </h1>
                <p className="text-sm sm:text-base text-gray-600 break-words">
                  {user?.role === 'volunteer'
                    ? 'Ready to help your community members?'
                    : 'Ready to make a difference in your community?'
                  }
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-2 sm:flex-nowrap flex-shrink-0">
                <Badge variant="outline" className="text-xs flex-shrink-0 whitespace-nowrap">
                  <span className="hidden sm:inline">
                    {user?.role === 'volunteer' ? 'Volunteer' : 'Community Member'}
                  </span>
                  <span className="sm:hidden">
                    {user?.role === 'volunteer' ? 'Volunteer' : 'Member'}
                  </span>
                </Badge>
                {user?.emailVerified && (
                  <Badge variant="outline" className="text-xs text-green-600 border-green-200 flex-shrink-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-lg border p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Your Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <User className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-600 block sm:inline">Name:</span>
                    <span className="font-medium block sm:inline sm:ml-1 break-words">
                      {user?.fullName}
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-600 block sm:inline">Email:</span>
                    <span className="font-medium block sm:inline sm:ml-1 break-all">
                      {user?.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Shield className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-600 block sm:inline">Role:</span>
                    <span className="font-medium block sm:inline sm:ml-1 capitalize">
                      {user?.role}
                    </span>
                  </div>
                </div>

                {user?.role === 'volunteer' && (
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <CheckCircle className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-600 block sm:inline">Status:</span>
                      <span className="font-medium block sm:inline sm:ml-1">
                        {user?.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 sm:mt-6 pt-4 border-t">
              <Link href="/dashboard/settings">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {user?.role === 'citizen' ? (
              <>
                {/* Citizen Actions */}
                <div className="bg-white rounded-lg border p-4 sm:p-5 hover:shadow-sm transition-all duration-200 hover:border-primary/20">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                      <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-1">
                        My Requests
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        View and manage your service requests
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/requests">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                    >
                      View My Requests
                    </Button>
                  </Link>
                </div>

                <div className="bg-white rounded-lg border p-4 sm:p-5 hover:shadow-sm transition-all duration-200 hover:border-primary/20">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                      <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-1">
                        Post a Request
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        Ask for help from your community
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/requests/create">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                    >
                      Create Request
                    </Button>
                  </Link>
                </div>

                <div className="bg-white rounded-lg border p-4 sm:p-5 hover:shadow-sm transition-all duration-200 hover:border-primary/20 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                      <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-1">
                        My Activities
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        Track your community involvement
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/activities">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                    >
                      View Activities
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Volunteer Actions */}
                <div className="bg-white rounded-lg border p-4 sm:p-5 hover:shadow-sm transition-all duration-200 hover:border-primary/20">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                      <Search className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-1">
                        Browse Requests
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        Find requests you can help with
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/volunteer/requests">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                    >
                      Browse Requests
                    </Button>
                  </Link>
                </div>

                <div className="bg-white rounded-lg border p-4 sm:p-5 hover:shadow-sm transition-all duration-200 hover:border-primary/20">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                      <HandHeart className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-1">
                        My Assignments
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        Requests you&apos;re helping with
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/volunteer/assignments">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                    >
                      View Assignments
                    </Button>
                  </Link>
                </div>

                <div className="bg-white rounded-lg border p-4 sm:p-5 hover:shadow-sm transition-all duration-200 hover:border-primary/20 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                      <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-1">
                        My Impact
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        Track your volunteer activities
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/volunteer/impact">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                    >
                      View Impact
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Volunteer Pending Approval Message */}
          {user?.role === 'volunteer' && !user?.isApproved && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-5">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-yellow-800 mb-1 sm:mb-2 text-sm sm:text-base">
                    Volunteer Application Pending
                  </h3>
                  <p className="text-yellow-700 text-sm sm:text-base leading-relaxed">
                    Your volunteer application is under review. You&apos;ll receive an email notification once approved.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
