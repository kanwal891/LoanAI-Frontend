import type { DocumentCategory } from "@/lib/api"

export const categories: { label: string; value: DocumentCategory }[] = [
  { label: "Bank Policy", value: "bank_policy" },
  { label: "Case Study", value: "case_study" },
]

// Accepted file types — PDF, Word (.doc/.docx), Excel (.xls/.xlsx), plain text.
export const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "text/plain": [".txt"],
}
export const ACCEPTED_TYPES_LABEL = "PDF, DOC, DOCX, XLS, XLSX, and TXT"

export interface UploadedFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  status: "uploading" | "processing" | "ready" | "failed"
  progress: number
}

export const STATUS_LABEL: Record<UploadedFile["status"], string> = {
  uploading: "Uploading",
  processing: "Processing",
  ready: "Ready",
  failed: "Failed",
}

// -----------------------------------------------------------------------
// Toast state — shared by the ToastStack component
// -----------------------------------------------------------------------
export interface ToastState {
  id: number
  message: string
  variant: "warning" | "success" | "error" | "info"
  /** Show an indeterminate progress bar inside the toast (used for extraction). */
  progress?: boolean
  /** If true, the toast does NOT auto-dismiss on a timer — caller must remove it explicitly. */
  persistent?: boolean
}

export interface DocumentFormData {
  documentName: string
  bankId: string
  category: string
  effectiveDate: string
  expiryDate: string
  version: string
  description: string
}

export const initialDocumentFormData: DocumentFormData = {
  documentName: "",
  bankId: "",
  category: "",
  effectiveDate: "",
  expiryDate: "",
  version: "1.0",
  description: "",
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}