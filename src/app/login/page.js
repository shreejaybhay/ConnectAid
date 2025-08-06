"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Users, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle URL parameters for messages
  useEffect(() => {
    const verified = searchParams.get('verified');
    const error = searchParams.get('error');

    if (verified === 'true') {
      toast({
        title: "Email Verified!",
        description: "Your email has been verified successfully. You can now log in.",
        variant: "success",
      });
    }

    if (error) {
      let errorMessage = "An error occurred";
      switch (error) {
        case 'missing-token':
          errorMessage = "Verification token is missing";
          break;
        case 'invalid-token':
          errorMessage = "Invalid or expired verification token";
          break;
        case 'verification-failed':
          errorMessage = "Email verification failed";
          break;
        default:
          errorMessage = "An error occurred during authentication";
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      // First, check user status before attempting login
      const checkResponse = await fetch('/api/auth/check-user-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        }),
      });

      if (checkResponse.status === 401 || checkResponse.status === 404) {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (checkResponse.ok) {
        const statusResult = await checkResponse.json();

        if (!statusResult.canLogin) {
          if (statusResult.reason === 'Email not verified') {
            toast({
              title: "Email Verification Required",
              description: "Please check your email and click the verification link before logging in.",
              variant: "destructive",
            });
          } else if (statusResult.reason === 'Account pending admin approval') {
            toast({
              title: "Wait for Admin Approval",
              description: "Please wait for the admin to approve your volunteer account. You'll get an email when it's ready!",
              variant: "default",
            });
          } else {
            toast({
              title: "Account Issue",
              description: statusResult.reason || "There's an issue with your account. Please contact support.",
              variant: "destructive",
            });
          }
          setIsLoading(false);
          return;
        }

        // User can login, proceed with NextAuth signIn
        const result = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false, // Handle redirect manually for better control
        });

        if (result?.error) {
          console.error('NextAuth signIn error:', result.error);
          toast({
            title: "Login Failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        } else if (result?.ok) {
          toast({
            title: "Welcome back!",
            description: "You have been logged in successfully.",
            variant: "success",
          });

          // Get the callback URL or determine redirect based on user role
          const callbackUrl = searchParams.get('callbackUrl');
          const defaultRedirect = statusResult.user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
          const redirectUrl = callbackUrl || defaultRedirect;

          console.log('Login successful, redirecting to:', redirectUrl);

          // Use router.push for proper Next.js navigation
          setTimeout(() => {
            router.push(redirectUrl);
          }, 1000);
        } else {
          toast({
            title: "Login Failed",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <Users className="h-7 w-7 text-white" />
            </div>
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">ConnectAid</h2>
        </div>

        {/* Welcome Section */}
        <div className="bg-white rounded-lg border p-6">
          <div className="text-center mb-6">
            <Badge variant="outline" className="mb-3">
              Welcome Back
            </Badge>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              Sign In
            </h1>
            <p className="text-gray-600">
              Continue your community journey
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white py-2 font-medium"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
};

export default LoginPage;