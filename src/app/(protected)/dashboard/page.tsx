"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { 
  TrendingUp, 
  CreditCard,
  Wallet,
  ChevronRight,
  Sparkles,
  BarChart3,
  Activity,
  FileWarning,
  Inbox,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { GlassSidebar } from "@/components/glass-sidebar"
import { GlassCard } from "@/components/glass-card"
import { MagneticButton } from "@/components/magnetic-button"
import { AnimatedCounter } from "@/components/animated-counter"
import { CircularProgress } from "@/components/circular-progress"
import { SectionLoader } from "@/components/loading"

import {
  listApplications,
  getApplication,
  ApiError,
  type SavedApplicationSummary,
} from "@/lib/userAPI"

function caseTypeLabel(caseType: string): string {
  return caseType === "balance_transfer" ? "Balance Transfer" : "Fresh Loan"
}

function formatDate(value?: string | null): string {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
}

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase()
  if (["approved", "completed", "eligible", "success"].includes(s)) {
    return "bg-[#10B981]/20 text-[#10B981]"
  }
  if (["processing", "pending", "in_review", "review"].includes(s)) {
    return "bg-[#6366F1]/20 text-[#6366F1]"
  }
  if (["rejected", "failed", "ineligible", "declined"].includes(s)) {
    return "bg-[#FF6B35]/20 text-[#FF6B35]"
  }
  return "bg-white/10 text-muted-foreground"
}

function statusLabel(status: string): string {
  if (!status) return "Unknown"
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")
}

function creditStatusLabel(score: number): string {
  if (score >= 750) return "Excellent"
  if (score >= 700) return "Good"
  if (score >= 650) return "Fair"
  if (score > 0) return "Poor"
  return "Unknown"
}

function creditStatusColor(score: number): string {
  if (score >= 750) return "text-[#10B981]"
  if (score >= 700) return "text-[#6366F1]"
  if (score >= 650) return "text-[#FF6B35]"
  return "text-muted-foreground"
}

interface CreditSnapshot {
  cibilScore: number | null
  eligibilityScore: number | null
  updatedAt: string | null
}

