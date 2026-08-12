"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Loader2,
  Save,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Building2,
  FileText,
  Calendar,
  Download,
  Sparkles,
} from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { PolicyDataEditor } from "@/components/knowledge/policy-data-editor"
import {
  getKnowledgeDocument,
  getExtractionResult,
  reviewExtraction,
  updatePolicyCard,
  downloadKnowledgeDocument,
  type KnowledgeDocumentRead,
  type ExtractionResultRead,
} from "@/lib/api"

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
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-3" />
        Loading extraction results...
      </div>
    )
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
    <div className="space-y-6">
      {/* Back link + header */}
      <div>
        <Link
          href="/admin/knowledge-base"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-4"
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
            <p className="text-muted-foreground mt-1">
              Review what the AI extracted from this document, edit if needed, then approve or reject
            </p>
          </div>
          {isReviewed && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-500/15 text-emerald-400 w-fit">
              <CheckCircle2 className="h-4 w-4" />
              Approved
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left: document metadata sidebar */}
        <GlassCard className="p-6 h-fit lg:sticky lg:top-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="rounded-xl bg-primary/20 p-3 shrink-0">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-white truncate">{doc.document_name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {doc.original_filename}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-t border-white/10">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Bank
              </span>
              <span className="text-white font-medium">
                {doc.bank?.bank_name ?? `#${doc.bank_id}`}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-white/10">
              <span className="text-muted-foreground">Category</span>
              <span className="text-white font-medium">
                {doc.category === "bank_policy" ? "Bank Policy" : "Case Study"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-white/10">
              <span className="text-muted-foreground">Version</span>
              <span className="text-white font-medium">v{doc.version}</span>
            </div>
            {doc.effective_date && (
              <div className="flex items-center justify-between py-2 border-t border-white/10">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Effective
                </span>
                <span className="text-white font-medium">{doc.effective_date}</span>
              </div>
            )}
            {doc.expiry_date && (
              <div className="flex items-center justify-between py-2 border-t border-white/10">
                <span className="text-muted-foreground">Expires</span>
                <span className="text-white font-medium">{doc.expiry_date}</span>
              </div>
            )}
            {doc.description && (
              <div className="py-2 border-t border-white/10">
                <span className="text-muted-foreground block mb-1">Description</span>
                <p className="text-white text-sm leading-relaxed">{doc.description}</p>
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-4 border-white/10 bg-white/5"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Original File
          </Button>
        </GlassCard>

        {/* Right: extracted data + review actions */}
        <div className="space-y-6">
          {result.extraction_status === "failed" && result.extraction_error && (
            <GlassCard className="p-4">
              <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                Extraction failed: {result.extraction_error}
              </div>
            </GlassCard>
          )}

          <GlassCard className="p-6">
            {doc.category === "bank_policy" ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base">Extracted Policy Data</Label>
                  {!isReviewed && (
                    <span className="text-xs text-muted-foreground">Editable — fix anything the AI got wrong</span>
                  )}
                </div>
                <PolicyDataEditor
                  data={result.policy_card?.extracted_json ?? {}}
                  readOnly={isReviewed}
                  onSave={handleSavePolicyData}
                />
              </>
            ) : (
              <>
                <Label className="text-base mb-3 block">
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

          {/* Review actions */}
          {!isReviewed && (
            <GlassCard className="p-6">
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
                    className="bg-linear-to-r from-emerald-500 to-emerald-600"
                    onClick={() => handleReview("approve")}
                    disabled={isReviewing !== null}
                  >
                    {isReviewing === "approve" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Approve & Publish to Comparison
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Label htmlFor="rejectReason" className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    Reason for rejection (optional)
                  </Label>
                  <Textarea
                    id="rejectReason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="border-white/10 bg-white/5 min-h-20"
                    placeholder="e.g. FOIR figure looks incorrect, re-check page 3"
                  />
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/10 bg-white/5"
                      onClick={() => setShowRejectInput(false)}
                      disabled={isReviewing !== null}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10"
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
    </div>
  )
}