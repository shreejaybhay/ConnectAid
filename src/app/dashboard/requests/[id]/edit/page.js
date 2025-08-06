"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Users,
  ArrowLeft,
  Upload,
  X,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  Heart,
  Trash2,
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { createRequestSchema } from "@/lib/validations";

// Utility functions for image handling
const validateImageFile = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Maximum size is 5MB.'
    };
  }

  return { valid: true };
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

const EditRequestPage = ({ params }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  // Handle async params
  useEffect(() => {
    const getParams = async () => {
      const { id } = await params;
      setRequestId(id);
    };
    getParams();
  }, [params]);

  const form = useForm({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "other",
      location: "",
      priority: "medium",
      contactInfo: {
        phone: "",
        email: "",
        preferredContact: "both"
      }
    }
  });

  // Fetch request data
  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestId) return;
      
      try {
        const response = await fetch(`/api/requests/${requestId}`);
        const data = await response.json();
        
        if (response.ok) {
          setRequest(data.request);
          // Set form values
          form.reset({
            title: data.request.title,
            description: data.request.description,
            type: data.request.type,
            location: data.request.location,
            priority: data.request.priority,
            contactInfo: {
              phone: data.request.contactInfo?.phone || "",
              email: data.request.contactInfo?.email || "",
              preferredContact: data.request.contactInfo?.preferredContact || "both"
            }
          });
          
          // Set existing images
          if (data.request.images && data.request.images.length > 0) {
            const existingImages = data.request.images.map((img, index) => ({
              preview: img.url,
              existing: true,
              url: img.url,
              publicId: img.publicId
            }));
            setImages(existingImages);
          }
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
          description: "Failed to fetch request",
          variant: "destructive",
        });
        router.push('/dashboard/requests');
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && requestId) {
      fetchRequest();
    }
  }, [status, requestId, form, toast, router]);

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    if (images.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "Maximum 5 images allowed",
        variant: "destructive",
      });
      return;
    }

    const validFiles = [];
    const invalidFiles = [];

    for (const file of files) {
      const validation = validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        invalidFiles.push({ name: file.name, error: validation.error });
      }
    }

    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid files",
        description: invalidFiles.map(f => `${f.name}: ${f.error}`).join(', '),
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      try {
        const base64Images = await Promise.all(
          validFiles.map(async (file) => {
            const base64 = await fileToBase64(file);
            return {
              file,
              base64,
              preview: URL.createObjectURL(file),
              existing: false
            };
          })
        );

        setImages(prev => [...prev, ...base64Images]);
        setImageFiles(prev => [...prev, ...validFiles]);
      } catch (error) {
        console.error('Image processing error:', error);
        toast({
          title: "Error",
          description: "Failed to process images",
          variant: "destructive",
        });
      }
    }
  };

  const removeImage = (index) => {
    setImages(prev => {
      const newImages = [...prev];
      if (!newImages[index].existing && newImages[index].preview) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      return newImages;
    });
    setImageFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      // Prepare images for upload - only include new images
      const newImages = images.filter(img => !img.existing);
      const imagesToUpload = newImages.map(img => img.base64);
      
      // Keep existing images
      const existingImages = images.filter(img => img.existing).map(img => ({
        url: img.url,
        publicId: img.publicId
      }));

      const requestData = {
        ...data,
        images: imagesToUpload,
        existingImages: existingImages
      };

      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Request Updated! 🎉",
          description: "Your request has been updated successfully",
          variant: "success",
        });
        router.push(`/dashboard/requests/${requestId}`);
      } else {
        toast({
          title: "Failed to Update Request",
          description: result.error || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Update request error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'citizen') {
    router.push('/dashboard');
    return null;
  }

  if (!request) {
    return null;
  }

  // Check if user can edit this request
  const canEdit = request.createdBy._id === session.user.id && request.status === 'open';

  if (!canEdit) {
    toast({
      title: "Access Denied",
      description: "You can only edit your own open requests",
      variant: "destructive",
    });
    router.push('/dashboard/requests');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                ConnectAid
              </span>
            </div>

            {/* Back to Request */}
            <Link href={`/dashboard/requests/${requestId}`}>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Request
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Edit Request</h1>
            <p className="text-gray-600 mt-1">
              Update your request details
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg border p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Request Type */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Request Type *</Label>
                <RadioGroup
                  value={form.watch('type')}
                  onValueChange={(value) => form.setValue('type', value)}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50">
                    <RadioGroupItem value="blood" id="blood" />
                    <Label htmlFor="blood" className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xl">🩸</span>
                      <div>
                        <div className="font-medium">Blood Donation</div>
                        <div className="text-sm text-gray-600">Need blood or donors</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50">
                    <RadioGroupItem value="garbage" id="garbage" />
                    <Label htmlFor="garbage" className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xl">🗑️</span>
                      <div>
                        <div className="font-medium">Garbage Pickup</div>
                        <div className="text-sm text-gray-600">Waste collection help</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xl">🤝</span>
                      <div>
                        <div className="font-medium">Other Help</div>
                        <div className="text-sm text-gray-600">General assistance</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
                {form.formState.errors.type && (
                  <p className="text-red-500 text-sm">{form.formState.errors.type.message}</p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-medium">Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief description of what you need"
                  {...form.register('title')}
                  className={`${form.formState.errors.title ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-medium">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about your request..."
                  rows={4}
                  {...form.register('description')}
                  className={`${form.formState.errors.description ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-base font-medium">Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    placeholder="Where do you need help?"
                    className={`pl-10 ${form.formState.errors.location ? 'border-red-500' : ''}`}
                    {...form.register('location')}
                  />
                </div>
                {form.formState.errors.location && (
                  <p className="text-red-500 text-sm">{form.formState.errors.location.message}</p>
                )}
              </div>

              {/* Priority */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Priority Level</Label>
                <RadioGroup
                  value={form.watch('priority')}
                  onValueChange={(value) => form.setValue('priority', value)}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {[
                    { value: 'low', label: 'Low', color: 'text-green-600' },
                    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
                    { value: 'high', label: 'High', color: 'text-orange-600' },
                    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
                  ].map((priority) => (
                    <div key={priority.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={priority.value} id={priority.value} />
                      <Label htmlFor={priority.value} className={`cursor-pointer ${priority.color}`}>
                        {priority.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Images */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Images (Optional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 mb-2">
                      Upload up to 5 images to help explain your request
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('image-upload').click()}
                    >
                      Choose Images
                    </Button>
                  </div>
                </div>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-medium">Contact Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        placeholder="Your phone number"
                        className="pl-10"
                        {...form.register('contactInfo.phone')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Your email address"
                        className="pl-10"
                        {...form.register('contactInfo.email')}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Preferred Contact Method</Label>
                  <RadioGroup
                    value={form.watch('contactInfo.preferredContact')}
                    onValueChange={(value) => form.setValue('contactInfo.preferredContact', value)}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="phone" id="contact-phone" />
                      <Label htmlFor="contact-phone">Phone</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="contact-email" />
                      <Label htmlFor="contact-email">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="contact-both" />
                      <Label htmlFor="contact-both">Both</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Link href={`/dashboard/requests/${requestId}`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating Request...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditRequestPage;
