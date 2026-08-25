// KnowledgeBasePage.tsx
"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { DeleteConfirmDialog } from "@/components/ui/delete-dialog"
import {
  listBanks,
  listKnowledgeDocuments,
  uploadKnowledgeDocument,
  runExtraction,
  deleteKnowledgeDocument,
  downloadKnowledgeDocument,
  ApiError,
  type BankRead,
  type DocumentCategory,
  type KnowledgeDocumentRead,
} from "@/lib/api"

import {
  initialDocumentFormData,
  type UploadedFile,
  type ToastState,
  type DocumentFormData,
} from "./types"
import {
  ToastStack,
  UploadDropzone,
  DocumentDetailsForm,
  ExtractionQueue,
  ExtractionResults,
} from "./Components"

function fileNameToDocumentName(filename: string): string {
  const lastDot = filename.lastIndexOf(".")
  if (lastDot <= 0) return filename
  return filename.slice(0, lastDot)
}

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "")
}

const BANK_NAME_STOPWORDS = new Set([
  "bank",
  "banks",
  "ltd",
  "limited",
  "pvt",
  "private",
  "inc",
  "incorporated",
  "corp",
  "corporation",
  "co",
  "company",
  "plc",
  "finance",
  "financial",
  "services",
  "policy",
  "loan",
  "loans",
])

function bankNameLooksMismatched(
  bankName: string,
  documentName: string,
  fileName: string
): boolean {
  const haystack = normalize(documentName) + " " + normalize(fileName)
  const words = bankName
    .split(/\s+/)
    .map((w) => normalize(w))
    .filter((w) => w.length > 2 && !BANK_NAME_STOPWORDS.has(w))

  if (words.length === 0) return false
  return !words.some((w) => haystack.includes(w))
}

