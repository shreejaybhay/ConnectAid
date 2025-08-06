"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { Users, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 w-full border-b border-border/10 bg-white/95 backdrop-blur-md shadow-sm"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-6 lg:space-x-8">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                ConnectAid
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {[
                { name: "Home", href: "#home" },
                { name: "Services", href: "#services" },
                { name: "How It Works", href: "#how-it-works" },
                { name: "Vision", href: "#vision" },
                { name: "Contact", href: "#contact" },
              ].map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    item.name === "Home"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.name}
                </motion.a>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {session ? (
              <Button
                onClick={() => router.push(session.user.role === 'admin' ? '/admin/dashboard' : '/dashboard')}
                className="hidden md:inline-flex bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2"
                size="sm"
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => router.push("/login")}
                  variant="ghost"
                  className="hidden md:inline-flex"
                  size="sm"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => router.push("/register")}
                  className="hidden md:inline-flex bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2"
                  size="sm"
                >
                  Get Started
                </Button>
              </>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <motion.div
                animate={{ rotate: mobileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </motion.div>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/5 md:hidden z-40"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Menu */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0.0, 0.2, 1],
              }}
              className="absolute top-full left-0 right-0 bg-white/98 backdrop-blur-md border-b border-border/10 shadow-lg md:hidden z-50 overflow-hidden"
            >
              <motion.div
                className="container mx-auto px-4"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="py-4 space-y-2">
                  {[
                    { name: "Home", href: "#home" },
                    { name: "Services", href: "#services" },
                    { name: "How It Works", href: "#how-it-works" },
                    { name: "Vision", href: "#vision" },
                    { name: "Contact", href: "#contact" },
                  ].map((item, index) => (
                    <motion.a
                      key={item.name}
                      href={item.href}
                      className="block px-4 py-3 text-base font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05 + 0.1,
                      }}
                      whileHover={{ x: 4 }}
                    >
                      {item.name}
                    </motion.a>
                  ))}
                  <motion.div
                    className="px-4 pt-2 pb-1 space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    {session ? (
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5"
                        size="sm"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          router.push(session.user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
                        }}
                      >
                        Dashboard
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="w-full py-2.5"
                          size="sm"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            router.push("/login");
                          }}
                        >
                          Sign In
                        </Button>
                        <Button
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5"
                          size="sm"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            router.push("/register");
                          }}
                        >
                          Get Started
                        </Button>
                      </>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
