"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { DeleteConfirmDialog } from "@/components/ui/delete-dialog" // adjust path if different
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

/** Strip the extension from a filename for use as a suggested document name,
 *  e.g. "HDFC_Policy_v2.pdf" -> "HDFC_Policy_v2". Files with no extension
 *  (or a leading-dot dotfile like ".gitignore") are returned unchanged. */
function fileNameToDocumentName(filename: string): string {
  const lastDot = filename.lastIndexOf(".")
  if (lastDot <= 0) return filename
  return filename.slice(0, lastDot)
}

export default function KnowledgeBasePage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [formData, setFormData] = useState<DocumentFormData>(initialDocumentFormData)
  const [bankList, setBankList] = useState<BankRead[]>([])
  const [isLoadingBanks, setIsLoadingBanks] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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
        // Default lifetime bumped from 4s to 6s — 4s wasn't enough time to
        // read longer messages before they vanished.
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

  // Auto-fill "Document Name" from the dropped file's name (extension
  // stripped) the moment the file lands in the dropzone. Only fires when
  // the Document Name field is still empty, so it never overwrites
  // something the user already typed.
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

  // Reset the whole form the moment the queued file is removed/cancelled.
  // Without this, cancelling a file left bankId/documentName/dates behind
  // even though there's no longer a document those values apply to — the
  // form looked "filled in" for nothing. Tracks the previous file count
  // via a ref so this only fires on an actual 1 -> 0 transition (removal),
  // not on initial mount or after a successful submit's own reset (which
  // is a no-op here since formData is already back to initial by then).
  const prevFilesCountRef = useRef(0)
  useEffect(() => {
    const prevCount = prevFilesCountRef.current
    if (prevCount > 0 && files.length === 0) {
      setFormData(initialDocumentFormData)
      setSubmitError(null)
    }
    prevFilesCountRef.current = files.length
  }, [files.length])

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
      showToast("Document uploaded successfully.", "success")
      loadDocuments()
    } catch (err) {
      // A 409 here means the backend caught a duplicate our local
      // pre-check missed (e.g. stale `documents` list, concurrent
      // upload from another session). Surface it as a toast, same as
      // the pre-check case, rather than the generic inline form error —
      // the backend's message already names the conflicting document.
      if (err instanceof ApiError && err.status === 409) {
        showToast(err.message, "warning")
      } else {
        setSubmitError(err instanceof Error ? err.message : "Failed to upload document.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExtract = async (doc: KnowledgeDocumentRead) => {
    setExtractingId(doc.id)
    // Persistent + progress: extraction can take a few minutes, so this
    // toast doesn't time out on its own — it's dismissed explicitly below
    // the moment the request actually resolves or fails.
    const progressToastId = showToast(
      "Extraction started — this can take a few minutes. We'll update you here once it's done.",
      "info",
      { progress: true, persistent: true }
    )
    try {
      await runExtraction(doc.id)
      // Refetch the full list rather than just patching local state —
      // guarantees the document appears in "AI Extraction Results" below
      // with fully up-to-date data, not a partially-merged local copy.
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
        <UploadDropzone files={files} setFiles={setFiles} showToast={showToast} />
        <DocumentDetailsForm
          formData={formData}
          setFormData={setFormData}
          bankList={bankList}
          isLoadingBanks={isLoadingBanks}
          submitError={submitError}
          isSubmitting={isSubmitting}
          hasFile={files.length > 0}
          onSubmit={handleSubmit}
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
      />

      <ExtractionResults documents={documents} />

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