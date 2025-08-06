"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

// Animation variants
const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.8 } },
};

const HeroSection = () => {
  const router = useRouter();

  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-b from-orange-50/30 via-white/80 to-orange-50/20 min-h-[calc(100svh-65px)] flex items-center py-8 sm:py-12 lg:py-0">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-orange-200/50 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="absolute -bottom-20 -right-20 w-80 h-80 bg-orange-200/40 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center min-h-full">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6 sm:space-y-8 text-center lg:text-left order-2 lg:order-1"
          >
            <motion.div variants={fadeInUp} className="space-y-4 sm:space-y-6">
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-2 px-4 py-2"
              >
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                Now Live in Your Community
              </Badge>

              <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
                Turn Local Needs into{" "}
                <span className="text-primary relative">
                  Lasting Impact
                  <motion.div
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-primary/30 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  />
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 px-4 sm:px-0">
                Easily request or volunteer for essential community
                services—like blood donations and neighborhood clean-ups—in just
                a few clicks.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start px-4 sm:px-0"
            >
              <Button
                size="lg"
                onClick={() => router.push("/register")}
                className="group bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base font-semibold"
              >
                Request Help
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/register")}
                className="hover:bg-accent hover:text-accent-foreground transition-all duration-300 px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base bg-transparent"
              >
                Become a Volunteer
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeInRight}
            initial="initial"
            animate="animate"
            className="relative flex justify-center lg:justify-end order-1 lg:order-2"
          >
            <div className="relative max-w-sm sm:max-w-md lg:max-w-lg w-full mx-auto lg:mx-0">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative z-10"
              >
                <Image
                  src="/abstract-blob-1.jpg"
                  alt="Community illustration showing diverse people working together"
                  width={500}
                  height={400}
                  className="w-full h-auto rounded-2xl shadow-2xl"
                  priority
                />
              </motion.div>

              {/* Floating community stats */}
              <motion.div
                animate={{
                  y: [-8, 8, -8],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  type: "tween",
                }}
                className="absolute -top-2 -left-2 sm:-top-4 sm:-left-4 bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-orange-200 z-10 will-change-transform"
                style={{ transform: "translateZ(0)" }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">
                      1,200+
                    </p>
                    <p className="text-xs text-gray-600">Active Members</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{
                  y: [8, -8, 8],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                  type: "tween",
                }}
                className="absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-orange-200 z-10 will-change-transform"
                style={{ transform: "translateZ(0)" }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">500+</p>
                    <p className="text-xs text-gray-600">Requests Fulfilled</p>
                  </div>
                </div>
              </motion.div>

              {/* Additional floating element */}
              <motion.div
                animate={{
                  rotate: [0, 3, -3, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 4,
                  type: "tween",
                }}
                className="absolute top-1/2 left-1 sm:left-2 bg-orange-500 text-white rounded-full p-2 sm:p-3 shadow-lg z-10 will-change-transform"
                style={{ transform: "translateZ(0)" }}
              >
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
