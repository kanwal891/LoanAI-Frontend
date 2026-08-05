"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDropzone } from "react-dropzone"
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
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
  listBanks,
  uploadKnowledgeDocument,
  type BankRead,
  type DocumentCategory,
} from "@/lib/api"

const categories: { label: string; value: DocumentCategory }[] = [
  { label: "Bank Policy", value: "bank_policy" },
  { label: "Case Study", value: "case_study" },
]

const initialBanks: BankRead[] = []

interface UploadedFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  status: "uploading" | "processing" | "ready" | "failed"
  progress: number
}

// Plain-language status shown to the user — no processing/pipeline internals.
const STATUS_LABEL: Record<UploadedFile["status"], string> = {
  uploading: "Uploading",
  processing: "Processing",
  ready: "Ready",
  failed: "Failed",
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
  const [bankList, setBankList] = useState<BankRead[]>(initialBanks)
  const [isLoadingBanks, setIsLoadingBanks] = useState(true)
  const [bankLoadError, setBankLoadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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

    newFiles.forEach((file) => {
      simulateUpload(file.id)
    })
  }, [])

  // Simple progress simulation — upload, then a brief "processing" moment,
  // then the document is marked ready. No pipeline/stage detail is shown.
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

  useEffect(() => {
    const loadBanks = async () => {
      setIsLoadingBanks(true)
      setBankLoadError(null)

      try {
        const banks = await listBanks()
        setBankList(banks)
      } catch (err) {
        setBankLoadError(err instanceof Error ? err.message : "Failed to load banks")
      } finally {
        setIsLoadingBanks(false)
      }
    }

    loadBanks()
  }, [])

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleSubmit = async (status: "draft" | "active") => {
    const selectedFile = files[0]?.file
    setSubmitError(null)

    if (!selectedFile) {
      setSubmitError("Please upload a document file before submitting.")
      return
    }

    if (!formData.documentName.trim()) {
      setSubmitError("Document name is required.")
      return
    }

    if (!formData.bankId) {
      setSubmitError("Please select a bank.")
      return
    }

    if (!formData.category) {
      setSubmitError("Please select a document category.")
      return
    }

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
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to upload document.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const activeBanks = bankList.filter((bank) => bank.status === "active")

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white">Knowledge Repository</h1>
        <p className="text-muted-foreground">
          Upload and manage bank policy documents and case studies
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Upload Section */}
        <GlassCard className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Document Upload</h2>

          {/* Dropzone */}
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

          {/* Uploaded Files */}
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

                    {/* Progress bar only — no pipeline/stage detail shown */}
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
                  onChange={(e) =>
                    setFormData({ ...formData, documentName: e.target.value })
                  }
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
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, version: e.target.value })
                  }
                  className="border-white/10 bg-white/5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveDate">Effective Date</Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) =>
                    setFormData({ ...formData, effectiveDate: e.target.value })
                  }
                  className="border-white/10 bg-white/5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
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
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
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
    </div>
  )
}