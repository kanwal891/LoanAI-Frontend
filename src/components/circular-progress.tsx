"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  className?: string
  label?: string
  showValue?: boolean
  color?: "primary" | "accent" | "success" | "warning" | "danger"
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className = "",
  label,
  showValue = true,
  color = "primary"
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  const offset = circumference - (percentage / 100) * circumference

  const colorMap = {
    primary: { stroke: "#1B4FBB", glow: "rgba(27, 79, 187, 0.4)" },
    accent: { stroke: "#FF6B35", glow: "rgba(255, 107, 53, 0.4)" },
    success: { stroke: "#10B981", glow: "rgba(16, 185, 129, 0.4)" },
    warning: { stroke: "#F59E0B", glow: "rgba(245, 158, 11, 0.4)" },
    danger: { stroke: "#EF4444", glow: "rgba(239, 68, 68, 0.4)" }
  }

  const colors = colorMap[color]

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            filter: `drop-shadow(0 0 8px ${colors.glow})`
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <motion.span
            className="text-2xl font-bold text-white"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            {Math.round(percentage)}
          </motion.span>
        )}
        {label && (
          <span className="text-xs text-muted-foreground mt-1">{label}</span>
        )}
      </div>
    </div>
  )
}
