"use client"

import { useState, useId, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Option {
  value: string
  label: string
}

interface FloatingSelectProps {
  label: string
  options: Option[]
  value: string
  onChange: (value: string) => void
  error?: string
  icon?: React.ReactNode
  className?: string
  disabled?: boolean
}

export function FloatingSelect({
  label,
  options,
  value,
  onChange,
  error,
  icon,
  className = "",
  disabled = false,
}: FloatingSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const id = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const hasValue = value.length > 0
  const isActive = isFocused || hasValue || isOpen

  const selectedOption = options.find((opt) => opt.value === value)

  // Portals can only render on the client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Recalculate the dropdown's position (relative to the viewport) whenever it opens,
  // and keep it pinned to the trigger on scroll/resize while open.
  useEffect(() => {
    if (!isOpen || !wrapperRef.current) return

    const updatePosition = () => {
      const rect = wrapperRef.current!.getBoundingClientRect()
      setCoords({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      })
    }

    updatePosition()
    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)
    return () => {
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
    }
  }, [isOpen])

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
            {icon}
          </div>
        )}
        <motion.button
          id={id}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            setTimeout(() => setIsOpen(false), 200)
          }}
          disabled={disabled}
          className={cn(
            "w-full px-4 py-4 pt-6 rounded-xl glass-input text-white transition-all duration-300 text-left",
            "focus:outline-none input-glow flex items-center justify-between",
            icon && "pl-12",
            error && "border-red-500 focus:border-red-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className={!hasValue ? "text-transparent" : ""}>
            {selectedOption?.label || "Select..."}
          </span>
          <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.span>
        </motion.button>
        <motion.label
          htmlFor={id}
          className={cn(
            "absolute left-4 transition-all duration-300 pointer-events-none text-muted-foreground",
            icon && "left-12",
            isActive ? "top-2 text-xs text-[#1B4FBB]" : "top-1/2 -translate-y-1/2 text-base"
          )}
        >
          {label}
        </motion.label>
      </div>

      {/* Dropdown list is portaled to document.body so it escapes any parent's
          stacking context (e.g. the step-content wrapper) and is guaranteed to
          render above everything else on the page, including the Previous/Next
          buttons. Positioned manually using the trigger's on-screen coordinates. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "fixed",
                  top: coords.top,
                  left: coords.left,
                  width: coords.width,
                }}
                className="z-[9999] max-h-64 overflow-y-auto bg-slate-900 rounded-xl shadow-2xl border border-white/10"
              >
                {options.map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setIsOpen(false)
                    }}
                    className={cn(
                      "w-full px-4 py-3 text-left text-white transition-all duration-200 hover:bg-white/10",
                      option.value === value && "bg-[#1B4FBB]/20 text-[#6366F1]"
                    )}
                    whileHover={{ x: 4 }}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

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