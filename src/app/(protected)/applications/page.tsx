"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  RefreshCw,
  FileWarning,
  Inbox,
  FileText,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { GlassSidebar } from "@/components/glass-sidebar"
import { GlassCard } from "@/components/glass-card"
import { MagneticButton } from "@/components/magnetic-button"
import { Spinner, SectionLoader } from "@/components/loading"

// -----------------------------------------------------------------------
// Eligibility API — adjust the import path below if userAPI.ts lives
// somewhere else in your project.
// -----------------------------------------------------------------------
import {
  listApplications,
  getApplication,
  ApiError,
  type SavedApplicationSummary,
  type SavedApplicationDetail,
  type FreshLoanResponse,
  type BalanceTransferResponse,
} from "@/lib/userAPI"

// Must match the keys read by /apply's edit-prefill logic.
const EDIT_PAYLOAD_KEY = "eligibilityEditPayload"
const EDIT_APPLICATION_ID_KEY = "eligibilityEditApplicationId"

// Fixed number of applications shown per page.
const PAGE_SIZE = 7

/** Human label for the raw "fresh_loan" / "balance_transfer" case_type string. */
function caseTypeLabel(caseType: string): string {
  return caseType === "balance_transfer" ? "Balance Transfer" : "Fresh Loan"
}

function formatDate(value?: string | null): string {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
}

/** Status badge color — backend status values aren't a fixed enum, so this
 *  buckets by common keywords and falls back to a neutral style. */
function statusBadgeClass(status: string): string {
  const s = status.toLowerCase()
  if (["approved", "completed", "eligible", "success"].includes(s)) {
    return "bg-[#10B981]/20 text-[#10B981]"
  }
  if (["processing", "pending", "in_review", "review"].includes(s)) {
    return "bg-[#6366F1]/20 text-[#6366F1]"
  }
  if (["rejected", "failed", "ineligible", "declined"].includes(s)) {
    return "bg-[#FF6B35]/20 text-[#FF6B35]"
  }
  return "bg-white/10 text-muted-foreground"
}

function statusLabel(status: string): string {
  if (!status) return "Unknown"
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")
}

/**
 * Adapts a saved application's full detail into the same shape /results
 * already knows how to render, so we can reuse that page as the detail
 * view instead of building a second one.
 */
function detailToResultPayload(
  detail: SavedApplicationDetail
): FreshLoanResponse | BalanceTransferResponse {
  const base = {
    case_type: detail.case_type as "fresh_loan" | "balance_transfer",
    banks_evaluated: detail.banks_evaluated,
    application_id: detail.id,
    recommendations: detail.recommendations,
  }
  if (detail.case_type === "balance_transfer") {
    return {
      ...base,
      derived: detail.derived,
      results: detail.results as BalanceTransferResponse["results"],
    } as BalanceTransferResponse
  }
  return {
    ...base,
    results: detail.results as FreshLoanResponse["results"],
  } as FreshLoanResponse
}

/**
 * Fixed-size pager: always shows PAGE_SIZE rows per page (the last page
 * may show fewer), so the list height stays predictable.
 */
