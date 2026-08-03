"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  CheckCircle,
  TrendingUp,
  Clock,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
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
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Decision Trail</h2>
                <p className="text-sm text-muted-foreground">
                  Sample recommendation history for audit and correctness review.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {decisionTrail.map((item) => (
                <div key={item.timestamp} className="rounded-3xl bg-[#0b1220] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">User input</p>
                      <p className="text-sm text-muted-foreground">{item.userInput}</p>
                    </div>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-white">
                      {item.timestamp}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
      item.finalDecision === "Approved"
        ? "bg-emerald-500/15 text-emerald-300"
        : "bg-red-500/15 text-red-300"
    }`}
  >
    {item.finalDecision === "Approved"
      ? "🟢 Approved"
      : "🔴 Rejected"}
  </span>

  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
      item.correctness === "Correct"
        ? "bg-blue-500/15 text-blue-300"
        : "bg-orange-500/15 text-orange-300"
    }`}
  >
    {item.correctness === "Correct"
      ? "✅ Correct"
      : "❌ Incorrect"}
  </span>
                    <div className="rounded-2xl bg-white/5 p-3">
                      <p className="text-xs text-muted-foreground">Recommendation</p>
                      <p className="mt-2 text-sm text-white">{item.aiRecommendation}</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-3">
                      <p className="text-xs text-muted-foreground">Final decision</p>
                      <p className="mt-2 text-sm text-white">{item.finalDecision}</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-3">
                      <p className="text-xs text-muted-foreground">Outcome</p>
                      <p className="mt-2 text-sm text-white">{item.correctness}</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl border-l-4 border-amber-400 bg-amber-500/10 p-3">
  <p className="text-xs uppercase text-amber-300">
    Reason
  </p>

  <p className="mt-1 text-sm text-white">
    {item.reason}
  </p>
</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  )
}