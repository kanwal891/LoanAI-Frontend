"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  getToken,
  getCurrentUser,
  consumeCachedUser,
  clearToken,
  getTokenExpiryMs,
  onUnauthorized,
  ApiError,
  type UserRead,
} from "@/lib/api"
import { PageLoader } from "@/components/loading" // adjust to your actual loaders path

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

  // Once we've shown "allowed" for the first time, subsequent client-side
  // navigations (pathname changes) re-validate the token/role silently in
  // the background instead of flipping back to "checking" — that used to
  // replace `children` with the full-page loader on every route change,
  // which unmounted anything rendered inside children (e.g. the sidebar).
  const hasVerifiedOnceRef = useRef(false)

  const redirectToLoginRef = useRef(() => {
    router.replace(`${loginPath}?from=${encodeURIComponent(pathname)}`)
  })
  redirectToLoginRef.current = () => {
    router.replace(`${loginPath}?from=${encodeURIComponent(pathname)}`)
  }

  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      redirectToLoginRef.current()
    })
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const token = getToken()
    if (!token) return

    const expiryMs = getTokenExpiryMs(token)
    if (expiryMs === null) return

    const MAX_TIMEOUT_MS = 24 * 24 * 60 * 60 * 1000
    const msUntilExpiry = expiryMs - Date.now()

    if (msUntilExpiry <= 0) {
      redirectToLoginRef.current()
      return
    }

    const delay = Math.min(msUntilExpiry, MAX_TIMEOUT_MS)
    const timer = setTimeout(() => {
      if (msUntilExpiry <= MAX_TIMEOUT_MS) {
        clearToken()
        redirectToLoginRef.current()
      }
    }, delay)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, status])

  useEffect(() => {
    let cancelled = false

    // Only show the full-page "checking" state the first time this guard
    // verifies a session. On later pathname changes within the same
    // mounted layout, we still re-verify (below) but don't blank out
    // children while doing so.
    if (!hasVerifiedOnceRef.current) {
      setStatus("checking")
    }

    async function check() {
      const token = getToken()
      if (!token) {
        router.replace(`${loginPath}?from=${encodeURIComponent(pathname)}`)
        return
      }

      const expiryMs = getTokenExpiryMs(token)
      if (expiryMs !== null && expiryMs <= Date.now()) {
        clearToken()
        router.replace(`${loginPath}?from=${encodeURIComponent(pathname)}`)
        return
      }

      const cached = consumeCachedUser()
      if (cached) {
        if (requireRole && cached.role !== requireRole) {
          if (!cancelled) router.replace(fallbackPath)
          return
        }
        if (!cancelled) {
          hasVerifiedOnceRef.current = true
          setStatus("allowed")
        }
        return
      }

      let user: UserRead
      try {
        user = await getCurrentUser()
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 0) {
          // Only surface the "couldn't reach server" screen on the initial
          // check — a transient blip on a later background re-check
          // shouldn't kick the user out of the page they're already on.
          if (!hasVerifiedOnceRef.current) setStatus("error")
          return
        }
        return
      }

      if (requireRole && user.role !== requireRole) {
        if (!cancelled) router.replace(fallbackPath)
        return
      }

      if (!cancelled) {
        hasVerifiedOnceRef.current = true
        setStatus("allowed")
      }
    }

    check()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, pathname, requireRole, loginPath, fallbackPath, retryCount])

  if (status === "checking") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <PageLoader label="Checking your session…" />
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[60vh] px-6 text-center">
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