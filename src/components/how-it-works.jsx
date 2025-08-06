"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FileText, Users, CheckCircle2 } from "lucide-react";

// Animation variants
const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const fadeInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const fadeInRight = {
  initial: { opacity: 0, x: 30 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const stepHover = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

const iconHover = {
  initial: {
    scale: 1,
    rotate: 0,
  },
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      icon: FileText,
      title: "Post a Request",
      description: "Share your community needs quickly and easily. Whether it's blood donations, neighborhood clean-ups, or other essential services.",
      iconBg: "bg-gradient-to-br from-orange-100 to-orange-200",
      iconColor: "text-orange-600",
      numberBg: "bg-orange-500",
      lineColor: "border-orange-300",
    },
    {
      number: 2,
      icon: Users,
      title: "Accept a Task",
      description: "Browse available requests in your neighborhood and choose how you'd like to help. Connect with community members and make a real difference.",
      iconBg: "bg-gradient-to-br from-blue-100 to-blue-200",
      iconColor: "text-blue-600",
      numberBg: "bg-blue-500",
      lineColor: "border-blue-300",
    },
    {
      number: 3,
      icon: CheckCircle2,
      title: "Complete & Confirm",
      description: "Follow through on your commitment and confirm completion. Track your impact and build lasting connections within your community.",
      iconBg: "bg-gradient-to-br from-green-100 to-green-200",
      iconColor: "text-green-600",
      numberBg: "bg-green-500",
      lineColor: "border-green-300",
    },
  ];

  return (
    <section 
      id="how-it-works"
      className="relative py-20 bg-gradient-to-b from-orange-50/8 via-white/95 to-muted/20 overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-orange-100/6 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-muted/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Three simple steps to request help or volunteer in your neighborhood.
          </motion.p>
        </motion.div>

        {/* Main Content - Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-7xl mx-auto">
          {/* Left Side - Vertical Timeline Steps */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-8"
          >
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isLast = index === steps.length - 1;

              return (
                <motion.div
                  key={step.number}
                  variants={fadeInLeft}
                  whileHover="hover"
                  className="group relative flex items-start gap-6"
                >
                  {/* Timeline Line */}
                  <div className="relative flex flex-col items-center">
                    {/* Step Number Circle */}
                    <motion.div
                      variants={stepHover}
                      className={`relative z-10 w-12 h-12 ${step.numberBg} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    >
                      {step.number}
                    </motion.div>
                    
                    {/* Connecting Line */}
                    {!isLast && (
                      <div className={`w-0.5 h-16 ${step.lineColor} border-l-2 border-dashed mt-4 opacity-60`} />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Icon */}
                      <motion.div variants={iconHover}>
                        <div
                          className={`w-14 h-14 ${step.iconBg} rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300`}
                        >
                          <IconComponent
                            className={`h-7 w-7 ${step.iconColor}`}
                            aria-hidden="true"
                          />
                        </div>
                      </motion.div>

                      {/* Title and Description */}
                      <div className="flex-1">
                        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Right Side - SVG Illustration */}
          <motion.div
            variants={fadeInRight}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-lg">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-white/40 to-muted/30 rounded-3xl transform rotate-1 scale-105 opacity-60" />
              
              {/* SVG Container */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-border/20">
                <Image
                  src="/pro svg2.svg"
                  alt="How ConnectAid works - visual process illustration showing community connection and collaboration"
                  width={600}
                  height={400}
                  className="w-full h-auto opacity-90 object-contain"
                  priority={false}
                />
              </div>

              {/* Floating elements for visual interest */}
              <motion.div
                animate={{
                  y: [-6, 6, -6],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-3 -right-3 w-6 h-6 bg-orange-400 rounded-full opacity-70 blur-sm"
              />
              <motion.div
                animate={{
                  y: [6, -6, 6],
                  rotate: [360, 180, 0],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }}
                className="absolute -bottom-3 -left-3 w-8 h-8 bg-green-400 rounded-full opacity-70 blur-sm"
              />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute top-1/2 -right-4 w-4 h-4 bg-blue-400 rounded-full opacity-60 blur-sm"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;