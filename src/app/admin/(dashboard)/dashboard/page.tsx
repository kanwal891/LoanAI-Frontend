"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  CheckCircle,
  TrendingUp,
  Clock,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Landmark,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { DashboardCharts } from "@/components/admin/dashboard-charts"
import { cn } from "@/lib/utils"

type CardKey = "Active Policies" | "Loan Applications"

const statsCards = [
  {
    title: "Total Documents",
    value: "1,248",
    change: "+12%",
    trend: "up",
    icon: FileText,
    color: "from-primary to-indigo-500",
    description: "Across all lenders",
  },
  {
    title: "Active Policies",
    value: "847",
    change: "+8%",
    trend: "up",
    icon: CheckCircle,
    color: "from-emerald-500 to-teal-500",
    description: "Currently in use",
  },
  {
    title: "Loan Applications",
    value: "3,412",
    change: "+15%",
    trend: "up",
    icon: TrendingUp,
    color: "from-cyan-500 to-blue-500",
    description: "This month",
  },
  {
    title: "Approval Rate",
    value: "78%",
    change: "+4%",
    trend: "up",
    icon: Clock,
    color: "from-violet-500 to-purple-500",
    description: "Across all applications",
  },
  {
    title: "Total Lenders",
    value: "42",
    change: "+3",
    trend: "up",
    icon: Building2,
    color: "from-amber-500 to-orange-500",
    description: "Active partnerships",
  },
]

const decisionTrail = [
  {
    userInput: "Salary ₹21,000, CIBIL 650, Age 58",
    aiRecommendation: "SBI may accept with lower LTV",
    finalDecision: "Rejected",
    correctness: "Incorrect",
    reason: "Rejected per SBI's salaried-applicant policy, which caps eligibility at age 58 — applicant did not meet the age threshold.",
    timestamp: "2026-07-15 14:28",
  },
  {
    userInput: "CIBIL 720, salary ₹35,000, existing loan ₹2L",
    aiRecommendation: "HDFC is eligible",
    finalDecision: "Approved",
    correctness: "Correct",
    reason: "Approved per HDFC's Personal Loan Eligibility Matrix — meets the minimum ₹25,000 income and 650+ CIBIL requirements, consistent with a similar approved case on 2026-06-30.",
    timestamp: "2026-07-14 09:12",
  },
  {
    userInput: "No own house, income ₹45,000, CIBIL 690",
    aiRecommendation: "ICICI likely approve with collateral",
    finalDecision: "Approved",
    correctness: "Correct",
    reason: "Approved per ICICI's FOIR Guidelines, which permit higher-income applicants without owned property when CIBIL exceeds 680 and collateral is provided.",
    timestamp: "2026-07-12 16:05",
  },
]
interface BankComparisonRow {
  bank: string
  foir: number // %
  rate: number // % p.a.
}

const bankComparisonData: BankComparisonRow[] = [
  { bank: "HDFC Bank", foir: 60, rate: 9.5 },
  { bank: "SBI", foir: 65, rate: 9.2 },
  { bank: "ICICI Bank", foir: 55, rate: 10.0 },
  { bank: "Axis Bank", foir: 58, rate: 9.8 },
  { bank: "Kotak Mahindra Bank", foir: 62, rate: 9.6 },
  { bank: "Yes Bank", foir: 57, rate: 10.2 },
  { bank: "IndusInd Bank", foir: 59, rate: 9.9 },
  { bank: "Punjab National Bank", foir: 63, rate: 9.0 },
]

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

/** Bank Comparison widget — tabbed FOIR / Rate view with ranked bars. */
function BankComparisonCard() {
  const [metric, setMetric] = useState<"foir" | "rate">("foir")

  const rows = useMemo(() => {
    const sorted = [...bankComparisonData].sort((a, b) => b[metric] - a[metric])
    const values = sorted.map((r) => r[metric])
    const min = Math.min(...values)
    const max = Math.max(...values)
    return sorted.map((row) => ({
      ...row,
      // Normalize to a 25–100% bar width so differences stay visible even
      // when the underlying values are close together (e.g. 9.0–10.2 for rate).
      width: max === min ? 100 : 25 + ((row[metric] - min) / (max - min)) * 75,
    }))
  }, [metric])

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

      <div className="mt-6 space-y-3">
        {rows.map((row, index) => {
          const { suffix } = tabs.find((t) => t.key === metric)!
          return (
            <div
              key={row.bank}
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
            </div>
          )
        })}
      </div>
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
];

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

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => {
          const clickable = stat.title === "Active Policies" || stat.title === "Loan Applications"
          return (
            <GlassCard
              key={stat.title}
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
              <div className="mt-3 flex items-center gap-1">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-400" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    stat.trend === "up" ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </GlassCard>
          )
        })}
      </motion.div>

      {/* Bank Comparison — FOIR / Rate tabs */}
      <motion.div variants={itemVariants}>
        <BankComparisonCard />
      </motion.div>

      {/* Recommendation Accuracy */}
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

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total Recommendations", value: "3,148" },
              { label: "Correct Recommendations", value: "2,976" },
              { label: "Incorrect Recommendations", value: "172" },
              { label: "Incorrect %", value: "5.5%" },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl bg-white/5 p-4">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Accuracy progress</span>
              <span className="text-sm font-semibold text-white">94.5%</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-linear-to-r from-emerald-400 via-lime-400 to-cyan-500"
                style={{ width: "94.5%" }}
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
          {/* User Activity Log */}
      <motion.div variants={itemVariants}>
        <UserActivityLog />
      </motion.div>
      </div>
    </motion.div>
  )
}