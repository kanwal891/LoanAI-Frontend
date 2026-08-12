"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Bell, Search, User, Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { getCurrentUser, type UserRead, ApiError } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AdminHeader() {
  const [user, setUser] = useState<UserRead | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoadingUser(true)
    setUserError(null)
    getCurrentUser()
      .then((u) => {
        if (!mounted) return
        setUser(u)
      })
      .catch((err) => {
        if (!mounted) return
        if (err instanceof ApiError) setUserError(err.message)
        else setUserError(String(err))
      })
      .finally(() => mounted && setLoadingUser(false))

    return () => {
      mounted = false
    }
  }, [])
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#080b14]/80 px-6 backdrop-blur-xl"
    >
      {/* Search */}
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search documents, policies..."
          className="h-10 w-full border-white/10 bg-white/5 pl-10 text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-muted-foreground sm:inline">
          ⌘K
        </kbd>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
       
        {/* User Menu */}
<DropdownMenu>
      <DropdownMenuTrigger asChild>
    <Button
      variant="ghost"
      className="flex items-center gap-2 px-2 text-muted-foreground hover:text-white"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-primary to-indigo-500">
        <User className="h-4 w-4 text-white" />
      </div>

      <div className="hidden text-left sm:block">
        <p className="text-sm font-medium text-white">{loadingUser ? "Loading..." : user?.username ?? "admin"}</p>
        {userError ? (
          <p className="text-xs text-rose-400 mt-1">{userError}</p>
        ) : null}
      </div>
    </Button>
  </DropdownMenuTrigger>

  <DropdownMenuContent
    align="end"
    className="w-56 border-white/10 bg-[#0a0f1a]"
  >
    <DropdownMenuLabel>My Account</DropdownMenuLabel>

    <DropdownMenuSeparator className="bg-white/10" />

   

    <DropdownMenuItem asChild>
      <Link href="/admin/settings">Settings</Link>
    </DropdownMenuItem>

    <DropdownMenuSeparator className="bg-white/10" />

    <DropdownMenuItem
      asChild
      className="text-destructive focus:text-destructive"
    >
      <Link href="/">Logout</Link>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
      </div>
    </motion.header>
  )
}
