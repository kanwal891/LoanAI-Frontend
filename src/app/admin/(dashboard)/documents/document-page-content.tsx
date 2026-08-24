"use client"
import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { DeleteConfirmDialog } from "@/components/ui/delete-dialog"
import {
  Search,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Sparkles,
  Clock,
  FileWarning,
  Save,
  Loader2,
} from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  deleteKnowledgeDocument,
  downloadKnowledgeDocument,
  listKnowledgeDocuments,
  updateKnowledgeDocument,
  type KnowledgeDocumentRead,
  type KnowledgeDocumentUpdateInput,
  type DocumentCategory,
} from "@/lib/api"
// Shared branded loader — see components/loaders.tsx. Adjust the import
// path above if your project keeps it somewhere else (e.g. components/ui/loaders).
import { SectionLoader } from "@/components/loading"

const initialDocuments: KnowledgeDocumentRead[] = []

const ITEMS_PER_PAGE = 5

const statusConfig = {
  active: { label: "Active", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  draft: { label: "Draft", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
}

const categoryLabels: Record<string, string> = {
  bank_policy: "Bank Policy",
  case_study: "Case Study",
}

// Reverse lookup so the edit dialog can turn a display label back into the
// underlying category key when saving.
const categoryKeyByLabel: Record<string, string> = Object.fromEntries(
  Object.entries(categoryLabels).map(([key, label]) => [label, key])
)

// Browsers can only render these inline via a blob URL — everything else
// (docx, xlsx, etc.) has no built-in viewer and will always force a download
// no matter what the frontend does, so "View" only makes sense for these.
const INLINE_VIEWABLE_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "text/plain",
])

function friendlyFormatName(contentType: string): string {
  switch (contentType) {
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "Word document"
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return "Excel spreadsheet"
    case "application/msword":
      return "Word document"
    case "application/vnd.ms-excel":
      return "Excel spreadsheet"
    default:
      return "file"
  }
}

