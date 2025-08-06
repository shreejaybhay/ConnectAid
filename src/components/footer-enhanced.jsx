"use client";

import { Button } from "@/components/ui/button";
import { Mail, Twitter, Facebook, Instagram } from "lucide-react";
import Link from "next/link";

export default function FooterEnhanced() {
  return (
    <footer id="contact" className="bg-muted border-t border-border">
      <div className="container mx-auto px-6 md:px-12 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Info - Left Column */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">
              ConnectAid
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A platform to connect communities through service.
            </p>
          </div>

          {/* Quick Links - Center Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Quick Links
            </h4>
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:text-foreground"
              >
                Home
              </Link>
              <Link 
                href="/#how-it-works" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:text-foreground"
              >
                How It Works
              </Link>
              <Link 
                href="/#services" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:text-foreground"
              >
                Services
              </Link>
              <Link 
                href="/contact" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:text-foreground"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Contact & Social - Right Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Connect
            </h4>
            <div className="space-y-3">
              <a 
                href="mailto:connectaid@example.com" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:text-foreground flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                connectaid@example.com
              </a>
              
              {/* Social Media Icons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <a href="#" aria-label="Follow us on Twitter">
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <a href="#" aria-label="Follow us on Facebook">
                    <Facebook className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <a href="#" aria-label="Follow us on Instagram">
                    <Instagram className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

      </div>
      
      {/* Bottom Bar - Full Width Border */}
      <div className="border-t border-border">
        <div className="container mx-auto px-6 md:px-12 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 ConnectAid. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}