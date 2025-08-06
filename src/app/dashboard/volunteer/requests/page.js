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
  AlertCircle,
  CheckCircle,
  User,
  Phone,
  Mail,
  HandHeart,
  Search,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const VolunteerRequestsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Handle redirect for non-volunteers
  useEffect(() => {
    if (status !== "loading" && (!session || session.user.role !== 'volunteer')) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Fetch available requests
  useEffect(() => {
    const fetchRequests = async () => {
      if (status !== "authenticated") return;

      try {
        const response = await fetch('/api/requests?status=open');
        const data = await response.json();

        if (response.ok) {
          // Filter out requests that are not open (should only show truly open requests)
          const openRequests = (data.requests || []).filter(request =>
            request.status === 'open' &&
            request.createdBy._id !== session.user.id
          );
          setRequests(openRequests);
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
          description: "Failed to fetch requests",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [status, session, toast]);

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'accept' }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Request Accepted! 🎉",
          description: "You've successfully accepted this request",
        });
        // Remove the accepted request from the list immediately
        setRequests(prev => prev.filter(req => req._id !== requestId));
      } else {
        toast({
          title: "Failed to Accept Request",
          description: result.error || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Accept request error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
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
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || request.type === filterType;
    const matchesPriority = filterPriority === "all" || request.priority === filterPriority;
    
    return matchesSearch && matchesType && matchesPriority;
  });

  if (status === "loading" || loading) {
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Browse Requests</h1>
            <p className="text-gray-600 mt-1">
              Find community requests you can help with
            </p>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="blood">Blood Donation</option>
                    <option value="garbage">Garbage Pickup</option>
                    <option value="other">Other Help</option>
                  </select>
                  
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} available
          </div>

          {/* Requests List */}
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <HandHeart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterType !== "all" || filterPriority !== "all"
                    ? "Try adjusting your search or filters"
                    : "There are no open requests at the moment"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <Card key={request._id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-6">
                    {/* Header with Icon, Title and Actions */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl flex-shrink-0">{getTypeIcon(request.type)}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                            {request.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{request.location}</span>
                            </span>
                            <span className="flex items-center gap-1 flex-shrink-0">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <Link href={`/dashboard/requests/${request._id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(request._id)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <HandHeart className="h-4 w-4 mr-2" />
                          Accept Request
                        </Button>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {request.description}
                      </p>
                    </div>

                    {/* Tags and Contact Info */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <Badge className={`px-2 py-1 text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          <Flag className="h-3 w-3 mr-1" />
                          {request.priority}
                        </Badge>
                        <span className="text-xs text-gray-500 capitalize">
                          {request.type} request
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {request.createdBy.firstName} {request.createdBy.lastName}
                        </span>
                        {request.contactInfo?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {request.contactInfo.phone}
                          </span>
                        )}
                        {request.contactInfo?.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {request.contactInfo.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
    </div>
  );
};

export default VolunteerRequestsPage;
