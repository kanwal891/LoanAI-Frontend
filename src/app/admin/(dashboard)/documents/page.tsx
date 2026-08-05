"use client"
import Link from "next/link";
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { DeleteConfirmDialog } from "@/components/ui/delete-dialog"
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Archive,
  GitCompare,
  MoreVertical,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  RotateCw,
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
import { deleteKnowledgeDocument, downloadKnowledgeDocument, listKnowledgeDocuments, type KnowledgeDocumentRead, updateKnowledgeDocument } from "@/lib/api"

const initialDocuments: KnowledgeDocumentRead[] = []

const statusConfig = {
  active: { label: "Active", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  draft: { label: "Draft", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
}

const categoryLabels: Record<string, string> = {
  bank_policy: "Bank Policy",
  case_study: "Case Study",
}

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [documents, setDocuments] = useState<KnowledgeDocumentRead[]>(initialDocuments)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [viewError, setViewError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const router = useRouter()

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
  }, [])

  const handleViewDocument = async (id: number) => {
    setViewError(null)
    setActionLoadingId(id)

    const newWindow = window.open("", "_blank")
    if (!newWindow) {
      setViewError("Popup blocked. Please allow popups and try again.")
      setActionLoadingId(null)
      return
    }

    try {
      const blob = await downloadKnowledgeDocument(id)
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

  const handleDownloadDocument = async (id: number) => {
    setViewError(null)
    setActionLoadingId(id)

    try {
      const blob = await downloadKnowledgeDocument(id)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `document-${id}`
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
    setDeleteConfirmId(id)
  }

  const handleToggleDocumentStatus = async (doc: KnowledgeDocumentRead) => {
    setViewError(null)
    setActionLoadingId(doc.id)

    try {
      const updated = await updateKnowledgeDocument(doc.id, {
        status: doc.status === "active" ? "draft" : "active",
      })
      setDocuments((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
    } catch (err) {
      setViewError(err instanceof Error ? err.message : "Failed to update document status.")
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDeleteDocument = async (id: number) => {
    setViewError(null)
    setActionLoadingId(id)

    try {
      await deleteKnowledgeDocument(id)
      setDocuments((prev) => prev.filter((doc) => doc.id !== id))
      setDeleteConfirmId(null)
      showToast("Document deleted.")
    } catch (err) {
      setViewError(err instanceof Error ? err.message : "Failed to delete document.")
      showToast("Unable to delete document.", "error")
    } finally {
      setActionLoadingId(null)
    }
  }

  const categoryLabel = (category: string) =>
    category === "bank_policy" ? "Bank Policy" : category === "case_study" ? "Case Study" : category

  const filteredDocuments = documents.filter((doc) => {
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
                <TableHead className="text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc, index) => {
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
                      <Badge
                        variant="outline"
                        className={cn("border", status.color)}
                      >
                        {status.label}
                      </Badge>
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
                        <DropdownMenuContent
                          align="end"
                          className="border-white/10 bg-[#0a0f1a]"
                        >
                          <DropdownMenuItem
                            onClick={() => handleViewDocument(doc.id)}
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
                            onClick={() => handleDownloadDocument(doc.id)}
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
                            onClick={() => handleToggleDocumentStatus(doc)}
                            disabled={actionLoadingId === doc.id}
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            {doc.status === "active" ? "Mark Inactive" : "Mark Active"}
                          </DropdownMenuItem>
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
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredDocuments.length} of {documents.length} documents
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-white/10 bg-white/5">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="border-white/10 bg-primary/20">
              1
            </Button>
            <Button variant="outline" size="sm" className="border-white/10 bg-white/5">
              2
            </Button>
            <Button variant="outline" size="sm" className="border-white/10 bg-white/5">
              3
            </Button>
            <Button variant="outline" size="sm" className="border-white/10 bg-white/5">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}