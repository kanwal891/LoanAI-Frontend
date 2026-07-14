"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { ReactNode, useRef } from "react"
import { cn } from "../lib/utils"

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  variant?: "primary" | "secondary" | "accent" | "ghost"
  size?: "sm" | "md" | "lg"
  type?: "button" | "submit" | "reset"
  onClick?: () => void
  disabled?: boolean
}

export function MagneticButton({
  children,
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  onClick,
  disabled = false
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const springConfig = { damping: 15, stiffness: 300 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || disabled) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const distX = (e.clientX - centerX) * 0.1
    const distY = (e.clientY - centerY) * 0.1
    x.set(Math.max(-8, Math.min(8, distX)))
    y.set(Math.max(-8, Math.min(8, distY)))
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const variantStyles = {
    primary: "bg-gradient-to-r from-[#1B4FBB] to-[#6366F1] text-white hover:shadow-[0_0_30px_rgba(27,79,187,0.4)]",
    secondary: "bg-white/10 text-white border border-white/20 hover:bg-white/15",
    accent: "bg-gradient-to-r from-[#FF6B35] to-[#FF8F6B] text-white hover:shadow-[0_0_30px_rgba(255,107,53,0.4)]",
    ghost: "bg-transparent text-white hover:bg-white/10"
  }

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      className={cn(
        "relative rounded-xl font-medium transition-all duration-300 overflow-hidden ripple",
        variantStyles[variant],
        sizeStyles[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  )
}
