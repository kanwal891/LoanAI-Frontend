"use client"

import { useEffect, useState } from "react"
import { User, Mail, ShieldCheck, Loader2, FileWarning, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { GlassCard } from "@/components/glass-card"
import { GlassSidebar } from "@/components/glass-sidebar"

// -----------------------------------------------------------------------
// Same source as the rest of the app — adjust the import path below if
// api.ts lives somewhere else in your project.
// -----------------------------------------------------------------------
import { getCurrentUser, ApiError, type UserRead } from "@/lib/api"

export default function ProfilePage() {
  const [user, setUser] = useState<UserRead | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const data = await getCurrentUser()
        if (!cancelled) setUser(data)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof ApiError ? err.message : "Failed to load profile.")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const fields = user
    ? [
        { label: "Username", value: user.username, icon: User, gradient: "from-primary to-indigo-500" },
        { label: "Email Address", value: user.email, icon: Mail, gradient: "from-amber-500 to-orange-500" },
        { label: "Role", value: user.role, icon: ShieldCheck, gradient: "from-emerald-500 to-teal-500" },
      ]
    : []

  const initials = (user?.full_name || user?.username || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex min-h-screen bg-background">
      <GlassSidebar />

      <main className="ml-64 w-full p-6 transition-all duration-300">
        <div className="w-full space-y-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl glass hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Profile</h1>
              <p className="text-muted-foreground">Your account details</p>
            </div>
          </div>

          <GlassCard className="w-full p-6">
            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Error */}
            {!isLoading && loadError && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileWarning className="mb-3 h-8 w-8 text-[#FF6B35]" />
                <p className="mb-1 font-medium text-white">Couldn't load your profile</p>
                <p className="text-sm text-muted-foreground">{loadError}</p>
              </div>
            )}

            {/* Loaded */}
            {!isLoading && !loadError && user && (
              <>
                {/* Avatar + Name */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-500 text-xl font-semibold text-white">
                    {initials}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {user.full_name || user.username}
                    </h2>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                {/* Details — read-only, straight from the API */}
                <div className="grid grid-cols-1 gap-3 border-t border-white/10 pt-6">
                  {fields.map((field) => (
                    <div key={field.label} className="flex items-center gap-3 rounded-lg bg-white/5 p-4">
                      <div className={`shrink-0 rounded-lg bg-gradient-to-br p-2 ${field.gradient}`}>
                        <field.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">{field.label}</p>
                        <p className="font-medium text-white">{field.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </GlassCard>
        </div>
      </main>
    </div>
  )
}