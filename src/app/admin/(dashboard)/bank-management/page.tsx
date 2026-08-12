"use client"

import { useEffect, useState } from "react"
import { Plus, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  listBanks,
  createBank,
  updateBank,
  deleteBank,
  getPolicyComparison,
  type BankRead,
  type PolicyComparisonResponse,
} from "@/lib/api"

export default function BankManagementPage() {
  const [bankList, setBankList] = useState<BankRead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [bankNameInput, setBankNameInput] = useState("")
  const [editingBankId, setEditingBankId] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Tracks which bank row is mid-request, so only that row's buttons
  // show a spinner/disable instead of freezing the whole list.
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [comparison, setComparison] = useState<PolicyComparisonResponse | null>(null)
  const [isLoadingComparison, setIsLoadingComparison] = useState(true)
  const [comparisonError, setComparisonError] = useState<string | null>(null)
  const [reviewedOnly, setReviewedOnly] = useState(true)

  const activeBanks = bankList.filter((bank) => bank.status === "active")
  const comparisonRows = comparison?.rows ?? []
  const banksCompared = comparison?.banks_compared ?? 0
  const editingBank = bankList.find((bank) => bank.id === editingBankId) ?? null

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
        setBankList((prev) =>
          prev.map((bank) => (bank.id === updated.id ? updated : bank))
        )
      } else {
        const created = await createBank({ bank_name: name, status: "active" })
        setBankList((prev) => [...prev, created])
      }
      setBankNameInput("")
      setEditingBankId(null)
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
  }

  const handleCancelBankEdit = () => {
    setBankNameInput("")
    setEditingBankId(null)
    setFormError(null)
  }

  const toggleBankActive = async (bank: BankRead) => {
    setPendingId(bank.id)
    try {
      const nextStatus = bank.status === "active" ? "deactive" : "active"
      const updated = await updateBank(bank.id, { status: nextStatus })
      setBankList((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b))
      )
      if (editingBankId === bank.id) {
        setEditingBankId(null)
        setBankNameInput("")
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to update bank status")
    } finally {
      setPendingId(null)
    }
  }

  const handleDeleteBank = async (bank: BankRead) => {
    if (!confirm(`Delete "${bank.bank_name}"? This can't be undone.`)) return

    setPendingId(bank.id)
    try {
      await deleteBank(bank.id)
      setBankList((prev) => prev.filter((b) => b.id !== bank.id))
      if (editingBankId === bank.id) {
        setEditingBankId(null)
        setBankNameInput("")
      }
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

      <GlassCard className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Bank Operations</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage the bank list and toggle active status for use in document uploads.
            </p>
          </div>
          <div className="rounded-3xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100 border border-emerald-500/20">
            Active banks: <span className="font-semibold text-white">{activeBanks.length}</span>
          </div>
        </div>

        {loadError && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {loadError}
            <button
              onClick={loadBanks}
              className="ml-auto underline hover:text-red-300 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <div className="rounded-3xl bg-white/5 p-5">
              <h3 className="mb-3 text-sm font-semibold text-white">Add / Edit Bank</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="bankNameInput">Bank Name</Label>
                  <Input
                    id="bankNameInput"
                    placeholder="Enter bank name"
                    value={bankNameInput}
                    onChange={(e) => setBankNameInput(e.target.value)}
                    className="border-white/10 bg-white/5"
                    disabled={isSaving}
                  />
                  {formError && <p className="text-xs text-red-400">{formError}</p>}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    className="flex-1 bg-linear-to-r from-primary to-indigo-500"
                    onClick={handleBankFormSubmit}
                    disabled={isSaving || !bankNameInput.trim()}
                  >
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    {editingBank ? "Save Bank" : "Add Bank"}
                  </Button>
                  {editingBank && (
                    <Button
                      variant="outline"
                      className="flex-1 border-white/10 bg-white/5"
                      onClick={handleCancelBankEdit}
                      disabled={isSaving}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white/5 p-5">
              <h3 className="mb-3 text-sm font-semibold text-white">Bank Status</h3>

              {isLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading banks...
                </div>
              ) : bankList.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No banks yet — add one above.
                </p>
              ) : (
                <div className="grid gap-3">
                  {bankList.map((bank) => {
                    const isPending = pendingId === bank.id
                    const isActive = bank.status === "active"
                    return (
                      <div
                        key={bank.id}
                        className={isActive ? "flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3" : "flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3"}
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{bank.bank_name}</p>
                          <p className={isActive ? "text-xs text-emerald-200" : "text-xs text-muted-foreground"}>
                            {isActive ? "Active" : "Deactivated"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/10 bg-white/5 text-xs"
                            onClick={() => handleEditBank(bank)}
                            disabled={isPending}
                          >
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
                            ) : isActive ? (
                              "Deactivate"
                            ) : (
                              "Activate"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500/20 bg-red-500/5 text-xs text-red-400 hover:bg-red-500/10"
                            onClick={() => handleDeleteBank(bank)}
                            disabled={isPending}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white/5 p-5">
            <h3 className="mb-3 text-sm font-semibold text-white">Active Bank List</h3>
            <div className="space-y-3">
              {activeBanks.length > 0 ? (
                activeBanks.map((bank) => (
                  <div
                    key={bank.id}
                    className="flex items-center justify-between rounded-2xl bg-[#0b1220] px-4 py-3"
                  >
                    <span className="text-sm text-white">{bank.bank_name}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No active banks available.</p>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Comparison data
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">Policy-level bank overview</h2>
          </div>
          <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-white">
            Banks compared: <span className="font-semibold">{banksCompared}</span>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-3xl border border-white/10 bg-white/5 p-4">
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
        </div>
      </GlassCard>
    </div>
  )
}