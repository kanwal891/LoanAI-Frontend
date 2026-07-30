"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, User, Smartphone } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuroraBackground } from "@/components/aurora-background"
import { GlassCard } from "@/components/glass-card"
import { FloatingInput } from "@/components/floating-input"
import { MagneticButton } from "@/components/magnetic-button"

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [errors, setErrors] = useState<{
    fullName?: string
    email?: string
    mobile?: string
    password?: string
    confirmPassword?: string
    terms?: string
  }>({})

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const mobileRegex = /^[6-9]\d{9}$/

  const validate = () => {
    const newErrors: typeof errors = {}

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required"
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Enter your full name"
    }

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Enter a valid email address"
    }

    if (!mobile) {
      newErrors.mobile = "Mobile number is required"
    } else if (!mobileRegex.test(mobile)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      newErrors.password = "Include at least one letter and one number"
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!agreedToTerms) {
      newErrors.terms = "You must agree to the Terms and Privacy Policy"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    router.push("/login")
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
              Start your journey to the right{" "}
              <span className="text-gradient">loan match</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-white/70"
            >
              Create your account to get AI-powered loan recommendations tailored to your profile, in minutes.
            </motion.p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {[
              { value: "50K+", label: "Active Users" },
              { value: "₹500Cr", label: "Loans Processed" },
              { value: "4.9", label: "App Rating" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Right Panel - Signup Form */}
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
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-muted-foreground">Get started with your free account</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <FloatingInput
                  label="Full Name"
                  type="text"
                  value={fullName}
                  onChange={(v: string) => {
                    setFullName(v)
                    setErrors((prev) => ({ ...prev, fullName: undefined }))
                  }}
                  icon={<User className="w-5 h-5" />}
                />
                {errors.fullName && <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>}
              </div>

              <div>
                <FloatingInput
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(v: string) => {
                    setEmail(v)
                    setErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  icon={<Mail className="w-5 h-5" />}
                />
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
              </div>

              <div>
                <FloatingInput
                  label="Mobile Number"
                  type="tel"
                  value={mobile}
                  onChange={(v: string) => {
                    const numericValue = v.replace(/\D/g, "").slice(0, 10)
                    setMobile(numericValue)
                    setErrors((prev) => ({ ...prev, mobile: undefined }))
                  }}
                  icon={<Smartphone className="w-5 h-5" />}
                />
                {errors.mobile && <p className="mt-1 text-sm text-red-400">{errors.mobile}</p>}
              </div>

              <div className="relative">
                <FloatingInput
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(v: string) => {
                    setPassword(v)
                    setErrors((prev) => ({ ...prev, password: undefined }))
                  }}
                  icon={<Lock className="w-5 h-5" />}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errors.password ? (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">At least 8 characters, with a letter and a number.</p>
                )}
              </div>

              <div className="relative">
                <FloatingInput
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(v: string) => {
                    setConfirmPassword(v)
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                  }}
                  icon={<Lock className="w-5 h-5" />}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
              </div>

              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => {
                        setAgreedToTerms(e.target.checked)
                        setErrors((prev) => ({ ...prev, terms: undefined }))
                      }}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 transition-all duration-300 ${
                        agreedToTerms ? "bg-gradient-to-r from-primary to-accent border-transparent" : "border-white/30"
                      }`}
                    >
                      {agreedToTerms && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-full h-full text-white p-0.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </motion.svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:text-accent">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:text-accent">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.terms && <p className="mt-1 text-sm text-red-400">{errors.terms}</p>}
              </div>

              <MagneticButton type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </MagneticButton>
            </form>

            <p className="text-center text-muted-foreground mt-8">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:text-accent transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </main>
  )
}