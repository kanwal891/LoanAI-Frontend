"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SegmentedToggleProps {
  options: Array<{
    value: string
    label: string
    icon?: React.ReactNode
    description?: string
  }>
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SegmentedToggle({
  options,
  value,
  onChange,
  className = ""
}: SegmentedToggleProps) {
  return (
    <div className={cn("flex gap-4", className)}>
      {options.map((option) => (
        <motion.button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex-1 relative p-4 rounded-xl glass-card transition-all duration-300",
            "border-2",
            value === option.value 
              ? "border-[#1B4FBB] shadow-[0_0_20px_rgba(27,79,187,0.3)]" 
              : "border-transparent hover:border-white/20"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {value === option.value && (
            <motion.div
              layoutId="segmented-active"
              className="absolute inset-0 bg-[#1B4FBB]/10 rounded-xl"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <div className="relative z-10 flex flex-col items-center gap-2">
            {option.icon && (
              <div className={cn(
                "text-2xl",
                value === option.value ? "text-[#1B4FBB]" : "text-muted-foreground"
              )}>
                {option.icon}
              </div>
            )}
            <span className={cn(
              "font-medium",
              value === option.value ? "text-white" : "text-muted-foreground"
            )}>
              {option.label}
            </span>
            {option.description && (
              <span className="text-xs text-muted-foreground">
                {option.description}
              </span>
            )}
          </div>
          {value === option.value && (
            <motion.div
              className="absolute top-2 right-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <div className="w-2 h-2 rounded-full bg-[#1B4FBB]" />
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  )
}
