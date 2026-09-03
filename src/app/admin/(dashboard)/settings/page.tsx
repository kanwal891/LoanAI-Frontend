"use client"

import { useEffect, useState } from "react"
import {
  User,
  Bell,
  BellOff,
} from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/loading" // adjust path to wherever Skeleton lives
import { getCurrentUser, type UserRead, ApiError } from "@/lib/api"

export default function SettingsPage() {
  const [section, setSection] = useState<"settings" | "admin">("settings")
  const [user, setUser] = useState<UserRead | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)

  // Email notifications toggle — tracked locally so the row's icon can
  // reflect enabled/disabled state, not just the switch's own color.
  const [emailNotifications, setEmailNotifications] = useState(true)

  useEffect(() => {
    let mounted = true

    setLoadingUser(true)
    setUserError(null)

    getCurrentUser()
      .then((currentUser) => {
        if (!mounted) return
        setUser(currentUser)
      })
      .catch((err) => {
        if (!mounted) return
        if (err instanceof ApiError) setUserError(err.message)
        else setUserError(String(err))
      })
      .finally(() => {
        if (!mounted) return
        setLoadingUser(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-muted-foreground">
          {section === "settings"
            ? "Manage your profile and notifications"
            : "Configure platform, AI, and administrative controls"}
        </p>
      </div>

      {section === "settings" && (
        <div className="space-y-6">
          {/* Profile — read-only, straight from the API, no editing */}
          <GlassCard className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-linear-to-br from-primary to-indigo-500 p-2">
                <User className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-semibold text-white">Profile</h2>
            </div>

            {loadingUser ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
              </div>
            ) : userError ? (
              <p className="text-sm text-rose-400">{userError}</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Username</p>
                  <p className="cursor-not-allowed rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white">
                    {user?.username || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="cursor-not-allowed rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white">
                    {user?.full_name || "—"}
                  </p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Email Address</p>
                  <p className="cursor-not-allowed rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white">
                    {user?.email || "—"}
                  </p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="cursor-not-allowed rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white">
                    {user?.role || "—"}
                  </p>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Notifications */}
          <GlassCard className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-linear-to-br from-amber-500 to-orange-500 p-2">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-semibold text-white">Notifications</h2>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
              <div className="flex items-center gap-3">
                {/* Icon swaps to a "disabled" variant (BellOff, muted color)
                    when the toggle is off, so the row's state is visible
                    at a glance without reading the switch color. */}
                {emailNotifications ? (
                  <Bell className="h-5 w-5 text-amber-400 shrink-0" />
                ) : (
                  <BellOff className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <div>
                  <p className="font-medium text-white">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    {emailNotifications
                      ? "Receive system alerts and updates by email."
                      : "Email alerts are turned off."}
                  </p>
                </div>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}