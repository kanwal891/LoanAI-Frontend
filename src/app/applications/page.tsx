"use client"

import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { GlassSidebar } from "@/components/glass-sidebar"
import { GlassCard } from "@/components/glass-card"

const applications = [
  {
    id: "APP-2026-001",
    bank: "HDFC Bank",
    amount: 1500000,
    status: "approved",
    date: "2026-07-01",
    rate: 10.5,
  },
  {
    id: "APP-2026-002",
    bank: "ICICI Bank",
    amount: 1200000,
    status: "processing",
    date: "2026-07-03",
    rate: 10.75,
  },
  {
    id: "APP-2026-003",
    bank: "State Bank of India",
    amount: 1000000,
    status: "pending",
    date: "2026-07-05",
    rate: 11.0,
  },
  {
    id: "APP-2026-004",
    bank: "Axis Bank",
    amount: 1800000,
    status: "approved",
    date: "2026-07-06",
    rate: 10.25,
  },
  {
    id: "APP-2026-005",
    bank: "Kotak Mahindra Bank",
    amount: 800000,
    status: "rejected",
    date: "2026-07-07",
    rate: 11.45,
  },
  {
    id: "APP-2026-006",
    bank: "Punjab National Bank",
    amount: 950000,
    status: "processing",
    date: "2026-07-08",
    rate: 10.95,
  },
  {
    id: "APP-2026-007",
    bank: "Bank of Baroda",
    amount: 1400000,
    status: "approved",
    date: "2026-07-09",
    rate: 10.35,
  },
  {
    id: "APP-2026-008",
    bank: "Canara Bank",
    amount: 1100000,
    status: "pending",
    date: "2026-07-10",
    rate: 11.15,
  },
  {
    id: "APP-2026-009",
    bank: "IndusInd Bank",
    amount: 1350000,
    status: "processing",
    date: "2026-07-12",
    rate: 10.85,
  },
  {
    id: "APP-2026-010",
    bank: "Yes Bank",
    amount: 750000,
    status: "approved",
    date: "2026-07-13",
    rate: 10.65,
  },
  {
    id: "APP-2026-011",
    bank: "IDFC FIRST Bank",
    amount: 900000,
    status: "pending",
    date: "2026-07-15",
    rate: 10.9,
  },
  {
    id: "APP-2026-012",
    bank: "Federal Bank",
    amount: 1300000,
    status: "processing",
    date: "2026-07-16",
    rate: 10.55,
  },
  {
    id: "APP-2026-013",
    bank: "AU Small Finance Bank",
    amount: 650000,
    status: "approved",
    date: "2026-07-18",
    rate: 11.2,
  },
  {
    id: "APP-2026-014",
    bank: "Union Bank of India",
    amount: 1250000,
    status: "rejected",
    date: "2026-07-20",
    rate: 11.4,
  },
  {
    id: "APP-2026-015",
    bank: "Indian Bank",
    amount: 1700000,
    status: "approved",
    date: "2026-07-22",
    rate: 10.3,
  },
]

export default function ApplicationsPage() {
  return (
    <div className="min-h-screen bg-[#080B14]">
      <GlassSidebar role="applicant" />

      <main className="ml-64 p-6 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl glass hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">My Applications</h1>
            <p className="text-muted-foreground">All your loan applications in one place</p>
          </div>
        </div>

        {/* Applications List */}
        <GlassCard className="p-6">
          <div className="space-y-4">
            {applications.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl glass-card flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1B4FBB] to-[#6366F1] flex items-center justify-center text-lg font-bold text-white">
                    {app.bank[0]}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{app.bank}</h3>
                    <p className="text-sm text-muted-foreground">
                      ₹{(app.amount / 100000).toFixed(0)}L @ {app.rate}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{app.id}</p>
                    <p className="text-xs text-muted-foreground">{app.date}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      app.status === "approved"
                        ? "bg-[#10B981]/20 text-[#10B981]"
                        : app.status === "processing"
                        ? "bg-[#6366F1]/20 text-[#6366F1]"
                        : "bg-[#FF6B35]/20 text-[#FF6B35]"
                    }`}
                  >
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </main>
    </div>
  )
}