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
import { PageLoader } from "@/components/loading" // adjust path to your loaders file

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

  // Redirect target is recomputed on every render from the current
  // pathname, so both the route-check effect and the unauthorized-event
  // listener below always send the user to a login URL that remembers
  // where they actually were, not wherever they happened to be when the
  // guard first mounted.
  const redirectToLoginRef = useRef(() => {
    router.replace(`${loginPath}?from=${encodeURIComponent(pathname)}`)
  })
  redirectToLoginRef.current = () => {
    router.replace(`${loginPath}?from=${encodeURIComponent(pathname)}`)
  }

  // Global session-expiry listener. This is what makes logout happen the
  // moment ANY API call anywhere in the app discovers a 401 — e.g. the
  // user clicks Delete on a document with a dead token, that call's own
  // catch block shows an error toast as before, but this listener (fired
  // from inside lib/api.ts's handleUnauthorized) redirects to /login in
  // the same tick, instead of leaving them stranded on the current page
  // until their next navigation re-triggers the route-check effect below.
  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      redirectToLoginRef.current()
    })
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Proactive expiry: decode the token's own `exp` claim (no network call)
  // and schedule a timer to log the user out at that exact moment, even
  // if they never trigger a request that would otherwise discover the
  // 401. Re-scheduled whenever the token itself changes (login/logout/
  // route change), and capped at ~24 days because setTimeout silently
  // overflows/fires immediately past the 32-bit signed int limit
  // (~24.8 days) — a token with a longer lifetime just gets re-checked
  // periodically instead of scheduled in one shot.
  useEffect(() => {
    const token = getToken()
    if (!token) return

    const expiryMs = getTokenExpiryMs(token)
    if (expiryMs === null) return // not a decodable JWT — nothing to schedule

    const MAX_TIMEOUT_MS = 24 * 24 * 60 * 60 * 1000 // ~24 days, safely under the int32 cap
    const msUntilExpiry = expiryMs - Date.now()

    if (msUntilExpiry <= 0) {
      redirectToLoginRef.current()
      return
    }

    const delay = Math.min(msUntilExpiry, MAX_TIMEOUT_MS)
    const timer = setTimeout(() => {
      if (msUntilExpiry <= MAX_TIMEOUT_MS) {
        // We've reached the real expiry moment.
        clearToken()
        redirectToLoginRef.current()
      }
      // Otherwise this was just a checkpoint before a very long-lived
      // token's real expiry — the effect re-runs on next render/route
      // change and reschedules from wherever we are now. In practice
      // access tokens are short-lived, so this branch rarely matters.
    }, delay)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, status])

  useEffect(() => {
    let cancelled = false
    setStatus("checking")

    async function check() {
      const token = getToken()
      if (!token) {
        router.replace(`${loginPath}?from=${encodeURIComponent(pathname)}`)
        return
      }

      // Even before hitting the network, catch a token that's already
      // expired by its own `exp` claim — avoids a doomed round-trip.
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
        // getCurrentUser() already called handleUnauthorized() internally,
        // which cleared the token and fired the onUnauthorized listener
        // above — that listener will redirect. Nothing further to do here
        // except stop showing the spinner.
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
        <PageLoader label="Checking your session…" />
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