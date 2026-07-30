"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, ArrowRight, ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { AuroraBackground } from "@/components/aurora-background"
import { GlassCard } from "@/components/glass-card"
import { FloatingInput } from "@/components/floating-input"
import { MagneticButton } from "@/components/magnetic-button"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("Email is required")
      return
    }
    if (!emailRegex.test(email)) {
      setError("Enter a valid email address")
      return
    }

    setError(undefined)
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setEmailSent(true)
  }

  return (
    <main className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <AuroraBackground intensity="high" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">LoanAI</span>
          </Link>

          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-white leading-tight mb-6"
            >
              Let&apos;s get you back <span className="text-gradient">in</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-white/70"
            >
              No worries — it happens to everyone. We'll send you a link to reset your password.
            </motion.p>
          </div>

          <div />
        </div>

        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Right Panel - Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">LoanAI</span>
          </div>

          <GlassCard className="p-8">
            {!emailSent ? (
              <>
                <div className="mb-8">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-6"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </Link>
                  <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
                  <p className="text-muted-foreground">
                    Enter the email linked to your account and we'll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <FloatingInput
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(v: string) => {
                        setEmail(v)
                        setError(undefined)
                      }}
                      icon={<Mail className="w-5 h-5" />}
                    />
                    {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
                  </div>

                  <MagneticButton type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending link...
                      </div>
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </MagneticButton>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                <p className="text-muted-foreground mb-8">
                  We've sent a password reset link to <span className="text-white">{email}</span>. It may take a
                  minute to arrive — check your spam folder if you don't see it.
                </p>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="text-sm text-primary hover:text-accent transition-colors mb-6"
                >
                  Didn't get it? Resend link
                </button>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </motion.div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </main>
  )
}