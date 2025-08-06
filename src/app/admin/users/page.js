"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { 
  Users,
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  UserCheck,
  Ban
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const AdminUsersPage = () => {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const hasFetched = useRef(false);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (hasFetched.current) return; // Prevent multiple fetches

    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        hasFetched.current = true;
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === 'admin') {
      fetchUsers();
    }
  }, [status, session?.user?.role, fetchUsers]);

  // Prevent reloads on tab/window focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Do nothing on visibility change to prevent reloads
    };

    const handleFocus = () => {
      // Do nothing on window focus to prevent reloads
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Handle user actions
  const handleUserAction = async (userId, action) => {
    try {
      setProcessingId(userId);
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `User ${action}d successfully`,
          variant: "success",
        });
        hasFetched.current = false; // Reset flag to allow refetch
        fetchUsers(); // Refresh the list
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || `Failed to ${action} user`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} user`,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Page Header */}
          <div className="bg-white rounded-lg border p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-1 sm:mb-2">
                  User Management
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Manage all platform users
                </p>
              </div>
              {users.length > 0 && (
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="text-sm">
                    {users.length} Total Users
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Users List */}
          {users.length === 0 ? (
            <div className="bg-white rounded-lg border p-6 sm:p-8 text-center">
              <div className="flex flex-col items-center justify-center py-4 sm:py-8">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                <p className="text-sm sm:text-base text-gray-600 max-w-md">
                  No users are registered on the platform yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {users && users.length > 0 && users.map((user, index) => {
                if (!user || !user._id) return null;

                return (
                  <div
                    key={user._id}
                    className="bg-white rounded-lg border p-4 sm:p-6 hover:shadow-sm transition-shadow duration-200"
                  >
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 sm:mb-6">
                      <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm sm:text-lg font-semibold text-primary">
                            {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 truncate">
                            {user.firstName || 'Unknown'} {user.lastName || 'User'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {user.role === 'admin' ? 'Administrator' : user.role === 'volunteer' ? 'Volunteer' : 'Community Member'}
                            </Badge>
                            {user.role === 'admin' && (
                              <Badge variant="outline" className="text-xs text-purple-600 border-purple-200 flex-shrink-0">
                                <Shield className="h-3 w-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                            {user.role === 'volunteer' && user.isApproved && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-200 flex-shrink-0">
                                <UserCheck className="h-3 w-3 mr-1" />
                                Approved
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      {user.role !== 'admin' && (
                        <div className="flex-shrink-0 w-full sm:w-auto">
                          <Button
                            onClick={() => handleUserAction(user._id, user.isActive ? 'deactivate' : 'activate')}
                            disabled={processingId === user._id}
                            size="sm"
                            variant={user.isActive ? "outline" : "default"}
                            className={`w-full sm:w-auto touch-target ${user.isActive ? "text-red-600 border-red-200 hover:bg-red-50" : "bg-green-600 hover:bg-green-700"}`}
                          >
                            {processingId === user._id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                                <span className="hidden xs:inline">Processing...</span>
                                <span className="xs:hidden">...</span>
                              </>
                            ) : (
                              <>
                                {user.isActive ? (
                                  <>
                                    <Ban className="h-4 w-4 mr-1 sm:mr-2" />
                                    <span>Deactivate</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4 mr-1 sm:mr-2" />
                                    <span>Activate</span>
                                  </>
                                )}
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Contact Information Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="flex items-start space-x-3 p-2 sm:p-0">
                        <Mail className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <span className="text-xs text-gray-500 block mb-1">Email</span>
                          <span className="text-sm font-medium text-gray-900 break-all block">{user.email || 'N/A'}</span>
                        </div>
                      </div>

                      {user.phone && (
                        <div className="flex items-start space-x-3 p-2 sm:p-0">
                          <Phone className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <span className="text-xs text-gray-500 block mb-1">Phone</span>
                            <span className="text-sm font-medium text-gray-900 block">{user.phone}</span>
                          </div>
                        </div>
                      )}

                      {user.location && (
                        <div className="flex items-start space-x-3 p-2 sm:p-0 sm:col-span-2 lg:col-span-1">
                          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <span className="text-xs text-gray-500 block mb-1">Location</span>
                            <span className="text-sm font-medium text-gray-900 break-words block">{user.location}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Joined:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className={`h-2 w-2 rounded-full flex-shrink-0 ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-sm font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
