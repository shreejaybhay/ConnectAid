"use client";

import React from "react";
import { useSession } from "next-auth/react";
import {
  Users,
  Shield,
  CheckCircle,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const AdminDashboardPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg border p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-1 sm:mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-sm sm:text-base text-gray-600 break-words">
                  Welcome back, {user?.firstName}! Manage your community platform.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-2 sm:flex-nowrap">
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  <Shield className="h-3 w-3 mr-1" />
                  <span className="hidden xs:inline">Administrator</span>
                  <span className="xs:hidden">Admin</span>
                </Badge>
                <Badge variant="outline" className="text-xs text-green-600 border-green-200 flex-shrink-0">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-lg border p-4 sm:p-5 hover:shadow-sm transition-all duration-200 hover:border-primary/20">
              <div className="flex items-start space-x-3 mb-4">
                <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                  <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-1">
                    Volunteer Approvals
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Review pending volunteer applications
                  </p>
                </div>
              </div>
              <Link href="/admin/volunteers">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  Review Applications
                </Button>
              </Link>
            </div>

            <div className="bg-white rounded-lg border p-4 sm:p-5 hover:shadow-sm transition-all duration-200 hover:border-primary/20">
              <div className="flex items-start space-x-3 mb-4">
                <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-1">
                    User Management
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Manage platform users
                  </p>
                </div>
              </div>
              <Link href="/admin/users">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  Manage Users
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
