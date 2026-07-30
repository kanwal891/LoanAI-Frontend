"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { GlassSidebar } from "@/components/glass-sidebar"
import { GlassCard } from "@/components/glass-card"
import { MagneticButton } from "@/components/magnetic-button"

const documentTypes = [
  "PAN Card",
  "Aadhaar Card",
  "Salary Slips",
  "Bank Statements",
  "Other",
]

const acceptedFormats = ["PDF", "JPG", "PNG"]

interface UploadedDoc {
  id: string
  type: string
  fileName: string
  status: "verified" | "pending" | "required"
  date: string
}

const initialDocuments: UploadedDoc[] = [
  { id: "1", type: "PAN Card", fileName: "pan_card.pdf", status: "verified", date: "12 Jan 2026" },
  { id: "2", type: "Aadhaar Card", fileName: "aadhaar.pdf", status: "verified", date: "12 Jan 2026" },
  { id: "3", type: "Salary Slips", fileName: "salary_dec.pdf", status: "pending", date: "18 Jan 2026" },
  { id: "4", type: "Bank Statements", fileName: "", status: "required", date: "" },
]

const statusStyles = {
  verified: { color: "text-[#10B981]", bg: "bg-[#10B981]/20", icon: CheckCircle2, label: "Verified" },
  pending: { color: "text-[#FF6B35]", bg: "bg-[#FF6B35]/20", icon: Clock, label: "Pending Review" },
  required: { color: "text-[#EF4444]", bg: "bg-[#EF4444]/20", icon: AlertCircle, label: "Required" },
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<UploadedDoc[]>(initialDocuments)
  const [docType, setDocType] = useState(documentTypes[0])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0]
    if (file) setSelectedFile(file)
  }

  const handleUpload = () => {
    if (!selectedFile) return

    setDocuments((prev) => {
      const existingIndex = prev.findIndex((d) => d.type === docType)
      const newEntry: UploadedDoc = {
        id: existingIndex >= 0 ? prev[existingIndex].id : String(Date.now()),
        type: docType,
        fileName: selectedFile.name,
        status: "pending",
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      }
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = newEntry
        return updated
      }
      return [...prev, newEntry]
    })

    // TODO: send `selectedFile` + `docType` to the backend
    setSelectedFile(null)
  }

  return (
    <div className="min-h-screen bg-[#080B14]">
      <GlassSidebar role="applicant" />

      <main className="ml-64 p-6 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl glass hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Documents</h1>
            <p className="text-muted-foreground">Upload your identity and income documents</p>
          </div>
        </div>

        {/* Upload Panel */}
        <GlassCard className="p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-6">Upload a Document</h2>

          <div className="grid gap-6 md:grid-cols-[240px_1fr]">
            {/* Document type select */}
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#6366F1]"
              >
                {documentTypes.map((type) => (
                  <option key={type} value={type} className="bg-[#0F1629]">
                    {type}
                  </option>
                ))}
              </select>

              <p className="text-xs text-muted-foreground pt-3">Accepted formats</p>
              <div className="flex gap-2 flex-wrap">
                {acceptedFormats.map((format) => (
                  <span
                    key={format}
                    className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-muted-foreground"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>

            {/* Drag and drop zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                handleFiles(e.dataTransfer.files)
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-colors ${
                isDragging
                  ? "border-[#6366F1] bg-[#6366F1]/10"
                  : "border-white/15 bg-white/5 hover:border-white/25"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B4FBB] to-[#6366F1] flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>

              {selectedFile ? (
                <>
                  <p className="text-white font-medium break-all text-center">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">Click to choose a different file</p>
                </>
              ) : (
                <>
                  <p className="text-white font-medium">Drag & drop your file here</p>
                  <p className="text-sm text-muted-foreground">or click to browse from your device</p>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            {selectedFile && (
              <button
                onClick={() => setSelectedFile(null)}
                className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-white transition-colors"
              >
                Cancel
              </button>
            )}
            <MagneticButton variant="primary" size="sm" onClick={handleUpload} disabled={!selectedFile}>
              <Upload className="w-4 h-4" />
              Upload Document
            </MagneticButton>
          </div>
        </GlassCard>

        {/* Uploaded Documents List */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Your Documents</h2>

          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {documents.map((doc) => {
                const style = statusStyles[doc.status]
                const StatusIcon = style.icon
                return (
                  <motion.div
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-between p-4 rounded-xl glass-card"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-white">{doc.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.fileName ? doc.fileName : "No file uploaded yet"}
                          {doc.date ? ` · ${doc.date}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.color}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {style.label}
                      </span>

                      {doc.fileName && (
                        <>
                          <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </GlassCard>
      </main>
    </div>
  )
}