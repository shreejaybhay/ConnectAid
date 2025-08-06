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
  AlertCircle,
  PlayCircle,
  Search,
  Filter,
  Activity,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function CitizenActivitiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Redirect if not authenticated or not a citizen
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }
    
    if (session.user.role !== "citizen") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  // Fetch citizen's requests
  useEffect(() => {
    const fetchRequests = async () => {
      if (status !== "authenticated") return;
      
      try {
        const response = await fetch('/api/requests');
        const data = await response.json();
        
        if (response.ok) {
          setRequests(data.requests || []);
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to fetch your requests",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Fetch requests error:', error);
        toast({
          title: "Error",
          description: "Failed to fetch your requests",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [status, toast]);

  // Filter requests based on search and status
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || request.status === filterStatus;
    
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
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'accepted': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4" />;
      case 'accepted': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <PlayCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 content-fit no-overscroll flex items-center justify-center min-h-[50vh]">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading your activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 content-fit no-overscroll">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">My Activities</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Track your community involvement and requests</p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Link href="/dashboard/requests/create">
                <Button className="flex items-center gap-2 w-full sm:w-auto" size="sm">
                  <Plus className="h-4 w-4" />
                  <span className="hidden xs:inline">New Request</span>
                  <span className="xs:hidden">New</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-4 sm:mb-6 hover:shadow-sm transition-shadow duration-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search your requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 sm:h-11"
                />
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 sm:flex-none px-3 py-2 sm:py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-0"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="accepted">Accepted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        {filteredRequests.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request._id} className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Mobile Layout - Stacked */}
                    <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <div className="text-xl sm:text-2xl flex-shrink-0">{getTypeIcon(request.type)}</div>
                      <div className="flex-1 min-w-0">
                        {/* Title and Badges */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
                          <h3 className="text-base sm:text-lg font-medium text-gray-900 line-clamp-2 sm:line-clamp-1 flex-1 min-w-0">
                            {request.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                            <Badge className={`text-xs px-2 py-1 ${getPriorityColor(request.priority)}`}>
                              <Flag className="h-3 w-3 mr-1" />
                              <span className="capitalize">{request.priority}</span>
                            </Badge>
                            <Badge className={`text-xs px-2 py-1 ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                            </Badge>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm sm:text-base mb-3 line-clamp-2">
                          {request.description}
                        </p>

                        {/* Meta Information */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                          <div className="flex items-center min-w-0">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{request.location}</span>
                          </div>
                          <div className="flex items-center flex-shrink-0">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                          </div>
                          {request.assignedTo && (
                            <div className="flex items-center min-w-0">
                              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">
                                {request.assignedTo.firstName} {request.assignedTo.lastName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex sm:flex-col justify-end sm:justify-start flex-shrink-0">
                      <Link href={`/dashboard/requests/${request._id}`}>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <span className="hidden xs:inline">View Details</span>
                          <span className="xs:hidden">View</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="hover:shadow-sm transition-shadow duration-200">
            <CardContent className="p-8 sm:p-12 text-center">
              <Activity className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No activities found</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto">
                {searchTerm || filterStatus !== "all"
                  ? "No requests match your current filters. Try adjusting your search or filter criteria."
                  : "You haven't created any requests yet. Start by creating your first request to get help from your community."}
              </p>
              {!searchTerm && filterStatus === "all" && (
                <Link href="/dashboard/requests/create">
                  <Button size="sm" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden xs:inline">Create Your First Request</span>
                    <span className="xs:hidden">Create Request</span>
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
