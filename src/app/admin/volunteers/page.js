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

  useEffect(() => {
    fetchVolunteers();
  }, [fetchVolunteers]);

  const fetchVolunteers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/volunteers');
      const result = await response.json();
      
      if (response.ok) {
        setVolunteers(result.volunteers);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch volunteers",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Fetch volunteers error:', error);
      toast({
        title: "Error",
        description: "Failed to load volunteers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleVolunteerAction = async (volunteerId, action) => {
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

      const result = await response.json();

      if (response.ok) {
        toast({
          title: action === 'approve' ? "Volunteer Approved" : "Application Rejected",
          description: result.message,
          variant: "success",
        });
        
        // Remove the volunteer from the list
        setVolunteers(prev => prev.filter(v => v._id !== volunteerId));
      } else {
        toast({
          title: "Action Failed",
          description: result.error || `Failed to ${action} volunteer`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Volunteer action error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {/* Page Header */}
          <motion.div variants={fadeInUp} className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-foreground mb-1">Volunteer Approvals</h1>
                <p className="text-sm text-muted-foreground">
                  Review and approve volunteer applications
                </p>
              </div>
              {volunteers.length > 0 && (
                <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                  {volunteers.length} Pending
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Volunteers List */}
          {volunteers.length === 0 ? (
            <motion.div variants={fadeInUp} className="bg-white rounded-lg border p-8 text-center">
              <UserCheck className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Pending Applications</h3>
              <p className="text-sm text-muted-foreground">
                All volunteer applications have been reviewed.
              </p>
            </motion.div>
          ) : (
            <motion.div variants={fadeInUp} className="space-y-4">
              {volunteers && volunteers.length > 0 && volunteers.map((volunteer, index) => {
                if (!volunteer || !volunteer._id) return null;

                return (
                  <div
                    key={volunteer._id}
                    className="bg-white rounded-lg border p-6"
                  >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {volunteer.firstName?.charAt(0) || 'U'}{volunteer.lastName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          {volunteer.firstName || 'Unknown'} {volunteer.lastName || 'User'}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            Volunteer Application
                          </Badge>
                          <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                            Pending Review
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleVolunteerAction(volunteer._id, 'approve')}
                        disabled={processingId === volunteer._id || !volunteer.emailVerified}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processingId === volunteer._id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleVolunteerAction(volunteer._id, 'reject')}
                        disabled={processingId === volunteer._id}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        {processingId === volunteer._id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{volunteer.email || 'N/A'}</span>
                    </div>

                    {volunteer.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">{volunteer.phone || 'N/A'}</span>
                      </div>
                    )}

                    {volunteer.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">{volunteer.location || 'N/A'}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-muted-foreground">Applied:</span>
                      <span className="font-medium">
                        {volunteer.createdAt ? new Date(volunteer.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      {volunteer.emailVerified ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">Email Verified</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <span className="text-orange-600">Email Not Verified</span>
                        </>
                      )}
                    </div>
                  </div>

                  {!volunteer.emailVerified && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-orange-800">Email Verification Required</p>
                          <p className="text-xs text-orange-700 mt-1">
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
  );
};

export default AdminVolunteersPage;
