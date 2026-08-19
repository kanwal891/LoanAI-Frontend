"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ArrowLeft, Sparkles, Loader2 } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { GlassSidebar } from "@/components/glass-sidebar"
import { MagneticButton } from "@/components/magnetic-button"

import {
  evaluateLoanApplication,
  updateApplication,
  getApplication,
  ApiError,
  type LoanApplicationRequest,
} from "@/lib/userAPI"

import {
  initialApplyFormState,
  type ApplyFormState,
  type ExistingLoan,
  emptyExistingLoan,
  stepDefs,
  buildPayload,
  validateStep,
  validateBeforeSubmit,
  EXISTING_LOAN_TYPE_MAP,
  EXPECTED_LOAN_TYPE_MAP,
  COMPANY_TYPE_MAP,
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

const EDIT_PAYLOAD_KEY = "eligibilityEditPayload"
const EDIT_APPLICATION_ID_KEY = "eligibilityEditApplicationId"

function invertMap<T extends string>(map: Record<string, T>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [feValue, apiValue] of Object.entries(map)) {
    out[apiValue] = feValue
  }
  return out
}

const EXISTING_LOAN_TYPE_MAP_REVERSE = invertMap(EXISTING_LOAN_TYPE_MAP)
const EXPECTED_LOAN_TYPE_MAP_REVERSE = invertMap(EXPECTED_LOAN_TYPE_MAP)
const COMPANY_TYPE_MAP_REVERSE = invertMap(COMPANY_TYPE_MAP)

function numToStr(value: number | null | undefined): string {
  return value == null ? "" : String(value)
}

function boolToYesNo(value: boolean | null | undefined): string {
  return value ? "yes" : "no"
}

function payloadToFormState(payload: LoanApplicationRequest): ApplyFormState {
  const isBT = payload.case_type === "balance_transfer"

  const existingLoans: ExistingLoan[] = (payload.existing_loans || []).map((loan, idx) => ({
    id: String(idx + 1),
    type: EXISTING_LOAN_TYPE_MAP_REVERSE[loan.loan_type] || "personal-loan",
    amount: numToStr(loan.loan_amount_outstanding),
    bankName: loan.current_bank_name || "",
    interestRate: numToStr(loan.current_interest_rate),
    startDate: loan.loan_disbursement_date || "",
    principalOutstanding: numToStr(loan.principal_outstanding),
    foreclosureAvailable: boolToYesNo(loan.foreclosure_available),
    currentEMI: numToStr(loan.current_emi),
    emiBounce: boolToYesNo(loan.any_emi_bounce),
  }))

  return {
    name: payload.personal?.full_name || "",
    age: numToStr(payload.personal?.age),
    pincode: payload.personal?.pincode || "",
    caseType: isBT ? "bt" : "fresh",

    existingLoans: existingLoans.length > 0 ? existingLoans : [emptyExistingLoan("1")],

    expectedLoanType: EXPECTED_LOAN_TYPE_MAP_REVERSE[payload.loan_requirements?.expected_loan_type || ""] || "",
    expectedInterestRate: numToStr(payload.loan_requirements?.expected_interest_rate),
    expectedEMI: numToStr(payload.loan_requirements?.expected_emi),
    expectedPrincipal: numToStr(payload.loan_requirements?.principal_amount_required),

    companyType: COMPANY_TYPE_MAP_REVERSE[payload.employment?.company_type || ""] || "",
    companyAge: numToStr(payload.employment?.company_age_years),
    salaryCreditType: payload.employment?.salary_credit_type || "",

    cibilScore: numToStr(payload.credit_history?.cibil_score),
    enquiries: numToStr(payload.credit_history?.enquiries_last_3_months),
    bounceLatest: boolToYesNo(payload.credit_history?.bounce_latest_month),
    overduePending: boolToYesNo(payload.credit_history?.any_overdue_pending),
    pastDelayed: boolToYesNo(payload.credit_history?.past_delayed_payments),
    settlementWriteOff: boolToYesNo(payload.credit_history?.settlement_writeoff_suit_filed),
    settlementDate: payload.credit_history?.settlement_writeoff_date || "",

    fixedSalary: numToStr(payload.salary_banking?.fixed_salary_component),
    incentive: numToStr(payload.salary_banking?.incentive_variable_pay),
    incentiveFrequency: payload.salary_banking?.incentive_frequency || "monthly",
    pfDeducted: boolToYesNo(payload.salary_banking?.pf_deducted),
    tdsDeducted: boolToYesNo(payload.salary_banking?.tds_deducted),
    officialMailAvailable: boolToYesNo(payload.salary_banking?.official_mail_available),
    homeLoanHistory: boolToYesNo(payload.salary_banking?.home_loan_history_or_running),
  }
}

function ApplyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(0)
  const [form, setForm] = useState<ApplyFormState>(initialApplyFormState)
  const [stepError, setStepError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [editingApplicationId, setEditingApplicationId] = useState<number | null>(null)

  useEffect(() => {
    const editIdFromUrl = searchParams.get("edit")
    const rawPayload = sessionStorage.getItem(EDIT_PAYLOAD_KEY)
    const rawStoredId = sessionStorage.getItem(EDIT_APPLICATION_ID_KEY)

    async function loadData() {
      setIsLoadingData(true)
      try {
        // Prefer the id in the URL; fall back to the one stashed in sessionStorage
        // (e.g. when navigation to /apply happened without a query param).
        const resolvedEditId = editIdFromUrl ?? rawStoredId

        // 1. Fast path: full payload already in sessionStorage (e.g. "Edit" clicked
        //    from the dashboard/applications list, payload passed in-memory).
        if (rawPayload) {
          const parsedPayload = JSON.parse(rawPayload) as LoanApplicationRequest
          setForm(payloadToFormState(parsedPayload))
          if (resolvedEditId) setEditingApplicationId(Number(resolvedEditId))
          sessionStorage.removeItem(EDIT_PAYLOAD_KEY)
          sessionStorage.removeItem(EDIT_APPLICATION_ID_KEY)
          return
        }

        // 2. Fallback: fetch from the backend (e.g. direct link or page refresh
        //    with ?edit=<id> and no sessionStorage payload available).
        if (resolvedEditId) {
          const id = Number(resolvedEditId)
          setEditingApplicationId(id)
          if (typeof getApplication === "function") {
            const apiData = await getApplication(id)
            // NOTE: getApplication() returns a SavedApplicationDetail wrapper —
            // the actual LoanApplicationRequest-shaped form data lives in
            // apiData.payload, not on apiData itself.
            if (apiData?.payload) {
              setForm(payloadToFormState(apiData.payload as LoanApplicationRequest))
            }
          }
        }
      } catch (err) {
        console.error("Failed to load application data for edit:", err)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [searchParams])

  const update = <K extends keyof ApplyFormState>(field: K, value: ApplyFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setStepError(null)
  }

  const handleNext = () => {
    const error = validateStep(currentStep + 1, form)
    if (error) {
      setStepError(error)
      return
    }

    setStepError(null)
    if (currentStep < stepDefs.length - 1) {
      setDirection(1)
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    setStepError(null)
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    const error = validateBeforeSubmit(form)
    if (error) {
      setStepError(error)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const payload = buildPayload(form)
      let response

      if (editingApplicationId != null) {
        response = await updateApplication(editingApplicationId, payload)
      } else {
        response = await evaluateLoanApplication(payload)
      }

      sessionStorage.setItem("eligibilityResult", JSON.stringify(response))
      router.push("/results")
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message)
      } else {
        setSubmitError("An error occurred while evaluating your application. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepComponent = () => {
    switch (currentStep) {
      case 0:
        return <PersonalDetailsStep form={form} update={update} />
      case 1:
        return <LoanDetailsStep form={form} update={update} />
      case 2:
        return <CompanyDetailsStep form={form} update={update} />
      case 3:
        return <CreditHistoryStep form={form} update={update} />
      case 4:
        return <SalaryBankingStep form={form} update={update} />
      default:
        return null
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full text-white py-8">
      <GlassSidebar role="applicant" />
      <div className="max-w-7xl mx-auto px-4 relative z-10 ml-67">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 p-2 -ml-2 rounded-xl glass hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          {editingApplicationId && (
            <span className="text-xs px-3 py-1 rounded-full bg-[#1B4FBB]/20 border border-[#1B4FBB]/50 text-[#6366F1]">
              Editing Application #{editingApplicationId}
            </span>
          )}
        </div>

        <StepIndicator currentStep={currentStep + 1} />

        <GlassCard className="p-6 md:p-10 relative overflow-hidden" glow>
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <h2 className="text-2xl font-bold text-white mb-1">
                {stepDefs[currentStep].title}
              </h2>

              <div className="mt-6">
                {renderStepComponent()}
              </div>

              {stepError && (
                <div className="mt-6">
                  <ValidationMessage message={stepError} />
                </div>
              )}

              {submitError && (
                <div className="mt-6">
                  <ValidationMessage message={submitError} />
                </div>
              )}

              <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 0 || isSubmitting}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>

                {currentStep === stepDefs.length - 1 ? (
                  <MagneticButton
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        {editingApplicationId ? "Update Application" : "Check Eligibility"}
                        <Sparkles className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </MagneticButton>
                ) : (
                  <MagneticButton variant="primary" onClick={handleNext}>
                    Next Step
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </MagneticButton>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  )
}

export default function ApplyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin" />
        </div>
      }
    >
      <ApplyContent />
    </Suspense>
  )
}