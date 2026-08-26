"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  CheckCircle,
  TrendingUp,
  Clock,
  Building2,
  Percent,
  Landmark,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { DashboardCharts } from "@/components/admin/dashboard-charts"
import { SectionLoader, Skeleton } from "@/components/loading" // adjust path
import { cn } from "@/lib/utils"
import {
  listKnowledgeDocuments,
  listBanks,
  getPolicyComparison,
  type KnowledgeDocumentRead,
  type BankRead,
  type PolicyComparisonRow,
} from "@/lib/api"
import {
  listApplications,
  listAllApplicationFeedback,
  type SavedApplicationSummary,
  type ApplicationFeedbackListItem,
  type FeedbackSentiment,
} from "@/lib/userAPI" // adjust path/filename

type CardKey = "Active Policies" | "Loan Applications"

const APPROVED_STATUS_VALUE = "approved"

/** Formats a possibly-missing number safely — never throws on undefined/null/NaN. */
function fmtNum(value: unknown): string {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 0
  return n.toLocaleString("en-IN")
}

/** Formats a possibly-missing percentage safely — never throws on undefined/null/NaN. */
function fmtPercent(value: unknown, digits = 1): string {
  const n = typeof value === "number" && Number.isFinite(value) ? value : null
  return n === null ? "—" : `${n.toFixed(digits)}%`
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
}

interface StatsData {
  totalDocuments: number
  activePolicies: number
  loanApplications: number
  approvalRatePercent: number | null // null = not enough data to compute
  totalLenders: number
}

function useDashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const [docs, banks, applications] = await Promise.all([
          listKnowledgeDocuments(),
          listBanks(),
          listApplications(),
        ])
        if (cancelled) return

        const approvedCount = applications.filter(
          (a) => a.status?.toLowerCase() === APPROVED_STATUS_VALUE
        ).length

        setStats({
          totalDocuments: docs.length,
          activePolicies: docs.filter((d) => d.status === "active").length,
          loanApplications: applications.length,
          approvalRatePercent:
            applications.length > 0 ? (approvedCount / applications.length) * 100 : null,
          totalLenders: banks.filter((b) => b.status === "active").length,
        })
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load dashboard stats")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { stats, isLoading, error }
}

/**
 * Live like/dislike feedback across all users' applications. Backs both the
 * "Recommendation Accuracy" card (like = correct, dislike = incorrect proxy)
 * and the "User Activity Log" table below.
 */
