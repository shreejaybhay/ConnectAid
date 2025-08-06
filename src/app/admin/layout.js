"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Shield,
  UserCheck,
  Settings,
  LogOut,
  User,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect if not authenticated or not admin
  React.useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "admin") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Don't render anything while loading or if not authenticated/authorized
  if (status === "loading" || !session || session.user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const user = session?.user;
  const isMainAdminDashboard = pathname === "/admin/dashboard";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Persistent Admin Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-6">
              <Link href="/admin/dashboard" className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  ConnectAid Admin
                </span>
              </Link>

              {/* Navigation Links - Only show if not on main admin dashboard */}
              {!isMainAdminDashboard && (
                <nav className="hidden lg:flex items-center space-x-1">
                  <Link href="/admin/dashboard">
                    <Button
                      variant={pathname === "/admin/dashboard" ? "secondary" : "ghost"}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Home className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>

                  <Link href="/admin/volunteers">
                    <Button
                      variant={pathname === "/admin/volunteers" ? "secondary" : "ghost"}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span className="hidden xl:inline">Volunteer</span> Approvals
                    </Button>
                  </Link>

                  <Link href="/admin/users">
                    <Button
                      variant={pathname === "/admin/users" ? "secondary" : "ghost"}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      <span className="hidden xl:inline">User</span> Management
                    </Button>
                  </Link>
                </nav>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {/* Back to Dashboard - Show on mobile and tablet */}
              {!isMainAdminDashboard && (
                <Link href="/admin/dashboard" className="lg:hidden">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <span className="hidden md:inline">Dashboard</span>
                    <span className="md:hidden">Back</span>
                  </Button>
                </Link>
              )}

              {/* Admin User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 px-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">Administrator</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
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
