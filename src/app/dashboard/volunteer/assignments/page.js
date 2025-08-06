"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  ArrowLeft,
  MapPin,
  Calendar,
  Flag,
  Clock,
  CheckCircle,
  User,
  Phone,
  Mail,
  Search,
  Filter,
  PlayCircle,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const VolunteerAssignmentsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Handle redirect for non-volunteers
  useEffect(() => {
    if (status !== "loading" && (!session || session.user.role !== 'volunteer')) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Fetch volunteer assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      if (status !== "authenticated") return;

      try {
        // Fetch requests with different statuses to get all assignments
        const [acceptedRes, inProgressRes, completedRes] = await Promise.all([
          fetch('/api/requests?status=accepted'),
          fetch('/api/requests?status=in_progress'),
          fetch('/api/requests?status=completed')
        ]);

        const [acceptedData, inProgressData, completedData] = await Promise.all([
          acceptedRes.json(),
          inProgressRes.json(),
          completedRes.json()
        ]);

        if (acceptedRes.ok && inProgressRes.ok && completedRes.ok) {
          const allAssignments = [
            ...(acceptedData.requests || []),
            ...(inProgressData.requests || []),
            ...(completedData.requests || [])
          ];
          setAssignments(allAssignments);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch assignments",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Fetch assignments error:', error);
        toast({
          title: "Error",
          description: "Failed to fetch assignments",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [status, toast]);

  // Update request status
  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_status',
          status: newStatus
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        setAssignments(prev => 
          prev.map(assignment => 
            assignment._id === requestId 
              ? { ...assignment, status: newStatus }
              : assignment
          )
        );

        toast({
          title: "Success",
          description: `Request status updated to ${newStatus.replace('_', ' ')}`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Update status error:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  // Filter assignments
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || assignment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Helper functions
  const getTypeIcon = (type) => {
    switch (type) {
      case 'blood': return '🩸';
      case 'garbage': return '🗑️';
      default: return '🤝';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <PlayCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'volunteer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Page Header */}
        <div className="bg-white rounded-lg border p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            My Assignments
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage and track your accepted volunteer assignments
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 sm:h-11"
                />
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1 sm:flex-none">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm h-8 bg-white"
                    style={{
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.75rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.25em 1.25em'
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="accepted">Accepted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignments List */}
        <div className="space-y-4 sm:space-y-6">
          {filteredAssignments.length === 0 ? (
            <Card>
              <CardContent className="p-6 sm:p-12 text-center">
                <div className="flex flex-col items-center justify-center py-4 sm:py-8">
                  <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || filterStatus !== "all" ? "No matching assignments" : "No assignments yet"}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 max-w-md">
                    {searchTerm || filterStatus !== "all"
                      ? "Try adjusting your search or filters"
                      : "Start helping your community by accepting requests"
                    }
                  </p>
                  {!searchTerm && filterStatus === "all" && (
                    <Link href="/dashboard/volunteer/requests">
                      <Button className="touch-target">Browse Available Requests</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredAssignments.map((assignment) => (
              <Card key={assignment._id} className="hover:shadow-sm transition-shadow duration-200">
                <CardContent className="p-4 sm:p-6">
                  {/* Header with Icon, Title and Status */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 sm:mb-6">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-xl sm:text-2xl flex-shrink-0">{getTypeIcon(assignment.type)}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 break-words">
                          {assignment.title}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="break-words">{assignment.location}</span>
                          </span>
                          <span className="flex items-center gap-1 flex-shrink-0">
                            <Calendar className="h-4 w-4" />
                            <span>Accepted {new Date(assignment.acceptedAt).toLocaleDateString()}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={`px-2 py-1 text-xs font-medium ${getStatusColor(assignment.status)} flex-shrink-0`}>
                        {getStatusIcon(assignment.status)}
                        <span className="ml-1 capitalize">{assignment.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="mb-4 sm:mb-6">
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {assignment.description}
                    </p>
                  </div>

                  {/* Footer with Priority, Contact and Actions */}
                  <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                    {/* Priority and Type */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <Badge className={`px-2 py-1 text-xs font-medium ${getPriorityColor(assignment.priority)} flex-shrink-0`}>
                        <Flag className="h-3 w-3 mr-1" />
                        {assignment.priority}
                      </Badge>
                      <span className="text-xs sm:text-sm text-gray-500 capitalize flex-shrink-0">
                        {assignment.type} request
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {assignment.createdBy.firstName} {assignment.createdBy.lastName}
                        </span>
                      </span>
                      {assignment.contactInfo?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span className="break-all">{assignment.contactInfo.phone}</span>
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Link href={`/dashboard/requests/${assignment._id}`}>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto touch-target">
                          <span className="hidden xs:inline">View Details</span>
                          <span className="xs:hidden">Details</span>
                        </Button>
                      </Link>

                      {assignment.status === 'accepted' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(assignment._id, 'in_progress')}
                          className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto touch-target"
                        >
                          <PlayCircle className="h-4 w-4 mr-1 sm:mr-2" />
                          <span className="hidden xs:inline">Start Work</span>
                          <span className="xs:hidden">Start</span>
                        </Button>
                      )}

                      {assignment.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(assignment._id, 'completed')}
                          className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto touch-target"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1 sm:mr-2" />
                          <span className="hidden xs:inline">Mark Complete</span>
                          <span className="xs:hidden">Complete</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerAssignmentsPage;
