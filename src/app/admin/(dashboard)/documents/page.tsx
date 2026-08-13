"use client"
import Link from "next/link";
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
  type KnowledgeDocumentRead,
} from "@/lib/api"

const initialDocuments: KnowledgeDocumentRead[] = []

const ITEMS_PER_PAGE = 10

const statusConfig = {
  active: { label: "Active", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  draft: { label: "Draft", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
}

const categoryLabels: Record<string, string> = {
  bank_policy: "Bank Policy",
  case_study: "Case Study",
}

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
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1 border",
      )}
    >
      {isExtracted ? <Sparkles className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
      {isExtracted ? "Extracted" : "Not Extracted"}
    </Badge>
  )
}

export default function DocumentsPage() {
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
    // Re-run whenever the query string changes (e.g. ?updated=<timestamp>
    // appended by the edit/upload pages after a save). Without this
    // dependency, navigating back here with just a different query param
    // re-renders this same component instance instead of remounting it,
    // so an effect with an empty dependency array would never fire again
    // and the list would keep showing stale data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()])

  const handleViewDocument = async (doc: KnowledgeDocumentRead) => {
    setViewError(null)
    setPreviewNotice(null)

    // Word/Excel files have no in-browser viewer — the browser will force a
    // download no matter how we open the blob, so don't pretend it's a preview.
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

  const handleEditDocument = (id: number) => {
    router.push(`/admin/documents/${id}/edit`)
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

  // Real pagination — only as many pages as there actually are, and reset
  // back to page 1 whenever the filtered set changes so you can't get stuck
  // on a page that no longer has any rows.
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

  const pageNumbers = useMemo(() => {
    // Show at most 5 page buttons centered around the current page instead
    // of rendering a button for every page when there are many.
    const maxButtons = 5
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    let start = Math.max(1, currentPage - 2)
    let end = Math.min(totalPages, start + maxButtons - 1)
    start = Math.max(1, end - maxButtons + 1)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [totalPages, currentPage])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Document Library</h1>
          <p className="text-muted-foreground">
            Manage and organize all lender policy documents
          </p>
        </div>
        <Link href="/admin/knowledge-base">
          <Button className="bg-linear-to-r from-primary to-indigo-500">
            <FileText className="mr-2 h-4 w-4" />
            Upload New Document
          </Button>
        </Link>
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
                Browsers can't preview {previewNotice.format.toLowerCase()}s directly — download it
                and open it in the matching app to view the content.
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
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Document Name</TableHead>
                <TableHead className="text-muted-foreground">Bank</TableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <TableHead className="text-muted-foreground">Version</TableHead>
                <TableHead className="text-muted-foreground">Upload Date</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Extraction</TableHead>
                <TableHead className="text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    Loading documents...
                  </TableCell>
                </TableRow>
              ) : loadError ? (
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableCell colSpan={8} className="py-10 text-center text-red-400">
                    {loadError}
                  </TableCell>
                </TableRow>
              ) : paginatedDocuments.length === 0 ? (
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    No documents match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDocuments.map((doc, index) => {
                  const status = statusConfig[doc.status as keyof typeof statusConfig]
                  return (
                    <motion.tr
                      key={doc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-white/10 transition-colors hover:bg-white/5"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary/20 p-2">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{doc.document_name}</p>
                            <p className="text-xs text-muted-foreground">
                              by {doc.uploaded_by ?? "Unknown"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">{doc.bank?.bank_name ?? `Bank ${doc.bank_id}`}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-white/20 bg-white/5">
                          {categoryLabels[doc.category] ?? doc.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">v{doc.version}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("border", status.color)}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ExtractionStatusBadge status={doc.extraction_status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-white"
                            >
                              <MoreVertical className="h-4 w-4" />
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
                            <DropdownMenuItem onClick={() => handleEditDocument(doc.id)}>
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
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => requestDeleteDocument(doc.id)}
                            >
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
            </TableBody>
          </Table>
        </div>

        {/* Pagination — only renders real pages, and hides entirely when there's nothing to page through */}
        {!isLoading && !loadError && filteredDocuments.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredDocuments.length)} of{" "}
              {filteredDocuments.length} documents
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 bg-white/5"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {pageNumbers[0] > 1 && (
                  <span className="px-1 text-sm text-muted-foreground">…</span>
                )}
                {pageNumbers.map((page) => (
                  <Button
                    key={page}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "border-white/10",
                      page === currentPage ? "bg-primary/30 text-white" : "bg-white/5"
                    )}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                  <span className="px-1 text-sm text-muted-foreground">…</span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 bg-white/5"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  )
}