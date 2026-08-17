import { Suspense } from "react"
import DocumentsPageContent from "./document-page-content"

function DocumentsLoadingFallback() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Document Library</h1>
        <p className="text-muted-foreground">Manage and organize all lender policy documents</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-muted-foreground">
        Loading documents...
      </div>
    </div>
  )
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<DocumentsLoadingFallback />}>
      <DocumentsPageContent />
    </Suspense>
  )
}