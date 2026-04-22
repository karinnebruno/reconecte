"use client";

import { motion } from "framer-motion";

interface StreakBadgeProps {
  count: number;
  animated?: boolean;
  className?: string;
}

export function StreakBadge({ count, animated = true, className = "" }: StreakBadgeProps) {
  return (
    <motion.div
      className={`flex items-center gap-1 bg-[#1A0A2E] rounded-full px-3 py-1.5 ${className}`}
      initial={animated ? { scale: 0.8, opacity: 0 } : undefined}
      animate={animated ? { scale: 1, opacity: 1 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <span className="text-sm">🔥</span>
      <span className="font-sans text-[11px] text-white tracking-wider">{count}</span>
    </motion.div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: "lilac" | "dark" | "outline";
  className?: string;
}

export function Badge({ children, variant = "lilac", className = "" }: BadgeProps) {
  const variants = {
    lilac:   "bg-[#EDD5F5] text-[#6B3FA0]",
    dark:    "bg-[#1A0A2E] text-[#B07FD4]",
    outline: "border border-[#9B7BB8] text-[#9B7BB8] bg-transparent",
  };

  return (
    <span
      className={`inline-flex items-center font-sans text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
