"use client"

import { motion } from "framer-motion"

interface AuroraBackgroundProps {
  className?: string
  intensity?: "low" | "medium" | "high"
}

export function AuroraBackground({ className = "", intensity = "medium" }: AuroraBackgroundProps) {
  const opacityMap = {
    low: 0.3,
    medium: 0.5,
    high: 0.7
  }
  
  const opacity = opacityMap[intensity]

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Indigo orb */}
      <motion.div
        className="aurora-orb aurora-orb-indigo absolute"
        style={{
          width: "600px",
          height: "600px",
          top: "-10%",
          left: "-5%",
          opacity
        }}
        animate={{
          x: [0, 50, -30, 50, 0],
          y: [0, -30, 50, 20, 0],
          scale: [1, 1.1, 0.95, 1.05, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Violet orb */}
      <motion.div
        className="aurora-orb aurora-orb-violet absolute"
        style={{
          width: "500px",
          height: "500px",
          top: "20%",
          right: "-10%",
          opacity
        }}
        animate={{
          x: [0, -40, 30, -20, 0],
          y: [0, 40, -30, 40, 0],
          scale: [1, 0.95, 1.1, 0.98, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      {/* Cyan orb */}
      <motion.div
        className="aurora-orb aurora-orb-cyan absolute"
        style={{
          width: "450px",
          height: "450px",
          bottom: "-5%",
          left: "30%",
          opacity
        }}
        animate={{
          x: [0, 30, -50, 20, 0],
          y: [0, -20, 30, -40, 0],
          scale: [1, 1.05, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080B14]/50 to-[#080B14]" />
    </div>
  )
}