function useApplicationFeedback() {
  const [items, setItems] = useState<ApplicationFeedbackListItem[]>([])
  const [likeCount, setLikeCount] = useState(0)
  const [dislikeCount, setDislikeCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await listAllApplicationFeedback({ limit: 500 })
        if (cancelled) return
        const safeItems = res.items ?? []
        setItems(safeItems)
        // Prefer the backend's counts, but fall back to counting the items
        // ourselves if those fields are missing or named differently on the
        // actual response — keeps the page working even on a schema mismatch.
        const likeFromItems = safeItems.filter((i) => i.sentiment === "like").length
        const dislikeFromItems = safeItems.filter((i) => i.sentiment === "dislike").length
        setLikeCount(typeof res.likes === "number" ? res.likes : likeFromItems)
        setDislikeCount(typeof res.dislikes === "number" ? res.dislikes : dislikeFromItems)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load feedback")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { items, likeCount, dislikeCount, isLoading, error }
}

function BankComparisonCard() {
  const [metric, setMetric] = useState<"foir" | "rate">("foir")
  const [rowsData, setRowsData] = useState<PolicyComparisonRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await getPolicyComparison(true)
        if (cancelled) return
        setRowsData(res.rows)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load bank comparison")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const rows = useMemo(() => {
    const withMetric = rowsData
      .map((r) => ({
        bank: r.bank_name,
        foir: r.foir,
        rate: r.roi,
        rateDisplay: r.roi_display ?? (r.roi != null ? `${r.roi}%` : null),
      }))
      .filter((r) => {
        const value = metric === "foir" ? r.foir : r.rate
        return value !== null && value !== undefined
      }) as {
      bank: string
      foir: number
      rate: number
      rateDisplay: string | null
    }[]

    const sorted = [...withMetric].sort((a, b) => b[metric === "foir" ? "foir" : "rate"] - a[metric === "foir" ? "foir" : "rate"])
    const values = sorted.map((r) => (metric === "foir" ? r.foir : r.rate))
    const min = Math.min(...values)
    const max = Math.max(...values)
    return sorted.map((row) => ({
      ...row,
      width: max === min ? 100 : 25 + (( (metric === "foir" ? row.foir : row.rate) - min) / (max - min)) * 75,
    }))
  }, [rowsData, metric])

  const tabs: { key: "foir" | "rate"; label: string; icon: typeof Percent; suffix: string }[] = [
    { key: "foir", label: "FOIR", icon: Percent, suffix: "%" },
    { key: "rate", label: "Rate (ROI)", icon: TrendingUp, suffix: "% p.a." },
  ]

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Bank Comparison
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">FOIR &amp; Rate by bank</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Quick comparison across active lenders. For the full policy comparison, see Bank Management.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
          {tabs.map((tab) => {
            const active = metric === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setMetric(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-linear-to-r from-primary to-indigo-500 text-white"
                    : "text-muted-foreground hover:text-white"
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
          ) : rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground py-6 text-center">
          No reviewed policy data available for comparison yet.
          Approve bank policies in Knowledge Base to populate FOIR &amp; ROI.
        </p>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-6 space-y-3"
        >
          {rows.map((row, index) => {
            const { suffix } = tabs.find((t) => t.key === metric)!
            const displayValue =
              metric === "rate" && row.rateDisplay
                ? row.rateDisplay.replace(/%$/, "")
                : String(metric === "foir" ? row.foir : row.rate)
            return (
              <motion.div
                key={row.bank}
                variants={itemVariants}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#0b1220] p-3.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-semibold text-muted-foreground">
                  {index + 1}
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                  <Landmark className="h-4 w-4 text-primary" />
                </div>
                <div className="w-40 shrink-0 truncate text-sm font-medium text-white">
                  {row.bank}
                </div>
                <div className="relative flex-1">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${row.width}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full bg-linear-to-r",
                        metric === "foir"
                          ? "from-cyan-400 to-blue-500"
                          : "from-emerald-400 to-teal-500"
                      )}
                    />
                  </div>
                </div>
                <div className="w-28 shrink-0 text-right font-mono text-sm font-semibold text-white">
                  {displayValue}
                  {metric === "rate" && row.rateDisplay?.includes("%") ? "" : suffix}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </GlassCard>
  )
}

const PAGE_SIZE = 5

function formatTimestamp(iso?: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** What to show in the "response" column when there's no free-text comment. */
function feedbackSummary(item: ApplicationFeedbackListItem): string {
  if (item.comment && item.comment.trim()) return item.comment.trim()
  const caseLabel =
    item.case_type === "balance_transfer"
      ? "Balance transfer"
      : item.case_type === "fresh_loan"
      ? "Fresh loan"
      : "Loan"
  return item.applicant_name
    ? `${caseLabel} recommendation for ${item.applicant_name}`
    : `${caseLabel} recommendation (application #${item.application_id})`
}

interface UserActivityLogProps {
  items: ApplicationFeedbackListItem[]
  isLoading: boolean
  error: string | null
}

function UserActivityLog({ items, isLoading, error }: UserActivityLogProps) {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<FeedbackSentiment | "all">("all")

  const sorted = useMemo(
    () =>
      [...items].sort((a, b) => {
        const at = a.created_at ? new Date(a.created_at).getTime() : 0
        const bt = b.created_at ? new Date(b.created_at).getTime() : 0
        return bt - at
      }),
    [items]
  )

  const filtered = useMemo(
    () => (filter === "all" ? sorted : sorted.filter((i) => i.sentiment === filter)),
    [sorted, filter]
  )

  // Keep the current page in range whenever the filtered set shrinks/grows.
  useEffect(() => {
    setPage(1)
  }, [filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <GlassCard className="p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Activity</p>
          <h2 className="mt-1 text-xl font-semibold text-white">User Activity Log</h2>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
          {(["all", "like", "dislike"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                filter === key
                  ? "bg-linear-to-r from-primary to-indigo-500 text-white"
                  : "text-muted-foreground hover:text-white"
              )}
            >
              {key === "all" ? "All" : key === "like" ? "Liked" : "Disliked"}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No feedback recorded yet.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 text-left font-medium text-muted-foreground">Timestamp</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">User</th>
                  <th className="pb-3 text-left font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="py-3 pr-6 text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(row.created_at)}
                    </td>
                    <td className="py-3 pr-6 whitespace-nowrap">
                      <span className="text-white">{row.username ?? `User #${row.user_id}`}</span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {row.sentiment === "like" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
                            <ThumbsUp className="h-3 w-3" /> Liked:
                          </span>
                        )}
                        {row.sentiment === "dislike" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400">
                            <ThumbsDown className="h-3 w-3" /> Disliked:
                          </span>
                        )}
                        <span className="text-white/80 truncate max-w-[420px]">
                          {feedbackSummary(row)}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {(safePage - 1) * PAGE_SIZE + 1}-{Math.min(safePage * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <span className="rounded-lg border border-white/10 bg-primary/20 px-3 py-1.5 text-xs font-medium text-white">
                Page {safePage} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </GlassCard>
  )
}

export default function AdminDashboardPage() {
  const [selectedCard, setSelectedCard] = useState<CardKey | null>(null)
  const { stats, isLoading: isLoadingStats, error: statsError } = useDashboardStats()
  const {
    items: feedbackItems,
    likeCount,
    dislikeCount,
    isLoading: isLoadingFeedback,
    error: feedbackError,
  } = useApplicationFeedback()

  const safeLikeCount = typeof likeCount === "number" && Number.isFinite(likeCount) ? likeCount : 0
  const safeDislikeCount =
    typeof dislikeCount === "number" && Number.isFinite(dislikeCount) ? dislikeCount : 0
  const totalFeedback = safeLikeCount + safeDislikeCount
  const accuracyPercent = totalFeedback > 0 ? (safeLikeCount / totalFeedback) * 100 : null
  const incorrectPercent = accuracyPercent != null ? 100 - accuracyPercent : null

  const cardDetails: Record<CardKey, { title: string; summary: string; items: string[] }> = {
    "Active Policies": {
      title: "Active Policy Detail",
      summary: "These are the currently active policy documents available in the knowledge base.",
      items: [
        "HDFC Bank Credit Policy",
        "ICICI FOIR Guidelines",
        "SBI Credit Risk Rules",
      ],
    },
    "Loan Applications": {
      title: "Loan Applications Breakdown",
      summary: "Application volume by outcome for the current month.",
      items: [
        "Approved — 2,661 applications",
        "Rejected — 583 applications",
        "Pending review — 168 applications",
      ],
    },
  }

  const selectedCardDetail = selectedCard ? cardDetails[selectedCard] : null

  const statsCards = stats
    ? [
        {
          title: "Total Documents",
          value: fmtNum(stats.totalDocuments),
          icon: FileText,
          color: "from-primary to-indigo-500",
          description: "Across all lenders",
        },
        {
          title: "Active Policies",
          value: fmtNum(stats.activePolicies),
          icon: CheckCircle,
          color: "from-emerald-500 to-teal-500",
          description: "Currently in use",
        },
        {
          title: "Loan Applications",
          value: fmtNum(stats.loanApplications),
          icon: TrendingUp,
          color: "from-cyan-500 to-blue-500",
          description: "All time",
        },
        {
          title: "Approval Rate",
          value: fmtPercent(stats.approvalRatePercent, 0),
          icon: Clock,
          color: "from-violet-500 to-purple-500",
          description: "Across all applications",
        },
        {
          title: "Total Lenders",
          value: fmtNum(stats.totalLenders),
          icon: Building2,
          color: "from-amber-500 to-orange-500",
          description: "Active partnerships",
        },
      ]
    : []

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Loan Operations & Knowledge Base Overview
        </p>
      </motion.div>

      {statsError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {statsError}
        </div>
      )}

      {isLoadingStats ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <GlassCard key={i} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="w-10 h-10 rounded-xl" />
              </div>
              <Skeleton className="h-7 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </GlassCard>
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          {statsCards.map((stat) => {
            const clickable = stat.title === "Active Policies" || stat.title === "Loan Applications"
            return (
              <motion.div key={stat.title} variants={itemVariants}>
                <GlassCard
                  className={cn(
                    "p-5 transition-all",
                    clickable && "cursor-pointer hover:scale-[1.01] hover:border-white/20"
                  )}
                  hover={clickable}
                  onClick={() => clickable && setSelectedCard(stat.title as CardKey)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </div>
                    <div className={cn("rounded-xl bg-linear-to-br p-3", stat.color)}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Bank Comparison — FOIR / Rate tabs, live */}
      <motion.div variants={itemVariants}>
        <BankComparisonCard />
      </motion.div>

      {/* Recommendation Accuracy — now backed by real like/dislike feedback.
          "Accuracy" here is a proxy: likes / (likes + dislikes). It reflects
          user sentiment on recommendations, not a graded correctness check,
          since the backend doesn't have a separate correctness signal. */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                Recommendation Feedback
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Response quality overview</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                Based on user like/dislike feedback on AI recommendations across all applications.
              </p>
            </div>
            <div className="rounded-3xl bg-white/5 px-5 py-4 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Positive rate</p>
              <p className="mt-2 text-4xl font-bold text-white">
                {isLoadingFeedback ? "—" : fmtPercent(accuracyPercent)}
              </p>
              <p className="text-sm text-muted-foreground">
                {isLoadingFeedback
                  ? "Loading…"
                  : incorrectPercent != null
                  ? `Negative ${fmtPercent(incorrectPercent)}`
                  : "No feedback yet"}
              </p>
            </div>
          </div>

          {feedbackError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {feedbackError}
            </div>
          )}

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {[
              { label: "Total Feedback", value: isLoadingFeedback ? "—" : fmtNum(totalFeedback) },
              { label: "Liked", value: isLoadingFeedback ? "—" : fmtNum(safeLikeCount) },
              { label: "Disliked", value: isLoadingFeedback ? "—" : fmtNum(safeDislikeCount) },
              {
                label: "Negative %",
                value: isLoadingFeedback ? "—" : fmtPercent(incorrectPercent),
              },
            ].map((item) => (
              <motion.div key={item.label} variants={itemVariants} className="rounded-3xl bg-white/5 p-4">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Positive rate progress</span>
              <span className="text-sm font-semibold text-white">
                {fmtPercent(accuracyPercent)}
              </span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${accuracyPercent ?? 0}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-linear-to-r from-emerald-400 via-lime-400 to-cyan-500"
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>Positive rate</span>
              <span>
                Negative rate {fmtPercent(incorrectPercent)}
              </span>
            </div>
          </div>
          {selectedCardDetail && (
            <div className="mt-6 rounded-3xl bg-white/5 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedCardDetail.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selectedCardDetail.summary}</p>
                </div>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                >
                  Close
                </button>
              </div>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white">
                {selectedCardDetail.items.map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        <motion.div variants={itemVariants}>
          <DashboardCharts />
        </motion.div>
        {/* User Activity Log — live, backed by /eligibility/feedback */}
        <motion.div variants={itemVariants}>
          <UserActivityLog items={feedbackItems} isLoading={isLoadingFeedback} error={feedbackError} />
        </motion.div>
      </div>
    </motion.div>
  )
}