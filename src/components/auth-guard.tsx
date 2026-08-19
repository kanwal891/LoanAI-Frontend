"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  getToken,
  getCurrentUser,
  consumeCachedUser,
  clearToken,
  ApiError,
  type UserRead,
} from "@/lib/api"

interface AuthGuardProps {
  children: React.ReactNode
  /** If set, only users with this role may view the page. Others get redirected. */
  requireRole?: string
  /** Where to send unauthenticated users. Defaults to /login. */
  loginPath?: string
  /** Where to send authenticated users who fail the role check. */
  fallbackPath?: string
}

export function AuthGuard({
  children,
  requireRole,
  loginPath = "/login",
  fallbackPath = "/dashboard",
}: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [status, setStatus] = useState<"checking" | "allowed" | "error">("checking")
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    // No "already checked" ref gate here on purpose. In dev, React Strict
    // Mode runs this effect's setup → cleanup → setup again. A ref that
    // blocks re-running after the first setup means the *second* (real)
    // setup never starts a check at all — the first one gets cancelled by
    // the cleanup and nothing replaces it, so `status` gets stuck on
    // "checking" forever. Relying only on the `cancelled` flag below is
    // the pattern that survives the double-invoke correctly: the first,
    // stale check's state updates get ignored, and the second run
    // performs a real, uncancelled check.
    let cancelled = false
    setStatus("checking")

    async function check() {
      const token = getToken()
      if (!token) {
        router.replace(`${loginPath}?from=${encodeURIComponent(pathname)}`)
        return
      }

      // If we just logged in, login() already verified this exact user
      // against the backend a moment ago — skip the redundant round-trip
      // instead of firing a second /auth/me call right on top of it.
      const cached = consumeCachedUser()
      if (cached) {
        if (requireRole && cached.role !== requireRole) {
          if (!cancelled) router.replace(fallbackPath)
          return
        }
        if (!cancelled) setStatus("allowed")
        return
      }

      let user: UserRead
      try {
        user = await getCurrentUser()
      } catch (err) {
        if (cancelled) return
        // A network/timeout error (status 0) means we couldn't reach the
        // server — the token might still be perfectly valid, so don't log
        // the user out over it. Show a retry instead of hanging forever.
        if (err instanceof ApiError && err.status === 0) {
          setStatus("error")
          return
        }
        // Anything else (401, etc.) means the session really is invalid.
        clearToken()
        router.replace(`${loginPath}?from=${encodeURIComponent(pathname)}`)
        return
      }

      if (requireRole && user.role !== requireRole) {
        if (!cancelled) router.replace(fallbackPath)
        return
      }

      if (!cancelled) setStatus("allowed")
    }

    check()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, pathname, requireRole, loginPath, fallbackPath, retryCount])

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080B14]">
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#080B14] px-6 text-center">
        <p className="text-white font-medium">Couldn't reach the server</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          This can happen if the server is waking up from idle. Try again in a few seconds.
        </p>
        <button
          onClick={() => setRetryCount((c) => c + 1)}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return <>{children}</>
}