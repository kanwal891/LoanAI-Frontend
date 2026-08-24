"use client"

import { useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDropzone, type FileRejection } from "react-dropzone"
import Link from "next/link"
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Save,
  Sparkles,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Download,
  Trash2,
  Eye,
  Info,
} from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  categories,
  ACCEPTED_FILE_TYPES,
  ACCEPTED_TYPES_LABEL,
  STATUS_LABEL,
  formatFileSize,
  type UploadedFile,
  type ToastState,
  type DocumentFormData,
} from "./types"
import type { BankRead, KnowledgeDocumentRead } from "@/lib/api"

// Define the shape explicitly to keep generics clean
type ToastStyle = {
  icon: React.ReactNode
  accent: string
  iconBg: string
  iconColor: string
  eyebrow: string
}

const TOAST_STYLES: Record<ToastState["variant"], ToastStyle> = {
  warning: {
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    accent: "bg-amber-400/70",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-300",
    eyebrow: "Heads up",
  },
  success: {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    accent: "bg-emerald-400/70",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-300",
    eyebrow: "Done",
  },
  error: {
    icon: <XCircle className="h-3.5 w-3.5" />,
    accent: "bg-red-400/70",
    iconBg: "bg-red-500/15",
    iconColor: "text-red-300",
    eyebrow: "Something went wrong",
  },
  info: {
    icon: <Info className="h-3.5 w-3.5" />,
    accent: "bg-cyan-400/70",
    iconBg: "bg-cyan-500/15",
    iconColor: "text-cyan-300",
    eyebrow: "In progress",
  },
}

const TOAST_CARD_BG: Record<ToastState["variant"], string> = {
  warning: "bg-amber-500/[0.07] border-amber-500/25",
  success: "bg-emerald-500/[0.07] border-emerald-500/25",
  error: "bg-red-500/[0.07] border-red-500/25",
  info: "bg-cyan-500/[0.07] border-cyan-500/25",
}

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastState[]
  onDismiss: (id: number) => void
}) {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.variant]
          const isError = toast.variant === "error"
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 24, scale: 0.96 }}
              animate={{
                opacity: 1,
                x: isError ? [24, -4, 4, -3, 0] : 0,
                scale: 1,
              }}
              exit={{ opacity: 0, x: 16, scale: 0.96 }}
              transition={{ type: "spring", damping: 24, stiffness: 300 }}
              className="pointer-events-auto w-full max-w-sm"
            >
              <div
                className={cn(
                  "relative flex items-start gap-3 rounded-xl border backdrop-blur-xl pl-4 pr-3 py-3.5 shadow-[0_10px_40px_rgba(0,0,0,0.45)]",
                  TOAST_CARD_BG[toast.variant]
                )}
              >
                {/* Accent bar */}
                <span className={cn("absolute left-0 top-0 h-full w-1 rounded-l-xl", style.accent)} />

                {/* Icon badge */}
                <span
                  className={cn(
                    "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full",
                    style.iconBg,
                    style.iconColor
                  )}
                >
                  {style.icon}
                </span>

                <div className="flex-1 pt-0.5 min-w-0">
                  <p className={cn("text-xs font-medium uppercase tracking-wide mb-0.5", style.iconColor, "opacity-70")}>
                    {style.eyebrow}
                  </p>
                  <p className="text-sm text-white/90 leading-relaxed">{toast.message}</p>

                  {toast.progress && (
                    <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full w-1/3 rounded-full bg-linear-to-r from-cyan-400 to-primary"
                        animate={{ x: ["-100%", "320%"] }}
                        transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onDismiss(toast.id)}
                  aria-label="Dismiss"
                  className="mt-0.5 flex-shrink-0 rounded-md p-1 text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export function DocStatusBadge({ status }: { status: KnowledgeDocumentRead["status"] }) {
  const isActive = status === "active"
  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-xs font-medium",
        isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-white/10 text-muted-foreground"
      )}
    >
      {isActive ? "Active" : "Draft"}
    </span>
  )
}

type ExtractionBadgeConfig = {
  label: string
  className: string
  icon: React.ReactNode
}

export function ExtractionBadge({ status }: { status: KnowledgeDocumentRead["extraction_status"] }) {
  const map: Record<string, ExtractionBadgeConfig> = {
    pending: {
      label: "Not extracted",
      className: "bg-white/10 text-muted-foreground",
      icon: <Clock className="h-3 w-3" />,
    },
    extracting: {
      label: "Extracting…",
      className: "bg-cyan-500/15 text-cyan-400",
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
    },
    extracted: {
      label: "Needs review",
      className: "bg-amber-500/15 text-amber-400",
      icon: <AlertTriangle className="h-3 w-3" />,
    },
    reviewed: {
      label: "Approved",
      className: "bg-emerald-500/15 text-emerald-400",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    failed: {
      label: "Failed",
      className: "bg-red-500/15 text-red-400",
      icon: <XCircle className="h-3 w-3" />,
    },
  }
  const cfg = map[status] ?? map.pending
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        cfg.className
      )}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

