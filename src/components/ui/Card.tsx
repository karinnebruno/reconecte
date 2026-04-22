"use client";

import { motion } from "framer-motion";
import { HTMLAttributes, forwardRef } from "react";

type CardVariant = "default" | "dark" | "lilac";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  pressable?: boolean;
}

const variants: Record<CardVariant, string> = {
  default: "bg-white shadow-[0_2px_16px_rgba(26,10,46,0.07)]",
  dark:    "bg-[#1A0A2E] shadow-[0_4px_24px_rgba(26,10,46,0.24)]",
  lilac:   "bg-[#EDD5F5] border border-[#B07FD4]/30",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", pressable = false, className = "", children, ...props }, ref) => {
    const base = `rounded-2xl p-4 ${variants[variant]} ${className}`;

    if (pressable) {
      return (
        <motion.div
          ref={ref}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className={`${base} cursor-pointer`}
          {...(props as object)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={base} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
