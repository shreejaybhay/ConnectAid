"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Users,
  ArrowLeft,
  Home,
  Settings,
  LogOut,
  User,
  Activity,
  Calendar,
  FileText,
  HandHeart,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
    }
  }, [session, status, router]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Don't render anything while loading or if not authenticated
  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if we're on the main dashboard page
  const isMainDashboard = pathname === "/dashboard";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Persistent Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  ConnectAid
                </span>
              </Link>

              {/* Navigation Links - Only show if not on main dashboard */}
              {!isMainDashboard && (
                <nav className="hidden md:flex items-center space-x-1">
                  <Link href="/dashboard">
                    <Button
                      variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Home className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>

                  {session.user.role === 'citizen' && (
                    <>
                      <Link href="/dashboard/requests">
                        <Button
                          variant={pathname.startsWith("/dashboard/requests") ? "secondary" : "ghost"}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          My Requests
                        </Button>
                      </Link>
                      <Link href="/dashboard/activities">
                        <Button
                          variant={pathname === "/dashboard/activities" ? "secondary" : "ghost"}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Activity className="h-4 w-4" />
                          Activities
                        </Button>
                      </Link>
                    </>
                  )}

                  {session.user.role === 'volunteer' && (
                    <>
                      <Link href="/dashboard/volunteer/requests">
                        <Button
                          variant={pathname === "/dashboard/volunteer/requests" ? "secondary" : "ghost"}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <HandHeart className="h-4 w-4" />
                          Requests
                        </Button>
                      </Link>
                      <Link href="/dashboard/volunteer/assignments">
                        <Button
                          variant={pathname === "/dashboard/volunteer/assignments" ? "secondary" : "ghost"}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Calendar className="h-4 w-4" />
                          Assignments
                        </Button>
                      </Link>
                      <Link href="/dashboard/volunteer/impact">
                        <Button
                          variant={pathname === "/dashboard/volunteer/impact" ? "secondary" : "ghost"}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Target className="h-4 w-4" />
                          Impact
                        </Button>
                      </Link>
                    </>
                  )}

                  {/* Settings - Available to all users */}
                  <Link href="/dashboard/settings">
                    <Button
                      variant={pathname === "/dashboard/settings" ? "secondary" : "ghost"}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                  </Link>
                </nav>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Back to Dashboard - Only show on sub-pages */}
              {!isMainDashboard && (
                <Link href="/dashboard" className="md:hidden">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                </Link>
              )}

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 px-3 py-6">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center ">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {session.user.firstName} {session.user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {session.user.role}
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">
                      {session.user.firstName} {session.user.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 hover:bg-red/20">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}
