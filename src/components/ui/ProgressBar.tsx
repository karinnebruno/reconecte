"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercent?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function ProgressBar({
  value,
  label,
  showPercent = false,
  size = "md",
  className = "",
}: ProgressBarProps) {
  const height = size === "sm" ? "h-1.5" : "h-2";
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="font-sans text-[10px] tracking-widest uppercase text-[#9B7BB8]">
              {label}
            </span>
          )}
          {showPercent && (
            <span className="font-sans text-[10px] text-[#B07FD4]">{clamped}%</span>
          )}
        </div>
      )}
      <div className={`w-full ${height} bg-[#EDD5F5] rounded-full overflow-hidden`}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#6B3FA0] to-[#B07FD4]"
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </div>
  );
}
