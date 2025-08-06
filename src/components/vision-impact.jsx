"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Droplets,
  Trash2,
  Handshake,
  Users,
  Target,
  Heart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const iconFloat = {
  initial: {
    y: 0,
  },
  animate: {
    y: [-2, 2, -2],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const VisionImpact = () => {
  const goalCards = [
    {
      icon: Droplets,
      title: "1,000+ Blood Requests Fulfilled",
      label: "Goal for Year 1",
      description: "Connecting donors with urgent blood needs in our community",
      iconBg: "bg-red-500/10",
      iconColor: "text-red-600",
      badgeVariant: "destructive",
    },
    {
      icon: Trash2,
      title: "500+ Neighborhood Clean-ups",
      label: "Our Target",
      description: "Organizing community-driven environmental initiatives",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-600",
      badgeVariant: "default",
    },
    {
      icon: Handshake,
      title: "2,500+ Volunteer Connections",
      label: "Goal for Year 1",
      description: "Building lasting relationships between neighbors",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      badgeVariant: "secondary",
    },
    {
      icon: Users,
      title: "50+ Active Communities",
      label: "Our Target",
      description: "Expanding ConnectAid to neighborhoods nationwide",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600",
      badgeVariant: "outline",
    },
  ];

  return (
    <section id="vision" className="relative py-12 bg-gradient-to-b from-muted/15 via-muted/25 to-muted/20 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-muted/15 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12"
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <Badge
              variant="secondary"
              className="inline-flex items-center gap-2 px-4 py-2 mb-4"
            >
              <Target className="w-4 h-4" />
              Prototype Stage
            </Badge>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6"
          >
            Our Vision for Local Impact
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            ConnectAid is built with the belief that every neighborhood can
            support itself when given the right tools.
          </motion.p>
        </motion.div>

        {/* Goal Cards Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12"
        >
          {goalCards.map((card, index) => {
            const IconComponent = card.icon;

            return (
              <motion.div
                key={card.title}
                variants={fadeInUp}
                whileHover="hover"
                className="group"
              >
                <motion.div
                  variants={cardHover}
                  className="bg-card text-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 h-full flex flex-col border border-border/50"
                >
                  {/* Icon */}
                  <motion.div
                    variants={iconFloat}
                    initial="initial"
                    animate="animate"
                    className="mb-4"
                  >
                    <div
                      className={`w-12 h-12 ${card.iconBg} rounded-full flex items-center justify-center mb-4`}
                    >
                      <IconComponent
                        className={`h-6 w-6 ${card.iconColor}`}
                        aria-hidden="true"
                      />
                    </div>
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-foreground mb-3 leading-tight">
                      {card.title}
                    </h3>

                    <Badge
                      variant={card.badgeVariant}
                      className="self-start mb-3 text-xs"
                    >
                      {card.label}
                    </Badge>

                    <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                      {card.description}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Community Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <div className="relative max-w-2xl w-full">
            <div className="relative bg-gradient-to-br from-card/80 to-accent/20 rounded-3xl p-8 lg:p-12 shadow-lg border border-border/30 backdrop-blur-sm">
              <Image
                src="/pro png1.png"
                alt="Diverse community members working together - representing ConnectAid's vision of neighborhood collaboration"
                width={600}
                height={400}
                className="w-full h-auto rounded-2xl"
                priority={false}
              />

              {/* Floating badge */}
              <motion.div
                animate={{
                  y: [-4, 4, -4],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-4 -right-4 bg-primary text-primary-foreground rounded-full px-4 py-2 shadow-lg text-sm font-medium"
              >
                Building Together
              </motion.div>

              {/* Decorative elements */}
              <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-green-500/20 rounded-full blur-sm" />
              <div className="absolute -top-2 -left-4 w-6 h-6 bg-orange-500/20 rounded-full blur-sm" />
            </div>
          </div>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center bg-accent/20 rounded-2xl p-8 lg:px-12 border border-accent/30"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Heart className="h-8 w-8 text-primary" />
            </div>
          </div>

          <blockquote className="text-lg sm:text-xl lg:text-2xl font-medium text-foreground leading-relaxed max-w-4xl mx-auto">
            "We envision communities where neighbors know each other, support
            one another, and work together to solve local challenges—one request
            at a time."
          </blockquote>

          <cite className="block mt-6 text-muted-foreground font-medium">
            — The ConnectAid Team
          </cite>
        </motion.div>
      </div>
    </section>
  );
};

export default VisionImpact;