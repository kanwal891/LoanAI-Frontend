"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDropzone } from "react-dropzone"
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
import { DeleteConfirmDialog } from "@/components/ui/delete-dialog" // adjust path if different
import {
  listBanks,
  listKnowledgeDocuments,
  uploadKnowledgeDocument,
  runExtraction,
  deleteKnowledgeDocument,
  downloadKnowledgeDocument,
  type BankRead,
  type DocumentCategory,
  type KnowledgeDocumentRead,
} from "@/lib/api"

const categories: { label: string; value: DocumentCategory }[] = [
  { label: "Bank Policy", value: "bank_policy" },
  { label: "Case Study", value: "case_study" },
]

interface UploadedFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  status: "uploading" | "processing" | "ready" | "failed"
  progress: number
}

const STATUS_LABEL: Record<UploadedFile["status"], string> = {
  uploading: "Uploading",
  processing: "Processing",
  ready: "Ready",
  failed: "Failed",
}

// -----------------------------------------------------------------------
// Badge helpers
// -----------------------------------------------------------------------
function DocStatusBadge({ status }: { status: KnowledgeDocumentRead["status"] }) {
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

function ExtractionBadge({ status }: { status: KnowledgeDocumentRead["extraction_status"] }) {
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

export default function KnowledgeBasePage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [formData, setFormData] = useState({
    documentName: "",
    bankId: "",
    category: "",
    effectiveDate: "",
    expiryDate: "",
    version: "1.0",
    description: "",
  })
  const [bankList, setBankList] = useState<BankRead[]>([])
  const [isLoadingBanks, setIsLoadingBanks] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Documents list
  const [documents, setDocuments] = useState<KnowledgeDocumentRead[]>([])
  const [isLoadingDocs, setIsLoadingDocs] = useState(true)
  const [docsError, setDocsError] = useState<string | null>(null)
  const [extractingId, setExtractingId] = useState<number | null>(null)

  // Delete confirmation dialog state
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeDocumentRead | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadDocuments = useCallback(async () => {
    setIsLoadingDocs(true)
    setDocsError(null)
    try {
      const docs = await listKnowledgeDocuments()
      setDocuments(docs)
    } catch (err) {
      setDocsError(err instanceof Error ? err.message : "Failed to load documents")
    } finally {
      setIsLoadingDocs(false)
    }
  }, [])

  useEffect(() => {
    const loadBanks = async () => {
      setIsLoadingBanks(true)
      try {
        const banks = await listBanks()
        setBankList(banks)
      } catch {
        // bank load errors surface via the empty-state in the select below
      } finally {
        setIsLoadingBanks(false)
      }
    }
    loadBanks()
    loadDocuments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadDocuments])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading" as const,
      progress: 0,
    }))
    setFiles((prev) => [...prev, ...newFiles])
    newFiles.forEach((file) => simulateUpload(file.id))
  }, [])

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/plain": [".txt"],
    },
  })

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id))

  const activeBanks = bankList.filter((bank) => bank.status === "active")

  // Documents still needing extraction (pending or previously failed).
  const needsExtractionDocuments = documents.filter(
    (doc) => doc.extraction_status === "pending" || doc.extraction_status === "failed"
  )

  // Documents that have AI results to view (extracted or already reviewed/approved).
  const hasResultsDocuments = documents.filter(
    (doc) => doc.extraction_status === "extracted" || doc.extraction_status === "reviewed"
  )

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const handleSubmit = async (status: "draft" | "active") => {
    const selectedFile = files[0]?.file
    setSubmitError(null)

    if (!selectedFile) return setSubmitError("Please upload a document file before submitting.")
    if (!formData.documentName.trim()) return setSubmitError("Document name is required.")
    if (!formData.bankId) return setSubmitError("Please select a bank.")
    if (!formData.category) return setSubmitError("Please select a document category.")

    setIsSubmitting(true)
    try {
      await uploadKnowledgeDocument({
        document_name: formData.documentName,
        bank_id: Number(formData.bankId),
        category: formData.category as DocumentCategory,
        version: formData.version,
        effective_date: formData.effectiveDate || undefined,
        expiry_date: formData.expiryDate || undefined,
        description: formData.description || undefined,
        status,
        file: selectedFile,
      })
      setFiles([])
      setFormData({
        documentName: "",
        bankId: "",
        category: "",
        effectiveDate: "",
        expiryDate: "",
        version: "1.0",
        description: "",
      })
      loadDocuments()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to upload document.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExtract = async (doc: KnowledgeDocumentRead) => {
    setExtractingId(doc.id)
    try {
      const updated = await runExtraction(doc.id)
      setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
    } catch (err) {
      setDocsError(err instanceof Error ? err.message : "Extraction failed")
    } finally {
      setExtractingId(null)
    }
  }

  const openDeleteDialog = (doc: KnowledgeDocumentRead) => setDeleteTarget(doc)

  const closeDeleteDialog = () => {
    if (isDeleting) return
    setDeleteTarget(null)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    setDocsError(null)
    try {
      await deleteKnowledgeDocument(deleteTarget.id)
      setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      console.error("Delete failed", err)
      setDocsError(err instanceof Error ? err.message : "Failed to delete document")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownload = async (doc: KnowledgeDocumentRead) => {
    setDocsError(null)
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
    } catch (err) {
      console.error("Download failed", err)
      setDocsError(err instanceof Error ? err.message : "Failed to download document")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white">Knowledge Repository</h1>
        <p className="text-muted-foreground">
          Upload bank policy documents and case studies, extract structured data with AI, and review before it powers loan comparisons
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Upload Section */}
        <GlassCard className="p-6">
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
                  {isDragActive ? "Drop files here" : "Drag & drop files here"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  or click to browse from your computer
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-white/10 px-3 py-1">PDF</span>
                <span className="rounded-full bg-white/10 px-3 py-1">DOCX</span>
                <span className="rounded-full bg-white/10 px-3 py-1">XLSX</span>
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
                <h3 className="text-sm font-medium text-muted-foreground">
                  Uploaded Files ({files.length})
                </h3>
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
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
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

        {/* Document Metadata Form */}
        <GlassCard className="p-6">
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
                onClick={() => handleSubmit("active")}
                disabled={isSubmitting}
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
                onClick={() => handleSubmit("draft")}
                disabled={isSubmitting}
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
      </div>

      {/* Documents needing extraction */}
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
            onClick={loadDocuments}
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
              const isDeletingThis = isDeleting && deleteTarget?.id === doc.id

              return (
                <div
                  key={doc.id}
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="rounded-lg bg-primary/20 p-2 shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
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

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      className="bg-linear-to-r from-primary to-indigo-500"
                      onClick={() => handleExtract(doc)}
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
                      onClick={() => handleDownload(doc)}
                      title="Download original file"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 px-2"
                      onClick={() => openDeleteDialog(doc)}
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
              )
            })}
          </div>
        )}
      </GlassCard>

      {/* Documents with AI results ready to view */}
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
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        title="Delete Document"
        description="Are you sure you want to delete"
        itemName={deleteTarget?.document_name}
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={closeDeleteDialog}
      />
    </div>
  )
}