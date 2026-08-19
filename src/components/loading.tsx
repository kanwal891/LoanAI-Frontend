"use client"

import type { ComponentType } from "react"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/glass-card"

// -----------------------------------------------------------------------
// Branded loading primitives for the applicant dashboard.
// Drop-in replacements for the ad-hoc `<Loader2 className="animate-spin" />`
// blocks used across /dashboard, /applications, and /profile.
//
// Usage:
//   {isLoading && <PageLoader label="Loading applications…" />}
//   {isLoading && <ApplicationListSkeleton rows={3} />}
//   {isLoading && <ProfileSkeleton />}
//   {isLoading && Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
// -----------------------------------------------------------------------

/** Base pulsing block. Compose these to match any layout's shape. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-white/[0.06]", className)} />
}

/** Small branded spinner — two-tone ring using the app's signature gradient colors. */
export function Spinner({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const dims = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" }[size]
  return (
    <div className={cn("relative", dims, className)}>
      <div className="absolute inset-0 rounded-full border-2 border-white/10" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#6366F1] border-r-[#1B4FBB] animate-spin" />
    </div>
  )
}

/** Centered spinner + optional label. For simple loading blocks inside a GlassCard. */
export function PageLoader({
  label,
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-12", className)}>
      <Spinner size="lg" />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  )
}

/**
 * The main "proper" loader for a page section — a pulsing brand-gradient
 * badge with a spinning ring around it, plus a status message underneath.
 * Use this wherever a page is waiting on its primary data
 * (e.g. "Loading your applications…", "Loading your profile…").
 */
export function SectionLoader({
  icon: Icon,
  label = "Loading…",
  className,
}: {
  icon?: ComponentType<{ className?: string }>
  label?: string
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-5 py-16", className)}>
      <div className="relative w-16 h-16">
        {/* pulsing brand badge */}
        <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-[#1B4FBB] to-[#6366F1] flex items-center justify-center animate-pulse">
          {Icon && <Icon className="w-5 h-5 text-white" />}
        </div>
        {/* spinning ring around the badge */}
        <div className="absolute inset-0 rounded-2xl border-2 border-white/10" />
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-[#6366F1] border-r-[#1B4FBB] animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

/** One skeleton row shaped like an applications-list item. */
export function ApplicationRowSkeleton() {
  return (
    <div className="w-full p-4 rounded-xl glass-card flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  )
}

/** Stack of application-row skeletons, for /applications and the dashboard list. */
export function ApplicationListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <ApplicationRowSkeleton key={i} />
      ))}
    </div>
  )
}

/** Skeleton shaped like /profile: avatar + name, then field rows. */
export function ProfileSkeleton() {
  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-52" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 border-t border-white/10 pt-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg bg-white/5 p-4">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

/** Skeleton shaped like a dashboard stat card (icon, small tag, big number, label). */
export function StatCardSkeleton() {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="h-3 w-8" />
      </div>
      <Skeleton className="h-7 w-16 mb-2" />
      <Skeleton className="h-3 w-24" />
    </GlassCard>
  )
}