"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Send, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeedbackPopoverProps {
  open: boolean
  type: "up" | "down" | null
  value: string
  onChange: (value: string) => void
  onClose: () => void
  onSubmit: () => void
  submitted: boolean
  /** Which side the popover should open toward, relative to the anchor. */
  align?: "left" | "right"
}

const MAX_LENGTH = 500

export function FeedbackPopover({
  open,
  type,
  value,
  onChange,
  onClose,
  onSubmit,
  submitted,
  align = "right"
}: FeedbackPopoverProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isPositive = type === "up"

  // Click outside to close
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open, onClose])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  return (
    <div className="relative">
      <AnimatePresence>
        {open && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={cn(
              "absolute top-full mt-3 z-50 w-[340px]",
              align === "right" ? "right-0" : "left-0"
            )}
            role="dialog"
            aria-label="Share feedback"
          >
            {/* Arrow */}
            <div
              className={cn(
                "absolute -top-1.5 w-3 h-3 rotate-45",
                "bg-[#10131F] border-l border-t border-white/10",
                align === "right" ? "right-6" : "left-6"
              )}
            />

            <div
              className={cn(
                "relative rounded-2xl border border-white/10 bg-[#10131F]",
                "shadow-[0_20px_60px_rgba(0,0,0,0.55)] overflow-hidden"
              )}
            >
              {/* Ambient accent glow */}
              <div
                className={cn(
                  "absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none",
                  isPositive ? "bg-[#10B981]" : "bg-red-500"
                )}
              />

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative px-5 py-6"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5, delay: 0.05 }}
                        className="w-9 h-9 rounded-full bg-[#10B981]/15 flex items-center justify-center shrink-0"
                      >
                        <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                      </motion.div>
                      <p className="text-white text-sm font-medium">Thanks for your feedback!</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 pt-4 pb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isPositive ? "bg-[#10B981]" : "bg-red-400"
                          )}
                        />
                        <p className="text-sm font-medium text-white">
                          {isPositive ? "What worked well?" : "What could be better?"}
                        </p>
                      </div>
                      <button
                        onClick={onClose}
                        aria-label="Close"
                        className="p-1 rounded-md text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="px-4 pb-4">
                      <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value.slice(0, MAX_LENGTH))}
                        placeholder={
                          isPositive
                            ? "Optional — tell us what stood out..."
                            : "Optional — help us understand what went wrong..."
                        }
                        rows={4}
                        autoFocus
                        className={cn(
                          "w-full px-3 py-2.5 rounded-lg glass-input text-white text-sm leading-relaxed",
                          "placeholder:text-muted-foreground/50 resize-none transition-all duration-300",
                          "focus:outline-none input-glow"
                        )}
                      />
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-[10px] text-muted-foreground/50">
                          {value.length}/{MAX_LENGTH}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={onSubmit}
                          className={cn(
                            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white",
                            "bg-gradient-to-r from-[#1B4FBB] to-[#6366F1]",
                            "hover:shadow-[0_0_16px_rgba(27,79,187,0.4)] transition-shadow"
                          )}
                        >
                          Submit
                          <Send className="w-3 h-3" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}