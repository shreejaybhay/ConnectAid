"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Users,
  UserCheck,
  ArrowLeft,
  Check,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import ErrorBoundary from "@/components/ErrorBoundary";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const AdminVolunteersPage = () => {
  const { data: session, status } = useSession();
  const [volunteers, setVolunteers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const { toast } = useToast();

  // Debug logging
  console.log('AdminVolunteersPage render:', {
    status,
    sessionExists: !!session,
    userRole: session?.user?.role,
    volunteersCount: volunteers?.length || 0,
    isLoading
  });

  const fetchVolunteers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/volunteers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.volunteers) {
        setVolunteers(Array.isArray(result.volunteers) ? result.volunteers : []);
      } else {
        console.warn('No volunteers data in response:', result);
        setVolunteers([]);
      }
    } catch (error) {
      console.error('Fetch volunteers error:', error);
      setVolunteers([]);
      toast({
        title: "Error",
        description: error.message || "Failed to load volunteers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchVolunteers();
  }, []); // Remove fetchVolunteers from dependencies to prevent infinite loop

  const handleVolunteerAction = async (volunteerId, action) => {
    if (!volunteerId || !action) {
      toast({
        title: "Error",
        description: "Invalid volunteer ID or action",
        variant: "destructive",
      });
      return;
    }

    setProcessingId(volunteerId);

    try {
      const response = await fetch('/api/admin/volunteers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          volunteerId,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      toast({
        title: action === 'approve' ? "Volunteer Approved" : "Application Rejected",
        description: result.message || `Successfully ${action}d volunteer`,
        variant: "success",
      });

      // Remove the volunteer from the list
      setVolunteers(prev => Array.isArray(prev) ? prev.filter(v => v && v._id !== volunteerId) : []);

    } catch (error) {
      console.error('Volunteer action error:', error);
      toast({
        title: "Action Failed",
        description: error.message || `Failed to ${action} volunteer`,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white/90 to-orange-100/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white/90 to-orange-100/30 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  if (session?.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white/90 to-orange-100/30 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-4 sm:space-y-6 lg:space-y-8"
        >
          {/* Page Header */}
          <motion.div variants={fadeInUp} className="bg-white rounded-lg border p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground mb-1 sm:mb-2">
                  Volunteer Approvals
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Review and approve volunteer applications
                </p>
              </div>
              {volunteers.length > 0 && (
                <div className="flex-shrink-0">
                  <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200 text-sm">
                    {volunteers.length} Pending
                  </Badge>
                </div>
              )}
            </div>
          </motion.div>

          {/* Volunteers List */}
          {volunteers.length === 0 ? (
            <motion.div variants={fadeInUp} className="bg-white rounded-lg border p-6 sm:p-8 text-center">
              <div className="flex flex-col items-center justify-center py-4 sm:py-8">
                <UserCheck className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
                <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">No Pending Applications</h3>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md">
                  All volunteer applications have been reviewed.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div variants={fadeInUp} className="space-y-4 sm:space-y-6">
              {Array.isArray(volunteers) && volunteers.length > 0 && volunteers.map((volunteer, index) => {
                if (!volunteer || !volunteer._id) {
                  console.warn('Invalid volunteer data:', volunteer);
                  return null;
                }

                return (
                  <div
                    key={volunteer._id}
                    className="bg-white rounded-lg border p-4 sm:p-6 hover:shadow-sm transition-shadow duration-200"
                  >
                  {/* Header Section */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 sm:mb-6">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm sm:text-base font-medium text-blue-600">
                          {volunteer.firstName?.charAt(0) || 'U'}{volunteer.lastName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground text-base sm:text-lg truncate">
                          {volunteer.firstName || 'Unknown'} {volunteer.lastName || 'User'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            Volunteer Application
                          </Badge>
                          <Badge variant="outline" className="text-xs text-orange-600 border-orange-200 flex-shrink-0">
                            Pending Review
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 sm:flex-shrink-0">
                      <Button
                        onClick={() => handleVolunteerAction(volunteer._id, 'approve')}
                        disabled={processingId === volunteer._id || !volunteer.emailVerified}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 w-full sm:w-auto touch-target"
                      >
                        {processingId === volunteer._id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                            <span className="hidden xs:inline">Processing...</span>
                            <span className="xs:hidden">...</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1 sm:mr-2" />
                            <span>Approve</span>
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleVolunteerAction(volunteer._id, 'reject')}
                        disabled={processingId === volunteer._id}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto touch-target"
                      >
                        {processingId === volunteer._id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-2"></div>
                            <span className="hidden xs:inline">Processing...</span>
                            <span className="xs:hidden">...</span>
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-1 sm:mr-2" />
                            <span>Reject</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm mb-4 sm:mb-6">
                    <div className="flex items-start space-x-2 p-2 sm:p-0">
                      <Mail className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground block sm:inline">Email:</span>
                        <span className="font-medium block sm:inline sm:ml-1 break-all">
                          {volunteer.email || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {volunteer.phone && (
                      <div className="flex items-start space-x-2 p-2 sm:p-0">
                        <Phone className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="text-muted-foreground block sm:inline">Phone:</span>
                          <span className="font-medium block sm:inline sm:ml-1">
                            {volunteer.phone || 'N/A'}
                          </span>
                        </div>
                      </div>
                    )}

                    {volunteer.location && (
                      <div className="flex items-start space-x-2 p-2 sm:p-0 sm:col-span-2 lg:col-span-1">
                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="text-muted-foreground block sm:inline">Location:</span>
                          <span className="font-medium block sm:inline sm:ml-1 break-words">
                            {volunteer.location || 'N/A'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Information */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 text-sm pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-muted-foreground">Applied:</span>
                      <span className="font-medium">
                        {volunteer.createdAt ? new Date(volunteer.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {volunteer.emailVerified ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-green-600 text-sm">Email Verified</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                          <span className="text-orange-600 text-sm">Email Not Verified</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Email Verification Warning */}
                  {!volunteer.emailVerified && (
                    <div className="mt-4 p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-medium text-orange-800">
                            Email Verification Required
                          </p>
                          <p className="text-xs sm:text-sm text-orange-700 mt-1 leading-relaxed">
                            This volunteer must verify their email address before approval.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  </div>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Wrap the component with ErrorBoundary
const AdminVolunteersPageWithErrorBoundary = () => {
  return (
    <ErrorBoundary>
      <AdminVolunteersPage />
    </ErrorBoundary>
  );
};

export default AdminVolunteersPageWithErrorBoundary;
