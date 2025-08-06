"use client";

import React, { useState } from "react";
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
  Trash2
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

const CreateRequestPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  const form = useForm({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "other",
      location: "",
      priority: "medium",
      contactInfo: {
        phone: session?.user?.phone || "",
        email: session?.user?.email || "",
        preferredContact: "both"
      }
    }
  });

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
              preview: URL.createObjectURL(file)
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
      URL.revokeObjectURL(newImages[index].preview);
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
      // Prepare images for upload
      const imagesToUpload = images.map(img => img.base64);

      const requestData = {
        ...data,
        images: imagesToUpload
      };

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Request Created! 🎉",
          description: "Your request has been posted to the community",
          variant: "success",
        });
        router.push('/dashboard/requests');
      } else {
        toast({
          title: "Failed to Create Request",
          description: result.error || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Create request error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
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

  return (
    <div className="bg-gray-50 content-fit no-overscroll">
      {/* Main Content */}
      <main className="w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 content-fit">
        <div className="w-full space-y-4 sm:space-y-6 content-fit">
          {/* Page Header */}
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
              Create New Request
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Ask your community for help with a service you need
            </p>
          </div>

          {/* Form */}
          <div className="w-full bg-white rounded-lg border p-4 sm:p-6 hover:shadow-sm transition-shadow duration-200">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
              {/* Request Type */}
              <div className="space-y-3 sm:space-y-4">
                <Label className="text-sm sm:text-base font-medium">Request Type *</Label>
                <RadioGroup
                  value={form.watch('type')}
                  onValueChange={(value) => form.setValue('type', value)}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
                >
                  <div className="flex items-center space-x-3 border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-200">
                    <RadioGroupItem value="blood" id="blood" className="flex-shrink-0" />
                    <Label htmlFor="blood" className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-1 min-w-0">
                      <span className="text-lg sm:text-xl flex-shrink-0">🩸</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base">Blood Donation</div>
                        <div className="text-xs sm:text-sm text-gray-600">Need blood or donors</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-200">
                    <RadioGroupItem value="garbage" id="garbage" className="flex-shrink-0" />
                    <Label htmlFor="garbage" className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-1 min-w-0">
                      <span className="text-lg sm:text-xl flex-shrink-0">🗑️</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base">Garbage Pickup</div>
                        <div className="text-xs sm:text-sm text-gray-600">Waste collection help</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-200 sm:col-span-2 lg:col-span-1">
                    <RadioGroupItem value="other" id="other" className="flex-shrink-0" />
                    <Label htmlFor="other" className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-1 min-w-0">
                      <span className="text-lg sm:text-xl flex-shrink-0">🤝</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base">Other Help</div>
                        <div className="text-xs sm:text-sm text-gray-600">General assistance</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
                {form.formState.errors.type && (
                  <p className="text-red-500 text-xs sm:text-sm">{form.formState.errors.type.message}</p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="title" className="text-sm sm:text-base font-medium">Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief description of what you need"
                  {...form.register('title')}
                  className={`h-10 sm:h-11 ${form.formState.errors.title ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-xs sm:text-sm">{form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="description" className="text-sm sm:text-base font-medium">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about your request..."
                  rows={4}
                  {...form.register('description')}
                  className={`resize-none ${form.formState.errors.description ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-xs sm:text-sm">{form.formState.errors.description.message}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="location" className="text-sm sm:text-base font-medium">Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    placeholder="Where do you need help?"
                    className={`pl-10 h-10 sm:h-11 ${form.formState.errors.location ? 'border-red-500' : ''}`}
                    {...form.register('location')}
                  />
                </div>
                {form.formState.errors.location && (
                  <p className="text-red-500 text-xs sm:text-sm">{form.formState.errors.location.message}</p>
                )}
              </div>

              {/* Priority */}
              <div className="space-y-3 sm:space-y-4">
                <Label className="text-sm sm:text-base font-medium">Priority Level</Label>
                <RadioGroup
                  value={form.watch('priority')}
                  onValueChange={(value) => form.setValue('priority', value)}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
                >
                  {[
                    { value: 'low', label: 'Low', color: 'text-green-600' },
                    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
                    { value: 'high', label: 'High', color: 'text-orange-600' },
                    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
                  ].map((priority) => (
                    <div key={priority.value} className="flex items-center space-x-2 sm:space-x-3">
                      <RadioGroupItem value={priority.value} id={priority.value} className="flex-shrink-0" />
                      <Label htmlFor={priority.value} className={`cursor-pointer text-sm sm:text-base ${priority.color}`}>
                        {priority.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Images */}
              <div className="space-y-3 sm:space-y-4">
                <Label className="text-sm sm:text-base font-medium">Images (Optional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 hover:border-gray-400 transition-colors duration-200">
                  <div className="text-center">
                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2 sm:mb-3" />
                    <div className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
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
                      className="w-full sm:w-auto"
                    >
                      Choose Images
                    </Button>
                  </div>
                </div>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 sm:h-32 object-cover rounded-lg border hover:shadow-md transition-shadow duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 sm:p-1.5 hover:bg-red-600 transition-colors duration-200 opacity-90 group-hover:opacity-100"
                        >
                          <X className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-4 sm:space-y-6 border-t pt-6 sm:pt-8">
                <h3 className="text-base sm:text-lg font-medium">Contact Information</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="phone" className="text-sm sm:text-base">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        placeholder="Your phone number"
                        className="pl-10 h-10 sm:h-11"
                        {...form.register('contactInfo.phone')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="email" className="text-sm sm:text-base">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Your email address"
                        className="pl-10 h-10 sm:h-11"
                        {...form.register('contactInfo.email')}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <Label className="text-sm sm:text-base">Preferred Contact Method</Label>
                  <RadioGroup
                    value={form.watch('contactInfo.preferredContact')}
                    onValueChange={(value) => form.setValue('contactInfo.preferredContact', value)}
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <RadioGroupItem value="phone" id="contact-phone" className="flex-shrink-0" />
                      <Label htmlFor="contact-phone" className="text-sm sm:text-base">Phone</Label>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <RadioGroupItem value="email" id="contact-email" className="flex-shrink-0" />
                      <Label htmlFor="contact-email" className="text-sm sm:text-base">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <RadioGroupItem value="both" id="contact-both" className="flex-shrink-0" />
                      <Label htmlFor="contact-both" className="text-sm sm:text-base">Both</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 sm:pt-8 border-t">
                <Link href="/dashboard/requests">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto order-1 sm:order-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span className="hidden xs:inline">Creating Request...</span>
                      <span className="xs:hidden">Creating...</span>
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-2" />
                      <span className="hidden xs:inline">Create Request</span>
                      <span className="xs:hidden">Create</span>
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

export default CreateRequestPage;
