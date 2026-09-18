"use client"

import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, AlertTriangle, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { User, CreditCard, Building2, AlertCircle, Wallet } from "lucide-react"
import { stepDefs } from "../form"


const stepIcons: Record<number, LucideIcon> = {
  1: User,
  2: CreditCard,
  3: Building2,
  4: AlertCircle,
  5: Wallet,
}

interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-[#1B4FBB] to-[#6366F1]"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep - 1) / (stepDefs.length - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {stepDefs.map((step) => {
          const Icon = stepIcons[step.id]
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentStep > step.id
                    ? "bg-[#10B981]"
                    : currentStep === step.id
                    ? "bg-gradient-to-br from-[#1B4FBB] to-[#6366F1] shadow-[0_0_20px_rgba(27,79,187,0.4)]"
                    : "bg-white/10"
                }`}
                whileHover={{ scale: 1.1 }}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <Icon className={`w-5 h-5 ${currentStep === step.id ? "text-white" : "text-muted-foreground"}`} />
                )}
              </motion.div>
              <span className={`mt-2 text-xs font-medium ${
                currentStep >= step.id ? "text-white" : "text-muted-foreground"
              }`}>
                {step.title}
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}


interface ValidationMessageProps {
  message: string | null
  onDismiss?: () => void
}

export function ValidationMessage({ message, onDismiss }: ValidationMessageProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: 1,
            height: "auto",
            x: [0, -6, 6, -4, 4, 0],
          }}
          exit={{ opacity: 0, height: 0 }}
          transition={{
            height: { duration: 0.25 },
            opacity: { duration: 0.25 },
            x: { duration: 0.4, ease: "easeOut" },
          }}
          className="mt-6 relative z-10 overflow-hidden"
        >
          <div className="relative flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/[0.07] pl-4 pr-3 py-3.5">

            <span className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-red-400/70" />

            <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-500/15">
              <AlertTriangle className="h-3.5 w-3.5 text-red-300" />
            </span>

            <div className="flex-1 pt-0.5">
              <p className="text-xs font-medium uppercase tracking-wide text-red-300/70 mb-0.5">
                Check this before continuing
              </p>
              <p className="text-sm text-red-200 leading-relaxed">{message}</p>
            </div>

            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss"
                className="mt-0.5 flex-shrink-0 rounded-md p-1 text-red-300/60 hover:text-red-200 hover:bg-red-500/10 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}