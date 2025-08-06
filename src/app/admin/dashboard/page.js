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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">
                  Welcome back, {user?.firstName}! Manage your community platform.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Administrator
                </Badge>
                <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </div>
          </div>


          {/* Admin Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <UserCheck className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium text-gray-900">Volunteer Approvals</h3>
                  <p className="text-xs text-gray-600">Review pending volunteer applications</p>
                </div>
              </div>
              <Link href="/admin/volunteers">
                <Button variant="outline" size="sm" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Review Applications
                </Button>
              </Link>
            </div>

            <div className="bg-white rounded-lg border p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium text-gray-900">User Management</h3>
                  <p className="text-xs text-gray-600">Manage platform users</p>
                </div>
              </div>
              <Link href="/admin/users">
                <Button variant="outline" size="sm" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Manage Users
                </Button>
              </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