export default function KnowledgeBasePage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [formData, setFormData] = useState<DocumentFormData>(initialDocumentFormData)
  const [bankList, setBankList] = useState<BankRead[]>([])
  const [isLoadingBanks, setIsLoadingBanks] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [formResetKey, setFormResetKey] = useState(0)

  // Tracks whether the user has been warned about a bank mismatch on the current form input
  const mismatchWarnedRef = useRef(false)

  // Toasts
  const [toasts, setToasts] = useState<ToastState[]>([])
  const showToast = useCallback(
    (
      message: string,
      variant: ToastState["variant"] = "warning",
      opts?: { progress?: boolean; persistent?: boolean; duration?: number }
    ) => {
      const id = Date.now() + Math.random()
      setToasts((prev) => [
        ...prev,
        { id, message, variant, progress: opts?.progress, persistent: opts?.persistent },
      ])
      if (!opts?.persistent) {
        const duration = opts?.duration ?? 6000
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }, duration)
      }
      return id
    },
    []
  )
  const dismissToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))

  // Documents list
  const [documents, setDocuments] = useState<KnowledgeDocumentRead[]>([])
  const [isLoadingDocs, setIsLoadingDocs] = useState(true)
  const [docsError, setDocsError] = useState<string | null>(null)
  const [extractingId, setExtractingId] = useState<number | null>(null)

  const isExtractionActive = extractingId !== null

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

  // Reset mismatch warning flag whenever user changes bankId or documentName
  useEffect(() => {
    mismatchWarnedRef.current = false
  }, [formData.bankId, formData.documentName])

  useEffect(() => {
    const leadFile = files[0]
    if (!leadFile) return
    setFormData((prev) =>
      prev.documentName.trim()
        ? prev
        : { ...prev, documentName: fileNameToDocumentName(leadFile.name) }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files[0]?.id])

  const prevFilesCountRef = useRef(0)
  useEffect(() => {
    const prevCount = prevFilesCountRef.current
    if (prevCount > 0 && files.length === 0) {
      setFormData(initialDocumentFormData)
      setFormResetKey((k) => k + 1)
      setSubmitError(null)
      mismatchWarnedRef.current = false
    }
    prevFilesCountRef.current = files.length
  }, [files.length])

  const performUpload = async (status: "draft" | "active") => {
    const selectedFile = files[0]?.file
    if (!selectedFile) return

    const documentName = formData.documentName.trim()
    const version = formData.version.trim()

    setIsSubmitting(true)
    try {
      await uploadKnowledgeDocument({
        document_name: documentName,
        bank_id: Number(formData.bankId),
        category: formData.category as DocumentCategory,
        version,
        effective_date: formData.effectiveDate || undefined,
        expiry_date: formData.expiryDate || undefined,
        description: formData.description.trim() || undefined,
        status,
        file: selectedFile,
      })
      setFiles([])
      setFormData(initialDocumentFormData)
      setFormResetKey((k) => k + 1)
      mismatchWarnedRef.current = false
      showToast("Document uploaded successfully.", "success")
      loadDocuments()
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        showToast(err.message, "warning")
      } else {
        setSubmitError(err instanceof Error ? err.message : "Failed to upload document.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (status: "draft" | "active") => {
    const selectedFile = files[0]?.file
    setSubmitError(null)

    if (!selectedFile) return setSubmitError("Please upload a document file before submitting.")

    const documentName = formData.documentName.trim()
    const version = formData.version.trim()

    if (!documentName) return setSubmitError("Document name is required.")
    if (!formData.bankId) return setSubmitError("Please select a bank.")
    if (!formData.category) return setSubmitError("Please select a document category.")
    if (!version) return setSubmitError("Version is required.")
    if (
      formData.effectiveDate &&
      formData.expiryDate &&
      formData.effectiveDate > formData.expiryDate
    ) {
      return setSubmitError("Effective date cannot be after the expiry date.")
    }

    const alreadyExists = documents.some(
      (d) =>
        d.bank_id === Number(formData.bankId) &&
        d.category === formData.category &&
        d.status === "active" &&
        d.original_filename.toLowerCase() === selectedFile.name.toLowerCase() &&
        d.file_size === selectedFile.size
    )
    if (alreadyExists) {
      showToast(
        "This exact file is already uploaded for this bank and category.",
        "warning"
      )
      return
    }

    // Check for mismatch
    const selectedBank = bankList.find((b) => b.id === Number(formData.bankId))
    const isMismatched =
      selectedBank &&
      bankNameLooksMismatched(selectedBank.bank_name, documentName, selectedFile.name)

    // First click with mismatch: warn and stop
    if (isMismatched && !mismatchWarnedRef.current) {
      mismatchWarnedRef.current = true
      showToast(
        "Check your bank — document name doesn't match the selected bank. Click upload again to proceed anyway.",
        "warning"
      )
      return
    }

    // Second click (or no mismatch): proceed directly
    await performUpload(status)
  }

  const handleExtract = async (doc: KnowledgeDocumentRead) => {
    setExtractingId(doc.id)
    const progressToastId = showToast(
      "Extraction started — this can take a few minutes. We'll update you here once it's done.",
      "info",
      { progress: true, persistent: true }
    )
    try {
      await runExtraction(doc.id)
      await loadDocuments()
      dismissToast(progressToastId)
      showToast("Extraction complete — results are ready to review.", "success")
    } catch (err) {
      dismissToast(progressToastId)
      const message = err instanceof Error ? err.message : "Extraction failed"
      setDocsError(message)
      showToast(message, "error")
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
      const message = err instanceof Error ? err.message : "Failed to delete document"
      console.error("Delete failed", err)
      setDocsError(message)
      showToast(message, "error")
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
      const message = err instanceof Error ? err.message : "Failed to download document"
      console.error("Download failed", err)
      setDocsError(message)
      showToast(message, "error")
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 items-stretch">
        <UploadDropzone
          files={files}
          setFiles={setFiles}
          showToast={showToast}
        />
        <DocumentDetailsForm
          formData={formData}
          setFormData={setFormData}
          bankList={bankList}
          isLoadingBanks={isLoadingBanks}
          submitError={submitError}
          isSubmitting={isSubmitting}
          hasFile={files.length > 0}
          onSubmit={handleSubmit}
          formResetKey={formResetKey}
        />
      </div>

      <ExtractionQueue
        documents={documents}
        isLoadingDocs={isLoadingDocs}
        docsError={docsError}
        extractingId={extractingId}
        isDeleting={isDeleting}
        deleteTargetId={deleteTarget?.id ?? null}
        onRefresh={loadDocuments}
        onExtract={handleExtract}
        onDownload={handleDownload}
        onDeleteRequest={openDeleteDialog}
        isExtractionActive={isExtractionActive}
        showToast={showToast}
      />

      <ExtractionResults
        documents={documents}
        isExtractionActive={isExtractionActive}
        showToast={showToast}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        title="Delete Document"
        description="Are you sure you want to delete"
        itemName={deleteTarget?.document_name}
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={closeDeleteDialog}
      />

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}