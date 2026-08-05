"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Check, Loader2 } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  getKnowledgeDocument,
  updateKnowledgeDocument,
  type KnowledgeDocumentRead,
  type DocumentCategory,
  type DocumentStatus,
} from "@/lib/api"

const categories: { label: string; value: DocumentCategory }[] = [
  { label: "Bank Policy", value: "bank_policy" },
  { label: "Case Study", value: "case_study" },
]

const statuses: { label: string; value: DocumentStatus }[] = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
]

export default function EditDocumentPage() {
  const params = useParams()
  const id = typeof params?.id === "string" ? params.id : undefined
  const router = useRouter()
  const [document, setDocument] = useState<KnowledgeDocumentRead | null>(null)
  const [formData, setFormData] = useState({
    documentName: "",
    category: "",
    version: "",
    effectiveDate: "",
    expiryDate: "",
    description: "",
    status: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDocument = async () => {
      if (!id) {
        setError("Invalid document ID.")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)
      try {
        const doc = await getKnowledgeDocument(Number(id))
        setDocument(doc)
        setFormData({
          documentName: doc.document_name,
          category: doc.category,
          version: doc.version,
          effectiveDate: doc.effective_date ?? "",
          expiryDate: doc.expiry_date ?? "",
          description: doc.description ?? "",
          status: doc.status,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load document.")
      } finally {
        setIsLoading(false)
      }
    }

    loadDocument()
  }, [id])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!document) return

    setIsSaving(true)
    setError(null)

    try {
      await updateKnowledgeDocument(document.id, {
        document_name: formData.documentName,
        category: formData.category as DocumentCategory,
        version: formData.version,
        effective_date: formData.effectiveDate || undefined,
        expiry_date: formData.expiryDate || undefined,
        description: formData.description || undefined,
        status: formData.status as DocumentStatus,
      })
      router.push("/admin/documents")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save document.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Documents</p>
          <h1 className="text-3xl font-semibold text-white">Edit document</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update metadata and save changes for this knowledge asset.
          </p>
        </div>
        <Button variant="secondary" onClick={() => router.push("/admin/documents")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      <GlassCard className="p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="documentName">Document name</Label>
              <Input
                id="documentName"
                value={formData.documentName}
                onChange={(event) => setFormData((prev) => ({ ...prev, documentName: event.target.value }))}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(event) => setFormData((prev) => ({ ...prev, version: event.target.value }))}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                disabled={isLoading}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#0a0f1a]">
                  {categories.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                disabled={isLoading}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#0a0f1a]">
                  {statuses.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="effectiveDate">Effective date</Label>
              <Input
                id="effectiveDate"
                type="date"
                value={formData.effectiveDate}
                onChange={(event) => setFormData((prev) => ({ ...prev, effectiveDate: event.target.value }))}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(event) => setFormData((prev) => ({ ...prev, expiryDate: event.target.value }))}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
              disabled={isLoading}
              className="min-h-30"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => router.push("/admin/documents")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || isLoading}>
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Save
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> Save changes
                </span>
              )}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
