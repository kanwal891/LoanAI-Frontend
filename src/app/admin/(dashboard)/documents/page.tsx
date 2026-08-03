"use client"

import { useState } from "react"
import { motion } from "framer-motion"
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

const documents = [
  {
    id: "1",
    name: "HDFC Bank Credit Policy",
    bankName: "HDFC Bank",
    category: "Bank Policy",
    version: "3.2",
    uploadDate: "2024-01-15",
    lastUpdated: "2024-01-18",
    uploadedBy: "Admin User",
    status: "active",
  },
  {
    id: "2",
    name: "ICICI FOIR Guidelines",
    bankName: "ICICI Bank",
    category: "Case Study",
    version: "2.1",
    uploadDate: "2024-01-12",
    lastUpdated: "2024-01-14",
    uploadedBy: "Review Team",
    status: "active",
  },
  {
    id: "3",
    name: "Axis Bank Eligibility Matrix",
    bankName: "Axis Bank",
    category: "Bank Policy",
    version: "1.5",
    uploadDate: "2024-01-18",
    lastUpdated: "2024-01-18",
    uploadedBy: "Admin User",
    status: "draft",
  },
  {
    id: "4",
    name: "SBI Credit Risk Rules",
    bankName: "SBI",
    category: "Bank Policy",
    version: "4.0",
    uploadDate: "2024-01-10",
    lastUpdated: "2024-01-10",
    uploadedBy: "System",
    status: "failed",
  },
  {
    id: "5",
    name: "Kotak ROI Policy",
    bankName: "Kotak Mahindra Bank",
    category: "Case Study",
    version: "2.0",
    uploadDate: "2024-01-08",
    lastUpdated: "2024-01-09",
    uploadedBy: "Admin User",
    status: "Inactive",
  },
  {
    id: "6",
    name: "Yes Bank Underwriting Rules",
    bankName: "Yes Bank",
    category: "Case Study",
    version: "1.8",
    uploadDate: "2024-01-05",
    lastUpdated: "2024-01-07",
    uploadedBy: "Review Team",
    status: "active",
  },
  {
    id: "7",
    name: "IndusInd CIBIL Policies",
    bankName: "IndusInd Bank",
    category: "Bank Policy",
    version: "3.0",
    uploadDate: "2024-01-03",
    lastUpdated: "2024-01-04",
    uploadedBy: "Admin User",
    status: "failed",
  },
  {
    id: "8",
    name: "PNB Bank Policies",
    bankName: "Punjab National Bank",
    category: "Case Study",
    version: "2.5",
    uploadDate: "2024-01-01",
    lastUpdated: "2024-01-02",
    uploadedBy: "Admin User",
    status: "draft",
  },
]

const statusConfig = {
  active: { label: "Active", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  draft: { label: "Draft", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  Inactive: { label: "Inactive", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  failed: { label: "Failed", color: "bg-red-500/20 text-red-400 border-red-500/30" },
}

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.bankName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter
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
        <Button className="bg-linear-to-r from-primary to-indigo-500">
          <FileText className="mr-2 h-4 w-4" />
          Upload New Document
        </Button>
      </div>

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
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
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
                          <p className="font-medium text-white">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            by {doc.uploadedBy}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{doc.bankName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-white/20 bg-white/5">
                        {doc.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white">v{doc.version}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {doc.uploadDate}
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
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          {doc.status === "failed" && (
                            <DropdownMenuItem>
                              <RotateCw className="mr-2 h-4 w-4" />
                              Re-upload
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem>
                            <GitCompare className="mr-2 h-4 w-4" />
                            Compare Versions
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Archive className="mr-2 h-4 w-4" />
                            Mark Inactive
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem className="text-destructive">
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