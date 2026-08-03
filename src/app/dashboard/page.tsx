"use client"

import { motion } from "framer-motion"
import { 
  TrendingUp, 
  CreditCard,
  Wallet,
  ChevronRight,
  Sparkles,
  BarChart3,
  Activity
} from "lucide-react"
import Link from "next/link"
import { GlassSidebar } from "@/components/glass-sidebar"
import { GlassCard } from "@/components/glass-card"
import { MagneticButton } from "@/components/magnetic-button"
import { AnimatedCounter } from "@/components/animated-counter"
import { CircularProgress } from "@/components/circular-progress"

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
]
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#080B14]">
      <GlassSidebar role="applicant" />
      
      <main className="ml-64 p-6 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back, Rahul</h1>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard className="p-6" glow>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[#10B981]" />
                </div>
                <span className="text-xs text-[#10B981] flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +12%
                </span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                <AnimatedCounter value={15} prefix="₹" suffix="L" />
              </p>
              <p className="text-sm text-muted-foreground">Total Approved</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-6" glow>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-[#6366F1]" />
                </div>
                <span className="text-xs text-[#6366F1]">Excellent</span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                <AnimatedCounter value={87} suffix="%" />
              </p>
              <p className="text-sm text-muted-foreground">Eligibility Score</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-6" glow>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#FF6B35]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                <AnimatedCounter value={applications.length} />
              </p>
              <p className="text-sm text-muted-foreground">Active Applications</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6" glow>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-[#06B6D4]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                <AnimatedCounter value={750} />
              </p>
              <p className="text-sm text-muted-foreground">CIBIL Score</p>
            </GlassCard>
          </motion.div>
        </div>

        {/* Main Content Grid — both columns stretch to the same height,
            driven by whichever card is naturally taller (no hardcoded px
            heights fighting each other like the old h-[400px] / h-[720px]) */}
        <div className="grid grid-cols-3 gap-6 items-stretch">
          {/* Applications */}
          <div className="col-span-2 flex">
            <GlassCard className="p-6 flex flex-col w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">My Applications</h2>
              </div>
              
              <div className="space-y-4 flex-1">
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
                        <p className="text-sm text-muted-foreground">₹{(app.amount / 100000).toFixed(0)}L @ {app.rate}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{app.id}</p>
                        <p className="text-xs text-muted-foreground">{app.date}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        app.status === "approved" 
                          ? "bg-[#10B981]/20 text-[#10B981]"
                          : app.status === "processing"
                          ? "bg-[#6366F1]/20 text-[#6366F1]"
                          : "bg-[#FF6B35]/20 text-[#FF6B35]"
                      }`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Link
                href="/applications"
                className="text-sm text-[#6366F1] hover:text-[#8B5CF6] transition-colors flex items-center gap-1 mt-4"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </GlassCard>
          </div>

          {/* Right Column */}
          <div className="flex">
            {/* Credit Score Widget — h-full so it matches the applications
                card's natural height instead of a separately guessed value */}
            <GlassCard className="p-6 h-full flex flex-col w-full" glow glowColor="aurora">
              <h2 className="text-lg font-semibold text-white mb-4">Credit Score</h2>
              <div className="flex items-center justify-center mb-4 flex-1">
                <CircularProgress value={750} max={900} size={140} color="success" label="CIBIL" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-medium text-[#10B981]">Excellent</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Updated</p>
                  <p className="text-sm font-medium text-white">Jan 20</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}