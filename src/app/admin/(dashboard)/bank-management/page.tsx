"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Plus,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Pencil,
  Power,
  Trash2,
  X,
  Search,
} from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DeleteConfirmDialog } from "@/components/ui/delete-dialog"
import { SectionLoader, Skeleton } from "@/components/loading"
import {
  listBanks,
  createBank,
  updateBank,
  deleteBank,
  getPolicyComparison,
  type BankRead,
  type PolicyComparisonResponse,
} from "@/lib/api"

const BANKS_PER_PAGE = 4

const AVATAR_TINTS = [
  "from-[#1B4FBB] to-[#6366F1]",
  "from-[#0EA5A5] to-[#22C55E]",
  "from-[#D946EF] to-[#EC4899]",
  "from-[#F59E0B] to-[#EF4444]",
  "from-[#8B5CF6] to-[#6366F1]",
]
function tintFor(name: string) {
  const i = name.charCodeAt(0) % AVATAR_TINTS.length
  return AVATAR_TINTS[i]
}

export default function BankManagementPage() {
  const [bankList, setBankList] = useState<BankRead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [bankNameInput, setBankNameInput] = useState("")
  const [editingBankId, setEditingBankId] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [pendingId, setPendingId] = useState<number | null>(null)
  const [bankToDelete, setBankToDelete] = useState<BankRead | null>(null)

  const [comparison, setComparison] = useState<PolicyComparisonResponse | null>(null)
  const [isLoadingComparison, setIsLoadingComparison] = useState(true)
  const [comparisonError, setComparisonError] = useState<string | null>(null)
  const [reviewedOnly, setReviewedOnly] = useState(true)

  const [bankPage, setBankPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  const activeBanks = bankList.filter((bank) => bank.status === "active")
  const comparisonRows = comparison?.rows ?? []
  const banksCompared = comparison?.banks_compared ?? 0
  const editingBank = bankList.find((bank) => bank.id === editingBankId) ?? null

  const filteredBanks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return bankList
    return bankList.filter((bank) => bank.bank_name.toLowerCase().includes(q))
  }, [bankList, searchQuery])

  const bankTotalPages = Math.max(1, Math.ceil(filteredBanks.length / BANKS_PER_PAGE))

  useEffect(() => {
    setBankPage(1)
  }, [searchQuery])

  useEffect(() => {
    if (bankPage > bankTotalPages) setBankPage(bankTotalPages)
  }, [bankTotalPages, bankPage])

  const paginatedBanks = useMemo(() => {
    const start = (bankPage - 1) * BANKS_PER_PAGE
    return filteredBanks.slice(start, start + BANKS_PER_PAGE)
  }, [filteredBanks, bankPage])

  const loadBanks = async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const data = await listBanks()
      setBankList(data)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load banks")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBanks()
  }, [])

  useEffect(() => {
    loadComparison(reviewedOnly)
  }, [reviewedOnly])

  const loadComparison = async (reviewed: boolean) => {
    setIsLoadingComparison(true)
    setComparisonError(null)
    try {
      const result = await getPolicyComparison(reviewed)
      setComparison(result)
    } catch (err) {
      setComparisonError(err instanceof Error ? err.message : "Failed to load comparison")
    } finally {
      setIsLoadingComparison(false)
    }
  }

  const formatMetric = (value: number | null, suffix = "") =>
    value === null || value === undefined ? "—" : `${value}${suffix}`

  const handleBankFormSubmit = async () => {
    const name = bankNameInput.trim()
    if (!name) return

    setIsSaving(true)
    setFormError(null)

    try {
      if (editingBank) {
        const updated = await updateBank(editingBank.id, { bank_name: name })
        setBankList((prev) => prev.map((bank) => (bank.id === updated.id ? updated : bank)))
      } else {
        const created = await createBank({ bank_name: name, status: "active" })
        setBankList((prev) => [...prev, created])
      }
      setBankNameInput("")
      setEditingBankId(null)
      setShowForm(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save bank")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditBank = (bank: BankRead) => {
    setBankNameInput(bank.bank_name)
    setEditingBankId(bank.id)
    setFormError(null)
    setShowForm(true)
  }

  const handleAddNewClick = () => {
    setBankNameInput("")
    setEditingBankId(null)
    setFormError(null)
    setShowForm(true)
  }

  const handleCancelBankEdit = () => {
    setBankNameInput("")
    setEditingBankId(null)
    setFormError(null)
    setShowForm(false)
  }

  const toggleBankActive = async (bank: BankRead) => {
    setPendingId(bank.id)
    try {
      const nextStatus = bank.status === "active" ? "deactive" : "active"
      const updated = await updateBank(bank.id, { status: nextStatus })
      setBankList((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
      if (editingBankId === bank.id) {
        setEditingBankId(null)
        setBankNameInput("")
        setShowForm(false)
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to update bank status")
    } finally {
      setPendingId(null)
    }
  }

  const requestDeleteBank = (bank: BankRead) => setBankToDelete(bank)

  const handleConfirmDeleteBank = async () => {
    if (!bankToDelete) return
    const bank = bankToDelete
    setPendingId(bank.id)
    try {
      await deleteBank(bank.id)
      setBankList((prev) => prev.filter((b) => b.id !== bank.id))
      if (editingBankId === bank.id) {
        setEditingBankId(null)
        setBankNameInput("")
        setShowForm(false)
      }
      setBankToDelete(null)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to delete bank")
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">Bank Management</h1>
        <p className="text-muted-foreground max-w-2xl">
          Add, edit, and deactivate banks available across the loan knowledge base.
        </p>
      </div>

      <DeleteConfirmDialog
        open={bankToDelete !== null}
        title="Delete bank"
        description="This will permanently remove"
        itemName={bankToDelete?.bank_name}
        loading={pendingId === bankToDelete?.id}
        onConfirm={handleConfirmDeleteBank}
        onCancel={() => setBankToDelete(null)}
      />

      <GlassCard className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1B4FBB] to-[#6366F1]">
              <Landmark className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Banks</h2>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Loading…" : `${activeBanks.length} active · ${bankList.length} total`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search banks…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 border-white/10 bg-white/5 pl-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {!showForm && (
              <Button className="bg-linear-to-r from-primary to-indigo-500" onClick={handleAddNewClick}>
                <Plus className="mr-2 h-4 w-4" />
                Add Bank
              </Button>
            )}
          </div>
        </div>

        {loadError && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {loadError}
            <button onClick={loadBanks} className="ml-auto underline hover:text-red-300 transition-colors">
              Retry
            </button>
          </div>
        )}

        {showForm && (
          <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">
                {editingBank ? "Edit Bank" : "New Bank"}
              </h3>
              <button
                onClick={handleCancelBankEdit}
                disabled={isSaving}
                className="text-muted-foreground hover:text-white transition-colors"
                aria-label="Close form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="bankNameInput">Bank Name</Label>
                <Input
                  id="bankNameInput"
                  placeholder="Enter bank name"
                  value={bankNameInput}
                  onChange={(e) => setBankNameInput(e.target.value)}
                  className="border-white/10 bg-white/5"
                  disabled={isSaving}
                  autoFocus
                />
                {formError && <p className="text-xs text-red-400">{formError}</p>}
              </div>
              <div className="flex gap-2">
                <Button
                  className="bg-linear-to-r from-primary to-indigo-500"
                  onClick={handleBankFormSubmit}
                  disabled={isSaving || !bankNameInput.trim()}
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  {editingBank ? "Save" : "Add"}
                </Button>
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5"
                  onClick={handleCancelBankEdit}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          {isLoading ? (
            <SectionLoader icon={Landmark} label="Loading banks…" />
          ) : filteredBanks.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <Landmark className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? `No banks match "${searchQuery}".` : "No banks yet — add one to get started."}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-primary underline hover:text-primary/80"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <table className="w-full table-fixed divide-y divide-white/10 text-left text-sm">
                  <colgroup>
  <col />
  <col className="w-36" />
  <col className="w-[230px]" />
</colgroup>
                  <thead className="bg-white/[0.03]">
                    <tr className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <th className="px-5 py-3.5 font-medium">Bank</th>
                      <th className="px-5 py-3.5 font-medium text-center">Status</th> 
                      <th className="px-5 py-3.5 font-medium text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {paginatedBanks.map((bank) => {
                      const isPending = pendingId === bank.id
                      const isActive = bank.status === "active"
                      return (
                        <tr key={bank.id} className="transition-colors hover:bg-white/[0.03]">
                          <td className="px-5 py-4 text-center">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-semibold text-white ${tintFor(
                                  bank.bank_name
                                )}`}
                              >
                                {bank.bank_name.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-medium text-white truncate">{bank.bank_name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span
                              className={
                                isActive
                                  ? "inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300"
                                  : "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground"
                              }
                            >
                              <span
                                className={
                                  isActive
                                    ? "h-1.5 w-1.5 rounded-full bg-emerald-400"
                                    : "h-1.5 w-1.5 rounded-full bg-white/30"
                                }
                              />
                              {isActive ? "Active" : "Deactivated"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-white/10 bg-white/5 text-xs"
                                onClick={() => handleEditBank(bank)}
                                disabled={isPending}
                              >
                                <Pencil className="mr-1.5 h-3 w-3" />
                                Edit
                              </Button>
                              <Button
                                variant={isActive ? "secondary" : "outline"}
                                size="sm"
                                className="border-white/10 text-xs"
                                onClick={() => toggleBankActive(bank)}
                                disabled={isPending}
                              >
                                {isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    <Power className="mr-1.5 h-3 w-3" />
                                    {isActive ? "Deactivate" : "Activate"}
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-500/20 bg-red-500/5 text-xs text-red-400 hover:bg-red-500/10"
                                onClick={() => requestDeleteBank(bank)}
                                disabled={isPending}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}

                    {/* Pad short pages with empty rows so the table keeps a
                        consistent height instead of shrinking to fit. */}
                    {Array.from({ length: BANKS_PER_PAGE - paginatedBanks.length }).map((_, i) => (
                      <tr key={`pad-${i}`} aria-hidden="true">
                        <td className="px-5 py-4" colSpan={3}>
                          <div className="h-9" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {bankTotalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Page {bankPage} of {bankTotalPages}
                    {searchQuery && ` · ${filteredBanks.length} result${filteredBanks.length === 1 ? "" : "s"}`}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-white/10 bg-white/5"
                      onClick={() => setBankPage((p) => Math.max(1, p - 1))}
                      disabled={bankPage === 1}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-white/10 bg-white/5"
                      onClick={() => setBankPage((p) => Math.min(bankTotalPages, p + 1))}
                      disabled={bankPage === bankTotalPages}
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </GlassCard>

      {/* ---- Comparison table (unchanged from before) ------------------ */}
      <GlassCard className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Comparison data</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Policy-level bank overview</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setReviewedOnly((v) => !v)}
              className={
                reviewedOnly
                  ? "rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-medium text-primary transition-colors"
                  : "rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-white"
              }
            >
              {reviewedOnly ? "Reviewed only" : "All documents"}
            </button>
            <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-white">
              Banks compared: <span className="font-semibold">{banksCompared}</span>
            </div>
          </div>
        </div>

        {comparisonError && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {comparisonError}
            <button
              onClick={() => loadComparison(reviewedOnly)}
              className="ml-auto underline hover:text-red-300 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mt-6 overflow-x-auto rounded-3xl border border-white/10 bg-white/5 p-4">
          {isLoadingComparison ? (
            <div className="space-y-3 p-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : comparisonRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <p className="text-sm text-muted-foreground">No comparison data available yet.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <th className="px-4 py-3">Bank</th>
                  <th className="px-4 py-3">FOIR</th>
                  <th className="px-4 py-3">ROI</th>
                  <th className="px-4 py-3">CIBIL</th>
                  <th className="px-4 py-3">LTV</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">Income</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {comparisonRows.map((row) => (
                  <tr key={row.bank_id + "-" + row.document_id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-white">{row.bank_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatMetric(row.foir)}%</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatMetric(row.roi)}%</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatMetric(row.cibil)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatMetric(row.ltv)}%</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.age ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatMetric(row.income)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </GlassCard>
    </div>
  )
}