"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Sparkles, 
  TrendingUp, 
  Building2, 
  CheckCircle2,
  ArrowRight,
  Download,
  Share2,
  Star,
  Clock,
  Shield,
  Percent,
  Banknote,
  Calendar,
  ChevronRight,
  Info
} from "lucide-react"
import Link from "next/link"
import { GlassNavbar } from "@/components/glass-navbar"
import { AuroraBackground } from "@/components/aurora-background"
import { GlassCard } from "@/components/glass-card"
import { MagneticButton } from "@/components/magnetic-button"
import { AnimatedCounter } from "@/components/animated-counter"
import { CircularProgress } from "@/components/circular-progress"

const recommendations = [
  {
    bank: "HDFC Bank",
    logo: "H",
    rate: 10.5,
    maxAmount: 1500000,
    tenure: 60,
    emi: 32424,
    probability: 92,
    processingFee: "1%",
    features: ["Quick Disbursement", "Flexible Tenure", "No Hidden Charges"],
    bestFor: "Best Overall Match"
  },
  {
    bank: "ICICI Bank",
    logo: "I",
    rate: 10.75,
    maxAmount: 1200000,
    tenure: 48,
    emi: 30876,
    probability: 88,
    processingFee: "1.5%",
    features: ["Zero Foreclosure", "Online Processing", "Instant Approval"],
    bestFor: "Lowest EMI"
  },
  {
    bank: "SBI",
    logo: "S",
    rate: 11.0,
    maxAmount: 1000000,
    tenure: 60,
    emi: 21742,
    probability: 85,
    processingFee: "0.5%",
    features: ["Lowest Processing Fee", "Government Backed", "Long Tenure"],
    bestFor: "Best for Govt. Employees"
  },
  {
    bank: "Axis Bank",
    logo: "A",
    rate: 11.25,
    maxAmount: 800000,
    tenure: 36,
    emi: 26443,
    probability: 78,
    processingFee: "2%",
    features: ["Part Payment Allowed", "Balance Transfer", "Quick Approval"],
    bestFor: "Fastest Processing"
  },
  {
    bank: "Kotak Mahindra",
    logo: "K",
    rate: 10.99,
    maxAmount: 1100000,
    tenure: 48,
    emi: 28234,
    probability: 82,
    processingFee: "1.25%",
    features: ["Premium Service", "Dedicated RM", "Flexible Options"],
    bestFor: "Premium Experience"
  }
]

const creditInsights = [
  { label: "CIBIL Score Impact", value: "Good", color: "#10B981" },
  { label: "Debt-to-Income Ratio", value: "Healthy", color: "#6366F1" },
  { label: "Credit Utilization", value: "Optimal", color: "#06B6D4" },
  { label: "Payment History", value: "Excellent", color: "#10B981" },
]

export default function ResultsPage() {
  const [selectedBank, setSelectedBank] = useState<string | null>(null)
  const eligibilityScore = 87

  return (
    <main className="min-h-screen bg-[#080B14]">
      <GlassNavbar variant="dashboard" />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
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
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Based on your profile, here are your personalized loan options ranked by approval probability
              </p>

              {/* Main Score Card */}
              <div className="flex flex-wrap justify-center gap-6">
                <GlassCard className="p-6" glow>
                  <div className="flex items-center gap-6">
                    <CircularProgress 
                      value={eligibilityScore} 
                      size={100} 
                      color="success"
                      label="Eligible"
                    />
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground mb-1">Eligibility Score</p>
                      <p className="text-3xl font-bold text-white">{eligibilityScore}%</p>
                      <p className="text-xs text-[#10B981]">Excellent Profile</p>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6" glow>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground mb-1">Maximum Eligible Amount</p>
                    <p className="text-3xl font-bold text-white">
                      <AnimatedCounter value={15} prefix="₹" suffix=" Lakhs" />
                    </p>
                    <p className="text-xs text-[#6366F1]">Across 5 Banks</p>
                  </div>
                </GlassCard>

                <GlassCard className="p-6" glow>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground mb-1">Best Interest Rate</p>
                    <p className="text-3xl font-bold text-white">
                      <AnimatedCounter value={10.5} suffix="%" decimals={1} />
                    </p>
                    <p className="text-xs text-[#FF6B35]">HDFC Bank</p>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          </section>

          {/* Recommendations Grid */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recommended Banks</h2>
              <div className="flex gap-2">
                <MagneticButton variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                  Export
                </MagneticButton>
                <MagneticButton variant="ghost" size="sm">
                  <Share2 className="w-4 h-4" />
                  Share
                </MagneticButton>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {recommendations.map((bank, index) => (
                <motion.div
                  key={bank.bank}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard 
                    className={`p-6 cursor-pointer ${selectedBank === bank.bank ? "border-[#1B4FBB] shadow-[0_0_30px_rgba(27,79,187,0.3)]" : ""}`}
                    onClick={() => setSelectedBank(bank.bank)}
                    glow
                  >
                    {index === 0 && (
                      <div className="absolute -top-3 left-4 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FF8F6B] text-xs font-medium text-white">
                        Top Recommendation
                      </div>
                    )}
                    
                    <div className="flex items-start gap-4">
                      {/* Bank Logo */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B4FBB] to-[#6366F1] flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                        {bank.logo}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-white text-lg">{bank.bank}</h3>
                            <p className="text-xs text-[#FF6B35]">{bank.bestFor}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#10B981]">{bank.probability}%</div>
                            <p className="text-xs text-muted-foreground">Match</p>
                          </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-4 gap-4 py-4 border-y border-white/10 my-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Interest</p>
                            <p className="text-sm font-semibold text-white">{bank.rate}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Max Amount</p>
                            <p className="text-sm font-semibold text-white">₹{(bank.maxAmount / 100000).toFixed(0)}L</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Tenure</p>
                            <p className="text-sm font-semibold text-white">{bank.tenure} mo</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">EMI</p>
                            <p className="text-sm font-semibold text-white">₹{bank.emi.toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {bank.features.map((feature) => (
                            <span
                              key={feature}
                              className="px-2 py-1 rounded-full bg-white/5 text-xs text-muted-foreground"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>

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
          </section>

          {/* Credit Insights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Credit Insights</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {creditInsights.map((insight, index) => (
                <motion.div
                  key={insight.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <GlassCard className="p-4" glow>
                    <p className="text-xs text-muted-foreground mb-2">{insight.label}</p>
                    <p className="text-lg font-semibold" style={{ color: insight.color }}>
                      {insight.value}
                    </p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </section>

          {/* AI Recommendations */}
          <section>
            <GlassCard className="p-6" glow glowColor="aurora">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">AI-Generated Recommendations</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                      <span>Your CIBIL score of 750+ qualifies you for premium rates. HDFC Bank offers the best rate at 10.5%.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                      <span>Consider a 48-month tenure for optimal EMI-to-income ratio of 35%.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                      <span>Your stable employment of 5+ years makes you eligible for express processing.</span>
                    </li>
                  </ul>
                  <div className="mt-4 flex gap-2">
                    <Link href="/dashboard">
                      <MagneticButton variant="primary" size="sm">
                        Go to Dashboard
                        <ArrowRight className="w-4 h-4" />
                      </MagneticButton>
                    </Link>
                    <Link href="/apply">
                      <MagneticButton variant="secondary" size="sm">
                        Update Application
                      </MagneticButton>
                    </Link>
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