export default function DashboardPage() {
  const [applications, setApplications] = useState<SavedApplicationSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [snapshot, setSnapshot] = useState<CreditSnapshot>({
    cibilScore: null,
    eligibilityScore: null,
    updatedAt: null,
  })
  const [snapshotLoading, setSnapshotLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const rows = await listApplications()
        if (cancelled) return
        setApplications(rows)

        // Pull the credit snapshot from the most recent application, if any.
        if (rows.length > 0) {
          const mostRecent = [...rows].sort((a, b) => {
            const at = a.updated_at ?? a.created_at ?? ""
            const bt = b.updated_at ?? b.created_at ?? ""
            return bt.localeCompare(at)
          })[0]

          setSnapshotLoading(true)
          try {
            const detail = await getApplication(mostRecent.id)
            if (cancelled) return

            const cibilScore: number | null =
              detail.payload?.credit_history?.cibil_score ?? null

            const matchPercents = (detail.recommendations ?? [])
              .map((r) => r.match_percent)
              .filter((v): v is number => typeof v === "number")

            const eligibilityScore =
              matchPercents.length > 0
                ? Math.round(
                    matchPercents.reduce((sum, v) => sum + v, 0) / matchPercents.length
                  )
                : null

            setSnapshot({
              cibilScore,
              eligibilityScore,
              updatedAt: detail.updated_at ?? detail.created_at ?? null,
            })
          } catch {
            if (!cancelled) setSnapshot({ cibilScore: null, eligibilityScore: null, updatedAt: null })
          } finally {
            if (!cancelled) setSnapshotLoading(false)
          }
        } else {
          setSnapshotLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof ApiError ? err.message : "Failed to load applications.")
          setSnapshotLoading(false)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const approvedCount = applications.filter((a) =>
    ["approved", "completed", "eligible", "success"].includes(a.status?.toLowerCase())
  ).length
  const activeCount = applications.length
  const recentApplications = applications.slice(0, 3)

  const hasCibil = snapshot.cibilScore !== null
  const hasEligibility = snapshot.eligibilityScore !== null

  return (
    <div className="min-h-screen bg-[#080B14]">
      <GlassSidebar role="applicant" />
      
      <main className="ml-64 p-6 transition-all duration-300">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-muted-foreground">Here&apos;s your loan dashboard overview</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/apply">
              <MagneticButton variant="primary" size="sm">
                <Sparkles className="w-4 h-4" />
                New Application
              </MagneticButton>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="p-6" glow>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[#10B981]" />
                </div>
                <span className="text-xs text-[#10B981] flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {approvedCount}
                </span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                <AnimatedCounter value={approvedCount} />
              </p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard className="p-6" glow>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-[#6366F1]" />
                </div>
                {hasEligibility && (
                  <span className="text-xs text-[#6366F1]">
                    {snapshot.eligibilityScore! >= 70 ? "Excellent" : snapshot.eligibilityScore! >= 40 ? "Fair" : "Low"}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                {snapshotLoading ? (
                  <span className="text-muted-foreground text-base">Loading…</span>
                ) : hasEligibility ? (
                  <AnimatedCounter value={snapshot.eligibilityScore!} suffix="%" />
                ) : (
                  <span className="text-muted-foreground text-base">—</span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">Eligibility Score</p>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard className="p-6" glow>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#FF6B35]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                <AnimatedCounter value={activeCount} />
              </p>
              <p className="text-sm text-muted-foreground">Active Applications</p>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard className="p-6" glow>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-[#06B6D4]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                {snapshotLoading ? (
                  <span className="text-muted-foreground text-base">Loading…</span>
                ) : hasCibil ? (
                  <AnimatedCounter value={snapshot.cibilScore!} />
                ) : (
                  <span className="text-muted-foreground text-base">—</span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">CIBIL Score</p>
            </GlassCard>
          </motion.div>
        </div>

        <div className="grid grid-cols-3 gap-6 items-stretch">
          <div className="col-span-2 flex">
            <GlassCard className="p-6 flex flex-col w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">My Applications</h2>
              </div>

              {isLoading && (
                <div className="flex-1">
                  <SectionLoader icon={FileText} label="Loading your applications…" />
                </div>
              )}

              {!isLoading && loadError && (
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                  <FileWarning className="w-6 h-6 text-[#FF6B35] mb-2" />
                  <p className="text-sm text-white font-medium mb-1">Couldn't load applications</p>
                  <p className="text-xs text-muted-foreground">{loadError}</p>
                </div>
              )}

              {!isLoading && !loadError && recentApplications.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                  <Inbox className="w-6 h-6 text-muted-foreground mb-2" />
                  <p className="text-sm text-white font-medium mb-1">No applications yet</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Submit a loan application to see it here.
                  </p>
                  <Link href="/apply">
                    <MagneticButton variant="primary" size="sm">
                      Start Application
                    </MagneticButton>
                  </Link>
                </div>
              )}

              {!isLoading && !loadError && recentApplications.length > 0 && (
                <div className="space-y-4 flex-1">
                  {recentApplications.map((app, index) => {
                    const initial = (app.applicant_name?.trim()?.[0] ?? "A").toUpperCase()
                    return (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-xl glass-card flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1B4FBB] to-[#6366F1] flex items-center justify-center text-lg font-bold text-white">
                            {initial}
                          </div>
                          <div>
                            <h3 className="font-medium text-white">
                              {app.applicant_name?.trim() || `Application #${app.id}`}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {caseTypeLabel(app.case_type)} · {app.banks_evaluated} bank
                              {app.banks_evaluated === 1 ? "" : "s"} evaluated
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">{formatDate(app.created_at)}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadgeClass(app.status)}`}>
                            {statusLabel(app.status)}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              <Link
                href="/applications"
                className="text-sm text-[#6366F1] hover:text-[#8B5CF6] transition-colors flex items-center gap-1 mt-4"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </GlassCard>
          </div>

          <div className="flex">
            <GlassCard className="p-6 h-full flex flex-col w-full" glow glowColor="aurora">
              <h2 className="text-lg font-semibold text-white mb-4">Credit Score</h2>
              <div className="flex items-center justify-center mb-4 flex-1">
                {snapshotLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : hasCibil ? (
                  <CircularProgress
                    value={snapshot.cibilScore!}
                    max={900}
                    size={140}
                    color="success"
                    label="CIBIL"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    No credit data yet.
                    <br />
                    Submit an application to see your score.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className={`text-sm font-medium ${hasCibil ? creditStatusColor(snapshot.cibilScore!) : "text-muted-foreground"}`}>
                    {hasCibil ? creditStatusLabel(snapshot.cibilScore!) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Updated</p>
                  <p className="text-sm font-medium text-white">
                    {formatDate(snapshot.updatedAt)}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}