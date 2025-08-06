"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  ArrowLeft,
  Plus,
  MessageSquare,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Phone,
  Mail,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import ErrorBoundary from "@/components/ErrorBoundary";

const RequestsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Debug logging
  console.log('RequestsPage render:', {
    status,
    sessionExists: !!session,
    userRole: session?.user?.role,
    requestsCount: requests?.length || 0,
    loading,
    filter
  });

  const [allRequests, setAllRequests] = useState([]);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch all requests without filter to avoid re-fetching
      const response = await fetch(`/api/requests`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAllRequests(Array.isArray(data.requests) ? data.requests : []);

    } catch (error) {
      console.error('Fetch requests error:', error);
      setAllRequests([]);
      toast({
        title: "Error",
        description: error.message || "Failed to load requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Filter requests client-side to avoid page reloads
  const filteredRequests = useMemo(() => {
    if (filter === 'all') {
      return allRequests;
    }
    return allRequests.filter(request => request.status === filter);
  }, [allRequests, filter]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchRequests();
    }
  }, [status, fetchRequests]);

  const handleDeleteRequest = async (requestId) => {
    if (!requestId) {
      toast({
        title: "Error",
        description: "Invalid request ID",
        variant: "destructive",
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this request?')) return;

    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: data.message || "Request deleted successfully",
        variant: "success",
      });

      // Refresh the list
      fetchRequests();

    } catch (error) {
      console.error('Delete request error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete request",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'Open' },
      accepted: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Accepted' },
      in_progress: { color: 'bg-purple-100 text-purple-800', icon: Clock, label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' }
    };

    const config = statusConfig[status] || statusConfig.open;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'blood':
        return '🩸';
      case 'garbage':
        return '🗑️';
      default:
        return '🤝';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  // Handle redirect for non-citizens
  useEffect(() => {
    if (status !== "loading" && (!session || session.user.role !== 'citizen')) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'citizen') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">This page is only available for citizens.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-1 sm:mb-2">
                My Requests
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage your community service requests
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link href="/dashboard/requests/create">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden xs:inline">New Request</span>
                  <span className="xs:hidden">New</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg border hover:shadow-sm transition-shadow duration-200">
            <div className="border-b">
              <nav className="flex overflow-x-auto px-3 sm:px-6 pt-3 sm:pt-4">
                {[
                  { key: 'all', label: 'All Requests', shortLabel: 'All' },
                  { key: 'open', label: 'Open', shortLabel: 'Open' },
                  { key: 'accepted', label: 'Accepted', shortLabel: 'Accepted' },
                  { key: 'in_progress', label: 'In Progress', shortLabel: 'Progress' },
                  { key: 'completed', label: 'Completed', shortLabel: 'Done' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`pb-2 sm:pb-3 px-3 sm:px-4 mr-4 sm:mr-6 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                      filter === tab.key
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Requests List */}
            <div className="p-3 sm:p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm sm:text-base text-gray-600">Loading requests...</span>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                    {filter === 'all'
                      ? "You haven't created any requests yet."
                      : `No ${filter} requests found.`}
                  </p>
                  <Link href="/dashboard/requests/create">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                    >
                      Create Your First Request
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {Array.isArray(filteredRequests) && filteredRequests.length > 0 && filteredRequests.map((request) => {
                    if (!request || !request._id) {
                      console.warn('Invalid request data:', request);
                      return null;
                    }

                    return (
                    <div
                      key={request._id}
                      className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-all duration-200 hover:border-primary/20"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3 mb-3">
                            <span className="text-xl sm:text-2xl flex-shrink-0">{getTypeIcon(request.type)}</span>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-2 leading-tight">
                                {request.title}
                              </h3>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                <span className="flex items-center gap-1 min-w-0">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{request.location}</span>
                                </span>
                                <span className="flex items-center gap-1 flex-shrink-0">
                                  <Clock className="h-3 w-3 flex-shrink-0" />
                                  <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                                </span>
                                <span className={`capitalize flex-shrink-0 ${getPriorityColor(request.priority)}`}>
                                  {request.priority} priority
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-3 sm:mb-4 line-clamp-2 text-sm sm:text-base leading-relaxed">
                            {request.description}
                          </p>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                              {getStatusBadge(request.status)}
                              {request.assignedTo && (
                                <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                                  <User className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">
                                    Assigned to {request.assignedTo.firstName} {request.assignedTo.lastName}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Link href={`/dashboard/requests/${request._id}`}>
                                <Button variant="outline" size="sm" className="flex-shrink-0">
                                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="ml-1 sm:ml-2 hidden xs:inline text-xs sm:text-sm">View</span>
                                </Button>
                              </Link>
                              {request.status === 'open' && (
                                <>
                                  <Link href={`/dashboard/requests/${request._id}/edit`}>
                                    <Button variant="outline" size="sm" className="flex-shrink-0">
                                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                      <span className="ml-1 sm:ml-2 hidden xs:inline text-xs sm:text-sm">Edit</span>
                                    </Button>
                                  </Link>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteRequest(request._id)}
                                    className="text-red-600 hover:text-red-700 flex-shrink-0"
                                  >
                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="ml-1 sm:ml-2 hidden xs:inline text-xs sm:text-sm">Delete</span>
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
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
      </main>
    </div>
  );
};

// Wrap the component with ErrorBoundary
const RequestsPageWithErrorBoundary = () => {
  return (
    <ErrorBoundary>
      <RequestsPage />
    </ErrorBoundary>
  );
};

export default RequestsPageWithErrorBoundary;
