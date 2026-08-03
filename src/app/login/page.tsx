"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  ShieldCheck,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuroraBackground } from "@/components/aurora-background"
import { GlassCard } from "@/components/glass-card"
import { FloatingInput } from "@/components/floating-input"
import { MagneticButton } from "@/components/magnetic-button"



type LoginRole = "user" | "admin"

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<LoginRole>("user")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const validateForm = () => {
    const newErrors: typeof errors = {}
    if (!email) {
      newErrors.email = "Email is required"
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Enter a valid email address"
    }
    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!validateForm()) return

  setIsLoading(true)
  await new Promise((resolve) => setTimeout(resolve, 800))

  // TODO: Replace with backend authentication
  localStorage.setItem("isLoggedIn", "true")
  localStorage.setItem("userRole", role)

  setIsLoading(false)
  router.push(role === "admin" ? "/admin/dashboard" : "/dashboard")
}
  const handleRoleChange = (newRole: LoginRole) => {
    setRole(newRole)
    setErrors({})
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
              Welcome back to the future of{" "}
              <span className="text-gradient">lending</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-white/70"
            >
              Access your personalized loan dashboard, track applications, and manage your financial journey with AI-powered insights.
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

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">LoanAI</span>
          </div>

          <GlassCard className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
              <p className="text-muted-foreground">Enter your credentials to continue</p>
            </div>

            {/* Role Toggle */}
            <div className="flex p-1 glass rounded-xl mb-8">
              <button
                type="button"
                onClick={() => handleRoleChange("user")}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  role === "user"
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <User className="w-4 h-4" />
                Login as User
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange("admin")}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  role === "admin"
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Login as Admin
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
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
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
              </div>

              <label className="flex items-center gap-2 cursor-pointer w-fit">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded border-2 transition-all duration-300 ${
                      rememberMe ? "bg-gradient-to-r from-primary to-accent border-transparent" : "border-white/30"
                    }`}
                  >
                    {rememberMe && (
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
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>

              <MagneticButton type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <>
                    {role === "admin" ? "Sign In as Admin" : "Sign In"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </MagneticButton>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </main>
  )
}