"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  MessageSquarePlus,
  HandHeart,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Animation variants
const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
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

const cardHover = {
  initial: {
    scale: 1,
    y: 0,
    boxShadow:
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  },
  hover: {
    scale: 1.03,
    y: -8,
    boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    transition: {
      duration: 0.3,
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

const ServicesOverview = () => {
  const services = [
    {
      icon: MessageSquarePlus,
      title: "Post a Request",
      description:
        "Share your urgent needs—blood units, trash pickup, and more—with your neighbors.",
      iconBg: "bg-gradient-to-br from-orange-100 to-orange-200",
      iconColor: "text-orange-600",
      gradientFrom: "from-orange-50/50",
      gradientTo: "to-orange-100/30",
    },
    {
      icon: HandHeart,
      title: "Accept Tasks",
      description: "Browse open requests and sign up to help in your area.",
      iconBg: "bg-gradient-to-br from-orange-100 to-orange-200",
      iconColor: "text-orange-600",
      gradientFrom: "from-orange-50/50",
      gradientTo: "to-orange-100/30",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "See real-time updates on every request you've posted.",
      iconBg: "bg-gradient-to-br from-orange-100 to-orange-200",
      iconColor: "text-orange-600",
      gradientFrom: "from-orange-50/50",
      gradientTo: "to-orange-100/30",
    },
  ];

  return (
    <section id="services" className="relative min-h-svh py-24 bg-gradient-to-b from-orange-50/15 via-white/90 to-orange-50/10 overflow-hidden flex flex-col">
      {/* Enhanced Background with multiple layers */}
      <div className="absolute inset-0">
        {/* Subtle texture pattern */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]" />

        {/* Soft gradient overlays */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-100/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-orange-100/6 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-orange-100/5 to-transparent rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex-1 flex flex-col justify-center">
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
            Our Services
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Whether you need help or want to volunteer, ConnectAid makes it fast
            and simple.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 max-w-7xl mx-auto"
        >
          {services.map((service) => {
            const IconComponent = service.icon;

            return (
              <motion.div
                key={service.title}
                variants={fadeInUp}
                whileHover="hover"
                className="group"
              >
                <motion.div
                  variants={cardHover}
                  className={`relative bg-gradient-to-br ${service.gradientFrom} ${service.gradientTo} backdrop-blur-sm rounded-2xl p-8 lg:p-10 border border-white/20 h-full flex flex-col overflow-hidden`}
                >
                  {/* Card background overlay */}
                  <div className="absolute inset-0 bg-card/80 backdrop-blur-sm rounded-2xl" />

                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Icon */}
                    <motion.div variants={iconHover} className="mb-8">
                      <div
                        className={`w-20 h-20 ${service.iconBg} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}
                      >
                        <IconComponent
                          className={`h-10 w-10 ${service.iconColor}`}
                          aria-hidden="true"
                        />
                      </div>
                    </motion.div>

                    {/* Text Content */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                        {service.title}
                      </h3>

                      <p className="text-muted-foreground leading-relaxed mb-8 flex-1 text-base">
                        {service.description}
                      </p>

                      {/* Bold CTA Button */}
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 font-semibold shadow-sm hover:shadow-md"
                        aria-label={`Learn more about ${service.title}`}
                      >
                        Learn More
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Bottom SVG - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8 -mb-6"
      >
        <div className="relative bg-gradient-to-r from-orange-50/50 via-white/30 to-orange-50/50 rounded-t-2xl p-6 shadow-sm">
          <Image
            src="/pro svg1.svg"
            alt="ConnectAid services illustration"
            width={1200}
            height={300}
            className="w-full h-auto opacity-90 object-contain filter brightness-110 contrast-110"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default ServicesOverview;
