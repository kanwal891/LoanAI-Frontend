"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Upload, FileCheck } from "lucide-react"
import { MagneticButton } from "@/components/magnetic-button"

interface DocumentUploadModalProps {
  open: boolean
  documentName: string
  onClose: () => void
  onUpload: (file: File) => void
}

export function DocumentUploadModal({
  open,
  documentName,
  onClose,
  onUpload,
}: DocumentUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  if (!open) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile)
      setSelectedFile(null)
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0D1220] p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Upload {documentName}</h2>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <label
            htmlFor="doc-upload-input"
            className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/20 bg-white/5 p-8 cursor-pointer hover:border-white/30 transition-colors"
          >
            {selectedFile ? (
              <>
                <FileCheck className="w-8 h-8 text-[#10B981]" />
                <p className="text-sm text-white text-center break-all">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">Click to choose a different file</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-white">Click to select an image</p>
                <p className="text-xs text-muted-foreground">JPG, PNG or PDF</p>
              </>
            )}
            <input
              id="doc-upload-input"
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-white transition-colors"
            >
              Cancel
            </button>
            <MagneticButton
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!selectedFile}
            >
              Upload
            </MagneticButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}