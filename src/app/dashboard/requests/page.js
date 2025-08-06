"use client";

import React, { useState, useEffect, useCallback } from "react";
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

const RequestsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (status === "authenticated") {
      fetchRequests();
    }
  }, [status, filter, fetchRequests]);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      
      const response = await fetch(`/api/requests?${params}`);
      const data = await response.json();

      if (response.ok) {
        setRequests(data.requests || []);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch requests",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Fetch requests error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  const handleDeleteRequest = async (requestId) => {
    if (!confirm('Are you sure you want to delete this request?')) return;

    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Request deleted successfully",
          variant: "success",
        });
        fetchRequests(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Delete request error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'citizen') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">My Requests</h1>
              <p className="text-gray-600 mt-1">
                Manage your community service requests
              </p>
            </div>
            <Link href="/dashboard/requests/create">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Request
              </Button>
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg border">
            <div className="border-b">
              <nav className="flex space-x-6 px-6 pt-4">
                {[
                  { key: 'all', label: 'All Requests' },
                  { key: 'open', label: 'Open' },
                  { key: 'accepted', label: 'Accepted' },
                  { key: 'in_progress', label: 'In Progress' },
                  { key: 'completed', label: 'Completed' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                      filter === tab.key
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Requests List */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-gray-600">Loading requests...</span>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                  <p className="text-gray-600 mb-4">
                    {filter === 'all' 
                      ? "You haven't created any requests yet." 
                      : `No ${filter} requests found.`}
                  </p>
                  <Link href="/dashboard/requests/create">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Create Your First Request
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request._id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{getTypeIcon(request.type)}</span>
                            <div>
                              <h3 className="font-medium text-gray-900">{request.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {request.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(request.createdAt).toLocaleDateString()}
                                </span>
                                <span className={`capitalize ${getPriorityColor(request.priority)}`}>
                                  {request.priority} priority
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-3 line-clamp-2">{request.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getStatusBadge(request.status)}
                              {request.assignedTo && (
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <User className="h-3 w-3" />
                                  Assigned to {request.assignedTo.firstName} {request.assignedTo.lastName}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Link href={`/dashboard/requests/${request._id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              {request.status === 'open' && (
                                <>
                                  <Link href={`/dashboard/requests/${request._id}/edit`}>
                                    <Button variant="outline" size="sm">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDeleteRequest(request._id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RequestsPage;
