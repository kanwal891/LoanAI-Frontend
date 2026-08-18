"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ArrowLeft, Sparkles, Loader2 } from "lucide-react"
import { AuroraBackground } from "@/components/aurora-background"
import { GlassCard } from "@/components/glass-card"
import { GlassSidebar } from "@/components/glass-sidebar"
import { MagneticButton } from "@/components/magnetic-button"

import { evaluateLoanApplication, isBalanceTransferResponse, ApiError } from "@/lib/userAPI"

import {
  initialApplyFormState,
  type ApplyFormState,
  stepDefs,
  buildPayload,
  validateStep,
  validateBeforeSubmit,
} from "./form"

import { StepIndicator, ValidationMessage } from "./components/formchrome"
import {
  PersonalDetailsStep,
  LoanDetailsStep,
  CompanyDetailsStep,
  CreditHistoryStep,
  SalaryBankingStep,
} from "./components/Validationmessage/Steps"

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
}

const stepComponents = [
  PersonalDetailsStep,
  LoanDetailsStep,
  CompanyDetailsStep,
  CreditHistoryStep,
  SalaryBankingStep,
]

export default function ApplyPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(0)
  const [form, setForm] = useState<ApplyFormState>(initialApplyFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const update = <K extends keyof ApplyFormState>(field: K, value: ApplyFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    const error = validateStep(currentStep, form)
    if (error) {
      setSubmitError(error)
      return
    }
    setSubmitError(null)
    setDirection(1)
    if (currentStep < stepDefs.length) setCurrentStep(currentStep + 1)
  }

  const handlePrev = () => {
    setSubmitError(null)
    setDirection(-1)
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    const validationError = validateBeforeSubmit(form)
    if (validationError) {
      setSubmitError(validationError)
      return
    }

    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const payload = buildPayload(form)
      const result = await evaluateLoanApplication(payload)
      sessionStorage.setItem("eligibilityResult", JSON.stringify(result))
      sessionStorage.setItem(
        "eligibilityResultKind",
        isBalanceTransferResponse(result) ? "balance_transfer" : "fresh_loan"
      )
      if (result.application_id != null) {
        sessionStorage.setItem("eligibilityApplicationId", String(result.application_id))
      }
      router.push("/results")
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message)
      } else {
        setSubmitError("Something went wrong while checking eligibility. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const StepComponent = stepComponents[currentStep - 1]

  return (
    <main className="min-h-screen bg-[#080B14]">
      <GlassSidebar />
      <div className="flex ml-64">
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 flex items-center gap-4"
            >
              <Link
                href="/dashboard"
                className="p-2 rounded-xl glass hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">Personal Loan Application</h1>
                <p className="mt-2 text-muted-foreground">
                  Fill in your details to receive AI-powered loan recommendations.
                </p>
              </div>
            </motion.div>

            <StepIndicator currentStep={currentStep} />

            {/* Form Content */}
            <GlassCard className="p-8 relative overflow-visible" hover={false}>
              <AuroraBackground intensity="low" />

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="relative z-10"
                >
                  <StepComponent form={form} update={update} />
                </motion.div>
              </AnimatePresence>

              <ValidationMessage message={submitError} onDismiss={() => setSubmitError(null)} />

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10 relative z-10">
                <MagneticButton variant="ghost" onClick={handlePrev} disabled={currentStep === 1 || isSubmitting}>
                  <ArrowLeft className="w-5 h-5" />
                  Previous
                </MagneticButton>

                {currentStep === stepDefs.length ? (
                  <MagneticButton variant="accent" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Checking Eligibility...
                      </>
                    ) : (
                      <>
                        Get AI Recommendations
                        <Sparkles className="w-5 h-5" />
                      </>
                    )}
                  </MagneticButton>
                ) : (
                  <MagneticButton variant="primary" onClick={handleNext}>
                    Next Step
                    <ArrowRight className="w-5 h-5" />
                  </MagneticButton>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </main>
  )
}