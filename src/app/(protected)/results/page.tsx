"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Sparkles, 
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  FileWarning,
  ArrowLeft,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { GlassNavbar } from "@/components/glass-navbar"
import { AuroraBackground } from "@/components/aurora-background"
import { GlassCard } from "@/components/glass-card"
import { MagneticButton } from "@/components/magnetic-button"
import { AnimatedCounter } from "@/components/animated-counter"
import { CircularProgress } from "@/components/circular-progress"
import { FeedbackPopover } from "@/components/feedback-popover"

// -----------------------------------------------------------------------
// Eligibility API — adjust the import path below if userAPI.ts lives
// somewhere else in your project.
// -----------------------------------------------------------------------
import {
  isBalanceTransferResponse,
  getApplication,
  ApiError,
  type FreshLoanResponse,
  type BalanceTransferResponse,
  type BankRecommendation,
} from "@/lib/userAPI"

type FeedbackValue = "up" | "down" | null

// sessionStorage keys shared with /apply for the "Update Application" flow
const EDIT_PAYLOAD_KEY = "eligibilityEditPayload"
const EDIT_APPLICATION_ID_KEY = "eligibilityEditApplicationId"

/** Format a rupee amount as "₹XX L" / "₹X.XX Cr", matching the design's shorthand style. */
function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`
  return `₹${amount.toLocaleString("en-IN")}`
}

/**
 * Interest rate display helper — prefers the backend's pre-formatted range
 * string (e.g. "10.25% - 12.99%") since some policies quote a range rather
 * than a flat rate. Falls back to the single number, then to an em dash.
 */
function formatInterestRate(
  display?: string | null,
  flat?: number | null
): string {
  if (display) return display
  if (flat != null) return `${flat}%`
  return "—"
}

function formatDerivedLabel(key: string): string {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function formatDerivedValue(value: unknown): string {
  if (value == null) return "—"
  if (typeof value === "number") {
    return Number.isInteger(value) ? value.toLocaleString("en-IN") : value.toFixed(2)
  }
  if (typeof value === "boolean") return value ? "Yes" : "No"
  return String(value)
}

export default function ResultsPage() {
  const router = useRouter()
  const [selectedBank, setSelectedBank] = useState<number | null>(null)
  const [result, setResult] = useState<FreshLoanResponse | BalanceTransferResponse | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  const [feedback, setFeedback] = useState<FeedbackValue>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  // "Update Application" — fetching the saved payload before navigating to /apply
  const [isPreparingEdit, setIsPreparingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("eligibilityResult")
      if (raw) setResult(JSON.parse(raw))
    } catch {
      setResult(null)
    } finally {
      setHasLoaded(true)
    }
  }, [])

  const recommendations: BankRecommendation[] = result?.recommendations ?? []
  const isBT = result ? isBalanceTransferResponse(result) : false

  const topRecommendation = useMemo(
    () => recommendations.find((r) => r.is_top_recommendation) ?? recommendations[0] ?? null,
    [recommendations]
  )

  // "Best rate" is still picked by the numeric low-end (interest_rate), but
  // displayed using that bank's own range string so it doesn't mismatch
  // what's shown on its card.
  const bestRateRecommendation = useMemo(() => {
    const withRates = recommendations.filter((r) => r.interest_rate != null)
    if (withRates.length === 0) return null
    return withRates.reduce((best, r) =>
      (r.interest_rate as number) < (best.interest_rate as number) ? r : best
    )
  }, [recommendations])

  const maxEligibleAmount = useMemo(() => {
    const amounts = recommendations
      .map((r) => r.max_amount)
      .filter((a): a is number => a != null)
    return amounts.length ? Math.max(...amounts) : null
  }, [recommendations])

  // Average across banks. Prefers each bank's range midpoint (min+max)/2
  // when interest_rate_min/max are available, since interest_rate alone is
  // just the low end of the range and understates the true average.
  const avgInterestRate = useMemo(() => {
    const rates = recommendations
      .map((r) => {
        if (r.interest_rate_min != null && r.interest_rate_max != null) {
          return (r.interest_rate_min + r.interest_rate_max) / 2
        }
        return r.interest_rate ?? null
      })
      .filter((r): r is number => r != null)
    if (!rates.length) return null
    return rates.reduce((sum, r) => sum + r, 0) / rates.length
  }, [recommendations])

  const eligibilityScore = topRecommendation?.match_percent ?? 0
  const banksEvaluated = result?.banks_evaluated ?? 0
  const eligibleCount = recommendations.length

  // Simple full-detail lookup (foir_percent / foir_source live on both
  // FreshLoanBankResult and BalanceTransferBankResult).
  const foirResult = useMemo(() => {
    const results = (result?.results ?? []) as Array<{
      eligible: boolean
      foir_percent?: number | null
      foir_source?: string | null
    }>
    return results.find((r) => r.eligible && r.foir_percent != null) ?? results[0] ?? null
  }, [result])

  const derived = isBT ? (result as BalanceTransferResponse).derived ?? {} : null

  const handleFeedback = (value: "up" | "down") => {
    setFeedback(value)
    setFeedbackSubmitted(false)
    setFeedbackText("")
    setPopoverOpen(true)
  }

  const handleClosePopover = () => {
    setPopoverOpen(false)
    setTimeout(() => {
      setFeedback(null)
      setFeedbackText("")
      setFeedbackSubmitted(false)
    }, 200)
  }

  const handleSubmitFeedback = () => {
    // TODO: wire up to your feedback API / handler
    // await submitFeedback({ rating: feedback, comment: feedbackText })
    setFeedbackSubmitted(true)
    setTimeout(() => {
      handleClosePopover()
    }, 1400)
  }

  /**
   * "Update Application" — fetches the full saved application (its original
   * form payload) from the backend, stashes it in sessionStorage for /apply
   * to pick up on mount, then navigates there. If there's no application_id
   * (e.g. the low-level calc was used, or the row failed to save), falls
   * back to a blank /apply.
   */
  const handleUpdateApplication = async () => {
  setEditError(null)

  if (result?.application_id == null) {
    router.push("/apply")
    return
  }

  setIsPreparingEdit(true)
  try {
    const detail = await getApplication(result.application_id)
    sessionStorage.setItem(EDIT_PAYLOAD_KEY, JSON.stringify(detail.payload))
    sessionStorage.setItem(EDIT_APPLICATION_ID_KEY, String(detail.id))
    // `t` makes the URL unique per click, so Next.js's router cache can't
    // serve back a stale /apply instance whose mount effect already ran.
    router.push(`/apply?edit=${detail.id}&t=${Date.now()}`)
  } catch (err) {
    if (err instanceof ApiError) {
      setEditError(err.message)
    } else {
      setEditError("Couldn't load your saved application. Please try again.")
    }
  } finally {
    setIsPreparingEdit(false)
  }
}

  // -----------------------------------------------------------------------
  // No data yet (direct nav to /results, or sessionStorage cleared)
  // -----------------------------------------------------------------------
  if (hasLoaded && !result) {
    return (
      <main className="min-h-screen bg-[#080B14]">
        <GlassNavbar variant="dashboard" />
        <div className="pt-32 pb-12">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <GlassCard className="p-10" glow>
              <FileWarning className="w-10 h-10 text-[#FF6B35] mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">No Results Yet</h1>
              <p className="text-muted-foreground mb-6">
                We couldn't find a recent eligibility check. Please complete the application form first.
              </p>
              <Link href="/apply">
                <MagneticButton variant="primary">
                  Start Application
                  <ArrowRight className="w-4 h-4" />
                </MagneticButton>
              </Link>
            </GlassCard>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#080B14]">
      <GlassNavbar variant="dashboard" />
      
      {/* pt-28 (was pt-20) gives extra clearance below the fixed navbar so the
          Back button row below doesn't sit underneath it. */}
      <div className="pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Back button lives in its own row with relative z-20, kept fully
              separate from the hero section's AuroraBackground (which is
              absolutely positioned within its own "relative" section below)
              so the two never overlap. */}
          <div className="relative z-20 mb-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 p-2 -ml-2 rounded-xl glass hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back</span>
            </button>
          </div>

          {/* Hero Section */}
          <section className="relative py-12 mb-8">
            <AuroraBackground intensity="medium" />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
              >
                <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                <span className="text-[#10B981] font-medium">Analysis Complete</span>
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
                Your AI Loan <span className="gradient-text-primary">Recommendations</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-2">
                {eligibleCount > 0
                  ? `Based on your profile, here are your personalized loan options ranked by approval probability`
                  : `Based on your profile, no banks currently match your eligibility criteria`}
              </p>
              {result?.application_id != null && (
                <p className="text-xs text-muted-foreground mb-8">
                  Application #{result.application_id} saved
                </p>
              )}

              {/* Main Score Card — equal-width, equal-height, same internal alignment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto items-stretch">
                <GlassCard className="p-6 h-full flex items-center" glow>
                  <div className="flex items-center gap-6">
                    <CircularProgress 
                      value={eligibilityScore} 
                      size={100} 
                      color="success"
                      label="Eligible"
                    />
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground mb-1">Top Match Score</p>
                      <p className="text-3xl font-bold text-white">{eligibilityScore}%</p>
                      <p className="text-xs text-[#10B981]">
                        {eligibleCount > 0 ? `${eligibleCount} of ${banksEvaluated} banks` : "No matches found"}
                      </p>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6 h-full flex items-center" glow>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground mb-1">Maximum Eligible Amount</p>
                    <p className="text-3xl font-bold text-white">
                      {maxEligibleAmount != null ? (
                        formatINR(maxEligibleAmount)
                      ) : (
                        "—"
                      )}
                    </p>
                    <p className="text-xs text-[#6366F1]">
                      {eligibleCount > 0 ? `Across ${eligibleCount} bank${eligibleCount > 1 ? "s" : ""}` : ""}
                    </p>
                  </div>
                </GlassCard>

                <GlassCard className="p-6 h-full flex items-center" glow>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground mb-1">Best Interest Rate</p>
                    {bestRateRecommendation?.interest_rate_display ? (
                      // Range string doesn't fit AnimatedCounter (it animates a
                      // single number), so render it as static text instead.
                      // Smaller size than the single-number case below, since
                      // "10.25% - 12.99%" is ~2.5x longer than "10.25%" and
                      // wraps awkwardly at text-3xl.
                      <p className="text-xl md:text-2xl font-bold text-white leading-tight whitespace-nowrap">
                        {bestRateRecommendation.interest_rate_display}
                      </p>
                    ) : bestRateRecommendation?.interest_rate != null ? (
                      <p className="text-3xl font-bold text-white">
                        <AnimatedCounter value={bestRateRecommendation.interest_rate} suffix="%" decimals={2} />
                      </p>
                    ) : (
                      <p className="text-3xl font-bold text-white">—</p>
                    )}
                    <p className="text-xs text-[#FF6B35]">{bestRateRecommendation?.bank_name ?? ""}</p>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          </section>

          {/* Recommendations Grid */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recommended Banks</h2>

              {/* AI Response Feedback — anchor for the popover */}
              <div className="relative flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleFeedback("up")}
                    aria-pressed={feedback === "up"}
                    aria-label="Good response"
                    className={`p-2 rounded-lg transition-colors ${
                      feedback === "up"
                        ? "bg-[#10B981]/20 text-[#10B981]"
                        : "text-muted-foreground hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <ThumbsUp className={`w-5 h-5 ${feedback === "up" ? "fill-current" : ""}`} />
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleFeedback("down")}
                    aria-pressed={feedback === "down"}
                    aria-label="Bad response"
                    className={`p-2 rounded-lg transition-colors ${
                      feedback === "down"
                        ? "bg-red-500/20 text-red-400"
                        : "text-muted-foreground hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <ThumbsDown className={`w-5 h-5 ${feedback === "down" ? "fill-current" : ""}`} />
                  </motion.button>
                </div>

                <FeedbackPopover
                  open={popoverOpen}
                  type={feedback}
                  value={feedbackText}
                  onChange={setFeedbackText}
                  onClose={handleClosePopover}
                  onSubmit={handleSubmitFeedback}
                  submitted={feedbackSubmitted}
                  align="right"
                />
              </div>
            </div>

            {recommendations.length === 0 ? (
              <GlassCard className="p-8 text-center" glow>
                <p className="text-muted-foreground">
                  No banks matched your current profile. Try adjusting your loan amount or check back after
                  improving your eligibility factors.
                </p>
              </GlassCard>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6 items-stretch">
                {recommendations.map((bank, index) => (
                  <motion.div
                    key={bank.bank_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="h-full"
                  >
                    <GlassCard 
                      className={`p-6 h-full flex flex-col cursor-pointer ${selectedBank === bank.bank_id ? "border-[#1B4FBB] shadow-[0_0_30px_rgba(27,79,187,0.3)]" : ""}`}
                      onClick={() => setSelectedBank(bank.bank_id)}
                      glow
                    >
                      {/* Reserved badge slot — same height whether or not a badge is shown,
                          so every card starts its content at the same vertical position. */}
                      <div className="mb-4 h-7">
                        {bank.is_top_recommendation && (
                          <div className="inline-flex px-3 py-1 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FF8F6B] text-xs font-medium text-white">
                            Top Recommendation
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-start gap-4 flex-1">
                        {/* Bank Logo */}
                        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#1B4FBB] to-[#6366F1] flex items-center justify-center text-2xl font-bold text-white shrink-0">
                          {bank.bank_initial}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col h-full">
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-white text-lg truncate">{bank.bank_name}</h3>
                              <p className="text-xs text-[#FF6B35] truncate">{bank.usp_tagline}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-2xl font-bold text-[#10B981]">{bank.match_percent}%</div>
                              <p className="text-xs text-muted-foreground">Match</p>
                            </div>
                          </div>

                          {/* Key Metrics — 2x2 grid. min-h reserves consistent height per
                              cell so a 2-line range (e.g. "10.25% - 12.99%") doesn't throw
                              off alignment with the single-line cells next to it. */}
                          <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-4 border-y border-white/10 my-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Interest</p>
                              <p className="text-sm font-semibold text-white leading-snug min-h-[2.5rem] flex items-center">
                                {formatInterestRate(bank.interest_rate_display, bank.interest_rate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Max Amount</p>
                              <p className="text-sm font-semibold text-white leading-snug min-h-[2.5rem] flex items-center">
                                {bank.max_amount_display ??
                                  (bank.max_amount != null ? formatINR(bank.max_amount) : "—")}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Tenure</p>
                              <p className="text-sm font-semibold text-white">
                                {bank.tenure_months != null ? `${bank.tenure_months} mo` : "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">EMI</p>
                              <p className="text-sm font-semibold text-white">
                                {bank.monthly_emi != null ? `₹${Math.round(bank.monthly_emi).toLocaleString("en-IN")}` : "—"}
                              </p>
                            </div>
                          </div>

                          {/* BT-only: principal being transferred + fresh top-up */}
                          {isBT && (bank.bt_principal_total != null || bank.fresh_loan_topup != null) && (
                            <div className="grid grid-cols-2 gap-4 pb-4 -mt-2">
                              {bank.bt_principal_total != null && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">BT Principal</p>
                                  <p className="text-sm font-semibold text-white">{formatINR(bank.bt_principal_total)}</p>
                                </div>
                              )}
                              {bank.fresh_loan_topup != null && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Top-up Available</p>
                                  <p className="text-sm font-semibold text-white">{formatINR(bank.fresh_loan_topup)}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Features — fixed 2-row wrap height so 3-feature and 2-feature
                              cards still take up the same vertical space */}
                          <div className="flex flex-wrap gap-2 mb-4 min-h-14 content-start">
                            {bank.feature_tags.map((feature) => (
                              <span
                                key={feature}
                                className="px-2 py-1 rounded-full bg-white/5 text-xs text-muted-foreground h-fit"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>

                          {/* Spacer pushes the button to the bottom of every card,
                              regardless of how much content sits above it */}
                          <div className="flex-1" />

                          {/* Action */}
                          <MagneticButton variant="primary" size="sm" className="w-full">
                            Apply Now
                            <ArrowRight className="w-4 h-4" />
                          </MagneticButton>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Application Insights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Application Insights</h2>
            <div className="grid md:grid-cols-4 gap-4 items-stretch">
              <GlassCard className="p-4 h-full" glow>
                <p className="text-xs text-muted-foreground mb-2">Case Type</p>
                <p className="text-lg font-semibold text-white">
                  {isBT ? "Balance Transfer" : "Fresh Loan"}
                </p>
              </GlassCard>
              <GlassCard className="p-4 h-full" glow>
                <p className="text-xs text-muted-foreground mb-2">Banks Evaluated</p>
                <p className="text-lg font-semibold" style={{ color: "#6366F1" }}>
                  {banksEvaluated}
                </p>
              </GlassCard>
              <GlassCard className="p-4 h-full" glow>
                <p className="text-xs text-muted-foreground mb-2">Eligible Banks</p>
                <p className="text-lg font-semibold" style={{ color: "#10B981" }}>
                  {eligibleCount}
                </p>
              </GlassCard>
              <GlassCard className="p-4 h-full" glow>
                <p className="text-xs text-muted-foreground mb-2">Avg. Interest Rate</p>
                <p className="text-lg font-semibold" style={{ color: "#06B6D4" }}>
                  {avgInterestRate != null ? `${avgInterestRate.toFixed(2)}%` : "—"}
                </p>
              </GlassCard>
            </div>
          </section>

          {/* Balance Transfer derived details */}
          {isBT && derived && Object.keys(derived).length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">Balance Transfer Summary</h2>
              <GlassCard className="p-6" glow>
                <div className="grid md:grid-cols-3 gap-6">
                  {Object.entries(derived).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs text-muted-foreground mb-1">{formatDerivedLabel(key)}</p>
                      <p className="text-sm font-semibold text-white">{formatDerivedValue(value)}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </section>
          )}

          {/* AI Recommendations */}
          <section>
            <GlassCard className="p-6" glow glowColor="aurora">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-2">AI-Generated Recommendations</h3>

                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {topRecommendation && (
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                        <span>
                          {topRecommendation.bank_name} is your top match at a {topRecommendation.match_percent}%
                          fit
                          {topRecommendation.interest_rate_display
                            ? `, offering ${topRecommendation.interest_rate_display} interest`
                            : topRecommendation.interest_rate != null
                            ? `, offering ${topRecommendation.interest_rate}% interest`
                            : ""}
                          .
                        </span>
                      </li>
                    )}
                    {foirResult?.foir_percent != null && (
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                        <span>
                          Your eligibility was assessed using a FOIR of {foirResult.foir_percent}%
                          {foirResult.foir_source ? ` (${foirResult.foir_source})` : ""}.
                        </span>
                      </li>
                    )}
                    {eligibleCount === 0 && (
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-[#FF6B35] mt-0.5 flex-shrink-0" />
                        <span>
                          No banks currently match your profile — consider revisiting your requested amount or
                          tenure and re-applying.
                        </span>
                      </li>
                    )}
                  </ul>

                  {editError && (
                    <p className="mt-3 text-sm text-red-400">{editError}</p>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Link href="/dashboard">
                      <MagneticButton variant="primary" size="sm">
                        Go to Dashboard
                        <ArrowRight className="w-4 h-4" />
                      </MagneticButton>
                    </Link>
                    <MagneticButton
                      variant="secondary"
                      size="sm"
                      onClick={handleUpdateApplication}
                      disabled={isPreparingEdit}
                    >
                      {isPreparingEdit ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Update Application"
                      )}
                    </MagneticButton>
                  </div>
                </div>
              </div>
            </GlassCard>
          </section>
        </div>
      </div>
    </main>
  )
}