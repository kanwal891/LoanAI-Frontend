"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ")
}

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  glowColor?: "primary" | "accent" | "aurora"
  onClick?: () => void
}

export function GlassCard({ 
  children, 
  className = "", 
  hover = true, 
  glow = false,
  glowColor = "primary",
  onClick
}: GlassCardProps) {
  const glowStyles = {
    primary: "hover:shadow-[0_0_40px_rgba(27,79,187,0.25)]",
    accent: "hover:shadow-[0_0_40px_rgba(255,107,53,0.25)]",
    aurora: "hover:shadow-[0_0_40px_rgba(139,92,246,0.25)]"
  }

  return (
    <motion.div
      className={cn(
        "glass-card rounded-2xl",
        hover && "card-hover cursor-pointer",
        glow && glowStyles[glowColor],
        className
      )}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
