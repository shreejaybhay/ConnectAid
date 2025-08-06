import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long'),
});

// Registration validation schema
export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name cannot be more than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name cannot be more than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 10, {
      message: 'Phone number must be at least 10 digits'
    }),
  location: z
    .string()
    .optional()
    .refine((val) => !val || val.length <= 100, {
      message: 'Location cannot be more than 100 characters'
    }),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  userType: z
    .enum(['volunteer', 'citizen'], {
      required_error: 'Please select your role'
    }),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must agree to the terms and conditions'
    })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

// Reset password validation schema
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Change password validation schema
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(6, 'New password must be at least 6 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Profile update validation schema
export const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name cannot be more than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name cannot be more than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 10, {
      message: 'Phone number must be at least 10 digits'
    }),
  location: z
    .string()
    .optional()
    .refine((val) => !val || val.length <= 100, {
      message: 'Location cannot be more than 100 characters'
    }),
});

// Request validation schemas
export const createRequestSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot be more than 100 characters')
    .trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description cannot be more than 1000 characters')
    .trim(),
  type: z
    .enum(['blood', 'garbage', 'other'], {
      required_error: 'Request type is required',
      invalid_type_error: 'Invalid request type'
    }),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(200, 'Location cannot be more than 200 characters')
    .trim(),
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .default('medium'),
  contactInfo: z.object({
    phone: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 10, {
        message: 'Phone number must be at least 10 digits'
      }),
    email: z
      .string()
      .email('Invalid email address')
      .optional(),
    preferredContact: z
      .enum(['phone', 'email', 'both'])
      .default('both')
  }).optional()
});

export const updateRequestSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot be more than 100 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description cannot be more than 1000 characters')
    .trim()
    .optional(),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(200, 'Location cannot be more than 200 characters')
    .trim()
    .optional(),
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .optional(),
  contactInfo: z.object({
    phone: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 10, {
        message: 'Phone number must be at least 10 digits'
      }),
    email: z
      .string()
      .email('Invalid email address')
      .optional(),
    preferredContact: z
      .enum(['phone', 'email', 'both'])
      .optional()
  }).optional()
});

// Feedback validation schema
export const feedbackSchema = z.object({
  requestId: z
    .string()
    .min(1, 'Request ID is required'),
  toUserId: z
    .string()
    .min(1, 'Recipient user ID is required'),
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot be more than 5'),
  comment: z
    .string()
    .max(500, 'Comment cannot be more than 500 characters')
    .trim()
    .optional(),
  isPublic: z
    .boolean()
    .default(true)
});