function ExtractionStatusBadge({ status }: { status: KnowledgeDocumentRead["extraction_status"] }) {
  const isExtracted = status === "extracted" || status === "reviewed"
  return (
    <Badge variant="outline" className="inline-flex items-center gap-1 border whitespace-nowrap">
      {isExtracted ? <Sparkles className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
      {isExtracted ? "Extracted" : "Not Extracted"}
    </Badge>
  )
}

type EditFormState = {
  document_name: string
  category: string
  status: string
}

export default function DocumentsPageContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [documents, setDocuments] = useState<KnowledgeDocumentRead[]>(initialDocuments)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [viewError, setViewError] = useState<string | null>(null)
  const [previewNotice, setPreviewNotice] = useState<{ fileName: string; format: string } | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Edit modal state — replaces the old router.push to a separate edit page.
  const [editDoc, setEditDoc] = useState<KnowledgeDocumentRead | null>(null)
  const [editForm, setEditForm] = useState<EditFormState>({ document_name: "", category: "", status: "" })
  const [isSaving, setIsSaving] = useState(false)
  const [editSaveError, setEditSaveError] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const docs = await listKnowledgeDocuments()
        setDocuments(docs)
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load documents")
      } finally {
        setIsLoading(false)
      }
    }

    loadDocuments()
  }, [searchParams.toString()])

  const handleViewDocument = async (doc: KnowledgeDocumentRead) => {
    setViewError(null)
    setPreviewNotice(null)

    if (!INLINE_VIEWABLE_TYPES.has(doc.content_type)) {
      setPreviewNotice({ fileName: doc.original_filename, format: friendlyFormatName(doc.content_type) })
      return
    }

    setActionLoadingId(doc.id)
    const newWindow = window.open("", "_blank")
    if (!newWindow) {
      setViewError("Popup blocked. Please allow popups and try again.")
      setActionLoadingId(null)
      return
    }

    try {
      const blob = await downloadKnowledgeDocument(doc.id)
      const url = URL.createObjectURL(blob)
      newWindow.location.href = url
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
    } catch (err) {
      newWindow.close()
      setViewError(err instanceof Error ? err.message : "Failed to open document.")
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDownloadDocument = async (doc: KnowledgeDocumentRead) => {
    setViewError(null)
    setPreviewNotice(null)
    setActionLoadingId(doc.id)

    try {
      const blob = await downloadKnowledgeDocument(doc.id)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = doc.original_filename || `document-${doc.id}`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
    } catch (err) {
      setViewError(err instanceof Error ? err.message : "Failed to download document.")
    } finally {
      setActionLoadingId(null)
    }
  }

  // Opens the edit dialog in place instead of navigating to /admin/documents/[id]/edit.
  const handleEditDocument = (doc: KnowledgeDocumentRead) => {
    setEditSaveError(null)
    setEditDoc(doc)
    setEditForm({
      document_name: doc.document_name,
      category: categoryLabels[doc.category] ?? doc.category,
      status: doc.status,
    })
  }

  const closeEditDialog = () => {
    if (isSaving) return
    setEditDoc(null)
    setEditSaveError(null)
  }

  useEffect(() => {
    if (!editDoc) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeEditDialog()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editDoc])

  const handleSaveEdit = async () => {
    if (!editDoc) return
    setIsSaving(true)
    setEditSaveError(null)

    const payload: KnowledgeDocumentUpdateInput = {
      document_name: editForm.document_name.trim(),
      category: (categoryKeyByLabel[editForm.category] ?? editForm.category) as DocumentCategory,
      status: editForm.status as KnowledgeDocumentUpdateInput["status"],
    }

    try {
      const updated = await updateKnowledgeDocument(editDoc.id, payload)
      setDocuments((prev) => prev.map((doc) => (doc.id === editDoc.id ? { ...doc, ...updated } : doc)))
      setEditDoc(null)
      showToast("Document updated.")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update document."
      setEditSaveError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const requestDeleteDocument = (id: number) => {
    setDeleteConfirmId(Number(id))
  }

  const handleDeleteDocument = async (id: number) => {
    if (id === null || id === undefined) return
    setViewError(null)
    setActionLoadingId(id)

    try {
      await deleteKnowledgeDocument(Number(id))
      setDocuments((prev) => prev.filter((doc) => doc.id !== id))
      setDeleteConfirmId(null)
      showToast("Document deleted.")
    } catch (err) {
      console.error("Delete document failed:", err)
      const message = err instanceof Error ? err.message : String(err)
      setViewError(message)
      showToast(message || "Unable to delete document.", "error")
    } finally {
      setActionLoadingId(null)
    }
  }

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const bankName = doc.bank?.bank_name ?? String(doc.bank_id)
      const category = categoryLabels[doc.category] ?? doc.category
      const matchesSearch =
        doc.document_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || doc.status === statusFilter
      const matchesCategory = categoryFilter === "all" || category === categoryFilter
      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [documents, searchQuery, statusFilter, categoryFilter])

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE))

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, categoryFilter])

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [totalPages, currentPage])

  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredDocuments.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredDocuments, currentPage])

  const emptyRowCount = Math.max(0, ITEMS_PER_PAGE - paginatedDocuments.length)


  const COLUMN_WIDTHS = [26, 16, 13, 7, 13, 10, 10, 5] as const

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Document Library</h1>
          <p className="text-muted-foreground">Manage and organize all lender policy documents</p>
        </div>
        <Button
          className="bg-linear-to-r from-primary to-indigo-500"
          onClick={() => router.push("/admin/knowledge-base")}
        >
          <FileText className="mr-2 h-4 w-4" />
          Upload New Document
        </Button>
      </div>

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-4 right-4 z-50 inline-flex w-fit items-center gap-3 rounded-3xl border px-4 py-3 text-sm font-medium shadow-2xl backdrop-blur-xl ${
              toast.type === "success"
                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                : "border-red-400/20 bg-red-500/10 text-red-100"
            }`}
            role="status"
            aria-live="polite"
          >
            <span
              className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${
                toast.type === "success" ? "bg-emerald-400" : "bg-red-400"
              }`}
            />
            <span className="max-w-[16rem] truncate">{toast.message}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <DeleteConfirmDialog
        open={deleteConfirmId !== null}
        itemName={documents.find((doc) => doc.id === deleteConfirmId)?.document_name}
        loading={actionLoadingId === deleteConfirmId}
        onConfirm={() => deleteConfirmId !== null && handleDeleteDocument(deleteConfirmId)}
        onCancel={() => setDeleteConfirmId(null)}
      />

      <AnimatePresence>
        {editDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-md"
            onClick={closeEditDialog}
            role="presentation"
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0a0f1a] p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-doc-title"
            >
              <h2 id="edit-doc-title" className="text-xl font-semibold text-white">
                Edit document
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Update the document's details. Changes save instantly.
              </p>

              <div className="mt-6 space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="edit-doc-name" className="text-sm text-muted-foreground">
                    Document name
                  </label>
                  <Input
                    id="edit-doc-name"
                    value={editForm.document_name}
                    onChange={(e) => setEditForm((f) => ({ ...f, document_name: e.target.value }))}
                    className="border-white/10 bg-white/5"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="edit-doc-category" className="text-sm text-muted-foreground">
                    Category
                  </label>
                  <Select
                    value={editForm.category}
                    onValueChange={(value) => setEditForm((f) => ({ ...f, category: value }))}
                  >
                    <SelectTrigger id="edit-doc-category" className="border-white/10 bg-white/5">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#0a0f1a]">
                      <SelectItem value="Bank Policy">Bank Policy</SelectItem>
                      <SelectItem value="Case Study">Case Study</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="edit-doc-status" className="text-sm text-muted-foreground">
                    Status
                  </label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) => setEditForm((f) => ({ ...f, status: value }))}
                  >
                    <SelectTrigger id="edit-doc-status" className="border-white/10 bg-white/5">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#0a0f1a]">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editSaveError && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {editSaveError}
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5"
                  onClick={closeEditDialog}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={isSaving || !editForm.document_name.trim()}
                  className="bg-linear-to-r from-primary to-indigo-500"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save changes
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-white/10 bg-white/5 pl-10"
            />
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 border-white/10 bg-white/5">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#0a0f1a]">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-44 border-white/10 bg-white/5">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#0a0f1a]">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Bank Policy">Bank Policy</SelectItem>
                <SelectItem value="Case Study">Case Study</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {viewError && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {viewError}
          </div>
        )}

        {previewNotice && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-200">
            <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-indigo-300" />
            <div>
              <p className="font-medium text-indigo-100">
                "{previewNotice.fileName}" is a {previewNotice.format}
              </p>
              <p className="mt-0.5 text-indigo-300/90">
                Browsers can't preview {previewNotice.format.toLowerCase()}s directly — download it and open
                it in the matching app to view the content.
              </p>
            </div>
            <button
              onClick={() => setPreviewNotice(null)}
              className="ml-auto shrink-0 rounded-md px-1.5 text-indigo-300/70 transition-colors hover:bg-white/10 hover:text-indigo-100"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}
      </GlassCard>

      {/* Documents Table */}
      <GlassCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table className="table-fixed">
            <colgroup>
              {COLUMN_WIDTHS.map((w, i) => (
                <col key={i} style={{ width: `${w}%` }} />
              ))}
            </colgroup>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="py-4 text-sm text-muted-foreground">Document Name</TableHead>
                <TableHead className="py-4 text-sm text-muted-foreground">Bank</TableHead>
                <TableHead className="py-4 text-sm text-muted-foreground">Category</TableHead>
                <TableHead className="py-4 text-sm text-muted-foreground">Version</TableHead>
                <TableHead className="py-4 text-sm text-muted-foreground">Upload Date</TableHead>
                <TableHead className="py-4 text-sm text-muted-foreground">Status</TableHead>
                <TableHead className="py-4 text-sm text-muted-foreground">Extraction</TableHead>
                <TableHead className="py-4 text-right text-sm text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableCell colSpan={8} className="p-0">
                    <SectionLoader icon={FileText} label="Loading documents..." />
                  </TableCell>
                </TableRow>
              ) : loadError ? (
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableCell colSpan={8} className="py-8 text-center text-red-400">
                    {loadError}
                  </TableCell>
                </TableRow>
              ) : paginatedDocuments.length === 0 ? (
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    No documents match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDocuments.map((doc, index) => {
                  const status = statusConfig[doc.status as keyof typeof statusConfig]
                  return (
                    <motion.tr
                      key={doc.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02, duration: 0.15 }}
                      className="h-[84px] border-white/10 transition-colors hover:bg-white/5"
                    >
                      <TableCell className="py-5">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="shrink-0 rounded-lg bg-primary/20 p-3">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <p className="truncate text-base font-medium text-white" title={doc.document_name}>
                            {doc.document_name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 text-base text-white">
                        <span className="block truncate" title={doc.bank?.bank_name ?? `Bank ${doc.bank_id}`}>
                          {doc.bank?.bank_name ?? `Bank ${doc.bank_id}`}
                        </span>
                      </TableCell>
                      <TableCell className="py-5">
                        <Badge variant="outline" className="border-white/20 bg-white/5 whitespace-nowrap px-3 py-1 text-sm">
                          {categoryLabels[doc.category] ?? doc.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-5 text-base text-white">v{doc.version}</TableCell>
                      <TableCell className="py-5 text-base text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-5">
                        <Badge variant="outline" className={cn("border whitespace-nowrap px-3 py-1 text-sm", status.color)}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-5">
                        <ExtractionStatusBadge status={doc.extraction_status} />
                      </TableCell>
                      <TableCell className="py-5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-muted-foreground hover:text-white"
                            >
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-white/10 bg-[#0a0f1a]">
                            <DropdownMenuItem
                              onClick={() => handleViewDocument(doc)}
                              disabled={actionLoadingId === doc.id}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              {actionLoadingId === doc.id ? "Opening..." : "View"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditDocument(doc)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadDocument(doc)}
                              disabled={actionLoadingId === doc.id}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              {actionLoadingId === doc.id ? "Downloading..." : "Download"}
                            </DropdownMenuItem>
                            {doc.rag_status === "failed" && (
                              <DropdownMenuItem>
                                <RotateCw className="mr-2 h-4 w-4" />
                                Re-upload
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem variant="destructive" onClick={() => requestDeleteDocument(doc.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  )
                })
              )}

              {!isLoading &&
                !loadError &&
                paginatedDocuments.length > 0 &&
                Array.from({ length: emptyRowCount }).map((_, i) => (
                  <TableRow key={`filler-${i}`} className="h-[84px] border-white/10 hover:bg-transparent">
                    <TableCell colSpan={8} className="py-5">
                      &nbsp;
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        {!isLoading && !loadError && filteredDocuments.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredDocuments.length)} of {filteredDocuments.length}{" "}
              documents
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 bg-white/5"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 bg-white/5"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  )
}