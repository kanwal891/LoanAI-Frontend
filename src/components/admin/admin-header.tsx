"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Bell, Search, User, Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { getCurrentUser, clearToken, type UserRead, ApiError } from "@/lib/api"
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
  const router = useRouter()
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

  const handleLogout = () => {
    clearToken()
    router.replace("/login")
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#080b14]/80 px-6 backdrop-blur-xl"
    >

      {/* Right Side */}
      <div className="flex items-center gap-3 ml-auto">

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

            <DropdownMenuSeparator className="bg-white/10" />

            <DropdownMenuItem asChild>
              <Link href="/admin/settings">My Account</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/10" />

            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  )
}