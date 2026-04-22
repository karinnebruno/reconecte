"use client";

import { motion } from "framer-motion";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const styles: Record<Variant, string> = {
  primary:
    "bg-[#6B3FA0] text-white tracking-widest uppercase text-xs hover:bg-[#B07FD4] active:scale-95",
  secondary:
    "bg-transparent text-[#6B3FA0] border border-[#6B3FA0] tracking-widest uppercase text-xs hover:bg-[#F0E2FB] active:scale-95",
  ghost:
    "bg-transparent text-[#9B7BB8] tracking-widest uppercase text-xs hover:text-[#6B3FA0] active:scale-95",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 rounded-full text-[11px]",
  md: "px-6 py-3 rounded-full text-xs",
  lg: "px-8 py-4 rounded-full text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth, className = "", children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.1 }}
        className={[
          styles[variant],
          sizes[size],
          fullWidth ? "w-full" : "",
          "transition-all duration-200 cursor-pointer select-none font-sans",
          className,
        ].join(" ")}
        {...(props as object)}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
