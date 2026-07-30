"use client"

import { motion } from "framer-motion"
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  Wallet,
  ArrowRight,
  Calendar,
  Bell,
  Upload,
  Building2,
  ChevronRight,
  Sparkles,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"
import Link from "next/link"
import { GlassSidebar } from "@/components/glass-sidebar"
import { AuroraBackground } from "@/components/aurora-background"
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
]

const documents = [
  { name: "PAN Card", status: "verified", icon: FileText },
  { name: "Aadhaar Card", status: "verified", icon: FileText },
  { name: "Salary Slips", status: "pending", icon: FileText },
  { name: "Bank Statements", status: "required", icon: FileText },
]

const notifications = [
  { title: "HDFC Loan Approved", message: "Congratulations! Your loan has been approved.", time: "2h ago", type: "success" },
  { title: "Document Required", message: "Please upload your latest salary slip.", time: "5h ago", type: "warning" },
  { title: "Application Update", message: "Your ICICI application is being processed.", time: "1d ago", type: "info" },
]

const emiSchedule = [
  { month: "Feb 2024", amount: 32424, status: "upcoming" },
  { month: "Mar 2024", amount: 32424, status: "upcoming" },
  { month: "Apr 2024", amount: 32424, status: "upcoming" },
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6 items-start">
          {/* Applications */}
          <div className="col-span-2">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">My Applications</h2>
                <Link href="/applications" className="text-sm text-[#6366F1] hover:text-[#8B5CF6] transition-colors flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
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
            </GlassCard>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Credit Score Widget */}
            <GlassCard className="p-6" glow glowColor="aurora">
              <h2 className="text-lg font-semibold text-white mb-4">Credit Score</h2>
              <div className="flex items-center justify-center mb-4">
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

            {/* Document Checklist */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Documents</h2>
                <Link href="/documents">
                  <MagneticButton variant="ghost" size="sm">
                    <Upload className="w-4 h-4" />
                  </MagneticButton>
                </Link>
              </div>
              
              <div className="space-y-3">
                {documents.map((doc, index) => (
                  <motion.div
                    key={doc.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-xl glass-card"
                  >
                    <div className="flex items-center gap-3">
                      <doc.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-white">{doc.name}</span>
                    </div>
                    <span className={`text-xs ${
                      doc.status === "verified"
                        ? "text-[#10B981]"
                        : doc.status === "pending"
                        ? "text-[#FF6B35]"
                        : "text-[#EF4444]"
                    }`}>
                      {doc.status === "verified" && <CheckCircle2 className="w-4 h-4" />}
                      {doc.status === "pending" && <Clock className="w-4 h-4" />}
                      {doc.status === "required" && <AlertCircle className="w-4 h-4" />}
                    </span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

          </div>
        </div>
      </main>
    </div>
  )
}