"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Sparkles } from "lucide-react"
import { MagneticButton } from "../components/magnetic-button"
import { cn } from "@/lib/utils"

interface GlassNavbarProps {
  variant?: "landing" | "dashboard"
}

export function GlassNavbar({ variant = "landing" }: GlassNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true")
  }, [])

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How it Works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#testimonials", label: "Testimonials" },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 py-4">
      <div className="bg-[#110814]/70" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="
rounded-2xl
px-6 py-3
flex items-center justify-between
bg-gradient-to-r
from-[#1A1024]
via-[#160C20]
to-[#120917]
border border-white/10
shadow-xl
">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B4FBB] to-[#6366F1] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white group-hover:text-[#6366F1] transition-colors">
              LoanAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          {variant === "landing" && (
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-white transition-colors text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard">
                  <MagneticButton variant="ghost" size="sm">
                    Dashboard
                  </MagneticButton>
                </Link>

                <MagneticButton
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    localStorage.removeItem("isLoggedIn")
                    window.location.href = "/"
                  }}
                >
                  Logout
                </MagneticButton>
              </>
            ) : (
              <>
                <Link href="/login">
                  <MagneticButton variant="ghost" size="sm">
                    Sign In
                  </MagneticButton>
                </Link>

                <Link href="/apply">
                  <MagneticButton variant="primary" size="sm">
                    Get Started
                  </MagneticButton>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-2 mx-4"
          >
            <div className="glass rounded-2xl p-4 space-y-4">
              {variant === "landing" &&
                navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block py-2 text-muted-foreground hover:text-white transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <Link href="/login" className="block">
                  <MagneticButton variant="secondary" size="sm" className="w-full">
                    Sign In
                  </MagneticButton>
                </Link>
                <Link href="/apply" className="block">
                  <MagneticButton variant="primary" size="sm" className="w-full">
                    Get Started
                  </MagneticButton>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}