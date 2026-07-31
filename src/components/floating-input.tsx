"use client"

import { useState, useId } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface FloatingInputProps {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  icon?: React.ReactNode
  className?: string
  prefix?: string
  disabled?: boolean
}

// Native inputs that render their own browser-controlled placeholder
// (e.g. "dd-mm-yyyy" for date) which can't be hidden via the placeholder
// prop. For these, the floating label must always stay in the "floated"
// position — there's no visually "empty" state to float down into.
const ALWAYS_FLOATED_TYPES = ["date", "time", "datetime-local", "month", "week"]

export function FloatingInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  icon,
  className = "",
  prefix,
  disabled = false
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const id = useId()
  const hasValue = value.length > 0
  const isDateLikeType = ALWAYS_FLOATED_TYPES.includes(type)
  const isActive = isFocused || hasValue || isDateLikeType

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
            {icon}
          </div>
        )}
        {prefix && isActive && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {prefix}
          </span>
        )}
        <motion.input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isActive && !isDateLikeType ? placeholder : ""}
          disabled={disabled}
          className={cn(
            "w-full px-4 py-4 pt-6 rounded-xl glass-input text-white transition-all duration-300",
            "focus:outline-none input-glow",
            icon && "pl-12",
            prefix && isActive && "pl-8",
            error && "border-red-500 focus:border-red-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          animate={error ? { x: [-4, 4, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
        />
        <motion.label
          htmlFor={id}
          className={cn(
            "absolute left-4 transition-all duration-300 pointer-events-none text-muted-foreground",
            icon && "left-12",
            isActive 
              ? "top-2 text-xs text-[#1B4FBB]" 
              : "top-1/2 -translate-y-1/2 text-base"
          )}
        >
          {label}
        </motion.label>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-400 text-sm mt-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}