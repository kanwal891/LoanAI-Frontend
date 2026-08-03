"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Database,
  FileText,
  GitBranch,
  Cog,
  LogOut,
  Brain,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"

const sidebarItems = [
  {
    title: "Main",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Knowledge Base", href: "/admin/knowledge-base", icon: Database },
      { name: "Documents", href: "/admin/documents", icon: FileText },
      { name: "Bank Management", href: "/admin/bank-management", icon: GitBranch },
      
    ],
  },

  {
    title: "System",
    items: [
      { name: "Settings", href: "/admin/settings", icon: Cog },
    ],
  },

]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-white/10 bg-[#0a0f1a]/95 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-primary to-indigo-500">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-semibold text-white">LoanAI</span>
              <span className="ml-1 text-xs text-muted-foreground">Admin</span>
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-primary to-indigo-500">
            <Brain className="h-5 w-5 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="h-[calc(100vh-8rem)] overflow-y-auto px-3 py-4">
        {sidebarItems.map((section) => (
          <div key={section.title} className="mb-6">
            {!collapsed && (
              <h3 className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary/20 text-white"
                          : "text-muted-foreground hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground group-hover:text-white"
                        )}
                      />
                      {!collapsed && <span>{item.name}</span>}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 h-8 w-1 rounded-r-full bg-primary"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-3">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-white/5 hover:text-white",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </Link>
      </div>
    </motion.aside>
  )
}
