"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getToken, getCurrentUser, clearToken, ApiError, type UserRead } from "@/lib/api"

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
  const [status, setStatus] = useState<"checking" | "allowed">("checking")
  const checkedRef = useRef(false)

  useEffect(() => {
    if (checkedRef.current) return
    checkedRef.current = true

    let cancelled = false

    async function check() {
      const token = getToken()
      if (!token) {
        router.replace(`${loginPath}?from=${encodeURIComponent(pathname)}`)
        return
      }

      let user: UserRead
      try {
        // Validates the token against the backend — catches expired/revoked
        // tokens, not just "is there a string in localStorage".
        user = await getCurrentUser()
      } catch (err) {
        clearToken()
        if (!cancelled) {
          router.replace(`${loginPath}?from=${encodeURIComponent(pathname)}`)
        }
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
  }, [router, pathname, requireRole, loginPath, fallbackPath])

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080B14]">
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}