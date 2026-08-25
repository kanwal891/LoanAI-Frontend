"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Building2,
  FileText,
  Calendar,
  Download,
  Sparkles,
  Tag,
  Layers,
  X,
} from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PolicyDataEditor } from "@/components/knowledge/policy-data-editor"
import { SectionLoader } from "@/components/loading" // adjust path to wherever you saved loading.tsx
import {
  getKnowledgeDocument,
  getExtractionResult,
  reviewExtraction,
  updatePolicyCard,
  downloadKnowledgeDocument,
  type KnowledgeDocumentRead,
  type ExtractionResultRead,
} from "@/lib/api"

function ApproveConfirmDialog({
  open,
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-y-0 left-64 right-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-lg px-4"
          onClick={() => !loading && onCancel()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-[calc(100%-2rem)] max-w-lg rounded-3xl border border-white/10 bg-[#0a0f1a]/95 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl"
          >
            <button
              onClick={onCancel}
              disabled={loading}
              className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-white">
              Approve this extraction?
            </h3>

            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              This locks the extracted data and saves it as the active policy. You won&apos;t be able to
              edit it afterward — make sure any pending changes are saved first.
            </p>

            <div className="mt-6 flex flex-row justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() => !loading && onCancel()}
              >
                Cancel
              </Button>

              <Button
                size="sm"
                disabled={loading}
                onClick={onConfirm}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Approving
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Yes, Approve
                  </span>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function ExtractionReviewPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = Number(params.id)

  const [doc, setDoc] = useState<KnowledgeDocumentRead | null>(null)
  const [result, setResult] = useState<ExtractionResultRead | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [isReviewing, setIsReviewing] = useState<"approve" | "reject" | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // Tracks unsaved edits in PolicyDataEditor so Approve can be disabled
  // until changes are explicitly saved via its own Save Changes button.
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false)

  // Approve now goes through an explicit confirm step before it fires,
  // since approving is final and locks the record afterward.
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)

  useEffect(() => {
    if (!documentId) return
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const [docData, extractionData] = await Promise.all([
          getKnowledgeDocument(documentId),
          getExtractionResult(documentId),
        ])
        if (cancelled) return
        setDoc(docData)
        setResult(extractionData)
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Failed to load extraction")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [documentId])

  const handleSavePolicyData = async (updatedJson: Record<string, any>) => {
    setActionError(null)
    const updatedCard = await updatePolicyCard(documentId, updatedJson)
    setResult((prev) => (prev ? { ...prev, policy_card: updatedCard } : prev))
  }

  const handleReview = async (action: "approve" | "reject") => {
    setActionError(null)
    setIsReviewing(action)
    try {
      const updatedDoc = await reviewExtraction(
        documentId,
        action,
        action === "reject" ? rejectReason : undefined
      )
      setDoc(updatedDoc)
      if (action === "approve") {
        setShowApproveConfirm(false)
        router.push("/admin/knowledge-base")
      } else {
        setShowRejectInput(false)
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : `Failed to ${action}`)
    } finally {
      setIsReviewing(null)
    }
  }

  const handleDownload = async () => {
    if (!doc) return
    try {
      const blob = await downloadKnowledgeDocument(doc.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = doc.original_filename || doc.document_name
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      // non-critical, silently ignore
    }
  }

  if (isLoading) {
    return <SectionLoader icon={Sparkles} label="Loading extraction results…" />
  }

  if (loadError || !doc || !result) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/knowledge-base"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Knowledge Repository
        </Link>
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {loadError ?? "Document not found"}
          </div>
        </GlassCard>
      </div>
    )
  }

  const isReviewed = doc.extraction_status === "reviewed"

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
      <ApproveConfirmDialog
        open={showApproveConfirm}
        loading={isReviewing === "approve"}
        onConfirm={() => handleReview("approve")}
        onCancel={() => setShowApproveConfirm(false)}
      />

      {/* Top Header & Navigation */}
      <div>
        <Link
          href="/admin/knowledge-base"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Knowledge Repository
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Extraction Results
            </h1>
            <p className="text-muted-foreground text-xs mt-1">
              Review what the AI extracted from this document, edit if needed, then approve or reject
            </p>
          </div>
          {isReviewed && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 w-fit">
              <CheckCircle2 className="h-4 w-4" />
              Approved
            </span>
          )}
        </div>
      </div>

      {/* HORIZONTAL TOP BANNER: Replaces the old left sidebar */}
      <GlassCard className="p-4 sm:p-5 border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Doc Title & Info */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/20 p-3 shrink-0">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-base leading-tight">{doc.document_name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {doc.original_filename}
              </p>
            </div>
          </div>

          {/* Metadata Chips / Inline Info */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-slate-200">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-400">Bank:</span>
              <span className="font-semibold text-white">{doc.bank?.bank_name ?? `#${doc.bank_id}`}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-slate-200">
              <Tag className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-400">Category:</span>
              <span className="font-semibold text-white">
                {doc.category === "bank_policy" ? "Bank Policy" : "Case Study"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-slate-200">
              <Layers className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-400">Version:</span>
              <span className="font-semibold text-white">v{doc.version}</span>
            </div>

            {doc.effective_date && (
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-slate-200">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-400">Effective:</span>
                <span className="font-semibold text-white">{doc.effective_date}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full sm:w-auto border-white/10 bg-white/5 hover:bg-white/10 text-xs text-white"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-3.5 w-3.5" />
              Download Original File
            </Button>
          </div>

        </div>
      </GlassCard>

      {/* FULL-WIDTH MAIN CONTENT AREA (JSON / Form / Review Editor) */}
      <div className="space-y-6 w-full">
        {result.extraction_status === "failed" && result.extraction_error && (
          <GlassCard className="p-4">
            <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              Extraction failed: {result.extraction_error}
            </div>
          </GlassCard>
        )}

        <GlassCard className="p-6 w-full">
          {doc.category === "bank_policy" ? (
            <>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                <Label className="text-base font-semibold text-white">Extracted Policy Data</Label>
                {!isReviewed && (
                  <span className="text-xs text-muted-foreground">Editable — fix anything the AI got wrong</span>
                )}
              </div>
              <PolicyDataEditor
                data={result.policy_card?.extracted_json ?? {}}
                readOnly={isReviewed}
                onSave={handleSavePolicyData}
                onDirtyChange={setHasUnsavedEdits}
              />
            </>
          ) : (
            <>
              <Label className="text-base mb-3 block text-white font-semibold">
                Extracted Case Records ({result.case_records.length})
              </Label>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {result.case_records.map((rec) => (
                  <pre
                    key={rec.id}
                    className="rounded-lg border border-white/10 bg-white/5 p-4 text-xs text-muted-foreground overflow-x-auto"
                  >
                    {JSON.stringify(rec.extracted_json, null, 2)}
                  </pre>
                ))}
              </div>
            </>
          )}
        </GlassCard>

        {actionError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {actionError}
          </div>
        )}

        {/* BOTTOM APPROVAL / REJECTION ACTIONS BAR */}
        {!isReviewed && (
          <GlassCard className="p-4 sm:p-6">
            {!showRejectInput ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10"
                  onClick={() => setShowRejectInput(true)}
                  disabled={isReviewing !== null}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  type="button"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                  onClick={() => setShowApproveConfirm(true)}
                  disabled={isReviewing !== null || hasUnsavedEdits}
                  title={hasUnsavedEdits ? "Save your changes before approving" : undefined}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve & Save Policy
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Label htmlFor="rejectReason" className="flex items-center gap-1.5 text-xs text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Reason for rejection (optional)
                </Label>
                <Textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="border-white/10 bg-white/5 text-xs min-h-20"
                  placeholder="e.g. FOIR figure looks incorrect, re-check page 3"
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/10 bg-white/5 text-xs"
                    onClick={() => setShowRejectInput(false)}
                    disabled={isReviewing !== null}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 text-xs"
                    onClick={() => handleReview("reject")}
                    disabled={isReviewing !== null}
                  >
                    {isReviewing === "reject" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Confirm Rejection
                  </Button>
                </div>
              </div>
            )}
          </GlassCard>
        )}
      </div>
    </div>
  )
}