function Pagination({
  page,
  pageCount,
  onPageChange,
  totalItems,
}: {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  totalItems: number
}) {
  if (pageCount <= 1) return null

  const startItem = (page - 1) * PAGE_SIZE + 1
  const endItem = Math.min(page * PAGE_SIZE, totalItems)

  return (
    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
      <p className="text-xs text-muted-foreground">
        Showing {startItem}–{endItem} of {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-lg glass hover:bg-white/10 text-muted-foreground hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="min-w-[80px] text-center text-xs text-muted-foreground">
          Page {page} of {pageCount}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          className="p-2 rounded-lg glass hover:bg-white/10 text-muted-foreground hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function ApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<SavedApplicationSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [openingId, setOpeningId] = useState<number | null>(null)
  const [openError, setOpenError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editError, setEditError] = useState<string | null>(null)

  // Pagination state for the applications list.
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(applications.length / PAGE_SIZE))

  const fetchApplications = async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const rows = await listApplications()
      setApplications(rows)
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Failed to load applications.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  // Keep the current page in range whenever the list changes (refresh,
  // fewer rows returned, etc.) instead of landing on a blank page.
  useEffect(() => {
    setPage((prev) => Math.min(prev, pageCount))
  }, [pageCount])

  const pagedApplications = useMemo(
    () => applications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [applications, page]
  )

  const handleOpenApplication = async (id: number) => {
    setOpenError(null)
    setOpeningId(id)
    try {
      const detail = await getApplication(id)
      const resultPayload = detailToResultPayload(detail)
      sessionStorage.setItem("eligibilityResult", JSON.stringify(resultPayload))
      sessionStorage.setItem(
        "eligibilityResultKind",
        detail.case_type === "balance_transfer" ? "balance_transfer" : "fresh_loan"
      )
      sessionStorage.setItem("eligibilityApplicationId", String(detail.id))
      router.push("/results")
    } catch (err) {
      setOpenError(err instanceof ApiError ? err.message : "Failed to open this application.")
      setOpeningId(null)
    }
  }

  const handleEditApplication = async (id: number) => {
    setEditError(null)
    setEditingId(id)
    try {
      const detail = await getApplication(id)
      // Stash the raw form payload + id so /apply's edit-prefill picks it up
      // on the fast (sessionStorage) path — matches the keys read there.
      sessionStorage.setItem(EDIT_PAYLOAD_KEY, JSON.stringify(detail.payload))
      sessionStorage.setItem(EDIT_APPLICATION_ID_KEY, String(detail.id))
      router.push(`/apply?edit=${detail.id}`)
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : "Failed to open this application for editing.")
      setEditingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#080B14]">
      <GlassSidebar role="applicant" />

      <main className="ml-64 p-6 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl glass hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">My Applications</h1>
              <p className="text-muted-foreground">All your loan applications in one place</p>
            </div>
          </div>

          <button
            onClick={fetchApplications}
            disabled={isLoading}
            className="p-2 rounded-xl glass hover:bg-white/10 transition-colors disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-5 h-5 text-muted-foreground ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {openError && (
          <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            <FileWarning className="w-5 h-5 flex-shrink-0" />
            <span>{openError}</span>
          </div>
        )}

        {editError && (
          <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            <FileWarning className="w-5 h-5 flex-shrink-0" />
            <span>{editError}</span>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <GlassCard className="p-6">
            <SectionLoader icon={FileText} label="Loading your applications…" />
          </GlassCard>
        )}

        {/* Error state */}
        {!isLoading && loadError && (
          <GlassCard className="p-10 text-center">
            <FileWarning className="w-8 h-8 text-[#FF6B35] mx-auto mb-3" />
            <p className="text-white font-medium mb-1">Couldn't load your applications</p>
            <p className="text-sm text-muted-foreground mb-4">{loadError}</p>
            <MagneticButton variant="secondary" size="sm" onClick={fetchApplications}>
              Try Again
            </MagneticButton>
          </GlassCard>
        )}

        {/* Empty state */}
        {!isLoading && !loadError && applications.length === 0 && (
          <GlassCard className="p-10 text-center">
            <Inbox className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-white font-medium mb-1">No applications yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Submit a loan application to see your AI recommendations here.
            </p>
            <Link href="/apply">
              <MagneticButton variant="primary" size="sm">
                Start Application
              </MagneticButton>
            </Link>
          </GlassCard>
        )}

        {/* Applications List */}
        {!isLoading && !loadError && applications.length > 0 && (
          <GlassCard className="p-6">
            <div className="space-y-4">
              {pagedApplications.map((app, index) => {
                const isOpening = openingId === app.id
                const isEditing = editingId === app.id
                const isBusy = isOpening || isEditing
                const initial = (app.applicant_name?.trim()?.[0] ?? "A").toUpperCase()
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="w-full p-4 rounded-xl glass-card flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenApplication(app.id)}
                      disabled={isBusy}
                      className="flex items-center gap-4 flex-1 min-w-0 text-left disabled:opacity-60"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1B4FBB] to-[#6366F1] flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-white truncate">
                          {app.applicant_name?.trim() || `Application #${app.id}`}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {caseTypeLabel(app.case_type)} · {app.banks_evaluated} bank
                          {app.banks_evaluated === 1 ? "" : "s"} evaluated
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground">{formatDate(app.created_at)}</p>
                      </div>

                      {isOpening ? (
                        <Spinner size="sm" />
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadgeClass(app.status)}`}
                        >
                          {statusLabel(app.status)}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditApplication(app.id)
                        }}
                        disabled={isBusy}
                        aria-label="Edit application"
                        title="Edit application"
                        className="p-2 rounded-lg glass hover:bg-white/10 text-muted-foreground hover:text-white transition-colors disabled:opacity-50 flex-shrink-0"
                      >
                        {isEditing ? (
                          <Spinner size="sm" />
                        ) : (
                          <Pencil className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <Pagination
              page={page}
              pageCount={pageCount}
              onPageChange={setPage}
              totalItems={applications.length}
            />
          </GlassCard>
        )}
      </main>
    </div>
  )
}