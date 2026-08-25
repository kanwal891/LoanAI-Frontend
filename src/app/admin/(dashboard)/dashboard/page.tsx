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
import { listApplications, type SavedApplicationSummary } from "@/lib/userAPI" // adjust path/filename

type CardKey = "Active Policies" | "Loan Applications"

const APPROVED_STATUS_VALUE = "approved"

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
      }))
      .filter((r) => r[metric] !== null && r[metric] !== undefined) as {
      bank: string
      foir: number
      rate: number
    }[]

    const sorted = [...withMetric].sort((a, b) => b[metric] - a[metric])
    const values = sorted.map((r) => r[metric])
    const min = Math.min(...values)
    const max = Math.max(...values)
    return sorted.map((row) => ({
      ...row,
      width: max === min ? 100 : 25 + ((row[metric] - min) / (max - min)) * 75,
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
                <div className="w-20 shrink-0 text-right font-mono text-sm font-semibold text-white">
                  {row[metric]}
                  {suffix}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </GlassCard>
  )
}

const userActivityLog = [
  { id: 1, timestamp: "22 Jul 2026, 12:07", user: "user1@gmail.com", action: "liked", response: "Based on your income and credit profile, you may be eligible for a personal loan up to ₹10 lakhs." },
  { id: 2, timestamp: "22 Jul 2026, 12:07", user: "user1@gmail.com", action: "liked", response: "I do not have sufficient loan policy information to answer that confidently." },
  { id: 3, timestamp: "22 Jul 2026, 12:07", user: "user1@gmail.com", action: "disliked", response: "I cannot recommend falsifying financial information to improve loan eligibility." },
  { id: 4, timestamp: "22 Jul 2026, 12:07", user: "user1@gmail.com", action: "disliked", response: "Loan eligibility depends on factors such as income, credit score, employment, and existing liabilities." },
  { id: 5, timestamp: "22 Jul 2026, 12:06", user: "user1@gmail.com", action: "liked", response: "Maintaining a good repayment history can significantly improve your loan approval chances." },
  { id: 6, timestamp: "10 Jul 2026, 16:59", user: "user2@yopmail.com", action: "liked", response: "EMI Calculator: Estimate your monthly installment based on loan amount and tenure." },
  { id: 7, timestamp: "10 Jul 2026, 16:54", user: "admin@gmail.com", action: "disliked", response: "I cannot guarantee loan approval without reviewing your financial profile." },
  { id: 8, timestamp: "10 Jul 2026, 16:51", user: "admin@gmail.com", action: "liked", response: "Home loan interest rates currently start from 8.35% per annum, subject to lender policies." },
  { id: 9, timestamp: "10 Jul 2026, 16:27", user: "user2@yopmail.com", action: "liked", response: "A credit score above 750 generally improves your chances of faster loan approval." },
  { id: 10, timestamp: "10 Jul 2026, 15:46", user: "user2@yopmail.com", action: "disliked", response: "Loan processing fees and charges vary depending on the lender and loan type." },
  { id: 11, timestamp: "09 Jul 2026, 11:20", user: "user3@gmail.com", action: "liked", response: "HDFC Bank offers competitive home loan rates starting from 8.5% p.a." },
  { id: 12, timestamp: "09 Jul 2026, 10:45", user: "user3@gmail.com", action: "disliked", response: "I cannot recommend a specific lender without understanding your financial requirements." },
  { id: 13, timestamp: "08 Jul 2026, 14:30", user: "user4@yopmail.com", action: "liked", response: "Your CIBIL score of 720 qualifies you for most personal loan products." },
  { id: 14, timestamp: "08 Jul 2026, 13:15", user: "admin@gmail.com", action: "liked", response: "SBI home loan eligibility criteria have been updated for salaried applicants." },
  { id: 15, timestamp: "07 Jul 2026, 09:00", user: "user5@gmail.com", action: "liked", response: "Axis Bank FOIR limit is typically up to 58% for eligible salaried applicants." },
  { id: 16, timestamp: "07 Jul 2026, 08:45", user: "user5@gmail.com", action: "disliked", response: "I cannot guarantee loan approval without a complete credit assessment." },
  { id: 17, timestamp: "06 Jul 2026, 17:00", user: "user6@yopmail.com", action: "disliked", response: "Kotak Mahindra Bank personal loan processing usually depends on document verification." },
  { id: 18, timestamp: "06 Jul 2026, 16:30", user: "user6@yopmail.com", action: "liked", response: "Yes Bank offers instant personal loans up to ₹40 lakhs for eligible customers." },
  { id: 19, timestamp: "05 Jul 2026, 12:00", user: "user7@gmail.com", action: "disliked", response: "I do not have enough information to compare all loan offers for your financial profile." },
  { id: 20, timestamp: "05 Jul 2026, 11:30", user: "user7@gmail.com", action: "liked", response: "IndusInd Bank provides multiple credit card options based on your income and credit score." },
]

const PAGE_SIZE = 5

function UserActivityLog() {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(userActivityLog.length / PAGE_SIZE)
  const rows = userActivityLog.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <GlassCard className="p-6">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Activity</p>
        <h2 className="mt-1 text-xl font-semibold text-white">User Activity Log</h2>
      </div>

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
                <td className="py-3 pr-6 text-muted-foreground whitespace-nowrap">{row.timestamp}</td>
                <td className="py-3 pr-6 whitespace-nowrap">
                  <span className="text-white">{row.user}</span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    {row.action === "liked" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
                        <ThumbsUp className="h-3 w-3" /> Liked:
                      </span>
                    )}
                    {row.action === "disliked" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400">
                        <ThumbsDown className="h-3 w-3" /> Disliked:
                      </span>
                    )}
                    <span className="text-white/80 truncate max-w-[420px]">{row.response}</span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, userActivityLog.length)} of {userActivityLog.length}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </button>
          <span className="rounded-lg border border-white/10 bg-primary/20 px-3 py-1.5 text-xs font-medium text-white">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </GlassCard>
  )
}

