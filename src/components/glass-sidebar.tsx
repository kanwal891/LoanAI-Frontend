"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { 
  Sparkles, 
  Home, 
  FileText, 
  PieChart, 
  Users, 
  Settings, 
  Bell, 
  HelpCircle,
  ChevronLeft,
  CreditCard,
  Upload,
  Bot,
  BarChart3,
  Kanban,
  UserCircle,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  role?: "applicant" | "agent" | "admin"
}

export function GlassSidebar({ role = "applicant" }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const applicantLinks = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/apply", icon: FileText, label: "Apply for Loan" },
    { href: "/applications", icon: CreditCard, label: "My Applications" },
    { href: "/documents", icon: Upload, label: "Documents" },
    { href: "/profile", icon: UserCircle, label: "Profile" },
  ]

  const agentLinks = [
    { href: "/agent", icon: Home, label: "Dashboard" },
    { href: "/agent/pipeline", icon: Kanban, label: "Lead Pipeline" },
    { href: "/agent/applicants", icon: Users, label: "Applicants" },
    { href: "/agent/analytics", icon: BarChart3, label: "Analytics" },
  ]

  const adminLinks = [
    { href: "/admin", icon: Home, label: "Dashboard" },
    { href: "/admin/analytics", icon: PieChart, label: "Analytics" },
    { href: "/admin/users", icon: Users, label: "User Management" },
    { href: "/admin/security", icon: Shield, label: "Security" },
  ]

  const links = role === "admin" ? adminLinks : role === "agent" ? agentLinks : applicantLinks

  const bottomLinks = [
    { href: "/notifications", icon: Bell, label: "Notifications" },
    { href: "/settings", icon: Settings, label: "Settings" },
    { href: "/help", icon: HelpCircle, label: "Help" },
  ]

  return (
    <motion.aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-30 glass border-r border-white/10 flex flex-col",
        isCollapsed ? "w-20" : "w-64"
      )}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B4FBB] to-[#6366F1] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xl font-bold text-white"
              >
                LoanAI
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-[#1B4FBB]/20 text-white shadow-[0_0_20px_rgba(27,79,187,0.2)]" 
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1 h-8 bg-[#1B4FBB] rounded-r-full"
                  transition={{ type: "spring", bounce: 0.2 }}
                />
              )}
              <link.icon className={cn(
                "w-5 h-5 flex-shrink-0",
                isActive && "text-[#6366F1]"
              )} />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-medium"
                  >
                    {link.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}

        {/* AI Copilot */}
        <div className="pt-4 mt-4 border-t border-white/10">
          <Link
            href="/copilot"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20 text-white hover:from-[#6366F1]/30 hover:to-[#8B5CF6]/30 transition-all"
          >
            <Bot className="w-5 h-5 text-[#8B5CF6]" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-medium"
                >
                  AI Copilot
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </nav>

      {/* Bottom links */}
      <div className="p-4 border-t border-white/10 space-y-2">
        {bottomLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
          >
            <link.icon className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-sm"
                >
                  {link.label}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        ))}
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#1B4FBB] flex items-center justify-center text-white hover:bg-[#6366F1] transition-colors"
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.div>
      </button>
    </motion.aside>
  )
}
