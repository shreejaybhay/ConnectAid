"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ArrowLeft,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Phone,
  Mail,
  Edit,
  Trash2,
  Star,
  MessageSquare,
  Calendar,
  Flag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import FeedbackForm from "@/components/feedback-form";

const RequestDetailPage = ({ params }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [request, setRequest] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestId, setRequestId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Handle async params
  useEffect(() => {
    const getParams = async () => {
      const { id } = await params;
      setRequestId(id);
    };
    getParams();
  }, [params]);

  const fetchRequest = useCallback(async () => {
    if (!requestId) return;

    try {
      const response = await fetch(`/api/requests/${requestId}`);
      const data = await response.json();

      if (response.ok) {
        setRequest(data.request);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch request",
          variant: "destructive",
        });
        router.push('/dashboard/requests');
      }
    } catch (error) {
      console.error('Fetch request error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [requestId, toast, router]);

  const fetchFeedback = useCallback(async () => {
    if (!requestId) return;

    try {
      const response = await fetch(`/api/feedback?requestId=${requestId}`);
      const data = await response.json();

      if (response.ok) {
        setFeedback(data.feedback);
      }
    } catch (error) {
      console.error('Fetch feedback error:', error);
    }
  }, [requestId]);

  // Handle feedback submission
  const handleFeedbackSubmitted = (newFeedback) => {
    setFeedback(newFeedback);
  };

  // Fetch data when authenticated and requestId is available
  useEffect(() => {
    if (status === "authenticated" && requestId) {
      fetchRequest();
      fetchFeedback();
    }
  }, [status, requestId, fetchRequest, fetchFeedback]);

  const handleDeleteRequest = async () => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    if (!requestId) return;

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
        router.push('/dashboard/requests');
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

  const handleAcceptRequest = async () => {
    if (!requestId) return;

    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'accept' }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Request Accepted! 🎉",
          description: "You've successfully accepted this request",
        });
        // Refresh the request data
        fetchRequest();
      } else {
        toast({
          title: "Failed to Accept Request",
          description: data.error || "An error occurred",
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
        return '📋';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || !request) {
    return null;
  }

  const canEdit = request.createdBy._id === session.user.id && request.status === 'open';
  const canDelete = request.createdBy._id === session.user.id && request.status === 'open';
  const canAccept = session.user.role === 'volunteer' &&
                   request.status === 'open' &&
                   request.createdBy._id !== session.user.id;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-3xl flex-shrink-0">{getTypeIcon(request.type)}</span>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-xl truncate">{request.title}</CardTitle>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mt-2">
                        <span className="flex items-center gap-1 min-w-0 flex-1">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{request.location}</span>
                        </span>
                        <span className="flex items-center gap-1 flex-shrink-0">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">{new Date(request.createdAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                    <Badge className={`px-2 py-1 text-xs ${getPriorityColor(request.priority)}`}>
                      <Flag className="h-3 w-3 mr-1" />
                      {request.priority} priority
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{request.description}</p>
                  </div>

                  {/* Images */}
                  {request.images && request.images.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Images</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {request.images.map((image, index) => (
                          <img
                            key={index}
                            src={image.url}
                            alt={`Request image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setSelectedImage(image.url)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {(canEdit || canAccept) && (
                    <div className="flex gap-2 pt-4 border-t">
                      {canEdit && (
                        <>
                          <Link href={`/dashboard/requests/${request._id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Request
                            </Button>
                          </Link>
                          {canDelete && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleDeleteRequest}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Request
                            </Button>
                          )}
                        </>
                      )}
                      {canAccept && (
                        <Button
                          size="sm"
                          onClick={handleAcceptRequest}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept Request
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Feedback Section */}
            {request.status === 'completed' && feedback && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= feedback.rating
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {feedback.rating}/5 stars
                      </span>
                    </div>
                    {feedback.comment && (
                      <p className="text-gray-700">{feedback.comment}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      From {feedback.fromUser.firstName} {feedback.fromUser.lastName}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feedback Form - For citizens to give feedback when request is completed */}
            {request.status === 'completed' &&
             !feedback &&
             session?.user?.role === 'citizen' &&
             request.createdBy._id === session.user.id &&
             request.assignedTo && (
              <FeedbackForm
                request={request}
                onFeedbackSubmitted={handleFeedbackSubmitted}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Request Info */}
            <Card>
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  {getStatusBadge(request.status)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Type</span>
                  <div className="flex items-center gap-2">
                    <span>{getTypeIcon(request.type)}</span>
                    <span className="capitalize">{request.type}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Priority</span>
                  <Badge className={`px-2 py-1 text-xs ${getPriorityColor(request.priority)}`}>
                    <Flag className="h-3 w-3 mr-1" />
                    {request.priority}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-gray-500">Created</span>
                  <div className="text-right">
                    <div className="text-sm">
                      {new Date(request.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(request.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                {request.acceptedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Accepted</span>
                    <span className="text-sm">
                      {new Date(request.acceptedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}

                {request.completedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Completed</span>
                    <span className="text-sm">
                      {new Date(request.completedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Volunteer Info */}
            {request.assignedTo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Assigned Volunteer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">
                        {request.assignedTo.firstName} {request.assignedTo.lastName}
                      </p>
                    </div>
                    
                    {request.assignedTo.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <a 
                          href={`mailto:${request.assignedTo.email}`}
                          className="hover:text-primary"
                        >
                          {request.assignedTo.email}
                        </a>
                      </div>
                    )}
                    
                    {request.assignedTo.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <a 
                          href={`tel:${request.assignedTo.phone}`}
                          className="hover:text-primary"
                        >
                          {request.assignedTo.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {request.contactInfo?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <a
                        href={`tel:${request.contactInfo.phone}`}
                        className="text-sm hover:text-blue-600"
                      >
                        {request.contactInfo.phone}
                      </a>
                    </div>
                  </div>
                )}

                {request.contactInfo?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <a
                        href={`mailto:${request.contactInfo.email}`}
                        className="text-sm hover:text-blue-600"
                      >
                        {request.contactInfo.email}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-gray-500">Preferred</span>
                  <span className="text-sm capitalize">
                    {request.contactInfo?.preferredContact || 'email'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Image Modal */}
      <AnimatePresence mode="wait">
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.15,
              ease: [0.4, 0.0, 0.2, 1]
            }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{
                duration: 0.15,
                ease: [0.4, 0.0, 0.2, 1]
              }}
              className="relative max-w-4xl max-h-full"
            >
              <img
                src={selectedImage}
                alt="Full size image"
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.1,
                  ease: "easeOut"
                }}
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2 hover:bg-black/60 transition-colors duration-150"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RequestDetailPage;