export default function AdminDashboardPage() {
  const [selectedCard, setSelectedCard] = useState<CardKey | null>(null)
  const { stats, isLoading: isLoadingStats, error: statsError } = useDashboardStats()

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
          value: stats.totalDocuments.toLocaleString(),
          icon: FileText,
          color: "from-primary to-indigo-500",
          description: "Across all lenders",
        },
        {
          title: "Active Policies",
          value: stats.activePolicies.toLocaleString(),
          icon: CheckCircle,
          color: "from-emerald-500 to-teal-500",
          description: "Currently in use",
        },
        {
          title: "Loan Applications",
          value: stats.loanApplications.toLocaleString(),
          icon: TrendingUp,
          color: "from-cyan-500 to-blue-500",
          description: "All time",
        },
        {
          title: "Approval Rate",
          value: stats.approvalRatePercent !== null ? `${stats.approvalRatePercent.toFixed(0)}%` : "—",
          icon: Clock,
          color: "from-violet-500 to-purple-500",
          description: "Across all applications",
        },
        {
          title: "Total Lenders",
          value: stats.totalLenders.toLocaleString(),
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

      {/* Bank Comparison — FOIR / Rate tabs, now live */}
      <motion.div variants={itemVariants}>
        <BankComparisonCard />
      </motion.div>

      {/* Recommendation Accuracy — STATIC, no backing endpoint yet */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                Recommendation Accuracy
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Response quality overview</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                Monitor recommendation volume and accuracy across the knowledge base. Incorrect responses are shown alongside overall accuracy percentage.
              </p>
            </div>
            <div className="rounded-3xl bg-white/5 px-5 py-4 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Accuracy</p>
              <p className="mt-2 text-4xl font-bold text-white">94.5%</p>
              <p className="text-sm text-muted-foreground">Incorrect 5.5%</p>
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {[
              { label: "Total Recommendations", value: "3,148" },
              { label: "Correct Recommendations", value: "2,976" },
              { label: "Incorrect Recommendations", value: "172" },
              { label: "Incorrect %", value: "5.5%" },
            ].map((item) => (
              <motion.div key={item.label} variants={itemVariants} className="rounded-3xl bg-white/5 p-4">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Accuracy progress</span>
              <span className="text-sm font-semibold text-white">94.5%</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "94.5%" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-linear-to-r from-emerald-400 via-lime-400 to-cyan-500"
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>Correct rate</span>
              <span>Incorrect rate 5.5%</span>
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
        {/* User Activity Log — STATIC, no backing endpoint yet */}
        <motion.div variants={itemVariants}>
          <UserActivityLog />
        </motion.div>
      </div>
    </motion.div>
  )
}