export function ExtractionProgressBar({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
      <motion.div
        className="h-full w-1/2 rounded-full bg-linear-to-r from-primary to-cyan-400"
        animate={{ x: ["-100%", "220%"] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )
}

interface UploadDropzoneProps {
  files: UploadedFile[]
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>
  showToast: (message: string, variant?: ToastState["variant"]) => void
}

export function UploadDropzone({ files, setFiles, showToast }: UploadDropzoneProps) {
  const simulateUpload = (fileId: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 20
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: progress >= 100 ? "ready" : progress >= 60 ? "processing" : "uploading",
                progress: Math.min(progress, 100),
              }
            : f
        )
      )
      if (progress >= 100) clearInterval(interval)
    }, 500)
  }
  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        showToast(`Only ${ACCEPTED_TYPES_LABEL} files are supported.`, "warning")
      }

      if (acceptedFiles.length === 0) return

      if (files.length > 0) {
        showToast(
          "Only one document can be uploaded at a time. Remove the current file first.",
          "warning"
        )
        return
      }
      const file = acceptedFiles[0]
      if (acceptedFiles.length > 1) {
        showToast("Only one file can be uploaded at a time — the rest were ignored.", "warning")
      }

      const newFile: UploadedFile = {
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "uploading",
        progress: 0,
      }
      setFiles([newFile])
      simulateUpload(newFile.id)
    },
    [files, showToast, setFiles]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    multiple: false,
  })

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id))

  return (
    <GlassCard className="p-6 h-full">
      <h2 className="mb-4 text-lg font-semibold text-white">Document Upload</h2>

      <div
        {...getRootProps()}
        className={cn(
          "relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all",
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-white/20 hover:border-primary/50 hover:bg-white/5"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-xl bg-linear-to-br from-primary to-indigo-500 p-4">
            <Upload className="h-8 w-8 text-white" />
          </div>
          <div>
            <p className="text-lg font-medium text-white">
              {isDragActive ? "Drop file here" : "Drag & drop a file here"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              or click to browse from your computer
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-white/10 px-3 py-1">PDF</span>
            <span className="rounded-full bg-white/10 px-3 py-1">DOC / DOCX</span>
            <span className="rounded-full bg-white/10 px-3 py-1">XLS / XLSX</span>
            <span className="rounded-full bg-white/10 px-3 py-1">TXT</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-3"
          >
            <h3 className="text-sm font-medium text-muted-foreground">Uploaded File</h3>
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/20 p-2">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === "ready" && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle className="h-4 w-4" />
                        {STATUS_LABEL.ready}
                      </span>
                    )}
                    {file.status === "failed" && (
                      <span className="flex items-center gap-1 text-xs text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        {STATUS_LABEL.failed}
                      </span>
                    )}
                    {(file.status === "uploading" || file.status === "processing") && (
                      <span className="flex items-center gap-1 text-xs text-cyan-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {STATUS_LABEL[file.status]}
                      </span>
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="rounded-lg p-1 text-muted-foreground hover:bg-white/10 hover:text-white"
                      title="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {(file.status === "uploading" || file.status === "processing") && (
                  <div className="mt-4">
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-linear-to-r from-primary to-cyan-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${file.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}
interface DocumentDetailsFormProps {
  formData: DocumentFormData
  setFormData: React.Dispatch<React.SetStateAction<DocumentFormData>>
  bankList: BankRead[]
  isLoadingBanks: boolean
  submitError: string | null
  isSubmitting: boolean
  hasFile: boolean
  onSubmit: (status: "draft" | "active") => void
}

export function DocumentDetailsForm({
  formData,
  setFormData,
  bankList,
  isLoadingBanks,
  submitError,
  isSubmitting,
  hasFile,
  onSubmit,
}: DocumentDetailsFormProps) {
  const activeBanks = bankList.filter((bank) => bank.status === "active")
  const submitDisabled = isSubmitting || !hasFile

  return (
    <GlassCard className="p-6 h-full">
      <h2 className="mb-4 text-lg font-semibold text-white">Document Details</h2>

      <form className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="documentName">Document Name</Label>
            <Input
              id="documentName"
              placeholder="Enter document name"
              value={formData.documentName}
              onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
              className="border-white/10 bg-white/5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Select
              value={formData.bankId || undefined}
              onValueChange={(value) => setFormData({ ...formData, bankId: value })}
            >
              <SelectTrigger className="border-white/10 bg-white/5">
                <SelectValue placeholder={isLoadingBanks ? "Loading banks..." : "Select bank"} />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#0a0f1a]">
                {isLoadingBanks ? (
                  <SelectItem value="loading" disabled>
                    Loading banks...
                  </SelectItem>
                ) : activeBanks.length > 0 ? (
                  activeBanks.map((bank) => (
                    <SelectItem key={bank.id} value={String(bank.id)}>
                      {bank.bank_name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-active" disabled>
                    No active banks available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="border-white/10 bg-white/5">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#0a0f1a]">
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">Version Number</Label>
            <Input
              id="version"
              placeholder="1.0"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              className="border-white/10 bg-white/5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="effectiveDate">Effective Date</Label>
            <Input
              id="effectiveDate"
              type="date"
              value={formData.effectiveDate}
              onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
              className="border-white/10 bg-white/5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="border-white/10 bg-white/5"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter document description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="min-h-24 border-white/10 bg-white/5"
          />
        </div>

        {submitError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {submitError}
          </div>
        )}

        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
          <Button
            type="button"
            className="flex-1 bg-linear-to-r from-primary to-indigo-500"
            onClick={() => onSubmit("active")}
            disabled={submitDisabled}
            title={!hasFile ? "Upload a file before submitting" : undefined}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload Document
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-white/10 bg-white/5"
            onClick={() => onSubmit("draft")}
            disabled={submitDisabled}
            title={!hasFile ? "Upload a file before submitting" : undefined}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Draft
          </Button>
        </div>
      </form>
    </GlassCard>
  )
}
interface ExtractionQueueProps {
  documents: KnowledgeDocumentRead[]
  isLoadingDocs: boolean
  docsError: string | null
  extractingId: number | null
  isDeleting: boolean
  deleteTargetId: number | null
  onRefresh: () => void
  onExtract: (doc: KnowledgeDocumentRead) => void
  onDownload: (doc: KnowledgeDocumentRead) => void
  onDeleteRequest: (doc: KnowledgeDocumentRead) => void
}

export function ExtractionQueue({
  documents,
  isLoadingDocs,
  docsError,
  extractingId,
  isDeleting,
  deleteTargetId,
  onRefresh,
  onExtract,
  onDownload,
  onDeleteRequest,
}: ExtractionQueueProps) {
  const needsExtractionDocuments = documents.filter(
    (doc) => doc.extraction_status === "pending" || doc.extraction_status === "failed"
  )

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Documents needing extraction</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Extract structured data with AI, then view the results and approve or reject
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-white/10 bg-white/5"
          onClick={onRefresh}
          disabled={isLoadingDocs}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isLoadingDocs && "animate-spin")} />
        </Button>
      </div>

      {docsError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {docsError}
        </div>
      )}

      {isLoadingDocs ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading documents...
        </div>
      ) : needsExtractionDocuments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Nothing pending — every uploaded document has been extracted.
        </p>
      ) : (
        <div className="space-y-3">
          {needsExtractionDocuments.map((doc) => {
            const isExtracting = extractingId === doc.id || doc.extraction_status === "extracting"
            const isDeletingThis = isDeleting && deleteTargetId === doc.id

            return (
              <div
                key={doc.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="rounded-lg bg-primary/20 p-2 shrink-0">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{doc.document_name}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {doc.bank?.bank_name ?? `Bank #${doc.bank_id}`}
                      </span>
                      <span>{doc.category === "bank_policy" ? "Bank Policy" : "Case Study"}</span>
                      <span>v{doc.version}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <DocStatusBadge status={doc.status} />
                      <ExtractionBadge status={doc.extraction_status} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <ExtractionProgressBar active={isExtracting} />
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="bg-linear-to-r from-primary to-indigo-500"
                      onClick={() => onExtract(doc)}
                      disabled={isExtracting}
                    >
                      {isExtracting ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      {doc.extraction_status === "failed" ? "Retry Extract" : "Extract"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-white/10 bg-white/5 px-2"
                      onClick={() => onDownload(doc)}
                      title="Download original file"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 px-2"
                      onClick={() => onDeleteRequest(doc)}
                      disabled={isDeletingThis}
                      title="Delete document"
                    >
                      {isDeletingThis ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </GlassCard>
  )
}
interface ExtractionResultsProps {
  documents: KnowledgeDocumentRead[]
}

export function ExtractionResults({ documents }: ExtractionResultsProps) {
  const hasResultsDocuments = documents.filter(
    (doc) => doc.extraction_status === "extracted" || doc.extraction_status === "reviewed"
  )

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">AI Extraction Results</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review what the AI extracted, edit if needed, and approve or reject before it powers loan comparisons
          </p>
        </div>
      </div>

      {hasResultsDocuments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          No AI results yet — extract a document above to see results here.
        </p>
      ) : (
        <div className="space-y-3">
          {hasResultsDocuments.map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="rounded-lg bg-primary/20 p-2 shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">{doc.document_name}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {doc.bank?.bank_name ?? `Bank #${doc.bank_id}`}
                    </span>
                    <span>{doc.category === "bank_policy" ? "Bank Policy" : "Case Study"}</span>
                  </div>
                  <div className="mt-2">
                    <ExtractionBadge status={doc.extraction_status} />
                  </div>
                </div>
              </div>

              <Link href={`/admin/knowledge-base/${doc.id}/review`} className="shrink-0">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-white/10 bg-white/5 w-full sm:w-auto"
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  {doc.extraction_status === "reviewed" ? "View AI Results" : "Review AI Results"}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </GlassCard>
  )
}